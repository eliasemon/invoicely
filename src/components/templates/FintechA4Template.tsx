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

export function FintechA4Template({
  invoice,
  profile,
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

  return (
    <div
      className="min-h-screen py-8 bg-[#f8fafc] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Geist, sans-serif" }}
    >
      {" "}
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white text-[#1e293b] rounded-2xl border border-[#e2e8f0] shadow-xl overflow-hidden print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        {" "}
        {/* Gradient top */}
        <div className="h-1 bg-gradient-to-r from-[#22c55e] via-[#10b981] to-[#14b8a6]"></div>
        <div className="p-6 p-6 print:p-6">
          {/* Header */}
          <div className="flex flex-row print:flex-row justify-between items-start gap-3 mb-3">
            <div>
              {profile?.company_logo && (
                <img
                  alt="Company Logo"
                  className="max-h-16 max-w-[200px] mb-2 object-contain w-auto h-auto"
                  src={profile.company_logo}
                />
              )}
              <h1 className="text-sm font-bold text-[#0f172a]">
                {profile?.company_name || "Your Company"}
              </h1>
              {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                <p className="text-[11px] text-[#475569] italic mt-0.5">
                  {invoice.brand_voice || profile?.brand_voice}
                </p>
              )}
              {profile?.email && (
                <p className="text-[11px] text-[#475569] mt-1">
                  {profile.email}
                </p>
              )}
              {profile?.phone && (
                <p className="text-[11px] text-[#475569] mt-0.5">
                  {profile.phone}
                </p>
              )}
              {profile?.company_address && (
                <p className="text-[11px] text-[#475569] mt-2 whitespace-pre-line">
                  {profile.company_address}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end print:items-end gap-3 text-right print:text-right w-auto print:w-auto">
              <div className="inline-block bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-2.5">
                <p className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold">
                  Invoice
                </p>
                <p className="text-[11px] font-bold text-[#10b981] font-mono break-all">
                  {invoice.invoiceNumber}
                </p>
              </div>

              {/* Compact Client, Issued, Due Meta Card */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-right print:text-right space-y-2.5 w-64 print:w-64 shadow-sm">
                <div>
                  <p className="text-[9px] text-[#64748b] uppercase tracking-wider font-semibold mb-0.5">
                    Client
                  </p>
                  <p className="font-semibold text-[#0f172a] text-[11px]">
                    {invoice.clientName}
                  </p>
                  <p className="text-[10px] text-[#475569] leading-tight mt-0.5 whitespace-pre-line">
                    {invoice.clientAddress || invoice.clientPhone}
                  </p>
                </div>
                <div className="h-[1px] bg-[#e2e8f0]"></div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[9px] text-[#64748b] uppercase tracking-wider font-semibold">
                    Issued
                  </span>
                  <span className="font-mono text-[#0f172a] text-xs">
                    {formatDate(issueDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[9px] text-[#64748b] uppercase tracking-wider font-semibold">
                    Due
                  </span>
                  <span className="font-mono text-[#0f172a] text-xs font-semibold">
                    {formatDate(dueDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status + Amount Card */}
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl py-3 px-4 mb-3 flex flex-row print:flex-row justify-between items-center gap-2 gap-0">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#15803d] uppercase tracking-wider font-semibold">
                Amount Due:
              </span>
              <span className="text-sm font-bold text-[#15803d] font-mono">
                {formatMoney(subtotal, sym)}
              </span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                invoice.status === "PAID"
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                  : "bg-amber-100 text-amber-700 border border-amber-300"
              }`}
            >
              {invoice.status}
            </div>
          </div>

          {/* Items */}
          <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] overflow-hidden mb-3">
            <div className="overflow-x-auto mb-2">
              <table className="w-full min-w-[500px] text-xs">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f1f5f9]">
                    <th className="text-left py-1 px-2 text-[10px] text-[#64748b] uppercase tracking-wider">
                      Item
                    </th>
                    <th className="text-right py-1 px-2 text-[10px] text-[#64748b] uppercase tracking-wider w-16">
                      Qty
                    </th>
                    <th className="text-right py-1 px-2 text-[10px] text-[#64748b] uppercase tracking-wider w-24">
                      Rate
                    </th>
                    <th className="text-right py-1 px-2 text-[10px] text-[#64748b] uppercase tracking-wider w-28">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {showGroups && invoice.groups && invoice.groups.length > 0
                    ? invoice.groups.map((group, gIdx) => (
                        <React.Fragment key={gIdx}>
                          {group.name && (
                            <tr className="bg-slate-100 font-bold">
                              <td
                                className="py-0.5 px-2 text-[10px] text-[#0f172a] border-b border-[#e2e8f0] uppercase text-left font-semibold"
                                style={{ fontFamily: "Geist, sans-serif" }}
                              >
                                {group.name}
                              </td>
                            </tr>
                          )}
                          {group.items.map((item, iIdx) => (
                            <tr
                              key={iIdx}
                              className="border-b border-[#e2e8f0] bg-white hover:bg-[#f1f5f9] transition-colors"
                            >
                              <td
                                className="py-1 px-2 text-[#0f172a]"
                                style={{ fontFamily: "Geist, sans-serif" }}
                              >
                                {item.name}
                              </td>
                              <td className="py-1 px-2 text-right text-[#475569]">
                                {item.quantity}
                              </td>
                              <td className="py-1 px-2 text-right text-[#475569]">
                                {formatMoney(item.unitPrice, sym)}
                              </td>
                              <td className="py-1 px-2 text-right text-[#16a34a] font-semibold">
                                {formatMoney(
                                  item.quantity * item.unitPrice,
                                  sym,
                                )}
                              </td>
                            </tr>
                          ))}

                          {showGroupTotals && (
                            <tr className="bg-transparent">
                              <td className="py-0.5 px-2 text-[9px] font-medium text-slate-400 uppercase text-right tracking-wide">
                                Group Subtotal
                              </td>
                              <td
                                className="py-0.5 px-2 text-right text-[10px] font-medium text-slate-500"
                                style={{ fontFamily: "Geist, monospace" }}
                              >
                                {formatMoney(
                                  group.items.reduce(
                                    (sum, item) =>
                                      sum + item.quantity * item.unitPrice,
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
                          className="border-b border-[#e2e8f0] bg-white hover:bg-[#f1f5f9] transition-colors"
                        >
                          <td
                            className="py-1 px-2 text-[#0f172a]"
                            style={{ fontFamily: "Geist, sans-serif" }}
                          >
                            {item.name}
                          </td>
                          <td className="py-1 px-2 text-right text-[#475569]">
                            {item.quantity}
                          </td>
                          <td className="py-1 px-2 text-right text-[#475569]">
                            {formatMoney(item.unitPrice, sym)}
                          </td>
                          <td className="py-1 px-2 text-right text-[#16a34a] font-semibold">
                            {formatMoney(item.quantity * item.unitPrice, sym)}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-between items-end w-full">
            {profile?.qr_code_enabled && publicUrl && (
              <div className="mb-2 block print:block">
                <QRCodeSVG value={publicUrl} size={64} />
              </div>
            )}
            <div className="w-64 print:w-64 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
              <div className="flex justify-between py-1 text-xs text-[#64748b] font-mono border-b border-[#e2e8f0]/60">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal, sym)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between py-1 text-xs text-[#64748b] font-mono border-b border-[#e2e8f0]/60">
                  <span>
                    Discount{" "}
                    {invoice.discount_type === "percentage"
                      ? `(${invoice.discount_value}%)`
                      : ""}
                  </span>
                  <span>-{formatMoney(discountAmount, sym)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 text-xs text-[#64748b] font-mono border-b border-[#e2e8f0]/60">
                <span>Tax</span>
                <span>{formatMoney(0, sym)}</span>
              </div>
              {shippingCost > 0 && (
                <div className="flex justify-between py-1 text-xs text-[#64748b] font-mono border-b border-[#e2e8f0]/60">
                  <span>Shipping</span>
                  <span>+{formatMoney(shippingCost, sym)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 mt-2 bg-[#10b981] text-white px-3 rounded-lg font-bold font-mono text-base">
                <span>Total</span>
                <span>{formatMoney(total, sym)}</span>
              </div>
              {amountPaid > 0 && (
                <>
                  <div className="flex justify-between py-2 text-sm text-gray-500 font-medium">
                    <span>Paid</span>
                    <span>{formatMoney(amountPaid, sym)}</span>
                  </div>
                  <div className="flex justify-between py-3 mt-2 border-t-2 border-gray-800 text-sm font-bold text-gray-900">
                    <span>Due</span>
                    <span>{formatMoney(balanceDue, sym)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bank details & Signature */}
          <div className="mt-3 pt-6 border-t border-[#e2e8f0] flex flex-row print:flex-row justify-between items-start gap-2 text-sm w-full">
            {(profile?.bank_enabled ?? true) &&
            (invoice.bank_name || profile?.bank_name) ? (
              <div className="grid grid-cols-3 print:grid-cols-3 gap-2 flex-1">
                <div>
                  <p className="text-[10px] text-[#64748b] uppercase mb-1">
                    Bank
                  </p>
                  <p className="text-[#0f172a]">
                    {invoice.bank_name || profile?.bank_name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#64748b] uppercase mb-1">
                    Account
                  </p>
                  <p className="font-mono text-[#0f172a]">
                    {invoice.bank_account_number ||
                      profile?.bank_account_number}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#64748b] uppercase mb-1">
                    Holder
                  </p>
                  <p className="text-[#0f172a]">
                    {invoice.bank_account_holder ||
                      profile?.bank_account_holder}
                  </p>
                </div>
                {(invoice.bank_swift || profile?.bank_swift) && (
                  <div>
                    <p className="text-[10px] text-[#64748b] uppercase mb-1">
                      SWIFT
                    </p>
                    <p className="font-mono text-[#0f172a]">
                      {invoice.bank_swift || profile?.bank_swift}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1"></div>
            )}

            <div className="flex flex-row items-end gap-3 justify-end print:justify-end w-auto shrink-0">
              {(profile?.signature_enabled ?? true) &&
                (invoice.signature_url ||
                  profile?.signature_url ||
                  invoice.signatory_name ||
                  profile?.signatory_name) && (
                  <div className="flex flex-col items-end min-w-[160px]">
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
                    <div className="w-full border-b border-[#e2e8f0] mb-1"></div>
                    <p className="text-[10px] text-[#64748b] font-semibold">
                      {invoice.signatory_name ||
                        profile?.signatory_name ||
                        "Authorized Signatory"}
                    </p>
                  </div>
                )}
            </div>
          </div>

          {(invoice.terms_and_conditions || profile?.terms_and_conditions) && (
            <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
              <p className="text-[10px] text-[#64748b] uppercase mb-1 font-semibold">
                Terms & Conditions
              </p>
              <p className="text-[11px] text-[#475569] whitespace-pre-wrap">
                {invoice.terms_and_conditions || profile?.terms_and_conditions}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
