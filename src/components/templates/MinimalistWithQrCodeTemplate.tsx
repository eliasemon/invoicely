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

export function MinimalistWithQrCodeTemplate({
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
      className="min-h-screen py-8 bg-[#fafafa] text-[#171717] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white border border-gray-200 p-8 print:p-6 text-sm flex flex-col justify-between print:shadow-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        <div>
          {/* Header */}
          <div className="flex flex-row print:flex-row justify-between items-start border-b border-gray-100 pb-6 mb-6">
            <div>
              {profile?.company_logo && (
                <img
                  src={profile.company_logo}
                  alt="Company Logo"
                  className="max-h-12 max-w-[180px] mb-3 object-contain w-auto h-auto"
                />
              )}
              <h1 className="text-base font-bold text-black">
                {profile?.company_name || "Your Company"}
              </h1>
              {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) && (invoice.brand_voice || profile?.brand_voice)) && (
                <p className="text-xs text-gray-500 italic mt-0.5">
                  {invoice.brand_voice || profile?.brand_voice}
                </p>
              )}
              <p className="text-xs text-gray-500 whitespace-pre-line mt-1">
                {profile?.company_address}
                {profile?.email ? ` • ${profile.email}` : ""}
                {profile?.phone ? ` • ${profile.phone}` : ""}
              </p>
            </div>
            <div className="text-right print:text-right">
              <h2 className="text-2xl font-bold tracking-tight text-black uppercase">
                {isChallan ? "CHALLAN" : "INVOICE"}
              </h2>
              <p className="font-mono text-xs text-gray-500 mt-1">
                #{invoice.invoiceNumber}
              </p>
              {profile?.qr_code_enabled && publicUrl && (
                <div className="mt-3 flex justify-end print:justify-end">
                  <QRCodeSVG value={publicUrl} size={50} />
                </div>
              )}
            </div>
          </div>

          {/* Client & Dates */}
          <div className="grid grid-cols-2 gap-6 mb-8 text-xs">
            <div>
              <p className="text-gray-400 font-medium mb-1">
                {isChallan ? "Delivered to" : "Billed to"}
              </p>
              <p className="font-bold text-black text-sm">{invoice.clientName}</p>
              <p className="text-gray-500 whitespace-pre-line mt-0.5">
                {invoice.clientAddress || invoice.clientPhone}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-right">
              <div>
                <p className="text-gray-400 font-medium mb-1">Issued</p>
                <p className="font-mono text-gray-900">{formatDate(issueDate)}</p>
              </div>
              {!isChallan ? (
                <div>
                  <p className="text-gray-400 font-medium mb-1">Due</p>
                  <p className="font-mono text-gray-900 font-semibold">{formatDate(dueDate)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 font-medium mb-1">Type</p>
                  <span className="font-mono text-gray-900 font-semibold">Delivery</span>
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <div className="grid grid-cols-12 gap-4 pb-2 border-b border-black text-xs font-bold uppercase tracking-wider text-black">
              <div className={isChallan ? "col-span-8" : "col-span-6"}>Description</div>
              <div className={`${isChallan ? "col-span-4" : "col-span-2"} text-right`}>Qty</div>
              {!isChallan && (
                <>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-2 text-right">Amount</div>
                </>
              )}
            </div>

            {showGroups && invoice.groups && invoice.groups.length > 0
              ? invoice.groups.map((group, gIdx) => (
                  <div key={gIdx} className="mb-4">
                    {group.name && (
                      <div className="py-2 text-xs font-bold text-gray-900 bg-gray-50 px-2 my-1 uppercase">
                        {group.name}
                      </div>
                    )}
                    {group.items.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        className="grid grid-cols-12 gap-4 py-2.5 border-b border-gray-100 text-xs items-center"
                      >
                        <div className={isChallan ? "col-span-8" : "col-span-6"}>
                          <p className="font-semibold text-black">{item.name}</p>
                        </div>
                        <div className={`${isChallan ? "col-span-4" : "col-span-2"} text-right font-mono`}>
                          {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                        </div>
                        {!isChallan && (
                          <>
                            <div className="col-span-2 text-right font-mono text-gray-600">
                              {formatMoney(item.unitPrice, sym)}
                            </div>
                            <div className="col-span-2 text-right font-mono font-semibold text-black">
                              {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, sym)}
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {showGroupTotals && !isChallan && (
                      <div className="flex justify-between py-1.5 text-xs border-b border-gray-200">
                        <span className="text-gray-400 uppercase tracking-wider font-semibold">
                          Group Subtotal
                        </span>
                        <span className="font-mono font-bold text-gray-900">
                          {formatMoney(
                            group.items.reduce(
                              (sum, item) =>
                                sum + (item.isFlatRate ? 1 : item.quantity) * item.unitPrice,
                              0,
                            ),
                            sym,
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              : items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-4 py-2.5 border-b border-gray-100 text-xs items-center"
                  >
                    <div className={isChallan ? "col-span-8" : "col-span-6"}>
                      <p className="font-semibold text-black">{item.name}</p>
                    </div>
                    <div className={`${isChallan ? "col-span-4" : "col-span-2"} text-right font-mono`}>
                      {item.isFlatRate ? '-' : `${item.quantity} ${item.unit || ''}`.trim()}
                    </div>
                    {!isChallan && (
                      <>
                        <div className="col-span-2 text-right font-mono text-gray-600">
                          {formatMoney(item.unitPrice, sym)}
                        </div>
                        <div className="col-span-2 text-right font-mono font-semibold text-black">
                          {formatMoney((item.isFlatRate ? 1 : item.quantity) * item.unitPrice, sym)}
                        </div>
                      </>
                    )}
                  </div>
                ))}
          </div>

          {/* Totals - Only in Invoice Mode */}
          {!isChallan && (
            <div className="flex justify-end mb-8">
              <div className="w-full sm:w-1/2 md:w-1/3">
                <div className="flex justify-between py-1.5 text-xs text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatMoney(subtotal, sym)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between py-1.5 text-xs text-gray-600">
                    <span>
                      Discount{" "}
                      {invoice.discount_type === "percentage"
                        ? `(${invoice.discount_value}%)`
                        : ""}
                    </span>
                    <span className="font-mono text-red-600">-{formatMoney(discountAmount, sym)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 text-xs text-gray-600">
                  <span>Tax (0%)</span>
                  <span className="font-mono">{formatMoney(0, sym)}</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between py-1.5 text-xs text-gray-600">
                    <span>Shipping</span>
                    <span className="font-mono">+{formatMoney(shippingCost, sym)}</span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-t-2 border-black mt-2 text-sm font-bold text-black">
                  <span>Total</span>
                  <span className="font-mono">{formatMoney(total, sym)}</span>
                </div>
                {amountPaid > 0 && (
                  <>
                    <div className="flex justify-between py-1 text-xs text-gray-500 font-medium">
                      <span>Paid</span>
                      <span className="font-mono">{formatMoney(amountPaid, sym)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-t border-gray-300 text-xs font-bold text-black">
                      <span>Balance Due</span>
                      <span className="font-mono">{formatMoney(balanceDue, sym)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bank & Signature */}
        <div>
          <div className="flex flex-row print:flex-row justify-between items-start border-t border-gray-100 pt-6">
            {/* Bank details - Only in Invoice Mode */}
            {!isChallan && (profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name) ? (
              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-bold text-black uppercase tracking-wider text-[10px]">Payment Method</p>
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
                  <div className="text-xs text-gray-500">
                    <p className="font-bold text-black uppercase tracking-wider text-[10px] mb-0.5">Notes</p>
                    <p>{invoice.notes}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col items-end print:items-end gap-2">
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
                      <div className="w-36 border-b border-black mb-1"></div>
                      <p className="text-[11px] text-gray-500 font-semibold">
                        {invoice.signatory_name ||
                          profile?.signatory_name ||
                          (isChallan ? "Received By" : "Authorized Signatory")}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          {((invoice.terms_and_conditions_enabled ?? profile?.terms_and_conditions_enabled ?? true) && (invoice.terms_and_conditions || profile?.terms_and_conditions)) && (
            <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 whitespace-pre-wrap">
              <p className="font-bold text-black mb-0.5">Terms & Conditions</p>
              <p>{invoice.terms_and_conditions || profile?.terms_and_conditions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
