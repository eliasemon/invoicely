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

export function ModernPurpleTemplate({
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
  const tax = 0;
  const amountPaid = getAmountPaid(invoice);
  const balanceDue = Math.max(0, total - amountPaid);
  const items = getAllItems(invoice);
  const subject = getSubjectForDoc(invoice, documentType);
  const noteText = getNoteText(invoice);

  const isA5 = paperSize === 'a5';

  if (isA5) {
    return (
      <div
        className="min-h-screen py-4 bg-[#fdf8f6] text-gray-900 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[148mm]"
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        <div className="max-w-[148mm] w-full min-h-[210mm] mx-auto bg-white rounded-2xl shadow-md overflow-hidden print:shadow-none print:rounded-none print:border-none print:w-[148mm] print:max-w-[148mm] print:mx-0 print:min-h-[210mm] print:my-0 flex flex-col justify-between text-[10px]">
          <div>
            {/* Header */}
            <div className="bg-[#6b21a8] text-white p-3 print:p-3 relative overflow-hidden">
              <div className="flex flex-row justify-between items-start gap-2 relative z-10">
                <div>
                  {profile?.company_logo && (
                    <img
                      alt="Company Logo"
                      className="max-h-8 max-w-[140px] mb-1.5 object-contain bg-white/10 p-1 rounded-lg w-auto h-auto"
                      src={profile.company_logo}
                    />
                  )}
                  <h1 className="text-sm font-bold tracking-tight">
                    {profile?.company_name || "Your Company"}
                  </h1>
                  {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                    <p className="text-[8.5px] text-purple-200 italic mt-0.5">
                      {invoice.brand_voice || profile?.brand_voice}
                    </p>
                  )}
                  <p className="text-[8px] text-purple-100 mt-0.5 whitespace-pre-line leading-relaxed">
                    {profile?.company_address}
                    {profile?.email ? ` • ${profile.email}` : ""}
                    {profile?.phone ? ` • ${profile.phone}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-base font-black tracking-wider uppercase">
                    {docTitleUpper}
                  </h2>
                  <p className="text-[9px] font-mono text-purple-200 mt-0.5">
                    #{invoice.invoiceNumber}
                  </p>
                  <div className="mt-1.5 inline-block bg-white/10 px-2 py-0.5 rounded text-[8.5px] font-medium backdrop-blur-sm">
                    {formatDate(issueDate)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 print:p-3 space-y-2.5">
              {/* Subject */}
              {subject && (
                <div className="bg-purple-50/60 p-2 rounded-lg border-l-2 border-[#6b21a8] text-[9px]">
                  <span className="font-bold text-[#6b21a8] mr-1 uppercase text-[8px]">Subject:</span>
                  <span className="text-gray-800 font-medium">{subject}</span>
                </div>
              )}

              {/* Client & Dates Grid */}
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div className="bg-gray-50/70 p-2 rounded-xl border border-gray-100">
                  <span className="text-[8px] font-bold text-[#6b21a8] uppercase tracking-wider block mb-1">
                    {clientLabel}
                  </span>
                  <h3 className="font-bold text-gray-900 text-[10px] leading-tight">
                    {invoice.clientName}
                  </h3>
                  {invoice.clientAddress && (
                    <p className="text-gray-500 whitespace-pre-line mt-0.5 text-[8.5px] leading-tight">
                      {invoice.clientAddress}
                    </p>
                  )}
                  {invoice.clientEmail && <p className="text-gray-500 mt-0.5 text-[8.5px]">{invoice.clientEmail}</p>}
                  {invoice.clientPhone && <p className="text-gray-500 text-[8.5px]">{invoice.clientPhone}</p>}
                </div>

                <div className="bg-purple-50/50 p-2 rounded-xl border border-purple-100/50 flex flex-col justify-between">
                  <div className="space-y-1">
                    {dueDate && (
                      <div className="flex justify-between text-[8.5px]">
                        <span className="text-gray-500 font-medium">Due Date:</span>
                        <span className="font-bold text-[#6b21a8]">{formatDate(dueDate)}</span>
                      </div>
                    )}
                    {(invoice as any).po_number && (
                      <div className="flex justify-between text-[8.5px]">
                        <span className="text-gray-500 font-medium">PO Number:</span>
                        <span className="font-mono text-gray-800">{(invoice as any).po_number}</span>
                      </div>
                    )}
                    {(invoice as any).payment_terms && (
                      <div className="flex justify-between text-[8.5px]">
                        <span className="text-gray-500 font-medium">Terms:</span>
                        <span className="text-gray-800">{(invoice as any).payment_terms}</span>
                      </div>
                    )}
                  </div>
                  {!isPricingHidden && (
                    <div className="pt-1.5 border-t border-purple-100 flex justify-between items-center text-[9px]">
                      <span className="font-bold text-gray-700">Total Due:</span>
                      <span className="text-xs font-bold text-[#6b21a8] font-mono">
                        {formatMoney(balanceDue > 0 ? balanceDue : total, sym)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse text-[9px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-500 font-bold uppercase text-[8px] tracking-wider">
                      <th className="py-1 px-2 w-6 text-center">#</th>
                      <th className="py-1 px-2">Description</th>
                      <th className="py-1 px-2 text-center w-12">Qty</th>
                      {!isPricingHidden && (
                        <>
                          <th className="py-1 px-2 text-right w-16">Price</th>
                          <th className="py-1 px-2 text-right w-16">Total</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {showGroups && invoice.groups && invoice.groups.length > 0
                      ? (() => {
                          let runningIdx = 0;
                          return invoice.groups.map((group, gIdx) => (
                            <React.Fragment key={gIdx}>
                              {group.name && (
                                <tr className="bg-purple-50/50">
                                  <td colSpan={isPricingHidden ? 3 : 5} className="py-0.5 px-2 font-bold text-[#6b21a8] text-[8px]">
                                    {group.name}
                                  </td>
                                </tr>
                              )}
                              {group.items.map((item, iIdx) => {
                                runningIdx++;
                                return (
                                  <tr key={iIdx} className="hover:bg-gray-50/50">
                                    <td className="py-1 px-2 text-center text-gray-400 font-mono text-[8px]">{runningIdx}</td>
                                    <td className="py-1 px-2 font-medium text-gray-800">
                                      <p className="leading-tight">{item.name}</p>
                                      {(item as any).description && (
                                        <p className="text-[7.5px] text-gray-400 leading-tight">{(item as any).description}</p>
                                      )}
                                    </td>
                                    <td className="py-1 px-2 text-center text-gray-600">
                                      {item.isFlatRate ? "Flat" : `${item.quantity} ${item.unit || ''}`.trim()}
                                    </td>
                                    {!isPricingHidden && (
                                      <>
                                        <td className="py-1 px-2 text-right text-gray-600 font-mono">
                                          {formatMoney(item.unitPrice, itemSym)}
                                        </td>
                                        <td className="py-1 px-2 text-right font-medium text-gray-900 font-mono">
                                          {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                );
                              })}
                              {showGroupTotals && !isPricingHidden && (
                                <tr className="bg-gray-50 text-[8px]">
                                  <td colSpan={4} className="py-0.5 px-2 text-right font-bold text-gray-500 uppercase">
                                    {group.name} Subtotal:
                                  </td>
                                  <td className="py-0.5 px-2 text-right font-bold text-[#6b21a8] font-mono">
                                    {formatMoney(
                                      group.items.reduce(
                                        (acc, item) => acc + (item.isFlatRate ? 1 : item.quantity) * item.unitPrice,
                                        0
                                      ),
                                      sym
                                    )}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ));
                        })()
                      : items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="py-1 px-2 text-center text-gray-400 font-mono text-[8px]">{idx + 1}</td>
                            <td className="py-1 px-2 font-medium text-gray-800">
                              <p className="leading-tight">{item.name}</p>
                              {(item as any).description && (
                                <p className="text-[7.5px] text-gray-400 leading-tight">{(item as any).description}</p>
                              )}
                            </td>
                            <td className="py-1 px-2 text-center text-gray-600">
                              {item.isFlatRate ? "Flat" : `${item.quantity} ${item.unit || ''}`.trim()}
                            </td>
                            {!isPricingHidden && (
                              <>
                                <td className="py-1 px-2 text-right text-gray-600 font-mono">
                                  {formatMoney(item.unitPrice, itemSym)}
                                </td>
                                <td className="py-1 px-2 text-right font-medium text-gray-900 font-mono">
                                  {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Box for non-pricing hidden */}
              {!isPricingHidden && (
                <div className="flex justify-end pt-1">
                  <div className="w-48 space-y-0.5 text-[8.5px] bg-gray-50/60 p-2 rounded-xl border border-gray-100">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-mono">{formatMoney(subtotal, sym)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Discount:</span>
                        <span className="font-mono">-{formatMoney(discountAmount, sym)}</span>
                      </div>
                    )}
                    {shippingCost > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping:</span>
                        <span className="font-mono">{formatMoney(shippingCost, sym)}</span>
                      </div>
                    )}
                    <div className="border-t border-purple-200 pt-1 mt-1 flex justify-between font-bold text-xs text-[#6b21a8]">
                      <span>{isQuotationDoc ? "Quotation Total" : "Total"}</span>
                      <span className="font-mono">{formatMoney(total, sym)}</span>
                    </div>
                    {amountPaid > 0 && !isQuotationDoc && (
                      <>
                        <div className="flex justify-between text-gray-500 pt-0.5 text-[8px]">
                          <span>Paid:</span>
                          <span className="font-mono">{formatMoney(amountPaid, sym)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 text-[8.5px]">
                          <span>Balance:</span>
                          <span className="font-mono">{formatMoney(balanceDue, sym)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Notes, Bank, Signature, Terms */}
          <div className="p-3 print:p-3 pt-0 text-[8.5px]">
            {noteText && (
              <div className="mb-2 pt-1 border-t border-purple-100 text-[8px] text-gray-500 whitespace-pre-line">
                <strong className="text-gray-800">N.B:</strong> {noteText}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 border-t border-purple-100 pt-2 items-start">
              {!isPricingHidden && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) ? (
                <div className="text-[8px] text-gray-600 space-y-0.5">
                  <p className="font-bold text-[#6b21a8] uppercase text-[7.5px]">Bank Transfer</p>
                  <p>Bank: {invoice.bank_name || profile?.bank_name}</p>
                  {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                    <p>Holder: {invoice.bank_account_holder || profile?.bank_account_holder}</p>
                  )}
                  {(invoice.bank_account_number || profile?.bank_account_number) && (
                    <p>Acc: {invoice.bank_account_number || profile?.bank_account_number}</p>
                  )}
                  {(invoice.bank_swift || profile?.bank_swift) && (
                    <p>SWIFT: {invoice.bank_swift || profile?.bank_swift}</p>
                  )}
                </div>
              ) : (
                <div>
                  {invoice.notes && (
                    <div className="text-[8px] text-gray-600">
                      <p className="font-bold text-[#6b21a8] uppercase text-[7.5px] mb-0.5">Note</p>
                      <p>{invoice.notes}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col items-end text-right">
                {(profile?.signature_enabled ?? true) &&
                  (invoice.signature_url ||
                    profile?.signature_url ||
                    invoice.signatory_name ||
                    profile?.signatory_name) && (
                    <div className="flex flex-col items-end">
                      {(invoice.signature_url || profile?.signature_url) && (
                        <img
                          src={invoice.signature_url || profile?.signature_url || undefined}
                          alt="Signature"
                          className="h-7 mb-0.5 object-contain"
                        />
                      )}
                      <div className="w-24 border-b border-[#6b21a8] mb-0.5"></div>
                      <p className="text-[7.5px] text-gray-600 font-semibold">
                        {invoice.signatory_name ||
                          profile?.signatory_name ||
                          (isChallanDoc ? "Received By" : "Authorized Signatory")}
                      </p>
                    </div>
                  )}
              </div>
            </div>

            {((invoice.terms_and_conditions_enabled ?? profile?.terms_and_conditions_enabled ?? true) && (invoice.terms_and_conditions || profile?.terms_and_conditions)) && (
              <div className="mt-1.5 pt-1 border-t border-purple-100 text-[7.5px] text-gray-400 whitespace-pre-wrap">
                <p className="font-semibold text-gray-600">Terms & Conditions:</p>
                <p>{invoice.terms_and_conditions || profile?.terms_and_conditions}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 bg-[#fdf8f6] text-gray-900 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Outfit, sans-serif" }}
    >
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white rounded-3xl shadow-xl overflow-hidden print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="bg-[#6b21a8] text-white p-5 sm:p-6 print:p-4 relative overflow-hidden">
            <div className="flex flex-row print:flex-row justify-between items-start gap-4 relative z-10">
              <div>
                {profile?.company_logo && (
                  <img
                    alt="Company Logo"
                    className="max-h-12 max-w-[180px] mb-2 object-contain bg-white/10 p-1.5 rounded-xl w-auto h-auto"
                    src={profile.company_logo}
                  />
                )}
                <h1 className="text-xl font-bold tracking-tight">
                  {profile?.company_name || "Your Company"}
                </h1>
                {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                  <p className="text-xs text-purple-200 italic mt-0.5">
                    {invoice.brand_voice || profile?.brand_voice}
                  </p>
                )}
                <p className="text-xs text-purple-100 mt-1 whitespace-pre-line leading-relaxed">
                  {profile?.company_address}
                  {profile?.email ? ` • ${profile.email}` : ""}
                  {profile?.phone ? ` • ${profile.phone}` : ""}
                </p>
              </div>
              <div className="text-right print:text-right">
                <h2 className="text-2xl font-bold tracking-wider uppercase">
                  {docTitleUpper}
                </h2>
                <p className="text-xs font-mono text-purple-200 mt-1">
                  #{invoice.invoiceNumber}
                </p>
                {profile?.qr_code_enabled && publicUrl && (
                  <div className="mt-2 flex justify-end print:justify-end">
                    <div className="bg-white p-1 rounded-lg">
                      <QRCodeSVG value={publicUrl} size={44} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Client & Dates */}
          <div className="p-4 sm:p-5 print:p-4 pb-0">
            <div className="grid grid-cols-2 gap-3 mb-2.5 p-3 bg-purple-50/50 rounded-2xl border border-purple-100">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#6b21a8] tracking-wider mb-1">
                  {clientLabel}
                </p>
                <p className="font-bold text-gray-900 text-sm">{invoice.clientName}</p>
                <p className="text-xs text-gray-600 whitespace-pre-line mt-0.5">
                  {invoice.clientAddress || invoice.clientPhone}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-right">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#6b21a8] tracking-wider mb-1">
                    Issued
                  </p>
                  <p className="text-xs font-mono text-gray-800">{formatDate(issueDate)}</p>
                </div>
                {!isPricingHidden ? (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#6b21a8] tracking-wider mb-1">
                      Due
                    </p>
                    <p className="text-xs font-mono text-gray-800 font-semibold">{formatDate(dueDate)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#6b21a8] tracking-wider mb-1">
                      Type
                    </p>
                    <span className="text-xs font-semibold text-purple-800">
                      {isQuotationDoc ? "Quotation" : "Delivery"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Subject */}
            {subject && (
              <div className="mb-4 px-3 py-1.5 bg-purple-50/60 border-l-4 border-[#6b21a8] text-xs text-purple-950 flex items-center gap-2 rounded-r">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#6b21a8]">Subject:</span>
                <span className="font-semibold text-gray-900">{subject}</span>
              </div>
            )}

            {/* Line Items */}
            <div className="mb-6">
              <div className="grid grid-cols-12 gap-4 pb-2 border-b-2 border-purple-200 text-xs font-bold uppercase tracking-wider text-[#6b21a8]">
                <div className="col-span-1 text-center">#</div>
                <div className={`${isPricingHidden ? "col-span-7" : "col-span-5"} text-left`}>DESCRIPTION</div>
                <div className={`${isPricingHidden ? "col-span-4" : "col-span-2"} text-right`}>QTY</div>
                {!isPricingHidden && (
                  <>
                    <div className="col-span-2 text-right">PRICE</div>
                    <div className="col-span-2 text-right">TOTAL</div>
                  </>
                )}
              </div>

              {showGroups && invoice.groups && invoice.groups.length > 0
                ? (() => {
                    let runningIdx = 0;
                    return invoice.groups.map((group, gIdx) => (
                      <div key={gIdx} className="mb-4">
                        {group.name && (
                          <div className="py-1.5 text-xs font-bold text-[#6b21a8] bg-purple-50 px-2 my-1 rounded uppercase">
                            {group.name}
                          </div>
                        )}
                        {group.items.map((item, iIdx) => {
                          runningIdx++;
                          return (
                            <div
                              key={iIdx}
                              className="template-item-row grid grid-cols-12 gap-4 py-2 border-b border-gray-100 text-xs items-center"
                            >
                              <div className="col-span-1 text-center font-mono text-purple-700 font-semibold">
                                {runningIdx}
                              </div>
                              <div className={`${isPricingHidden ? "col-span-7" : "col-span-5"} text-left`}>
                                <p className="font-semibold text-gray-900 text-left">{item.name}</p>
                              </div>
                              <div className={`${isPricingHidden ? "col-span-4" : "col-span-2"} text-right text-gray-600 font-mono`}>
                                {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                              </div>
                              {!isPricingHidden && (
                                <>
                                  <div className="col-span-2 text-right text-gray-600 font-mono">
                                    {formatMoney(item.unitPrice, itemSym)}
                                  </div>
                                  <div className="col-span-2 text-right font-semibold text-gray-900 font-mono">
                                    {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}

                        {showGroupTotals && !isPricingHidden && (
                          <div className="flex justify-between py-1.5 text-xs border-b border-purple-100">
                            <span className="text-gray-500 uppercase tracking-wider font-semibold text-[10px]">
                              Group Subtotal
                            </span>
                            <span className="font-mono font-bold text-[#6b21a8]">
                              {formatMoney(
                                group.items.reduce(
                                  (sum, item) => sum + (item.isFlatRate ? 1 : item.quantity) * item.unitPrice,
                                  0,
                                ),
                                itemSym,
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    ));
                  })()
                : items.map((item, idx) => (
                    <div
                      key={idx}
                      className="template-item-row grid grid-cols-12 gap-4 py-2 border-b border-gray-100 text-xs items-center"
                    >
                      <div className="col-span-1 text-center font-mono text-purple-700 font-semibold">
                        {idx + 1}
                      </div>
                      <div className={`${isPricingHidden ? "col-span-7" : "col-span-5"} text-left`}>
                        <p className="font-semibold text-gray-900 text-left">{item.name}</p>
                      </div>
                      <div className={`${isPricingHidden ? "col-span-4" : "col-span-2"} text-right text-gray-600 font-mono`}>
                        {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                      </div>
                      {!isPricingHidden && (
                        <>
                          <div className="col-span-2 text-right text-gray-600 font-mono">
                            {formatMoney(item.unitPrice, itemSym)}
                          </div>
                          <div className="col-span-2 text-right font-semibold text-gray-900 font-mono">
                            {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
            </div>

            {/* Totals - Only in Invoice Mode */}
            {!isPricingHidden && (
              <div className="flex justify-end mb-6">
                <div className="w-full sm:w-1/2 md:w-1/3">
                  <div className="flex justify-between py-1 text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">Subtotal</span>
                    <span className="font-mono">{formatMoney(subtotal, sym)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between py-1 text-xs text-gray-600">
                      <span>
                        Discount{" "}
                        {invoice.discount_type === "percentage"
                          ? `(${invoice.discount_value}%)`
                          : ""}
                      </span>
                      <span className="font-mono text-red-600">-{formatMoney(discountAmount, sym)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 text-xs text-gray-600">
                    <span>Tax (0%)</span>
                    <span className="font-mono">{formatMoney(tax, sym)}</span>
                  </div>
                  {shippingCost > 0 && (
                    <div className="flex justify-between py-1 text-xs text-gray-600">
                      <span>Shipping</span>
                      <span className="font-mono">+{formatMoney(shippingCost, sym)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 border-t-2 border-[#6b21a8] mt-1 text-sm font-bold text-gray-900">
                    <span>{isQuotationDoc ? "Quotation Total" : "Total"}</span>
                    <span className="text-[#6b21a8] font-mono">{formatMoney(total, sym)}</span>
                  </div>
                  {amountPaid > 0 && !isQuotationDoc && (
                    <>
                      <div className="flex justify-between py-1 text-xs text-gray-500 font-medium">
                        <span>Paid</span>
                        <span className="font-mono">{formatMoney(amountPaid, sym)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-t border-gray-300 text-xs font-bold text-gray-900">
                        <span>Balance Due</span>
                        <span className="font-mono">{formatMoney(balanceDue, sym)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bank & Signature */}
        <div className="p-8 print:p-6 pt-0 template-bottom-section">
          {/* N.B. Note - Immediately above bank details */}
          {noteText && (
            <div className="mb-3 pt-2 border-t border-purple-100 text-[10px] text-gray-500 whitespace-pre-line text-left break-inside-avoid template-nb-note">
              <strong className="text-gray-800">N.B:</strong> {noteText}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-purple-100 pt-4 items-start">
            {/* Bank details - Only in Invoice Mode */}
            {!isPricingHidden && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) ? (
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-bold text-[#6b21a8] uppercase tracking-wider text-[10px]">Bank transfer</p>
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
                  <div className="text-xs text-gray-600">
                    <p className="font-bold text-[#6b21a8] uppercase tracking-wider text-[10px] mb-0.5">Note</p>
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
                        className="h-9 mb-1 object-contain"
                      />
                    )}
                    <div className="w-36 border-b border-[#6b21a8] mb-1"></div>
                    <p className="text-[11px] text-gray-600 font-semibold">
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
            <div className="mt-2 pt-2 print:mt-1.5 print:pt-1 border-t border-purple-100 text-[10px] text-gray-500 whitespace-pre-wrap break-inside-avoid">
              <p className="font-semibold text-gray-800 mb-0.5">Terms & Conditions</p>
              <p>{invoice.terms_and_conditions || profile?.terms_and_conditions}</p>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}
