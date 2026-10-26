import React from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  TemplateProps,
  formatDate,
  formatMoney,
  getItemCurrencySymbol,
  getIssueDate,
  getDueDate,
  getSubtotal,
  getDiscountAmount,
  getShippingCost,
  getTotal,
  getAmountPaid,
  getSubjectForDoc,
  getNoteText,
} from "./templateUtils";

export function ModernTemplate({
  invoice,
  profile,
  isPreview,
  publicUrl,
  showGroupTotals,
  isChallan,
  isQuotation,
  documentType,
  showPricing,
  paperSize,
}: TemplateProps) {
  const isChallanDoc = Boolean(isChallan || documentType === 'challan');
  const isQuotationDoc = Boolean(isQuotation || documentType === 'quotation');
  const isPricingHidden = isChallanDoc || (isQuotationDoc && showPricing === false);
  const docTitle = isQuotationDoc ? "Quotation Number" : isChallanDoc ? "Challan Number" : "Invoice Number";
  const clientLabel = isQuotationDoc ? "Quotation To" : isChallanDoc ? "Challan To" : "Bill To";

  const sym = invoice.currency_symbol || "$";
  const itemSym = getItemCurrencySymbol(invoice, profile);
  const issueDate = getIssueDate(invoice);
  const dueDate = getDueDate(invoice);
  const subtotal = getSubtotal(invoice);
  const discountAmount = getDiscountAmount(invoice, subtotal);
  const shippingCost = getShippingCost(invoice);
  const total = getTotal(invoice);
  const tax = 0;
  const amountPaid = getAmountPaid(invoice);
  const balanceDue = Math.max(0, total - amountPaid);
  const subject = getSubjectForDoc(invoice, documentType);
  const noteText = getNoteText(invoice);

  const isA5 = paperSize === 'a5';

  if (isA5) {
    return (
      <div
        className="min-h-screen py-4 bg-[#f8f9ff] text-[#0b1c30] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[148mm]"
        style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
      >
        {!isPreview && (
          <div className="max-w-[148mm] mx-auto mb-2 flex flex-row justify-between items-center gap-2 print:hidden px-1">
            <span
              className="text-xs font-bold text-black"
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              Invorio (A5)
            </span>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 border border-[#c6c6cd] rounded-lg text-[11px] hover:bg-[#eff4ff] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              Download / Print PDF (A5)
            </button>
          </div>
        )}

        {/* Invoice Paper A5 */}
        <div className="max-w-[148mm] w-full min-h-[210mm] mx-auto bg-white rounded-lg shadow-[0px_2px_12px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col justify-between print:shadow-none print:rounded-none print:border-none print:w-[148mm] print:max-w-[148mm] print:mx-0 print:min-h-[210mm] print:my-0">
          <div>
            {/* Reorganized Top Banner for A5 */}
            <div className="bg-[#0058be] text-white p-3 print:p-2.5 flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                {profile?.company_logo && (
                  <img
                    alt="Logo"
                    className="max-h-9 max-w-[120px] bg-white p-0.5 rounded mb-1.5 object-contain"
                    src={profile.company_logo}
                  />
                )}
                <h2
                  className="text-xs font-semibold leading-tight truncate"
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                >
                  {profile?.company_name || "Your Company"}
                </h2>
                {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                  <p className="text-[9.5px] text-blue-200/90 italic truncate">
                    {invoice.brand_voice || profile?.brand_voice}
                  </p>
                )}
                <div className="text-[9px] text-blue-100/80 mt-1 space-y-0.5" style={{ fontFamily: "Geist, monospace" }}>
                  {profile?.email && <p className="truncate">{profile.email}</p>}
                  {profile?.phone && <p>{profile.phone}</p>}
                  {profile?.company_address && <p className="line-clamp-2">{profile.company_address}</p>}
                </div>
              </div>

              {/* Meta Right */}
              <div className="text-right shrink-0">
                <p className="text-[9px] uppercase tracking-wider text-blue-200">
                  {docTitle}
                </p>
                <p className="text-sm font-bold text-white tracking-tight">
                  {invoice.invoiceNumber || invoice.id?.substring(0, 8).toUpperCase()}
                </p>
                <div className="text-[9.5px] text-blue-100/90 mt-1 space-y-0.5">
                  <p>Issued: {formatDate(issueDate)}</p>
                  {!isPricingHidden && !isQuotationDoc && (
                    <p>Due: {formatDate(dueDate)}</p>
                  )}
                </div>
                {!isPricingHidden && !isQuotationDoc && invoice.status && (
                  <div
                    className={`mt-1.5 inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      invoice.status === "PAID"
                        ? "bg-emerald-400 text-emerald-950"
                        : "bg-amber-300 text-amber-950"
                    }`}
                  >
                    {invoice.status}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-3 print:p-2.5">
              {/* Client Info & Subject */}
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <p className="text-[9px] uppercase text-[#76777d] font-semibold">{clientLabel}</p>
                  <h3 className="text-xs font-bold text-[#0b1c30]">{invoice.clientName}</h3>
                  <p className="text-[10px] text-[#45464d] whitespace-pre-line leading-tight">
                    {invoice.clientAddress || invoice.clientPhone}
                  </p>
                </div>
              </div>

              {subject && (
                <div className="mb-2 text-[10px] text-[#45464d] bg-[#f8faff] px-2 py-1 rounded border border-[#dce9ff]/70 flex items-center gap-1.5">
                  <span className="font-semibold text-[#1a2b3c] uppercase text-[9px]">Subject:</span>
                  <span className="font-medium text-[#2b303b] truncate">{subject}</span>
                </div>
              )}

              {/* Items Table */}
              <div className="mb-2">
                <div className="flex justify-between text-[9px] uppercase font-bold text-[#76777d] border-b border-[#dce9ff] pb-1 mb-1">
                  <span className="text-left"># Description</span>
                  <span>{isPricingHidden ? 'Qty' : 'Amount'}</span>
                </div>

                {(() => {
                  let runningIdx = 0;
                  return invoice.groups?.map((group: any, gIdx: number) => (
                    <div key={gIdx} className="mb-2">
                      {group.name && (
                        <h4 className="font-bold text-[10.5px] text-[#0058be] mb-0.5">{group.name}</h4>
                      )}
                      {group.items.map((item: any, iIdx: number) => {
                        runningIdx++;
                        return (
                          <div
                            key={iIdx}
                            className="template-item-row flex justify-between items-start mb-1 text-[10px]"
                          >
                            <div className="flex items-start gap-1.5 pr-2 text-left">
                              <span className="text-[9.5px] font-mono text-[#0058be] font-bold min-w-[14px]">
                                {runningIdx}.
                              </span>
                              <div>
                                <h4 className="font-semibold text-[10.5px] text-left leading-tight">{item.name}</h4>
                                <p className="text-[9px] text-[#45464d]" style={{ fontFamily: "Geist, monospace" }}>
                                  Qty: {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                                  {!isPricingHidden && ` × ${formatMoney(item.unitPrice, itemSym)}`}
                                </p>
                              </div>
                            </div>
                            {!isPricingHidden && (
                              <p className="text-[10px] whitespace-nowrap font-medium" style={{ fontFamily: "Geist, monospace" }}>
                                {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                              </p>
                            )}
                          </div>
                        );
                      })}

                      {showGroupTotals && !isPricingHidden && (
                        <div className="flex justify-between items-center px-1.5 py-0.5 bg-slate-50 border-t border-slate-100">
                          <span className="text-[8.5px] font-medium text-slate-400 uppercase">Subtotal</span>
                          <span className="text-[9.5px] font-medium text-slate-600" style={{ fontFamily: "Geist, monospace" }}>
                            {formatMoney(
                              group.items.reduce(
                                (sum: number, item: any) => sum + (item.isFlatRate ? 1 : item.quantity) * item.unitPrice,
                                0
                              ),
                              itemSym
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>

              {/* Totals Block */}
              {!isPricingHidden && (
                <div className="border-t border-[#dce9ff] pt-1.5 mt-1.5 template-totals-block">
                  <div className="flex justify-end mb-1">
                    <div className="w-1/2 flex justify-between text-[10px]">
                      <span className="text-[#76777d]">Subtotal</span>
                      <span style={{ fontFamily: "Geist, monospace" }}>{formatMoney(subtotal, sym)}</span>
                    </div>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-end mb-1">
                      <div className="w-1/2 flex justify-between text-[10px]">
                        <span className="text-[#76777d]">Discount {invoice.discount_type === "percentage" ? `(${invoice.discount_value}%)` : ""}</span>
                        <span style={{ fontFamily: "Geist, monospace" }}>-{formatMoney(discountAmount, sym)}</span>
                      </div>
                    </div>
                  )}
                  {shippingCost > 0 && (
                    <div className="flex justify-end mb-1">
                      <div className="w-1/2 flex justify-between text-[10px]">
                        <span className="text-[#76777d]">Shipping</span>
                        <span style={{ fontFamily: "Geist, monospace" }}>+{formatMoney(shippingCost, sym)}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <div className="w-3/5 bg-[#131b2e] py-1.5 px-3 rounded-lg flex justify-between items-center text-white">
                      <span className="text-[9px] uppercase tracking-wider text-[#bec6e0]">{isQuotationDoc ? "Quotation Total" : "Total"}</span>
                      <span className="text-xs font-bold" style={{ fontFamily: "Work Sans, sans-serif" }}>{formatMoney(total, sym)}</span>
                    </div>
                  </div>
                  {amountPaid > 0 && !isQuotationDoc && (
                    <>
                      <div className="flex justify-end mt-1">
                        <div className="w-3/5 py-1 px-3 flex justify-between items-center text-[10px]">
                          <span className="text-[#76777d]">Paid</span>
                          <span className="font-medium text-green-600" style={{ fontFamily: "Geist, monospace" }}>{formatMoney(amountPaid, sym)}</span>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="w-3/5 bg-[#eff6ff] py-1.5 px-3 rounded-lg flex justify-between items-center border border-[#bfdbfe]">
                          <span className="text-[9px] uppercase tracking-wider text-[#1e40af]">Due</span>
                          <span className="text-xs font-bold text-[#1e40af]" style={{ fontFamily: "Work Sans, sans-serif" }}>{formatMoney(balanceDue, sym)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Bank, Notes, Signature, QR for A5 */}
          <div className="p-3 print:p-2.5 border-t border-[#dce9ff] bg-[#fafcff] template-bottom-section">
            {noteText && (
              <div className="mb-1.5 text-[9px] text-[#45464d] text-left template-nb-note">
                <strong className="text-black">N.B:</strong> {noteText}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 items-end">
              <div>
                {!isPricingHidden && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) && (
                  <div className="text-[9px] text-[#45464d] space-y-0.5">
                    <p className="font-bold uppercase text-[8.5px] text-[#76777d]">Bank Details</p>
                    <p className="font-semibold text-black">{invoice.bank_name || profile?.bank_name}</p>
                    {(invoice.bank_account_number || profile?.bank_account_number) && (
                      <p className="font-mono">A/C: {invoice.bank_account_number || profile?.bank_account_number}</p>
                    )}
                  </div>
                )}
                {profile?.qr_code_enabled && publicUrl && (
                  <div className="mt-1.5">
                    <QRCodeSVG value={publicUrl} size={42} />
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end">
                {(profile?.signature_enabled ?? true) &&
                  (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name) && (
                    <div className="flex flex-col items-end min-w-[120px]">
                      {(invoice.signature_url || profile?.signature_url) && (
                        <img
                          src={invoice.signature_url || profile?.signature_url || undefined}
                          alt="Signature"
                          className="h-6 mb-1 object-contain"
                        />
                      )}
                      <div className="w-full border-b border-[#c6c6cd] mb-0.5"></div>
                      <p className="text-[9px] text-[#76777d]">
                        {invoice.signatory_name || profile?.signatory_name || (isChallanDoc ? "Received By" : "Authorized Signatory")}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 bg-[#f8f9ff] text-[#0b1c30] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
    >
      {/* Action Bar - hidden in print */}
      {!isPreview && (
        <div className="max-w-[210mm] mx-auto mb-3 flex flex-row justify-between items-center gap-2 print:hidden">
          <span
            className="text-sm font-bold text-black"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            Invorio
          </span>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-[#c6c6cd] rounded-lg text-xs hover:bg-[#eff4ff] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Download / Print PDF
          </button>
        </div>
      )}
      {/* Invoice Paper */}
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-row print:flex-row print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        {/* Sidebar */}
        <div className="bg-[#0058be] text-white w-[25%] print:w-[25%] p-4 sm:p-5 print:p-3.5 flex flex-col justify-between shrink-0">
          <div>
            <div className="mb-3">
              {profile?.company_logo && (
                <img
                  alt="Logo"
                  className="max-h-16 max-w-[160px] bg-white p-1 rounded-lg mb-3 object-contain w-auto h-auto"
                  src={profile.company_logo}
                />
              )}
              <h2
                className="text-sm font-semibold mb-1"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                {profile?.company_name || "Your Company"}
              </h2>
              {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                <p className="text-[11px] text-blue-200/90 italic mb-2">
                  {invoice.brand_voice || profile?.brand_voice}
                </p>
              )}
              {profile?.email && (
                <p
                  className="text-[11px] opacity-80"
                  style={{ fontFamily: "Geist, monospace" }}
                >
                  {profile.email}
                </p>
              )}
              {profile?.phone && (
                <p
                  className="text-[11px] opacity-80"
                  style={{ fontFamily: "Geist, monospace" }}
                >
                  {profile.phone}
                </p>
              )}
              {profile?.company_address && (
                <p
                  className="text-[11px] opacity-70 mt-1.5 whitespace-pre-line font-light"
                  style={{ fontFamily: "Geist, monospace" }}
                >
                  {profile.company_address}
                </p>
              )}
            </div>
            <div className="mb-2">
              <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">
                {docTitle}
              </p>
              <p className="text-base font-semibold">
                {invoice.invoiceNumber ||
                  invoice.id?.substring(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="mb-2">
              <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">
                Date Issued
              </p>
              <p className="text-[11px]">{formatDate(issueDate)}</p>
            </div>
            {!isPricingHidden && !isQuotationDoc && (
              <div className="mb-2">
                <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">
                  Due Date
                </p>
                <p className="text-[11px] font-semibold">{formatDate(dueDate)}</p>
              </div>
            )}
          </div>
          {!isPricingHidden && (profile?.bank_enabled ?? true) &&
            (invoice.bank_name || profile?.bank_name) && (
              <div className="mt-4 block">
                <p className="text-[12px] uppercase tracking-wider opacity-70 mb-2">
                  Payment Details
                </p>
                <div className="bg-white/10 p-4 rounded-lg text-white w-full border border-white/10">
                  <p className="text-[11px] font-semibold">
                    {invoice.bank_name || profile?.bank_name}
                  </p>
                  {(invoice.bank_account_holder ||
                    profile?.bank_account_holder) && (
                    <p className="text-[11px] mt-1 opacity-80">
                      {invoice.bank_account_holder ||
                        profile?.bank_account_holder}
                    </p>
                  )}
                  {(invoice.bank_account_number ||
                    profile?.bank_account_number) && (
                    <p className="text-[11px] mt-1 opacity-80 font-mono">
                      {invoice.bank_account_number ||
                        profile?.bank_account_number}
                    </p>
                  )}
                  {(invoice.bank_swift || profile?.bank_swift) && (
                    <p className="text-[11px] mt-1 opacity-80">
                      SWIFT: {invoice.bank_swift || profile?.bank_swift}
                    </p>
                  )}
                </div>
              </div>
            )}
          {profile?.qr_code_enabled && publicUrl && (
            <div className="mt-auto pt-8 flex justify-center">
              <div className="bg-white p-2 rounded-lg">
                <QRCodeSVG value={publicUrl} size={64} />
              </div>
            </div>
          )}
        </div>
        {/* Main Content */}
        <div className="w-[75%] print:w-[75%] p-4 sm:p-5 print:p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex flex-row print:flex-row justify-between items-start gap-2 mb-2">
              <div>
                <p className="text-[10px] uppercase text-[#76777d] mb-1">
                  {clientLabel}
                </p>
                <h3
                  className="text-sm font-semibold mb-0.5"
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                >
                  {invoice.clientName}
                </h3>
                <p className="text-[11px] text-[#45464d] whitespace-pre-line">
                  {invoice.clientAddress || invoice.clientPhone}
                </p>
              </div>
              {!isPricingHidden && !isQuotationDoc && (
                <div
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    invoice.status === "PAID"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {invoice.status}
                </div>
              )}
            </div>

            {/* Subject */}
            {subject && (
              <div className="mb-2 text-[11px] text-[#45464d] bg-[#f8faff] px-2.5 py-1.5 rounded border border-[#dce9ff]/70 flex items-center gap-2">
                <span className="font-semibold text-[#1a2b3c] uppercase text-[10px]">Subject:</span>
                <span className="font-medium text-[#2b303b]">{subject}</span>
              </div>
            )}

            {/* Items */}
            <div className="mb-2">
              <div className="flex justify-between text-[10px] uppercase text-[#76777d] mb-1.5 border-b border-[#dce9ff] pb-1">
                <span className="text-left"># Description</span>
                <span>{isPricingHidden ? 'Qty' : 'Amount'}</span>
              </div>
              {(() => {
                let runningIdx = 0;
                return invoice.groups?.map((group, gIdx) => (
                  <div key={gIdx} className="mb-3">
                    {group.name && (
                      <h4 className="font-bold text-xs mb-1">{group.name}</h4>
                    )}
                    {group.items.map((item, iIdx) => {
                      runningIdx++;
                      return (
                        <div
                          key={iIdx}
                          className="template-item-row flex justify-between items-start mb-1.5"
                        >
                          <div className="flex items-start gap-2 pr-4 text-left">
                            <span className="text-[11px] font-mono text-[#0058be] font-bold mt-0.5 min-w-[16px]">
                              {runningIdx}.
                            </span>
                            <div>
                              <h4 className="font-semibold text-xs text-left">{item.name}</h4>
                              <p
                                className="text-[10px] text-[#45464d] mt-0.5"
                                style={{ fontFamily: "Geist, monospace" }}
                              >
                                Qty: {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                                {!isPricingHidden && ` × ${formatMoney(item.unitPrice, itemSym)}`}
                              </p>
                            </div>
                          </div>
                          {!isPricingHidden && (
                            <p
                              className="text-[11px] whitespace-nowrap font-medium"
                              style={{ fontFamily: "Geist, monospace" }}
                            >
                              {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                            </p>
                          )}
                        </div>
                      );
                    })}

                  {showGroupTotals && !isPricingHidden && (
                    <div className="flex justify-between items-center px-3 py-0.5 bg-transparent border-t border-slate-100/50">
                      <div className="text-[9px] font-medium text-slate-400 uppercase tracking-wide">
                        Group Subtotal
                      </div>
                      <div
                        className="text-[10px] font-medium text-slate-500"
                        style={{ fontFamily: "Geist, monospace" }}
                      >
                        {formatMoney(
                          group.items.reduce(
                            (sum, item) => sum + (item.isFlatRate ? 1 : item.quantity) * item.unitPrice,
                            0,
                          ),
                          itemSym,
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>

            {/* Totals - Only in Invoice mode */}
            {!isPricingHidden && (
              <div className="border-t border-[#dce9ff] pt-2 mt-2 print:pt-1.5 print:mt-1.5 break-inside-avoid template-totals-block">
                <div className="flex justify-end mb-1.5">
                  <div className="w-1/2 print:w-1/2 flex justify-between text-xs">
                    <p className="text-[10px] text-[#76777d]">Subtotal</p>
                    <p style={{ fontFamily: "Geist, monospace" }}>
                      {formatMoney(subtotal, sym)}
                    </p>
                  </div>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-end mb-1.5">
                    <div className="w-1/2 print:w-1/2 flex justify-between text-xs">
                      <p className="text-[10px] text-[#76777d]">
                        Discount{" "}
                        {invoice.discount_type === "percentage"
                          ? `(${invoice.discount_value}%)`
                          : ""}
                      </p>
                      <p style={{ fontFamily: "Geist, monospace" }}>
                        -{formatMoney(discountAmount, sym)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex justify-end mb-1.5">
                  <div className="w-1/2 print:w-1/2 flex justify-between text-xs">
                    <p className="text-[10px] text-[#76777d]">Tax (0%)</p>
                    <p style={{ fontFamily: "Geist, monospace" }}>
                      {formatMoney(tax, sym)}
                    </p>
                  </div>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-end mb-3">
                    <div className="w-1/2 print:w-1/2 flex justify-between text-xs">
                      <p className="text-[10px] text-[#76777d]">Shipping</p>
                      <p style={{ fontFamily: "Geist, monospace" }}>
                        +{formatMoney(shippingCost, sym)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <div className="w-2/3 print:w-2/3 bg-[#131b2e] py-3 px-4 rounded-lg flex justify-between items-center">
                    <p className="text-[10px] uppercase tracking-wider text-[#bec6e0]">
                      {isQuotationDoc ? "Quotation Total" : "Total"}
                    </p>
                    <p
                      className="text-[11px] font-bold text-white"
                      style={{ fontFamily: "Work Sans, sans-serif" }}
                    >
                      {formatMoney(total, sym)}
                    </p>
                  </div>
                </div>
                {amountPaid > 0 && !isQuotationDoc && (
                  <>
                    <div className="flex justify-end mt-2">
                      <div className="w-2/3 print:w-2/3 py-2 px-4 flex justify-between items-center text-sm">
                        <p className="text-[10px] uppercase tracking-wider text-[#76777d]">
                          Paid
                        </p>
                        <p
                          className="text-[11px] font-medium text-green-600"
                          style={{ fontFamily: "Geist, monospace" }}
                        >
                          {formatMoney(amountPaid, sym)}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="w-2/3 print:w-2/3 bg-[#eff6ff] py-3 px-4 rounded-lg flex justify-between items-center border border-[#bfdbfe]">
                        <p className="text-[10px] uppercase tracking-wider text-[#1e40af]">
                          Due
                        </p>
                        <p
                          className="text-[11px] font-bold text-[#1e40af]"
                          style={{ fontFamily: "Work Sans, sans-serif" }}
                        >
                          {formatMoney(balanceDue, sym)}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Notes, N.B. and Signature */}
          <div className="mt-3 pt-2 print:mt-2 print:pt-1.5 border-t border-[#dce9ff] break-inside-avoid template-bottom-section">
            {/* N.B. Note */}
            {noteText && (
              <div className="mb-2 text-[10px] text-[#45464d] whitespace-pre-line text-left template-nb-note">
                <strong className="text-black">N.B:</strong> {noteText}
              </div>
            )}

            <div className="flex flex-row print:flex-row justify-between items-start gap-2">
              <div className="flex-1 flex flex-col gap-2">
              {invoice.notes && (
                <div>
                  <p className="text-[10px] uppercase text-[#76777d] mb-0.5">
                    Notes
                  </p>
                  <p className="text-[11px] text-[#45464d]">
                    {invoice.notes}
                  </p>
                </div>
              )}
              {((invoice.terms_and_conditions_enabled ?? profile?.terms_and_conditions_enabled ?? true) && (invoice.terms_and_conditions || profile?.terms_and_conditions)) && (
                <div>
                  <p className="text-[10px] uppercase text-[#76777d] mb-0.5">
                    Terms & Conditions
                  </p>
                  <p className="text-[11px] text-[#45464d] whitespace-pre-wrap">
                    {invoice.terms_and_conditions ||
                      profile?.terms_and_conditions}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-row items-end gap-3 justify-end print:justify-end w-auto shrink-0">
              {(profile?.signature_enabled ?? true) &&
                (invoice.signature_url ||
                  profile?.signature_url ||
                  invoice.signatory_name ||
                  profile?.signatory_name) && (
                  <div className="flex flex-col items-end min-w-[160px]">
                    {(invoice.signature_url || profile?.signature_url) && (
                      <img
                        src={
                          invoice.signature_url ||
                          profile?.signature_url ||
                          undefined
                        }
                        alt="Signature"
                        className="h-8 mb-1.5 object-contain"
                      />
                    )}
                    <div className="w-full border-b border-[#c6c6cd] mb-1"></div>
                    <p className="text-[10px] text-[#76777d]">
                      {invoice.signatory_name ||
                        profile?.signatory_name ||
                        (isChallanDoc ? "Received By" : "Authorized Signatory")}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>


        </div>
      </div>
    </div>
  );
}
