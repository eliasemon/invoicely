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

export function CorporateTemplate({
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
  const docTitle = isQuotationDoc ? "Quotation" : isChallanDoc ? "Challan" : "Invoice";
  const docNumberLabel = isQuotationDoc ? "Quotation Number:" : isChallanDoc ? "Challan Number:" : "Invoice Number:";
  const clientLabel = isQuotationDoc ? "Quotation To" : isChallanDoc ? "Challan To" : "Bill To";

  const sym = invoice.currency_symbol || "$";
  const itemSym = getItemCurrencySymbol(invoice, profile);
  const issueDate = getIssueDate(invoice);
  const dueDate = getDueDate(invoice);
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
        className="min-h-screen py-4 bg-[#f8f9ff] text-[#0b1c30] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[148mm]"
        style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
      >
        <div className="flex justify-center items-start print:p-0 print:m-0 print:block print:w-[148mm] max-w-full overflow-hidden print:overflow-visible">
          <div className="w-full max-w-[148mm] min-w-0 min-h-[210mm] mx-auto print:w-[148mm] print:max-w-[148mm] print:mx-0 print:min-h-[210mm]">
            {!isPreview && (
              <div className="flex flex-row justify-between items-center gap-2 bg-white p-3 rounded-lg border border-[#c6c6cd] shadow-xs mb-2 print:hidden">
                <div>
                  <h2 className="text-xs font-semibold text-black" style={{ fontFamily: "Work Sans, sans-serif" }}>
                    {docTitle} #{invoice.invoiceNumber} (A5)
                  </h2>
                  <p className="text-[10px] text-[#45464d]">Corporate Template • A5 Compact</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0058be] text-white rounded-lg text-[11px] font-semibold shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">download</span>
                  Print PDF (A5)
                </button>
              </div>
            )}

            {/* A5 Corporate Article */}
            <article className="bg-white w-full shadow-xs border border-[#c6c6cd] overflow-hidden print:shadow-none print:rounded-none print:border-none flex flex-col justify-between min-h-[210mm]">
              <div>
                <div className="h-1.5 w-full bg-[#0058be]"></div>
                <div className="p-2.5 sm:p-3 print:p-2">
                  {/* Header Box */}
                  <div className="border border-[#c6c6cd] p-2 mb-2 flex flex-col gap-1.5 relative">
                    {!isPricingHidden && !isQuotationDoc && invoice.status && (
                      <div
                        className={`absolute -top-2.5 -right-2 px-2 py-0.2 rounded text-[9px] font-bold uppercase flex items-center gap-1 shadow-xs ${
                          invoice.status === "PAID"
                            ? "bg-[#e8f5e9] border border-[#a5d6a7] text-[#2e7d32]"
                            : "bg-[#fff3e0] border border-[#ffcc80] text-[#e65100]"
                        }`}
                      >
                        {invoice.status}
                      </div>
                    )}

                    {/* Logo & Title */}
                    <div className="flex justify-between items-center gap-2">
                      <div>
                        {profile?.company_logo ? (
                          <img
                            alt="Logo"
                            className="max-h-8 max-w-[130px] object-contain"
                            src={profile.company_logo}
                          />
                        ) : (
                          <div className="text-[9px] text-[#45464d] uppercase tracking-widest font-bold">
                            From
                          </div>
                        )}
                      </div>
                      <h1
                        className="text-lg leading-tight font-bold text-black uppercase tracking-tight"
                        style={{ fontFamily: "Work Sans, sans-serif" }}
                      >
                        {docTitle}
                      </h1>
                    </div>

                    <div className="h-[1px] bg-[#c6c6cd] w-full"></div>

                    {/* Details row */}
                    <div className="flex justify-between items-start gap-2 text-[9.5px]">
                      <div>
                        <h2 className="font-bold text-black leading-tight">
                          {profile?.company_name || "Your Company"}
                        </h2>
                        {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                          <p className="text-[9px] text-[#565e74] italic mt-0.5">
                            {invoice.brand_voice || profile?.brand_voice}
                          </p>
                        )}
                        <p className="text-[#45464d] whitespace-pre-line mt-0.5 text-[9px] leading-tight" style={{ fontFamily: "Geist, monospace" }}>
                          {profile?.company_address || ""}
                          {profile?.email ? ` • ${profile.email}` : ""}
                          {profile?.phone ? ` • ${profile.phone}` : ""}
                        </p>
                      </div>

                      <div className="text-right shrink-0" style={{ fontFamily: "Geist, monospace" }}>
                        <p className="font-bold text-[10px]">#{invoice.invoiceNumber}</p>
                        <p className="text-[#45464d] text-[9px]">Issued: {formatDate(issueDate)}</p>
                        {!isPricingHidden && !isQuotationDoc && (
                          <p className="text-[#45464d] text-[9px]">Due: {formatDate(dueDate)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="border border-[#c6c6cd] p-2 mb-2 flex justify-between items-start text-[10px]">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[#76777d]">{clientLabel}:</span>
                      <h3 className="font-bold text-xs text-black mt-0.5">{invoice.clientName}</h3>
                      <p className="text-[#45464d] whitespace-pre-line text-[9.5px] leading-tight">
                        {invoice.clientAddress || invoice.clientPhone}
                      </p>
                    </div>
                  </div>

                  {/* Subject */}
                  {subject && (
                    <div className="mb-2 text-[9.5px] text-[#45464d] bg-[#f8faff] px-2 py-1 rounded border border-[#dce9ff]/70 flex items-center gap-1.5">
                      <span className="font-bold text-[#0058be] uppercase text-[9px]">Subject:</span>
                      <span className="font-medium text-[#2b303b] truncate">{subject}</span>
                    </div>
                  )}

                  {/* Table */}
                  <div className="border border-[#c6c6cd] overflow-hidden mb-2">
                    <table className="w-full text-left border-collapse text-[9.5px]">
                      <thead>
                        <tr className="bg-[#f0f4f9] border-b border-[#c6c6cd] text-[9px] uppercase text-[#45464d]">
                          <th className="py-1 px-1.5 border-r border-[#c6c6cd] w-8">#</th>
                          <th className="py-1 px-1.5 border-r border-[#c6c6cd]">Description</th>
                          <th className="py-1 px-1.5 border-r border-[#c6c6cd] text-center w-14">Qty</th>
                          {!isPricingHidden && (
                            <>
                              <th className="py-1 px-1.5 border-r border-[#c6c6cd] text-right w-16">Price</th>
                              <th className="py-1 px-1.5 text-right w-16">Total</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#c6c6cd]">
                        {(() => {
                          let runningIdx = 0;
                          return (invoice.groups || [{ items }]).map((group: any, gIdx: number) => (
                            <React.Fragment key={gIdx}>
                              {group.name && showGroups && (
                                <tr className="bg-[#eef3f9]">
                                  <td colSpan={isPricingHidden ? 3 : 5} className="py-0.5 px-1.5 font-bold text-[9px] uppercase text-[#0058be]">
                                    {group.name}
                                  </td>
                                </tr>
                              )}
                              {group.items.map((item: any, iIdx: number) => {
                                runningIdx++;
                                const itemTotal = (item.isFlatRate ? 1 : item.quantity) * item.unitPrice;
                                return (
                                  <tr key={iIdx} className="template-item-row hover:bg-[#f8f9ff]/50">
                                    <td className="py-1 px-1.5 border-r border-[#c6c6cd] text-center font-mono text-[9px]">{runningIdx}</td>
                                    <td className="py-1 px-1.5 border-r border-[#c6c6cd] font-semibold text-black">{item.name}</td>
                                    <td className="py-1 px-1.5 border-r border-[#c6c6cd] text-center font-mono text-[9px]">
                                      {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                                    </td>
                                    {!isPricingHidden && (
                                      <>
                                        <td className="py-1 px-1.5 border-r border-[#c6c6cd] text-right font-mono text-[9px]">
                                          {formatMoney(item.unitPrice, itemSym)}
                                        </td>
                                        <td className="py-1 px-1.5 text-right font-mono text-[9px] font-bold text-black">
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
                      <div className="w-1/2 border border-[#c6c6cd] bg-[#f8fafc] p-1.5 text-[9.5px] space-y-1">
                        <div className="flex justify-between text-[#45464d]">
                          <span>Subtotal:</span>
                          <span className="font-mono">{formatMoney(subtotal, sym)}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-[#45464d]">
                            <span>Discount {invoice.discount_type === "percentage" ? `(${invoice.discount_value}%)` : ""}:</span>
                            <span className="font-mono">-{formatMoney(discountAmount, sym)}</span>
                          </div>
                        )}
                        {shippingCost > 0 && (
                          <div className="flex justify-between text-[#45464d]">
                            <span>Shipping:</span>
                            <span className="font-mono">+{formatMoney(shippingCost, sym)}</span>
                          </div>
                        )}
                        <div className="border-t border-[#c6c6cd] pt-1 flex justify-between font-bold text-xs bg-[#0058be] text-white p-1 rounded">
                          <span>{isQuotationDoc ? "Quotation Total:" : "Total:"}</span>
                          <span className="font-mono">{formatMoney(total, sym)}</span>
                        </div>
                        {amountPaid > 0 && !isQuotationDoc && (
                          <>
                            <div className="flex justify-between text-[#45464d]">
                              <span>Paid:</span>
                              <span className="font-mono text-green-700">{formatMoney(amountPaid, sym)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-[10px] text-[#0058be] border-t border-[#c6c6cd] pt-0.5">
                              <span>Due:</span>
                              <span className="font-mono">{formatMoney(balanceDue, sym)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section */}
              <div className="p-2.5 sm:p-3 print:p-2 border-t border-[#c6c6cd] bg-[#f8f9ff] text-[9px] template-bottom-section">
                {noteText && (
                  <div className="mb-1 text-[9px] text-[#45464d] template-nb-note">
                    <strong className="text-black">N.B:</strong> {noteText}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 items-end">
                  <div>
                    {!isPricingHidden && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) && (
                      <div className="text-[8.5px] text-[#45464d] space-y-0.5">
                        <p className="font-bold text-black uppercase">Bank Info</p>
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
                          <div className="w-28 border-b border-[#c6c6cd] mb-0.5"></div>
                          <p className="text-[8.5px] text-[#76777d]">
                            {invoice.signatory_name || profile?.signatory_name || (isChallanDoc ? "Received By" : "Authorized Signatory")}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 bg-[#f8f9ff] text-[#0b1c30] pb-0 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
    >
      <div className="flex justify-center items-start p-6 print:p-0 print:m-0 print:block print:w-[210mm] max-w-full overflow-hidden print:overflow-visible">
        <div className="w-full max-w-[210mm] min-w-0 min-h-[297mm] mx-auto print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm]">
          {/* Action Bar */}
          {!isPreview && (
            <div className="flex flex-row justify-between items-center gap-2 bg-white p-4 rounded-xl border border-[#c6c6cd] shadow-sm mb-3 print:hidden">
              <div>
                <h2
                  className="text-sm font-semibold text-black"
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                >
                  {docTitle} #{invoice.invoiceNumber}
                </h2>
                <p className="text-[11px] text-[#45464d]">
                  Viewing Corporate Template
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-[#0058be] text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                Download PDF
              </button>
            </div>
          )}
          {/* Invoice Document */}
          <article className="bg-white w-full shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#c6c6cd] overflow-hidden print:shadow-none print:rounded-none print:border-none">
            <div className="h-2 w-full bg-[#0058be]"></div>
            <div className="p-4 sm:p-5 print:p-4">
              {/* Header */}
              <div className="border-2 border-[#c6c6cd] p-2.5 sm:p-3 mb-2 flex flex-col gap-2 relative">
                {!isPricingHidden && !isQuotationDoc && (
                  <div
                    className={`absolute -top-3 -right-3 px-3 py-0.5 rounded text-[11px] font-bold uppercase flex items-center gap-1 shadow-sm ${
                      invoice.status === "PAID"
                        ? "bg-[#e8f5e9] border border-[#a5d6a7] text-[#2e7d32]"
                        : "bg-[#fff3e0] border border-[#ffcc80] text-[#e65100]"
                    }`}
                  >
                    {invoice.status}
                  </div>
                )}

                {/* Row 1: Logo and Title */}
                <div className="flex flex-row print:flex-row justify-between items-center print:items-center gap-2 w-full">
                  <div>
                    {profile?.company_logo ? (
                      <img
                        alt="Logo"
                        className="max-h-11 max-w-[180px] object-contain w-auto h-auto"
                        src={profile.company_logo}
                      />
                    ) : (
                      <div className="text-[10px] text-[#45464d] uppercase tracking-widest font-bold mb-0.5">
                        From
                      </div>
                    )}
                  </div>
                  <h1
                    className="text-2xl sm:text-[28px] leading-tight font-bold text-black uppercase"
                    style={{
                      fontFamily: "Work Sans, sans-serif",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {docTitle}
                  </h1>
                </div>

                {/* Divider Line */}
                <div className="h-[1px] bg-[#c6c6cd] w-full"></div>

                {/* Row 2: Details Columns */}
                <div className="flex flex-row print:flex-row justify-between items-start gap-3 w-full">
                  {/* Left Column: From */}
                  <div className="flex flex-col gap-0.5">
                    {profile?.company_logo && (
                      <div className="text-[10px] text-[#45464d] uppercase tracking-widest font-bold mb-0.5">
                        From
                      </div>
                    )}
                    <div className="font-bold text-black text-sm">
                      {profile?.company_name || "Your Company"}
                    </div>
                    {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                      <div className="text-[10px] italic text-[#45464d] mt-0.5 mb-0.5">
                        {invoice.brand_voice || profile?.brand_voice}
                      </div>
                    )}
                    <div
                      className="text-xs text-[#45464d] whitespace-pre-line leading-relaxed"
                      style={{ fontFamily: "Geist, monospace" }}
                    >
                      {profile?.company_address || ""}
                      {profile?.email ? `\n${profile.email}` : ""}
                      {profile?.phone ? `\n${profile.phone}` : ""}
                    </div>
                  </div>

                  {/* Right Column: Meta */}
                  <div className="flex flex-col gap-0.5 text-right print:text-right w-auto print:w-auto">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-right print:text-right">
                      <div className="text-[11px] text-[#45464d] uppercase font-bold">
                        {docNumberLabel}
                      </div>
                      <div
                        className="text-xs font-semibold text-black break-all"
                        style={{ fontFamily: "Geist, monospace" }}
                      >
                        {invoice.invoiceNumber}
                      </div>
                      {profile?.qr_code_enabled && publicUrl && (
                        <div className="col-span-2 flex justify-end print:justify-end mt-1">
                          <QRCodeSVG value={publicUrl} size={44} />
                        </div>
                      )}
                      <div className="text-[11px] text-[#45464d] uppercase font-bold">
                        Date Issued:
                      </div>
                      <div
                        className="text-xs text-black"
                        style={{ fontFamily: "Geist, monospace" }}
                      >
                        {formatDate(issueDate)}
                      </div>
                      {!isPricingHidden && (
                        <>
                          <div className="text-[11px] text-[#45464d] uppercase font-bold">
                            Date Due:
                          </div>
                          <div
                            className="text-xs text-black"
                            style={{ fontFamily: "Geist, monospace" }}
                          >
                            {formatDate(dueDate)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill To / Consignee */}
              <div className="mb-2 p-2.5 sm:p-3 bg-[#eff4ff] border border-[#c6c6cd] flex flex-row print:flex-row justify-between items-center gap-2">
                <div>
                  <div className="text-[10px] sm:text-[11px] text-[#45464d] uppercase tracking-widest font-bold mb-1 border-b border-[#c6c6cd] pb-1 inline-block">
                    {clientLabel}
                  </div>
                  <div className="font-bold text-black text-sm mt-1">
                    {invoice.clientName}
                  </div>
                  <div
                    className="text-xs text-[#45464d] mt-0.5 whitespace-pre-line"
                    style={{ fontFamily: "Geist, monospace" }}
                  >
                    {invoice.clientAddress || invoice.clientPhone}
                  </div>
                </div>
                {!isPricingHidden && (
                  <div className="flex-shrink-0 text-right">
                    <div className="text-[10px] sm:text-[11px] text-[#45464d] uppercase tracking-widest font-bold mb-1 border-b border-[#c6c6cd] pb-1 inline-block">
                      {isQuotationDoc ? "Quotation Total" : "Amount Due"}
                    </div>
                    <div
                      className="text-xl sm:text-2xl leading-tight font-bold text-[#0058be] mt-1"
                      style={{ fontFamily: "Work Sans, sans-serif" }}
                    >
                      {formatMoney(subtotal, sym)}
                    </div>
                  </div>
                )}
              </div>

              {/* Subject */}
              {subject && (
                <div className="mb-2 px-3 py-1.5 bg-[#f8fafc] border-l-4 border-[#0058be] text-xs text-black flex items-center gap-2 rounded-r">
                  <span className="font-bold text-[#45464d] uppercase tracking-wider text-[10px]">Subject:</span>
                  <span className="font-semibold text-black text-xs">{subject}</span>
                </div>
              )}

              {/* Items Table */}
              <div className="border border-[#c6c6cd] mb-3 overflow-x-auto rounded-sm">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-[#f1f5f9] border-b border-[#c6c6cd]">
                      <th className="py-2 px-3 text-[12px] font-bold text-[#45464d] uppercase tracking-wider border-r border-[#c6c6cd] w-12 text-center">
                        #
                      </th>
                      <th className="py-2 px-3 text-[12px] font-bold text-[#45464d] uppercase tracking-wider border-r border-[#c6c6cd] text-left">
                        Description
                      </th>
                      <th className={`py-2 px-3 text-[12px] font-bold text-[#45464d] uppercase tracking-wider text-right ${isPricingHidden ? 'w-32' : 'border-r border-[#c6c6cd] w-24'}`}>
                        Qty
                      </th>
                      {!isPricingHidden && (
                        <>
                          <th className="py-2 px-3 text-[12px] font-bold text-[#45464d] uppercase tracking-wider border-r border-[#c6c6cd] text-right w-32">
                            Rate
                          </th>
                          <th className="py-2 px-3 text-[12px] font-bold text-[#45464d] uppercase tracking-wider text-right w-32">
                            Total
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody style={{ fontFamily: "Geist, monospace" }}>
                    {showGroups && invoice.groups && invoice.groups.length > 0
                      ? (() => {
                          let runningIdx = 0;
                          return invoice.groups.map((group, gIdx) => (
                            <React.Fragment key={gIdx}>
                              {group.name && (
                                <tr className="bg-[#f1f5f9] font-bold">
                                  <td
                                    colSpan={isPricingHidden ? 3 : 5}
                                    className="py-1 px-3 text-[11px] text-black border-b border-[#c6c6cd] uppercase text-left"
                                  >
                                    {group.name}
                                  </td>
                                </tr>
                              )}
                              {group.items.map((item, iIdx) => {
                                runningIdx++;
                                return (
                                  <tr
                                    key={iIdx}
                                    className="border-b border-[#c6c6cd]"
                                  >
                                    <td className="py-2 px-3 border-r border-[#c6c6cd] text-center text-[#45464d]">
                                      {runningIdx}
                                    </td>
                                    <td className="py-2 px-3 border-r border-[#c6c6cd] text-[12px] text-left">
                                      <div className="font-bold text-left">{item.name}</div>
                                    </td>
                                <td className={`py-2 px-3 ${isPricingHidden ? '' : 'border-r border-[#c6c6cd]'} text-right text-[12px]`}>
                                  {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                                </td>
                                {!isPricingHidden && (
                                  <>
                                    <td className="py-2 px-3 border-r border-[#c6c6cd] text-right text-[12px]">
                                      {formatMoney(item.unitPrice, itemSym)}
                                    </td>
                                    <td className="py-2 px-3 text-right font-semibold text-[12px]">
                                      {formatMoney(
                                        (item.isFlatRate ? 1 : item.quantity) * item.unitPrice,
                                        itemSym,
                                      )}
                                    </td>
                                  </>
                                )}
                              </tr>
                            );
                          })}

                          {showGroupTotals && !isPricingHidden && (
                              <tr className="bg-transparent border-b border-[#c6c6cd]">
                                <td colSpan={4} className="py-1 px-3 text-[10px] font-medium text-slate-400 uppercase text-right tracking-wide">
                                  Group Subtotal
                                </td>
                                <td
                                  className="py-1 px-3 text-right text-[11px] font-medium text-slate-700"
                                  style={{ fontFamily: "Geist, monospace" }}
                                >
                                  {formatMoney(
                                    group.items.reduce(
                                      (sum, item) =>
                                        sum + (item.isFlatRate ? 1 : item.quantity) * item.unitPrice,
                                      0,
                                    ),
                                    itemSym,
                                  )}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ));
                      })()
                      : items.map((item, idx) => (
                          <tr
                            key={idx}
                            className={`border-b border-[#c6c6cd] ${idx % 2 === 1 ? "bg-[#f8fafc]" : ""}`}
                          >
                            <td className="py-2 px-3 border-r border-[#c6c6cd] text-center text-[#45464d]">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3 border-r border-[#c6c6cd] text-[12px] text-left">
                              <div className="font-bold text-left">{item.name}</div>
                            </td>
                            <td className={`py-2 px-3 ${isPricingHidden ? '' : 'border-r border-[#c6c6cd]'} text-right text-[12px]`}>
                              {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                            </td>
                            {!isPricingHidden && (
                              <>
                                <td className="py-2 px-3 border-r border-[#c6c6cd] text-right text-[12px]">
                                  {formatMoney(item.unitPrice, itemSym)}
                                </td>
                                <td className="py-2 px-3 text-right font-semibold text-[12px]">
                                  {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals - Only visible in Invoice Mode */}
              {!isPricingHidden && (
                <div className="flex justify-end mb-4">
                  <div className="w-full sm:w-1/2 md:w-1/3">
                    <div className="flex justify-between py-1.5 border-b border-dotted border-[#c6c6cd]">
                      <span className="text-[12px] font-bold text-[#45464d] uppercase">
                        Subtotal
                      </span>
                      <span
                        className="text-sm"
                        style={{ fontFamily: "Geist, monospace" }}
                      >
                        {formatMoney(subtotal, sym)}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between py-1.5 border-b border-dotted border-[#c6c6cd]">
                        <span className="text-[12px] font-bold text-[#45464d] uppercase">
                          Discount{" "}
                          {invoice.discount_type === "percentage"
                            ? `(${invoice.discount_value}%)`
                            : ""}
                        </span>
                        <span
                          className="text-sm text-red-600"
                          style={{ fontFamily: "Geist, monospace" }}
                        >
                          -{formatMoney(discountAmount, sym)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5 border-b border-dotted border-[#c6c6cd]">
                      <span className="text-[12px] font-bold text-[#45464d] uppercase">
                        Tax (0%)
                      </span>
                      <span
                        className="text-sm"
                        style={{ fontFamily: "Geist, monospace" }}
                      >
                        {formatMoney(0, sym)}
                      </span>
                    </div>
                    {shippingCost > 0 && (
                      <div className="flex justify-between py-1.5 border-b border-dotted border-[#c6c6cd]">
                        <span className="text-[12px] font-bold text-[#45464d] uppercase">
                          Shipping
                        </span>
                        <span
                          className="text-sm"
                          style={{ fontFamily: "Geist, monospace" }}
                        >
                          +{formatMoney(shippingCost, sym)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between py-2.5 border-b-2 border-black mt-1">
                      <span className="font-bold text-black uppercase text-sm">
                        Total Amount
                      </span>
                      <span
                        className="text-base font-bold text-black"
                        style={{ fontFamily: "Work Sans, sans-serif" }}
                      >
                        {formatMoney(total, sym)}
                      </span>
                    </div>
                    {amountPaid > 0 && !isQuotationDoc && (
                      <>
                        <div className="flex justify-between py-1.5 text-sm text-gray-500 font-medium">
                          <span>Paid</span>
                          <span>{formatMoney(amountPaid, sym)}</span>
                        </div>
                        <div className="flex justify-between py-2 mt-1 border-t-2 border-gray-800 text-sm font-bold text-gray-900">
                          <span>Balance Due</span>
                          <span>{formatMoney(balanceDue, sym)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Section: N.B. Note, Bank Details & Signature, Terms */}
              <div className="template-bottom-section">
                {/* N.B. Note - Immediately above bank details */}
                {noteText && (
                  <div className="border-t border-[#c6c6cd] pt-2 mt-2 mb-2 text-left print:pt-1.5 print:mt-1.5 print:mb-1.5 break-inside-avoid template-nb-note">
                    <div className="text-[11px] text-[#45464d] whitespace-pre-line" style={{ fontFamily: "Geist, monospace" }}>
                      <strong className="text-black">N.B:</strong> {noteText}
                    </div>
                  </div>
                )}

                {/* Bank Details & Signature Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2 border-t border-[#c6c6cd] pt-2.5 print:gap-2 print:mb-1.5 print:pt-2 items-start break-inside-avoid">
                {/* Bank Details - Only in Invoice Mode */}
                {!isPricingHidden && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) ? (
                  <div>
                    <h4 className="text-[12px] font-bold text-black uppercase tracking-wider mb-2">
                      Bank Details
                    </h4>
                    <div className="text-sm text-[#45464d] space-y-1">
                      <p>
                        <span className="font-semibold text-black">Bank:</span>{" "}
                        {invoice.bank_name || profile?.bank_name}
                      </p>
                      {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                        <p>
                          <span className="font-semibold text-black">Holder:</span>{" "}
                          {invoice.bank_account_holder || profile?.bank_account_holder}
                        </p>
                      )}
                      {(invoice.bank_account_number || profile?.bank_account_number) && (
                        <p>
                          <span className="font-semibold text-black">Account:</span>{" "}
                          {invoice.bank_account_number || profile?.bank_account_number}
                        </p>
                      )}
                      {(invoice.bank_swift || profile?.bank_swift) && (
                        <p>
                          <span className="font-semibold text-black">SWIFT/BIC:</span>{" "}
                          {invoice.bank_swift || profile?.bank_swift}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    {invoice.notes && (
                      <div>
                        <h4 className="text-[12px] font-bold text-black uppercase tracking-wider mb-1">
                          Notes
                        </h4>
                        <p className="text-xs text-[#45464d] whitespace-pre-line">
                          {invoice.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Signature / Acknowledgement */}
                <div className="flex flex-col items-end sm:items-end justify-end">
                  {(profile?.signature_enabled ?? true) &&
                    (invoice.signature_url ||
                      profile?.signature_url ||
                      invoice.signatory_name ||
                      profile?.signatory_name) && (
                      <div className="flex flex-col items-end">
                        {(invoice.signature_url || profile?.signature_url) && (
                          <img
                            src={
                              invoice.signature_url ||
                              profile?.signature_url ||
                              undefined
                            }
                            alt="Signature"
                            className="h-10 mb-2 object-contain"
                          />
                        )}
                        <div className="w-36 border-b border-[#c6c6cd] mb-1"></div>
                        <p className="text-[11px] text-[#76777d]">
                          {invoice.signatory_name ||
                            profile?.signatory_name ||
                            (isChallanDoc ? "Received By / Signatory" : "Authorized Signatory")}
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {/* Footer Terms */}
              {((invoice.terms_and_conditions_enabled ?? profile?.terms_and_conditions_enabled ?? true) && (invoice.terms_and_conditions || profile?.terms_and_conditions)) && (
                <div className="border-t border-[#c6c6cd] pt-2 mt-2 text-left print:pt-1.5 print:mt-1.5 break-inside-avoid">
                  <div
                    className="text-[11px] text-[#45464d] max-w-[500px] whitespace-pre-wrap"
                    style={{ fontFamily: "Geist, monospace" }}
                  >
                    <strong>Terms &amp; Conditions:</strong>
                    <br />
                    {invoice.terms_and_conditions || profile?.terms_and_conditions}
                  </div>
                </div>
              )}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
