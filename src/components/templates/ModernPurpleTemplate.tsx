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
  getAllItems,
} from "./templateUtils";
import { MaterialIcon } from "@/components/shared/MaterialIcon";

export function ModernPurpleTemplate({
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
  const amountPaid = invoice.amountPaid || 0;
  const balanceDue = Math.max(0, total - amountPaid);
  const items = getAllItems(invoice);

  const tax = 0; // Using 0 as tax amount for the placeholder

  return (
    <div
      className="min-h-screen py-8 bg-[#fcfcff] text-[#4a4c59] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {" "}
      {/* Floating Actions */}{" "}
      {!isPreview && (
        <div className="fixed top-6 right-12 z-50 flex gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-[#7c3aed] text-white px-6 py-2.5 rounded-full shadow-md text-xs flex items-center gap-2 hover:bg-[#6d28d9] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Download PDF
          </button>
        </div>
      )}
      {/* Invoice Canvas */}
      <main className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col relative print:shadow-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        <div className="flex-1 flex flex-col p-10 p-12 print:p-10 relative z-10">
          {/* Header */}
          <header className="flex flex-row print:flex-row justify-between items-start mb-12">
            <div className="flex items-center gap-6">
              {profile?.company_logo ? (
                <div className="border border-dashed border-[#d8b4fe] p-2 rounded-lg">
                  <img
                    alt="Company Logo"
                    className="h-16 w-16 object-contain"
                    src={profile.company_logo}
                  />
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-[#c084fc] bg-[#faf5ff] text-[#9333ea] flex items-center justify-center font-bold tracking-widest rounded-lg">
                  LOGO
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold text-[#1f2937]">
                  {profile?.company_name || "Your Company"}
                </h1>
                {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                  <p className="text-[12px] text-gray-500 italic mt-0.5">
                    {invoice.brand_voice || profile?.brand_voice}
                  </p>
                )}
                <p className="text-sm text-gray-500 whitespace-pre-line mt-1">
                  {profile?.company_address ||
                    "123 Business Rd.\nCity, Country"}
                </p>
              </div>
            </div>
            <div className="text-right mt-6 mt-0 print:mt-0">
              <h2 className="text-3xl font-bold text-[#8b5cf6] mb-2 tracking-wide uppercase">
                INVOICE
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-right text-sm">
                <span className="text-gray-500">Number:</span>
                <span className="text-gray-700 font-medium">
                  #
                  {invoice.invoiceNumber ||
                    invoice.id?.substring(0, 8).toUpperCase()}
                </span>
                <span className="text-gray-500">Date:</span>
                <span className="text-gray-700 font-medium">
                  {formatDate(issueDate)}
                </span>
                <span className="text-gray-500">Due date:</span>
                <span className="text-gray-700 font-medium">
                  {formatDate(dueDate)}
                </span>
              </div>
            </div>
          </header>

          {/* Addresses */}
          <section className="flex flex-row print:flex-row justify-between mb-10 text-sm">
            <div className="w-full w-[45%] print:w-[45%] mb-6 mb-0 print:mb-0">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                BILL TO
              </h3>
              <p className="font-semibold text-gray-800 text-base">
                {invoice.clientName}
              </p>
              <p className="text-gray-500 whitespace-pre-line mt-1 leading-relaxed">
                {invoice.clientAddress || "Client Address\nNot provided"}
              </p>
              {invoice.clientPhone && (
                <p className="text-gray-500 mt-1">{invoice.clientPhone}</p>
              )}
            </div>
            <div className="w-full w-[45%] print:w-[45%]">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                SHIP TO
              </h3>
              <p className="font-semibold text-gray-800 text-base">
                {invoice.clientName}
              </p>
              <p className="text-gray-500 whitespace-pre-line mt-1 leading-relaxed">
                {invoice.clientAddress || "Client Address\nNot provided"}
              </p>
              {invoice.clientPhone && (
                <p className="text-gray-500 mt-1">{invoice.clientPhone}</p>
              )}
            </div>
          </section>

          {/* Line Items Table */}
          <section className="mb-8 border-t-[3px] border-[#a78bfa]">
            <div className="w-full">
              <div className="grid grid-cols-12 bg-[#f5f3ff] text-[#4c1d95] py-2 px-3">
                <div className="col-span-5 text-xs font-bold tracking-wide uppercase">
                  ITEM DETAILS
                </div>
                <div className="col-span-2 text-xs font-bold tracking-wide uppercase text-right">
                  PRICE
                </div>
                <div className="col-span-1 text-xs font-bold tracking-wide uppercase text-right">
                  QTY
                </div>
                <div className="col-span-1 text-xs font-bold tracking-wide uppercase text-right">
                  DISC
                </div>
                <div className="col-span-1 text-xs font-bold tracking-wide uppercase text-right">
                  TAX
                </div>
                <div className="col-span-2 text-xs font-bold tracking-wide uppercase text-right">
                  TOTAL
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {showGroups && invoice.groups && invoice.groups.length > 0
                  ? invoice.groups.map((group, gIdx) => (
                      <React.Fragment key={gIdx}>
                        {group.name && (
                          <div className="bg-gray-50 col-span-12 px-3 py-2 text-xs font-bold text-gray-600 border-b border-gray-100">
                            {group.name}
                          </div>
                        )}
                        {group.items.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            className="grid grid-cols-12 py-3 px-3 items-center"
                          >
                            <div className="col-span-5 pr-2">
                              <p className="font-medium text-gray-800 text-sm">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Item description or category
                              </p>
                            </div>
                            <div className="col-span-2 text-sm text-gray-600 text-right">
                              {formatMoney(item.unitPrice, sym)}
                            </div>
                            <div className="col-span-1 text-sm text-gray-600 text-right">
                              {item.quantity}
                            </div>
                            <div className="col-span-1 text-sm text-gray-600 text-right">
                              0%
                            </div>
                            <div className="col-span-1 text-sm text-gray-600 text-right">
                              0%
                            </div>
                            <div className="col-span-2 text-sm font-medium text-gray-800 text-right">
                              {formatMoney(item.quantity * item.unitPrice, sym)}
                            </div>
                          </div>
                        ))}
                        {showGroupTotals && (
                          <div className="bg-[#fdfcff] flex justify-start px-3 py-2">
                            <span className="text-xs text-gray-500 font-medium mr-4">
                              Group Subtotal
                            </span>
                            <span className="text-xs font-semibold text-gray-700">
                              {formatMoney(
                                group.items.reduce(
                                  (sum, item) =>
                                    sum + item.quantity * item.unitPrice,
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
                        className="grid grid-cols-12 py-3 px-3 items-center"
                      >
                        <div className="col-span-5 pr-2">
                          <p className="font-medium text-gray-800 text-sm">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Item description or category
                          </p>
                        </div>
                        <div className="col-span-2 text-sm text-gray-600 text-right">
                          {formatMoney(item.unitPrice, sym)}
                        </div>
                        <div className="col-span-1 text-sm text-gray-600 text-right">
                          {item.quantity}
                        </div>
                        <div className="col-span-1 text-sm text-gray-600 text-right">
                          0%
                        </div>
                        <div className="col-span-1 text-sm text-gray-600 text-right">
                          0%
                        </div>
                        <div className="col-span-2 text-sm font-medium text-gray-800 text-right">
                          {formatMoney(item.quantity * item.unitPrice, sym)}
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </section>

          {/* Payment & Totals */}
          <section className="flex flex-row print:flex-row justify-between items-start mt-4 gap-8">
            <div className="w-1/2 print:w-1/2 space-y-5">
              {(profile?.bank_enabled ?? true) &&
              (invoice.bank_name || profile?.bank_name) ? (
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-2">
                    Bank transfer
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{invoice.bank_name || profile?.bank_name}</p>
                    {(invoice.bank_account_holder ||
                      profile?.bank_account_holder) && (
                      <p>
                        Account:{" "}
                        {invoice.bank_account_holder ||
                          profile?.bank_account_holder}
                      </p>
                    )}
                    {(invoice.bank_account_number ||
                      profile?.bank_account_number) && (
                      <p>
                        A/C:{" "}
                        {invoice.bank_account_number ||
                          profile?.bank_account_number}
                      </p>
                    )}
                    {(invoice.bank_swift || profile?.bank_swift) && (
                      <p>SWIFT: {invoice.bank_swift || profile?.bank_swift}</p>
                    )}
                  </div>
                </div>
              ) : null}

              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-1">Note</h4>
                <p className="text-sm text-gray-500 whitespace-pre-line">
                  {invoice.notes ||
                    "Thank you for visiting us and making your first purchase! We're glad that you found what you were looking for. We look forward to seeing you again."}
                </p>
              </div>

              {(invoice.terms_and_conditions ||
                profile?.terms_and_conditions) && (
                <div className="w-1/2 whitespace-pre-wrap">
                  <h4 className="text-sm font-bold text-gray-800 mb-1">
                    Terms and Conditions
                  </h4>
                  <p className="text-xs text-gray-600">
                    {invoice.terms_and_conditions ||
                      profile?.terms_and_conditions}
                  </p>
                </div>
              )}

              {profile?.qr_code_enabled && publicUrl && (
                <div className="pt-4 flex justify-start print:hidden">
                  <div className="bg-white p-2 rounded-lg border border-purple-100 shadow-sm z-20 relative">
                    <QRCodeSVG value={publicUrl} size={72} />
                  </div>
                </div>
              )}
            </div>

            <div className="w-full w-[45%] print:w-[45%] flex flex-col">
              <div className="space-y-2 border-b border-gray-200 pb-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-700">Subtotal</span>
                  <span className="font-semibold text-gray-800">
                    {formatMoney(subtotal, sym)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Discount</span>
                    <span>{formatMoney(discountAmount, sym)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax</span>
                  <span>{formatMoney(tax, sym)}</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span>
                    <span>{formatMoney(shippingCost, sym)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-medium pt-1 border-t border-gray-100">
                  <span className="text-gray-700">Total</span>
                  <span className="text-gray-800">
                    {formatMoney(total, sym)}
                  </span>
                </div>
                {amountPaid > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Paid</span>
                    <span>{formatMoney(amountPaid, sym)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center bg-gradient-to-r from-[#e9d5ff] to-[#f3e8ff] py-3 px-4 mt-3">
                <span className="font-bold text-[#4c1d95]">Balance due</span>
                <span className="font-bold text-[#4c1d95]">
                  {formatMoney(balanceDue, sym)}
                </span>
              </div>
            </div>
          </section>

          {/* Signatures */}
          <section className="mt-12 flex justify-end gap-16 print:mt-auto">
            {(profile?.signature_enabled ?? true) &&
              (invoice.signature_url ||
                profile?.signature_url ||
                invoice.signatory_name ||
                profile?.signatory_name) && (
                <div className="flex flex-col items-center">
                  {invoice.signature_url || profile?.signature_url ? (
                    <img
                      src={
                        invoice.signature_url ||
                        profile?.signature_url ||
                        undefined
                      }
                      alt="Signature"
                      className="h-10 mb-2 object-contain"
                    />
                  ) : (
                    <div className="h-10 mb-2"></div>
                  )}
                  <div className="w-32 border-b border-gray-400 mb-1"></div>
                  <p className="text-sm font-semibold text-gray-700">
                    {profile?.company_name || "Example Business"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(issueDate)}
                  </p>
                </div>
              )}

            <div className="flex flex-col items-center">
              <div className="h-10 mb-2"></div>
              <div className="w-32 border-b border-gray-400 mb-1"></div>
              <p className="text-sm font-semibold text-gray-700">Client Name</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDate(dueDate)}
              </p>
            </div>
          </section>
        </div>

        {/* Footer Contact Info */}
        <footer className="mt-auto py-5 bg-[#fcfcff] border-t border-gray-100 flex flex-wrap justify-center items-center text-sm text-gray-600 gap-8 px-10">
          {profile?.email && (
            <div className="flex items-center gap-2">
              <div className="bg-[#8b5cf6] text-white p-1 rounded-full flex items-center justify-center">
                <MaterialIcon icon="mail" className="text-[14px]" />
              </div>
              <span>{profile.email}</span>
            </div>
          )}
          {profile?.phone && (
            <div className="flex items-center gap-2">
              <div className="bg-[#8b5cf6] text-white p-1 rounded-full flex items-center justify-center">
                <MaterialIcon icon="call" className="text-[14px]" />
              </div>
              <span>{profile.phone}</span>
            </div>
          )}
          {profile?.website && (
            <div className="flex items-center gap-2">
              <div className="bg-[#8b5cf6] text-white p-1 rounded-full flex items-center justify-center">
                <MaterialIcon icon="language" className="text-[14px]" />
              </div>
              <span>{profile.website.replace(/^https?:\/\//, "")}</span>
            </div>
          )}
        </footer>
      </main>
    </div>
  );
}
