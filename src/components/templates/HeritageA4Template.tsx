import React from 'react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal, getAllItems } from './templateUtils';

export function HeritageA4Template({ invoice, profile }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt);
  const subtotal = getSubtotal(invoice);
  const items = getAllItems(invoice);

  return (
    <div className="bg-[#f5f0eb] min-h-screen py-8 px-4" style={{ fontFamily: 'Georgia, serif' }}>
      <div className="max-w-[800px] mx-auto bg-[#fffdf8] shadow-lg border border-[#d4c5b0]" style={{ minHeight: '1123px' }}>
        <div className="p-10 md:p-16">
          {/* Header with ornamental line */}
          <div className="text-center mb-12">
            <div className="w-24 h-[2px] bg-[#8b7355] mx-auto mb-6"></div>
            {profile?.company_logo && (
              <img alt="Company Logo" className="max-h-28 max-w-[240px] mx-auto mb-6 object-contain w-auto h-auto" src={profile.company_logo} />
            )}
            <h1 className="text-4xl font-bold text-[#2c1810] mb-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>{profile?.company_name || 'Your Company'}</h1>
            <p className="text-sm text-[#8b7355] tracking-widest uppercase">{profile?.company_address || ''}</p>
            {(profile?.email || profile?.phone) && (
              <p className="text-xs text-[#8b7355]/85 tracking-wider mt-1" style={{ fontFamily: 'Geist, monospace' }}>
                {profile.email}{profile.email && profile.phone ? ' • ' : ''}{profile.phone}
              </p>
            )}
            <div className="w-24 h-[2px] bg-[#8b7355] mx-auto mt-6"></div>
          </div>

          <div className="flex justify-between items-start mb-12">
            <div>
              <p className="text-[11px] text-[#8b7355] uppercase tracking-[0.2em] mb-3">Invoice To</p>
              <p className="text-xl font-bold text-[#2c1810]">{invoice.clientName}</p>
              <p className="text-sm text-[#6b5b4a] mt-1 whitespace-pre-line">{invoice.clientAddress || invoice.clientPhone}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#8b7355] uppercase tracking-[0.2em] mb-3">Invoice Details</p>
              <p className="text-sm" style={{ fontFamily: 'Geist, monospace' }}><span className="text-[#8b7355]">No:</span> {invoice.invoiceNumber}</p>
              <p className="text-sm mt-1" style={{ fontFamily: 'Geist, monospace' }}><span className="text-[#8b7355]">Date:</span> {formatDate(invoice.createdAt)}</p>
              <p className="text-sm mt-1" style={{ fontFamily: 'Geist, monospace' }}><span className="text-[#8b7355]">Due:</span> {formatDate(dueDate)}</p>
            </div>
          </div>

          {/* Items */}
          <table className="w-full mb-12">
            <thead>
              <tr className="border-y-2 border-[#8b7355]">
                <th className="text-left py-3 text-[11px] text-[#8b7355] uppercase tracking-wider">Item</th>
                <th className="text-right py-3 text-[11px] text-[#8b7355] uppercase tracking-wider w-20">Qty</th>
                <th className="text-right py-3 text-[11px] text-[#8b7355] uppercase tracking-wider w-28">Rate</th>
                <th className="text-right py-3 text-[11px] text-[#8b7355] uppercase tracking-wider w-28">Amount</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: 'Geist, monospace' }}>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-[#e8ddd0]">
                  <td className="py-3 text-[#2c1810]" style={{ fontFamily: 'Georgia, serif' }}>{item.name}</td>
                  <td className="py-3 text-right text-sm text-[#6b5b4a]">{item.quantity}</td>
                  <td className="py-3 text-right text-sm text-[#6b5b4a]">{formatMoney(item.unitPrice, sym)}</td>
                  <td className="py-3 text-right text-sm font-semibold text-[#2c1810]">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-16">
            <div className="w-64">
              <div className="flex justify-between py-2 text-sm text-[#6b5b4a]"><span>Subtotal</span><span style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(subtotal, sym)}</span></div>
              <div className="flex justify-between py-2 text-sm text-[#6b5b4a]"><span>Tax</span><span style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(0, sym)}</span></div>
              <div className="flex justify-between py-3 border-t-2 border-[#8b7355] mt-2 text-xl font-bold text-[#2c1810]">
                <span>Total</span><span style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(subtotal, sym)}</span>
              </div>
            </div>
          </div>

          {/* Bank Details & Signature Section */}
          {(((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ||
            ((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name))) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 border-t border-[#d4c5b0] pt-8 text-left">
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
              {((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name)) && (
                <div className="flex flex-col items-start md:items-end">
                  {(invoice.signature_url || profile?.signature_url) && (
                    <img src={invoice.signature_url || profile?.signature_url || undefined} alt="Signature" className="h-10 mb-2 object-contain" />
                  )}
                  <div className="w-40 border-b border-[#d4c5b0] mb-1"></div>
                  <p className="text-xs text-[#8b7355]">{invoice.signatory_name || profile?.signatory_name || 'Authorized Signatory'}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="text-center border-t border-[#d4c5b0] pt-8">
            <p className="text-sm text-[#8b7355] italic">Thank you for your patronage</p>
          </div>
        </div>
      </div>
    </div>
  );
}
