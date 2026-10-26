import { supabaseAdmin, getUserId, getLinkedUserIds } from '@/lib/supabase/admin';
import { SendDocumentInput, SendDocumentResult } from './types';
import { generateDocumentPdf } from '@/services/pdf/pdfService';
import { sendGmailMessage, getConnectedGmailAccount } from './providers/gmailProvider';
import { sendWhatsAppMessage, getWhatsAppConnectionStatus } from './providers/whatsappProvider';
import { normalizePhoneNumber, validateEmail } from '@/lib/phone';
import crypto from 'crypto';

export async function sendBusinessDocument(input: SendDocumentInput): Promise<SendDocumentResult> {
  const userId = await getUserId();
  if (!userId) {
    return {
      success: false,
      channel: input.channel,
      recipient: input.recipient,
      error: 'Not authenticated',
      errorCode: 'UNAUTHENTICATED',
    };
  }

  const linkedIds = getLinkedUserIds(userId);

  // 1. Verify document ownership & access
  const { data: invoice, error: docError } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('id', input.documentId)
    .in('profile_id', linkedIds)
    .maybeSingle();

  if (docError || !invoice) {
    return {
      success: false,
      channel: input.channel,
      recipient: input.recipient,
      error: 'Document not found or you lack permission to access it.',
      errorCode: 'DOCUMENT_FORBIDDEN',
    };
  }

  // 2. Validate recipient
  let normalizedRecipient = input.recipient.trim();
  if (input.channel === 'whatsapp') {
    const phoneRes = normalizePhoneNumber(normalizedRecipient);
    if (!phoneRes.isValid || !phoneRes.e164) {
      return {
        success: false,
        channel: input.channel,
        recipient: input.recipient,
        error: phoneRes.error || 'Invalid phone number format for WhatsApp.',
        errorCode: 'INVALID_RECIPIENT',
      };
    }
    normalizedRecipient = phoneRes.e164;
  } else if (input.channel === 'email') {
    const emailRes = validateEmail(normalizedRecipient);
    if (!emailRes.isValid || !normalizedRecipient) {
      return {
        success: false,
        channel: input.channel,
        recipient: input.recipient,
        error: emailRes.error || 'Invalid email address.',
        errorCode: 'INVALID_RECIPIENT',
      };
    }
  }

  // 3. Idempotency Check
  const idempotencyKey = input.idempotencyKey || 
    crypto.createHash('sha256').update(`${userId}:${input.documentId}:${input.channel}:${normalizedRecipient}:${Math.floor(Date.now() / 15000)}`).digest('hex');

  const { data: existingDelivery } = await supabaseAdmin
    .from('document_delivery_history')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existingDelivery) {
    if (existingDelivery.status === 'SENDING') {
      return {
        success: false,
        channel: input.channel,
        recipient: normalizedRecipient,
        error: 'A delivery request is already in progress for this document.',
        errorCode: 'DUPLICATE_SEND_IN_PROGRESS',
      };
    }
    if (existingDelivery.status === 'SENT') {
      return {
        success: true,
        channel: input.channel,
        recipient: normalizedRecipient,
        deliveryHistoryId: existingDelivery.id,
        providerMessageId: existingDelivery.provider_message_id,
      };
    }
  }

  // 4. Resolve sender account
  let senderAccountId: string | null = null;
  if (input.channel === 'gmail') {
    const gmailAccount = await getConnectedGmailAccount(userId);
    if (!gmailAccount) {
      return {
        success: false,
        channel: input.channel,
        recipient: normalizedRecipient,
        error: 'Your Gmail account is not connected. Please connect Gmail in Settings.',
        errorCode: 'ACCOUNT_NOT_CONNECTED',
      };
    }
    senderAccountId = gmailAccount.id;
  } else if (input.channel === 'whatsapp') {
    const waStatus = await getWhatsAppConnectionStatus(userId);
    if (!waStatus.isConnected) {
      return {
        success: false,
        channel: input.channel,
        recipient: normalizedRecipient,
        error: 'Your WhatsApp account is not connected. Please connect WhatsApp in Settings.',
        errorCode: 'ACCOUNT_NOT_CONNECTED',
      };
    }
  }

  // 5. Insert initial PENDING audit entry
  const { data: auditRecord } = await supabaseAdmin
    .from('document_delivery_history')
    .insert({
      profile_id: userId,
      document_id: input.documentId,
      document_type: input.documentType,
      channel: input.channel,
      recipient: normalizedRecipient,
      sender_account_id: senderAccountId,
      status: 'SENDING',
      idempotency_key: idempotencyKey,
    })
    .select('id')
    .single();

  const auditId = auditRecord?.id;

  // 6. Generate the Document PDF
  let pdfBuffer: Buffer;
  const docPrefix = input.documentType === 'challan' ? 'Challan' : input.documentType === 'quotation' ? 'Quotation' : 'Invoice';
  const pdfFilename = `${docPrefix}-${invoice.invoice_number || invoice.id.slice(0, 8)}.pdf`;

  try {
    const generated = await generateDocumentPdf({
      documentId: input.documentId,
      documentType: input.documentType,
      quotationWithPricing: input.quotationWithPricing ?? (invoice.quotation_with_pricing ?? true),
      filename: pdfFilename,
    });
    pdfBuffer = generated.buffer;
  } catch (pdfErr: any) {
    if (auditId) {
      await supabaseAdmin
        .from('document_delivery_history')
        .update({
          status: 'FAILED',
          error_code: 'PDF_GENERATION_FAILED',
          error_message: pdfErr.message,
        })
        .eq('id', auditId);
    }
    return {
      success: false,
      channel: input.channel,
      recipient: normalizedRecipient,
      deliveryHistoryId: auditId,
      error: `PDF generation failed: ${pdfErr.message}`,
      errorCode: 'PDF_GENERATION_FAILED',
    };
  }

  // 7. Dispatch via selected channel
  try {
    let providerMsgId = '';
    if (input.channel === 'email') {
      const emailRes = await sendGmailMessage({
        userId,
        recipient: normalizedRecipient,
        subject: input.subject || `${docPrefix} #${invoice.invoice_number}`,
        body: input.message,
        pdfBuffer,
        pdfFilename,
      });
      providerMsgId = emailRes.messageId;
    } else if (input.channel === 'whatsapp') {
      const waRes = await sendWhatsAppMessage({
        userId,
        recipientPhone: normalizedRecipient,
        message: input.message,
        pdfBuffer,
        pdfFilename,
      });
      providerMsgId = waRes.messageId;
    }

    // 8. Record success in audit history
    if (auditId) {
      await supabaseAdmin
        .from('document_delivery_history')
        .update({
          status: 'SENT',
          provider_message_id: providerMsgId,
          sent_at: new Date().toISOString(),
        })
        .eq('id', auditId);
    }

    return {
      success: true,
      channel: input.channel,
      recipient: normalizedRecipient,
      deliveryHistoryId: auditId,
      providerMessageId: providerMsgId,
    };
  } catch (sendErr: any) {
    console.error(`Document delivery via ${input.channel} failed:`, sendErr);
    if (auditId) {
      await supabaseAdmin
        .from('document_delivery_history')
        .update({
          status: 'FAILED',
          error_code: 'PROVIDER_ERROR',
          error_message: sendErr.message || 'Unknown provider error',
        })
        .eq('id', auditId);
    }

    return {
      success: false,
      channel: input.channel,
      recipient: normalizedRecipient,
      deliveryHistoryId: auditId,
      error: sendErr.message || 'Failed to deliver document through provider.',
      errorCode: 'PROVIDER_ERROR',
    };
  }
}

/**
 * Fetch delivery history for a document with tenant authorization
 */
export async function getDocumentDeliveryHistory(documentId: string) {
  const userId = await getUserId();
  if (!userId) return [];

  const linkedIds = getLinkedUserIds(userId);

  const { data, error } = await supabaseAdmin
    .from('document_delivery_history')
    .select(`
      id,
      document_id,
      document_type,
      channel,
      recipient,
      status,
      provider_message_id,
      error_code,
      error_message,
      sent_at,
      created_at,
      sender_account_id
    `)
    .eq('document_id', documentId)
    .in('profile_id', linkedIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching document delivery history:', error);
    return [];
  }

  return data || [];
}
