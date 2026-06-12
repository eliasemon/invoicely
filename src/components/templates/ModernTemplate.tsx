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
} from "./templateUtils";

export function ModernTemplate({
  invoice,
  profile,
  isPreview,
  publicUrl,
  showGroupTotals,
}: TemplateProps) {
  const sym = invoice.currency_symbol || "$";
  const issueDate = getIssueDate(invoice);
  const dueDate = getDueDate(invoice);
  const subtotal = getSubtotal(invoice);
  const discountAmount = getDiscountAmount(invoice, subtotal);
  const shippingCost = getShippingCost(invoice);
  const total = getTotal(invoice);
  const tax = 0;
  const amountPaid = invoice.amountPaid || 0;
  const balanceDue = Math.max(0, total - amountPaid);

  return (
    <div
      className="min-h-screen py-8 bg-[#f8f9ff] text-[#0b1c30] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
    >
      {" "}
      {/* Action Bar - hidden in print */}{" "}
      {!isPreview && (
        <div className="max-w-[210mm] mx-auto mb-3 flex flex-row justify-between items-center gap-2 print:hidden">
          <span
            className="text-sm font-bold text-black"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            Invorio
          </span>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-[#c6c6cd] rounded-lg text-xs hover:bg-[#eff4ff] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Download / Print PDF
          </button>
        </div>
      )}
      {/* Invoice Paper */}
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-row print:flex-row print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        {" "}
        {/* Sidebar */}
        <div className="bg-[#0058be] text-white w-[25%] print:w-[25%] p-6 flex flex-col justify-between shrink-0">
          <div>
            <div className="mb-3">
              {profile?.company_logo && (
                <img
                  alt="Logo"
                  className="max-h-16 max-w-[160px] bg-white p-1 rounded-lg mb-3 object-contain w-auto h-auto"
                  src={profile.company_logo}
                />
              )}
              <h2
                className="text-sm font-semibold mb-1"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                {profile?.company_name || "Your Company"}
              </h2>
              {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                <p className="text-[11px] text-blue-200/90 italic mb-2">
                  {invoice.brand_voice || profile?.brand_voice}
                </p>
              )}
              {profile?.email && (
                <p
                  className="text-[11px] opacity-80"
                  style={{ fontFamily: "Geist, monospace" }}
                >
                  {profile.email}
                </p>
              )}
              {profile?.phone && (
                <p
                  className="text-[11px] opacity-80"
                  style={{ fontFamily: "Geist, monospace" }}
                >
                  {profile.phone}
                </p>
              )}
              {profile?.company_address && (
                <p
                  className="text-[11px] opacity-70 mt-1.5 whitespace-pre-line font-light"
                  style={{ fontFamily: "Geist, monospace" }}
                >
                  {profile.company_address}
                </p>
              )}
            </div>
            <div className="mb-2">
              <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">
                Invoice Number
              </p>
              <p className="text-base font-semibold">
                {invoice.invoiceNumber ||
                  invoice.id?.substring(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="mb-2">
              <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">
                Date Issued
              </p>
              <p className="text-[11px]">{formatDate(issueDate)}</p>
            </div>
            <div className="mb-2">
              <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">
                Due Date
              </p>
              <p className="text-[11px] font-semibold">{formatDate(dueDate)}</p>
            </div>
          </div>
          {(profile?.bank_enabled ?? true) &&
            (invoice.bank_name || profile?.bank_name) && (
              <div className="mt-4 block">
                <p className="text-[12px] uppercase tracking-wider opacity-70 mb-2">
                  Payment Details
                </p>
                <div className="bg-white/10 p-4 rounded-lg text-white w-full border border-white/10">
                  <p className="text-[11px] font-semibold">
                    {invoice.bank_name || profile?.bank_name}
                  </p>
                  {(invoice.bank_account_holder ||
                    profile?.bank_account_holder) && (
                    <p className="text-[11px] mt-1 opacity-80">
                      {invoice.bank_account_holder ||
                        profile?.bank_account_holder}
                    </p>
                  )}
                  {(invoice.bank_account_number ||
                    profile?.bank_account_number) && (
                    <p className="text-[11px] mt-1 opacity-80 font-mono">
                      {invoice.bank_account_number ||
                        profile?.bank_account_number}
                    </p>
                  )}
                  {(invoice.bank_swift || profile?.bank_swift) && (
                    <p className="text-[11px] mt-1 opacity-80">
                      SWIFT: {invoice.bank_swift || profile?.bank_swift}
                    </p>
                  )}
                </div>
              </div>
            )}
          {profile?.qr_code_enabled && publicUrl && (
            <div className="mt-auto pt-8 flex justify-center">
              <div className="bg-white p-2 rounded-lg">
                <QRCodeSVG value={publicUrl} size={64} />
              </div>
            </div>
          )}
        </div>
        {/* Main Content */}
        <div className="w-[75%] print:w-[75%] p-6 print:p-6">
          <div className="flex flex-row print:flex-row justify-between items-start gap-2 mb-2">
            <div>
              <p className="text-[10px] uppercase text-[#76777d] mb-1">
                Billed To
              </p>
              <h3
                className="text-sm font-semibold mb-0.5"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                {invoice.clientName}
              </h3>
              <p className="text-[11px] text-[#45464d] whitespace-pre-line">
                {invoice.clientAddress || invoice.clientPhone}
              </p>
            </div>
            <div
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                invoice.status === "PAID"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {invoice.status}
            </div>
          </div>

          {/* Items */}
          <div className="mb-2">
            <p className="text-[10px] uppercase text-[#76777d] mb-1.5 border-b border-[#dce9ff] pb-1">
              Description
            </p>
            {invoice.groups?.map((group, gIdx) => (
              <div key={gIdx} className="mb-3">
                {group.name && (
                  <h4 className="font-bold text-xs mb-1">{group.name}</h4>
                )}
                {group.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="flex justify-between items-start mb-1.5"
                  >
                    <div className="pr-4">
                      <h4 className="font-semibold text-xs">{item.name}</h4>
                      <p
                        className="text-[10px] text-[#45464d] mt-0.5"
                        style={{ fontFamily: "Geist, monospace" }}
                      >
                        Qty: {item.quantity} ×{" "}
                        {formatMoney(item.unitPrice, sym)}
                      </p>
                    </div>
                    <p
                      className="text-[11px] whitespace-nowrap"
                      style={{ fontFamily: "Geist, monospace" }}
                    >
                      {formatMoney(item.quantity * item.unitPrice, sym)}
                    </p>
                  </div>
                ))}

                {showGroupTotals && (
                  <div className="flex justify-between items-center px-3 py-0.5 bg-transparent border-t border-slate-100/50">
                    <div className="text-[9px] font-medium text-slate-400 uppercase tracking-wide">
                      Group Subtotal
                    </div>
                    <div
                      className="text-[10px] font-medium text-slate-500"
                      style={{ fontFamily: "Geist, monospace" }}
                    >
                      {formatMoney(
                        group.items.reduce(
                          (sum, item) => sum + item.quantity * item.unitPrice,
                          0,
                        ),
                        sym,
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-[#dce9ff] pt-4">
            <div className="flex justify-end mb-1.5">
              <div className="w-1/2 print:w-1/2 flex justify-between text-xs">
                <p className="text-[10px] text-[#76777d]">Subtotal</p>
                <p style={{ fontFamily: "Geist, monospace" }}>
                  {formatMoney(subtotal, sym)}
                </p>
              </div>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-end mb-1.5">
                <div className="w-1/2 print:w-1/2 flex justify-between text-xs">
                  <p className="text-[10px] text-[#76777d]">
                    Discount{" "}
                    {invoice.discount_type === "percentage"
                      ? `(${invoice.discount_value}%)`
                      : ""}
                  </p>
                  <p style={{ fontFamily: "Geist, monospace" }}>
                    -{formatMoney(discountAmount, sym)}
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-end mb-3">
              <div className="w-1/2 print:w-1/2 flex justify-between text-xs">
                <p className="text-[10px] text-[#76777d]">Tax (0%)</p>
                <p style={{ fontFamily: "Geist, monospace" }}>
                  {formatMoney(tax, sym)}
                </p>
              </div>
            </div>
            {shippingCost > 0 && (
              <div className="flex justify-end mb-3">
                <div className="w-1/2 print:w-1/2 flex justify-between text-xs">
                  <p className="text-[10px] text-[#76777d]">Shipping</p>
                  <p style={{ fontFamily: "Geist, monospace" }}>
                    +{formatMoney(shippingCost, sym)}
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <div className="w-2/3 print:w-2/3 bg-[#131b2e] py-3 px-4 rounded-lg flex justify-between items-center">
                <p className="text-[10px] uppercase tracking-wider text-[#bec6e0]">
                  Total
                </p>
                <p
                  className="text-[11px] font-bold text-white"
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                >
                  {formatMoney(total, sym)}
                </p>
              </div>
            </div>
            {amountPaid > 0 && (
              <>
                <div className="flex justify-end mt-2">
                  <div className="w-2/3 print:w-2/3 py-2 px-4 flex justify-between items-center text-sm">
                    <p className="text-[10px] uppercase tracking-wider text-[#76777d]">
                      Paid
                    </p>
                    <p
                      className="text-[11px] font-medium text-green-600"
                      style={{ fontFamily: "Geist, monospace" }}
                    >
                      {formatMoney(amountPaid, sym)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="w-2/3 print:w-2/3 bg-[#eff6ff] py-3 px-4 rounded-lg flex justify-between items-center border border-[#bfdbfe]">
                    <p className="text-[10px] uppercase tracking-wider text-[#1e40af]">
                      Due
                    </p>
                    <p
                      className="text-[11px] font-bold text-[#1e40af]"
                      style={{ fontFamily: "Work Sans, sans-serif" }}
                    >
                      {formatMoney(balanceDue, sym)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notes and Signature */}
          <div className="mt-4 pt-3 border-t border-[#dce9ff] flex flex-row print:flex-row justify-between items-start gap-2">
            <div className="flex-1 flex flex-col gap-3">
              <div>
                <p className="text-[10px] uppercase text-[#76777d] mb-1">
                  Notes
                </p>
                <p className="text-[11px] text-[#45464d]">
                  {invoice.notes ||
                    "Thank you for your business. Please process payment within 30 days of receiving this invoice."}
                </p>
              </div>
              {((invoice.terms_and_conditions_enabled ?? profile?.terms_and_conditions_enabled ?? true) && (invoice.terms_and_conditions || profile?.terms_and_conditions)) && (
                <div>
                  <p className="text-[10px] uppercase text-[#76777d] mb-1">
                    Terms & Conditions
                  </p>
                  <p className="text-[11px] text-[#45464d] whitespace-pre-wrap">
                    {invoice.terms_and_conditions ||
                      profile?.terms_and_conditions}
                  </p>
                </div>
              )}
            </div>
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
                        className="h-8 mb-1.5 object-contain"
                      />
                    )}
                    <div className="w-full border-b border-[#c6c6cd] mb-1"></div>
                    <p className="text-[10px] text-[#76777d]">
                      {invoice.signatory_name ||
                        profile?.signatory_name ||
                        "Authorized Signatory"}
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
