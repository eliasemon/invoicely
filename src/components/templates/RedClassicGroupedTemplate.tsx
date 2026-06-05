import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TemplateProps, formatDate, formatMoney, getIssueDate, getSubtotal, getDiscountAmount, getShippingCost, getTotal, numberToWords } from './templateUtils';

export function RedClassicGroupedTemplate({ invoice, profile, publicUrl, showGroupTotals }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const issueDate = getIssueDate(invoice);
  const subtotal = getSubtotal(invoice);
  const discountAmount = getDiscountAmount(invoice, subtotal);
  const shippingCost = getShippingCost(invoice);
  const total = getTotal(invoice);

  // Use custom subject or fallback
  const subject = invoice.notes ? invoice.notes.split('\n')[0] : 'Bill for Items/Services';

  let globalSlNo = 1;

  // Derive currency name for words
  let currencyName = 'Only';
  if (sym === '৳' || sym === 'BDT') currencyName = 'Taka Only';
  else if (sym === '$' || sym === 'USD') currencyName = 'Dollars Only';
  else if (sym === '€' || sym === 'EUR') currencyName = 'Euros Only';
  else if (sym === '£' || sym === 'GBP') currencyName = 'Pounds Only';
  else currencyName = `${sym} Only`;

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white text-black shadow-xl overflow-hidden print:shadow-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0 p-6 sm:p-8 print:p-6 relative">
        
        {/* Header section */}
        <div className="flex flex-row items-center justify-between mb-4 pb-4 border-b-4 border-[#8b0000]">
          <div className="flex items-center gap-4">
            {profile?.company_logo && (
              <img alt="Company Logo" className="h-16 w-auto object-contain drop-shadow-sm" src={profile.company_logo} />
            )}
            <div className="text-left">
              <h1 className="text-3xl font-extrabold text-[#8b0000] tracking-tight uppercase leading-none">
                {profile?.company_name || 'COMPANY NAME'}
              </h1>
              {profile?.company_address && (
                <p className="text-xs text-gray-600 mt-1.5 font-medium max-w-sm">{profile.company_address}</p>
              )}
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
             <div className="bg-[#8b0000] text-white px-4 py-1 rounded-l-md font-bold text-lg tracking-widest uppercase mb-2 shadow-sm">
              Invoice
            </div>
            <p className="text-xs font-semibold text-gray-800">Date: {formatDate(issueDate)}</p>
          </div>
        </div>

        <div className="mb-3 text-xs">
          <p><span className="font-semibold">Ref:</span> {invoice.invoiceNumber}</p>
          <p className="font-semibold mt-1.5">To,</p>
          <p className="font-bold text-sm">{invoice.clientName}</p>
          {(invoice.clientAddress || invoice.clientPhone) && (
            <p className="whitespace-pre-line text-gray-800 leading-tight mt-0.5">{invoice.clientAddress || invoice.clientPhone}</p>
          )}
        </div>

        <div className="mb-3">
          <p className="font-bold text-xs"><span className="font-bold">Subject:</span> {subject}</p>
        </div>

        {/* Table */}
        <div className="mb-4 w-full">
          <table className="w-full text-[11px] border-collapse border border-gray-300">
            <thead>
              <tr className="bg-[#8b0000] text-white">
                <th className="border border-gray-300 py-1 px-1 text-center w-10 font-bold">Sl<br/>No</th>
                <th className="border border-gray-300 py-1 px-2 text-center font-bold">Description of Item</th>
                <th className="border border-gray-300 py-1 px-1 text-center w-16 font-bold">Qty</th>
                <th className="border border-gray-300 py-1 px-1 text-center w-20 font-bold">Rate</th>
                <th className="border border-gray-300 py-1 px-1 text-center w-24 font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.groups?.map((group, gIdx) => {
                const groupSubtotal = group.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
                return (
                  <React.Fragment key={gIdx}>
                    {/* Group Header */}
                    {group.name && (
                      <tr className="bg-red-50/50">
                        <td colSpan={5} className="border border-gray-300 py-1 px-2 font-bold text-gray-900 text-[11px]">
                          {group.name}
                        </td>
                      </tr>
                    )}
                    
                    {/* Group Items */}
                    {group.items.map((item, iIdx) => {
                      const currentSlNo = globalSlNo++;
                      return (
                        <tr key={iIdx} className="hover:bg-gray-50 transition-colors">
                          <td className="border border-gray-300 py-1 px-1 text-center text-gray-800">{currentSlNo}</td>
                          <td className="border border-gray-300 py-1 px-2 text-gray-800">{item.name}</td>
                          <td className="border border-gray-300 py-1 px-1 text-center text-gray-800">{item.quantity}</td>
                          <td className="border border-gray-300 py-1 px-1 text-right text-gray-800">{formatMoney(item.unitPrice, sym)}</td>
                          <td className="border border-gray-300 py-1 px-1 text-right text-gray-900">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                        </tr>
                      );
                    })}

                    {/* Group Total */}
                    {showGroupTotals && group.items.length > 0 && (
                      <tr className="bg-red-50/30">
                        <td colSpan={5} className="border border-gray-300 py-1 px-2 text-left text-[11px] font-bold text-[#8b0000]">
                          <span className="text-gray-700">{group.name ? `${group.name} Total:` : 'Group Total:'}</span> <span className="ml-2">{formatMoney(groupSubtotal, sym)}</span>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Empty state fallback if no groups */}
              {(!invoice.groups || invoice.groups.length === 0) && (
                <tr>
                  <td colSpan={5} className="border border-gray-300 py-2 text-center text-gray-500 italic">No items found</td>
                </tr>
              )}

              {/* Adjustments (Discount, Shipping) if any */}
              {discountAmount > 0 && (
                <tr>
                  <td colSpan={4} className="border border-gray-300 py-1 px-2 text-right font-semibold text-gray-700">Discount</td>
                  <td className="border border-gray-300 py-1 px-1 text-right text-gray-800">-{formatMoney(discountAmount, sym)}</td>
                </tr>
              )}
              {shippingCost > 0 && (
                <tr>
                  <td colSpan={4} className="border border-gray-300 py-1 px-2 text-right font-semibold text-gray-700">Shipping</td>
                  <td className="border border-gray-300 py-1 px-1 text-right text-gray-800">+{formatMoney(shippingCost, sym)}</td>
                </tr>
              )}

              {/* Grand Total */}
              <tr>
                <td colSpan={4} className="border border-gray-300 py-1.5 px-2 text-right font-bold text-[#8b0000] text-[12px]">
                  Grand Total
                </td>
                <td className="border border-[#8b0000] bg-[#8b0000] py-1.5 px-1 text-right font-bold text-white text-[12px]">
                  {formatMoney(total, '')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Words */}
        <div className="mb-4">
          <p className="text-xs">
            <span className="font-bold">In Word: </span>
            <span className="text-[#8b0000] italic font-bold">{numberToWords(total)} {currencyName}</span>
          </p>
        </div>

        {/* Notes */}
        {((invoice as any).tax_amount || 0) === 0 ? (
          <div className="mb-4 text-[11px]">
            <p className="font-bold mb-0.5">N.B:</p>
            <p className="text-gray-800 whitespace-pre-line">* This Bill is without Vat, Tax & Ait.</p>
          </div>
        ) : invoice.notes ? (
          <div className="mb-4 text-[11px]">
            <p className="font-bold mb-0.5">N.B:</p>
            <p className="text-gray-800 whitespace-pre-line">{invoice.notes}</p>
          </div>
        ) : null}

        {/* Footer info */}
        <div className="mt-8 w-full">
          <p className="mb-2 text-[11px]">Thanking You,</p>
          
          <div className="flex justify-between items-end">
            <div>
              {profile?.qr_code_enabled && publicUrl && (
                <div className="mt-2">
                  <QRCodeSVG value={publicUrl} size={60} />
                </div>
              )}
            </div>

            <div className="text-right">
              {((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name)) ? (
                <div className="flex flex-col items-center ml-auto w-40">
                  {(invoice.signature_url || profile?.signature_url) && (
                    <img src={invoice.signature_url || profile?.signature_url || undefined} alt="Signature" className="h-10 mb-1 object-contain" />
                  )}
                  <div className="w-full border-b-2 border-gray-800 mb-1"></div>
                  <p className="text-[10px] font-bold text-gray-800">{invoice.signatory_name || profile?.signatory_name || 'Authorized Signatory'}</p>
                </div>
              ) : (
                <div className="w-40 border-b-2 border-gray-800 mb-1 ml-auto"></div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
