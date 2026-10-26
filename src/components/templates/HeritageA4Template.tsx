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

export function HeritageA4Template({
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
  const clientLabel = isQuotationDoc ? "QUOTATION TO" : isChallanDoc ? "CHALLAN TO" : "BILL TO";

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
        className="min-h-screen py-4 bg-[#fdfaf5] text-[#451a03] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[148mm]"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        <div className="max-w-[148mm] w-full min-h-[210mm] mx-auto bg-[#fffefb] border-2 border-[#b45309] shadow-xs p-2.5 print:p-2 relative overflow-hidden print:shadow-none print:rounded-none print:border-none print:w-[148mm] print:max-w-[148mm] print:mx-0 print:min-h-[210mm] print:my-0 flex flex-col justify-between">
          <div>
            {/* Vintage border inner */}
            <div className="border border-[#d97706]/40 p-2 mb-2">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-[#b45309] pb-2 mb-2">
                <div className="flex-1 min-w-0">
                  {profile?.company_logo && (
                    <img
                      alt="Logo"
                      className="max-h-8 max-w-[130px] mb-1 object-contain"
                      src={profile.company_logo}
                    />
                  )}
                  <h1 className="text-sm font-bold text-[#451a03] leading-tight">
                    {profile?.company_name || "Your Company"}
                  </h1>
                  {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                    <p className="text-[9px] text-[#92400e] italic font-sans">
                      {invoice.brand_voice || profile?.brand_voice}
                    </p>
                  )}
                  <p className="text-[9px] text-[#78350f] whitespace-pre-line mt-0.5 leading-tight font-sans">
                    {profile?.company_address || ""}
                    {profile?.email ? ` • ${profile.email}` : ""}
                    {profile?.phone ? ` • ${profile.phone}` : ""}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <h2 className="text-base font-bold text-[#b45309] tracking-wider uppercase">
                    {docTitleUpper}
                  </h2>
                  <p className="text-[10px] font-mono text-[#78350f]">
                    #{invoice.invoiceNumber || invoice.id?.substring(0, 8).toUpperCase()}
                  </p>
                  <div className="text-[9px] text-[#78350f] mt-1 space-y-0.5 font-sans">
                    <p>Issued: {formatDate(issueDate)}</p>
                    {!isPricingHidden && !isQuotationDoc && <p>Due: {formatDate(dueDate)}</p>}
                  </div>
                  {!isPricingHidden && !isQuotationDoc && invoice.status && (
                    <div
                      className={`mt-1 inline-block px-1.5 py-0.2 rounded text-[8.5px] font-bold uppercase font-sans ${
                        invoice.status === "PAID"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      {invoice.status}
                    </div>
                  )}
                </div>
              </div>

              {/* Client Info */}
              <div className="flex justify-between items-start text-[9.5px] font-sans mb-1">
                <div>
                  <p className="text-[8.5px] text-[#b45309] uppercase font-bold tracking-wider">{clientLabel}</p>
                  <h3 className="font-bold text-[11px] text-[#451a03] font-serif">{invoice.clientName}</h3>
                  <p className="text-[#78350f] whitespace-pre-line leading-tight text-[9px]">
                    {invoice.clientAddress || invoice.clientPhone}
                  </p>
                </div>
              </div>
            </div>

            {/* Subject */}
            {subject && (
              <div className="mb-2 text-[9.5px] text-[#451a03] bg-[#fdf6ec] px-2 py-1 rounded border border-[#f59e0b]/30 flex items-center gap-1.5 font-sans">
                <span className="font-bold text-[#b45309] uppercase text-[8.5px]">Subject:</span>
                <span className="font-medium text-[#78350f] truncate">{subject}</span>
              </div>
            )}

            {/* Table */}
            <div className="mb-2 font-sans">
              <table className="w-full text-left border-collapse text-[9.5px]">
                <thead>
                  <tr className="border-b-2 border-[#b45309] text-[9px] uppercase tracking-wider text-[#b45309] font-bold font-serif bg-[#fef3c7]/30">
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
                <tbody className="divide-y divide-[#fde68a]">
                  {(() => {
                    return (invoice.groups || [{ items }]).map((group: any, gIdx: number) => (
                      <React.Fragment key={gIdx}>
                        {group.name && showGroups && (
                          <tr className="bg-[#fef3c7]/60">
                            <td colSpan={isPricingHidden ? 2 : 4} className="py-0.5 px-1.5 font-bold text-[9px] uppercase text-[#b45309] font-serif">
                              {group.name}
                            </td>
                          </tr>
                        )}
                        {group.items.map((item: any, iIdx: number) => {
                          const itemTotal = (item.isFlatRate ? 1 : item.quantity) * item.unitPrice;
                          return (
                            <tr key={iIdx} className="template-item-row hover:bg-[#fffbeb]">
                              <td className="py-1 px-1.5">
                                <span className="font-semibold text-[#451a03] leading-tight block">{item.name}</span>
                              </td>
                              <td className="py-1 px-1.5 text-center text-[#78350f] font-mono text-[9px]">
                                {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                              </td>
                              {!isPricingHidden && (
                                <>
                                  <td className="py-1 px-1.5 text-right text-[#78350f] font-mono text-[9px]">
                                    {formatMoney(item.unitPrice, itemSym)}
                                  </td>
                                  <td className="py-1 px-1.5 text-right font-mono text-[9px] font-bold text-[#451a03]">
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
              <div className="flex justify-end mb-2 font-sans template-totals-block">
                <div className="w-1/2 space-y-1 text-[9.5px]">
                  <div className="flex justify-between text-[#78350f]">
                    <span>Subtotal</span>
                    <span className="font-mono text-[#451a03]">{formatMoney(subtotal, sym)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#78350f]">
                      <span>Discount {invoice.discount_type === "percentage" ? `(${invoice.discount_value}%)` : ""}</span>
                      <span className="font-mono text-[#451a03]">-{formatMoney(discountAmount, sym)}</span>
                    </div>
                  )}
                  {shippingCost > 0 && (
                    <div className="flex justify-between text-[#78350f]">
                      <span>Shipping</span>
                      <span className="font-mono text-[#451a03]">+{formatMoney(shippingCost, sym)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-[#b45309] pt-1 flex justify-between font-bold text-xs bg-[#fffbeb] p-1 border border-[#b45309] text-[#451a03]">
                    <span className="font-serif">{isQuotationDoc ? "Quotation Total" : "Total"}</span>
                    <span className="font-mono">{formatMoney(total, sym)}</span>
                  </div>
                  {amountPaid > 0 && !isQuotationDoc && (
                    <>
                      <div className="flex justify-between text-[#78350f]">
                        <span>Paid</span>
                        <span className="font-mono text-emerald-800">{formatMoney(amountPaid, sym)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[10.5px] border-t border-[#fde68a] pt-0.5 text-[#b45309]">
                        <span>Balance Due</span>
                        <span className="font-mono">{formatMoney(balanceDue, sym)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom */}
          <div className="border-t-2 border-[#b45309] pt-2 font-sans template-bottom-section">
            {noteText && (
              <div className="mb-1 text-[9px] text-[#78350f] template-nb-note">
                <strong className="text-[#451a03]">N.B:</strong> {noteText}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 items-end">
              <div>
                {!isPricingHidden && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) && (
                  <div className="text-[8.5px] text-[#78350f] space-y-0.5">
                    <p className="font-bold text-[#451a03] uppercase">Bank Details</p>
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
                      <div className="w-28 border-b border-[#b45309] mb-0.5"></div>
                      <p className="text-[8.5px] text-[#78350f] font-serif">
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
      className="min-h-screen py-8 bg-[#fdfaf5] text-[#451a03] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
    >
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-[#fffefb] border-2 border-[#b45309] shadow-xl p-4 sm:p-5 print:p-4 relative overflow-hidden print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0 flex flex-col justify-between">
        <div>
          {/* Vintage border inner */}
          <div className="border border-[#d97706]/40 p-3 sm:p-4 mb-2.5">
            {/* Header */}
            <div className="flex flex-row print:flex-row justify-between items-start border-b-2 border-[#b45309] pb-2.5 mb-2.5">
              <div>
                {profile?.company_logo && (
                  <img
                    alt="Logo"
                    className="max-h-14 max-w-[180px] mb-1.5 object-contain w-auto h-auto"
                    src={profile.company_logo}
                  />
                )}
                <h1 className="text-xl font-bold tracking-wider uppercase text-[#78350f]">
                  {profile?.company_name || "Your Company"}
                </h1>
                {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                  <p className="text-[11px] text-[#92400e] italic mt-0.5">
                    {invoice.brand_voice || profile?.brand_voice}
                  </p>
                )}
                <div
                  className="text-[11px] text-[#92400e] whitespace-pre-line mt-0.5"
                  style={{ fontFamily: "Geist, serif" }}
                >
                  {profile?.company_address || ""}
                  {profile?.email ? ` • ${profile.email}` : ""}
                  {profile?.phone ? ` • ${profile.phone}` : ""}
                </div>
              </div>
              <div className="text-right print:text-right">
                <h2 className="text-2xl font-bold tracking-widest text-[#78350f] uppercase">
                  {docTitleUpper}
                </h2>
                <p
                  className="text-xs text-[#92400e] font-mono mt-0.5"
                  style={{ fontFamily: "Geist, monospace" }}
                >
                  N° {invoice.invoiceNumber}
                </p>
                {profile?.qr_code_enabled && publicUrl && (
                  <div className="mt-2 flex justify-end print:justify-end">
                    <QRCodeSVG value={publicUrl} size={44} />
                  </div>
                )}
              </div>
            </div>

            {/* Bill To & Dates */}
            <div className="grid grid-cols-2 gap-3 mb-2.5 pb-2 border-b border-[#d97706]/30">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#b45309] tracking-wider mb-1">
                  {clientLabel}
                </p>
                <p className="text-base font-bold text-[#78350f]">
                  {invoice.clientName}
                </p>
                <p
                  className="text-[11px] text-[#92400e] mt-0.5 whitespace-pre-line"
                  style={{ fontFamily: "Geist, serif" }}
                >
                  {invoice.clientAddress || invoice.clientPhone}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-right">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#b45309] tracking-wider mb-0.5">
                    DATE
                  </p>
                  <p
                    className="text-xs text-[#78350f]"
                    style={{ fontFamily: "Geist, monospace" }}
                  >
                    {formatDate(issueDate)}
                  </p>
                </div>
                {!isPricingHidden ? (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#b45309] tracking-wider mb-0.5">
                      DUE
                    </p>
                    <p
                      className="text-xs text-[#78350f] font-bold"
                      style={{ fontFamily: "Geist, monospace" }}
                    >
                      {formatDate(dueDate)}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#b45309] tracking-wider mb-0.5">
                      TYPE
                    </p>
                    <span className="text-xs text-[#78350f] font-bold">
                      {isQuotationDoc ? "Quotation" : "Delivery"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Subject */}
            {subject && (
              <div className="mb-3 px-3 py-1.5 bg-[#fef3c7]/50 border-l-4 border-[#b45309] text-xs text-[#78350f] flex items-center gap-2 rounded-r">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#b45309]">Subject:</span>
                <span className="font-semibold text-[#451a03]">{subject}</span>
              </div>
            )}

            {/* Items */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs min-w-[450px]">
                <thead>
                  <tr className="border-b-2 border-[#b45309]">
                    <th className="text-center py-2 px-3 text-[10px] font-bold uppercase text-[#78350f] tracking-wider w-12">
                      #
                    </th>
                    <th className="text-left py-2 px-3 text-[10px] font-bold uppercase text-[#78350f] tracking-wider">
                      Description
                    </th>
                    <th className={`text-right py-2 px-3 text-[10px] font-bold uppercase text-[#78350f] tracking-wider ${isPricingHidden ? 'w-32' : 'w-20'}`}>
                      Qty
                    </th>
                    {!isPricingHidden && (
                      <>
                        <th className="text-right py-2 px-3 text-[10px] font-bold uppercase text-[#78350f] tracking-wider w-24">
                          Rate
                        </th>
                        <th className="text-right py-2 px-3 text-[10px] font-bold uppercase text-[#78350f] tracking-wider w-28">
                          Amount
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
                              <tr className="bg-[#fef3c7]/60 font-bold">
                                <td
                                  colSpan={isPricingHidden ? 3 : 5}
                                  className="py-1 px-3 text-[11px] text-[#78350f] border-b border-[#d97706]/20 uppercase text-left"
                                  style={{ fontFamily: "'Playfair Display', serif" }}
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
                                  className="border-b border-[#d97706]/20 hover:bg-[#fef3c7]/30 transition-colors"
                                >
                                  <td className="py-2 px-3 text-center text-[#78350f] font-mono">
                                    {runningIdx}
                                  </td>
                                  <td
                                    className="py-2 px-3 text-[#451a03] text-left"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                  >
                                    {item.name}
                                  </td>
                                  <td className="py-2 px-3 text-right text-[#92400e]">
                                    {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                                  </td>
                                  {!isPricingHidden && (
                                    <>
                                      <td className="py-2 px-3 text-right text-[#92400e]">
                                        {formatMoney(item.unitPrice, itemSym)}
                                      </td>
                                      <td className="py-2 px-3 text-right font-semibold text-[#78350f]">
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
                                <td colSpan={4} className="py-1 px-3 text-[9px] font-medium text-[#b45309] uppercase text-right tracking-wide">
                                  Group Subtotal
                                </td>
                                <td className="py-1 px-3 text-right text-[10px] font-medium text-[#78350f]">
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
                          className="border-b border-[#d97706]/20 hover:bg-[#fef3c7]/30 transition-colors"
                        >
                          <td className="py-2 px-3 text-center text-[#78350f] font-mono">
                            {idx + 1}
                          </td>
                          <td
                            className="py-2 px-3 text-[#451a03] text-left"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {item.name}
                          </td>
                          <td className="py-2 px-3 text-right text-[#92400e]">
                            {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                          </td>
                          {!isPricingHidden && (
                            <>
                              <td className="py-2 px-3 text-right text-[#92400e]">
                                {formatMoney(item.unitPrice, itemSym)}
                              </td>
                              <td className="py-2 px-3 text-right font-semibold text-[#78350f]">
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
                <div className="w-64" style={{ fontFamily: "Geist, monospace" }}>
                  <div className="flex justify-between py-1 text-xs text-[#92400e]">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal, sym)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between py-1 text-xs text-[#92400e]">
                      <span>
                        Discount{" "}
                        {invoice.discount_type === "percentage"
                          ? `(${invoice.discount_value}%)`
                          : ""}
                      </span>
                      <span className="text-red-600">-{formatMoney(discountAmount, sym)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 text-xs text-[#92400e]">
                    <span>Tax (0%)</span>
                    <span>{formatMoney(0, sym)}</span>
                  </div>
                  {shippingCost > 0 && (
                    <div className="flex justify-between py-1 text-xs text-[#92400e]">
                      <span>Shipping</span>
                      <span>+{formatMoney(shippingCost, sym)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 border-t-2 border-[#b45309] mt-1 text-sm font-bold text-[#78350f]">
                    <span>{isQuotationDoc ? "TOTAL QUOTATION" : "TOTAL DUE"}</span>
                    <span>{formatMoney(total, sym)}</span>
                  </div>
                  {amountPaid > 0 && !isQuotationDoc && (
                    <>
                      <div className="flex justify-between py-1 text-xs text-[#92400e] font-medium">
                        <span>Paid</span>
                        <span>{formatMoney(amountPaid, sym)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-t border-[#d97706]/40 text-xs font-bold text-[#78350f]">
                        <span>Balance Due</span>
                        <span>{formatMoney(balanceDue, sym)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: N.B. Note, Bank Details & Signature, Terms */}
        <div className="w-full template-bottom-section">
          {/* N.B. Note - Immediately above bank details */}
          {noteText && (
            <div className="mb-3 pt-2 border-t border-[#d97706]/30 text-[10px] text-[#92400e] whitespace-pre-line text-left break-inside-avoid template-nb-note">
              <strong className="text-[#78350f]">N.B:</strong> {noteText}
            </div>
          )}

          {/* Bank Details & Signature Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t-2 border-[#b45309] pt-4 items-start">
            {/* Bank Details - Only in Invoice Mode */}
            {!isPricingHidden && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) ? (
              <div>
                <h4 className="text-[10px] uppercase font-bold text-[#b45309] tracking-wider mb-1">
                  PAYMENT INSTRUCTIONS
                </h4>
                <div
                  className="text-xs text-[#92400e] space-y-0.5"
                  style={{ fontFamily: "Geist, monospace" }}
                >
                  <p>
                    <span className="font-semibold text-[#78350f]">Bank:</span>{" "}
                    {invoice.bank_name || profile?.bank_name}
                  </p>
                  {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                    <p>
                      <span className="font-semibold text-[#78350f]">Holder:</span>{" "}
                      {invoice.bank_account_holder || profile?.bank_account_holder}
                    </p>
                  )}
                  {(invoice.bank_account_number || profile?.bank_account_number) && (
                    <p>
                      <span className="font-semibold text-[#78350f]">Account:</span>{" "}
                      {invoice.bank_account_number || profile?.bank_account_number}
                    </p>
                  )}
                  {(invoice.bank_swift || profile?.bank_swift) && (
                    <p>
                      <span className="font-semibold text-[#78350f]">SWIFT:</span>{" "}
                      {invoice.bank_swift || profile?.bank_swift}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {invoice.notes && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-[#b45309] tracking-wider mb-1">
                      NOTES
                    </h4>
                    <p className="text-xs text-[#92400e]">{invoice.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Signature */}
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
                        className="h-10 mb-2 object-contain"
                      />
                    )}
                    <div className="w-36 border-b border-[#b45309] mb-1"></div>
                    <p className="text-[11px] text-[#78350f] font-semibold">
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
            <div className="mt-2 pt-2 print:mt-1.5 print:pt-1 border-t border-[#d97706]/30 text-[10px] text-[#92400e] whitespace-pre-wrap break-inside-avoid">
              <p className="font-semibold text-[#78350f] mb-0.5">
                Terms & Conditions
              </p>
              <p>{invoice.terms_and_conditions || profile?.terms_and_conditions}</p>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
