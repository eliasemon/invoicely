import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { supabaseAdmin, getLinkedUserIds } from '@/lib/supabase/admin';
import { encryptData, decryptData } from '@/lib/crypto';
import crypto from 'crypto';

const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const GMAIL_USERINFO_SCOPE = 'https://www.googleapis.com/auth/userinfo.email';

export function getOAuth2Client(redirectUri?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const defaultRedirect = process.env.GOOGLE_REDIRECT_URI || 
    `${process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/gmail/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  }

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri || defaultRedirect
  );
}

/**
 * Generate a signed CSRF state parameter for OAuth
 */
export function generateOAuthState(userId: string): string {
  const payload = JSON.stringify({
    userId,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex'),
  });
  return encryptData(payload);
}

/**
 * Verify and decode the OAuth state parameter
 */
export function verifyOAuthState(state: string, expectedUserId: string): boolean {
  try {
    const decrypted = decryptData(state);
    const parsed = JSON.parse(decrypted);
    
    // Validate user ID matching and state expiry (15 mins)
    const isValidUser = parsed.userId === expectedUserId;
    const isNotExpired = Date.now() - parsed.timestamp < 15 * 60 * 1000;
    
    return Boolean(isValidUser && isNotExpired);
  } catch (err) {
    console.error('State verification failed:', err);
    return false;
  }
}

/**
 * Generate the Google Authorization URL
 */
export function getAuthorizationUrl(userId: string, redirectUri?: string): string {
  const oauth2Client = getOAuth2Client(redirectUri);
  const state = generateOAuthState(userId);

  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Requests refresh token
    prompt: 'consent', // Ensure refresh token is returned
    scope: [GMAIL_SEND_SCOPE, GMAIL_USERINFO_SCOPE],
    state,
  });
}

/**
 * Handle OAuth code exchange and store encrypted credentials
 */
export async function handleOAuthCallback(code: string, userId: string, redirectUri?: string) {
  const oauth2Client = getOAuth2Client(redirectUri);
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Retrieve user's email address using oauth2 userinfo
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();
  const email = userInfo.data.email;

  if (!email) {
    throw new Error('Could not retrieve email from Google OAuth account');
  }

  // Encrypt the tokens payload
  const encryptedTokens = encryptData(JSON.stringify(tokens));

  // Upsert into connected_accounts
  const { error } = await supabaseAdmin
    .from('connected_accounts')
    .upsert({
      profile_id: userId,
      provider: 'GMAIL',
      account_identifier: email,
      encrypted_credentials: encryptedTokens,
      connection_status: 'CONNECTED',
      connected_at: new Date().toISOString(),
      disconnected_at: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'profile_id,provider' });

  if (error) {
    console.error('Failed to save connected Gmail account:', error);
    throw new Error(`Database error saving Gmail connection: ${error.message}`);
  }

  return { email };
}

/**
 * Get connected Gmail account for a user
 */
export async function getConnectedGmailAccount(userId: string) {
  const linkedIds = getLinkedUserIds(userId);
  const { data, error } = await supabaseAdmin
    .from('connected_accounts')
    .select('*')
    .in('profile_id', linkedIds)
    .eq('provider', 'GMAIL')
    .eq('connection_status', 'CONNECTED')
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

/**
 * Disconnect a user's Gmail account and revoke Google access
 */
export async function disconnectGmail(userId: string): Promise<boolean> {
  const account = await getConnectedGmailAccount(userId);
  if (!account) return true;

  try {
    if (account.encrypted_credentials) {
      const tokens = JSON.parse(decryptData(account.encrypted_credentials));
      if (tokens.access_token || tokens.refresh_token) {
        const oauth2Client = getOAuth2Client();
        await oauth2Client.revokeToken(tokens.refresh_token || tokens.access_token).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('Error revoking token with Google:', err);
  }

  const { error } = await supabaseAdmin
    .from('connected_accounts')
    .update({
      connection_status: 'DISCONNECTED',
      disconnected_at: new Date().toISOString(),
      encrypted_credentials: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', account.id);

  return !error;
}

/**
 * Send an email with PDF attachment using the user's authorized Gmail account
 */
export async function sendGmailMessage(params: {
  userId: string;
  recipient: string;
  subject: string;
  body: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
}): Promise<{ messageId: string }> {
  const account = await getConnectedGmailAccount(params.userId);
  if (!account || !account.encrypted_credentials) {
    throw new Error('Gmail account is not connected. Please connect your Gmail in Settings.');
  }

  const tokens = JSON.parse(decryptData(account.encrypted_credentials));
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  // Automatically refresh access token if needed and persist updated tokens
  oauth2Client.on('tokens', async (newTokens) => {
    try {
      const mergedTokens = { ...tokens, ...newTokens };
      await supabaseAdmin
        .from('connected_accounts')
        .update({
          encrypted_credentials: encryptData(JSON.stringify(mergedTokens)),
          updated_at: new Date().toISOString(),
        })
        .eq('id', account.id);
    } catch (e) {
      console.warn('Failed to update refreshed Gmail tokens in database:', e);
    }
  });

  // Construct MIME email using nodemailer
  const mailComposer = nodemailer.createTransport({
    streamTransport: true,
    newline: 'windows',
  });

  const mailOptions = {
    from: `${account.account_identifier} <${account.account_identifier}>`,
    to: params.recipient,
    subject: params.subject,
    text: params.body,
    html: `<div style="font-family: sans-serif; white-space: pre-wrap; line-height: 1.5; color: #1a1a1a;">${params.body.replace(/\n/g, '<br/>')}</div>`,
    attachments: [
      {
        filename: params.pdfFilename,
        content: params.pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  const info: any = await mailComposer.sendMail(mailOptions);
  
  // Read RFC 2822 stream into Buffer
  const chunks: Buffer[] = [];
  for await (const chunk of info.message) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const rawMessage = Buffer.concat(chunks);
  const encodedMessage = rawMessage.toString('base64url');

  // Send via Gmail API
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });

  return {
    messageId: res.data.id || 'unknown',
  };
}
