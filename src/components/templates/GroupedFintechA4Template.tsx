import React from 'react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal } from './templateUtils';

export function GroupedFintechA4Template({ invoice, profile }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt);
  const subtotal = getSubtotal(invoice);

  return (
    <div className="bg-[#f1f5f9] min-h-screen py-8 px-4" style={{ fontFamily: 'Geist, sans-serif' }}>
      <div className="max-w-[800px] mx-auto bg-white text-[#1e293b] rounded-2xl shadow-xl overflow-hidden" style={{ minHeight: '1123px' }}>
        <div className="h-1 bg-gradient-to-r from-[#06b6d4] via-[#8b5cf6] to-[#06b6d4]"></div>
        <div className="p-10 md:p-14">
          {/* Header */}
          <div className="flex justify-between items-start mb-14">
            <div>
              {profile?.company_logo && (
                <img alt="Company Logo" className="max-h-20 max-w-[200px] mb-4 object-contain w-auto h-auto" src={profile.company_logo} />
              )}
              <h1 className="text-2xl font-bold text-[#0f172a] mb-1">{profile?.company_name || 'Your Company'}</h1>
              {profile?.email && <p className="text-sm text-[#475569]">{profile.email}</p>}
              {profile?.phone && <p className="text-sm text-[#475569] mt-0.5">{profile.phone}</p>}
              {profile?.company_address && (
                <p className="text-xs text-[#475569] mt-2 whitespace-pre-line">{profile.company_address}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#64748b] uppercase tracking-widest mb-1">Invoice</p>
              <p className="text-lg font-bold text-[#0891b2] font-mono">{invoice.invoiceNumber}</p>
              <div className={`inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-semibold ${
                invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-amber-100 text-amber-700 border border-amber-300'
              }`}>{invoice.status}</div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1">Billed To</p>
              <p className="text-sm font-semibold text-[#0f172a]">{invoice.clientName}</p>
              <p className="text-xs text-[#475569] mt-1 whitespace-pre-line">{invoice.clientAddress || invoice.clientPhone}</p>
            </div>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1">Issue Date</p>
              <p className="text-sm font-mono text-[#0f172a]">{formatDate(invoice.createdAt)}</p>
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1 mt-3">Due Date</p>
              <p className="text-sm font-mono text-[#0f172a]">{formatDate(dueDate)}</p>
            </div>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 flex flex-col justify-center">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-[#0891b2] font-mono">{formatMoney(subtotal, sym)}</p>
            </div>
          </div>

          {/* Grouped Items */}
          {invoice.groups?.map((group, gIdx) => (
            <div key={gIdx} className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#0891b2]"></div>
                <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider">{group.name || `Group ${gIdx + 1}`}</h3>
              </div>
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e2e8f0] bg-[#f1f5f9]">
                      <th className="text-left py-2.5 px-4 text-[10px] text-[#64748b] uppercase">Item</th>
                      <th className="text-right py-2.5 px-4 text-[10px] text-[#64748b] uppercase w-16">Qty</th>
                      <th className="text-right py-2.5 px-4 text-[10px] text-[#64748b] uppercase w-24">Rate</th>
                      <th className="text-right py-2.5 px-4 text-[10px] text-[#64748b] uppercase w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {group.items.map((item, iIdx) => (
                      <tr key={iIdx} className="border-b border-[#e2e8f0] bg-white last:border-b-0 hover:bg-[#f1f5f9] transition-colors">
                        <td className="py-2.5 px-4 text-[#1e293b]" style={{ fontFamily: 'Geist, sans-serif' }}>{item.name}</td>
                        <td className="py-2.5 px-4 text-right text-[#475569]">{item.quantity}</td>
                        <td className="py-2.5 px-4 text-right text-[#475569]">{formatMoney(item.unitPrice, sym)}</td>
                        <td className="py-2.5 px-4 text-right text-[#0f172a] font-semibold">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="flex justify-end mt-8">
            <div className="w-64 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
              <div className="flex justify-between py-1.5 text-sm text-[#475569] font-mono"><span>Subtotal</span><span>{formatMoney(subtotal, sym)}</span></div>
              <div className="flex justify-between py-1.5 text-sm text-[#475569] font-mono"><span>Tax</span><span>{formatMoney(0, sym)}</span></div>
              <div className="flex justify-between py-2 mt-2 border-t border-[#e2e8f0] text-lg font-bold text-[#0891b2] font-mono"><span>Total</span><span>{formatMoney(subtotal, sym)}</span></div>
            </div>
          </div>
          {/* Bank Details & Signature Section */}
          {(((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ||
            ((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name))) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 border-t border-[#e2e8f0] pt-8 text-left">
              {/* Bank Details */}
              {((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ? (
                <div>
                  <h4 className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold mb-2">Settlement Account Details</h4>
                  <div className="text-sm text-[#475569] space-y-1 font-mono">
                    <p><span className="font-semibold text-[#0f172a]" style={{ fontFamily: 'Geist, sans-serif' }}>Bank:</span> {invoice.bank_name || profile?.bank_name}</p>
                    {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                      <p><span className="font-semibold text-[#0f172a]" style={{ fontFamily: 'Geist, sans-serif' }}>Holder:</span> {invoice.bank_account_holder || profile?.bank_account_holder}</p>
                    )}
                    {(invoice.bank_account_number || profile?.bank_account_number) && (
                      <p><span className="font-semibold text-[#0f172a]" style={{ fontFamily: 'Geist, sans-serif' }}>Account:</span> {invoice.bank_account_number || profile?.bank_account_number}</p>
                    )}
                    {(invoice.bank_swift || profile?.bank_swift) && (
                      <p><span className="font-semibold text-[#0f172a]" style={{ fontFamily: 'Geist, sans-serif' }}>SWIFT:</span> {invoice.bank_swift || profile?.bank_swift}</p>
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
                  <div className="w-40 border-b border-[#e2e8f0] mb-1"></div>
                  <p className="text-xs text-[#64748b] font-semibold">{invoice.signatory_name || profile?.signatory_name || 'Authorized Signatory'}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
