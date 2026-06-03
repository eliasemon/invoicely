import React from 'react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal, getAllItems } from './templateUtils';

export function PristineA4Template({ invoice, profile }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt);
  const subtotal = getSubtotal(invoice);
  const items = getAllItems(invoice);

  return (
    <div className="bg-[#f0f4f8] min-h-screen py-8 px-4" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
      <div className="max-w-[800px] mx-auto bg-white shadow-lg" style={{ minHeight: '1123px' }}>
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-[#0058be] via-[#2170e4] to-[#0058be]"></div>
        
        <div className="p-10 md:p-16">
          {/* Header */}
          <div className="flex justify-between items-start mb-16">
            <div>
              {profile?.company_logo && <img src={profile.company_logo} alt="Logo" className="max-h-20 max-w-[200px] mb-4 object-contain w-auto h-auto" />}
              <h1 className="text-3xl font-bold text-black mb-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>{profile?.company_name || 'Your Company'}</h1>
              <p className="text-sm text-[#64748b] whitespace-pre-line">{profile?.company_address || ''}</p>
              {(profile?.email || profile?.phone) && (
                <p className="text-sm text-[#64748b] mt-1">
                  {profile.email}{profile.email && profile.phone ? ' • ' : ''}{profile.phone}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[12px] text-[#94a3b8] uppercase tracking-[0.15em] mb-1">Invoice</p>
              <p className="text-lg font-bold text-black" style={{ fontFamily: 'Geist, monospace' }}>{invoice.invoiceNumber}</p>
              <div className={`inline-block mt-3 px-3 py-1 rounded text-[11px] font-semibold uppercase ${
                invoice.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : invoice.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' : 'bg-amber-50 text-amber-700'
              }`}>{invoice.status}</div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-8 mb-12 pb-8 border-b border-[#e2e8f0]">
            <div>
              <p className="text-[11px] text-[#94a3b8] uppercase tracking-wider mb-2">Bill To</p>
              <p className="font-semibold text-black">{invoice.clientName}</p>
              <p className="text-sm text-[#64748b] whitespace-pre-line mt-1">{invoice.clientAddress || invoice.clientPhone}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#94a3b8] uppercase tracking-wider mb-2">Issue Date</p>
              <p className="text-sm font-medium" style={{ fontFamily: 'Geist, monospace' }}>{formatDate(invoice.createdAt)}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#94a3b8] uppercase tracking-wider mb-2">Due Date</p>
              <p className="text-sm font-medium" style={{ fontFamily: 'Geist, monospace' }}>{formatDate(dueDate)}</p>
            </div>
          </div>

          {/* Items */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-[#0058be]">
                <th className="text-left py-3 text-[11px] text-[#64748b] uppercase tracking-wider">Description</th>
                <th className="text-right py-3 text-[11px] text-[#64748b] uppercase tracking-wider w-20">Qty</th>
                <th className="text-right py-3 text-[11px] text-[#64748b] uppercase tracking-wider w-28">Rate</th>
                <th className="text-right py-3 text-[11px] text-[#64748b] uppercase tracking-wider w-28">Amount</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: 'Geist, monospace' }}>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-[#f1f5f9]">
                  <td className="py-3 font-medium text-black" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>{item.name}</td>
                  <td className="py-3 text-right text-sm text-[#64748b]">{item.quantity}</td>
                  <td className="py-3 text-right text-sm text-[#64748b]">{formatMoney(item.unitPrice, sym)}</td>
                  <td className="py-3 text-right text-sm font-medium text-black">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 text-sm text-[#64748b]" style={{ fontFamily: 'Geist, monospace' }}>
                <span>Subtotal</span><span>{formatMoney(subtotal, sym)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm text-[#64748b]" style={{ fontFamily: 'Geist, monospace' }}>
                <span>Tax</span><span>{formatMoney(0, sym)}</span>
              </div>
              <div className="flex justify-between py-3 mt-2 border-t-2 border-[#0058be] text-lg font-bold text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                <span>Total</span><span>{formatMoney(subtotal, sym)}</span>
              </div>
            </div>
          </div>

          {/* Bank Details & Signature Section */}
          <div className="mt-16 pt-8 border-t border-[#e2e8f0] flex flex-col md:flex-row justify-between items-start gap-8">
            {((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ? (
              <div className="flex-1">
                <p className="text-[11px] text-[#94a3b8] uppercase tracking-wider mb-2">Bank Details</p>
                <p className="text-sm font-semibold text-black">{invoice.bank_name || profile?.bank_name}</p>
                <p className="text-xs text-[#64748b] mt-0.5">
                  {invoice.bank_account_holder || profile?.bank_account_holder} • {invoice.bank_account_number || profile?.bank_account_number}
                  {(invoice.bank_swift || profile?.bank_swift) ? ` • SWIFT: ${invoice.bank_swift || profile?.bank_swift}` : ''}
                </p>
              </div>
            ) : <div className="flex-1"></div>}

            {((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name)) && (
              <div className="flex flex-col items-start md:items-end min-w-[200px]">
                {(invoice.signature_url || profile?.signature_url) && (
                  <img src={invoice.signature_url || profile?.signature_url || undefined} alt="Signature" className="h-10 mb-2 object-contain" />
                )}
                <div className="w-40 border-b border-[#e2e8f0] mb-1"></div>
                <p className="text-xs text-[#76777d]">{invoice.signatory_name || profile?.signatory_name || 'Authorized Signatory'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
