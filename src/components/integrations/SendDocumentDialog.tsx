'use client';

import React, { useState, useEffect, useId } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { DocumentType, DeliveryChannel, getDefaultWhatsAppMessage, getDefaultEmailContent } from '@/services/delivery/types';
import { normalizePhoneNumber, isValidEmail } from '@/lib/phone';

interface SendDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerWhatsapp?: string;
  companyName?: string;
  initialDocumentType?: DocumentType;
  initialQuotationWithPricing?: boolean;
}

interface DeliveryHistoryItem {
  id: string;
  channel: 'whatsapp' | 'gmail';
  document_type: string;
  recipient: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED';
  sent_at?: string;
  created_at: string;
  error_message?: string;
}

export function SendDocumentDialog({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  customerName,
  customerPhone = '',
  customerEmail = '',
  customerWhatsapp = '',
  companyName = 'Our Company',
  initialDocumentType = 'invoice',
  initialQuotationWithPricing = true,
}: SendDocumentDialogProps) {
  const [documentType, setDocumentType] = useState<DocumentType>(initialDocumentType);
  const [quotationWithPricing, setQuotationWithPricing] = useState<boolean>(initialQuotationWithPricing);
  const [channel, setChannel] = useState<DeliveryChannel>('whatsapp');

  // Recipient fields (local editable copy - does not mutate customer record)
  const defaultPhone = customerWhatsapp || customerPhone || '';
  const [recipientPhone, setRecipientPhone] = useState(defaultPhone);
  const [recipientEmail, setRecipientEmail] = useState(customerEmail || '');

  // Subject and message
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Status & Integrations
  const [whatsappStatus, setWhatsappStatus] = useState<{ connected: boolean; identifier?: string; loading: boolean }>({
    connected: false,
    loading: true,
  });
  const [gmailStatus, setGmailStatus] = useState<{ connected: boolean; email?: string; loading: boolean }>({
    connected: false,
    loading: true,
  });

  // Sending state
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Delivery History
  const [history, setHistory] = useState<DeliveryHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Session idempotency key
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => `send_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  // Load integration status
  const checkStatus = async () => {
    try {
      const [waRes, gmRes] = await Promise.all([
        fetch('/api/integrations/whatsapp/status'),
        fetch('/api/integrations/gmail/status'),
      ]);
      const waData = await waRes.json();
      const gmData = await gmRes.json();

      setWhatsappStatus({
        connected: waData.connected ?? false,
        identifier: waData.identifier,
        loading: false,
      });

      setGmailStatus({
        connected: gmData.connected ?? false,
        email: gmData.email,
        loading: false,
      });
    } catch (e) {
      console.error('Failed to check integration status:', e);
      setWhatsappStatus(prev => ({ ...prev, loading: false }));
      setGmailStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Fetch delivery history
  const fetchHistory = async () => {
    if (!invoiceId) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/documents/${invoiceId}/delivery-history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load delivery history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
      fetchHistory();
      setDocumentType(initialDocumentType);
      setQuotationWithPricing(initialQuotationWithPricing);
      setRecipientPhone(customerWhatsapp || customerPhone || '');
      setRecipientEmail(customerEmail || '');
      setSendResult(null);
      setIdempotencyKey(`send_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    }
  }, [isOpen, initialDocumentType, initialQuotationWithPricing, customerWhatsapp, customerPhone, customerEmail]);

  // Update default message when document type or channel changes
  useEffect(() => {
    if (channel === 'whatsapp') {
      setMessage(getDefaultWhatsAppMessage(documentType, customerName || 'Valued Customer', invoiceNumber, companyName));
    } else {
      const emailContent = getDefaultEmailContent(documentType, customerName || 'Valued Customer', invoiceNumber, companyName);
      setSubject(emailContent.subject);
      setMessage(emailContent.body);
    }
  }, [documentType, channel, customerName, invoiceNumber, companyName]);

  if (!isOpen) return null;

  // Validation
  const phoneNormalized = normalizePhoneNumber(recipientPhone);
  const isPhoneValid = phoneNormalized.isValid;
  const isEmailValid = isValidEmail(recipientEmail);

  const isConnected = channel === 'whatsapp' ? whatsappStatus.connected : gmailStatus.connected;
  const isRecipientValid = channel === 'whatsapp' ? isPhoneValid : isEmailValid;
  const canSend = isConnected && isRecipientValid && !isSending && message.trim().length > 0;

  // Preview URL
  const previewUrl =
    documentType === 'quotation'
      ? `/public/invoice/${invoiceId}?type=quotation&pricing=${quotationWithPricing ? 'with_money' : 'without_money'}`
      : documentType === 'challan'
      ? `/public/invoice/${invoiceId}?type=challan`
      : `/public/invoice/${invoiceId}`;

  const handleSend = async () => {
    if (!canSend) return;

    setIsSending(true);
    setSendResult(null);

    try {
      const payload = {
        invoiceId,
        channel,
        documentType,
        recipient: channel === 'whatsapp' ? recipientPhone.trim() : recipientEmail.trim(),
        customMessage: message.trim(),
        customSubject: channel === 'gmail' ? subject.trim() : undefined,
        quotationWithPricing: documentType === 'quotation' ? quotationWithPricing : undefined,
        idempotencyKey,
      };

      const res = await fetch('/api/documents/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSendResult({
          success: true,
          message: `Document sent successfully via ${channel === 'whatsapp' ? 'WhatsApp' : 'Gmail'}!`,
        });
        // Refresh delivery history
        fetchHistory();
        // Generate a new idempotency key for next send
        setIdempotencyKey(`send_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
      } else {
        setSendResult({
          success: false,
          message: data.error || 'Failed to send document. Please try again.',
        });
      }
    } catch (err: any) {
      console.error('Error sending document:', err);
      setSendResult({
        success: false,
        message: err.message || 'An unexpected network error occurred while sending.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-surface border border-outline-variant rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <MaterialIcon icon="send" className="text-[20px]" />
            </div>
            <div>
              <h2 className="text-title-md font-bold text-on-surface">Send Document</h2>
              <p className="text-body-xs text-on-surface-variant">
                Invoice #{invoiceNumber} • {customerName || 'Customer'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            title="Close dialog"
          >
            <MaterialIcon icon="close" className="text-[20px]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Document Type Selector */}
          <div>
            <label className="block text-label-sm font-semibold text-on-surface mb-2">
              Select Document Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDocumentType('invoice')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-label-md font-medium transition-all ${
                  documentType === 'invoice'
                    ? 'bg-primary text-on-primary border-primary shadow-sm'
                    : 'bg-surface-container-low border-outline-variant text-on-surface hover:bg-surface-container'
                }`}
              >
                <MaterialIcon icon="receipt_long" className="text-[18px]" />
                <span>Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => setDocumentType('challan')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-label-md font-medium transition-all ${
                  documentType === 'challan'
                    ? 'bg-primary text-on-primary border-primary shadow-sm'
                    : 'bg-surface-container-low border-outline-variant text-on-surface hover:bg-surface-container'
                }`}
              >
                <MaterialIcon icon="local_shipping" className="text-[18px]" />
                <span>Challan</span>
              </button>

              <button
                type="button"
                onClick={() => setDocumentType('quotation')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-label-md font-medium transition-all ${
                  documentType === 'quotation'
                    ? 'bg-primary text-on-primary border-primary shadow-sm'
                    : 'bg-surface-container-low border-outline-variant text-on-surface hover:bg-surface-container'
                }`}
              >
                <MaterialIcon icon="request_quote" className="text-[18px]" />
                <span>Quotation</span>
              </button>
            </div>

            {/* Quotation Pricing Option */}
            {documentType === 'quotation' && (
              <div className="mt-2.5 p-3 rounded-xl bg-surface-container border border-outline-variant flex items-center justify-between text-body-sm">
                <span className="text-on-surface font-medium flex items-center gap-1.5">
                  <MaterialIcon icon="payments" className="text-[16px] text-primary" />
                  Quotation Format:
                </span>
                <div className="flex gap-1.5 bg-surface-container-low p-1 rounded-lg border border-outline-variant/50">
                  <button
                    type="button"
                    onClick={() => setQuotationWithPricing(true)}
                    className={`px-2.5 py-1 rounded text-label-sm font-semibold transition-all ${
                      quotationWithPricing
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    With Pricing
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuotationWithPricing(false)}
                    className={`px-2.5 py-1 rounded text-label-sm font-semibold transition-all ${
                      !quotationWithPricing
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Without Pricing
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Channel Selector */}
          <div>
            <label className="block text-label-sm font-semibold text-on-surface mb-2">
              Delivery Channel
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* WhatsApp Card */}
              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`flex flex-col items-start p-3.5 rounded-xl border transition-all text-left ${
                  channel === 'whatsapp'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-on-surface shadow-xs'
                    : 'bg-surface-container-low border-outline-variant text-on-surface hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="flex items-center gap-1.5 font-bold text-label-lg">
                    <MaterialIcon icon="chat" className="text-[18px] text-emerald-500" />
                    WhatsApp
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      whatsappStatus.connected
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {whatsappStatus.loading ? 'Checking...' : whatsappStatus.connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant truncate w-full">
                  {whatsappStatus.connected
                    ? `Active: ${whatsappStatus.identifier || 'User Session'}`
                    : 'Scan QR in Settings to connect'}
                </p>
              </button>

              {/* Gmail Card */}
              <button
                type="button"
                onClick={() => setChannel('gmail')}
                className={`flex flex-col items-start p-3.5 rounded-xl border transition-all text-left ${
                  channel === 'gmail'
                    ? 'bg-blue-500/10 border-blue-500/40 text-on-surface shadow-xs'
                    : 'bg-surface-container-low border-outline-variant text-on-surface hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="flex items-center gap-1.5 font-bold text-label-lg">
                    <MaterialIcon icon="mail" className="text-[18px] text-blue-500" />
                    Gmail
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      gmailStatus.connected
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {gmailStatus.loading ? 'Checking...' : gmailStatus.connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant truncate w-full">
                  {gmailStatus.connected
                    ? `Sender: ${gmailStatus.email}`
                    : 'Authorize in Settings to connect'}
                </p>
              </button>
            </div>

            {!isConnected && !whatsappStatus.loading && !gmailStatus.loading && (
              <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-body-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MaterialIcon icon="warning" className="text-[16px] text-amber-400 shrink-0" />
                  <span>
                    Your {channel === 'whatsapp' ? 'WhatsApp' : 'Gmail'} account is not connected yet.
                  </span>
                </span>
                <a
                  href="/profile#integrations-section"
                  target="_blank"
                  className="font-semibold underline ml-2 hover:text-white shrink-0"
                >
                  Connect Now
                </a>
              </div>
            )}
          </div>

          {/* Recipient Details Input */}
          <div>
            <label className="block text-label-sm font-semibold text-on-surface mb-1.5">
              {channel === 'whatsapp' ? 'Recipient WhatsApp Phone Number' : 'Recipient Email Address'}
            </label>

            {channel === 'whatsapp' ? (
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                    <MaterialIcon icon="phone" className="text-[18px]" />
                  </div>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="e.g. 01712345678 or +880 1712-345678"
                    className={`w-full pl-10 pr-4 py-2.5 bg-surface-container border rounded-xl text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      recipientPhone && !isPhoneValid ? 'border-error' : 'border-outline-variant'
                    }`}
                  />
                </div>
                {recipientPhone ? (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                    {isPhoneValid ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <MaterialIcon icon="check_circle" className="text-[14px]" />
                        Normalized E.164: <code className="font-mono bg-surface-container px-1 rounded">{phoneNormalized.e164}</code> ({phoneNormalized.country || 'INT'})
                      </span>
                    ) : (
                      <span className="text-error flex items-center gap-1">
                        <MaterialIcon icon="cancel" className="text-[14px]" />
                        Please enter a valid phone number with country or national format
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-[11px] text-on-surface-variant">
                    Accepts Bangladesh local format (01XXXXXXXXX) or international E.164.
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                    <MaterialIcon icon="email" className="text-[18px]" />
                  </div>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="e.g. customer@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 bg-surface-container border rounded-xl text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      recipientEmail && !isEmailValid ? 'border-error' : 'border-outline-variant'
                    }`}
                  />
                </div>
                {recipientEmail && !isEmailValid && (
                  <p className="mt-1 text-[11px] text-error flex items-center gap-1">
                    <MaterialIcon icon="cancel" className="text-[14px]" />
                    Please enter a valid email address format.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Email Subject (if Gmail) */}
          {channel === 'gmail' && (
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1.5">
                Email Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject line"
                className="w-full px-3.5 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}

          {/* Message Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-label-sm font-semibold text-on-surface">
                Message Body
              </label>
              <button
                type="button"
                onClick={() => {
                  if (channel === 'whatsapp') {
                    setMessage(getDefaultWhatsAppMessage(documentType, customerName || 'Valued Customer', invoiceNumber, companyName));
                  } else {
                    const emailContent = getDefaultEmailContent(documentType, customerName || 'Valued Customer', invoiceNumber, companyName);
                    setSubject(emailContent.subject);
                    setMessage(emailContent.body);
                  }
                }}
                className="text-primary hover:underline text-body-xs font-medium"
              >
                Reset to default
              </button>
            </div>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-surface-container border border-outline-variant rounded-xl text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 font-sans"
              placeholder="Write a message to accompany the PDF..."
            />
            <p className="mt-1 text-[11px] text-on-surface-variant flex items-center gap-1">
              <MaterialIcon icon="attachment" className="text-[14px]" />
              The high-resolution PDF for this document will be attached automatically.
            </p>
          </div>

          {/* Send Result Notification */}
          {sendResult && (
            <div
              className={`p-3.5 rounded-xl border text-body-sm flex items-start gap-2.5 animate-in fade-in ${
                sendResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                  : 'bg-error/10 border-error/40 text-error'
              }`}
            >
              <MaterialIcon
                icon={sendResult.success ? 'check_circle' : 'error'}
                className="text-[20px] shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <p className="font-semibold">{sendResult.success ? 'Success' : 'Delivery Notice'}</p>
                <p className="text-body-xs opacity-90 mt-0.5">{sendResult.message}</p>
              </div>
            </div>
          )}

          {/* Collapsible Delivery History */}
          <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-low">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-left text-label-md font-semibold text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="flex items-center gap-2">
                <MaterialIcon icon="history" className="text-[18px] text-primary" />
                Delivery History ({history.length})
              </span>
              <MaterialIcon
                icon={showHistory ? 'expand_less' : 'expand_more'}
                className="text-[20px] text-on-surface-variant"
              />
            </button>

            {showHistory && (
              <div className="p-4 border-t border-outline-variant space-y-2 bg-surface">
                {loadingHistory ? (
                  <p className="text-body-xs text-on-surface-variant">Loading history...</p>
                ) : history.length === 0 ? (
                  <p className="text-body-xs text-on-surface-variant">No delivery attempts recorded yet.</p>
                ) : (
                  <div className="divide-y divide-outline-variant/40 max-h-48 overflow-y-auto">
                    {history.map((item) => (
                      <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-body-xs">
                        <div>
                          <div className="flex items-center gap-1.5 font-medium text-on-surface">
                            <span className="capitalize">{item.channel}</span>
                            <span className="text-on-surface-variant">•</span>
                            <span className="capitalize">{item.document_type}</span>
                            <span className="text-on-surface-variant">to</span>
                            <span className="font-mono text-[11px]">{item.recipient}</span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                          {item.error_message && (
                            <p className="text-[10px] text-error mt-0.5">{item.error_message}</p>
                          )}
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            item.status === 'SENT' || item.status === 'DELIVERED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : item.status === 'FAILED'
                              ? 'bg-error/20 text-error'
                              : 'bg-surface-variant text-on-surface-variant'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-between gap-3 shrink-0">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-label-md text-on-surface-variant hover:text-on-surface font-medium transition-colors"
          >
            <MaterialIcon icon="visibility" className="text-[18px]" />
            <span>Preview Document</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 border border-outline-variant rounded-xl text-label-md font-medium text-on-surface hover:bg-surface-container transition-all"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-label-md font-bold shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  <span>Sending Document...</span>
                </>
              ) : (
                <>
                  <MaterialIcon icon="send" className="text-[18px]" />
                  <span>Send via {channel === 'whatsapp' ? 'WhatsApp' : 'Gmail'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
