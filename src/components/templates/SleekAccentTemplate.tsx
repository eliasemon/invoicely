import React from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  TemplateProps,
  formatDate,
  formatMoney,
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
  getItemCurrencySymbol,
} from "./templateUtils";

export function SleekAccentTemplate({
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

  const tax = 0; // Keeping tax as 0 as per other templates unless specified in invoice

  const isA5 = paperSize === 'a5';

  if (isA5) {
    return (
      <div
        className="min-h-screen py-4 bg-[#f2f4f8] text-[#1a1c21] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[148mm]"
        style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
      >
        {!isPreview && (
          <div className="fixed top-4 right-8 z-50 flex gap-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="bg-[#0b1b3d] text-white px-4 py-2 rounded-full shadow-md text-xs flex items-center gap-1.5 hover:bg-[#1a2b52] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Download PDF (A5)
            </button>
          </div>
        )}

        <main className="w-full max-w-[148mm] min-h-[210mm] mx-auto bg-white shadow-[0_4px_30px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col justify-between relative print:shadow-none print:w-[148mm] print:max-w-[148mm] print:mx-0 print:min-h-[210mm] print:my-0">
          <div className="flex-1 flex flex-col p-3.5 print:p-3.5 relative z-10 text-[10px]">
            {/* Header */}
            <header className="flex flex-row justify-between items-start mb-2.5 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                {profile?.company_logo && (
                  <img
                    alt="Company Logo"
                    className="h-10 w-auto object-contain"
                    src={profile.company_logo}
                  />
                )}
                <div>
                  <h1
                    className="text-base font-bold text-[#0b1b3d] leading-tight"
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                  >
                    {profile?.company_name || "Your Company"}
                  </h1>
                  {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                    <p className="text-[9px] text-gray-500 italic">
                      {invoice.brand_voice || profile?.brand_voice}
                    </p>
                  )}
                  <p className="text-[8.5px] text-gray-500 mt-0.5 leading-snug">
                    {profile?.company_address}
                    {profile?.phone ? ` • ${profile.phone}` : ""}
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="bg-[#0b1b3d] text-white px-2 py-0.5 rounded text-[11px] font-black tracking-wider uppercase mb-1">
                  {docTitleUpper}
                </div>
                <div className="text-[10px] font-mono font-bold text-gray-800">
                  #{invoice.invoiceNumber}
                </div>
                <div className="text-[8.5px] text-gray-500 mt-0.5">
                  <span>Issued: {issueDate ? formatDate(issueDate) : "—"}</span>
                  {dueDate && (
                    <span className="ml-2">Due: {formatDate(dueDate)}</span>
                  )}
                </div>
                {!isPricingHidden && balanceDue > 0 && (
                  <div className="mt-1 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[9px] text-amber-900 font-semibold">
                    Balance: {formatMoney(balanceDue, sym)}
                  </div>
                )}
              </div>
            </header>

            {/* Subject */}
            {subject && (
              <div className="mb-2 bg-gray-50 p-1.5 rounded border-l-2 border-[#0b1b3d]">
                <span className="font-bold text-[#0b1b3d] mr-1 text-[9px] uppercase">Subject:</span>
                <span className="text-gray-800 font-medium text-[9px]">{subject}</span>
              </div>
            )}

            {/* Client & Shipping Metadata */}
            <section className="grid grid-cols-2 gap-2 mb-2.5 pb-2 border-b border-gray-100 text-[9px]">
              <div>
                <p className="font-bold text-gray-400 uppercase tracking-wider text-[8px] mb-0.5">
                  {clientLabel}
                </p>
                <p className="font-bold text-gray-900 text-[10px]">{invoice.clientName || "Valued Client"}</p>
                {invoice.clientAddress && (
                  <p className="text-gray-600 whitespace-pre-line leading-tight mt-0.5">
                    {invoice.clientAddress}
                  </p>
                )}
                {(invoice as any).clientEmail && <p className="text-gray-500 mt-0.5">{(invoice as any).clientEmail}</p>}
                {invoice.client_phone && <p className="text-gray-500">{invoice.client_phone}</p>}
              </div>

              <div className="text-right">
                {isChallanDoc && ((invoice as any).shipping_address || (invoice as any).vehicle_number || (invoice as any).delivery_note) ? (
                  <div>
                    <p className="font-bold text-gray-400 uppercase tracking-wider text-[8px] mb-0.5">
                      DELIVERY INFO
                    </p>
                    {(invoice as any).shipping_address && (
                      <p className="text-gray-600 leading-tight">{(invoice as any).shipping_address}</p>
                    )}
                    {(invoice as any).vehicle_number && (
                      <p className="text-gray-600">Vehicle: {(invoice as any).vehicle_number}</p>
                    )}
                    {(invoice as any).delivery_note && (
                      <p className="text-gray-500 italic mt-0.5">{(invoice as any).delivery_note}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-gray-400 uppercase tracking-wider text-[8px] mb-0.5">
                      DOCUMENT DETAILS
                    </p>
                    <p className="text-gray-600">Status: <span className="font-semibold capitalize">{invoice.status || "Draft"}</span></p>
                    {(invoice as any).po_number && <p className="text-gray-600">PO #: {(invoice as any).po_number}</p>}
                  </div>
                )}
              </div>
            </section>

            {/* Line Items Table */}
            <section className="mb-2.5 flex-1">
              <div className="grid grid-cols-12 bg-[#0b1b3d] text-white py-1 px-2 rounded-t font-semibold text-[8.5px] uppercase tracking-wider">
                <div className="col-span-1 text-center">#</div>
                <div className={`${isPricingHidden ? 'col-span-8' : 'col-span-5'} text-left`}>Item & Description</div>
                <div className={`${isPricingHidden ? 'col-span-3' : 'col-span-2'} text-center`}>Qty</div>
                {!isPricingHidden && (
                  <>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </>
                )}
              </div>

              <div className="divide-y divide-gray-100 border-x border-b border-gray-100 rounded-b">
                {showGroups && invoice.groups && invoice.groups.length > 0
                  ? (() => {
                      let runningIdx = 0;
                      return invoice.groups.map((group, gIdx) => (
                        <React.Fragment key={gIdx}>
                          {group.name && (
                            <div className="bg-gray-100 px-2 py-0.5 text-[8.5px] font-bold text-[#0b1b3d]">
                              {group.name}
                            </div>
                          )}
                          {group.items.map((item, iIdx) => {
                            runningIdx++;
                            return (
                              <div
                                key={iIdx}
                                className={`grid grid-cols-12 py-1 px-2 text-[9px] items-center ${iIdx % 2 !== 0 ? "bg-orange-50/20" : "bg-white"}`}
                              >
                                <div className="col-span-1 text-center font-mono text-gray-400 text-[8px]">{runningIdx}</div>
                                <div className={`${isPricingHidden ? 'col-span-8' : 'col-span-5'} text-left pr-1`}>
                                  <p className="font-medium text-gray-900 leading-tight">{item.name}</p>
                                  {(item as any).description && (
                                    <p className="text-[7.5px] text-gray-400 line-clamp-1">{(item as any).description}</p>
                                  )}
                                </div>
                                <div className={`${isPricingHidden ? 'col-span-3' : 'col-span-2'} text-center text-gray-600`}>
                                  {item.isFlatRate ? 'Flat' : `${item.quantity} ${item.unit || ''}`.trim()}
                                </div>
                                {!isPricingHidden && (
                                  <>
                                    <div className="col-span-2 text-right text-gray-600 font-mono">
                                      {formatMoney(item.unitPrice, itemSym)}
                                    </div>
                                    <div className="col-span-2 text-right font-medium text-gray-900 font-mono">
                                      {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                          {showGroupTotals && !isPricingHidden && (
                            <div className="bg-gray-50 flex justify-between px-2 py-0.5 border-t border-gray-100 text-[8px]">
                              <span className="font-semibold text-gray-500 uppercase">{group.name} Subtotal</span>
                              <span className="font-bold text-[#0b1b3d] font-mono">
                                {formatMoney(
                                  group.items.reduce(
                                    (acc, item) => acc + (item.isFlatRate ? 1 : item.quantity) * item.unitPrice,
                                    0
                                  ),
                                  sym
                                )}
                              </span>
                            </div>
                          )}
                        </React.Fragment>
                      ));
                    })()
                  : items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`grid grid-cols-12 py-1 px-2 text-[9px] items-center ${idx % 2 !== 0 ? "bg-orange-50/20" : "bg-white"}`}
                      >
                        <div className="col-span-1 text-center font-mono text-gray-400 text-[8px]">{idx + 1}</div>
                        <div className={`${isPricingHidden ? 'col-span-8' : 'col-span-5'} text-left pr-1`}>
                          <p className="font-medium text-gray-900 leading-tight">{item.name}</p>
                          {(item as any).description && (
                            <p className="text-[7.5px] text-gray-400 line-clamp-1">{(item as any).description}</p>
                          )}
                        </div>
                        <div className={`${isPricingHidden ? 'col-span-3' : 'col-span-2'} text-center text-gray-600`}>
                          {item.isFlatRate ? 'Flat' : `${item.quantity} ${item.unit || ''}`.trim()}
                        </div>
                        {!isPricingHidden && (
                          <>
                            <div className="col-span-2 text-right text-gray-600 font-mono">
                              {formatMoney(item.unitPrice, itemSym)}
                            </div>
                            <div className="col-span-2 text-right font-medium text-gray-900 font-mono">
                              {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
              </div>
            </section>

            {/* Bottom Section: Notes & Bank on Left, Totals & Signature on Right */}
            <section className="grid grid-cols-12 gap-3 pt-1 border-t border-gray-200">
              <div className="col-span-6 space-y-1.5 text-[8.5px]">
                {noteText && (
                  <div className="bg-gray-50 p-1.5 rounded border border-gray-200">
                    <p className="font-bold text-gray-700 uppercase text-[7.5px]">Note / N.B.</p>
                    <p className="text-gray-600 mt-0.5 leading-tight whitespace-pre-line">{noteText}</p>
                  </div>
                )}

                {!isPricingHidden && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) && (
                  <div className="bg-gray-50 p-1.5 rounded border border-gray-200 space-y-0.5 text-gray-600">
                    <p className="font-bold text-[#0b1b3d] uppercase text-[7.5px]">Bank Details</p>
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
                )}

                {publicUrl && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="bg-white p-1 border border-gray-200 rounded">
                      <QRCodeSVG value={publicUrl} size={36} />
                    </div>
                    <span className="text-[7.5px] text-gray-400 leading-tight">Scan to verify invoice online</span>
                  </div>
                )}
              </div>

              <div className="col-span-6 flex flex-col justify-between">
                {!isPricingHidden && (
                  <div className="space-y-0.5 text-[9px] border-b border-gray-200 pb-1.5 mb-1.5">
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
                    <div className="flex justify-between items-center bg-[#0b1b3d] text-white px-2 py-1 rounded text-xs font-bold mt-1">
                      <span>{isQuotationDoc ? "Quotation Total" : "Total"}</span>
                      <span className="font-mono">{formatMoney(total, sym)}</span>
                    </div>
                    {amountPaid > 0 && !isQuotationDoc && (
                      <>
                        <div className="flex justify-between text-gray-500 pt-0.5 text-[8.5px]">
                          <span>Paid:</span>
                          <span className="font-mono">{formatMoney(amountPaid, sym)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-[#0b1b3d] text-[9px]">
                          <span>Balance Due:</span>
                          <span className="font-mono">{formatMoney(balanceDue, sym)}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {(profile?.signature_enabled ?? true) &&
                  (invoice.signature_url ||
                    profile?.signature_url ||
                    invoice.signatory_name ||
                    profile?.signatory_name) && (
                    <div className="flex flex-col items-end text-right mt-auto pt-1">
                      {(invoice.signature_url || profile?.signature_url) && (
                        <img
                          src={invoice.signature_url || profile?.signature_url || undefined}
                          alt="Signature"
                          className="h-7 mb-0.5 object-contain"
                        />
                      )}
                      <div className="w-24 border-b border-[#0b1b3d] mb-0.5"></div>
                      <p className="text-[8px] font-bold text-[#0b1b3d] uppercase tracking-wide">
                        SIGNATURE
                      </p>
                      <p className="text-[7.5px] text-gray-500">
                        {invoice.signatory_name ||
                          profile?.signatory_name ||
                          (isChallanDoc ? "Received By" : "Authorized Signatory")}
                      </p>
                    </div>
                  )}
              </div>
            </section>

            {/* Footer */}
            <footer className="mt-2 pt-1.5 border-t border-gray-200 flex justify-between items-center text-[7.5px] font-medium text-gray-500">
              <div className="truncate max-w-[200px]">
                {profile?.email && <span>{profile.email}</span>}
                {profile?.phone && <span className="ml-1.5">• {profile.phone}</span>}
              </div>
              <div>
                {profile?.website && <span>{profile.website}</span>}
                {profile?.tax_id && <span className="ml-1.5">• Tax ID: {profile.tax_id}</span>}
              </div>
            </footer>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 bg-[#f2f4f8] text-[#1a1c21] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
    >
      {" "}
      {/* Floating Actions */}{" "}
      {!isPreview && (
        <div className="fixed top-6 right-12 z-50 flex gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-[#0b1b3d] text-white px-6 py-2.5 rounded-full shadow-md text-xs flex items-center gap-2 hover:bg-[#1a2b52] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Download PDF
          </button>
        </div>
      )}
      {/* Invoice Canvas */}
      <main className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-[0_4px_40px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col relative print:shadow-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        <div className="flex-1 flex flex-col p-6 print:p-6 relative z-10">
          {/* Header */}
          <header className="flex flex-row print:flex-row justify-between items-start mb-5">
            <div className="flex items-center gap-4">
              {profile?.company_logo ? (
                <img
                  alt="Company Logo"
                  className="h-16 w-auto object-contain"
                  src={profile.company_logo}
                />
              ) : null}
              <div className="flex flex-col">
                <h1
                  className="text-2xl font-bold text-[#0b1b3d]"
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                >
                  {profile?.company_name || "Your Company"}
                </h1>
                {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                  <p className="text-[12px] text-gray-500 italic mt-0.5">
                    {invoice.brand_voice || profile?.brand_voice}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right mt-0 print:mt-0">
              <h2
                className="text-2xl font-bold text-[#0b1b3d] tracking-wide mb-4"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                {docTitleUpper} #
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-right text-sm">
                <span className="text-gray-500 font-medium">{docTitleUpper} # :</span>
                <span className="font-semibold">
                  {invoice.invoiceNumber ||
                    invoice.id?.substring(0, 8).toUpperCase()}
                </span>
                <span className="text-gray-500 font-medium">
                  CREATION DATE :
                </span>
                <span>{formatDate(issueDate)}</span>
                {!isPricingHidden && !isQuotationDoc && (
                  <>
                    <span className="text-gray-500 font-medium">DUE DATE :</span>
                    <span>{formatDate(dueDate)}</span>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Addresses */}
          <section className="flex flex-row print:flex-row justify-between mb-4">
            <div className="mb-0 print:mb-0">
              <h3 className="text-sm font-bold text-[#0b1b3d] mb-2 uppercase tracking-wide">
                FROM
              </h3>
              <p className="text-sm font-bold">
                {profile?.company_name || "Your Company"}
              </p>
              <p className="text-xs text-gray-500 whitespace-pre-line mt-1 leading-relaxed">
                {profile?.phone}
                {profile?.email ? `\n${profile.email}` : ""}
                {profile?.company_address ? `\n${profile.company_address}` : ""}
                {profile?.website ? `\n${profile.website}` : ""}
                {profile?.tax_id ? `\nTAX-ID-${profile.tax_id}` : ""}
                {profile?.business_registration
                  ? `\nREG-${profile.business_registration}`
                  : ""}
              </p>
            </div>
            <div className="text-right print:text-right">
              <h3 className="text-sm font-bold text-[#0b1b3d] mb-2 uppercase tracking-wide">
                {clientLabel}
              </h3>
              <p className="text-sm font-bold">{invoice.clientName}</p>
              <p className="text-xs text-gray-500 whitespace-pre-line mt-1 leading-relaxed">
                {invoice.clientAddress || invoice.clientPhone}
              </p>
            </div>
          </section>

          {/* Subject */}
          {subject && (
            <div className="mb-4 px-3.5 py-2 bg-orange-50/50 border-l-4 border-orange-500 text-xs text-[#0b1b3d] flex items-center gap-2 rounded-r">
              <span className="font-bold uppercase tracking-wider text-[10px] text-orange-600">Subject:</span>
              <span className="font-semibold text-[#0b1b3d]">{subject}</span>
            </div>
          )}

          {/* Line Items Table */}
          <section className="mb-8">
            <div className="w-full border border-gray-200">
              <div className={`grid grid-cols-12 bg-[#0b1b3d] text-white py-3 px-4 rounded-t-sm`}>
                <div className="col-span-1 text-xs font-semibold tracking-wider text-center">
                  #
                </div>
                <div className={`${isPricingHidden ? 'col-span-7' : 'col-span-3'} text-xs font-semibold tracking-wider text-left`}>
                  DESCRIPTION
                </div>
                <div className={`${isPricingHidden ? 'col-span-4' : 'col-span-2'} text-xs font-semibold tracking-wider text-center`}>
                  QTY
                </div>
                {!isPricingHidden && (
                  <>
                    <div className="col-span-2 text-xs font-semibold tracking-wider text-center">
                      PRICE
                    </div>
                    <div className="col-span-1 text-xs font-semibold tracking-wider text-center">
                      TAX
                    </div>
                    <div className="col-span-1 text-xs font-semibold tracking-wider text-center text-nowrap text-ellipsis overflow-hidden">
                      DISC.
                    </div>
                    <div className="col-span-2 text-xs font-semibold tracking-wider text-center">
                      AMOUNT
                    </div>
                  </>
                )}
              </div>

              <div className="divide-y divide-gray-200">
                {showGroups && invoice.groups && invoice.groups.length > 0
                  ? (() => {
                      let runningIdx = 0;
                      return invoice.groups.map((group, gIdx) => (
                        <React.Fragment key={gIdx}>
                          {group.name && (
                            <div className="bg-gray-100 col-span-12 px-4 py-2 text-xs font-bold text-[#0b1b3d]">
                              {group.name}
                            </div>
                          )}
                          {group.items.map((item, iIdx) => {
                            runningIdx++;
                            return (
                              <div
                                key={iIdx}
                                className={`template-item-row grid grid-cols-12 py-3 px-4 ${iIdx % 2 !== 0 ? "bg-orange-50/30" : "bg-white"} items-center`}
                              >
                                <div className="col-span-1 text-xs font-mono text-center text-gray-500">
                                  {runningIdx}
                                </div>
                                <div className={`${isPricingHidden ? 'col-span-7' : 'col-span-3'} text-sm font-medium text-left`}>
                                  {item.name}
                                </div>
                                <div className={`${isPricingHidden ? 'col-span-4' : 'col-span-2'} text-sm text-center`}>
                                  {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                                </div>
                                {!isPricingHidden && (
                                  <>
                                    <div className="col-span-2 text-sm text-center">
                                      {formatMoney(item.unitPrice, itemSym)}
                                    </div>
                                    <div className="col-span-1 text-sm text-center">
                                      {formatMoney(tax, itemSym)}
                                    </div>
                                    <div className="col-span-1 text-sm text-center">
                                      {itemSym ? `${itemSym}0` : '0'}
                                    </div>
                                    <div className="col-span-2 text-sm font-medium text-center">
                                      {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                          {showGroupTotals && !isPricingHidden && (
                            <div className="bg-gray-50 flex justify-start px-4 py-2 border-t border-gray-200">
                              <span className="text-xs text-gray-500 font-bold mr-4 uppercase">
                                Group Subtotal
                              </span>
                              <span className="text-xs font-bold text-[#0b1b3d]">
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
                        </React.Fragment>
                      ));
                    })()
                  : items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`template-item-row grid grid-cols-12 py-3 px-4 ${idx % 2 !== 0 ? "bg-orange-50/30" : "bg-white"} items-center`}
                      >
                        <div className="col-span-1 text-xs font-mono text-center text-gray-500">
                          {idx + 1}
                        </div>
                        <div className={`${isPricingHidden ? 'col-span-7' : 'col-span-3'} text-sm font-medium text-left`}>
                          {item.name}
                        </div>
                        <div className={`${isPricingHidden ? 'col-span-4' : 'col-span-2'} text-sm text-center`}>
                          {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                        </div>
                        {!isPricingHidden && (
                          <>
                            <div className="col-span-2 text-sm text-center">
                              {formatMoney(item.unitPrice, itemSym)}
                            </div>
                            <div className="col-span-1 text-sm text-center">
                              {formatMoney(tax, itemSym)}
                            </div>
                            <div className="col-span-1 text-sm text-center">
                              {itemSym ? `${itemSym}0` : '0'}
                            </div>
                            <div className="col-span-2 text-sm font-medium text-center">
                              {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, itemSym)}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
              </div>
            </div>
          </section>

          {/* Bottom Section: N.B. Note, Payment/Bank & Totals, Footer */}
          <div className="mt-auto template-bottom-section">
            {/* N.B. Note - Immediately above payment & bank details */}
            {noteText && (
              <div className="mb-4 pt-2 border-t border-gray-200 text-[11px] text-gray-600 whitespace-pre-line text-left break-inside-avoid template-nb-note">
                <strong className="text-[#0b1b3d]">N.B:</strong> {noteText}
              </div>
            )}

            {/* Payment & Totals */}
            <section className="flex flex-row print:flex-row justify-between items-start gap-8">
            <div className="w-1/2 print:w-1/2">
              {!isPricingHidden && (
                <>
                  <h4 className="text-xs font-bold text-[#0b1b3d] uppercase mb-2">
                    PAYMENT METHOD
                  </h4>
                  {(profile?.bank_enabled ?? true) &&
                  (invoice.bank_name || profile?.bank_name) ? (
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>{invoice.bank_name || profile?.bank_name}</p>
                      {(invoice.bank_account_holder ||
                        profile?.bank_account_holder) && (
                        <p>
                          Account Name:{" "}
                          {invoice.bank_account_holder ||
                            profile?.bank_account_holder}
                        </p>
                      )}
                      {(invoice.bank_account_number ||
                        profile?.bank_account_number) && (
                        <p>
                          Account No:{" "}
                          {invoice.bank_account_number ||
                            profile?.bank_account_number}
                        </p>
                      )}
                      {(invoice.bank_swift || profile?.bank_swift) && (
                        <p>
                          SWIFT/IFSC: {invoice.bank_swift || profile?.bank_swift}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Please refer to the payment instructions provided separately.
                    </p>
                  )}
                </>
              )}

              {invoice.notes && (
                <div className={isPricingHidden ? '' : 'mt-8'}>
                  <h4 className="text-xs font-bold text-[#0b1b3d] uppercase mb-2">
                    NOTES
                  </h4>
                  <p className="text-xs text-gray-400 whitespace-pre-line leading-relaxed">
                    {invoice.notes}
                  </p>
                </div>
              )}

              {((invoice.terms_and_conditions_enabled ?? profile?.terms_and_conditions_enabled ?? true) && (invoice.terms_and_conditions || profile?.terms_and_conditions)) && (
                <div className="mt-8">
                  <h4 className="text-xs font-bold text-[#0b1b3d] uppercase mb-2">
                    TERMS & CONDITIONS
                  </h4>
                  <p className="text-xs text-gray-400 whitespace-pre-line leading-relaxed">
                    {invoice.terms_and_conditions ||
                      profile?.terms_and_conditions}
                  </p>
                </div>
              )}

              {profile?.qr_code_enabled && publicUrl && (
                <div className="mt-8 flex justify-start print:hidden">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 z-20 relative">
                    <QRCodeSVG value={publicUrl} size={72} />
                  </div>
                </div>
              )}
            </div>

            <div className="w-1/2 print:w-1/2 flex flex-col items-end">
              {!isPricingHidden && (
                <div className="w-[80%] mb-8">
                  <div className="flex justify-between py-1.5 text-sm font-semibold text-gray-600">
                    <span>Sub Total</span>
                    <span>{formatMoney(subtotal, sym)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between py-1.5 text-sm font-semibold text-gray-600">
                      <span>Total Discount</span>
                      <span>{formatMoney(discountAmount, sym)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 text-sm font-semibold text-gray-600">
                    <span>Tax Amount</span>
                    <span>{formatMoney(tax, sym)}</span>
                  </div>
                  {shippingCost > 0 && (
                    <div className="flex justify-between py-1.5 text-sm font-semibold text-gray-600">
                      <span>Shipping Amount</span>
                      <span>{formatMoney(shippingCost, sym)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center bg-[#0b1b3d] text-white py-2 px-3 mt-2 rounded-sm shadow-sm">
                    <span className="text-sm font-bold">{isQuotationDoc ? "Quotation Total" : "Total Amount"}</span>
                    <span className="text-lg font-bold">
                      {formatMoney(total, sym)}
                    </span>
                  </div>

                  {amountPaid > 0 && !isQuotationDoc && (
                    <>
                      <div className="flex justify-between py-2 mt-2 text-sm text-gray-500 font-medium">
                        <span>Paid</span>
                        <span>{formatMoney(amountPaid, sym)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-gray-300 text-sm font-bold text-[#0b1b3d]">
                        <span>Balance Due</span>
                        <span>{formatMoney(balanceDue, sym)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {(profile?.signature_enabled ?? true) &&
                (invoice.signature_url ||
                  profile?.signature_url ||
                  invoice.signatory_name ||
                  profile?.signatory_name) && (
                  <div className="flex flex-col items-center">
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
                    <div className="w-32 border-b-2 border-[#0b1b3d] mb-1"></div>
                    <p className="text-xs font-bold text-[#0b1b3d] uppercase tracking-wide">
                      SIGNATURE
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {invoice.signatory_name ||
                        profile?.signatory_name ||
                        (isChallanDoc ? "Received By" : "Authorized Signatory")}
                    </p>
                  </div>
                )}
            </div>
          </section>



          {/* Footer Contact Info */}
          <footer className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap justify-between items-center text-xs font-semibold text-[#0b1b3d] gap-4">
            {profile?.email && <div>{profile.email}</div>}
            {profile?.phone && <div>{profile.phone}</div>}
            {profile?.website && <div>{profile.website}</div>}
            {profile?.tax_id && <div>TAX-ID-{profile.tax_id}</div>}
          </footer>
          </div>
        </div>

        {/* Decorative elements - absolute positioned */}
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-300 rounded-tr-full opacity-40 -ml-10 -mb-10 pointer-events-none z-0"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#0b1b3d] opacity-90 rounded-tl-full -mr-8 -mb-8 pointer-events-none z-0"></div>
      </main>
    </div>
  );
}
