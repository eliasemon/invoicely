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
} from "./templateUtils";

export function MixedGroupsA4Template({
  invoice,
  profile,
  publicUrl,
  showGroupTotals,
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

  return (
    <div
      className="min-h-screen py-8 bg-[#f8fafc] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Geist, sans-serif" }}
    >
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white text-[#1e293b] rounded-2xl border border-[#e2e8f0] shadow-xl overflow-hidden print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0 flex flex-col justify-between">
        <div>
          {/* Top accent */}
          <div className="h-1 bg-[#2563eb]"></div>
          <div className="p-6 print:p-6">
            {/* Header */}
            <div className="flex flex-row print:flex-row justify-between items-start gap-3 border-b border-[#e2e8f0] pb-4 mb-4">
              <div>
                {profile?.company_logo && (
                  <img
                    alt="Company Logo"
                    className="max-h-16 max-w-[200px] mb-2 object-contain w-auto h-auto"
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
                {profile?.email && (
                  <p className="text-[11px] text-[#64748b] mt-1">
                    {profile.email}
                  </p>
                )}
                {profile?.phone && (
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    {profile.phone}
                  </p>
                )}
                {profile?.company_address && (
                  <p className="text-[11px] text-[#64748b] mt-2 whitespace-pre-line">
                    {profile.company_address}
                  </p>
                )}
              </div>
              <div className="text-right print:text-right">
                <h2 className="text-xl font-bold tracking-tight text-[#2563eb] uppercase">
                  {isChallan ? "CHALLAN" : "INVOICE"}
                </h2>
                <p className="text-xs font-mono text-[#64748b]">
                  #{invoice.invoiceNumber || invoice.id?.substring(0, 8).toUpperCase()}
                </p>
                {profile?.qr_code_enabled && publicUrl && (
                  <div className="mt-3 flex justify-end print:justify-end">
                    <QRCodeSVG value={publicUrl} size={48} />
                  </div>
                )}
              </div>
            </div>

            {/* Bill To & Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] mb-4">
              <div className="col-span-2">
                <p className="text-[10px] text-[#94a3b8] uppercase font-semibold mb-1">
                  {isChallan ? "Delivered To" : "Bill To"}
                </p>
                <p className="font-bold text-[#0f172a] text-sm">
                  {invoice.clientName}
                </p>
                <p className="text-[11px] text-[#64748b] mt-0.5 whitespace-pre-line">
                  {invoice.clientAddress || invoice.clientPhone}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#94a3b8] uppercase font-semibold mb-1">
                  Date
                </p>
                <p className="font-mono text-xs text-[#0f172a]">
                  {formatDate(issueDate)}
                </p>
              </div>
              {!isChallan ? (
                <div>
                  <p className="text-[10px] text-[#94a3b8] uppercase font-semibold mb-1">
                    Due
                  </p>
                  <p className="font-mono text-xs text-[#0f172a] font-semibold">
                    {formatDate(dueDate)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] text-[#94a3b8] uppercase font-semibold mb-1">
                    Type
                  </p>
                  <span className="text-xs font-semibold text-blue-700">
                    Delivery
                  </span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-4 mb-4">
              {invoice.groups?.map((group, gIdx) => (
                <div key={gIdx} className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-4">
                  {group.name && (
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#2563eb] mb-2 border-b border-[#e2e8f0] pb-1">
                      {group.name}
                    </h3>
                  )}
                  <div className="space-y-2">
                    {group.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex justify-between items-center text-xs py-1 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-medium text-[#0f172a]">{item.name}</p>
                          <p className="text-[11px] text-[#64748b] font-mono">
                            Qty: {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                            {!isChallan && ` × ${formatMoney(item.unitPrice, sym)}`}
                          </p>
                        </div>
                        {!isChallan && (
                          <p className="text-[11px] font-semibold font-mono text-[#0f172a]">
                            {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, sym)}
                          </p>
                        )}
                      </div>
                    ))}

                    {showGroupTotals && !isChallan && (
                      <div className="flex justify-between items-center pt-2 border-t border-[#e2e8f0] text-xs">
                        <span className="text-[10px] uppercase font-bold text-[#64748b]">
                          Group Subtotal
                        </span>
                        <span className="font-bold font-mono text-[#2563eb]">
                          {formatMoney(
                            group.items.reduce(
                              (sum, item) => sum + (item.isFlatRate ? 1 : item.quantity) * item.unitPrice,
                              0,
                            ),
                            sym,
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals - Only in Invoice Mode */}
            {!isChallan && (
              <div className="flex justify-end mb-4">
                <div className="w-64">
                  <div className="flex justify-between py-1.5 text-xs text-[#64748b] font-mono">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal, sym)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between py-1.5 text-xs text-[#64748b] font-mono">
                      <span>
                        Discount{" "}
                        {invoice.discount_type === "percentage"
                          ? `(${invoice.discount_value}%)`
                          : ""}
                      </span>
                      <span className="text-red-600">-{formatMoney(discountAmount, sym)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 text-xs text-[#64748b] font-mono">
                    <span>Tax (0%)</span>
                    <span>{formatMoney(0, sym)}</span>
                  </div>
                  {shippingCost > 0 && (
                    <div className="flex justify-between py-1.5 text-xs text-[#64748b] font-mono">
                      <span>Shipping</span>
                      <span>+{formatMoney(shippingCost, sym)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 border-t-2 border-[#2563eb] mt-1 text-sm font-bold text-[#0f172a] font-mono">
                    <span>Total Amount</span>
                    <span className="text-[#2563eb]">{formatMoney(total, sym)}</span>
                  </div>
                  {amountPaid > 0 && (
                    <>
                      <div className="flex justify-between py-1 text-xs text-gray-500 font-medium">
                        <span>Paid</span>
                        <span>{formatMoney(amountPaid, sym)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-t border-gray-400 text-xs font-bold text-gray-900">
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

        {/* Bank & Signature */}
        <div className="p-6 pt-0 print:p-6 print:pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#e2e8f0] pt-4 items-start">
            {/* Bank Details - Only in Invoice Mode */}
            {!isChallan && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) ? (
              <div>
                <h4 className="text-[10px] text-[#64748b] uppercase tracking-wider mb-2 font-semibold">
                  Settlement Details
                </h4>
                <div className="text-xs text-[#475569] space-y-1 font-mono">
                  <p>
                    <span className="text-[#0f172a] font-semibold">Bank:</span>{" "}
                    {invoice.bank_name || profile?.bank_name}
                  </p>
                  {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                    <p>
                      <span className="text-[#0f172a] font-semibold">Holder:</span>{" "}
                      {invoice.bank_account_holder || profile?.bank_account_holder}
                    </p>
                  )}
                  {(invoice.bank_account_number || profile?.bank_account_number) && (
                    <p>
                      <span className="text-[#0f172a] font-semibold">Account:</span>{" "}
                      {invoice.bank_account_number || profile?.bank_account_number}
                    </p>
                  )}
                  {(invoice.bank_swift || profile?.bank_swift) && (
                    <p>
                      <span className="text-[#0f172a] font-semibold">SWIFT:</span>{" "}
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
                    <p className="text-xs text-[#475569]">{invoice.notes}</p>
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
              <p className="font-semibold text-[#0f172a] mb-0.5">
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
