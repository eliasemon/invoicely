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

export function PristineA4Template({
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
      className="min-h-screen py-8 bg-[#f8fafc] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Geist, sans-serif" }}
    >
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white text-[#0f172a] shadow-sm p-8 print:p-6 text-xs flex flex-col justify-between print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        <div>
          {/* Header */}
          <div className="flex flex-row print:flex-row justify-between items-start border-b border-gray-100 pb-6 mb-6">
            <div>
              {profile?.company_logo && (
                <img
                  alt="Company Logo"
                  className="max-h-14 max-w-[190px] mb-2 object-contain w-auto h-auto"
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
                {isChallan ? "CHALLAN" : "INVOICE"}
              </h2>
              <p className="text-xs font-mono text-[#64748b] mt-0.5">
                #{invoice.invoiceNumber}
              </p>
              {profile?.qr_code_enabled && publicUrl && (
                <div className="mt-3 flex justify-end print:justify-end">
                  <QRCodeSVG value={publicUrl} size={48} />
                </div>
              )}
            </div>
          </div>

          {/* Client & Meta */}
          <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider mb-1">
                {isChallan ? "Delivered To" : "Bill To"}
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
              {!isChallan ? (
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
                <tr className="border-b border-[#0f172a] bg-[#f8fafc]">
                  <th className="text-left py-2 px-3 text-[10px] font-semibold uppercase text-[#475569] tracking-wider">
                    Description
                  </th>
                  <th className={`text-right py-2 px-3 text-[10px] font-semibold uppercase text-[#475569] tracking-wider ${isChallan ? 'w-32' : 'w-20'}`}>
                    Qty
                  </th>
                  {!isChallan && (
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
                  ? invoice.groups.map((group, gIdx) => (
                      <React.Fragment key={gIdx}>
                        {group.name && (
                          <tr className="bg-slate-100 font-bold">
                            <td
                              colSpan={isChallan ? 2 : 4}
                              className="py-1 px-3 text-[10px] text-[#0f172a] border-b border-[#cbd5e1] uppercase text-left"
                            >
                              {group.name}
                            </td>
                          </tr>
                        )}
                        {group.items.map((item, iIdx) => (
                          <tr
                            key={iIdx}
                            className="border-b border-gray-100 hover:bg-[#f8fafc] transition-colors"
                          >
                            <td
                              className="py-2 px-3 text-[#0f172a]"
                              style={{ fontFamily: "Geist, sans-serif" }}
                            >
                              {item.name}
                            </td>
                            <td className="py-2 px-3 text-right text-[#475569]">
                              {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                            </td>
                            {!isChallan && (
                              <>
                                <td className="py-2 px-3 text-right text-[#475569]">
                                  {formatMoney(item.unitPrice, sym)}
                                </td>
                                <td className="py-2 px-3 text-right font-semibold text-[#0f172a]">
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
                            <td colSpan={3} className="py-1 px-3 text-[9px] font-medium text-slate-400 uppercase text-right tracking-wide">
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
                        className="border-b border-gray-100 hover:bg-[#f8fafc] transition-colors"
                      >
                        <td
                          className="py-2 px-3 text-[#0f172a]"
                          style={{ fontFamily: "Geist, sans-serif" }}
                        >
                          {item.name}
                        </td>
                        <td className="py-2 px-3 text-right text-[#475569]">
                          {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                        </td>
                        {!isChallan && (
                          <>
                            <td className="py-2 px-3 text-right text-[#475569]">
                              {formatMoney(item.unitPrice, sym)}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-[#0f172a]">
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
                  <span>Total</span>
                  <span>{formatMoney(total, sym)}</span>
                </div>
                {amountPaid > 0 && (
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
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 pt-4 items-start">
            {/* Bank Details - Only in Invoice Mode */}
            {!isChallan && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) ? (
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
                        (isChallan ? "Received By" : "Authorized Signatory")}
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Footer Terms */}
          {((invoice.terms_and_conditions_enabled ?? profile?.terms_and_conditions_enabled ?? true) && (invoice.terms_and_conditions || profile?.terms_and_conditions)) && (
            <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-[#64748b] whitespace-pre-wrap">
              <span className="font-semibold text-[#0f172a]">Terms: </span>
              {invoice.terms_and_conditions || profile?.terms_and_conditions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
