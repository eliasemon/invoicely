import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal, getAllItems } from './templateUtils';

export function EnterpriseA4Template({ invoice, profile, showGroups , publicUrl }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt);
  const subtotal = getSubtotal(invoice);
  const amountPaid = invoice.amountPaid || 0;
  const balanceDue = Math.max(0, subtotal - amountPaid);
  const items = getAllItems(invoice);

  return (
    <div className="bg-[#f1f5f9] min-h-screen py-8 px-4 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]" style={{ fontFamily: 'Geist, sans-serif' }}>
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white shadow-sm border border-[#e2e8f0] print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        {/* Top bar */}
        <div className="flex">
          <div className="w-2 bg-[#1e40af]"></div>
          <div className="flex-1 p-6 md:p-10 print:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start gap-4 sm:gap-6 mb-6 pb-4 border-b border-[#e2e8f0]">
              <div>
                {profile?.company_logo && <img src={profile.company_logo} alt="Logo" className="max-h-16 max-w-[200px] mb-4 object-contain w-auto h-auto" />}
                <h1 className="text-lg font-bold text-[#1e293b] uppercase tracking-wider">{profile?.company_name || 'Your Company'}</h1>
                <p className="text-xs text-[#64748b] mt-1 whitespace-pre-line">{profile?.company_address || ''}</p>
                {(profile?.email || profile?.phone) && (
                  <p className="text-xs text-[#64748b]">
                    {profile.email}{profile.email && profile.phone ? ' • ' : ''}{profile.phone}
                  </p>
                )}
              </div>
              <div className="text-left sm:text-right print:text-right w-full sm:w-auto print:w-auto">
                <h2 className="text-xs text-[#94a3b8] uppercase tracking-[0.2em] mb-1">Tax Invoice</h2>
                <p className="text-2xl font-bold text-[#1e40af] font-mono">{invoice.invoiceNumber}</p>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 print:grid-cols-4 gap-4 sm:gap-6 mb-6 text-sm">
              <div><p className="text-[10px] text-[#94a3b8] uppercase font-semibold mb-1">Invoice To</p><p className="font-semibold text-[#1e293b]">{invoice.clientName}</p><p className="text-xs text-[#64748b] mt-1 whitespace-pre-line">{invoice.clientAddress || invoice.clientPhone}</p></div>
              <div><p className="text-[10px] text-[#94a3b8] uppercase font-semibold mb-1">Issue Date</p><p className="font-mono">{formatDate(invoice.createdAt)}</p></div>
              <div><p className="text-[10px] text-[#94a3b8] uppercase font-semibold mb-1">Due Date</p><p className="font-mono">{formatDate(dueDate)}</p></div>
              <div><p className="text-[10px] text-[#94a3b8] uppercase font-semibold mb-1">Status</p><span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${invoice.status === 'PAID' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{invoice.status}</span></div>
            </div>

            {/* Items */}
            <table className="w-full mb-4 text-sm">
              <thead>
                <tr className="bg-[#1e40af] text-white">
                  <th className="text-left py-1.5 px-4 text-[10px] uppercase tracking-wider font-semibold">Description</th>
                  <th className="text-right py-1.5 px-4 text-[10px] uppercase tracking-wider font-semibold w-20">Qty</th>
                  <th className="text-right py-1.5 px-4 text-[10px] uppercase tracking-wider font-semibold w-28">Unit Price</th>
                  <th className="text-right py-1.5 px-4 text-[10px] uppercase tracking-wider font-semibold w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {showGroups && invoice.groups && invoice.groups.length > 0 ? (
                  invoice.groups.map((group, gIdx) => (
                    <React.Fragment key={gIdx}>
                      {group.name && (
                        <tr className="bg-slate-100 font-bold">
                          <td colSpan={4} className="py-1.5 px-4 text-xs text-[#1e293b] border-b border-[#e2e8f0] uppercase text-left font-semibold" style={{ fontFamily: 'Geist, sans-serif' }}>{group.name}</td>
                        </tr>
                      )}
                      {group.items.map((item, iIdx) => (
                        <tr key={iIdx} className={`border-b border-[#f1f5f9] ${iIdx % 2 === 1 ? 'bg-[#f8fafc]' : ''}`}>
                          <td className="py-1.5 px-4 text-[#1e293b]" style={{ fontFamily: 'Geist, sans-serif' }}>{item.name}</td>
                          <td className="py-1.5 px-4 text-right text-[#64748b]">{item.quantity}</td>
                          <td className="py-1.5 px-4 text-right text-[#64748b]">{formatMoney(item.unitPrice, sym)}</td>
                          <td className="py-1.5 px-4 text-right font-semibold text-[#1e293b]">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx} className={`border-b border-[#f1f5f9] ${idx % 2 === 1 ? 'bg-[#f8fafc]' : ''}`}>
                      <td className="py-1.5 px-4 text-[#1e293b]" style={{ fontFamily: 'Geist, sans-serif' }}>{item.name}</td>
                      <td className="py-1.5 px-4 text-right text-[#64748b]">{item.quantity}</td>
                      <td className="py-1.5 px-4 text-right text-[#64748b]">{formatMoney(item.unitPrice, sym)}</td>
                      <td className="py-1.5 px-4 text-right font-semibold text-[#1e293b]">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-64 print:w-64">
                <div className="flex justify-between py-2 text-sm text-[#64748b] font-mono border-b border-[#f1f5f9]"><span>Subtotal</span><span>{formatMoney(subtotal, sym)}</span></div>
                <div className="flex justify-between py-2 text-sm text-[#64748b] font-mono border-b border-[#f1f5f9]"><span>Tax (0%)</span><span>{formatMoney(0, sym)}</span></div>
                <div className="flex justify-between py-3 mt-1 text-lg font-bold text-[#1e40af] font-mono bg-[#eff6ff] px-3 rounded"><span>Total Due</span><span>{formatMoney(subtotal, sym)}</span></div>
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

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-[#e2e8f0] text-xs text-[#94a3b8]">
              <p>Payment terms: Net 30. Please reference invoice number {invoice.invoiceNumber} with your payment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
