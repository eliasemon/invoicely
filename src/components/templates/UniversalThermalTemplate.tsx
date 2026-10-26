'use client';
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  TemplateProps,
  formatDate,
  formatMoney,
  getItemCurrencySymbol,
  getIssueDate,
  getDueDate,
  getSubtotal,
  getDiscountAmount,
  getShippingCost,
  getTotal,
  getAmountPaid,
  getSubjectForDoc,
  getNoteText,
} from './templateUtils';

export function UniversalThermalTemplate({
  invoice,
  profile,
  isPreview,
  publicUrl,
  showGroupTotals,
  isChallan,
  isQuotation,
  documentType,
  showPricing,
}: TemplateProps) {
  const isChallanDoc = Boolean(isChallan || documentType === 'challan');
  const isQuotationDoc = Boolean(isQuotation || documentType === 'quotation');
  const isPricingHidden = isChallanDoc || (isQuotationDoc && showPricing === false);

  const docTitle = isQuotationDoc ? 'QUOTATION' : isChallanDoc ? 'DELIVERY CHALLAN' : 'INVOICE';
  const clientLabel = isQuotationDoc ? 'Quotation To' : isChallanDoc ? 'Deliver To' : 'Bill To';

  const sym = invoice.currency_symbol || '$';
  const itemSym = getItemCurrencySymbol(invoice, profile);
  const issueDate = getIssueDate(invoice);
  const dueDate = getDueDate(invoice);
  const subtotal = getSubtotal(invoice);
  const discountAmount = getDiscountAmount(invoice, subtotal);
  const shippingCost = getShippingCost(invoice);
  const total = getTotal(invoice);
  const amountPaid = getAmountPaid(invoice);
  const balanceDue = Math.max(0, total - amountPaid);
  const subject = getSubjectForDoc(invoice, documentType);
  const noteText = getNoteText(invoice);

  const groups = invoice.groups || invoice.line_items_snapshot || [];

  return (
    <div className="w-full flex justify-center py-4 bg-gray-100 print:bg-white print:p-0 print:m-0">
      {/* 80mm Thermal Receipt Container */}
      <article
        className="w-[80mm] max-w-[80mm] min-w-[80mm] bg-white text-black font-mono text-[11px] leading-[1.3] p-3 shadow-md border border-gray-300 print:border-none print:shadow-none print:p-1.5 print:m-0 mx-auto select-text overflow-hidden"
        style={{
          color: '#000000',
          backgroundColor: '#ffffff',
          fontFamily: 'Courier Prime, Courier, "Geist Mono", monospace',
        }}
      >
        {/* Header: Business Info */}
        <div className="text-center mb-2">
          {profile?.company_logo && (
            <div className="flex justify-center mb-1.5">
              <img
                src={profile.company_logo}
                alt="Logo"
                className="max-h-12 max-w-[120px] object-contain grayscale contrast-150"
              />
            </div>
          )}
          <h1 className="text-sm font-bold uppercase tracking-wide leading-tight">
            {profile?.company_name || 'Our Company'}
          </h1>
          {((invoice.brand_voice_enabled ?? profile?.brand_voice_enabled ?? true) &&
            (invoice.brand_voice || profile?.brand_voice)) && (
            <p className="text-[10px] italic text-gray-700 mt-0.5">
              {invoice.brand_voice || profile?.brand_voice}
            </p>
          )}
          {profile?.company_address && (
            <p className="text-[10px] whitespace-pre-line mt-1">
              {profile.company_address}
            </p>
          )}
          <div className="text-[10px] text-gray-800 mt-0.5 space-y-0.5">
            {profile?.phone && <p>Tel: {profile.phone}</p>}
            {profile?.email && <p>Email: {profile.email}</p>}
            {profile?.website && <p>{profile.website}</p>}
            {profile?.tax_id && <p>Tax ID / TRN: {profile.tax_id}</p>}
            {profile?.business_registration && <p>Reg: {profile.business_registration}</p>}
          </div>
        </div>

        {/* Dashed Cut Line */}
        <div className="border-b border-dashed border-black my-2" />

        {/* Document Title & Status */}
        <div className="text-center my-1.5">
          <div className="inline-block font-bold text-xs uppercase tracking-wider px-2 py-0.5 border border-black">
            *** {docTitle} ***
          </div>
          {!isPricingHidden && !isQuotationDoc && invoice.status && (
            <p className="text-[10px] uppercase font-bold mt-1">
              [ STATUS: {invoice.status} ]
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="text-[10px] space-y-0.5 my-2">
          <div className="flex justify-between">
            <span className="font-bold">Doc #:</span>
            <span>{invoice.invoiceNumber || invoice.id?.substring(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{formatDate(issueDate)}</span>
          </div>
          {!isPricingHidden && !isQuotationDoc && (
            <div className="flex justify-between">
              <span>Due:</span>
              <span>{formatDate(dueDate)}</span>
            </div>
          )}
        </div>

        {/* Client Info */}
        <div className="border-t border-dotted border-black/60 pt-1.5 my-1.5 text-[10px]">
          <div className="font-bold uppercase text-[9.5px] text-gray-700">{clientLabel}:</div>
          <div className="font-bold text-xs">{invoice.clientName || 'Valued Customer'}</div>
          {invoice.clientPhone && <div>Phone: {invoice.clientPhone}</div>}
          {invoice.clientAddress && (
            <div className="whitespace-pre-line">{invoice.clientAddress}</div>
          )}
        </div>

        {/* Subject */}
        {subject && (
          <div className="bg-gray-100 p-1 border border-black/20 my-1.5 text-[9.5px]">
            <span className="font-bold">SUBJ: </span>
            <span>{subject}</span>
          </div>
        )}

        {/* Dashed Cut Line */}
        <div className="border-b border-dashed border-black my-2" />

        {/* Line Items Table */}
        <div className="my-2">
          <div className="flex justify-between text-[10px] font-bold border-b border-black pb-1 mb-1.5">
            <span className="w-[50%] text-left">ITEM</span>
            <span className="w-[20%] text-center">QTY</span>
            <span className="w-[30%] text-right">{isPricingHidden ? 'UNIT' : 'TOTAL'}</span>
          </div>

          {groups.map((group: any, gIdx: number) => (
            <div key={gIdx} className="mb-2">
              {group.name && (
                <div className="text-[9.5px] font-bold uppercase tracking-wider text-gray-800 bg-gray-100 px-1 py-0.5 mb-1 border-l-2 border-black">
                  {group.name}
                </div>
              )}
              {group.items?.map((item: any, iIdx: number) => {
                const itemTotal = (item.isFlatRate ? 1 : item.quantity) * item.unitPrice;
                return (
                  <div key={iIdx} className="mb-1.5 pb-1 border-b border-dotted border-gray-300">
                    <div className="font-semibold text-[11px] leading-tight text-left">
                      {item.name}
                    </div>
                    <div className="flex justify-between items-center text-[10px] mt-0.5 text-gray-800">
                      <div className="text-left">
                        {item.isFlatRate
                          ? 'Flat Rate'
                          : `${item.quantity} ${item.unit || ''}`.trim()}
                        {!isPricingHidden && ` @ ${formatMoney(item.unitPrice, itemSym)}`}
                      </div>
                      <div className="text-right font-medium">
                        {isPricingHidden ? (
                          <span>{item.unit || '-'}</span>
                        ) : (
                          <span>{formatMoney(itemTotal, itemSym)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {showGroupTotals && !isPricingHidden && (
                <div className="flex justify-between text-[9.5px] font-semibold text-gray-700 px-1 py-0.5 bg-gray-50 border-t border-gray-300 mb-1.5">
                  <span>Group Subtotal:</span>
                  <span>
                    {formatMoney(
                      group.items?.reduce(
                        (sum: number, itm: any) =>
                          sum + (itm.isFlatRate ? 1 : itm.quantity) * itm.unitPrice,
                        0
                      ) || 0,
                      itemSym
                    )}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dashed Cut Line */}
        <div className="border-b border-dashed border-black my-2" />

        {/* Totals Section */}
        {!isPricingHidden && (
          <div className="space-y-1 text-[11px] my-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatMoney(subtotal, sym)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>
                  Discount {invoice.discount_type === 'percentage' ? `(${invoice.discount_value}%)` : ''}:
                </span>
                <span>-{formatMoney(discountAmount, sym)}</span>
              </div>
            )}
            {shippingCost > 0 && (
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>+{formatMoney(shippingCost, sym)}</span>
              </div>
            )}

            {/* Total Highlight */}
            <div className="border-y-2 border-black py-1.5 my-1.5 flex justify-between font-bold text-xs sm:text-sm">
              <span className="uppercase">{isQuotationDoc ? 'Quotation Total:' : 'Total:'}</span>
              <span>{formatMoney(total, sym)}</span>
            </div>

            {amountPaid > 0 && !isQuotationDoc && (
              <div className="flex justify-between text-[10px]">
                <span>Amount Paid:</span>
                <span>{formatMoney(amountPaid, sym)}</span>
              </div>
            )}

            {!isQuotationDoc && (
              <div className="flex justify-between font-bold text-[11px] bg-gray-100 p-1 border border-black/30">
                <span>BALANCE DUE:</span>
                <span>{formatMoney(balanceDue, sym)}</span>
              </div>
            )}
          </div>
        )}

        {/* Bank Details */}
        {!isPricingHidden &&
          (profile?.bank_enabled ?? true) &&
          (invoice.bank_name || profile?.bank_name) && (
            <div className="border border-black/40 p-1.5 my-2 text-[9.5px] leading-tight">
              <div className="font-bold uppercase mb-0.5">Payment / Bank Details:</div>
              <div>{invoice.bank_name || profile?.bank_name}</div>
              {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                <div>A/C Name: {invoice.bank_account_holder || profile?.bank_account_holder}</div>
              )}
              {(invoice.bank_account_number || profile?.bank_account_number) && (
                <div className="font-mono">
                  A/C No: {invoice.bank_account_number || profile?.bank_account_number}
                </div>
              )}
              {(invoice.bank_swift || profile?.bank_swift) && (
                <div>SWIFT: {invoice.bank_swift || profile?.bank_swift}</div>
              )}
            </div>
          )}

        {/* N.B. Note */}
        {noteText && (
          <div className="my-2 text-[9.5px] leading-tight text-gray-800 border-l-2 border-black pl-1.5">
            <span className="font-bold">N.B: </span>
            <span>{noteText}</span>
          </div>
        )}

        {/* Terms & Conditions */}
        {((invoice.terms_and_conditions_enabled ?? profile?.terms_and_conditions_enabled ?? true) &&
          (invoice.terms_and_conditions || profile?.terms_and_conditions)) && (
          <div className="my-1.5 text-[9px] text-gray-600">
            <div className="font-bold uppercase">Terms:</div>
            <p className="whitespace-pre-line">
              {invoice.terms_and_conditions || profile?.terms_and_conditions}
            </p>
          </div>
        )}

        {/* QR Code */}
        {profile?.qr_code_enabled && publicUrl && (
          <div className="flex flex-col items-center justify-center my-3 text-center">
            <QRCodeSVG value={publicUrl} size={68} />
            <span className="text-[8.5px] mt-1 text-gray-600">Scan to view online</span>
          </div>
        )}

        {/* Signature Line */}
        {(profile?.signature_enabled ?? true) &&
          (invoice.signature_url ||
            profile?.signature_url ||
            invoice.signatory_name ||
            profile?.signatory_name) && (
            <div className="mt-4 pt-2 text-center text-[10px]">
              {(invoice.signature_url || profile?.signature_url) && (
                <div className="flex justify-center mb-1">
                  <img
                    src={invoice.signature_url || profile?.signature_url || undefined}
                    alt="Signature"
                    className="h-7 object-contain grayscale"
                  />
                </div>
              )}
              <div className="w-36 mx-auto border-b border-black mb-1" />
              <div className="font-medium">
                {invoice.signatory_name ||
                  profile?.signatory_name ||
                  (isChallanDoc ? 'Received By' : 'Authorized Signatory')}
              </div>
            </div>
          )}

        {/* Footer Greetings */}
        <div className="text-center mt-3 pt-2 border-t border-dashed border-black text-[9.5px]">
          <div className="font-bold uppercase">*** THANK YOU ***</div>
          <div className="text-[8.5px] text-gray-500 mt-0.5">Powered by Invorio</div>
        </div>
      </article>
    </div>
  );
}
