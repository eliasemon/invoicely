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

export function PristineA4Template({
  invoice,
  profile,
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
  const docTitleUpper = isQuotationDoc ? "QUOTATION" : isChallanDoc ? "CHALLAN" : "INVOICE";
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
        className="min-h-screen py-4 bg-[#f8fafc] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[148mm]"
        style={{ fontFamily: "Geist, sans-serif" }}
      >
        <div className="max-w-[148mm] w-full min-h-[210mm] mx-auto bg-white text-[#0f172a] shadow-xs p-3 print:p-2.5 text-xs flex flex-col justify-between print:shadow-none print:rounded-none print:border-none print:w-[148mm] print:max-w-[148mm] print:mx-0 print:min-h-[210mm] print:my-0">
          <div>
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-2 mb-2">
              <div className="flex-1 min-w-0">
                {profile?.company_logo && (
                  <img
                    alt="Company Logo"
                    className="max-h-8 max-w-[130px] mb-1 object-contain"
                    src={profile.company_logo}
                  />
                )}
                <h1 className="text-xs font-bold text-[#0f172a] leading-tight">
                  {profile?.company_name || "Your Company"}
                </h1>
                {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                  <p className="text-[9px] text-[#64748b] italic">
                    {invoice.brand_voice || profile?.brand_voice}
                  </p>
                )}
                <p className="text-[9px] text-[#64748b] whitespace-pre-line mt-0.5 leading-tight">
                  {profile?.company_address || ""}
                  {profile?.email ? ` • ${profile.email}` : ""}
                  {profile?.phone ? ` • ${profile.phone}` : ""}
                </p>
              </div>

              <div className="text-right shrink-0 flex flex-col items-end">
                <h2 className="text-sm font-bold text-[#0f172a] uppercase tracking-tight">
                  {docTitleUpper}
                </h2>
                <p className="text-[9.5px] font-mono text-[#64748b]">
                  #{invoice.invoiceNumber || invoice.id?.substring(0, 8).toUpperCase()}
                </p>
                {profile?.qr_code_enabled && publicUrl && (
                  <div className="mt-1">
                    <QRCodeSVG value={publicUrl} size={40} />
                  </div>
                )}
                {!isPricingHidden && !isQuotationDoc && invoice.status && (
                  <div
                    className={`mt-1 px-1.5 py-0.2 rounded text-[8.5px] font-bold uppercase ${
                      invoice.status === "PAID"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {invoice.status}
                  </div>
                )}
              </div>
            </div>

            {/* Client Info & Meta */}
            <div className="grid grid-cols-2 gap-2 mb-2 p-2 bg-[#f8fafc] rounded border border-[#e2e8f0] text-[9.5px]">
              <div>
                <p className="text-[8.5px] text-[#94a3b8] uppercase font-bold">{clientLabel}</p>
                <h3 className="font-bold text-[11px] text-[#0f172a] mt-0.5">{invoice.clientName}</h3>
                <p className="text-[#64748b] whitespace-pre-line leading-tight text-[9px]">
                  {invoice.clientAddress || invoice.clientPhone}
                </p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-[8.5px] text-[#94a3b8] uppercase font-bold">Details</p>
                <p className="text-[#475569]">Issued: <span className="font-medium">{formatDate(issueDate)}</span></p>
                {!isPricingHidden && !isQuotationDoc && (
                  <p className="text-[#475569]">Due: <span className="font-medium">{formatDate(dueDate)}</span></p>
                )}
              </div>
            </div>

            {/* Subject */}
            {subject && (
              <div className="mb-2 text-[9.5px] text-[#45464d] bg-[#f8fafc] px-2 py-1 rounded border border-[#e2e8f0] flex items-center gap-1.5">
                <span className="font-bold text-[#0f172a] uppercase text-[8.5px]">Subject:</span>
                <span className="font-medium text-[#334155] truncate">{subject}</span>
              </div>
            )}

            {/* Table */}
            <div className="mb-2">
              <table className="w-full text-left border-collapse text-[9.5px]">
                <thead>
                  <tr className="border-b border-[#e2e8f0] text-[9px] uppercase tracking-wider text-[#64748b] font-semibold bg-[#f8fafc]">
                    <th className="py-1 px-1.5">Item</th>
                    <th className="py-1 px-1.5 text-center w-12">Qty</th>
                    {!isPricingHidden && (
                      <>
                        <th className="py-1 px-1.5 text-right w-14">Price</th>
                        <th className="py-1 px-1.5 text-right w-16">Total</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {(() => {
                    return (invoice.groups || [{ items }]).map((group: any, gIdx: number) => (
                      <React.Fragment key={gIdx}>
                        {group.name && showGroups && (
                          <tr className="bg-[#f1f5f9]">
                            <td colSpan={isPricingHidden ? 2 : 4} className="py-0.5 px-1.5 font-bold text-[9px] uppercase text-[#0f172a]">
                              {group.name}
                            </td>
                          </tr>
                        )}
                        {group.items.map((item: any, iIdx: number) => {
                          const itemTotal = (item.isFlatRate ? 1 : item.quantity) * item.unitPrice;
                          return (
                            <tr key={iIdx} className="template-item-row hover:bg-[#f8fafc]">
                              <td className="py-1 px-1.5">
                                <span className="font-semibold text-[#0f172a] leading-tight block">{item.name}</span>
                              </td>
                              <td className="py-1 px-1.5 text-center text-[#64748b] font-mono text-[9px]">
                                {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                              </td>
                              {!isPricingHidden && (
                                <>
                                  <td className="py-1 px-1.5 text-right text-[#64748b] font-mono text-[9px]">
                                    {formatMoney(item.unitPrice, itemSym)}
                                  </td>
                                  <td className="py-1 px-1.5 text-right font-mono text-[9px] font-bold text-[#0f172a]">
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
                  <div className="flex justify-between text-[#64748b]">
                    <span>Subtotal</span>
                    <span className="font-mono text-[#0f172a]">{formatMoney(subtotal, sym)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#64748b]">
                      <span>Discount {invoice.discount_type === "percentage" ? `(${invoice.discount_value}%)` : ""}</span>
                      <span className="font-mono text-[#0f172a]">-{formatMoney(discountAmount, sym)}</span>
                    </div>
                  )}
                  {shippingCost > 0 && (
                    <div className="flex justify-between text-[#64748b]">
                      <span>Shipping</span>
                      <span className="font-mono text-[#0f172a]">+{formatMoney(shippingCost, sym)}</span>
                    </div>
                  )}
                  <div className="border-t border-[#0f172a] pt-1 flex justify-between font-bold text-xs bg-[#0f172a] text-white p-1 rounded">
                    <span>{isQuotationDoc ? "Quotation Total" : "Total"}</span>
                    <span className="font-mono">{formatMoney(total, sym)}</span>
                  </div>
                  {amountPaid > 0 && !isQuotationDoc && (
                    <>
                      <div className="flex justify-between text-[#64748b]">
                        <span>Paid</span>
                        <span className="font-mono text-emerald-700">{formatMoney(amountPaid, sym)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[10.5px] border-t border-[#e2e8f0] pt-0.5 text-[#0f172a]">
                        <span>Due</span>
                        <span className="font-mono">{formatMoney(balanceDue, sym)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom */}
          <div className="border-t border-[#e2e8f0] pt-2 template-bottom-section">
            {noteText && (
              <div className="mb-1 text-[9px] text-[#64748b] template-nb-note">
                <strong className="text-black">N.B:</strong> {noteText}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 items-end">
              <div>
                {!isPricingHidden && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) && (
                  <div className="text-[8.5px] text-[#64748b] space-y-0.5">
                    <p className="font-bold text-[#0f172a] uppercase">Bank Details</p>
                    <p>{invoice.bank_name || profile?.bank_name}</p>
                    {(invoice.bank_account_number || profile?.bank_account_number) && (
                      <p className="font-mono">A/C: {invoice.bank_account_number || profile?.bank_account_number}</p>
                    )}
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
                      <div className="w-28 border-b border-[#cbd5e1] mb-0.5"></div>
                      <p className="text-[8.5px] text-[#64748b]">
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
      className="min-h-screen py-8 bg-[#f8fafc] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Geist, sans-serif" }}
    >
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white text-[#0f172a] shadow-sm p-4 sm:p-5 print:p-4 text-xs flex flex-col justify-between print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        <div>
          {/* Header */}
          <div className="flex flex-row print:flex-row justify-between items-start border-b border-gray-100 pb-2.5 mb-2.5">
            <div>
              {profile?.company_logo && (
                <img
                  alt="Company Logo"
                  className="max-h-12 max-w-[180px] mb-1.5 object-contain w-auto h-auto"
                  src={profile.company_logo}
                />
              )}
              <h1 className="text-base font-bold text-[#0f172a]">
                {profile?.company_name || "Your Company"}
              </h1>
              {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                <p className="text-[11px] text-[#64748b] italic mt-0.5">
                  {invoice.brand_voice || profile?.brand_voice}
                </p>
              )}
              <p className="text-[11px] text-[#64748b] whitespace-pre-line mt-1">
                {profile?.company_address || ""}
                {profile?.email ? ` • ${profile.email}` : ""}
                {profile?.phone ? ` • ${profile.phone}` : ""}
              </p>
            </div>
            <div className="text-right print:text-right">
              <h2 className="text-xl font-bold tracking-tight text-[#0f172a] uppercase">
                {docTitleUpper}
              </h2>
              <p className="text-xs font-mono text-[#64748b] mt-0.5">
                #{invoice.invoiceNumber}
              </p>
              {profile?.qr_code_enabled && publicUrl && (
                <div className="mt-3 flex justify-end print:justify-end">
                  <QRCodeSVG value={publicUrl} size={44} />
                </div>
              )}
            </div>
          </div>

          {/* Client & Meta */}
          <div className="grid grid-cols-2 gap-3 mb-2.5 p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider mb-1">
                {clientLabel}
              </p>
              <p className="font-bold text-[#0f172a] text-sm">
                {invoice.clientName}
              </p>
              <p className="text-[11px] text-[#64748b] mt-0.5 whitespace-pre-line">
                {invoice.clientAddress || invoice.clientPhone}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-right">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider mb-1">
                  Issued
                </p>
                <p className="font-mono text-xs text-[#0f172a]">
                  {formatDate(issueDate)}
                </p>
              </div>
              {!isPricingHidden && !isQuotationDoc ? (
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider mb-1">
                    Due
                  </p>
                  <p className="font-mono text-xs font-semibold text-[#0f172a]">
                    {formatDate(dueDate)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider mb-1">
                    Type
                  </p>
                  <span className="text-xs font-semibold text-blue-700">
                    {isQuotationDoc ? "Quotation" : "Delivery"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Subject */}
          {subject && (
            <div className="mb-3 px-3 py-1.5 bg-slate-50 border-l-4 border-slate-700 text-xs text-slate-800 flex items-center gap-2 rounded-r">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Subject:</span>
              <span className="font-semibold text-slate-900">{subject}</span>
            </div>
          )}

          {/* Items */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-xs min-w-[450px]">
              <thead>
                <tr className="border-b border-[#0f172a] bg-[#f8fafc]">
                  <th className="text-center py-2 px-3 text-[10px] font-semibold uppercase text-[#475569] tracking-wider w-12">
                    #
                  </th>
                  <th className="text-left py-2 px-3 text-[10px] font-semibold uppercase text-[#475569] tracking-wider">
                    Description
                  </th>
                  <th className={`text-right py-2 px-3 text-[10px] font-semibold uppercase text-[#475569] tracking-wider ${isPricingHidden ? 'w-32' : 'w-20'}`}>
                    Qty
                  </th>
                  {!isPricingHidden && (
                    <>
                      <th className="text-right py-2 px-3 text-[10px] font-semibold uppercase text-[#475569] tracking-wider w-24">
                        Rate
                      </th>
                      <th className="text-right py-2 px-3 text-[10px] font-semibold uppercase text-[#475569] tracking-wider w-28">
                        Amount
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="font-mono">
                {showGroups && invoice.groups && invoice.groups.length > 0
                  ? (() => {
                      let runningIdx = 0;
                      return invoice.groups.map((group, gIdx) => (
                        <React.Fragment key={gIdx}>
                          {group.name && (
                            <tr className="bg-slate-100 font-bold">
                              <td
                                colSpan={isPricingHidden ? 3 : 5}
                                className="py-1 px-3 text-[10px] text-[#0f172a] border-b border-[#cbd5e1] uppercase text-left"
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
                                className="border-b border-gray-100 hover:bg-[#f8fafc] transition-colors"
                              >
                                <td className="py-2 px-3 text-center text-[#475569] font-mono">
                                  {runningIdx}
                                </td>
                                <td
                                  className="py-2 px-3 text-[#0f172a] text-left"
                                  style={{ fontFamily: "Geist, sans-serif" }}
                                >
                                  {item.name}
                                </td>
                                <td className="py-2 px-3 text-right text-[#475569]">
                                  {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                                </td>
                                {!isPricingHidden && (
                                  <>
                                    <td className="py-2 px-3 text-right text-[#475569]">
                                      {formatMoney(item.unitPrice, itemSym)}
                                    </td>
                                    <td className="py-2 px-3 text-right font-semibold text-[#0f172a]">
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
                            <tr className="bg-transparent">
                              <td colSpan={4} className="py-1 px-3 text-[9px] font-medium text-slate-400 uppercase text-right tracking-wide">
                                Group Subtotal
                              </td>
                              <td
                                className="py-1 px-3 text-right text-[10px] font-medium text-slate-500"
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
                        className="border-b border-gray-100 hover:bg-[#f8fafc] transition-colors"
                      >
                        <td className="py-2 px-3 text-center text-[#475569] font-mono">
                          {idx + 1}
                        </td>
                        <td
                          className="py-2 px-3 text-[#0f172a] text-left"
                          style={{ fontFamily: "Geist, sans-serif" }}
                        >
                          {item.name}
                        </td>
                        <td className="py-2 px-3 text-right text-[#475569]">
                          {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                        </td>
                        {!isPricingHidden && (
                          <>
                            <td className="py-2 px-3 text-right text-[#475569]">
                              {formatMoney(item.unitPrice, itemSym)}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-[#0f172a]">
                              {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Totals - Only in Invoice Mode */}
          {!isPricingHidden && (
            <div className="flex justify-end mb-4">
              <div className="w-64">
                <div className="flex justify-between py-1 text-xs text-[#64748b] font-mono">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal, sym)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between py-1 text-xs text-[#64748b] font-mono">
                    <span>
                      Discount{" "}
                      {invoice.discount_type === "percentage"
                        ? `(${invoice.discount_value}%)`
                        : ""}
                    </span>
                    <span className="text-red-600">-{formatMoney(discountAmount, sym)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 text-xs text-[#64748b] font-mono">
                  <span>Tax (0%)</span>
                  <span>{formatMoney(0, sym)}</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between py-1 text-xs text-[#64748b] font-mono">
                    <span>Shipping</span>
                    <span>+{formatMoney(shippingCost, sym)}</span>
                  </div>
                )}

                <div className="flex justify-between py-1.5 border-t border-[#0f172a] mt-1 text-xs font-bold text-[#0f172a] font-mono">
                  <span>{isQuotationDoc ? "Quotation Total" : "Total"}</span>
                  <span>{formatMoney(total, sym)}</span>
                </div>
                {amountPaid > 0 && !isQuotationDoc && (
                  <>
                    <div className="flex justify-between py-1 text-xs text-gray-500 font-medium">
                      <span>Paid</span>
                      <span>{formatMoney(amountPaid, sym)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-t border-gray-400 text-xs font-bold text-gray-900">
                      <span>Due</span>
                      <span>{formatMoney(balanceDue, sym)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bank & Signature */}
        <div className="template-bottom-section">
          {/* N.B. Note - Immediately above bank details */}
          {noteText && (
            <div className="mb-3 pt-2 border-t border-gray-200 text-[10px] text-[#64748b] whitespace-pre-line text-left break-inside-avoid template-nb-note">
              <strong className="text-[#0f172a]">N.B:</strong> {noteText}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 pt-4 items-start">
            {/* Bank Details - Only in Invoice Mode */}
            {!isPricingHidden && !isQuotationDoc && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) ? (
              <div className="text-[11px] text-[#475569] space-y-1 font-mono">
                <p className="font-bold text-[#0f172a] uppercase tracking-wider text-[10px]">Bank Details</p>
                <p>Bank: {invoice.bank_name || profile?.bank_name}</p>
                {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                  <p>Holder: {invoice.bank_account_holder || profile?.bank_account_holder}</p>
                )}
                {(invoice.bank_account_number || profile?.bank_account_number) && (
                  <p>Account: {invoice.bank_account_number || profile?.bank_account_number}</p>
                )}
                {(invoice.bank_swift || profile?.bank_swift) && (
                  <p>SWIFT: {invoice.bank_swift || profile?.bank_swift}</p>
                )}
              </div>
            ) : (
              <div>
                {invoice.notes && (
                  <div className="text-[11px] text-[#64748b]">
                    <p className="font-bold text-[#0f172a] uppercase tracking-wider text-[10px] mb-0.5">Notes</p>
                    <p>{invoice.notes}</p>
                  </div>
                )}
              </div>
            )}

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
                        className="h-8 mb-1 object-contain"
                      />
                    )}
                    <div className="w-32 border-b border-[#0f172a] mb-1"></div>
                    <p className="text-[10px] text-[#64748b] font-semibold">
                      {invoice.signatory_name ||
                        profile?.signatory_name ||
                        (isChallanDoc ? "Received By" : "Authorized Signatory")}
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Footer Terms */}
          {((invoice.terms_and_conditions_enabled ?? profile?.terms_and_conditions_enabled ?? true) && (invoice.terms_and_conditions || profile?.terms_and_conditions)) && (
            <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-[#64748b] whitespace-pre-wrap break-inside-avoid">
              <span className="font-semibold text-[#0f172a]">Terms: </span>
              {invoice.terms_and_conditions || profile?.terms_and_conditions}
            </div>
          )}


        </div>
      </div>
    </div>
  );
}
