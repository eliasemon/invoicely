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
} from "./templateUtils";

export function SleekAccentTemplate({
  invoice,
  profile,
  isPreview,
  showGroups,
  showGroupTotals,
  publicUrl,
}: TemplateProps) {
  const sym = invoice.currency_symbol || "$";
  const issueDate = getIssueDate(invoice);
  const dueDate = getDueDate(invoice);
  const subtotal = getSubtotal(invoice);
  const discountAmount = getDiscountAmount(invoice, subtotal);
  const shippingCost = getShippingCost(invoice);
  const total = getTotal(invoice);
  const amountPaid = getAmountPaid(invoice);
  const balanceDue = Math.max(0, total - amountPaid);
  const items = getAllItems(invoice);

  const tax = 0; // Keeping tax as 0 as per other templates unless specified in invoice

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
        <div className="flex-1 flex flex-col p-8 p-12 print:p-10 relative z-10">
          {/* Header */}
          <header className="flex flex-row print:flex-row justify-between items-start mb-10">
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
                INVOICE #
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-right text-sm">
                <span className="text-gray-500 font-medium">INVOICE # :</span>
                <span className="font-semibold">
                  {invoice.invoiceNumber ||
                    invoice.id?.substring(0, 8).toUpperCase()}
                </span>
                <span className="text-gray-500 font-medium">
                  CREATION DATE :
                </span>
                <span>{formatDate(issueDate)}</span>
                <span className="text-gray-500 font-medium">DUE DATE :</span>
                <span>{formatDate(dueDate)}</span>
              </div>
            </div>
          </header>

          {/* Addresses */}
          <section className="flex flex-row print:flex-row justify-between mb-8">
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
                BILL TO
              </h3>
              <p className="text-sm font-bold">{invoice.clientName}</p>
              <p className="text-xs text-gray-500 whitespace-pre-line mt-1 leading-relaxed">
                {invoice.clientAddress || invoice.clientPhone}
              </p>
            </div>
          </section>

          {/* Line Items Table */}
          <section className="mb-8">
            <div className="w-full border border-gray-200">
              <div className="grid grid-cols-12 bg-[#0b1b3d] text-white py-3 px-4 rounded-t-sm">
                <div className="col-span-4 text-xs font-semibold tracking-wider text-center">
                  DESCRIPTION
                </div>
                <div className="col-span-2 text-xs font-semibold tracking-wider text-center">
                  QTY
                </div>
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
              </div>

              <div className="divide-y divide-gray-200">
                {showGroups && invoice.groups && invoice.groups.length > 0
                  ? invoice.groups.map((group, gIdx) => (
                      <React.Fragment key={gIdx}>
                        {group.name && (
                          <div className="bg-gray-100 col-span-12 px-4 py-2 text-xs font-bold text-[#0b1b3d]">
                            {group.name}
                          </div>
                        )}
                        {group.items.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            className={`grid grid-cols-12 py-3 px-4 ${iIdx % 2 !== 0 ? "bg-orange-50/30" : "bg-white"} items-center`}
                          >
                            <div className="col-span-4 text-sm font-medium text-center">
                              {item.name}
                            </div>
                            <div className="col-span-2 text-sm text-center">
                              {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                            </div>
                            <div className="col-span-2 text-sm text-center">
                              {formatMoney(item.unitPrice, sym)}
                            </div>
                            <div className="col-span-1 text-sm text-center">
                              {formatMoney(tax, sym)}
                            </div>
                            <div className="col-span-1 text-sm text-center">
                              {sym}0
                            </div>
                            <div className="col-span-2 text-sm font-medium text-center">
                              {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, sym)}
                            </div>
                          </div>
                        ))}
                        {showGroupTotals && (
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
                                sym,
                              )}
                            </span>
                          </div>
                        )}
                      </React.Fragment>
                    ))
                  : items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`grid grid-cols-12 py-3 px-4 ${idx % 2 !== 0 ? "bg-orange-50/30" : "bg-white"} items-center`}
                      >
                        <div className="col-span-4 text-sm font-medium text-center">
                          {item.name}
                        </div>
                        <div className="col-span-2 text-sm text-center">
                          {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                        </div>
                        <div className="col-span-2 text-sm text-center">
                          {formatMoney(item.unitPrice, sym)}
                        </div>
                        <div className="col-span-1 text-sm text-center">
                          {formatMoney(tax, sym)}
                        </div>
                        <div className="col-span-1 text-sm text-center">
                          {sym}0
                        </div>
                        <div className="col-span-2 text-sm font-medium text-center">
                          {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, sym)}
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </section>

          {/* Payment & Totals */}
          <section className="flex flex-row print:flex-row justify-between items-start mt-auto gap-8">
            <div className="w-1/2 print:w-1/2">
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

              {invoice.notes && (
                <div className="mt-8">
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
              <div className="w-[80%]">
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
                  <span className="text-sm font-bold">Total Amount</span>
                  <span className="text-lg font-bold">
                    {formatMoney(total, sym)}
                  </span>
                </div>

                {amountPaid > 0 && (
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

              {(profile?.signature_enabled ?? true) &&
                (invoice.signature_url ||
                  profile?.signature_url ||
                  invoice.signatory_name ||
                  profile?.signatory_name) && (
                  <div className="mt-12 flex flex-col items-center">
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
                        "Authorized Signatory"}
                    </p>
                  </div>
                )}
            </div>
          </section>

          {/* Footer Contact Info */}
          <footer className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap justify-between items-center text-xs font-semibold text-[#0b1b3d] gap-4">
            {profile?.email && <div>{profile.email}</div>}
            {profile?.phone && <div>{profile.phone}</div>}
            {profile?.website && <div>{profile.website}</div>}
            {profile?.tax_id && <div>TAX-ID-{profile.tax_id}</div>}
          </footer>
        </div>

        {/* Decorative elements - absolute positioned */}
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-300 rounded-tr-full opacity-40 -ml-10 -mb-10 pointer-events-none z-0"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#0b1b3d] opacity-90 rounded-tl-full -mr-8 -mb-8 pointer-events-none z-0"></div>
      </main>
    </div>
  );
}
