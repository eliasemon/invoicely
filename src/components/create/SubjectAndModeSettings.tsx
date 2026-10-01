'use client';

import React, { useState } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { useCreateInvoice } from '@/core/contexts/CreateInvoiceContext';

export function SubjectAndModeSettings() {
  const {
    subjectEnabled,
    setSubjectEnabled,
    subjectInvoice,
    setSubjectInvoice,
    subjectChallan,
    setSubjectChallan,
    subjectQuotation,
    setSubjectQuotation,
    invoiceModeEnabled,
    setInvoiceModeEnabled,
    challanModeEnabled,
    setChallanModeEnabled,
    quotationModeEnabled,
    setQuotationModeEnabled,
    noteEnabled,
    setNoteEnabled,
    noteText,
    setNoteText,
  } = useCreateInvoice();

  const [isExpanded, setIsExpanded] = useState(false);

  // Validation: at least one mode must remain enabled
  const handleToggleInvoiceMode = () => {
    if (invoiceModeEnabled && !challanModeEnabled && !quotationModeEnabled) return;
    setInvoiceModeEnabled(!invoiceModeEnabled);
  };

  const handleToggleChallanMode = () => {
    if (challanModeEnabled && !invoiceModeEnabled && !quotationModeEnabled) return;
    setChallanModeEnabled(!challanModeEnabled);
  };

  const handleToggleQuotationMode = () => {
    if (quotationModeEnabled && !invoiceModeEnabled && !challanModeEnabled) return;
    setQuotationModeEnabled(!quotationModeEnabled);
  };

  return (
    <section className="bg-surface-container-lowest rounded-2xl shadow-level1 border border-outline-variant/40 p-4 md:p-5 transition-all">
      {/* Header with expand toggle */}
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <MaterialIcon icon="tune" className="text-[22px]" />
          </div>
          <div>
            <h3 className="font-headline-sm text-sm md:text-base font-bold text-on-surface flex items-center gap-2">
              Document Formats & Subjects
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-primary-container/40 text-primary">
                Configurable
              </span>
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Manage enabled modes (Invoice, Challan, Quotation) and customize their document subjects
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={isExpanded ? 'Collapse options' : 'Expand options'}
          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <MaterialIcon
            icon={isExpanded ? 'expand_less' : 'expand_more'}
            className="text-[20px]"
          />
        </button>
      </div>

      {/* Content - Collapsible or always previewed */}
      <div className={`mt-4 pt-4 border-t border-outline-variant/30 space-y-5 ${isExpanded ? 'block' : 'hidden md:block'}`}>
        
        {/* Available Modes Toggles */}
        <div>
          <label className="font-label-md text-xs font-semibold text-on-surface uppercase tracking-wider block mb-2">
            Enabled Document Formats For This Invoice
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Invoice Mode Toggle */}
            <div
              onClick={handleToggleInvoiceMode}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                invoiceModeEnabled
                  ? 'border-primary/50 bg-primary/5 shadow-xs'
                  : 'border-outline-variant/50 bg-surface-container-low opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MaterialIcon
                  icon="receipt_long"
                  className={`text-[20px] ${invoiceModeEnabled ? 'text-primary' : 'text-on-surface-variant'}`}
                />
                <div>
                  <div className="text-xs font-bold text-on-surface">Invoice Mode</div>
                  <div className="text-[10px] text-on-surface-variant">Full billing details</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={invoiceModeEnabled}
                onChange={() => {}}
                className="w-4 h-4 rounded text-primary focus:ring-primary pointer-events-none"
              />
            </div>

            {/* Challan Mode Toggle */}
            <div
              onClick={handleToggleChallanMode}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                challanModeEnabled
                  ? 'border-primary/50 bg-primary/5 shadow-xs'
                  : 'border-outline-variant/50 bg-surface-container-low opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MaterialIcon
                  icon="local_shipping"
                  className={`text-[20px] ${challanModeEnabled ? 'text-primary' : 'text-on-surface-variant'}`}
                />
                <div>
                  <div className="text-xs font-bold text-on-surface">Challan Mode</div>
                  <div className="text-[10px] text-on-surface-variant">Consignment & delivery</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={challanModeEnabled}
                onChange={() => {}}
                className="w-4 h-4 rounded text-primary focus:ring-primary pointer-events-none"
              />
            </div>

            {/* Quotation Mode Toggle */}
            <div
              onClick={handleToggleQuotationMode}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                quotationModeEnabled
                  ? 'border-primary/50 bg-primary/5 shadow-xs'
                  : 'border-outline-variant/50 bg-surface-container-low opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MaterialIcon
                  icon="request_quote"
                  className={`text-[20px] ${quotationModeEnabled ? 'text-primary' : 'text-on-surface-variant'}`}
                />
                <div>
                  <div className="text-xs font-bold text-on-surface">Quotation Mode</div>
                  <div className="text-[10px] text-on-surface-variant">Estimate / inquiry view</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={quotationModeEnabled}
                onChange={() => {}}
                className="w-4 h-4 rounded text-primary focus:ring-primary pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Subject Enable / Disable and Subject Inputs */}
        <div className="pt-2 border-t border-outline-variant/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MaterialIcon icon="subject" className="text-primary text-[18px]" />
              <label htmlFor="subject-master-toggle" className="font-label-md text-xs font-bold text-on-surface cursor-pointer">
                Document Subjects
              </label>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="subject-master-toggle"
                type="checkbox"
                checked={subjectEnabled}
                onChange={(e) => setSubjectEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              <span className="ml-2 text-xs font-medium text-on-surface-variant">
                {subjectEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>

          {subjectEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              {/* Invoice Subject */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-on-surface-variant flex items-center justify-between">
                  <span>Invoice Subject</span>
                  <span className="text-[10px] text-primary">Commercial</span>
                </label>
                <input
                  type="text"
                  value={subjectInvoice}
                  onChange={(e) => setSubjectInvoice(e.target.value)}
                  placeholder="Bill for Items/Services"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline"
                />
              </div>

              {/* Challan Subject */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-on-surface-variant flex items-center justify-between">
                  <span>Challan Subject</span>
                  <span className="text-[10px] text-primary">Delivery</span>
                </label>
                <input
                  type="text"
                  value={subjectChallan}
                  onChange={(e) => setSubjectChallan(e.target.value)}
                  placeholder="Delivery Challan for Items/Services"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline"
                />
              </div>

              {/* Quotation Subject */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-on-surface-variant flex items-center justify-between">
                  <span>Quotation Subject</span>
                  <span className="text-[10px] text-primary">Quotation</span>
                </label>
                <input
                  type="text"
                  value={subjectQuotation}
                  onChange={(e) => setSubjectQuotation(e.target.value)}
                  placeholder="Quotation for Items/Services"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline"
                />
              </div>
            </div>
          )}
        </div>

        {/* N.B. Note Section */}
        <div className="pt-2 border-t border-outline-variant/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MaterialIcon icon="note" className="text-primary text-[18px]" />
              <label htmlFor="note-master-toggle" className="font-label-md text-xs font-bold text-on-surface cursor-pointer">
                Bottom Note (N.B.)
              </label>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="note-master-toggle"
                type="checkbox"
                checked={noteEnabled}
                onChange={(e) => setNoteEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              <span className="ml-2 text-xs font-medium text-on-surface-variant">
                {noteEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>

          {noteEnabled && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-on-surface-variant">
                Note Text
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Thank you for your business. Please make payment within the due date."
                rows={2}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline resize-none"
              />
              <p className="text-[10px] text-on-surface-variant">
                Appears at the bottom of the printed invoice as <strong>N.B: ...</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
