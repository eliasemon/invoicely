import React from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  TemplateProps,
  formatDate,
  formatMoney,
  getItemCurrencySymbol,
  getIssueDate,
  getSubtotal,
  getDiscountAmount,
  getShippingCost,
  getTotal,
  getAmountPaid,
  getBalanceDue,
  numberToWords,
  getSubjectForDoc,
  getNoteText,
} from "./templateUtils";

export function RedClassicGroupedTemplate({
  invoice,
  profile,
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
  const docTitle = isQuotationDoc ? "Quotation" : isChallanDoc ? "Challan" : "Invoice";
  const clientLabel = isQuotationDoc ? "Quotation To:" : isChallanDoc ? "Challan To:" : "Bill To:";
  const refLabel = isQuotationDoc ? "Quotation No:" : isChallanDoc ? "Challan No:" : "Ref:";
  const subjectFallback = isQuotationDoc
    ? "Quotation for Items/Services"
    : isChallanDoc
    ? "Delivery Challan for Items/Services"
    : "Bill for Items/Services";

  const sym = invoice.currency_symbol || "$";
  const itemSym = getItemCurrencySymbol(invoice, profile);
  const issueDate = getIssueDate(invoice);
  const subtotal = getSubtotal(invoice);
  const discountAmount = getDiscountAmount(invoice, subtotal);
  const shippingCost = getShippingCost(invoice);
  const total = getTotal(invoice);
  const amountPaid = getAmountPaid(invoice);
  const balanceDue = getBalanceDue(invoice);
  const subject = getSubjectForDoc(invoice, documentType);
  const noteText = getNoteText(invoice);

  let globalSlNo = 1;

  // Derive currency name for words
  let currencyName = "Only";
  if (sym === "৳" || sym === "BDT") currencyName = "Taka Only";
  else if (sym === "$" || sym === "USD") currencyName = "Dollars Only";
  else if (sym === "€" || sym === "EUR") currencyName = "Euros Only";
  else if (sym === "£" || sym === "GBP") currencyName = "Pounds Only";
  else currencyName = `${sym} Only`;

  const isA5 = paperSize === 'a5';

  if (isA5) {
    let a5SlNo = 1;
    return (
      <div
        className="min-h-screen py-4 bg-gray-100 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[148mm]"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <div className="max-w-[148mm] w-full min-h-[210mm] mx-auto bg-white text-black shadow-xs overflow-hidden print:shadow-none print:w-[148mm] print:max-w-[148mm] print:mx-0 print:min-h-[210mm] print:my-0 p-3 print:p-2.5 relative flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-2 pb-2 border-b-2 border-[#8b0000]">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                {profile?.company_logo && (
                  <img
                    src={profile.company_logo}
                    alt="Company Logo"
                    className="max-h-8 max-w-[100px] object-contain"
                  />
                )}
                <div className="min-w-0">
                  <h1 className="text-xs font-bold text-[#8b0000] tracking-tight leading-tight">
                    {profile?.company_name || "COMPANY NAME"}
                  </h1>
                  {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                    <p className="text-[9px] text-gray-600 italic">
                      {invoice.brand_voice || profile?.brand_voice}
                    </p>
                  )}
                  <p className="text-[9px] text-gray-600 whitespace-pre-line leading-tight mt-0.5">
                    {profile?.company_address || ""}
                    {profile?.email ? ` • ${profile.email}` : ""}
                    {profile?.phone ? ` • ${profile.phone}` : ""}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 flex flex-col items-end">
                <h2 className="text-sm font-bold text-[#8b0000] uppercase tracking-wider">
                  {docTitle}
                </h2>
                <p className="text-[9.5px] font-mono text-gray-700">
                  {refLabel} #{invoice.invoiceNumber || invoice.id?.substring(0, 8).toUpperCase()}
                </p>
                <p className="text-[9px] text-gray-600">Date: {formatDate(issueDate)}</p>
                {profile?.qr_code_enabled && publicUrl && (
                  <div className="mt-1">
                    <QRCodeSVG value={publicUrl} size={38} />
                  </div>
                )}
                {!isPricingHidden && !isQuotationDoc && invoice.status && (
                  <div
                    className={`mt-1 px-1.5 py-0.2 rounded text-[8.5px] font-bold uppercase ${
                      invoice.status === "PAID"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-[#8b0000]"
                    }`}
                  >
                    {invoice.status}
                  </div>
                )}
              </div>
            </div>

            {/* Client Info */}
            <div className="mb-2 p-1.5 bg-[#fdf2f2] border border-[#fca5a5] rounded text-[9.5px]">
              <span className="font-bold text-[#8b0000] uppercase text-[8.5px]">{clientLabel} </span>
              <span className="font-bold text-black">{invoice.clientName}</span>
              {invoice.clientAddress && (
                <span className="text-gray-700"> • {invoice.clientAddress}</span>
              )}
              {invoice.clientPhone && (
                <span className="text-gray-700"> • {invoice.clientPhone}</span>
              )}
            </div>

            {/* Subject */}
            {subject && (
              <div className="mb-2 text-[9.5px] text-[#8b0000] bg-gray-50 px-2 py-1 rounded border border-gray-200 flex items-center gap-1.5">
                <span className="font-bold uppercase text-[8.5px]">Subject:</span>
                <span className="font-medium text-gray-800 truncate">{subject}</span>
              </div>
            )}

            {/* Table */}
            <div className="mb-2">
              <table className="w-full border-collapse border border-gray-400 text-[9.5px]">
                <thead>
                  <tr className="bg-[#8b0000] text-white text-[9px] uppercase font-bold">
                    <th className="border border-gray-400 py-1 px-1 text-center w-7">SL</th>
                    <th className="border border-gray-400 py-1 px-1.5 text-left">Description</th>
                    <th className="border border-gray-400 py-1 px-1 text-center w-12">Qty</th>
                    {!isPricingHidden && (
                      <>
                        <th className="border border-gray-400 py-1 px-1 text-right w-14">Price</th>
                        <th className="border border-gray-400 py-1 px-1.5 text-right w-16">Total</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {invoice.groups?.map((group: any, gIdx: number) => (
                    <React.Fragment key={gIdx}>
                      {group.name && (
                        <tr className="bg-red-50/70 font-bold text-[9px] text-[#8b0000]">
                          <td colSpan={isPricingHidden ? 3 : 5} className="border border-gray-400 px-1.5 py-0.5">
                            {group.name}
                          </td>
                        </tr>
                      )}
                      {group.items.map((item: any, iIdx: number) => {
                        const itemTotal = (item.isFlatRate ? 1 : item.quantity) * item.unitPrice;
                        return (
                          <tr key={iIdx} className="template-item-row hover:bg-gray-50">
                            <td className="border border-gray-400 py-0.5 px-1 text-center font-mono text-[9px]">{a5SlNo++}</td>
                            <td className="border border-gray-400 py-0.5 px-1.5 font-medium text-black">{item.name}</td>
                            <td className="border border-gray-400 py-0.5 px-1 text-center font-mono text-[9px]">
                              {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                            </td>
                            {!isPricingHidden && (
                              <>
                                <td className="border border-gray-400 py-0.5 px-1 text-right font-mono text-[9px]">
                                  {formatMoney(item.unitPrice, itemSym)}
                                </td>
                                <td className="border border-gray-400 py-0.5 px-1.5 text-right font-mono text-[9px] font-bold">
                                  {formatMoney(itemTotal, itemSym)}
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            {!isPricingHidden && (
              <div className="flex justify-end mb-2 template-totals-block">
                <div className="w-1/2 space-y-1 text-[9.5px]">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-mono text-black">{formatMoney(subtotal, sym)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Discount {invoice.discount_type === "percentage" ? `(${invoice.discount_value}%)` : ""}</span>
                      <span className="font-mono text-black">-{formatMoney(discountAmount, sym)}</span>
                    </div>
                  )}
                  {shippingCost > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping</span>
                      <span className="font-mono text-black">+{formatMoney(shippingCost, sym)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-[#8b0000] pt-1 flex justify-between font-bold text-xs bg-[#8b0000] text-white p-1 rounded">
                    <span>{isQuotationDoc ? "Quotation Total" : "Total"}</span>
                    <span className="font-mono">{formatMoney(total, sym)}</span>
                  </div>
                  {amountPaid > 0 && !isQuotationDoc && (
                    <>
                      <div className="flex justify-between text-gray-700">
                        <span>Paid</span>
                        <span className="font-mono text-green-700">{formatMoney(amountPaid, sym)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[10.5px] border-t border-gray-300 pt-0.5 text-[#8b0000]">
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
          <div className="border-t-2 border-[#8b0000] pt-2 template-bottom-section">
            {noteText && (
              <div className="mb-1 text-[9px] text-gray-700 template-nb-note">
                <strong className="text-black">N.B:</strong> {noteText}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 items-end">
              <div>
                {!isPricingHidden && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) && (
                  <div className="text-[8.5px] text-gray-700 space-y-0.5">
                    <p className="font-bold text-[#8b0000] uppercase">Bank Details</p>
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
                      <div className="w-28 border-b border-[#8b0000] mb-0.5"></div>
                      <p className="text-[8.5px] text-gray-700">
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
      className="min-h-screen py-8 bg-gray-100 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white text-black shadow-xl overflow-hidden print:shadow-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0 p-4 sm:p-5 print:p-4 relative flex flex-col justify-between">
        <div>
        {/* Header section */}
        <div className="flex flex-row items-start justify-between mb-2.5 pb-2.5 border-b-4 border-[#8b0000]">
          <div className="flex items-start gap-4">
            {profile?.company_logo && (
              <img
                alt="Company Logo"
                className="h-12 w-auto object-contain drop-shadow-sm"
                src={profile.company_logo}
              />
            )}
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#8b0000] tracking-tight uppercase leading-none">
                {profile?.company_name || "COMPANY NAME"}
              </h1>
              {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                <p className="text-[12px] text-gray-700 italic mt-1 font-medium">
                  {invoice.brand_voice || profile?.brand_voice}
                </p>
              )}
              {profile?.company_address && (
                <p className="text-xs text-gray-600 mt-1.5 font-medium max-w-[450px] whitespace-pre-line leading-tight">
                  {profile.company_address}
                </p>
              )}
              {(profile?.email || profile?.phone) && (
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  {profile.email}
                  {profile.email && profile.phone ? " • " : ""}
                  {profile.phone}
                </p>
              )}
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="bg-[#8b0000] text-white px-4 py-1 rounded-l-md font-bold text-lg tracking-widest uppercase mb-2 shadow-sm">
              {docTitle}
            </div>
            <p className="text-xs font-semibold text-gray-800">
              Date: {formatDate(issueDate)}
            </p>
          </div>
        </div>

        <div className="mb-3 text-xs">
          <p>
            <span className="font-semibold">{refLabel}</span>{" "}
            {invoice.invoiceNumber || invoice.id?.substring(0, 8).toUpperCase()}
          </p>
          <p className="font-semibold mt-1.5">{clientLabel}</p>
          <p className="font-bold text-sm">{invoice.clientName}</p>
          {(invoice.clientAddress || invoice.clientPhone) && (
            <p className="whitespace-pre-line text-gray-800 leading-tight mt-0.5">
              {invoice.clientAddress || invoice.clientPhone}
            </p>
          )}
        </div>

        {subject && (
          <div className="mb-3">
            <p className="font-bold text-xs">
              <span className="font-bold">Subject:</span> {subject}
            </p>
          </div>
        )}

        {/* Table */}
        <div className="mb-4 w-full">
          <div className="overflow-x-auto mb-2">
            <table className="w-full min-w-[500px] text-[11px] border-collapse border border-gray-300">
              <thead>
                <tr className="bg-[#8b0000] text-white">
                  <th className="border border-gray-300 py-1 px-1 text-center w-10 font-bold">
                    Sl
                    <br />
                    No
                  </th>
                  <th className="border border-gray-300 py-1 px-2 text-left font-bold">
                    Description of Item
                  </th>
                  <th className={`border border-gray-300 py-1 px-1 text-center font-bold ${isPricingHidden ? 'w-28' : 'w-16'}`}>
                    Qty
                  </th>
                  {!isPricingHidden && (
                    <>
                      <th className="border border-gray-300 py-1 px-1 text-center w-20 font-bold">
                        Rate
                      </th>
                      <th className="border border-gray-300 py-1 px-1 text-center w-24 font-bold">
                        Amount
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {invoice.groups?.map((group, gIdx) => {
                  const groupSubtotal = group.items.reduce(
                    (sum, item) => sum + (item.isFlatRate ? 1 : item.quantity) * item.unitPrice,
                    0,
                  );
                  return (
                    <React.Fragment key={gIdx}>
                      {/* Group Header */}
                      {group.name && (
                        <tr className="bg-red-50/50">
                          <td
                            colSpan={isPricingHidden ? 3 : 5}
                            className="border border-gray-300 py-1 px-2 font-bold text-gray-900 text-[11px]"
                          >
                            {group.name}
                          </td>
                        </tr>
                      )}

                      {/* Group Items */}
                      {group.items.map((item, iIdx) => {
                        const currentSlNo = globalSlNo++;
                        return (
                          <tr
                            key={iIdx}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="border border-gray-300 py-1 px-1 text-center text-gray-800">
                              {currentSlNo}
                            </td>
                            <td className="border border-gray-300 py-1 px-2 text-left text-gray-800 font-medium">
                              {item.name}
                            </td>
                            <td className="border border-gray-300 py-1 px-1 text-center text-gray-800">
                              {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                            </td>
                            {!isPricingHidden && (
                              <>
                                <td className="border border-gray-300 py-1 px-1 text-right text-gray-800">
                                  {formatMoney(item.unitPrice, itemSym)}
                                </td>
                                <td className="border border-gray-300 py-1 px-1 text-right text-gray-900">
                                  {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}

                      {/* Group Total */}
                      {showGroupTotals && !isPricingHidden && group.items.length > 0 && (
                        <tr className="bg-red-50/30">
                          <td
                            colSpan={5}
                            className="border border-gray-300 py-1 px-2 text-left text-[11px] font-bold text-[#8b0000]"
                          >
                            <span className="text-gray-700">
                              {group.name
                                ? `${group.name} Total:`
                                : "Group Total:"}
                            </span>{" "}
                            <span className="ml-2">
                              {formatMoney(groupSubtotal, itemSym)}
                            </span>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Empty state fallback if no groups */}
                {(!invoice.groups || invoice.groups.length === 0) && (
                  <tr>
                    <td
                      colSpan={isPricingHidden ? 3 : 5}
                      className="border border-gray-300 py-2 text-center text-gray-500 italic"
                    >
                      No items found
                    </td>
                  </tr>
                )}

                {/* Adjustments & Totals - Only in Invoice Mode */}
                {!isPricingHidden && (
                  <>
                    {discountAmount > 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="border border-gray-300 py-1 px-2 text-right font-semibold text-gray-700"
                        >
                          Discount
                        </td>
                        <td className="border border-gray-300 py-1 px-1 text-right text-gray-800">
                          -{formatMoney(discountAmount, sym)}
                        </td>
                      </tr>
                    )}
                    {shippingCost > 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="border border-gray-300 py-1 px-2 text-right font-semibold text-gray-700"
                        >
                          Shipping
                        </td>
                        <td className="border border-gray-300 py-1 px-1 text-right text-gray-800">
                          +{formatMoney(shippingCost, sym)}
                        </td>
                      </tr>
                    )}

                    {/* Grand Total */}
                    <tr>
                      <td
                        colSpan={4}
                        className="border border-gray-300 py-1.5 px-2 text-right font-bold text-[#8b0000] text-[12px]"
                      >
                        {isQuotationDoc ? "Quotation Total" : "Grand Total"}
                      </td>
                      <td className="border border-[#8b0000] bg-[#8b0000] py-1.5 px-1 text-right font-bold text-white text-[12px]">
                        {formatMoney(total, "")}
                      </td>
                    </tr>

                    {/* Paid Amount and Balance Due */}
                    {amountPaid > 0 && !isQuotationDoc && (
                      <>
                        <tr>
                          <td
                            colSpan={4}
                            className="border border-gray-300 py-1 px-2 text-right font-semibold text-gray-700"
                          >
                            Paid Amount
                          </td>
                          <td className="border border-gray-300 py-1 px-1 text-right text-gray-800">
                            {formatMoney(amountPaid, "")}
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan={4}
                            className="border border-gray-300 py-1.5 px-2 text-right font-bold text-[#8b0000] text-[12px]"
                          >
                            Balance Due
                          </td>
                          <td className="border border-[#8b0000] py-1.5 px-1 text-right font-bold text-[#8b0000] text-[12px]">
                            {formatMoney(balanceDue, "")}
                          </td>
                        </tr>
                      </>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Amount in Words - Only in Invoice Mode */}
        {!isPricingHidden && (
          <div className="mb-4">
            <p className="text-xs">
              <span className="font-bold">In Word: </span>
              <span className="text-[#8b0000] italic font-bold">
                {numberToWords(total)} {currencyName}
              </span>
            </p>
          </div>
        )}

        </div>

        {/* Bottom Section: N.B. Note, Bank Details, Terms, Footer */}
        <div className="w-full template-bottom-section">
          {/* N.B. Note - Immediately above Bank Details */}
          {noteText ? (
            <div className="mb-3 text-[11px] break-inside-avoid template-nb-note">
              <p className="font-bold mb-0.5">N.B:</p>
              <p className="text-gray-800 whitespace-pre-line">{noteText}</p>
            </div>
          ) : null}

          {/* Bank Details - Only in Invoice Mode */}
          {!isPricingHidden && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) && (
            <div className="mb-4 text-[11px]">
              <p className="font-bold mb-0.5">Bank Details:</p>
              <p className="text-gray-800">
                <span className="font-semibold">{invoice.bank_name || profile?.bank_name}</span>
                <br />
                {invoice.bank_account_holder || profile?.bank_account_holder} • {invoice.bank_account_number || profile?.bank_account_number}
                {invoice.bank_swift || profile?.bank_swift ? ` • SWIFT: ${invoice.bank_swift || profile?.bank_swift}` : ""}
              </p>
            </div>
          )}

          {/* Terms & Conditions */}
          {((invoice.terms_and_conditions_enabled ?? profile?.terms_and_conditions_enabled ?? true) && (invoice.terms_and_conditions || profile?.terms_and_conditions)) && (
            <div className="mb-3 text-[11px] break-inside-avoid">
              <p className="font-bold mb-0.5">Terms & Conditions:</p>
              <p className="text-gray-800 whitespace-pre-line">
                {invoice.terms_and_conditions || profile?.terms_and_conditions}
              </p>
            </div>
          )}

        {/* Footer info */}
        <div className="mt-8 w-full">
          <p className="mb-2 text-[11px]">Thanking You,</p>

          <div className="flex justify-between items-end">
            <div>
              {profile?.qr_code_enabled && publicUrl && (
                <div className="mt-2">
                  <QRCodeSVG value={publicUrl} size={60} />
                </div>
              )}
            </div>

            <div className="text-right">
              {(profile?.signature_enabled ?? true) &&
              (invoice.signature_url ||
                profile?.signature_url ||
                invoice.signatory_name ||
                profile?.signatory_name) ? (
                <div className="flex flex-col items-center ml-auto w-40">
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
                  <div className="w-full border-b-2 border-gray-800 mb-1"></div>
                  <p className="text-[10px] font-bold text-gray-800">
                    {invoice.signatory_name ||
                      profile?.signatory_name ||
                      (isChallanDoc ? "Received By" : "Authorized Signatory")}
                  </p>
                </div>
              ) : (
                <div className="w-40 border-b-2 border-gray-800 mb-1 ml-auto"></div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
