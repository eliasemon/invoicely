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
  getAllItems,
  getSubjectForDoc,
  getNoteText,
} from "./templateUtils";

export function ElegantTemplate({
  invoice,
  profile,
  isPreview,
  showGroups,
  showGroupTotals,
  publicUrl,
  isChallan,
  isQuotation,
  documentType,
  showPricing,
  paperSize,
}: TemplateProps) {
  const isChallanDoc = Boolean(isChallan || documentType === 'challan');
  const isQuotationDoc = Boolean(isQuotation || documentType === 'quotation');
  const isPricingHidden = isChallanDoc || (isQuotationDoc && showPricing === false);
  const docTitle = isQuotationDoc ? "QUOTATION" : isChallanDoc ? "CHALLAN" : "INVOICE";
  const docNumberLabel = isQuotationDoc ? "Quotation No." : isChallanDoc ? "Challan No." : "Invoice No.";
  const clientLabel = isQuotationDoc ? "QUOTATION TO" : isChallanDoc ? "CHALLAN TO" : "BILL TO";

  const sym = invoice.currency_symbol || "$";
  const itemSym = getItemCurrencySymbol(invoice, profile);
  const issueDate = getIssueDate(invoice);
  const dueDate = getDueDate(invoice, 14);
  const subtotal = getSubtotal(invoice);
  const discountAmount = getDiscountAmount(invoice, subtotal);
  const shippingCost = getShippingCost(invoice);
  const total = getTotal(invoice);
  const amountPaid = getAmountPaid(invoice);
  const balanceDue = Math.max(0, total - amountPaid);
  const items = getAllItems(invoice);
  const subject = getSubjectForDoc(invoice, documentType);
  const noteText = getNoteText(invoice);

  const isA5 = paperSize === 'a5';

  if (isA5) {
    return (
      <div
        className="min-h-screen py-4 bg-[#cbdbf5] text-[#0b1c30] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[148mm]"
        style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
      >
        {!isPreview && (
          <div className="max-w-[148mm] mx-auto mb-2 flex justify-between items-center gap-2 print:hidden px-1">
            <span className="text-xs font-bold text-black" style={{ fontFamily: "Work Sans, sans-serif" }}>
              Invorio (A5)
            </span>
            <button
              onClick={() => window.print()}
              className="bg-black text-white px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1.5 cursor-pointer hover:bg-neutral-800"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              Download PDF (A5)
            </button>
          </div>
        )}

        {/* Invoice Canvas A5 */}
        <main className="w-full max-w-[148mm] min-h-[210mm] mx-auto bg-white shadow-sm rounded-sm p-3 print:p-2.5 relative print:shadow-none print:rounded-none print:border-none print:w-[148mm] print:max-w-[148mm] print:mx-0 print:min-h-[210mm] print:my-0 flex flex-col justify-between">
          <div>
            {/* Header */}
            <header className="flex justify-between items-start gap-2 mb-2 pb-2 border-b border-gray-200">
              <div className="flex-1 min-w-0">
                {profile?.company_logo && (
                  <img
                    alt="Company Logo"
                    className="max-h-9 max-w-[140px] mb-1 object-contain"
                    src={profile.company_logo}
                  />
                )}
                <h1
                  className="text-base font-bold text-black leading-tight"
                  style={{ fontFamily: "Work Sans, sans-serif", letterSpacing: "-0.02em" }}
                >
                  {profile?.company_name || "Your Company"}
                </h1>
                {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                  <p className="text-[#565e74] text-[9.5px] italic">
                    {invoice.brand_voice || profile?.brand_voice}
                  </p>
                )}
                <p className="text-[#565e74] text-[9px] mt-0.5 whitespace-pre-line leading-tight">
                  {profile?.company_address || ""}
                  {profile?.email ? ` • ${profile.email}` : ""}
                  {profile?.phone ? ` • ${profile.phone}` : ""}
                </p>
              </div>

              <div className="text-right shrink-0">
                <h2 className="text-[10px] font-semibold text-[#76777d] tracking-wider uppercase" style={{ fontFamily: "Work Sans, sans-serif" }}>
                  {docTitle}
                </h2>
                <p className="text-xs font-bold text-black mt-0.5" style={{ fontFamily: "Geist, monospace" }}>
                  #{invoice.invoiceNumber || invoice.id?.substring(0, 8).toUpperCase()}
                </p>
                <div className="text-[9px] text-[#565e74] mt-1 space-y-0.5" style={{ fontFamily: "Geist, monospace" }}>
                  <p>Date: {formatDate(issueDate)}</p>
                  {!isPricingHidden && !isQuotationDoc && <p>Due: {formatDate(dueDate)}</p>}
                </div>
                {!isPricingHidden && !isQuotationDoc && invoice.status && (
                  <div
                    className={`mt-1 inline-block px-2 py-0.5 rounded text-[8.5px] font-bold uppercase ${
                      invoice.status === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {invoice.status}
                  </div>
                )}
              </div>
            </header>

            {/* Client Info */}
            <div className="flex justify-between items-start gap-2 mb-2 text-[10px]">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#76777d]">{clientLabel}</p>
                <h3 className="font-bold text-xs text-black mt-0.5">{invoice.clientName}</h3>
                <p className="text-[#565e74] text-[9.5px] whitespace-pre-line leading-tight">
                  {invoice.clientAddress || invoice.clientPhone}
                </p>
              </div>
            </div>

            {/* Subject */}
            {subject && (
              <div className="mb-2 text-[9.5px] text-[#45464d] bg-[#f8faff] px-2 py-1 rounded border border-[#dce9ff]/70 flex items-center gap-1.5">
                <span className="font-semibold text-[#0b1c30] uppercase text-[9px]">Subject:</span>
                <span className="font-medium text-[#2b303b] truncate">{subject}</span>
              </div>
            )}

            {/* Items Table */}
            <div className="mb-2">
              <table className="w-full text-left border-collapse text-[9.5px]">
                <thead>
                  <tr className="border-b border-black text-[9px] uppercase tracking-wider text-[#76777d]">
                    <th className="py-1 pr-2">Item</th>
                    <th className="py-1 px-1.5 text-center w-12">Qty</th>
                    {!isPricingHidden && (
                      <>
                        <th className="py-1 px-1.5 text-right w-14">Price</th>
                        <th className="py-1 pl-1.5 text-right w-16">Total</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(() => {
                    return (invoice.groups || [{ items }]).map((group: any, gIdx: number) => (
                      <React.Fragment key={gIdx}>
                        {group.name && showGroups && (
                          <tr className="bg-slate-50">
                            <td colSpan={isPricingHidden ? 2 : 4} className="py-0.5 font-bold text-[9px] uppercase text-[#0b1c30]">
                              {group.name}
                            </td>
                          </tr>
                        )}
                        {group.items.map((item: any, iIdx: number) => {
                          const itemTotal = (item.isFlatRate ? 1 : item.quantity) * item.unitPrice;
                          return (
                            <tr key={iIdx} className="template-item-row hover:bg-gray-50/50">
                              <td className="py-1 pr-2">
                                <p className="font-semibold text-black leading-tight">{item.name}</p>
                              </td>
                              <td className="py-1 px-1.5 text-center font-mono text-[9px] text-gray-700">
                                {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                              </td>
                              {!isPricingHidden && (
                                <>
                                  <td className="py-1 px-1.5 text-right font-mono text-[9px] text-gray-700">
                                    {formatMoney(item.unitPrice, itemSym)}
                                  </td>
                                  <td className="py-1 pl-1.5 text-right font-mono text-[9px] font-bold text-black">
                                    {formatMoney(itemTotal, itemSym)}
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            {!isPricingHidden && (
              <div className="flex justify-end mb-2 template-totals-block">
                <div className="w-1/2 space-y-1 text-[9.5px]">
                  <div className="flex justify-between text-[#565e74]">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatMoney(subtotal, sym)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#565e74]">
                      <span>Discount {invoice.discount_type === "percentage" ? `(${invoice.discount_value}%)` : ""}</span>
                      <span className="font-mono">-{formatMoney(discountAmount, sym)}</span>
                    </div>
                  )}
                  {shippingCost > 0 && (
                    <div className="flex justify-between text-[#565e74]">
                      <span>Shipping</span>
                      <span className="font-mono">+{formatMoney(shippingCost, sym)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-black pt-1 flex justify-between font-bold text-xs text-black">
                    <span>{isQuotationDoc ? "Quotation Total" : "Total"}</span>
                    <span className="font-mono">{formatMoney(total, sym)}</span>
                  </div>
                  {amountPaid > 0 && !isQuotationDoc && (
                    <>
                      <div className="flex justify-between text-green-700">
                        <span>Paid</span>
                        <span className="font-mono">{formatMoney(amountPaid, sym)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[10.5px] border-t border-gray-200 pt-0.5 text-black">
                        <span>Balance Due</span>
                        <span className="font-mono">{formatMoney(balanceDue, sym)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Footer Section */}
          <div className="border-t border-gray-200 pt-2 template-bottom-section">
            {noteText && (
              <div className="mb-1 text-[9px] text-[#565e74] template-nb-note">
                <strong className="text-black">N.B:</strong> {noteText}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 items-end">
              <div>
                {!isPricingHidden && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) && (
                  <div className="text-[8.5px] text-[#565e74] space-y-0.5">
                    <p className="font-bold text-black uppercase">Payment Details</p>
                    <p>{invoice.bank_name || profile?.bank_name}</p>
                    {(invoice.bank_account_number || profile?.bank_account_number) && (
                      <p className="font-mono">A/C: {invoice.bank_account_number || profile?.bank_account_number}</p>
                    )}
                  </div>
                )}
                {profile?.qr_code_enabled && publicUrl && (
                  <div className="mt-1">
                    <QRCodeSVG value={publicUrl} size={38} />
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end">
                {(profile?.signature_enabled ?? true) &&
                  (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name) && (
                    <div className="flex flex-col items-end min-w-[110px]">
                      {(invoice.signature_url || profile?.signature_url) && (
                        <img
                          src={invoice.signature_url || profile?.signature_url || undefined}
                          alt="Signature"
                          className="h-6 mb-0.5 object-contain"
                        />
                      )}
                      <div className="w-28 border-b border-black mb-0.5"></div>
                      <p className="text-[8.5px] text-[#76777d]">
                        {invoice.signatory_name || profile?.signatory_name || (isChallanDoc ? "Received By" : "Authorized Signatory")}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 bg-[#cbdbf5] text-[#0b1c30] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
    >
      {/* Floating Actions */}
      {!isPreview && (
        <div className="fixed top-6 right-12 z-50 flex gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-black text-white px-6 py-2.5 rounded-full shadow-md text-xs flex items-center gap-2 cursor-pointer hover:bg-neutral-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Download PDF
          </button>
        </div>
      )}
      {/* Invoice Canvas */}
      <main className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-[0_4px_40px_rgba(11,28,48,0.06)] rounded-sm overflow-hidden p-4 sm:p-5 print:p-4 relative print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0 flex flex-col justify-between">
        <div>
          {/* Header */}
          <header className="flex flex-row print:flex-row justify-between items-end print:items-end gap-2 mb-2.5">
            <div>
              {profile?.company_logo && (
                <img
                  alt="Company Logo"
                  className="max-h-12 max-w-[200px] mb-1.5 object-contain w-auto h-auto"
                  src={profile.company_logo}
                />
              )}
              <h1
                className="text-2xl sm:text-[28px] leading-tight font-bold text-black mb-0.5"
                style={{
                  fontFamily: "Work Sans, sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                {profile?.company_name || "Your Company"}
              </h1>
              {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                <p className="text-[#565e74] text-[11px] italic mb-1">
                  {invoice.brand_voice || profile?.brand_voice}
                </p>
              )}
              <p className="text-[#565e74] max-w-[250px] whitespace-pre-line text-[11px] mt-1">
                {profile?.company_address || ""}
                {profile?.email ? `\n${profile.email}` : ""}
                {profile?.phone ? `\n${profile.phone}` : ""}
              </p>
            </div>
            <div className="text-right print:text-right w-auto print:w-auto">
              <h2
                className="text-sm font-semibold text-[#76777d] tracking-wider mb-2 uppercase"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                {docTitle}
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-right print:text-right">
                <span className="text-[12px] text-[#76777d] text-right print:text-right">
                  {docNumberLabel}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ fontFamily: "Geist, monospace" }}
                >
                  {invoice.invoiceNumber ||
                    invoice.id?.substring(0, 8).toUpperCase()}
                </span>
                <span className="text-[12px] text-[#76777d] text-right print:text-right">
                  Issue Date
                </span>
                <span
                  className="text-sm"
                  style={{ fontFamily: "Geist, monospace" }}
                >
                  {formatDate(issueDate)}
                </span>
                {!isPricingHidden && (
                  <>
                    <span className="text-[12px] text-[#76777d] text-right print:text-right">
                      Due Date
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ fontFamily: "Geist, monospace" }}
                    >
                      {formatDate(dueDate)}
                    </span>
                  </>
                )}
              </div>
              {profile?.qr_code_enabled && publicUrl && (
                <div className="mt-2 flex justify-end print:justify-end">
                  <QRCodeSVG value={publicUrl} size={44} />
                </div>
              )}
            </div>
          </header>

          {/* Bill To / Delivered To */}
          <section className="mb-2 border-l-2 border-[#565e74] pl-3 py-0.5">
            <h3 className="text-[11px] text-[#76777d] uppercase tracking-wider mb-0.5">
              {clientLabel}
            </h3>
            <p
              className="text-[13px] font-semibold mb-0.5"
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              {invoice.clientName}
            </p>
            <p className="text-[#565e74] text-xs whitespace-pre-line">
              {invoice.clientAddress || invoice.clientPhone}
            </p>
          </section>

          {/* Subject */}
          {subject && (
            <div className="mb-2 px-2.5 py-1.5 bg-slate-50 border-l-4 border-slate-700 text-xs text-slate-800 flex items-center gap-2 rounded-r">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Subject:</span>
              <span className="font-semibold text-slate-900">{subject}</span>
            </div>
          )}

          {/* Line Items Table */}
          <section className="mb-2">
            <div className="w-full">
              <div className="grid grid-cols-12 gap-2 border-b border-[#c6c6cd] pb-2 mb-2">
                <div className="col-span-1 text-center text-[12px] text-[#76777d] font-semibold uppercase">
                  #
                </div>
                <div className={`${isPricingHidden ? 'col-span-7' : 'col-span-5'} text-[12px] text-[#76777d] font-semibold uppercase text-left`}>
                  DESCRIPTION
                </div>
                <div className={`${isPricingHidden ? 'col-span-4' : 'col-span-2'} text-right text-[12px] text-[#76777d] font-semibold uppercase`}>
                  QTY/HRS
                </div>
                {!isPricingHidden && (
                  <>
                    <div className="col-span-2 text-right text-[12px] text-[#76777d] font-semibold uppercase">
                      RATE
                    </div>
                    <div className="col-span-2 text-right text-[12px] text-[#76777d] font-semibold uppercase">
                      AMOUNT
                    </div>
                  </>
                )}
              </div>
              {showGroups && invoice.groups && invoice.groups.length > 0
                ? (() => {
                    let runningIdx = 0;
                    return invoice.groups.map((group, gIdx) => (
                      <React.Fragment key={gIdx}>
                        {group.name && (
                          <div className="col-span-12 text-[10px] font-bold tracking-wider text-slate-700 bg-slate-100 px-3 py-1 mb-2 mt-3 uppercase rounded text-left">
                            {group.name}
                          </div>
                        )}
                        {group.items.map((item, iIdx) => {
                          runningIdx++;
                          return (
                            <div
                              key={iIdx}
                              className="template-item-row grid grid-cols-12 gap-2 py-2 border-b border-[#dce9ff] items-start col-span-12"
                            >
                              <div className="col-span-1 text-center text-xs text-[#76777d] font-mono">
                                {runningIdx}
                              </div>
                              <div className={`${isPricingHidden ? 'col-span-7' : 'col-span-5'} text-left`}>
                                <p className="font-medium text-xs text-left">{item.name}</p>
                              </div>
                              <div
                                className={`${isPricingHidden ? 'col-span-4' : 'col-span-2'} text-right text-xs text-[#565e74]`}
                                style={{ fontFamily: "Geist, monospace" }}
                              >
                                {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                              </div>
                              {!isPricingHidden && (
                                <>
                                  <div
                                    className="col-span-2 text-right text-xs text-[#565e74]"
                                    style={{ fontFamily: "Geist, monospace" }}
                                  >
                                    {formatMoney(item.unitPrice, itemSym)}
                                  </div>
                                  <div
                                    className="col-span-2 text-right text-xs font-semibold"
                                    style={{ fontFamily: "Geist, monospace" }}
                                  >
                                    {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}

                        {showGroupTotals && !isPricingHidden && (
                          <div className="col-span-12 flex justify-end pt-1 pb-3">
                            <div className="text-[10px] font-medium text-slate-500 bg-[#eff6ff] px-3 py-1 rounded border border-[#bfdbfe]">
                              <span className="uppercase tracking-wide mr-3 text-slate-400">
                                Group Subtotal
                              </span>
                              <span
                                style={{ fontFamily: "Geist, monospace" }}
                                className="text-[#1e40af] font-bold"
                              >
                                {formatMoney(
                                  group.items.reduce(
                                    (sum, item) =>
                                      sum + (item.isFlatRate ? 1 : item.quantity) * item.unitPrice,
                                    0,
                                  ),
                                  itemSym,
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    ));
                  })()
                : items.map((item, idx) => (
                    <div
                      key={idx}
                      className="template-item-row grid grid-cols-12 gap-2 py-2 border-b border-[#dce9ff] items-start"
                    >
                      <div className="col-span-1 text-center text-xs text-[#76777d] font-mono">
                        {idx + 1}
                      </div>
                      <div className={`${isPricingHidden ? 'col-span-7' : 'col-span-5'} text-left`}>
                        <p className="font-medium text-xs text-left">{item.name}</p>
                      </div>
                      <div
                        className={`${isPricingHidden ? 'col-span-4' : 'col-span-2'} text-right text-xs text-[#565e74]`}
                        style={{ fontFamily: "Geist, monospace" }}
                      >
                        {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                      </div>
                      {!isPricingHidden && (
                        <>
                          <div
                            className="col-span-2 text-right text-xs text-[#565e74]"
                            style={{ fontFamily: "Geist, monospace" }}
                          >
                            {formatMoney(item.unitPrice, itemSym)}
                          </div>
                          <div
                            className="col-span-2 text-right text-xs font-semibold"
                            style={{ fontFamily: "Geist, monospace" }}
                          >
                            {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
            </div>
          </section>

          {/* Totals - Only in Invoice Mode */}
          {!isPricingHidden && (
            <section className="flex flex-col items-end mb-4">
              <div className="w-full sm:w-1/2 md:w-1/3">
                <div className="flex justify-between py-1.5 border-b border-[#dce9ff]">
                  <span className="text-[#565e74] text-xs">Subtotal</span>
                  <span
                    className="text-xs"
                    style={{ fontFamily: "Geist, monospace" }}
                  >
                    {formatMoney(subtotal, sym)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-[#dce9ff]">
                    <span className="text-[#565e74] text-xs">
                      Discount{" "}
                      {invoice.discount_type === "percentage"
                        ? `(${invoice.discount_value}%)`
                        : ""}
                    </span>
                    <span
                      className="text-xs text-red-600"
                      style={{ fontFamily: "Geist, monospace" }}
                    >
                      -{formatMoney(discountAmount, sym)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 border-b border-[#dce9ff]">
                  <span className="text-[#565e74] text-xs">Tax (0%)</span>
                  <span
                    className="text-xs"
                    style={{ fontFamily: "Geist, monospace" }}
                  >
                    {formatMoney(0, sym)}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-[#dce9ff]">
                    <span className="text-[#565e74] text-xs">Shipping</span>
                    <span
                      className="text-xs"
                      style={{ fontFamily: "Geist, monospace" }}
                    >
                      +{formatMoney(shippingCost, sym)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-2.5 mt-1 border-t-2 border-black">
                  <span
                    className="text-sm font-semibold"
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                  >
                    Total Due
                  </span>
                  <span
                    className="text-base font-bold"
                    style={{ fontFamily: "Geist, monospace" }}
                  >
                    {formatMoney(total, sym)}
                  </span>
                </div>
                {amountPaid > 0 && !isQuotationDoc && (
                  <>
                    <div className="flex justify-between py-1.5 text-xs text-gray-500 font-medium">
                      <span>Paid</span>
                      <span>{formatMoney(amountPaid, sym)}</span>
                    </div>
                    <div className="flex justify-between py-2 mt-1 border-t border-gray-400 text-xs font-bold text-gray-900">
                      <span>Balance Due</span>
                      <span>{formatMoney(balanceDue, sym)}</span>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Bottom Section: N.B. Note, Footer with Bank Details & Signature */}
        <div className="w-full break-inside-avoid template-bottom-section">
          {/* N.B. Note - Immediately above bank details */}
          {noteText && (
            <div className="border-t border-[#dce9ff] pt-2 mb-2 text-left print:pt-1.5 print:mb-1.5 break-inside-avoid template-nb-note">
              <div className="text-[11px] text-[#565e74] whitespace-pre-line">
                <strong className="text-black">N.B:</strong> {noteText}
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="flex flex-row print:flex-row justify-between items-end print:items-end gap-3 w-full pt-2.5 print:pt-2 border-t border-[#dce9ff]">
            <div className="w-1/2 print:w-1/2 space-y-2">
              {/* Bank Details - Directly below N.B. Note */}
              {!isPricingHidden && (profile?.bank_enabled ?? true) &&
                (invoice.bank_name || profile?.bank_name) && (
                  <div>
                    <h4 className="text-[11px] text-[#76777d] mb-1 uppercase tracking-wider font-semibold" style={{ fontFamily: "Work Sans, sans-serif" }}>
                      BANK DETAILS
                    </h4>
                    <div className="text-xs text-[#565e74] space-y-0.5">
                      <p>
                        <span className="font-semibold text-black">Bank:</span>{" "}
                        {invoice.bank_name || profile?.bank_name}
                      </p>
                      {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                        <p>
                          <span className="font-semibold text-black">
                            Account Holder:
                          </span>{" "}
                          {invoice.bank_account_holder || profile?.bank_account_holder}
                        </p>
                      )}
                      {(invoice.bank_account_number || profile?.bank_account_number) && (
                        <p>
                          <span className="font-semibold text-black">
                            Account Number:
                          </span>{" "}
                          {invoice.bank_account_number || profile?.bank_account_number}
                        </p>
                      )}
                      {(invoice.bank_swift || profile?.bank_swift) && (
                        <p>
                          <span className="font-semibold text-black">SWIFT:</span>{" "}
                          {invoice.bank_swift || profile?.bank_swift}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              {((invoice.terms_and_conditions_enabled ?? profile?.terms_and_conditions_enabled ?? true) && (invoice.terms_and_conditions || profile?.terms_and_conditions)) && (
                <div className="whitespace-pre-wrap">
                  <h4
                    className="text-[11px] text-[#76777d] mb-1 uppercase tracking-wider font-semibold"
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                  >
                    TERMS & CONDITIONS
                  </h4>
                  <p className="text-[#565e74] text-[10px] leading-relaxed">
                    {invoice.terms_and_conditions || profile?.terms_and_conditions}
                  </p>
                </div>
              )}
              {invoice.notes && (
                <div>
                  <h4 className="text-[11px] text-[#76777d] mb-1 uppercase tracking-wider font-semibold">
                    NOTES
                  </h4>
                  <p className="text-[#565e74] text-[10px] leading-relaxed">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>
          <div className="w-1/2 print:w-1/2 flex justify-end print:justify-end">
            <div className="flex flex-row items-end gap-3 justify-end print:justify-end w-auto shrink-0">
              {(profile?.signature_enabled ?? true) &&
                (invoice.signature_url ||
                  profile?.signature_url ||
                  invoice.signatory_name ||
                  profile?.signatory_name) && (
                  <div className="flex flex-col items-end print:items-end">
                    {(invoice.signature_url || profile?.signature_url) && (
                      <img
                        src={
                          invoice.signature_url ||
                          profile?.signature_url ||
                          undefined
                        }
                        alt="Signature"
                        className="h-10 mb-1 object-contain"
                      />
                    )}
                    <div className="w-36 border-b border-[#565e74] mb-1"></div>
                    <p className="text-[11px] text-[#76777d]">
                      {invoice.signatory_name ||
                        profile?.signatory_name ||
                        (isChallanDoc ? "Received By" : "Authorized Signature")}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </footer>
      </div>


      </main>
    </div>
  );
}
