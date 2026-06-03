import React from 'react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal, getAllItems } from './templateUtils';

export function FintechA4Template({ invoice, profile, showGroups }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt);
  const subtotal = getSubtotal(invoice);
  const amountPaid = invoice.amountPaid || 0;
  const balanceDue = Math.max(0, subtotal - amountPaid);
  const items = getAllItems(invoice);

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 px-4 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]" style={{ fontFamily: 'Geist, sans-serif' }}>
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white text-[#1e293b] rounded-2xl border border-[#e2e8f0] shadow-xl overflow-hidden print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        {/* Gradient top */}
        <div className="h-1 bg-gradient-to-r from-[#22c55e] via-[#10b981] to-[#14b8a6]"></div>
        
        <div className="p-6 md:p-10 print:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start gap-6 mb-6">
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
            <div className="flex flex-col items-start sm:items-end print:items-end gap-3 text-left sm:text-right print:text-right w-full sm:w-auto print:w-auto">
              <div className="inline-block bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-2.5">
                <p className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold">Invoice</p>
                <p className="text-xl font-bold text-[#10b981] font-mono">{invoice.invoiceNumber}</p>
              </div>

              {/* Compact Client, Issued, Due Meta Card */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-left sm:text-right print:text-right space-y-2.5 w-full sm:w-64 print:w-64 shadow-sm">
                <div>
                  <p className="text-[9px] text-[#64748b] uppercase tracking-wider font-semibold mb-0.5">Client</p>
                  <p className="font-semibold text-[#0f172a] text-xs">{invoice.clientName}</p>
                  <p className="text-[10px] text-[#475569] leading-tight mt-0.5 whitespace-pre-line">{invoice.clientAddress || invoice.clientPhone}</p>
                </div>
                <div className="h-[1px] bg-[#e2e8f0]"></div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[9px] text-[#64748b] uppercase tracking-wider font-semibold">Issued</span>
                  <span className="font-mono text-[#0f172a] text-xs">{formatDate(invoice.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[9px] text-[#64748b] uppercase tracking-wider font-semibold">Due</span>
                  <span className="font-mono text-[#0f172a] text-xs font-semibold">{formatDate(dueDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status + Amount Card */}
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl py-3 px-4 mb-6 flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#15803d] uppercase tracking-wider font-semibold">Amount Due:</span>
              <span className="text-lg font-bold text-[#15803d] font-mono">{formatMoney(subtotal, sym)}</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-amber-100 text-amber-700 border border-amber-300'
            }`}>{invoice.status}</div>
          </div>

          {/* Items */}
          <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f1f5f9]">
                  <th className="text-left py-2 px-4 text-[10px] text-[#64748b] uppercase tracking-wider">Item</th>
                  <th className="text-right py-2 px-4 text-[10px] text-[#64748b] uppercase tracking-wider w-16">Qty</th>
                  <th className="text-right py-2 px-4 text-[10px] text-[#64748b] uppercase tracking-wider w-24">Rate</th>
                  <th className="text-right py-2 px-4 text-[10px] text-[#64748b] uppercase tracking-wider w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {showGroups && invoice.groups && invoice.groups.length > 0 ? (
                  invoice.groups.map((group, gIdx) => (
                    <React.Fragment key={gIdx}>
                      {group.name && (
                        <tr className="bg-slate-100 font-bold">
                          <td colSpan={4} className="py-1.5 px-4 text-xs text-[#0f172a] border-b border-[#e2e8f0] uppercase text-left font-semibold" style={{ fontFamily: 'Geist, sans-serif' }}>{group.name}</td>
                        </tr>
                      )}
                      {group.items.map((item, iIdx) => (
                        <tr key={iIdx} className="border-b border-[#e2e8f0] bg-white hover:bg-[#f1f5f9] transition-colors">
                          <td className="py-2 px-4 text-[#0f172a]" style={{ fontFamily: 'Geist, sans-serif' }}>{item.name}</td>
                          <td className="py-2 px-4 text-right text-[#475569]">{item.quantity}</td>
                          <td className="py-2 px-4 text-right text-[#475569]">{formatMoney(item.unitPrice, sym)}</td>
                          <td className="py-2 px-4 text-right text-[#16a34a] font-semibold">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx} className="border-b border-[#e2e8f0] bg-white hover:bg-[#f1f5f9] transition-colors">
                      <td className="py-2 px-4 text-[#0f172a]" style={{ fontFamily: 'Geist, sans-serif' }}>{item.name}</td>
                      <td className="py-2 px-4 text-right text-[#475569]">{item.quantity}</td>
                      <td className="py-2 px-4 text-right text-[#475569]">{formatMoney(item.unitPrice, sym)}</td>
                      <td className="py-2 px-4 text-right text-[#16a34a] font-semibold">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 print:w-64 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
              <div className="flex justify-between py-1 text-xs text-[#64748b] font-mono border-b border-[#e2e8f0]/60"><span>Subtotal</span><span>{formatMoney(subtotal, sym)}</span></div>
              <div className="flex justify-between py-1 text-xs text-[#64748b] font-mono border-b border-[#e2e8f0]/60"><span>Tax</span><span>{formatMoney(0, sym)}</span></div>
              <div className="flex justify-between py-2 mt-2 bg-[#10b981] text-white px-3 rounded-lg font-bold font-mono text-base">
                <span>Total</span><span>{formatMoney(subtotal, sym)}</span>
              </div>
              {amountPaid > 0 && (
                <>
                  <div className="flex justify-between py-2 text-sm text-gray-500 font-medium">
                    <span>Amount Paid</span>
                    <span>{formatMoney(amountPaid, sym)}</span>
                  </div>
                  <div className="flex justify-between py-3 mt-2 border-t-2 border-gray-800 text-lg font-bold text-gray-900">
                    <span>Balance Due</span>
                    <span>{formatMoney(balanceDue, sym)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bank details & Signature */}
          <div className="mt-12 pt-6 border-t border-[#e2e8f0] flex flex-col md:flex-row print:flex-row justify-between items-start gap-8 text-sm w-full">
            {((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-4 flex-1">
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
