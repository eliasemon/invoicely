import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TemplateProps, formatDate, formatMoney, getIssueDate, getDueDate, getSubtotal, getDiscountAmount, getShippingCost, getTotal, getAllItems } from './templateUtils';

export function HighDensityFlatA4Template({ invoice, profile, showGroups, showGroupTotals, publicUrl }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const issueDate = getIssueDate(invoice);
  const dueDate = getDueDate(invoice);
  const subtotal = getSubtotal(invoice);
  const discountAmount = getDiscountAmount(invoice, subtotal);
  const shippingCost = getShippingCost(invoice);
  const total = getTotal(invoice);
  const amountPaid = invoice.amountPaid || 0;
  const balanceDue = Math.max(0, total - amountPaid);
  const items = getAllItems(invoice);

  return (
    <div className="bg-[#f1f5f9] min-h-screen py-8 px-4 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]" style={{ fontFamily: 'Geist, sans-serif' }}>
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white shadow-md print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        {/* Dense header bar */}
        <div className="bg-[#0f172a] text-white px-6 py-4 flex flex-col sm:flex-row print:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            {profile?.company_logo && <img src={profile.company_logo} alt="Logo" className="max-h-16 max-w-[200px] brightness-0 invert object-contain w-auto h-auto" />}
            <span className="text-sm font-bold">{profile?.company_name || 'Your Company'}</span>
          </div>
          <div className="text-center sm:text-right print:text-right w-full sm:w-auto print:w-auto">
            <span className="text-sm font-bold font-mono">{invoice.invoiceNumber}</span>
            {profile?.qr_code_enabled && publicUrl && (
              <div className="mt-4 flex justify-center sm:justify-end print:justify-end">
                <QRCodeSVG value={publicUrl} size={54} />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:p-6 print:p-6">
          {/* Company details */}
          {(profile?.company_address || profile?.email || profile?.phone) && (
            <div className="mb-2 text-xs text-[#64748b] flex flex-wrap gap-x-6 gap-y-1 pb-3 border-b border-[#f1f5f9]">
              {profile?.company_address && <div className="whitespace-pre-line"><strong>Address:</strong> {profile.company_address}</div>}
              {profile?.email && <div><strong>Email:</strong> {profile.email}</div>}
              {profile?.phone && <div><strong>Phone:</strong> {profile.phone}</div>}
            </div>
          )}

          {/* Dense info strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 print:grid-cols-4 gap-3 sm:gap-2 mb-2 bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] text-sm">
            <div>
              <p className="text-[10px] text-[#94a3b8] uppercase font-semibold">Client</p>
              <p className="font-semibold text-[#0f172a]">{invoice.clientName}</p>
              <p className="text-[11px] text-[#64748b] whitespace-pre-line">{invoice.clientAddress || invoice.clientPhone}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#94a3b8] uppercase font-semibold">Issue Date</p>
              <p className="font-mono text-[#0f172a]">{formatDate(issueDate)}</p>
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
          <table className="w-full mb-2 text-xs">
            <thead>
              <tr className="bg-[#f8fafc]">
                <th className="text-left py-0.5 px-2 text-[10px] text-[#94a3b8] uppercase font-semibold border-b border-[#e2e8f0]">#</th>
                <th className="text-left py-0.5 px-2 text-[10px] text-[#94a3b8] uppercase font-semibold border-b border-[#e2e8f0]">Description</th>
                <th className="text-right py-0.5 px-2 text-[10px] text-[#94a3b8] uppercase font-semibold border-b border-[#e2e8f0] w-16">Qty</th>
                <th className="text-right py-0.5 px-2 text-[10px] text-[#94a3b8] uppercase font-semibold border-b border-[#e2e8f0] w-24">Rate</th>
                <th className="text-right py-0.5 px-2 text-[10px] text-[#94a3b8] uppercase font-semibold border-b border-[#e2e8f0] w-24">Amount</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {showGroups && invoice.groups && invoice.groups.length > 0 ? (
                invoice.groups.map((group, gIdx) => (
                  <React.Fragment key={gIdx}>
                    {group.name && (
                      <tr className="bg-slate-100 font-bold">
                        <td className="py-0.5 px-2 text-[10px] text-[#0f172a] border-b border-[#e2e8f0] uppercase text-left font-semibold" style={{ fontFamily: 'Geist, sans-serif' }}>{group.name}</td>
                      </tr>
                    )}
                    {group.items.map((item, iIdx) => (
                      <tr key={iIdx} className={`border-b border-[#f1f5f9] ${iIdx % 2 === 0 ? '' : 'bg-[#fafbfc]'}`}>
                        <td className="py-0.5 px-2 text-[#94a3b8]">{iIdx + 1}</td>
                        <td className="py-0.5 px-2 text-[#0f172a]" style={{ fontFamily: 'Geist, sans-serif' }}>{item.name}</td>
                        <td className="py-0.5 px-2 text-right text-[#64748b]">{item.quantity}</td>
                        <td className="py-0.5 px-2 text-right text-[#64748b]">{formatMoney(item.unitPrice, sym)}</td>
                        <td className="py-0.5 px-2 text-right font-semibold text-[#0f172a]">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                      </tr>
                    ))}

                  {showGroupTotals && (
                    <tr className="bg-transparent">
                      <td className="py-0.5 px-2 text-[9px] font-medium text-slate-400 uppercase text-right tracking-wide">Group Subtotal</td>
                      <td className="py-0.5 px-2 text-right text-[10px] font-medium text-slate-500" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(group.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), sym)}</td>
                    </tr>
                  )}
                  </React.Fragment>
                ))
              ) : (
                items.map((item, idx) => (
                  <tr key={idx} className={`border-b border-[#f1f5f9] ${idx % 2 === 0 ? '' : 'bg-[#fafbfc]'}`}>
                    <td className="py-0.5 px-2 text-[#94a3b8]">{idx + 1}</td>
                    <td className="py-0.5 px-2 text-[#0f172a]" style={{ fontFamily: 'Geist, sans-serif' }}>{item.name}</td>
                    <td className="py-0.5 px-2 text-right text-[#64748b]">{item.quantity}</td>
                    <td className="py-0.5 px-2 text-right text-[#64748b]">{formatMoney(item.unitPrice, sym)}</td>
                    <td className="py-0.5 px-2 text-right font-semibold text-[#0f172a]">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-56 print:w-56">
              <div className="flex justify-between py-1.5 text-sm text-[#64748b] font-mono border-b border-[#f1f5f9]"><span>Subtotal</span><span>{formatMoney(subtotal, sym)}</span></div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between py-1.5 text-sm text-[#64748b] font-mono border-b border-[#f1f5f9]"><span>Discount {invoice.discount_type === 'percentage' ? `(${invoice.discount_value}%)` : ''}</span><span>-{formatMoney(discountAmount, sym)}</span></div>
              )}
              <div className="flex justify-between py-1.5 text-sm text-[#64748b] font-mono border-b border-[#f1f5f9]"><span>Tax</span><span>{formatMoney(0, sym)}</span></div>
              {shippingCost > 0 && (
                <div className="flex justify-between py-1.5 text-sm text-[#64748b] font-mono border-b border-[#f1f5f9]"><span>Shipping</span><span>+{formatMoney(shippingCost, sym)}</span></div>
              )}
            
              <div className="flex justify-between py-2 mt-1 bg-[#0f172a] text-white px-3 rounded font-bold font-mono"><span>Total</span><span>{formatMoney(total, sym)}</span></div>
              {amountPaid > 0 && (
                <>
                  <div className="flex justify-between py-2 text-sm text-gray-500 font-medium">
                    <span>Paid</span>
                    <span>{formatMoney(amountPaid, sym)}</span>
                  </div>
                  <div className="flex justify-between py-3 mt-2 border-t-2 border-gray-800 text-sm font-bold text-gray-900">
                    <span>Due</span>
                    <span>{formatMoney(balanceDue, sym)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bank details & Signature */}
          <div className="mt-3 pt-4 border-t border-[#e2e8f0] flex flex-col md:flex-row print:flex-row justify-between items-start gap-2 text-sm w-full">
            {((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-2 flex-1">
                <div><p className="text-[10px] text-[#94a3b8] uppercase font-semibold">Bank</p><p className="text-[#0f172a]">{invoice.bank_name || profile?.bank_name}</p></div>
                <div><p className="text-[10px] text-[#94a3b8] uppercase font-semibold">Account</p><p className="font-mono text-[#0f172a]">{invoice.bank_account_number || profile?.bank_account_number}</p></div>
                <div><p className="text-[10px] text-[#94a3b8] uppercase font-semibold">Holder</p><p className="text-[#0f172a]">{invoice.bank_account_holder || profile?.bank_account_holder}</p></div>
                {(invoice.bank_swift || profile?.bank_swift) && <div><p className="text-[10px] text-[#94a3b8] uppercase font-semibold">SWIFT</p><p className="font-mono text-[#0f172a]">{invoice.bank_swift || profile?.bank_swift}</p></div>}
              </div>
            ) : <div className="flex-1"></div>}

            <div className="flex flex-row items-end gap-3 justify-start md:justify-end print:justify-end w-auto shrink-0">
                    
                    {((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name)) && (
              <div className="flex flex-col items-start md:items-end print:items-end min-w-[160px]">
                {(invoice.signature_url || profile?.signature_url) && (
                  <img src={invoice.signature_url || profile?.signature_url || undefined} alt="Signature" className="h-8 mb-1 object-contain" />
                )}
                <div className="w-full border-b border-[#e2e8f0] mb-1"></div>
                <p className="text-[10px] text-[#64748b] font-semibold">{invoice.signatory_name || profile?.signatory_name || 'Authorized Signatory'}</p>
              </div>
            )}
                  </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
