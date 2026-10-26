import path from 'path';
import fs from 'fs';
import { supabaseAdmin, getLinkedUserIds } from '@/lib/supabase/admin';
import { normalizePhoneNumber } from '@/lib/phone';

// Dynamic import or require for whatsapp-web.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const SESSIONS_DIR = process.env.WHATSAPP_SESSION_PATH || path.join(/*turbopackIgnore: true*/ process.cwd(), '.whatsapp-sessions');

// Ensure sessions directory exists with safe permissions
if (!fs.existsSync(SESSIONS_DIR)) {
  try {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  } catch (e) {
    console.warn('Could not create whatsapp sessions directory:', e);
  }
}

interface ActiveSession {
  userId: string;
  client: any;
  qrCode: string | null;
  status: 'DISCONNECTED' | 'CONNECTING' | 'QR_READY' | 'CONNECTED' | 'FAILED';
  lastActive: number;
  listeners: Set<(data: any) => void>;
}

// Global active session pool indexed by userId
const activeSessions = new Map<string, ActiveSession>();
const MAX_CONCURRENT_SESSIONS = Number(process.env.WHATSAPP_MAX_CONCURRENT || 5);

function getSessionDataPath(userId: string): string {
  // Path isolated per application user
  const sanitized = userId.replace(/[^a-zA-Z0-9-_]/g, '_');
  return path.join(SESSIONS_DIR, `user_${sanitized}`);
}

function broadcastUpdate(session: ActiveSession) {
  const payload = {
    userId: session.userId,
    status: session.status,
    qrCode: session.qrCode,
    timestamp: Date.now(),
  };
  session.listeners.forEach((listener) => {
    try {
      listener(payload);
    } catch (e) {
      console.warn('Listener error on broadcast:', e);
    }
  });
}

function getExecutablePath(): string | undefined {
  if (process.env.CHROME_BIN && fs.existsSync(process.env.CHROME_BIN)) {
    return process.env.CHROME_BIN;
  }
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (fs.existsSync(macChrome)) return macChrome;
  const linuxChrome = '/usr/bin/google-chrome';
  if (fs.existsSync(linuxChrome)) return linuxChrome;
  const linuxChromium = '/usr/bin/chromium-browser';
  if (fs.existsSync(linuxChromium)) return linuxChromium;
  return undefined;
}

/**
 * Clean up least recently used session if max concurrent pool limit is reached
 */
async function enforceSessionPoolLimit() {
  if (activeSessions.size >= MAX_CONCURRENT_SESSIONS) {
    let oldestUserId: string | null = null;
    let oldestTime = Infinity;

    for (const [userId, session] of activeSessions.entries()) {
      if (session.lastActive < oldestTime) {
        oldestTime = session.lastActive;
        oldestUserId = userId;
      }
    }

    if (oldestUserId) {
      console.log(`Closing idle WhatsApp session for ${oldestUserId} to free memory`);
      const s = activeSessions.get(oldestUserId);
      if (s?.client) {
        await s.client.destroy().catch(() => {});
      }
      activeSessions.delete(oldestUserId);
    }
  }
}

/**
 * Initialize or retrieve a WhatsApp Web client session for a given user
 */
