import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal, getAllItems } from './templateUtils';

export function GeometricA4Template({ invoice, profile, showGroups , publicUrl }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt);
  const subtotal = getSubtotal(invoice);
  const amountPaid = invoice.amountPaid || 0;
  const balanceDue = Math.max(0, subtotal - amountPaid);
  const items = getAllItems(invoice);

  return (
    <div className="bg-[#f0f4f8] min-h-screen py-8 px-4 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]" style={{ fontFamily: 'Geist, sans-serif' }}>
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white shadow-lg relative overflow-hidden print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        {/* Geometric decorations */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#dbeafe] rounded-bl-[100px] opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#e0e7ff] rounded-tr-[80px] opacity-40"></div>
        <div className="absolute top-1/3 left-0 w-2 h-24 bg-[#3b82f6]"></div>

        <div className="relative z-10 p-6 md:p-10 print:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start gap-4 sm:gap-6 mb-6">
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
            <div className="text-left sm:text-right print:text-right w-full sm:w-auto print:w-auto bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0]">
              <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Invoice</p>
              <p className="text-lg font-bold text-[#3b82f6] font-mono">{invoice.invoiceNumber}</p>
              <p className="text-xs text-[#64748b] mt-2 font-mono">{formatDate(invoice.createdAt)}</p>
            </div>
          </div>

          {/* Client & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 sm:gap-8 mb-6 p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
            <div>
              <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider mb-2 font-semibold">Bill To</p>
              <p className="font-bold text-[#1e293b]">{invoice.clientName}</p>
              <p className="text-sm text-[#64748b] whitespace-pre-line mt-1">{invoice.clientAddress || invoice.clientPhone}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
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
          <div className="mb-3">
            {showGroups && invoice.groups && invoice.groups.length > 0 ? (
              invoice.groups.map((group, gIdx) => (
                <div key={gIdx} className="mb-3 last:mb-0">
                  {group.name && (
                    <div className="text-[10px] font-bold tracking-wider text-[#3b82f6] bg-[#eff6ff] px-2.5 py-0.5 rounded mb-2 uppercase inline-block">
                      {group.name}
                    </div>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex justify-between items-center py-1 border-b border-[#f1f5f9]/60 last:border-0">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 bg-[#eff6ff] rounded-md flex items-center justify-center text-[#3b82f6] text-[10px] font-bold">{iIdx + 1}</div>
                          <div>
                            <p className="font-medium text-xs text-[#1e293b]">{item.name}</p>
                            <p className="text-[10px] text-[#94a3b8] font-mono">{item.quantity} × {formatMoney(item.unitPrice, sym)}</p>
                          </div>
                        </div>
                        <p className="font-mono font-semibold text-xs text-[#1e293b]">{formatMoney(item.quantity * item.unitPrice, sym)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              items.map((item, idx) => (
                <div key={idx} className={`flex justify-between items-center py-1 ${idx < items.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 bg-[#eff6ff] rounded-md flex items-center justify-center text-[#3b82f6] text-[10px] font-bold">{idx + 1}</div>
                    <div>
                      <p className="font-medium text-xs text-[#1e293b]">{item.name}</p>
                      <p className="text-[10px] text-[#94a3b8] font-mono">{item.quantity} × {formatMoney(item.unitPrice, sym)}</p>
                    </div>
                  </div>
                  <p className="font-mono font-semibold text-xs text-[#1e293b]">{formatMoney(item.quantity * item.unitPrice, sym)}</p>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-60 print:w-60 bg-[#f8fafc] rounded-xl p-2.5 border border-[#e2e8f0]">
              <div className="flex justify-between py-1 text-xs text-[#64748b] font-mono"><span>Subtotal</span><span>{formatMoney(subtotal, sym)}</span></div>
              <div className="flex justify-between py-1 text-xs text-[#64748b] font-mono"><span>Tax</span><span>{formatMoney(0, sym)}</span></div>
              <div className="flex justify-between py-2 mt-2 border-t-2 border-[#3b82f6] text-sm font-bold text-[#1e293b] font-mono"><span>Total</span><span>{formatMoney(subtotal, sym)}</span></div>
              {amountPaid > 0 && (
                <>
                  <div className="flex justify-between py-2 text-sm text-gray-500 font-medium">
                    <span>Paid</span>
                    <span>{formatMoney(amountPaid, sym)}</span>
                  </div>
                  <div className="flex justify-between py-3 mt-2 border-t-2 border-gray-800 text-lg font-bold text-gray-900">
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
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 mt-6 border-t border-[#e2e8f0] pt-4 text-left w-full">
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
              <div className="flex flex-row items-end gap-6 justify-start md:justify-end print:justify-end w-full">
                    {profile?.qr_code_enabled && publicUrl && (
                      <div className="flex flex-col items-center mb-1">
                        <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1">Scan to View</p>
                        <QRCodeSVG value={publicUrl} size={54} />
                      </div>
                    )}
                    {((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name)) && (
                <div className="flex flex-col items-start md:items-end print:items-end">
                  {(invoice.signature_url || profile?.signature_url) && (
                    <img src={invoice.signature_url || profile?.signature_url || undefined} alt="Signature" className="h-10 mb-2 object-contain" />
                  )}
                  <div className="w-full border-b border-[#e2e8f0] mb-1"></div>
                  <p className="text-xs text-[#64748b] font-semibold">{invoice.signatory_name || profile?.signatory_name || 'Authorized Signatory'}</p>
                </div>
              )}
                  </div>
            
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
