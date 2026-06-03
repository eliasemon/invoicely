import React from 'react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal, getAllItems } from './templateUtils';

export function FintechA4Template({ invoice, profile }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt);
  const subtotal = getSubtotal(invoice);
  const items = getAllItems(invoice);

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 px-4" style={{ fontFamily: 'Geist, sans-serif' }}>
      <div className="max-w-[800px] mx-auto bg-white text-[#1e293b] rounded-2xl border border-[#e2e8f0] shadow-xl overflow-hidden" style={{ minHeight: '1123px' }}>
        {/* Gradient top */}
        <div className="h-1 bg-gradient-to-r from-[#22c55e] via-[#10b981] to-[#14b8a6]"></div>
        
        <div className="p-10 md:p-14">
          {/* Header */}
          <div className="flex justify-between items-start mb-14">
            <div>
              {profile?.company_logo && (
                <img alt="Company Logo" className="max-h-20 max-w-[200px] mb-4 object-contain w-auto h-auto" src={profile.company_logo} />
              )}
              <h1 className="text-2xl font-bold text-[#0f172a]">{profile?.company_name || 'Your Company'}</h1>
              {profile?.email && <p className="text-sm text-[#475569] mt-1">{profile.email}</p>}
              {profile?.phone && <p className="text-sm text-[#475569] mt-0.5">{profile.phone}</p>}
              {profile?.company_address && (
                <p className="text-xs text-[#475569] mt-2 whitespace-pre-line">{profile.company_address}</p>
              )}
            </div>
            <div className="text-right">
              <div className="inline-block bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-3">
                <p className="text-[10px] text-[#64748b] uppercase tracking-wider">Invoice</p>
                <p className="text-xl font-bold text-[#16a34a] font-mono">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>

          {/* Status + Amount Card */}
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-6 mb-10 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-[#15803d] uppercase tracking-wider mb-1">Amount Due</p>
              <p className="text-3xl font-bold text-[#15803d] font-mono">{formatMoney(subtotal, sym)}</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-amber-100 text-amber-700 border border-amber-300'
            }`}>{invoice.status}</div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="bg-[#f8fafc] rounded-lg p-4 border border-[#e2e8f0]">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-2">Client</p>
              <p className="font-semibold text-[#0f172a] text-sm">{invoice.clientName}</p>
              <p className="text-xs text-[#475569] mt-1 whitespace-pre-line">{invoice.clientAddress || invoice.clientPhone}</p>
            </div>
            <div className="bg-[#f8fafc] rounded-lg p-4 border border-[#e2e8f0]">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-2">Issued</p>
              <p className="font-mono text-sm text-[#0f172a]">{formatDate(invoice.createdAt)}</p>
            </div>
            <div className="bg-[#f8fafc] rounded-lg p-4 border border-[#e2e8f0]">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-2">Due</p>
              <p className="font-mono text-sm text-[#0f172a]">{formatDate(dueDate)}</p>
            </div>
          </div>

          {/* Items */}
          <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] overflow-hidden mb-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f1f5f9]">
                  <th className="text-left py-3 px-5 text-[10px] text-[#64748b] uppercase tracking-wider">Item</th>
                  <th className="text-right py-3 px-5 text-[10px] text-[#64748b] uppercase tracking-wider w-16">Qty</th>
                  <th className="text-right py-3 px-5 text-[10px] text-[#64748b] uppercase tracking-wider w-24">Rate</th>
                  <th className="text-right py-3 px-5 text-[10px] text-[#64748b] uppercase tracking-wider w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#e2e8f0] bg-white hover:bg-[#f1f5f9] transition-colors">
                    <td className="py-3 px-5 text-[#0f172a]" style={{ fontFamily: 'Geist, sans-serif' }}>{item.name}</td>
                    <td className="py-3 px-5 text-right text-[#475569]">{item.quantity}</td>
                    <td className="py-3 px-5 text-right text-[#475569]">{formatMoney(item.unitPrice, sym)}</td>
                    <td className="py-3 px-5 text-right text-[#16a34a] font-semibold">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 text-sm text-[#64748b] font-mono border-b border-[#f1f5f9]"><span>Subtotal</span><span>{formatMoney(subtotal, sym)}</span></div>
              <div className="flex justify-between py-2 text-sm text-[#64748b] font-mono border-b border-[#f1f5f9]"><span>Tax</span><span>{formatMoney(0, sym)}</span></div>
              <div className="flex justify-between py-3 mt-2 bg-gradient-to-r from-[#166534] to-[#15803d] text-white px-4 rounded-lg font-bold font-mono text-lg">
                <span>Total</span><span>{formatMoney(subtotal, sym)}</span>
              </div>
            </div>
          </div>

          {/* Bank details & Signature */}
          <div className="mt-12 pt-6 border-t border-[#e2e8f0] flex flex-col md:flex-row justify-between items-start gap-8 text-sm">
            {((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                <div><p className="text-[10px] text-[#64748b] uppercase mb-1">Bank</p><p className="text-[#0f172a]">{invoice.bank_name || profile?.bank_name}</p></div>
                <div><p className="text-[10px] text-[#64748b] uppercase mb-1">Account</p><p className="font-mono text-[#0f172a]">{invoice.bank_account_number || profile?.bank_account_number}</p></div>
                <div><p className="text-[10px] text-[#64748b] uppercase mb-1">Holder</p><p className="text-[#0f172a]">{invoice.bank_account_holder || profile?.bank_account_holder}</p></div>
                {(invoice.bank_swift || profile?.bank_swift) && <div><p className="text-[10px] text-[#64748b] uppercase mb-1">SWIFT</p><p className="font-mono text-[#0f172a]">{invoice.bank_swift || profile?.bank_swift}</p></div>}
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
