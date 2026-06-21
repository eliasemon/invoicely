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

export function CorporateTemplate({
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
  const amountPaid = getAmountPaid(invoice);
  const balanceDue = Math.max(0, total - amountPaid);
  const items = getAllItems(invoice);

  return (
    <div
      className="min-h-screen py-8 bg-[#f8f9ff] text-[#0b1c30] pb-0 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
    >
      {" "}
      <div className="flex justify-center items-start p-6 print:p-0 print:m-0 print:block print:w-[210mm] max-w-full overflow-hidden print:overflow-visible">
        {" "}
        <div className="w-full max-w-[210mm] min-w-0 min-h-[297mm] mx-auto print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm]">
          {" "}
          {/* Action Bar */}
          {!isPreview && (
            <div className="flex flex-row justify-between items-center gap-2 bg-white p-4 rounded-xl border border-[#c6c6cd] shadow-sm mb-3 print:hidden">
              <div>
                <h2
                  className="text-sm font-semibold text-black"
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                >
                  Invoice #{invoice.invoiceNumber}
                </h2>
                <p className="text-[11px] text-[#45464d]">
                  Viewing Corporate Template
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-[#0058be] text-white rounded-lg text-xs font-semibold shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                Download PDF
              </button>
            </div>
          )}
          {/* Invoice Document */}
          <article className="bg-white w-full shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#c6c6cd] overflow-hidden print:shadow-none print:rounded-none print:border-none">
            <div className="h-2 w-full bg-[#0058be]"></div>
            <div className="p-6 p-6 print:p-6">
              {/* Header */}
              <div className="border-2 border-[#c6c6cd] p-4 mb-2 flex flex-col gap-3 relative">
                <div
                  className={`absolute -top-3 -right-3 px-4 py-1 rounded text-[12px] font-bold uppercase flex items-center gap-1 shadow-sm ${
                    invoice.status === "PAID"
                      ? "bg-[#e8f5e9] border border-[#a5d6a7] text-[#2e7d32]"
                      : "bg-[#fff3e0] border border-[#ffcc80] text-[#e65100]"
                  }`}
                >
                  {invoice.status}
                </div>

                {/* Row 1: Logo and Title */}
                <div className="flex flex-row print:flex-row justify-between items-center print:items-center gap-2 w-full">
                  <div>
                    {profile?.company_logo ? (
                      <img
                        alt="Logo"
                        className="max-h-16 max-w-[220px] object-contain w-auto h-auto"
                        src={profile.company_logo}
                      />
                    ) : (
                      <div className="text-[12px] text-[#45464d] uppercase tracking-widest font-bold mb-1">
                        From
                      </div>
                    )}
                  </div>
                  <h1
                    className="text-3xl text-[40px] leading-tight font-bold text-black uppercase"
                    style={{
                      fontFamily: "Work Sans, sans-serif",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Invoice
                  </h1>
                </div>

                {/* Divider Line */}
                <div className="h-[1px] bg-[#c6c6cd] w-full"></div>

                {/* Row 2: Details Columns */}
                <div className="flex flex-row print:flex-row justify-between items-start gap-3 w-full">
                  {/* Left Column: From */}
                  <div className="flex flex-col gap-1">
                    {profile?.company_logo && (
                      <div className="text-[12px] text-[#45464d] uppercase tracking-widest font-bold mb-1">
                        From
                      </div>
                    )}
                    <div className="font-bold text-black">
                      {profile?.company_name || "Your Company"}
                    </div>
                    {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                      <div className="text-[11px] italic text-[#45464d] mt-0.5 mb-1">
                        {invoice.brand_voice || profile?.brand_voice}
                      </div>
                    )}
                    <div
                      className="text-sm text-[#45464d] whitespace-pre-line"
                      style={{ fontFamily: "Geist, monospace" }}
                    >
                      {profile?.company_address || ""}
                      {profile?.email ? `\n${profile.email}` : ""}
                      {profile?.phone ? `\n${profile.phone}` : ""}
                    </div>
                  </div>

                  {/* Right Column: Invoice Meta */}
                  <div className="flex flex-col gap-1 text-right print:text-right w-auto print:w-auto">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-right print:text-right">
                      <div className="text-[12px] text-[#45464d] uppercase font-bold">
                        Invoice Number:
                      </div>
                      <div
                        className="text-sm font-semibold text-black break-all"
                        style={{ fontFamily: "Geist, monospace" }}
                      >
                        {invoice.invoiceNumber}
                      </div>
                      {profile?.qr_code_enabled && publicUrl && (
                        <div className="col-span-2 flex justify-end print:justify-end mt-4">
                          <QRCodeSVG value={publicUrl} size={64} />
                        </div>
                      )}
                      <div className="text-[12px] text-[#45464d] uppercase font-bold">
                        Date Issued:
                      </div>
                      <div
                        className="text-sm text-black"
                        style={{ fontFamily: "Geist, monospace" }}
                      >
                        {formatDate(issueDate)}
                      </div>
                      <div className="text-[12px] text-[#45464d] uppercase font-bold">
                        Date Due:
                      </div>
                      <div
                        className="text-sm text-black"
                        style={{ fontFamily: "Geist, monospace" }}
                      >
                        {formatDate(dueDate)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-3 p-4 bg-[#eff4ff] border border-[#c6c6cd] flex flex-row print:flex-row justify-between gap-2">
                <div>
                  <div className="text-[12px] text-[#45464d] uppercase tracking-widest font-bold mb-2 border-b border-[#c6c6cd] pb-2 inline-block">
                    Bill To
                  </div>
                  <div className="font-bold text-black mt-2">
                    {invoice.clientName}
                  </div>
                  <div
                    className="text-sm text-[#45464d] mt-1 whitespace-pre-line"
                    style={{ fontFamily: "Geist, monospace" }}
                  >
                    {invoice.clientAddress || invoice.clientPhone}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="text-[12px] text-[#45464d] uppercase tracking-widest font-bold mb-2 border-b border-[#c6c6cd] pb-2 inline-block">
                    Amount Due
                  </div>
                  <div
                    className="text-2xl text-[32px] leading-tight font-bold text-[#0058be] mt-2"
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                  >
                    {formatMoney(subtotal, sym)}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-[#c6c6cd] mb-2 overflow-x-auto rounded-sm">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-[#f1f5f9] border-b border-[#c6c6cd]">
                      <th className="py-0.5 px-2 text-[12px] font-bold text-[#45464d] uppercase tracking-wider border-r border-[#c6c6cd] w-12 text-center">
                        #
                      </th>
                      <th className="py-0.5 px-2 text-[12px] font-bold text-[#45464d] uppercase tracking-wider border-r border-[#c6c6cd]">
                        Description
                      </th>
                      <th className="py-0.5 px-2 text-[12px] font-bold text-[#45464d] uppercase tracking-wider border-r border-[#c6c6cd] text-right w-24">
                        Qty
                      </th>
                      <th className="py-0.5 px-2 text-[12px] font-bold text-[#45464d] uppercase tracking-wider border-r border-[#c6c6cd] text-right w-32">
                        Rate
                      </th>
                      <th className="py-0.5 px-2 text-[12px] font-bold text-[#45464d] uppercase tracking-wider text-right w-32">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{ fontFamily: "Geist, monospace" }}>
                    {showGroups && invoice.groups && invoice.groups.length > 0
                      ? invoice.groups.map((group, gIdx) => (
                          <React.Fragment key={gIdx}>
                            {group.name && (
                              <tr className="bg-[#f1f5f9] font-bold">
                                <td className="py-1 px-2 text-[10px] text-black border-b border-[#c6c6cd] uppercase text-left">
                                  {group.name}
                                </td>
                              </tr>
                            )}
                            {group.items.map((item, iIdx) => (
                              <tr
                                key={iIdx}
                                className="border-b border-[#c6c6cd]"
                              >
                                <td className="py-0.5 px-2 border-r border-[#c6c6cd] text-center text-[#45464d]">
                                  {iIdx + 1}
                                </td>
                                <td className="py-0.5 px-2 border-r border-[#c6c6cd] text-[11px]">
                                  <div className="font-bold">{item.name}</div>
                                </td>
                                <td className="py-0.5 px-2 border-r border-[#c6c6cd] text-right">
                                  {item.quantity} {item.unit || ''}
                                </td>
                                <td className="py-0.5 px-2 border-r border-[#c6c6cd] text-right">
                                  {formatMoney(item.unitPrice, sym)}
                                </td>
                                <td className="py-0.5 px-2 text-right font-semibold">
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
                            className={`border-b border-[#c6c6cd] ${idx % 2 === 1 ? "bg-[#f8fafc]" : ""}`}
                          >
                            <td className="py-0.5 px-2 border-r border-[#c6c6cd] text-center text-[#45464d]">
                              {idx + 1}
                            </td>
                            <td className="py-0.5 px-2 border-r border-[#c6c6cd] text-[11px]">
                              <div className="font-bold">{item.name}</div>
                            </td>
                            <td className="py-0.5 px-2 border-r border-[#c6c6cd] text-right">
                              {item.quantity} {item.unit || ''}
                            </td>
                            <td className="py-0.5 px-2 border-r border-[#c6c6cd] text-right">
                              {formatMoney(item.unitPrice, sym)}
                            </td>
                            <td className="py-0.5 px-2 text-right font-semibold">
                              {formatMoney(item.quantity * item.unitPrice, sym)}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-3">
                <div className="w-1/3">
                  <div className="flex justify-between py-2 border-b border-dotted border-[#c6c6cd]">
                    <span className="text-[12px] font-bold text-[#45464d] uppercase">
                      Subtotal
                    </span>
                    <span
                      className="text-sm"
                      style={{ fontFamily: "Geist, monospace" }}
                    >
                      {formatMoney(subtotal, sym)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between py-2 border-b border-dotted border-[#c6c6cd]">
                      <span className="text-[12px] font-bold text-[#45464d] uppercase">
                        Discount{" "}
                        {invoice.discount_type === "percentage"
                          ? `(${invoice.discount_value}%)`
                          : ""}
                      </span>
                      <span
                        className="text-sm"
                        style={{ fontFamily: "Geist, monospace" }}
                      >
                        -{formatMoney(discountAmount, sym)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-dotted border-[#c6c6cd]">
                    <span className="text-[12px] font-bold text-[#45464d] uppercase">
                      Tax (0%)
                    </span>
                    <span
                      className="text-sm"
                      style={{ fontFamily: "Geist, monospace" }}
                    >
                      {formatMoney(0, sym)}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <div className="flex justify-between py-2 border-b border-dotted border-[#c6c6cd]">
                      <span className="text-[12px] font-bold text-[#45464d] uppercase">
                        Shipping
                      </span>
                      <span
                        className="text-sm"
                        style={{ fontFamily: "Geist, monospace" }}
                      >
                        +{formatMoney(shippingCost, sym)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-3 border-b-2 border-black mt-2">
                    <span className="font-bold text-black uppercase">
                      Total
                    </span>
                    <span
                      className="text-sm font-bold text-black"
                      style={{ fontFamily: "Work Sans, sans-serif" }}
                    >
                      {formatMoney(total, sym)}
                    </span>
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
              {(((profile?.bank_enabled ?? true) &&
                (invoice.bank_name || profile?.bank_name)) ||
                ((profile?.signature_enabled ?? true) &&
                  (invoice.signature_url ||
                    profile?.signature_url ||
                    invoice.signatory_name ||
                    profile?.signatory_name))) && (
                <div className="grid grid-cols-2 print:grid-cols-2 gap-2 mb-3 border-t border-[#c6c6cd] pt-4">
                  {/* Bank Details */}
                  {(profile?.bank_enabled ?? true) &&
                  (invoice.bank_name || profile?.bank_name) ? (
                    <div>
                      <h4 className="text-[12px] font-bold text-black uppercase tracking-wider mb-2">
                        Bank Details
                      </h4>
                      <div className="text-sm text-[#45464d] space-y-1">
                        <p>
                          <span className="font-semibold text-black">
                            Bank:
                          </span>{" "}
                          {invoice.bank_name || profile?.bank_name}
                        </p>
                        {(invoice.bank_account_holder ||
                          profile?.bank_account_holder) && (
                          <p>
                            <span className="font-semibold text-black">
                              Holder:
                            </span>{" "}
                            {invoice.bank_account_holder ||
                              profile?.bank_account_holder}
                          </p>
                        )}
                        {(invoice.bank_account_number ||
                          profile?.bank_account_number) && (
                          <p>
                            <span className="font-semibold text-black">
                              Account:
                            </span>{" "}
                            {invoice.bank_account_number ||
                              profile?.bank_account_number}
                          </p>
                        )}
                        {(invoice.bank_swift || profile?.bank_swift) && (
                          <p>
                            <span className="font-semibold text-black">
                              SWIFT/BIC:
                            </span>{" "}
                            {invoice.bank_swift || profile?.bank_swift}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div></div>
                  )}

                  {/* Signature */}
                  <div className="flex flex-row items-end gap-3 justify-end print:justify-end w-auto shrink-0">
                    {(profile?.signature_enabled ?? true) &&
                      (invoice.signature_url ||
                        profile?.signature_url ||
                        invoice.signatory_name ||
                        profile?.signatory_name) && (
                        <div className="flex flex-col items-end print:items-end">
                          {(invoice.signature_url ||
                            profile?.signature_url) && (
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
                          <div className="w-full border-b border-[#c6c6cd] mb-1"></div>
                          <p className="text-[11px] text-[#76777d]">
                            {invoice.signatory_name ||
                              profile?.signatory_name ||
                              "Authorized Signatory"}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Footer */}
              {((invoice.terms_and_conditions_enabled ?? profile?.terms_and_conditions_enabled ?? true) && (invoice.terms_and_conditions || profile?.terms_and_conditions)) && (
                <div className="border-t-2 border-[#c6c6cd] pt-3 text-left">
                  <div
                    className="text-[11px] text-[#45464d] max-w-[500px] whitespace-pre-wrap"
                    style={{ fontFamily: "Geist, monospace" }}
                  >
                    <strong>Terms &amp; Conditions:</strong>
                    <br />
                    {invoice.terms_and_conditions ||
                      profile?.terms_and_conditions}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
