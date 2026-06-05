import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TemplateProps, formatDate, formatMoney, getIssueDate, getDueDate, getSubtotal, getDiscountAmount, getShippingCost, getTotal, getAllItems } from './templateUtils';

export function PristineA4Template({ invoice, profile, showGroups, showGroupTotals, publicUrl }: TemplateProps) {
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
    <div className="bg-[#f0f4f8] min-h-screen py-4 px-2 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white shadow-lg print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-[#0058be] via-[#2170e4] to-[#0058be]"></div>
        
        <div className="p-6 md:p-10 print:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start gap-4 sm:gap-6 mb-6">
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
            <div className="text-left sm:text-right print:text-right w-full sm:w-auto print:w-auto">
              <p className="text-[12px] text-[#94a3b8] uppercase tracking-[0.15em] mb-1">Invoice</p>
              <p className="text-lg font-bold text-black" style={{ fontFamily: 'Geist, monospace' }}>{invoice.invoiceNumber}</p>
              {profile?.qr_code_enabled && publicUrl && (
                <div className="mt-3 flex justify-end sm:justify-start print:justify-end">
                  <QRCodeSVG value={publicUrl} size={54} />
                </div>
              )}
              <div className={`inline-block mt-3 px-3 py-1 rounded text-[11px] font-semibold uppercase ${
                invoice.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : invoice.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' : 'bg-amber-50 text-amber-700'
              }`}>{invoice.status}</div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-4 sm:gap-8 mb-6 pb-4 border-b border-[#e2e8f0]">
            <div>
              <p className="text-[11px] text-[#94a3b8] uppercase tracking-wider mb-2">Bill To</p>
              <p className="font-semibold text-black">{invoice.clientName}</p>
              <p className="text-sm text-[#64748b] whitespace-pre-line mt-1">{invoice.clientAddress || invoice.clientPhone}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#94a3b8] uppercase tracking-wider mb-2">Issue Date</p>
              <p className="text-sm font-medium" style={{ fontFamily: 'Geist, monospace' }}>{formatDate(issueDate)}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#94a3b8] uppercase tracking-wider mb-2">Due Date</p>
              <p className="text-sm font-medium" style={{ fontFamily: 'Geist, monospace' }}>{formatDate(dueDate)}</p>
            </div>
          </div>

          {/* Items */}
          <table className="w-full mb-4">
            <thead>
              <tr className="border-b-2 border-[#0058be]">
                <th className="text-left py-1.5 text-[11px] text-[#64748b] uppercase tracking-wider">Description</th>
                <th className="text-right py-1.5 text-[11px] text-[#64748b] uppercase tracking-wider w-20">Qty</th>
                <th className="text-right py-1.5 text-[11px] text-[#64748b] uppercase tracking-wider w-28">Rate</th>
                <th className="text-right py-1.5 text-[11px] text-[#64748b] uppercase tracking-wider w-28">Amount</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: 'Geist, monospace' }}>
              {showGroups && invoice.groups && invoice.groups.length > 0 ? (
                invoice.groups.map((group, gIdx) => (
                  <React.Fragment key={gIdx}>
                    {group.name && (
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan={4} className="py-1.5 px-3 text-xs text-black border-b border-[#f1f5f9] uppercase text-left font-semibold" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>{group.name}</td>
                      </tr>
                    )}
                    {group.items.map((item, iIdx) => (
                      <tr key={iIdx} className="border-b border-[#f1f5f9]">
                        <td className="py-1.5 font-medium text-black" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>{item.name}</td>
                        <td className="py-1.5 text-right text-sm text-[#64748b]">{item.quantity}</td>
                        <td className="py-1.5 text-right text-sm text-[#64748b]">{formatMoney(item.unitPrice, sym)}</td>
                        <td className="py-1.5 text-right text-sm font-medium text-black">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                      </tr>
                    ))}

                  {showGroupTotals && (
                    <tr className="bg-transparent">
                      <td colSpan={3} className="py-0.5 px-3 text-[9px] font-medium text-slate-400 uppercase text-right tracking-wide">Group Subtotal</td>
                      <td className="py-0.5 px-3 text-right text-[10px] font-medium text-slate-500" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(group.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), sym)}</td>
                    </tr>
                  )}
                  </React.Fragment>
                ))
              ) : (
                items.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#f1f5f9]">
                    <td className="py-1.5 font-medium text-black" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>{item.name}</td>
                    <td className="py-1.5 text-right text-sm text-[#64748b]">{item.quantity}</td>
                    <td className="py-1.5 text-right text-sm text-[#64748b]">{formatMoney(item.unitPrice, sym)}</td>
                    <td className="py-1.5 text-right text-sm font-medium text-black">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 print:w-64">
              <div className="flex justify-between py-2 text-sm text-[#64748b]" style={{ fontFamily: 'Geist, monospace' }}>
                <span>Subtotal</span><span>{formatMoney(subtotal, sym)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between py-2 text-sm text-[#64748b]" style={{ fontFamily: 'Geist, monospace' }}>
                <span>Discount {invoice.discount_type === 'percentage' ? `(${invoice.discount_value}%)` : ''}</span><span>-{formatMoney(discountAmount, sym)}</span>
              </div>
              )}
              <div className="flex justify-between py-2 text-sm text-[#64748b]" style={{ fontFamily: 'Geist, monospace' }}>
                <span>Tax</span><span>{formatMoney(0, sym)}</span>
              </div>
              {shippingCost > 0 && (
                <div className="flex justify-between py-2 text-sm text-[#64748b]" style={{ fontFamily: 'Geist, monospace' }}>
                <span>Shipping</span><span>+{formatMoney(shippingCost, sym)}</span>
              </div>
              )}
            
              <div className="flex justify-between py-3 mt-2 border-t-2 border-[#0058be] text-lg font-bold text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                <span>Total</span><span>{formatMoney(total, sym)}</span>
              </div>
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
          <div className="mt-8 pt-4 border-t border-[#e2e8f0] flex flex-col md:flex-row print:flex-row justify-between items-start gap-4 w-full">
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

            <div className="flex flex-row items-end gap-6 justify-start md:justify-end print:justify-end w-auto shrink-0">
                    
                    {((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name)) && (
              <div className="flex flex-col items-start md:items-end print:items-end min-w-[200px]">
                {(invoice.signature_url || profile?.signature_url) && (
                  <img src={invoice.signature_url || profile?.signature_url || undefined} alt="Signature" className="h-10 mb-2 object-contain" />
                )}
                <div className="w-full border-b border-[#e2e8f0] mb-1"></div>
                <p className="text-xs text-[#76777d]">{invoice.signatory_name || profile?.signatory_name || 'Authorized Signatory'}</p>
              </div>
            )}
                  </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
