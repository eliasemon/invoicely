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

export function GeometricA4Template({
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
      className="min-h-screen py-8 bg-[#f0f4f8] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Geist, sans-serif" }}
    >
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white shadow-lg relative overflow-hidden print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0 flex flex-col justify-between">
        {/* Geometric decorations */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#dbeafe] rounded-bl-[100px] opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#e0e7ff] rounded-tr-[80px] opacity-40"></div>
        <div className="absolute top-1/3 left-0 w-2 h-24 bg-[#3b82f6]"></div>

        <div className="relative z-10 p-6 print:p-6">
          {/* Header */}
          <div className="flex flex-row print:flex-row justify-between items-start gap-3 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {profile?.company_logo ? (
                  <img
                    src={profile.company_logo}
                    alt="Logo"
                    className="max-h-16 max-w-[200px] object-contain w-auto h-auto"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#3b82f6] rounded-xl flex items-center justify-center text-white text-sm font-bold">
                    {(profile?.company_name || "C")[0]}
                  </div>
                )}
                <h1 className="text-sm font-bold text-[#1e293b]">
                  {profile?.company_name || "Your Company"}
                </h1>
              </div>
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
            <div className="text-right print:text-right w-auto print:w-auto bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0]">
              <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-semibold">
                {isChallan ? "Challan" : "Invoice"}
              </p>
              <p className="text-[11px] font-bold text-[#3b82f6] font-mono break-all">
                {invoice.invoiceNumber}
              </p>
              <p className="text-[11px] text-[#64748b] mt-2 font-mono">
                {formatDate(issueDate)}
              </p>
              {profile?.qr_code_enabled && publicUrl && (
                <div className="mt-3 flex justify-end print:justify-end">
                  <QRCodeSVG value={publicUrl} size={48} />
                </div>
              )}
            </div>
          </div>

          {/* Client & Dates */}
          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
            <div>
              <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider mb-1 font-semibold">
                {isChallan ? "Delivered To" : "Bill To"}
              </p>
              <p className="font-bold text-[#1e293b]">{invoice.clientName}</p>
              <p className="text-[11px] text-[#64748b] whitespace-pre-line mt-0.5">
                {invoice.clientAddress || invoice.clientPhone}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              {!isChallan ? (
                <>
                  <div>
                    <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider mb-1 font-semibold">
                      Due
                    </p>
                    <p className="text-[11px] font-mono">{formatDate(dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider mb-1 font-semibold">
                      Status
                    </p>
                    <div
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        invoice.status === "PAID"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {invoice.status}
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-2">
                  <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider mb-1 font-semibold">
                    Document Type
                  </p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Delivery Challan
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="mb-4">
            {showGroups && invoice.groups && invoice.groups.length > 0
              ? invoice.groups.map((group, gIdx) => (
                  <div key={gIdx} className="mb-3 last:mb-0">
                    {group.name && (
                      <div className="text-[10px] font-bold tracking-wider text-[#3b82f6] bg-[#eff6ff] px-2.5 py-0.5 rounded mb-2 uppercase inline-block">
                        {group.name}
                      </div>
                    )}
                    <div className="space-y-1">
                      {group.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className="flex justify-between items-center py-1.5 border-b border-[#f1f5f9]/60 last:border-0"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 bg-[#eff6ff] rounded-md flex items-center justify-center text-[#3b82f6] text-[10px] font-bold">
                              {iIdx + 1}
                            </div>
                            <div>
                              <p className="font-medium text-[11px] text-[#1e293b]">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-[#94a3b8] font-mono">
                                {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                                {!isChallan && ` × ${formatMoney(item.unitPrice, sym)}`}
                              </p>
                            </div>
                          </div>
                          {!isChallan && (
                            <p className="font-mono font-semibold text-[11px] text-[#1e293b]">
                              {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, sym)}
                            </p>
                          )}
                        </div>
                      ))}

                      {showGroupTotals && !isChallan && (
                        <div className="flex justify-between items-center px-3 py-1 bg-transparent border-t border-slate-100/50">
                          <div className="text-[9px] font-medium text-slate-400 uppercase tracking-wide">
                            Group Subtotal
                          </div>
                          <div
                            className="text-[10px] font-medium text-slate-500"
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
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              : items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center py-1.5 ${idx < items.length - 1 ? "border-b border-[#f1f5f9]" : ""}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 bg-[#eff6ff] rounded-md flex items-center justify-center text-[#3b82f6] text-[10px] font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[11px] text-[#1e293b]">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-[#94a3b8] font-mono">
                          {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                          {!isChallan && ` × ${formatMoney(item.unitPrice, sym)}`}
                        </p>
                      </div>
                    </div>
                    {!isChallan && (
                      <p className="font-mono font-semibold text-[11px] text-[#1e293b]">
                        {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, sym)}
                      </p>
                    )}
                  </div>
                ))}
          </div>

          {/* Totals - Only in Invoice Mode */}
          {!isChallan && (
            <div className="border-t-2 border-[#111c2d] pt-4 mb-4">
              <div className="flex justify-end">
                <div className="w-full sm:w-1/2 md:w-1/3">
                  <div className="flex justify-between py-1 text-xs text-[#64748b]">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatMoney(subtotal, sym)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between py-1 text-xs text-[#64748b]">
                      <span>
                        Discount{" "}
                        {invoice.discount_type === "percentage"
                          ? `(${invoice.discount_value}%)`
                          : ""}
                      </span>
                      <span className="font-mono text-red-600">-{formatMoney(discountAmount, sym)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 text-xs text-[#64748b]">
                    <span>Tax (0%)</span>
                    <span className="font-mono">{formatMoney(0, sym)}</span>
                  </div>
                  {shippingCost > 0 && (
                    <div className="flex justify-between py-1 text-xs text-[#64748b]">
                      <span>Shipping</span>
                      <span className="font-mono">+{formatMoney(shippingCost, sym)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 border-t border-[#e2e8f0] mt-1 text-sm font-bold text-[#1e293b]">
                    <span>Total</span>
                    <span className="text-[#3b82f6] font-mono">{formatMoney(total, sym)}</span>
                  </div>
                  {amountPaid > 0 && (
                    <>
                      <div className="flex justify-between py-1 text-xs text-gray-500 font-medium">
                        <span>Paid</span>
                        <span className="font-mono">{formatMoney(amountPaid, sym)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-t border-gray-300 text-xs font-bold text-gray-900">
                        <span>Balance Due</span>
                        <span className="font-mono">{formatMoney(balanceDue, sym)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bank Details & Signature Section */}
        <div className="p-6 pt-0 print:p-6 print:pt-0 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#e2e8f0] pt-4 items-start">
            {/* Bank Details - Only in Invoice Mode */}
            {!isChallan && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) ? (
              <div>
                <h4 className="text-[10px] text-[#64748b] uppercase tracking-wider mb-2 font-semibold">
                  Settlement Details
                </h4>
                <div className="text-xs text-[#475569] space-y-1 font-mono">
                  <p>
                    <span className="text-[#1e293b] font-semibold">Bank:</span>{" "}
                    {invoice.bank_name || profile?.bank_name}
                  </p>
                  {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                    <p>
                      <span className="text-[#1e293b] font-semibold">Holder:</span>{" "}
                      {invoice.bank_account_holder || profile?.bank_account_holder}
                    </p>
                  )}
                  {(invoice.bank_account_number || profile?.bank_account_number) && (
                    <p>
                      <span className="text-[#1e293b] font-semibold">Account:</span>{" "}
                      {invoice.bank_account_number || profile?.bank_account_number}
                    </p>
                  )}
                  {(invoice.bank_swift || profile?.bank_swift) && (
                    <p>
                      <span className="text-[#1e293b] font-semibold">SWIFT:</span>{" "}
                      {invoice.bank_swift || profile?.bank_swift}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {invoice.notes && (
                  <div>
                    <h4 className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1 font-semibold">
                      Notes
                    </h4>
                    <p className="text-xs text-[#64748b]">{invoice.notes}</p>
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
              <p>{invoice.terms_and_conditions || profile?.terms_and_conditions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
