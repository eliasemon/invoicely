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

export function HeritageA4Template({
  invoice,
  profile,
  showGroups,
  showGroupTotals,
  publicUrl,
  isChallan,
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

  return (
    <div
      className="min-h-screen py-8 bg-[#fdfaf5] text-[#451a03] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
    >
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-[#fffefb] border-2 border-[#b45309] shadow-xl p-6 print:p-6 relative overflow-hidden print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0 flex flex-col justify-between">
        <div>
          {/* Vintage border inner */}
          <div className="border border-[#d97706]/40 p-5 mb-4">
            {/* Header */}
            <div className="flex flex-row print:flex-row justify-between items-start border-b-2 border-[#b45309] pb-4 mb-4">
              <div>
                {profile?.company_logo && (
                  <img
                    alt="Logo"
                    className="max-h-16 max-w-[200px] mb-2 object-contain w-auto h-auto"
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
                  className="text-[11px] text-[#92400e] whitespace-pre-line mt-1"
                  style={{ fontFamily: "Geist, serif" }}
                >
                  {profile?.company_address || ""}
                  {profile?.email ? ` • ${profile.email}` : ""}
                  {profile?.phone ? ` • ${profile.phone}` : ""}
                </div>
              </div>
              <div className="text-right print:text-right">
                <h2 className="text-2xl font-bold tracking-widest text-[#78350f] uppercase">
                  {isChallan ? "CHALLAN" : "INVOICE"}
                </h2>
                <p
                  className="text-xs text-[#92400e] font-mono mt-1"
                  style={{ fontFamily: "Geist, monospace" }}
                >
                  N° {invoice.invoiceNumber}
                </p>
                {profile?.qr_code_enabled && publicUrl && (
                  <div className="mt-3 flex justify-end print:justify-end">
                    <QRCodeSVG value={publicUrl} size={48} />
                  </div>
                )}
              </div>
            </div>

            {/* Bill To & Dates */}
            <div className="grid grid-cols-2 gap-4 mb-4 pb-3 border-b border-[#d97706]/30">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#b45309] tracking-wider mb-1">
                  {isChallan ? "DELIVERED TO" : "BILL TO"}
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
                {!isChallan ? (
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
                      Delivery
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs min-w-[450px]">
                <thead>
                  <tr className="border-b-2 border-[#b45309]">
                    <th className="text-left py-2 px-3 text-[10px] font-bold uppercase text-[#78350f] tracking-wider">
                      Description
                    </th>
                    <th className={`text-right py-2 px-3 text-[10px] font-bold uppercase text-[#78350f] tracking-wider ${isChallan ? 'w-32' : 'w-20'}`}>
                      Qty
                    </th>
                    {!isChallan && (
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
                    ? invoice.groups.map((group, gIdx) => (
                        <React.Fragment key={gIdx}>
                          {group.name && (
                            <tr className="bg-[#fef3c7]/60 font-bold">
                              <td
                                colSpan={isChallan ? 2 : 4}
                                className="py-1 px-3 text-[11px] text-[#78350f] border-b border-[#d97706]/20 uppercase text-left"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                              >
                                {group.name}
                              </td>
                            </tr>
                          )}
                          {group.items.map((item, iIdx) => (
                            <tr
                              key={iIdx}
                              className="border-b border-[#d97706]/20 hover:bg-[#fef3c7]/30 transition-colors"
                            >
                              <td
                                className="py-2 px-3 text-[#451a03]"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                              >
                                {item.name}
                              </td>
                              <td className="py-2 px-3 text-right text-[#92400e]">
                                {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                              </td>
                              {!isChallan && (
                                <>
                                  <td className="py-2 px-3 text-right text-[#92400e]">
                                    {formatMoney(item.unitPrice, sym)}
                                  </td>
                                  <td className="py-2 px-3 text-right font-semibold text-[#78350f]">
                                    {formatMoney(
                                      (item.isFlatRate ? 1 : item.quantity) * item.unitPrice,
                                      sym,
                                    )}
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}

                          {showGroupTotals && !isChallan && (
                            <tr className="bg-transparent">
                              <td colSpan={3} className="py-1 px-3 text-[9px] font-medium text-[#b45309] uppercase text-right tracking-wide">
                                Group Subtotal
                              </td>
                              <td className="py-1 px-3 text-right text-[10px] font-medium text-[#78350f]">
                                {formatMoney(
                                  group.items.reduce(
                                    (sum, item) =>
                                      sum + (item.isFlatRate ? 1 : item.quantity) * item.unitPrice,
                                    0,
                                  ),
                                  sym,
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    : items.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-[#d97706]/20 hover:bg-[#fef3c7]/30 transition-colors"
                        >
                          <td
                            className="py-2 px-3 text-[#451a03]"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {item.name}
                          </td>
                          <td className="py-2 px-3 text-right text-[#92400e]">
                            {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                          </td>
                          {!isChallan && (
                            <>
                              <td className="py-2 px-3 text-right text-[#92400e]">
                                {formatMoney(item.unitPrice, sym)}
                              </td>
                              <td className="py-2 px-3 text-right font-semibold text-[#78350f]">
                                {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, sym)}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {/* Totals - Only in Invoice Mode */}
            {!isChallan && (
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
                    <span>TOTAL DUE</span>
                    <span>{formatMoney(total, sym)}</span>
                  </div>
                  {amountPaid > 0 && (
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

        {/* Bank Details & Signature Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t-2 border-[#b45309] pt-4 items-start">
          {/* Bank Details - Only in Invoice Mode */}
          {!isChallan && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) ? (
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
                      (isChallan ? "Received By" : "Authorized Signatory")}
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Footer Terms */}
        {((invoice.terms_and_conditions_enabled ?? profile?.terms_and_conditions_enabled ?? true) && (invoice.terms_and_conditions || profile?.terms_and_conditions)) && (
          <div className="mt-4 pt-3 border-t border-[#d97706]/30 text-[10px] text-[#92400e] whitespace-pre-wrap">
            <p className="font-semibold text-[#78350f] mb-0.5">
              Terms & Conditions
            </p>
            <p>{invoice.terms_and_conditions || profile?.terms_and_conditions}</p>
          </div>
        )}
      </div>
    </div>
  );
}
