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

export function HighDensityFlatA4Template({
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
      className="min-h-screen py-8 bg-[#f1f5f9] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Geist, sans-serif" }}
    >
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white text-[#0f172a] shadow-sm p-6 print:p-6 text-xs flex flex-col justify-between print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        <div>
          {/* Header */}
          <div className="flex flex-row print:flex-row justify-between items-start border-b border-[#cbd5e1] pb-3 mb-3">
            <div>
              {profile?.company_logo && (
                <img
                  alt="Company Logo"
                  className="max-h-12 max-w-[180px] mb-1.5 object-contain w-auto h-auto"
                  src={profile.company_logo}
                />
              )}
              <h1 className="text-sm font-bold text-[#0f172a]">
                {profile?.company_name || "Your Company"}
              </h1>
              {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                <p className="text-[10px] text-[#64748b] italic mt-0.5">
                  {invoice.brand_voice || profile?.brand_voice}
                </p>
              )}
              <p className="text-[10px] text-[#64748b] whitespace-pre-line mt-0.5">
                {profile?.company_address || ""}
                {profile?.email ? ` • ${profile.email}` : ""}
                {profile?.phone ? ` • ${profile.phone}` : ""}
              </p>
            </div>
            <div className="text-right print:text-right">
              <h2 className="text-lg font-bold text-[#0f172a] uppercase">
                {isChallan ? "CHALLAN" : "INVOICE"}
              </h2>
              <p className="text-xs font-mono text-[#64748b]">
                #{invoice.invoiceNumber}
              </p>
              {profile?.qr_code_enabled && publicUrl && (
                <div className="mt-2 flex justify-end print:justify-end">
                  <QRCodeSVG value={publicUrl} size={44} />
                </div>
              )}
            </div>
          </div>

          {/* Client & Meta bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#f8fafc] rounded border border-[#e2e8f0] mb-3">
            <div className="col-span-2">
              <p className="text-[9px] text-[#94a3b8] uppercase font-semibold">
                {isChallan ? "Delivered To" : "Bill To"}
              </p>
              <p className="font-bold text-[#0f172a] text-xs">
                {invoice.clientName}
              </p>
              <p className="text-[10px] text-[#64748b] whitespace-pre-line mt-0.5">
                {invoice.clientAddress || invoice.clientPhone}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-[#94a3b8] uppercase font-semibold">
                Date
              </p>
              <p className="font-mono text-xs">{formatDate(issueDate)}</p>
            </div>
            {!isChallan ? (
              <div>
                <p className="text-[9px] text-[#94a3b8] uppercase font-semibold">
                  Due
                </p>
                <p className="font-mono text-xs font-semibold">
                  {formatDate(dueDate)}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[9px] text-[#94a3b8] uppercase font-semibold">
                  Type
                </p>
                <span className="text-xs font-semibold text-blue-700">
                  Consignment
                </span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-xs min-w-[450px]">
              <thead>
                <tr className="border-b border-[#0f172a] bg-[#f8fafc]">
                  <th className="text-left py-1 px-2 text-[10px] uppercase text-[#64748b] tracking-wider font-semibold">
                    Item
                  </th>
                  <th className={`text-right py-1 px-2 text-[10px] uppercase text-[#64748b] tracking-wider font-semibold ${isChallan ? 'w-32' : 'w-16'}`}>
                    Qty
                  </th>
                  {!isChallan && (
                    <>
                      <th className="text-right py-1 px-2 text-[10px] uppercase text-[#64748b] tracking-wider w-24 font-semibold">
                        Rate
                      </th>
                      <th className="text-right py-1 px-2 text-[10px] uppercase text-[#64748b] tracking-wider w-28 font-semibold">
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
                          <tr className="bg-slate-200 font-bold">
                            <td
                              colSpan={isChallan ? 2 : 4}
                              className="py-0.5 px-2 text-[10px] text-[#0f172a] border-b border-[#cbd5e1] uppercase text-left"
                            >
                              {group.name}
                            </td>
                          </tr>
                        )}
                        {group.items.map((item, iIdx) => (
                          <tr
                            key={iIdx}
                            className={`border-b border-[#e2e8f0] ${iIdx % 2 === 1 ? "bg-[#f8fafc]" : ""}`}
                          >
                            <td
                              className="py-1 px-2 text-[#0f172a]"
                              style={{ fontFamily: "Geist, sans-serif" }}
                            >
                              {item.name}
                            </td>
                            <td className="py-1 px-2 text-right text-[#475569]">
                              {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                            </td>
                            {!isChallan && (
                              <>
                                <td className="py-1 px-2 text-right text-[#475569]">
                                  {formatMoney(item.unitPrice, sym)}
                                </td>
                                <td className="py-1 px-2 text-right font-semibold text-[#0f172a]">
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
                            <td colSpan={3} className="py-0.5 px-2 text-[9px] font-medium text-slate-400 uppercase text-right tracking-wide">
                              Group Subtotal
                            </td>
                            <td
                              className="py-0.5 px-2 text-right text-[10px] font-medium text-slate-500"
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
                        className={`border-b border-[#e2e8f0] ${idx % 2 === 1 ? "bg-[#f8fafc]" : ""}`}
                      >
                        <td
                          className="py-1 px-2 text-[#0f172a]"
                          style={{ fontFamily: "Geist, sans-serif" }}
                        >
                          {item.name}
                        </td>
                        <td className="py-1 px-2 text-right text-[#475569]">
                          {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                        </td>
                        {!isChallan && (
                          <>
                            <td className="py-1 px-2 text-right text-[#475569]">
                              {formatMoney(item.unitPrice, sym)}
                            </td>
                            <td className="py-1 px-2 text-right font-semibold text-[#0f172a]">
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
            <div className="flex justify-end mb-3">
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
                    <div className="flex justify-between py-1 border-t border-gray-400 text-xs font-bold text-gray-900">
                      <span>Due</span>
                      <span>{formatMoney(balanceDue, sym)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bank details & Signature */}
        <div>
          <div className="flex flex-row print:flex-row justify-between items-start border-t border-[#cbd5e1] pt-3">
            {/* Bank details - Only in Invoice Mode */}
            {!isChallan && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) ? (
              <div className="text-[10px] text-[#64748b] space-y-0.5 font-mono">
                <p className="font-semibold text-[#0f172a]">
                  Bank: {invoice.bank_name || profile?.bank_name}
                </p>
                {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                  <p>
                    Holder:{" "}
                    {invoice.bank_account_holder || profile?.bank_account_holder}
                  </p>
                )}
                {(invoice.bank_account_number || profile?.bank_account_number) && (
                  <p>
                    Account:{" "}
                    {invoice.bank_account_number || profile?.bank_account_number}
                  </p>
                )}
                {(invoice.bank_swift || profile?.bank_swift) && (
                  <p>
                    SWIFT: {invoice.bank_swift || profile?.bank_swift}
                  </p>
                )}
              </div>
            ) : (
              <div>
                {invoice.notes && (
                  <div className="text-[10px] text-[#64748b]">
                    <span className="font-semibold text-[#0f172a]">Notes: </span>
                    {invoice.notes}
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
            <div className="mt-3 pt-2 border-t border-[#e2e8f0] text-[9px] text-[#64748b] whitespace-pre-wrap">
              <span className="font-semibold text-[#0f172a]">Terms: </span>
              {invoice.terms_and_conditions || profile?.terms_and_conditions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
