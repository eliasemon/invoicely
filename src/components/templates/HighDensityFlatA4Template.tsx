import React from 'react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal, getAllItems } from './templateUtils';

export function HighDensityFlatA4Template({ invoice, profile }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt);
  const subtotal = getSubtotal(invoice);
  const items = getAllItems(invoice);

  return (
    <div className="bg-[#f1f5f9] min-h-screen py-8 px-4" style={{ fontFamily: 'Geist, sans-serif' }}>
      <div className="max-w-[800px] mx-auto bg-white shadow-md" style={{ minHeight: '1123px' }}>
        {/* Dense header bar */}
        <div className="bg-[#0f172a] text-white px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {profile?.company_logo && <img src={profile.company_logo} alt="Logo" className="max-h-16 max-w-[200px] brightness-0 invert object-contain w-auto h-auto" />}
            <span className="text-lg font-bold">{profile?.company_name || 'Your Company'}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-mono">{invoice.invoiceNumber}</span>
          </div>
        </div>

        <div className="p-8">
          {/* Company details */}
          {(profile?.company_address || profile?.email || profile?.phone) && (
            <div className="mb-6 text-xs text-[#64748b] flex flex-wrap gap-x-8 gap-y-1 pb-4 border-b border-[#f1f5f9]">
              {profile?.company_address && <div className="whitespace-pre-line"><strong>Address:</strong> {profile.company_address}</div>}
              {profile?.email && <div><strong>Email:</strong> {profile.email}</div>}
              {profile?.phone && <div><strong>Phone:</strong> {profile.phone}</div>}
            </div>
          )}

          {/* Dense info strip */}
          <div className="grid grid-cols-4 gap-4 mb-8 bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0] text-sm">
            <div>
              <p className="text-[10px] text-[#94a3b8] uppercase font-semibold">Client</p>
              <p className="font-semibold text-[#0f172a]">{invoice.clientName}</p>
              <p className="text-xs text-[#64748b] whitespace-pre-line">{invoice.clientAddress || invoice.clientPhone}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#94a3b8] uppercase font-semibold">Issue Date</p>
              <p className="font-mono text-[#0f172a]">{formatDate(invoice.createdAt)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#94a3b8] uppercase font-semibold">Due Date</p>
              <p className="font-mono text-[#0f172a]">{formatDate(dueDate)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#94a3b8] uppercase font-semibold">Status</p>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : invoice.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-700'
              }`}>{invoice.status}</span>
            </div>
          </div>

          {/* Dense table */}
          <table className="w-full mb-8 text-sm">
            <thead>
              <tr className="bg-[#f8fafc]">
                <th className="text-left py-2 px-3 text-[10px] text-[#94a3b8] uppercase font-semibold border-b border-[#e2e8f0]">#</th>
                <th className="text-left py-2 px-3 text-[10px] text-[#94a3b8] uppercase font-semibold border-b border-[#e2e8f0]">Description</th>
                <th className="text-right py-2 px-3 text-[10px] text-[#94a3b8] uppercase font-semibold border-b border-[#e2e8f0] w-16">Qty</th>
                <th className="text-right py-2 px-3 text-[10px] text-[#94a3b8] uppercase font-semibold border-b border-[#e2e8f0] w-24">Rate</th>
                <th className="text-right py-2 px-3 text-[10px] text-[#94a3b8] uppercase font-semibold border-b border-[#e2e8f0] w-24">Amount</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {items.map((item, idx) => (
                <tr key={idx} className={`border-b border-[#f1f5f9] ${idx % 2 === 0 ? '' : 'bg-[#fafbfc]'}`}>
                  <td className="py-2 px-3 text-[#94a3b8]">{idx + 1}</td>
                  <td className="py-2 px-3 text-[#0f172a]" style={{ fontFamily: 'Geist, sans-serif' }}>{item.name}</td>
                  <td className="py-2 px-3 text-right text-[#64748b]">{item.quantity}</td>
                  <td className="py-2 px-3 text-right text-[#64748b]">{formatMoney(item.unitPrice, sym)}</td>
                  <td className="py-2 px-3 text-right font-semibold text-[#0f172a]">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-56">
              <div className="flex justify-between py-1.5 text-sm text-[#64748b] font-mono border-b border-[#f1f5f9]"><span>Subtotal</span><span>{formatMoney(subtotal, sym)}</span></div>
              <div className="flex justify-between py-1.5 text-sm text-[#64748b] font-mono border-b border-[#f1f5f9]"><span>Tax</span><span>{formatMoney(0, sym)}</span></div>
              <div className="flex justify-between py-2 mt-1 bg-[#0f172a] text-white px-3 rounded font-bold font-mono"><span>Total</span><span>{formatMoney(subtotal, sym)}</span></div>
            </div>
          </div>

          {/* Bank details & Signature */}
          <div className="mt-12 pt-6 border-t border-[#e2e8f0] flex flex-col md:flex-row justify-between items-start gap-8 text-sm">
            {((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                <div><p className="text-[10px] text-[#94a3b8] uppercase font-semibold">Bank</p><p className="text-[#0f172a]">{invoice.bank_name || profile?.bank_name}</p></div>
                <div><p className="text-[10px] text-[#94a3b8] uppercase font-semibold">Account</p><p className="font-mono text-[#0f172a]">{invoice.bank_account_number || profile?.bank_account_number}</p></div>
                <div><p className="text-[10px] text-[#94a3b8] uppercase font-semibold">Holder</p><p className="text-[#0f172a]">{invoice.bank_account_holder || profile?.bank_account_holder}</p></div>
                {(invoice.bank_swift || profile?.bank_swift) && <div><p className="text-[10px] text-[#94a3b8] uppercase font-semibold">SWIFT</p><p className="font-mono text-[#0f172a]">{invoice.bank_swift || profile?.bank_swift}</p></div>}
              </div>
            ) : <div className="flex-1"></div>}

            {((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name)) && (
              <div className="flex flex-col items-start md:items-end min-w-[160px]">
                {(invoice.signature_url || profile?.signature_url) && (
                  <img src={invoice.signature_url || profile?.signature_url || undefined} alt="Signature" className="h-8 mb-1 object-contain" />
                )}
                <div className="w-36 border-b border-[#e2e8f0] mb-1"></div>
                <p className="text-[10px] text-[#64748b] font-semibold">{invoice.signatory_name || profile?.signatory_name || 'Authorized Signatory'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
