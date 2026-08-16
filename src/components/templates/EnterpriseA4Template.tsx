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

export function EnterpriseA4Template({
  invoice,
  profile,
  isPreview,
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
      className="min-h-screen py-8 bg-[#f1f5f9] text-[#1e293b] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="flex justify-center items-start p-6 print:p-0 print:m-0 print:block print:w-[210mm] max-w-full overflow-hidden print:overflow-visible">
        <div className="w-full max-w-[210mm] min-w-0 min-h-[297mm] mx-auto print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm]">
          {/* Action Bar */}
          {!isPreview && (
            <div className="flex flex-row justify-between items-center gap-2 bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm mb-3 print:hidden">
              <div>
                <h2
                  className="text-sm font-semibold text-[#1e293b]"
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                >
                  {isChallan ? "Challan" : "Invoice"} #{invoice.invoiceNumber}
                </h2>
                <p className="text-[11px] text-[#64748b]">
                  Viewing Enterprise (A4) Template
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-[#1e40af] text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer hover:bg-blue-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                Download PDF
              </button>
            </div>
          )}
          {/* Invoice Document */}
          <div className="bg-white w-full shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#e2e8f0] p-6 print:p-6 text-xs flex flex-col justify-between print:shadow-none print:rounded-none print:border-none">
            <div>
              {/* Header */}
              <div className="flex flex-row print:flex-row justify-between items-start border-b border-[#e2e8f0] pb-4 mb-4">
                <div>
                  {profile?.company_logo && (
                    <img
                      alt="Logo"
                      className="max-h-12 max-w-[180px] mb-2 object-contain w-auto h-auto"
                      src={profile.company_logo}
                    />
                  )}
                  <h1 className="text-base font-bold text-[#1e293b]">
                    {profile?.company_name || "Your Company"}
                  </h1>
                  {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                    <p className="text-[11px] text-[#64748b] italic mb-1">
                      {invoice.brand_voice || profile?.brand_voice}
                    </p>
                  )}
                  <div className="text-[11px] text-[#64748b] whitespace-pre-line mt-1">
                    {profile?.company_address || ""}
                    {profile?.email ? `\n${profile.email}` : ""}
                    {profile?.phone ? `\n${profile.phone}` : ""}
                  </div>
                </div>
                <div className="text-right print:text-right">
                  <h2 className="text-xl font-bold text-[#1e40af] uppercase">
                    {isChallan ? "CHALLAN" : "INVOICE"}
                  </h2>
                  <p className="font-mono text-sm text-[#475569]">
                    #{invoice.invoiceNumber || invoice.id?.substring(0, 8).toUpperCase()}
                  </p>
                  {profile?.qr_code_enabled && publicUrl && (
                    <div className="mt-2 flex justify-end print:justify-end">
                      <QRCodeSVG value={publicUrl} size={48} />
                    </div>
                  )}
                </div>
              </div>

              {/* Bill To & Dates */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] mb-4">
                <div className="col-span-2">
                  <p className="text-[10px] text-[#94a3b8] uppercase font-semibold mb-1">
                    {isChallan ? "Delivered To" : "Billed To"}
                  </p>
                  <p className="font-bold text-[#1e293b]">{invoice.clientName}</p>
                  <p className="text-[11px] text-[#64748b] mt-1 whitespace-pre-line">
                    {invoice.clientAddress || invoice.clientPhone}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#94a3b8] uppercase font-semibold mb-1">
                    Issue Date
                  </p>
                  <p className="font-mono">{formatDate(issueDate)}</p>
                </div>
                {!isChallan ? (
                  <div>
                    <p className="text-[10px] text-[#94a3b8] uppercase font-semibold mb-1">
                      Due Date
                    </p>
                    <p className="font-mono">{formatDate(dueDate)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] text-[#94a3b8] uppercase font-semibold mb-1">
                      Type
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      Delivery
                    </span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-xs min-w-[450px]">
                  <thead>
                    <tr className="bg-[#1e40af] text-white">
                      <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider font-semibold">
                        Description
                      </th>
                      <th className={`text-right py-2 px-3 text-[10px] uppercase tracking-wider font-semibold ${isChallan ? 'w-32' : 'w-20'}`}>
                        Qty
                      </th>
                      {!isChallan && (
                        <>
                          <th className="text-right py-2 px-3 text-[10px] uppercase tracking-wider font-semibold w-28">
                            Unit Price
                          </th>
                          <th className="text-right py-2 px-3 text-[10px] uppercase tracking-wider font-semibold w-28">
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
                                  className="py-1.5 px-3 text-[10px] text-[#1e293b] border-b border-[#e2e8f0] uppercase text-left font-semibold"
                                  style={{ fontFamily: "Geist, sans-serif" }}
                                >
                                  {group.name}
                                </td>
                              </tr>
                            )}
                            {group.items.map((item, iIdx) => (
                              <tr
                                key={iIdx}
                                className={`border-b border-[#f1f5f9] ${iIdx % 2 === 1 ? "bg-[#f8fafc]" : ""}`}
                              >
                                <td
                                  className="py-2 px-3 text-[#1e293b]"
                                  style={{ fontFamily: "Geist, sans-serif" }}
                                >
                                  {item.name}
                                </td>
                                <td className="py-2 px-3 text-right text-[#64748b]">
                                  {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                                </td>
                                {!isChallan && (
                                  <>
                                    <td className="py-2 px-3 text-right text-[#64748b]">
                                      {formatMoney(item.unitPrice, sym)}
                                    </td>
                                    <td className="py-2 px-3 text-right font-semibold text-[#1e293b]">
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
                                <td
                                  colSpan={3}
                                  className="py-1 px-3 text-[9px] font-medium text-slate-400 uppercase text-right tracking-wide"
                                >
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
                            className={`border-b border-[#f1f5f9] ${idx % 2 === 1 ? "bg-[#f8fafc]" : ""}`}
                          >
                            <td
                              className="py-2 px-3 text-[#1e293b]"
                              style={{ fontFamily: "Geist, sans-serif" }}
                            >
                              {item.name}
                            </td>
                            <td className="py-2 px-3 text-right text-[#64748b]">
                              {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                            </td>
                            {!isChallan && (
                              <>
                                <td className="py-2 px-3 text-right text-[#64748b]">
                                  {formatMoney(item.unitPrice, sym)}
                                </td>
                                <td className="py-2 px-3 text-right font-semibold text-[#1e293b]">
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
                  <div className="w-64 print:w-64">
                    <div className="flex justify-between py-1.5 text-xs text-[#64748b] font-mono border-b border-[#f1f5f9]">
                      <span>Subtotal</span>
                      <span>{formatMoney(subtotal, sym)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between py-1.5 text-xs text-[#64748b] font-mono border-b border-[#f1f5f9]">
                        <span>
                          Discount{" "}
                          {invoice.discount_type === "percentage"
                            ? `(${invoice.discount_value}%)`
                            : ""}
                        </span>
                        <span className="text-red-600">-{formatMoney(discountAmount, sym)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5 text-xs text-[#64748b] font-mono border-b border-[#f1f5f9]">
                      <span>Tax (0%)</span>
                      <span>{formatMoney(0, sym)}</span>
                    </div>
                    {shippingCost > 0 && (
                      <div className="flex justify-between py-1.5 text-xs text-[#64748b] font-mono border-b border-[#f1f5f9]">
                        <span>Shipping</span>
                        <span>+{formatMoney(shippingCost, sym)}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-2 mt-1 text-sm font-bold text-[#1e40af] font-mono bg-[#eff6ff] px-3 rounded">
                      <span>Total Due</span>
                      <span>{formatMoney(total, sym)}</span>
                    </div>
                    {amountPaid > 0 && (
                      <>
                        <div className="flex justify-between py-1.5 text-xs text-gray-500 font-medium">
                          <span>Paid</span>
                          <span>{formatMoney(amountPaid, sym)}</span>
                        </div>
                        <div className="flex justify-between py-2 mt-1 border-t border-gray-400 text-xs font-bold text-gray-900">
                          <span>Balance Due</span>
                          <span>{formatMoney(balanceDue, sym)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bank Details & Signature Section */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 border-t border-[#e2e8f0] pt-4 text-left w-full items-start">
                {/* Bank Details - Only in Invoice Mode */}
                {!isChallan && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) ? (
                  <div>
                    <h4 className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold mb-2">
                      Settlement Details
                    </h4>
                    <div className="text-xs text-[#475569] space-y-1 font-mono">
                      <p>
                        <span
                          className="font-semibold text-[#1e293b]"
                          style={{ fontFamily: "Geist, sans-serif" }}
                        >
                          Bank:
                        </span>{" "}
                        {invoice.bank_name || profile?.bank_name}
                      </p>
                      {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                        <p>
                          <span
                            className="font-semibold text-[#1e293b]"
                            style={{ fontFamily: "Geist, sans-serif" }}
                          >
                            Holder:
                          </span>{" "}
                          {invoice.bank_account_holder || profile?.bank_account_holder}
                        </p>
                      )}
                      {(invoice.bank_account_number || profile?.bank_account_number) && (
                        <p>
                          <span
                            className="font-semibold text-[#1e293b]"
                            style={{ fontFamily: "Geist, sans-serif" }}
                          >
                            Account:
                          </span>{" "}
                          {invoice.bank_account_number || profile?.bank_account_number}
                        </p>
                      )}
                      {(invoice.bank_swift || profile?.bank_swift) && (
                        <p>
                          <span
                            className="font-semibold text-[#1e293b]"
                            style={{ fontFamily: "Geist, sans-serif" }}
                          >
                            SWIFT:
                          </span>{" "}
                          {invoice.bank_swift || profile?.bank_swift}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    {invoice.notes && (
                      <div>
                        <p className="font-semibold text-[#1e293b] mb-1">Notes</p>
                        <p className="text-[11px] text-[#475569]">{invoice.notes}</p>
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
                        <div className="w-36 border-b border-[#e2e8f0] mb-1"></div>
                        <p className="text-[11px] text-[#64748b] font-semibold">
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
                <div className="mt-4 pt-3 border-t border-[#e2e8f0] text-[10px] text-[#475569] whitespace-pre-wrap">
                  <p className="font-semibold text-[#1e293b] mb-0.5">
                    Terms & Conditions
                  </p>
                  <p>
                    {invoice.terms_and_conditions || profile?.terms_and_conditions}
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
