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
      className="min-h-screen py-8 bg-[#f0f4f8] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
    >
      {" "}
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white shadow-lg print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        {" "}
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-[#0058be] via-[#2170e4] to-[#0058be]"></div>
        <div className="p-6 p-6 print:p-6">
          {/* Header */}
          <div className="flex flex-row print:flex-row justify-between items-start gap-3 mb-3">
            <div>
              {profile?.company_logo && (
                <img
                  src={profile.company_logo}
                  alt="Logo"
                  className="max-h-16 max-w-[200px] mb-2 object-contain w-auto h-auto"
                />
              )}
              <h1
                className="text-sm font-bold text-black mb-1"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                {profile?.company_name || "Your Company"}
              </h1>
              {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                <p className="text-[11px] text-[#64748b] italic mb-1">
                  {invoice.brand_voice || profile?.brand_voice}
                </p>
              )}
              <p className="text-[11px] text-[#64748b] whitespace-pre-line">
                {profile?.company_address || ""}
              </p>
              {(profile?.email || profile?.phone) && (
                <p className="text-[11px] text-[#64748b] mt-1">
                  {profile.email}
                  {profile.email && profile.phone ? " • " : ""}
                  {profile.phone}
                </p>
              )}
            </div>
            <div className="text-right print:text-right w-auto print:w-auto">
              <p className="text-[12px] text-[#94a3b8] uppercase tracking-[0.15em] mb-1">
                Invoice
              </p>
              <p
                className="text-[11px] font-bold text-black"
                style={{ fontFamily: "Geist, monospace" }}
              >
                {invoice.invoiceNumber}
              </p>
              {profile?.qr_code_enabled && publicUrl && (
                <div className="mt-3 flex justify-end justify-start print:justify-end">
                  <QRCodeSVG value={publicUrl} size={54} />
                </div>
              )}
              <div
                className={`inline-block mt-3 px-3 py-1 rounded text-[11px] font-semibold uppercase ${
                  invoice.status === "PAID"
                    ? "bg-emerald-50 text-emerald-700"
                    : invoice.status === "DRAFT"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-amber-50 text-amber-700"
                }`}
              >
                {invoice.status}
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-3 print:grid-cols-3 gap-2 gap-2 mb-3 pb-4 border-b border-[#e2e8f0]">
            <div>
              <p className="text-[11px] text-[#94a3b8] uppercase tracking-wider mb-2">
                Bill To
              </p>
              <p className="font-semibold text-black">{invoice.clientName}</p>
              <p className="text-[11px] text-[#64748b] whitespace-pre-line mt-1">
                {invoice.clientAddress || invoice.clientPhone}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#94a3b8] uppercase tracking-wider mb-2">
                Issue Date
              </p>
              <p
                className="text-[11px] font-medium"
                style={{ fontFamily: "Geist, monospace" }}
              >
                {formatDate(issueDate)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#94a3b8] uppercase tracking-wider mb-2">
                Due Date
              </p>
              <p
                className="text-[11px] font-medium"
                style={{ fontFamily: "Geist, monospace" }}
              >
                {formatDate(dueDate)}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="overflow-x-auto mb-2">
            <table className="w-full min-w-[500px] mb-2">
              <thead>
                <tr className="border-b-2 border-[#0058be]">
                  <th className="text-left py-0.5 text-[11px] text-[#64748b] uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-right py-0.5 text-[11px] text-[#64748b] uppercase tracking-wider w-20">
                    Qty
                  </th>
                  <th className="text-right py-0.5 text-[11px] text-[#64748b] uppercase tracking-wider w-28">
                    Rate
                  </th>
                  <th className="text-right py-0.5 text-[11px] text-[#64748b] uppercase tracking-wider w-28">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: "Geist, monospace" }}>
                {showGroups && invoice.groups && invoice.groups.length > 0
                  ? invoice.groups.map((group, gIdx) => (
                      <React.Fragment key={gIdx}>
                        {group.name && (
                          <tr className="bg-slate-100 font-bold">
                            <td
                              className="py-0.5 px-2 text-[10px] text-black border-b border-[#f1f5f9] uppercase text-left font-semibold"
                              style={{
                                fontFamily: "Hanken Grotesk, sans-serif",
                              }}
                            >
                              {group.name}
                            </td>
                          </tr>
                        )}
                        {group.items.map((item, iIdx) => (
                          <tr key={iIdx} className="border-b border-[#f1f5f9]">
                            <td
                              className="py-0.5 font-medium text-black"
                              style={{
                                fontFamily: "Hanken Grotesk, sans-serif",
                              }}
                            >
                              {item.name}
                            </td>
                            <td className="py-0.5 text-right text-[11px] text-[#64748b]">
                              {item.quantity} {item.unit || ''}
                            </td>
                            <td className="py-0.5 text-right text-[11px] text-[#64748b]">
                              {formatMoney(item.unitPrice, sym)}
                            </td>
                            <td className="py-0.5 text-right text-[11px] font-medium text-black">
                              {formatMoney(item.quantity * item.unitPrice, sym)}
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
                      <tr key={idx} className="border-b border-[#f1f5f9]">
                        <td
                          className="py-0.5 font-medium text-black"
                          style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                        >
                          {item.name}
                        </td>
                        <td className="py-0.5 text-right text-[11px] text-[#64748b]">
                          {item.quantity} {item.unit || ''}
                        </td>
                        <td className="py-0.5 text-right text-[11px] text-[#64748b]">
                          {formatMoney(item.unitPrice, sym)}
                        </td>
                        <td className="py-0.5 text-right text-[11px] font-medium text-black">
                          {formatMoney(item.quantity * item.unitPrice, sym)}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 print:w-64">
              <div
                className="flex justify-between py-2 text-sm text-[#64748b]"
                style={{ fontFamily: "Geist, monospace" }}
              >
                <span>Subtotal</span>
                <span>{formatMoney(subtotal, sym)}</span>
              </div>

              {discountAmount > 0 && (
                <div
                  className="flex justify-between py-2 text-sm text-[#64748b]"
                  style={{ fontFamily: "Geist, monospace" }}
                >
                  <span>
                    Discount{" "}
                    {invoice.discount_type === "percentage"
                      ? `(${invoice.discount_value}%)`
                      : ""}
                  </span>
                  <span>-{formatMoney(discountAmount, sym)}</span>
                </div>
              )}
              <div
                className="flex justify-between py-2 text-sm text-[#64748b]"
                style={{ fontFamily: "Geist, monospace" }}
              >
                <span>Tax</span>
                <span>{formatMoney(0, sym)}</span>
              </div>
              {shippingCost > 0 && (
                <div
                  className="flex justify-between py-2 text-sm text-[#64748b]"
                  style={{ fontFamily: "Geist, monospace" }}
                >
                  <span>Shipping</span>
                  <span>+{formatMoney(shippingCost, sym)}</span>
                </div>
              )}

              <div
                className="flex justify-between py-3 mt-2 border-t-2 border-[#0058be] text-sm font-bold text-black"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
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

          {/* Bank Details & Signature Section */}
          <div className="mt-4 pt-4 border-t border-[#e2e8f0] flex flex-row print:flex-row justify-between items-start gap-2 w-full">
            {(profile?.bank_enabled ?? true) &&
            (invoice.bank_name || profile?.bank_name) ? (
              <div className="flex-1">
                <p className="text-[11px] text-[#94a3b8] uppercase tracking-wider mb-2">
                  Bank Details
                </p>
                <p className="text-[11px] font-semibold text-black">
                  {invoice.bank_name || profile?.bank_name}
                </p>
                <p className="text-[11px] text-[#64748b] mt-0.5">
                  {invoice.bank_account_holder || profile?.bank_account_holder}{" "}
                  •{" "}
                  {invoice.bank_account_number || profile?.bank_account_number}
                  {invoice.bank_swift || profile?.bank_swift
                    ? ` • SWIFT: ${invoice.bank_swift || profile?.bank_swift}`
                    : ""}
                </p>
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
                  <div className="flex flex-col items-end print:items-end min-w-[200px]">
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
                    <div className="w-full border-b border-[#e2e8f0] mb-1"></div>
                    <p className="text-[11px] text-[#76777d]">
                      {invoice.signatory_name ||
                        profile?.signatory_name ||
                        "Authorized Signatory"}
                    </p>
                  </div>
                )}
            </div>
          </div>
          {((invoice.terms_and_conditions_enabled ?? profile?.terms_and_conditions_enabled ?? true) && (invoice.terms_and_conditions || profile?.terms_and_conditions)) && (
            <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
              <p className="text-[11px] text-[#94a3b8] uppercase tracking-wider mb-1">
                Terms & Conditions
              </p>
              <p className="text-[11px] text-[#64748b] whitespace-pre-wrap">
                {invoice.terms_and_conditions || profile?.terms_and_conditions}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
