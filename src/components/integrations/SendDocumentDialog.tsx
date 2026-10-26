'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import {
  ShareDocumentType,
  generateWhatsAppMessage,
  generateEmailContent,
  buildWhatsAppUrl,
  buildMailtoUrl,
  getPublicDocumentUrl,
} from '@/lib/documentSharing';
import { normalizePhoneNumber } from '@/lib/phone';

export interface SendDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerWhatsapp?: string;
  companyName?: string;
  // Financial breakdown
  subtotal?: number;
  discountAmount?: number;
  shippingCost?: number;
  totalAmount?: number;
  amountPaid?: number;
  remainingAmount?: number;
  currency?: string;
  currencySymbol?: string;
  status?: string;
  issueDate?: string;
  dueDate?: string;
  initialDocumentType?: ShareDocumentType;
  initialQuotationWithPricing?: boolean;
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
  subtotal = 0,
  discountAmount = 0,
  shippingCost = 0,
  totalAmount = 0,
  amountPaid = 0,
  remainingAmount = 0,
  currency = 'USD',
  currencySymbol = '$',
  status = 'UNPAID',
  issueDate = '',
  dueDate = '',
  initialDocumentType = 'invoice',
  initialQuotationWithPricing = true,
}: SendDocumentDialogProps) {
  const [documentType, setDocumentType] = useState<ShareDocumentType>(initialDocumentType);
  const [quotationWithPricing, setQuotationWithPricing] = useState<boolean>(initialQuotationWithPricing);
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'email'>('whatsapp');

  // Recipient inputs
  const defaultPhone = customerWhatsapp || customerPhone || '';
  const [recipientPhone, setRecipientPhone] = useState(defaultPhone);
  const [recipientEmail, setRecipientEmail] = useState(customerEmail || '');

  // Message content
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Copy notification toast
  const [copied, setCopied] = useState(false);

  // Sync state whenever opened
  useEffect(() => {
    if (isOpen) {
      setDocumentType(initialDocumentType);
      setQuotationWithPricing(initialQuotationWithPricing);
      setRecipientPhone(customerWhatsapp || customerPhone || '');
      setRecipientEmail(customerEmail || '');
      setCopied(false);
    }
  }, [isOpen, initialDocumentType, initialQuotationWithPricing, customerWhatsapp, customerPhone, customerEmail]);

  // Regenerate message template when params change
  useEffect(() => {
    const params = {
      documentId: invoiceId,
      documentType,
      invoiceNumber,
      customerName: customerName || 'Valued Customer',
      customerPhone: recipientPhone,
      customerEmail: recipientEmail,
      companyName,
      subtotal,
      discountAmount,
      shippingCost,
      totalAmount,
      amountPaid,
      remainingAmount,
      currency,
      currencySymbol,
      status,
      issueDate,
      dueDate,
      quotationWithPricing,
    };

    setWhatsappMessage(generateWhatsAppMessage(params));
    const emailData = generateEmailContent(params);
    setEmailSubject(emailData.subject);
    setEmailBody(emailData.body);
  }, [
    documentType,
    quotationWithPricing,
    invoiceId,
    invoiceNumber,
    customerName,
    companyName,
    subtotal,
    discountAmount,
    shippingCost,
    totalAmount,
    amountPaid,
    remainingAmount,
    currency,
    currencySymbol,
    status,
    issueDate,
    dueDate,
  ]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape key when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const publicUrl = getPublicDocumentUrl(invoiceId, documentType, '', quotationWithPricing);
  const phoneValidation = normalizePhoneNumber(recipientPhone);

  const handleSendWhatsApp = () => {
    const targetUrl = buildWhatsAppUrl(recipientPhone, whatsappMessage);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSendEmail = () => {
    const targetUrl = buildMailtoUrl(recipientEmail, emailSubject, emailBody);
    window.location.href = targetUrl;
  };

  const handleCopyText = async () => {
    try {
      const textToCopy = activeChannel === 'whatsapp' ? whatsappMessage : `${emailSubject}\n\n${emailBody}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share Document"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-outline-variant rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <MaterialIcon icon="share" className="text-[22px]" />
            </div>
            <div>
              <h2 className="text-title-md font-bold text-on-surface">Share Document</h2>
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

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Document Format Selection */}
          <div>
            <label className="block text-label-sm font-semibold text-on-surface mb-2">
              Select Document Format
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

          {/* Share Channel Tabs */}
          <div>
            <label className="block text-label-sm font-semibold text-on-surface mb-2">
              Share Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActiveChannel('whatsapp')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-label-lg transition-all ${
                  activeChannel === 'whatsapp'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-surface-container-low border-outline-variant text-on-surface hover:bg-surface-container'
                }`}
              >
                <MaterialIcon icon="chat" className="text-[20px]" />
                <span>WhatsApp Click-to-Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveChannel('email')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-label-lg transition-all ${
                  activeChannel === 'email'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-surface-container-low border-outline-variant text-on-surface hover:bg-surface-container'
                }`}
              >
                <MaterialIcon icon="mail" className="text-[20px]" />
                <span>Direct Email (mailto)</span>
              </button>
            </div>
          </div>

          {/* Recipient Details */}
          {activeChannel === 'whatsapp' ? (
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1.5">
                Recipient WhatsApp Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <MaterialIcon icon="phone" className="text-[18px]" />
                </div>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="e.g. 01712345678 or +8801712345678 (optional, can pick inside WhatsApp)"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              {recipientPhone && phoneValidation.isValid && (
                <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
                  <MaterialIcon icon="check_circle" className="text-[14px]" />
                  Will open chat with: <code className="font-mono bg-surface-container px-1 rounded">{phoneValidation.e164}</code>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1.5">
                  Recipient Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                    <MaterialIcon icon="email" className="text-[18px]" />
                  </div>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="customer@example.com (optional)"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1.5">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          )}

          {/* Formatted Message Preview & Edit */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-label-sm font-semibold text-on-surface flex items-center gap-1.5">
                <MaterialIcon icon="edit_note" className="text-[18px] text-primary" />
                Message Summary & Public Link Preview
              </label>
              <button
                type="button"
                onClick={() => {
                  const params = {
                    documentId: invoiceId,
                    documentType,
                    invoiceNumber,
                    customerName: customerName || 'Valued Customer',
                    customerPhone: recipientPhone,
                    customerEmail: recipientEmail,
                    companyName,
                    subtotal,
                    discountAmount,
                    shippingCost,
                    totalAmount,
                    amountPaid,
                    remainingAmount,
                    currency,
                    currencySymbol,
                    status,
                    issueDate,
                    dueDate,
                    quotationWithPricing,
                  };
                  if (activeChannel === 'whatsapp') {
                    setWhatsappMessage(generateWhatsAppMessage(params));
                  } else {
                    const emailData = generateEmailContent(params);
                    setEmailSubject(emailData.subject);
                    setEmailBody(emailData.body);
                  }
                }}
                className="text-primary hover:underline text-body-xs font-semibold"
              >
                Reset to default template
              </button>
            </div>

            <textarea
              rows={9}
              value={activeChannel === 'whatsapp' ? whatsappMessage : emailBody}
              onChange={(e) => {
                if (activeChannel === 'whatsapp') {
                  setWhatsappMessage(e.target.value);
                } else {
                  setEmailBody(e.target.value);
                }
              }}
              className="w-full p-3.5 bg-surface-container border border-outline-variant rounded-xl text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono leading-relaxed"
            />
            <p className="mt-1.5 text-[11px] text-on-surface-variant flex items-center gap-1">
              <MaterialIcon icon="link" className="text-[14px] text-primary" />
              Includes the public view & PDF download link: <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="underline text-primary truncate max-w-sm">{publicUrl}</a>
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-label-md text-on-surface-variant hover:text-on-surface font-medium transition-colors"
            >
              <MaterialIcon icon="visibility" className="text-[18px]" />
              <span>Preview Link</span>
            </a>

            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant rounded-xl text-label-md font-medium text-on-surface hover:bg-surface-container transition-colors"
              title="Copy message and link to clipboard"
            >
              <MaterialIcon icon={copied ? 'check' : 'content_copy'} className="text-[16px] text-primary" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-outline-variant rounded-xl text-label-md font-medium text-on-surface hover:bg-surface-container transition-all"
            >
              Close
            </button>

            {activeChannel === 'whatsapp' ? (
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-label-md font-bold shadow-md hover:bg-emerald-500 transition-all active:scale-95"
              >
                <MaterialIcon icon="chat" className="text-[18px]" />
                <span>Open in WhatsApp</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendEmail}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-label-md font-bold shadow-md hover:bg-blue-500 transition-all active:scale-95"
              >
                <MaterialIcon icon="mail" className="text-[18px]" />
                <span>Open Email App</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
