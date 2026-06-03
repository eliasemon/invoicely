import React from 'react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal, getAllItems } from './templateUtils';

export function GeometricA4Template({ invoice, profile }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt);
  const subtotal = getSubtotal(invoice);
  const items = getAllItems(invoice);

  return (
    <div className="bg-[#f0f4f8] min-h-screen py-8 px-4" style={{ fontFamily: 'Geist, sans-serif' }}>
      <div className="max-w-[800px] mx-auto bg-white shadow-lg relative overflow-hidden" style={{ minHeight: '1123px' }}>
        {/* Geometric decorations */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#dbeafe] rounded-bl-[100px] opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#e0e7ff] rounded-tr-[80px] opacity-40"></div>
        <div className="absolute top-1/3 left-0 w-2 h-24 bg-[#3b82f6]"></div>

        <div className="relative z-10 p-10 md:p-14">
          {/* Header */}
          <div className="flex justify-between items-start mb-14">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {profile?.company_logo ? (
                  <img src={profile.company_logo} alt="Logo" className="max-h-20 max-w-[200px] object-contain w-auto h-auto" />
                ) : (
                  <div className="w-16 h-16 bg-[#3b82f6] rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                    {(profile?.company_name || 'C')[0]}
                  </div>
                )}
                <h1 className="text-xl font-bold text-[#1e293b]">{profile?.company_name || 'Your Company'}</h1>
              </div>
              <p className="text-sm text-[#64748b] whitespace-pre-line">{profile?.company_address || ''}</p>
              {(profile?.email || profile?.phone) && (
                <p className="text-xs text-[#64748b] mt-1">
                  {profile.email}{profile.email && profile.phone ? ' • ' : ''}{profile.phone}
                </p>
              )}
            </div>
            <div className="text-right bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0]">
              <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Invoice</p>
              <p className="text-lg font-bold text-[#3b82f6] font-mono">{invoice.invoiceNumber}</p>
              <p className="text-xs text-[#64748b] mt-2 font-mono">{formatDate(invoice.createdAt)}</p>
            </div>
          </div>

          {/* Client & Dates */}
          <div className="grid grid-cols-2 gap-8 mb-12 p-6 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
            <div>
              <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider mb-2 font-semibold">Bill To</p>
              <p className="font-bold text-[#1e293b]">{invoice.clientName}</p>
              <p className="text-sm text-[#64748b] whitespace-pre-line mt-1">{invoice.clientAddress || invoice.clientPhone}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider mb-2 font-semibold">Due</p>
                <p className="text-sm font-mono">{formatDate(dueDate)}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider mb-2 font-semibold">Status</p>
                <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                }`}>{invoice.status}</div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-10">
            {items.map((item, idx) => (
              <div key={idx} className={`flex justify-between items-center py-4 ${idx < items.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#eff6ff] rounded-lg flex items-center justify-center text-[#3b82f6] text-xs font-bold">{idx + 1}</div>
                  <div>
                    <p className="font-medium text-[#1e293b]">{item.name}</p>
                    <p className="text-xs text-[#94a3b8] font-mono">{item.quantity} × {formatMoney(item.unitPrice, sym)}</p>
                  </div>
                </div>
                <p className="font-mono font-semibold text-[#1e293b]">{formatMoney(item.quantity * item.unitPrice, sym)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
              <div className="flex justify-between py-1.5 text-sm text-[#64748b] font-mono"><span>Subtotal</span><span>{formatMoney(subtotal, sym)}</span></div>
              <div className="flex justify-between py-1.5 text-sm text-[#64748b] font-mono"><span>Tax</span><span>{formatMoney(0, sym)}</span></div>
              <div className="flex justify-between py-3 mt-3 border-t-2 border-[#3b82f6] text-xl font-bold text-[#1e293b] font-mono"><span>Total</span><span>{formatMoney(subtotal, sym)}</span></div>
            </div>
          </div>
          {/* Bank Details & Signature Section */}
          {(((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ||
            ((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name))) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 border-t border-[#e2e8f0] pt-8 text-left">
              {/* Bank Details */}
              {((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ? (
                <div>
                  <h4 className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold mb-2">Settlement Details</h4>
                  <div className="text-sm text-[#475569] space-y-1 font-mono">
                    <p><span className="font-semibold text-[#1e293b]" style={{ fontFamily: 'Geist, sans-serif' }}>Bank:</span> {invoice.bank_name || profile?.bank_name}</p>
                    {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                      <p><span className="font-semibold text-[#1e293b]" style={{ fontFamily: 'Geist, sans-serif' }}>Holder:</span> {invoice.bank_account_holder || profile?.bank_account_holder}</p>
                    )}
                    {(invoice.bank_account_number || profile?.bank_account_number) && (
                      <p><span className="font-semibold text-[#1e293b]" style={{ fontFamily: 'Geist, sans-serif' }}>Account:</span> {invoice.bank_account_number || profile?.bank_account_number}</p>
                    )}
                    {(invoice.bank_swift || profile?.bank_swift) && (
                      <p><span className="font-semibold text-[#1e293b]" style={{ fontFamily: 'Geist, sans-serif' }}>SWIFT:</span> {invoice.bank_swift || profile?.bank_swift}</p>
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
