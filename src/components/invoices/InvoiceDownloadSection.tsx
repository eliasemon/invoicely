'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { updateInvoiceSettings } from '@/app/actions/invoiceActions';
import { SendDocumentDialog } from '@/components/integrations/SendDocumentDialog';
import { DocumentType } from '@/services/delivery/types';

interface InvoiceDownloadSectionProps {
  invoiceId: string;
  invoiceNumber?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerWhatsapp?: string;
  companyName?: string;
  invoiceModeEnabled?: boolean;
  challanModeEnabled?: boolean;
  quotationModeEnabled?: boolean;
  quotationWithPricing?: boolean;
}

export function InvoiceDownloadSection({
  invoiceId,
  invoiceNumber = '',
  customerName = '',
  customerPhone = '',
  customerEmail = '',
  customerWhatsapp = '',
  companyName = '',
  invoiceModeEnabled: initialInvoiceMode = true,
  challanModeEnabled: initialChallanMode = true,
  quotationModeEnabled: initialQuotationMode = true,
  quotationWithPricing: initialQuotationWithPricing = true,
}: InvoiceDownloadSectionProps) {
  const [invoiceMode, setInvoiceMode] = useState<boolean>(initialInvoiceMode);
  const [challanMode, setChallanMode] = useState<boolean>(initialChallanMode);
  const [quotationMode, setQuotationMode] = useState<boolean>(initialQuotationMode);
  const [quotationPricing, setQuotationPricing] = useState<'with_money' | 'without_money'>(
    initialQuotationWithPricing ? 'with_money' : 'without_money'
  );
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Send Document Dialog state
  const [sendDialogOpen, setSendDialogOpen] = useState<boolean>(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('invoice');

  const handleOpenSendDialog = (docType: DocumentType) => {
    setSelectedDocType(docType);
    setSendDialogOpen(true);
  };

  const handleQuotationPricingChange = async (newPricing: 'with_money' | 'without_money') => {
    setQuotationPricing(newPricing);
    setIsUpdating(true);
    setToastMessage(null);
    try {
      await updateInvoiceSettings(invoiceId, {
        quotation_with_pricing: newPricing === 'with_money',
      });
      setToastMessage(
        `Quotation pricing updated to: ${newPricing === 'with_money' ? 'With Money' : 'Without Money'}.`
      );
      setTimeout(() => setToastMessage(null), 2500);
    } catch (err: any) {
      console.error('Error saving quotation pricing mode:', err);
      setToastMessage('Failed to save quotation pricing setting.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggle = async (mode: 'invoice' | 'challan' | 'quotation', newEnabled: boolean) => {
    const nextInvoice = mode === 'invoice' ? newEnabled : invoiceMode;
    const nextChallan = mode === 'challan' ? newEnabled : challanMode;
    const nextQuotation = mode === 'quotation' ? newEnabled : quotationMode;

    if (!nextInvoice && !nextChallan && !nextQuotation) {
      setToastMessage('At least one format must remain public.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    if (mode === 'invoice') setInvoiceMode(newEnabled);
    if (mode === 'challan') setChallanMode(newEnabled);
    if (mode === 'quotation') setQuotationMode(newEnabled);

    setIsUpdating(true);
    setToastMessage(null);
    try {
      await updateInvoiceSettings(invoiceId, {
        invoice_mode_enabled: nextInvoice,
        challan_mode_enabled: nextChallan,
        quotation_mode_enabled: nextQuotation,
      });
      const label =
        mode === 'invoice' ? 'Commercial Invoice' : mode === 'challan' ? 'Delivery Challan' : 'Quotation';
      setToastMessage(`${label} public view ${newEnabled ? 'enabled' : 'disabled'}.`);
      setTimeout(() => setToastMessage(null), 2500);
    } catch (err: any) {
      console.error('Error toggling mode availability:', err);
      // Revert on error
      if (mode === 'invoice') setInvoiceMode(!newEnabled);
      if (mode === 'challan') setChallanMode(!newEnabled);
      if (mode === 'quotation') setQuotationMode(!newEnabled);
      setToastMessage('Failed to update public availability.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-2.5 relative z-10">
      {/* Primary Send Button */}
      <button
        type="button"
        onClick={() => handleOpenSendDialog('invoice')}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 rounded-lg transition-all active:scale-98 font-label-md font-bold shadow-md"
      >
        <MaterialIcon icon="send" className="text-[18px]" />
        <span>Send via WhatsApp / Gmail</span>
      </button>

      {/* Primary: Commercial Invoice Button */}
      <div className="flex items-center gap-2">
        <Link
          href={`/public/invoice/${invoiceId}`}
          target="_blank"
          className="flex-1 min-w-0 flex items-center justify-between px-3 py-2 bg-secondary text-on-secondary hover:opacity-90 rounded-lg transition-all active:scale-98 font-label-sm shadow-sm"
          title="Open and download commercial invoice"
        >
          <span className="flex items-center gap-2 min-w-0">
            <MaterialIcon icon="receipt_long" className="text-[18px] shrink-0" />
            <span className="font-semibold text-xs sm:text-sm truncate">Download / Print Invoice</span>
          </span>
          <MaterialIcon icon="open_in_new" className="text-[14px] opacity-80 shrink-0 ml-1.5" />
        </Link>
        <button
          type="button"
          onClick={() => handleToggle('invoice', !invoiceMode)}
          disabled={isUpdating}
          title={invoiceMode ? 'Public view is ON. Click to disable for clients.' : 'Public view is OFF. Click to enable for clients.'}
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer active:scale-95 ${
            invoiceMode
              ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/30'
              : 'bg-amber-500/20 text-amber-200 border-amber-400/40 hover:bg-amber-500/30'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${invoiceMode ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
          <span className="whitespace-nowrap">{invoiceMode ? 'Public: On' : 'Public: Off'}</span>
        </button>
      </div>

      {/* Format Actions: Challan & Quotation */}
      <div className="flex flex-col gap-2">
        {/* Challan Card */}
        <div className="flex items-center justify-between gap-2 p-1.5 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
          <Link
            href={`/public/invoice/${invoiceId}?type=challan`}
            target="_blank"
            className="flex-1 min-w-0 flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 text-white rounded-md transition-all active:scale-95 font-label-sm text-xs"
            title="Open and download delivery challan"
          >
            <MaterialIcon icon="local_shipping" className="text-[16px] text-primary-container shrink-0" />
            <span className="font-medium truncate">Delivery Challan</span>
            <MaterialIcon icon="open_in_new" className="text-[12px] opacity-60 ml-auto shrink-0" />
          </Link>
          <button
            type="button"
            onClick={() => handleOpenSendDialog('challan')}
            title="Send Delivery Challan"
            className="p-1.5 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <MaterialIcon icon="send" className="text-[16px]" />
          </button>
          <button
            type="button"
            onClick={() => handleToggle('challan', !challanMode)}
            disabled={isUpdating}
            title={challanMode ? 'Challan public view is ON. Click to disable.' : 'Challan public view is OFF. Click to enable.'}
            className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-semibold border transition-all cursor-pointer active:scale-95 ${
              challanMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${challanMode ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className="whitespace-nowrap">{challanMode ? 'On' : 'Off'}</span>
          </button>
        </div>

        {/* Quotation Card */}
        <div className="flex flex-col gap-2 p-1.5 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/public/invoice/${invoiceId}?type=quotation&pricing=${quotationPricing}`}
              target="_blank"
              className="flex-1 min-w-0 flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 text-white rounded-md transition-all active:scale-95 font-label-sm text-xs"
              title={`Open and download quotation (${quotationPricing === 'with_money' ? 'With Pricing' : 'Without Pricing'})`}
            >
              <MaterialIcon icon="request_quote" className="text-[16px] text-tertiary-fixed-dim shrink-0" />
              <span className="font-medium truncate">Quotation</span>
              <span className="shrink-0 text-[10px] text-white/80 bg-white/10 px-1.5 py-0.5 rounded font-medium">
                {quotationPricing === 'with_money' ? 'With Pricing' : 'No Pricing'}
              </span>
              <MaterialIcon icon="open_in_new" className="text-[12px] opacity-60 ml-auto shrink-0" />
            </Link>
            <button
              type="button"
              onClick={() => handleOpenSendDialog('quotation')}
              title="Send Quotation"
              className="p-1.5 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <MaterialIcon icon="send" className="text-[16px]" />
            </button>
            <button
              type="button"
              onClick={() => handleToggle('quotation', !quotationMode)}
              disabled={isUpdating}
              title={quotationMode ? 'Quotation public view is ON. Click to disable.' : 'Quotation public view is OFF. Click to enable.'}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-semibold border transition-all cursor-pointer active:scale-95 ${
                quotationMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${quotationMode ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className="whitespace-nowrap">{quotationMode ? 'On' : 'Off'}</span>
            </button>
          </div>

          {/* Pricing Toggle for Quotation */}
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 bg-black/25 rounded border border-white/5 text-[11px]">
            <span className="text-white/70 flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider shrink-0">
              <MaterialIcon icon="payments" className="text-[14px] text-white/60" />
              <span>Pricing:</span>
            </span>
            <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded text-[10px] font-medium shrink-0">
              <button
                type="button"
                onClick={() => handleQuotationPricingChange('with_money')}
                disabled={isUpdating}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer whitespace-nowrap ${
                  quotationPricing === 'with_money'
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                With Money
              </button>
              <button
                type="button"
                onClick={() => handleQuotationPricingChange('without_money')}
                disabled={isUpdating}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer whitespace-nowrap ${
                  quotationPricing === 'without_money'
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Without Money
              </button>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="text-[11px] font-medium text-emerald-200 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-md text-center animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Send Document Dialog */}
      <SendDocumentDialog
        isOpen={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        invoiceId={invoiceId}
        invoiceNumber={invoiceNumber}
        customerName={customerName}
        customerPhone={customerPhone}
        customerEmail={customerEmail}
        customerWhatsapp={customerWhatsapp}
        companyName={companyName}
        initialDocumentType={selectedDocType}
        initialQuotationWithPricing={quotationPricing === 'with_money'}
      />
    </div>
  );
}
