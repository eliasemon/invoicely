import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TemplateProps, formatDate, formatMoney, getIssueDate, getDueDate, getSubtotal, getDiscountAmount, getShippingCost, getTotal, getAllItems } from './templateUtils';

export function HeritageA4Template({ invoice, profile, showGroups, showGroupTotals, publicUrl }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
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
 <div className="min-h-screen py-8 bg-[#f5f0eb] print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]" style={{ fontFamily: 'Georgia, serif' }}> <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-[#fffdf8] shadow-lg border border-[#d4c5b0] print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">         <div className="p-6 p-6 print:p-6">
          {/* Header with ornamental line */}
          <div className="text-center mb-3">
            <div className="w-24 h-[2px] bg-[#8b7355] mx-auto mb-2"></div>
            {profile?.company_logo && (
              <img alt="Company Logo" className="max-h-16 max-w-[200px] mx-auto mb-2 object-contain w-auto h-auto" src={profile.company_logo} />
            )}
            <h1 className="text-sm font-bold text-[#2c1810] mb-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>{profile?.company_name || 'Your Company'}</h1>
            <p className="text-[11px] text-[#8b7355] tracking-widest uppercase">{profile?.company_address || ''}</p>
            {(profile?.email || profile?.phone) && (
              <p className="text-[11px] text-[#8b7355]/85 tracking-wider mt-1" style={{ fontFamily: 'Geist, monospace' }}>
                {profile.email}{profile.email && profile.phone ? ' • ' : ''}{profile.phone}
              </p>
            )}
            <div className="w-24 h-[2px] bg-[#8b7355] mx-auto mt-4"></div>
          </div>

          <div className="flex flex-row print:flex-row justify-between items-start gap-3 mb-3">
            <div>
              <p className="text-[11px] text-[#8b7355] uppercase tracking-[0.2em] mb-1.5">Invoice To</p>
              <p className="text-[11px] font-bold text-[#2c1810]">{invoice.clientName}</p>
              <p className="text-[11px] text-[#6b5b4a] mt-1 whitespace-pre-line">{invoice.clientAddress || invoice.clientPhone}</p>
            </div>
            <div className="text-right print:text-right w-auto print:w-auto">
              <p className="text-[11px] text-[#8b7355] uppercase tracking-[0.2em] mb-1.5">Invoice Details</p>
              <p className="text-[11px]" style={{ fontFamily: 'Geist, monospace' }}><span className="text-[#8b7355]">No:</span> {invoice.invoiceNumber}</p>
              <p className="text-[11px] mt-1" style={{ fontFamily: 'Geist, monospace' }}><span className="text-[#8b7355]">Date:</span> {formatDate(issueDate)}</p>
              <p className="text-[11px] mt-1" style={{ fontFamily: 'Geist, monospace' }}><span className="text-[#8b7355]">Due:</span> {formatDate(dueDate)}</p>
              {profile?.qr_code_enabled && publicUrl && (
                <div className="mt-4 flex justify-end print:justify-end">
                  <QRCodeSVG value={publicUrl} size={54} />
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="overflow-x-auto mb-2">
                <table className="w-full min-w-[500px] mb-3">
            <thead>
              <tr className="border-y-2 border-[#8b7355]">
                <th className="text-left py-0.5 text-[11px] text-[#8b7355] uppercase tracking-wider">Item</th>
                <th className="text-right py-0.5 text-[11px] text-[#8b7355] uppercase tracking-wider w-20">Qty</th>
                <th className="text-right py-0.5 text-[11px] text-[#8b7355] uppercase tracking-wider w-28">Rate</th>
                <th className="text-right py-0.5 text-[11px] text-[#8b7355] uppercase tracking-wider w-28">Amount</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: 'Geist, monospace' }}>
              {showGroups && invoice.groups && invoice.groups.length > 0 ? (
                invoice.groups.map((group, gIdx) => (
                  <React.Fragment key={gIdx}>
                    {group.name && (
                      <tr className="bg-[#fcfaf7] font-bold">
                        <td className="py-0.5 text-[10px] text-[#2c1810] border-b border-[#e8ddd0] uppercase text-left font-semibold" style={{ fontFamily: 'Georgia, serif' }}>{group.name}</td>
                      </tr>
                    )}
                    {group.items.map((item, iIdx) => (
                      <tr key={iIdx} className="border-b border-[#e8ddd0]">
                        <td className="py-0.5 text-[#2c1810]" style={{ fontFamily: 'Georgia, serif' }}>{item.name}</td>
                        <td className="py-0.5 text-right text-[11px] text-[#6b5b4a]">{item.quantity}</td>
                        <td className="py-0.5 text-right text-[11px] text-[#6b5b4a]">{formatMoney(item.unitPrice, sym)}</td>
                        <td className="py-0.5 text-right text-[11px] font-semibold text-[#2c1810]">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                      </tr>
                    ))}

                  {showGroupTotals && (
                    <tr className="bg-transparent">
                      <td className="py-0.5 px-2 text-[9px] font-medium text-slate-400 uppercase text-right tracking-wide">Group Subtotal</td>
                      <td className="py-0.5 px-2 text-right text-[10px] font-medium text-slate-500" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(group.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), sym)}</td>
                    </tr>
                  )}
                  </React.Fragment>
                ))
              ) : (
                items.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#e8ddd0]">
                    <td className="py-0.5 text-[#2c1810]" style={{ fontFamily: 'Georgia, serif' }}>{item.name}</td>
                    <td className="py-0.5 text-right text-[11px] text-[#6b5b4a]">{item.quantity}</td>
                    <td className="py-0.5 text-right text-[11px] text-[#6b5b4a]">{formatMoney(item.unitPrice, sym)}</td>
                    <td className="py-0.5 text-right text-[11px] font-semibold text-[#2c1810]">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
              </div>

          {/* Totals */}
          <div className="flex justify-end mb-3">
            <div className="w-64 print:w-64">
              <div className="flex justify-between py-2 text-sm text-[#6b5b4a]"><span>Subtotal</span><span style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(subtotal, sym)}</span></div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between py-2 text-sm text-[#6b5b4a]"><span>Discount {invoice.discount_type === 'percentage' ? `(${invoice.discount_value}%)` : ''}</span><span style={{ fontFamily: 'Geist, monospace' }}>-{formatMoney(discountAmount, sym)}</span></div>
              )}
              <div className="flex justify-between py-2 text-sm text-[#6b5b4a]"><span>Tax</span><span style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(0, sym)}</span></div>
              {shippingCost > 0 && (
                <div className="flex justify-between py-2 text-sm text-[#6b5b4a]"><span>Shipping</span><span style={{ fontFamily: 'Geist, monospace' }}>+{formatMoney(shippingCost, sym)}</span></div>
              )}
            
              <div className="flex justify-between py-3 border-t-2 border-[#8b7355] mt-2 text-sm font-bold text-[#2c1810]">
                <span>Total</span><span style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(total, sym)}</span>
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
          {(((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ||
            ((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name))) && (
            <div className="grid grid-cols-2 print:grid-cols-2 gap-2 mb-3 border-t border-[#d4c5b0] pt-4 text-left w-full">
              {/* Bank Details */}
              {((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ? (
                <div>
                  <h4 className="text-[11px] text-[#8b7355] uppercase tracking-wider mb-2">Payment Transfer Details</h4>
                  <div className="text-sm text-[#6b5b4a] space-y-1">
                    <p><span className="font-semibold text-[#2c1810]">Bank:</span> {invoice.bank_name || profile?.bank_name}</p>
                    {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                      <p><span className="font-semibold text-[#2c1810]">Holder:</span> {invoice.bank_account_holder || profile?.bank_account_holder}</p>
                    )}
                    {(invoice.bank_account_number || profile?.bank_account_number) && (
                      <p><span className="font-semibold text-[#2c1810]">Account:</span> {invoice.bank_account_number || profile?.bank_account_number}</p>
                    )}
                    {(invoice.bank_swift || profile?.bank_swift) && (
                      <p><span className="font-semibold text-[#2c1810]">SWIFT:</span> {invoice.bank_swift || profile?.bank_swift}</p>
                    )}
                  </div>
                </div>
              ) : <div></div>}

              {/* Signature */}
              <div className="flex flex-row items-end gap-3 justify-end print:justify-end w-auto shrink-0">
                    
                    {((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name)) && (
                <div className="flex flex-col items-end print:items-end">
                  {(invoice.signature_url || profile?.signature_url) && (
                    <img src={invoice.signature_url || profile?.signature_url || undefined} alt="Signature" className="h-10 mb-2 object-contain" />
                  )}
                  <div className="w-full border-b border-[#d4c5b0] mb-1"></div>
                  <p className="text-[11px] text-[#8b7355]">{invoice.signatory_name || profile?.signatory_name || 'Authorized Signatory'}</p>
                </div>
              )}
                  </div>
            
            </div>
          )}

          {/* Footer */}
          <div className="text-center border-t border-[#d4c5b0] pt-4">
            <p className="text-[11px] text-[#8b7355] italic">Thank you for your patronage</p>
          </div>
        </div>
      </div>
    </div>
  );
}