export async function initWhatsAppSession(userId: string): Promise<ActiveSession> {
  const existing = activeSessions.get(userId);
  if (existing) {
    existing.lastActive = Date.now();
    return existing;
  }

  await enforceSessionPoolLimit();

  const userSessionDir = getSessionDataPath(userId);
  const executablePath = getExecutablePath();

  const puppeteerOptions: any = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  };
  if (executablePath) {
    puppeteerOptions.executablePath = executablePath;
  }

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: `user_${userId}`,
      dataPath: userSessionDir,
    }),
    puppeteer: puppeteerOptions,
  });

  const session: ActiveSession = {
    userId,
    client,
    qrCode: null,
    status: 'CONNECTING',
    lastActive: Date.now(),
    listeners: new Set(),
  };

  activeSessions.set(userId, session);

  client.on('qr', (qr: string) => {
    session.qrCode = qr;
    session.status = 'QR_READY';
    broadcastUpdate(session);
  });

  client.on('ready', async () => {
    session.status = 'CONNECTED';
    session.qrCode = null;
    session.lastActive = Date.now();

    const wid = client.info?.wid?.user || 'WhatsApp Connected';
    // Persist connected status in database
    try {
      await supabaseAdmin
        .from('connected_accounts')
        .upsert({
          profile_id: userId,
          provider: 'WHATSAPP',
          account_identifier: `+${wid}`,
          connection_status: 'CONNECTED',
          connected_at: new Date().toISOString(),
          disconnected_at: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'profile_id,provider' });
    } catch (err) {
      console.error('Failed to update WhatsApp connected account in DB:', err);
    }

    broadcastUpdate(session);
  });

  client.on('authenticated', () => {
    session.status = 'CONNECTING';
    session.qrCode = null;
    broadcastUpdate(session);
  });

  client.on('auth_failure', async (msg: any) => {
    console.error(`WhatsApp auth failure for ${userId}:`, msg);
    session.status = 'FAILED';
    broadcastUpdate(session);
  });

  client.on('disconnected', async (reason: any) => {
    console.log(`WhatsApp disconnected for ${userId}:`, reason);
    session.status = 'DISCONNECTED';
    session.qrCode = null;

    try {
      await supabaseAdmin
        .from('connected_accounts')
        .update({
          connection_status: 'DISCONNECTED',
          disconnected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('profile_id', userId)
        .eq('provider', 'WHATSAPP');
    } catch {
      // Ignore disconnect error
    }

    broadcastUpdate(session);
    activeSessions.delete(userId);
  });

  try {
    client.initialize().catch((err: any) => {
      console.error(`Error during WhatsApp client initialize for ${userId}:`, err);
      session.status = 'FAILED';
      broadcastUpdate(session);
    });
  } catch (err) {
    console.error(`Synchronous error initializing WhatsApp for ${userId}:`, err);
    session.status = 'FAILED';
  }

  return session;
}

/**
 * Subscribe to real-time status updates for a user's WhatsApp session
 */
export function subscribeToSession(userId: string, listener: (data: any) => void): () => void {
  const session = activeSessions.get(userId);
  if (session) {
    session.listeners.add(listener);
    // Send immediate snapshot
    listener({
      userId,
      status: session.status,
      qrCode: session.qrCode,
      timestamp: Date.now(),
    });
  }
  return () => {
    const s = activeSessions.get(userId);
    s?.listeners.delete(listener);
  };
}

/**
 * Get status of a user's WhatsApp connection from cache and DB
 */
export async function getWhatsAppConnectionStatus(userId: string) {
  const linkedIds = getLinkedUserIds(userId);
  const { data: dbAccount } = await supabaseAdmin
    .from('connected_accounts')
    .select('*')
    .in('profile_id', linkedIds)
    .eq('provider', 'WHATSAPP')
    .eq('connection_status', 'CONNECTED')
    .maybeSingle();

  const memorySession = activeSessions.get(userId);

  return {
    isConnected: memorySession?.status === 'CONNECTED' || Boolean(dbAccount),
    status: memorySession?.status || (dbAccount ? 'CONNECTED' : 'DISCONNECTED'),
    accountIdentifier: dbAccount?.account_identifier || (memorySession?.client?.info?.wid?.user ? `+${memorySession.client.info.wid.user}` : null),
    qrCode: memorySession?.qrCode || null,
  };
}

/**
 * Disconnect and destroy user's WhatsApp session
 */
export async function disconnectWhatsApp(userId: string): Promise<boolean> {
  const session = activeSessions.get(userId);
  if (session?.client) {
    try {
      await session.client.logout().catch(() => {});
      await session.client.destroy().catch(() => {});
    } catch (e) {
      console.warn('Error during WhatsApp destroy:', e);
    }
  }
  activeSessions.delete(userId);

  // Clear session folder
  const userSessionDir = getSessionDataPath(userId);
  if (fs.existsSync(userSessionDir)) {
    try {
      fs.rmSync(userSessionDir, { recursive: true, force: true });
    } catch (e) {
      console.warn('Error deleting session directory:', e);
    }
  }

  const { error } = await supabaseAdmin
    .from('connected_accounts')
    .update({
      connection_status: 'DISCONNECTED',
      disconnected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('profile_id', userId)
    .eq('provider', 'WHATSAPP');

  return !error;
}

/**
 * Send PDF document through WhatsApp
 */
export async function sendWhatsAppMessage(params: {
  userId: string;
  recipientPhone: string;
  message: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
}): Promise<{ messageId: string }> {
  // Normalize recipient phone to E.164 and WhatsApp JID
  const phoneValidation = normalizePhoneNumber(params.recipientPhone);
  if (!phoneValidation.isValid || !phoneValidation.whatsappJid) {
    throw new Error(`Invalid recipient phone number: ${phoneValidation.error || params.recipientPhone}`);
  }

  let session = activeSessions.get(params.userId);
  if (!session || session.status !== 'CONNECTED') {
    // Attempt rehydrating session from disk if previously connected
    session = await initWhatsAppSession(params.userId);
    // Wait up to 10 seconds for ready event if rehydrating
    let attempts = 0;
    while (session.status !== 'CONNECTED' && attempts < 20) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      attempts++;
    }
    if (session.status !== 'CONNECTED') {
      throw new Error('WhatsApp is not currently connected. Please connect or scan the QR code in settings.');
    }
  }

  session.lastActive = Date.now();
  const jid = phoneValidation.whatsappJid;

  // Construct MessageMedia attachment
  const media = new MessageMedia(
    'application/pdf',
    params.pdfBuffer.toString('base64'),
    params.pdfFilename
  );

  // Send message with PDF document attachment
  const sent = await session.client.sendMessage(jid, media, {
    caption: params.message,
  });

  return {
    messageId: sent.id?.id || 'wa_sent',
  };
}
