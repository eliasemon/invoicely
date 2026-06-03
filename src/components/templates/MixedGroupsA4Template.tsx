import React from 'react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal } from './templateUtils';

export function MixedGroupsA4Template({ invoice, profile }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt);
  const subtotal = getSubtotal(invoice);

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 px-4 print:bg-white print:p-0 print:m-0 print:min-h-0" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white shadow-md rounded-lg overflow-hidden print:shadow-none print:rounded-none print:border-none print:max-w-none print:w-full print:min-h-[297mm] print:my-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] text-white px-10 py-8">
          <div className="flex justify-between items-start">
            <div>
              {profile?.company_logo && (
                <img alt="Company Logo" className="max-h-20 max-w-[200px] mb-4 object-contain brightness-0 invert w-auto h-auto" src={profile.company_logo} />
              )}
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>{profile?.company_name || 'Your Company'}</h1>
              {profile?.email && <p className="text-sm text-blue-200">{profile.email}</p>}
              {profile?.phone && <p className="text-sm text-blue-200">{profile.phone}</p>}
              {profile?.company_address && (
                <p className="text-xs text-blue-200/80 mt-2 whitespace-pre-line">{profile.company_address}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold font-mono">{invoice.invoiceNumber}</p>
              <p className="text-sm text-blue-200 mt-1">{formatDate(invoice.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="p-10">
          {/* Client & dates */}
          <div className="flex justify-between mb-10 pb-8 border-b border-[#e2e8f0]">
            <div>
              <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-semibold mb-2">Bill To</p>
              <p className="text-lg font-bold text-[#1e293b]">{invoice.clientName}</p>
              <p className="text-sm text-[#64748b] whitespace-pre-line mt-1">{invoice.clientAddress || invoice.clientPhone}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-semibold mb-2">Due Date</p>
              <p className="text-sm font-mono">{formatDate(dueDate)}</p>
              <div className={`inline-block mt-2 px-3 py-1 rounded text-[11px] font-bold uppercase ${
                invoice.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
              }`}>{invoice.status}</div>
            </div>
          </div>

          {/* Grouped items with alternating colors */}
          {invoice.groups?.map((group, gIdx) => {
            const colors = ['#eef2ff', '#ecfdf5', '#fff7ed', '#fef2f2', '#f5f3ff'];
            const borderColors = ['#c7d2fe', '#a7f3d0', '#fed7aa', '#fecaca', '#ddd6fe'];
            const color = colors[gIdx % colors.length];
            const borderColor = borderColors[gIdx % borderColors.length];
            
            return (
              <div key={gIdx} className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: borderColor }}></div>
                  <h3 className="text-sm font-bold text-[#334155] uppercase tracking-wider">{group.name || `Category ${gIdx + 1}`}</h3>
                </div>
                <div className="rounded-lg overflow-hidden border" style={{ borderColor }}>
                  {group.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex justify-between items-center px-4 py-3 border-b last:border-b-0" style={{ backgroundColor: iIdx % 2 === 0 ? color : 'white', borderColor }}>
                      <div>
                        <p className="font-medium text-[#1e293b]">{item.name}</p>
                        <p className="text-xs text-[#94a3b8] font-mono mt-0.5">{item.quantity} × {formatMoney(item.unitPrice, sym)}</p>
                      </div>
                      <p className="font-mono font-semibold text-[#1e293b]">{formatMoney(item.quantity * item.unitPrice, sym)}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Totals */}
          <div className="flex justify-end mt-8">
            <div className="w-64">
              <div className="flex justify-between py-2 text-sm text-[#64748b] font-mono"><span>Subtotal</span><span>{formatMoney(subtotal, sym)}</span></div>
              <div className="flex justify-between py-2 text-sm text-[#64748b] font-mono"><span>Tax</span><span>{formatMoney(0, sym)}</span></div>
              <div className="flex justify-between py-3 mt-2 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] text-white px-4 rounded-lg font-bold font-mono text-lg">
                <span>Total</span><span>{formatMoney(subtotal, sym)}</span>
              </div>
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
