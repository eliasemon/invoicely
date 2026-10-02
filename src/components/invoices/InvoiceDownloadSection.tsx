'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { updateInvoiceSettings } from '@/app/actions/invoiceActions';

interface InvoiceDownloadSectionProps {
  invoiceId: string;
  invoiceModeEnabled?: boolean;
  challanModeEnabled?: boolean;
  quotationModeEnabled?: boolean;
}

export function InvoiceDownloadSection({
  invoiceId,
  invoiceModeEnabled: initialInvoiceMode = true,
  challanModeEnabled: initialChallanMode = true,
  quotationModeEnabled: initialQuotationMode = true,
}: InvoiceDownloadSectionProps) {
  const [invoiceMode, setInvoiceMode] = useState<boolean>(initialInvoiceMode);
  const [challanMode, setChallanMode] = useState<boolean>(initialChallanMode);
  const [quotationMode, setQuotationMode] = useState<boolean>(initialQuotationMode);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      {/* Primary: Commercial Invoice Button */}
      <div className="flex items-center gap-2">
        <Link
          href={`/public/invoice/${invoiceId}`}
          target="_blank"
          className="flex-1 flex items-center justify-between px-3 py-2 bg-secondary text-on-secondary hover:opacity-90 rounded-lg transition-all active:scale-98 font-label-sm shadow-sm"
          title="Open and download commercial invoice"
        >
          <span className="flex items-center gap-2">
            <MaterialIcon icon="receipt_long" className="text-[18px]" />
            <span className="font-semibold text-xs sm:text-sm">Download / Print Invoice</span>
          </span>
          <MaterialIcon icon="open_in_new" className="text-[14px] opacity-80" />
        </Link>
        <button
          type="button"
          onClick={() => handleToggle('invoice', !invoiceMode)}
          disabled={isUpdating}
          title={invoiceMode ? 'Public view is ON. Click to disable for clients.' : 'Public view is OFF. Click to enable for clients.'}
          className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
            invoiceMode
              ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/30'
              : 'bg-amber-500/20 text-amber-200 border-amber-400/40 hover:bg-amber-500/30'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${invoiceMode ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
          <span>{invoiceMode ? 'Public: On' : 'Public: Off'}</span>
        </button>
      </div>

      {/* Grid: Challan & Quotation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Challan Card */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-lg border border-white/10">
          <Link
            href={`/public/invoice/${invoiceId}?type=challan`}
            target="_blank"
            className="flex-1 flex items-center gap-1.5 px-2 py-1.5 hover:bg-white/10 text-white rounded-md transition-all active:scale-95 font-label-sm text-xs"
            title="Open and download delivery challan"
          >
            <MaterialIcon icon="local_shipping" className="text-[16px] text-primary-container" />
            <span className="font-medium truncate">Challan</span>
            <MaterialIcon icon="open_in_new" className="text-[12px] opacity-60 ml-auto" />
          </Link>
          <button
            type="button"
            onClick={() => handleToggle('challan', !challanMode)}
            disabled={isUpdating}
            title={challanMode ? 'Challan public view is ON. Click to disable.' : 'Challan public view is OFF. Click to enable.'}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer active:scale-95 ${
              challanMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${challanMode ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span>{challanMode ? 'On' : 'Off'}</span>
          </button>
        </div>

        {/* Quotation Card */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-lg border border-white/10">
          <Link
            href={`/public/invoice/${invoiceId}?type=quotation`}
            target="_blank"
            className="flex-1 flex items-center gap-1.5 px-2 py-1.5 hover:bg-white/10 text-white rounded-md transition-all active:scale-95 font-label-sm text-xs"
            title="Open and download quotation"
          >
            <MaterialIcon icon="request_quote" className="text-[16px] text-tertiary-fixed-dim" />
            <span className="font-medium truncate">Quotation</span>
            <MaterialIcon icon="open_in_new" className="text-[12px] opacity-60 ml-auto" />
          </Link>
          <button
            type="button"
            onClick={() => handleToggle('quotation', !quotationMode)}
            disabled={isUpdating}
            title={quotationMode ? 'Quotation public view is ON. Click to disable.' : 'Quotation public view is OFF. Click to enable.'}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer active:scale-95 ${
              quotationMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${quotationMode ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span>{quotationMode ? 'On' : 'Off'}</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="text-[11px] font-medium text-emerald-200 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-md text-center animate-in fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
