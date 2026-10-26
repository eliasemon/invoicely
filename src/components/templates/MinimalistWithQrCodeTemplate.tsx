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

export function MinimalistWithQrCodeTemplate({
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
  const amountPaid = getAmountPaid(invoice);
  const balanceDue = Math.max(0, total - amountPaid);
  const items = getAllItems(invoice);
  const subject = getSubjectForDoc(invoice, documentType);
  const noteText = getNoteText(invoice);

  const isA5 = paperSize === 'a5';

  if (isA5) {
    return (
      <div
        className="min-h-screen py-4 bg-[#fafafa] text-[#171717] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[148mm]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="max-w-[148mm] w-full min-h-[210mm] mx-auto bg-white border border-gray-200 p-3 print:p-2.5 text-xs flex flex-col justify-between print:shadow-none print:border-none print:w-[148mm] print:max-w-[148mm] print:mx-0 print:min-h-[210mm] print:my-0">
          <div>
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-2 mb-2">
              <div className="flex-1 min-w-0">
                {profile?.company_logo && (
                  <img
                    src={profile.company_logo}
                    alt="Company Logo"
                    className="max-h-8 max-w-[130px] mb-1 object-contain"
                  />
                )}
                <h1 className="text-xs font-bold text-neutral-900 leading-tight">
                  {profile?.company_name || "Your Company"}
                </h1>
                {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                  <p className="text-[9px] text-gray-500 italic">
                    {invoice.brand_voice || profile?.brand_voice}
                  </p>
                )}
                <p className="text-[9px] text-gray-500 whitespace-pre-line mt-0.5 leading-tight">
                  {profile?.company_address || ""}
                  {profile?.email ? ` • ${profile.email}` : ""}
                  {profile?.phone ? ` • ${profile.phone}` : ""}
                </p>
              </div>

              <div className="text-right shrink-0 flex flex-col items-end">
                <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
                  {docTitleUpper}
                </h2>
                <p className="text-[9.5px] font-mono text-gray-500">
                  #{invoice.invoiceNumber || invoice.id?.substring(0, 8).toUpperCase()}
                </p>
                {profile?.qr_code_enabled && publicUrl && (
                  <div className="mt-1">
                    <QRCodeSVG value={publicUrl} size={42} />
                  </div>
                )}
                {!isPricingHidden && !isQuotationDoc && invoice.status && (
                  <div
                    className={`mt-1 px-1.5 py-0.2 rounded text-[8.5px] font-bold uppercase tracking-wider ${
                      invoice.status === "PAID"
                        ? "bg-neutral-100 text-neutral-800"
                        : "bg-neutral-800 text-white"
                    }`}
                  >
                    {invoice.status}
                  </div>
                )}
              </div>
            </div>

            {/* Client Info & Dates */}
            <div className="grid grid-cols-2 gap-2 mb-2 p-2 bg-neutral-50 rounded text-[9.5px]">
              <div>
                <p className="text-[8.5px] uppercase text-gray-400 font-bold">{clientLabel}</p>
                <h3 className="font-bold text-neutral-900 text-[11px] mt-0.5">{invoice.clientName}</h3>
                <p className="text-gray-600 whitespace-pre-line leading-tight text-[9px]">
                  {invoice.clientAddress || invoice.clientPhone}
                </p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-[8.5px] uppercase text-gray-400 font-bold">Details</p>
                <p className="text-gray-700">Issued: <span className="font-medium">{formatDate(issueDate)}</span></p>
                {!isPricingHidden && !isQuotationDoc && (
                  <p className="text-gray-700">Due: <span className="font-medium">{formatDate(dueDate)}</span></p>
                )}
              </div>
            </div>

            {/* Subject */}
            {subject && (
              <div className="mb-2 text-[9.5px] text-[#45464d] bg-gray-50 px-2 py-1 rounded border border-gray-200 flex items-center gap-1.5">
                <span className="font-bold text-black uppercase text-[8.5px]">Subject:</span>
                <span className="font-medium text-gray-800 truncate">{subject}</span>
              </div>
            )}

            {/* Items Table */}
            <div className="mb-2">
              <table className="w-full text-left border-collapse text-[9.5px]">
                <thead>
                  <tr className="border-b border-neutral-200 text-[9px] uppercase tracking-wider text-gray-400 font-medium">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center w-12">Qty</th>
                    {!isPricingHidden && (
                      <>
                        <th className="py-1 text-right w-14">Price</th>
                        <th className="py-1 text-right w-16">Total</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {(() => {
                    return (invoice.groups || [{ items }]).map((group: any, gIdx: number) => (
                      <React.Fragment key={gIdx}>
                        {group.name && showGroups && (
                          <tr className="bg-neutral-50/50">
                            <td colSpan={isPricingHidden ? 2 : 4} className="py-0.5 font-bold text-[9px] uppercase text-neutral-800">
                              {group.name}
                            </td>
                          </tr>
                        )}
                        {group.items.map((item: any, iIdx: number) => {
                          const itemTotal = (item.isFlatRate ? 1 : item.quantity) * item.unitPrice;
                          return (
                            <tr key={iIdx} className="template-item-row hover:bg-neutral-50">
                              <td className="py-1 pr-2">
                                <span className="font-medium text-neutral-900 leading-tight block">{item.name}</span>
                              </td>
                              <td className="py-1 text-center text-gray-500 font-mono text-[9px]">
                                {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                              </td>
                              {!isPricingHidden && (
                                <>
                                  <td className="py-1 text-right text-gray-500 font-mono text-[9px]">
                                    {formatMoney(item.unitPrice, itemSym)}
                                  </td>
                                  <td className="py-1 text-right font-mono text-[9px] font-medium text-neutral-900">
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
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-mono text-neutral-900">{formatMoney(subtotal, sym)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span>Discount {invoice.discount_type === "percentage" ? `(${invoice.discount_value}%)` : ""}</span>
                      <span className="font-mono text-neutral-900">-{formatMoney(discountAmount, sym)}</span>
                    </div>
                  )}
                  {shippingCost > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping</span>
                      <span className="font-mono text-neutral-900">+{formatMoney(shippingCost, sym)}</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-200 pt-1 flex justify-between font-bold text-xs text-neutral-900">
                    <span>{isQuotationDoc ? "Quotation Total" : "Total"}</span>
                    <span className="font-mono">{formatMoney(total, sym)}</span>
                  </div>
                  {amountPaid > 0 && !isQuotationDoc && (
                    <>
                      <div className="flex justify-between text-gray-500">
                        <span>Paid</span>
                        <span className="font-mono text-neutral-900">{formatMoney(amountPaid, sym)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[10.5px] border-t border-neutral-100 pt-0.5 text-neutral-900">
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
          <div className="border-t border-neutral-100 pt-2 template-bottom-section">
            {noteText && (
              <div className="mb-1 text-[9px] text-gray-500 template-nb-note">
                <strong className="text-black">N.B:</strong> {noteText}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 items-end">
              <div>
                {!isPricingHidden && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) && (
                  <div className="text-[8.5px] text-gray-500 space-y-0.5">
                    <p className="font-bold text-neutral-900 uppercase">Bank Info</p>
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
                      <div className="w-28 border-b border-neutral-300 mb-0.5"></div>
                      <p className="text-[8.5px] text-gray-400">
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
      className="min-h-screen py-8 bg-[#fafafa] text-[#171717] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white border border-gray-200 p-4 sm:p-5 print:p-4 text-sm flex flex-col justify-between print:shadow-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        <div>
          {/* Header */}
          <div className="flex flex-row print:flex-row justify-between items-start border-b border-gray-100 pb-2.5 mb-2.5">
            <div>
              {profile?.company_logo && (
                <img
                  src={profile.company_logo}
                  alt="Company Logo"
                  className="max-h-12 max-w-[180px] mb-1.5 object-contain w-auto h-auto"
                />
              )}
              <h1 className="text-base font-bold text-black">
                {profile?.company_name || "Your Company"}
              </h1>
              {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                <p className="text-xs text-gray-500 italic mt-0.5">
                  {invoice.brand_voice || profile?.brand_voice}
                </p>
              )}
              <p className="text-xs text-gray-500 whitespace-pre-line mt-0.5">
                {profile?.company_address}
                {profile?.email ? ` • ${profile.email}` : ""}
                {profile?.phone ? ` • ${profile.phone}` : ""}
              </p>
            </div>
            <div className="text-right print:text-right">
              <h2 className="text-2xl font-bold tracking-tight text-black uppercase">
                {docTitleUpper}
              </h2>
              <p className="font-mono text-xs text-gray-500 mt-0.5">
                #{invoice.invoiceNumber}
              </p>
              {profile?.qr_code_enabled && publicUrl && (
                <div className="mt-2 flex justify-end print:justify-end">
                  <QRCodeSVG value={publicUrl} size={44} />
                </div>
              )}
            </div>
          </div>

          {/* Client & Dates */}
          <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
            <div>
              <p className="text-gray-400 font-medium mb-1">
                {clientLabel}
              </p>
              <p className="font-bold text-black text-sm">{invoice.clientName}</p>
              <p className="text-gray-500 whitespace-pre-line mt-0.5">
                {invoice.clientAddress || invoice.clientPhone}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-right">
              <div>
                <p className="text-gray-400 font-medium mb-1">Issued</p>
                <p className="font-mono text-gray-900">{formatDate(issueDate)}</p>
              </div>
              {!isPricingHidden ? (
                <div>
                  <p className="text-gray-400 font-medium mb-1">Due</p>
                  <p className="font-mono text-gray-900 font-semibold">{formatDate(dueDate)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 font-medium mb-1">Type</p>
                  <span className="font-mono text-gray-900 font-semibold">
                    {isQuotationDoc ? "Quotation" : "Delivery"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Subject */}
          {subject && (
            <div className="mb-4 px-3 py-1.5 border-l-2 border-black text-xs text-black flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-[10px]">Subject:</span>
              <span className="font-medium text-gray-900">{subject}</span>
            </div>
          )}

          {/* Line Items */}
          <div className="mb-8">
            <div className="grid grid-cols-12 gap-4 pb-2 border-b border-black text-xs font-bold uppercase tracking-wider text-black">
              <div className="col-span-1 text-center">#</div>
              <div className={`${isPricingHidden ? "col-span-7" : "col-span-5"} text-left`}>Description</div>
              <div className={`${isPricingHidden ? "col-span-4" : "col-span-2"} text-right`}>Qty</div>
              {!isPricingHidden && (
                <>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-2 text-right">Amount</div>
                </>
              )}
            </div>

            {showGroups && invoice.groups && invoice.groups.length > 0
              ? (() => {
                  let runningIdx = 0;
                  return invoice.groups.map((group, gIdx) => (
                    <div key={gIdx} className="mb-4">
                      {group.name && (
                        <div className="py-2 text-xs font-bold text-gray-900 bg-gray-50 px-2 my-1 uppercase">
                          {group.name}
                        </div>
                      )}
                      {group.items.map((item, iIdx) => {
                        runningIdx++;
                        return (
                          <div
                            key={iIdx}
                            className="template-item-row grid grid-cols-12 gap-4 py-2.5 border-b border-gray-100 text-xs items-center"
                          >
                            <div className="col-span-1 text-center font-mono text-gray-500">
                              {runningIdx}
                            </div>
                            <div className={`${isPricingHidden ? "col-span-7" : "col-span-5"} text-left`}>
                              <p className="font-semibold text-black text-left">{item.name}</p>
                            </div>
                            <div className={`${isPricingHidden ? "col-span-4" : "col-span-2"} text-right font-mono`}>
                              {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                            </div>
                            {!isPricingHidden && (
                              <>
                                <div className="col-span-2 text-right font-mono text-gray-600">
                                  {formatMoney(item.unitPrice, itemSym)}
                                </div>
                                <div className="col-span-2 text-right font-mono font-semibold text-black">
                                  {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}

                      {showGroupTotals && !isPricingHidden && (
                        <div className="flex justify-between py-1.5 text-xs border-b border-gray-200">
                          <span className="text-gray-400 uppercase tracking-wider font-semibold">
                            Group Subtotal
                          </span>
                          <span className="font-mono font-bold text-gray-900">
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
                      )}
                    </div>
                  ));
                })()
              : items.map((item, idx) => (
                  <div
                    key={idx}
                    className="template-item-row grid grid-cols-12 gap-4 py-2.5 border-b border-gray-100 text-xs items-center"
                  >
                    <div className="col-span-1 text-center font-mono text-gray-500">
                      {idx + 1}
                    </div>
                    <div className={`${isPricingHidden ? "col-span-7" : "col-span-5"} text-left`}>
                      <p className="font-semibold text-black text-left">{item.name}</p>
                    </div>
                    <div className={`${isPricingHidden ? "col-span-4" : "col-span-2"} text-right font-mono`}>
                      {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                    </div>
                    {!isPricingHidden && (
                      <>
                        <div className="col-span-2 text-right font-mono text-gray-600">
                          {formatMoney(item.unitPrice, itemSym)}
                        </div>
                        <div className="col-span-2 text-right font-mono font-semibold text-black">
                          {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                        </div>
                      </>
                    )}
                  </div>
                ))}
          </div>

          {/* Totals - Only in Invoice Mode */}
          {!isPricingHidden && (
            <div className="flex justify-end mb-8">
              <div className="w-full sm:w-1/2 md:w-1/3">
                <div className="flex justify-between py-1.5 text-xs text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatMoney(subtotal, sym)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between py-1.5 text-xs text-gray-600">
                    <span>
                      Discount{" "}
                      {invoice.discount_type === "percentage"
                        ? `(${invoice.discount_value}%)`
                        : ""}
                    </span>
                    <span className="font-mono text-red-600">-{formatMoney(discountAmount, sym)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 text-xs text-gray-600">
                  <span>Tax (0%)</span>
                  <span className="font-mono">{formatMoney(0, sym)}</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between py-1.5 text-xs text-gray-600">
                    <span>Shipping</span>
                    <span className="font-mono">+{formatMoney(shippingCost, sym)}</span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-t-2 border-black mt-2 text-sm font-bold text-black">
                  <span>{isQuotationDoc ? "Quotation Total" : "Total"}</span>
                  <span className="font-mono">{formatMoney(total, sym)}</span>
                </div>
                {amountPaid > 0 && !isQuotationDoc && (
                  <>
                    <div className="flex justify-between py-1 text-xs text-gray-500 font-medium">
                      <span>Paid</span>
                      <span className="font-mono">{formatMoney(amountPaid, sym)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-t border-gray-300 text-xs font-bold text-black">
                      <span>Balance Due</span>
                      <span className="font-mono">{formatMoney(balanceDue, sym)}</span>
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
            <div className="mb-3 pt-2 border-t border-gray-100 text-[11px] text-gray-500 whitespace-pre-line text-left break-inside-avoid template-nb-note">
              <strong className="text-black">N.B:</strong> {noteText}
            </div>
          )}

          <div className="flex flex-row print:flex-row justify-between items-start border-t border-gray-100 pt-6">
            {/* Bank details - Only in Invoice Mode */}
            {!isPricingHidden && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) ? (
              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-bold text-black uppercase tracking-wider text-[10px]">Payment Method</p>
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
                  <div className="text-xs text-gray-500">
                    <p className="font-bold text-black uppercase tracking-wider text-[10px] mb-0.5">Notes</p>
                    <p>{invoice.notes}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col items-end print:items-end gap-2">
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
                      <div className="w-36 border-b border-black mb-1"></div>
                      <p className="text-[11px] text-gray-500 font-semibold">
                        {invoice.signatory_name ||
                          profile?.signatory_name ||
                          (isChallanDoc ? "Received By" : "Authorized Signatory")}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          {((invoice.terms_and_conditions_enabled ?? profile?.terms_and_conditions_enabled ?? true) && (invoice.terms_and_conditions || profile?.terms_and_conditions)) && (
            <div className="mt-2 pt-2 print:mt-1.5 print:pt-1 border-t border-gray-100 text-[11px] text-gray-500 whitespace-pre-wrap break-inside-avoid">
              <p className="font-bold text-black mb-0.5">Terms & Conditions</p>
              <p>{invoice.terms_and_conditions || profile?.terms_and_conditions}</p>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}
