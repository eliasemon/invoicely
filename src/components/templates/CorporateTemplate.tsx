import React from 'react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal, getAllItems } from './templateUtils';

export function CorporateTemplate({ invoice, profile, isPreview, showGroups }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt);
  const subtotal = getSubtotal(invoice);
  const amountPaid = invoice.amountPaid || 0;
  const balanceDue = Math.max(0, subtotal - amountPaid);
  const items = getAllItems(invoice);

  return (
    <div className="bg-[#f8f9ff] min-h-screen text-[#0b1c30] pb-20 md:pb-0 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
      <div className="flex justify-center items-start p-4 md:p-8 print:p-0 print:m-0 print:block print:w-[210mm]">
        <div className="w-full max-w-[210mm] min-h-[297mm] mx-auto print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm]">
          {/* Action Bar */}
          {!isPreview && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-[#c6c6cd] shadow-sm mb-6 print:hidden">
              <div>
                <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>Invoice #{invoice.invoiceNumber}</h2>
                <p className="text-xs text-[#45464d]">Viewing Corporate Template</p>
              </div>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[#0058be] text-white rounded-lg text-xs font-semibold shadow-md">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download PDF
              </button>
            </div>
          )}

          {/* Invoice Document */}
          <article className="bg-white w-full shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#c6c6cd] overflow-hidden print:shadow-none print:rounded-none print:border-none">
            <div className="h-2 w-full bg-[#0058be]"></div>
            <div className="p-6 md:p-10 print:p-6">
              {/* Header */}
              <div className="border-2 border-[#c6c6cd] p-4 mb-4 flex flex-col gap-3 relative">
                <div className={`absolute -top-3 -right-3 px-4 py-1 rounded text-[12px] font-bold uppercase flex items-center gap-1 shadow-sm ${
                  invoice.status === 'PAID' ? 'bg-[#e8f5e9] border border-[#a5d6a7] text-[#2e7d32]' : 'bg-[#fff3e0] border border-[#ffcc80] text-[#e65100]'
                }`}>
                  {invoice.status}
                </div>
                
                {/* Row 1: Logo and Title */}
                <div className="flex flex-col md:flex-row print:flex-row justify-between items-start md:items-center print:items-center gap-4 w-full">
                  <div>
                    {profile?.company_logo ? (
                      <img alt="Logo" className="max-h-24 max-w-[220px] object-contain w-auto h-auto" src={profile.company_logo} />
                    ) : (
                      <div className="text-[12px] text-[#45464d] uppercase tracking-widest font-bold mb-1">From</div>
                    )}
                  </div>
                  <h1 className="text-[40px] leading-tight font-bold text-black uppercase" style={{ fontFamily: 'Work Sans, sans-serif', letterSpacing: '-0.02em' }}>Invoice</h1>
                </div>

                {/* Divider Line */}
                <div className="h-[1px] bg-[#c6c6cd] w-full"></div>

                {/* Row 2: Details Columns */}
                <div className="flex flex-col md:flex-row print:flex-row justify-between items-start gap-6 w-full">
                  {/* Left Column: From */}
                  <div className="flex flex-col gap-1">
                    {profile?.company_logo && (
                      <div className="text-[12px] text-[#45464d] uppercase tracking-widest font-bold mb-1">From</div>
                    )}
                    <div className="font-bold text-black">{profile?.company_name || 'Your Company'}</div>
                    <div className="text-sm text-[#45464d] whitespace-pre-line" style={{ fontFamily: 'Geist, monospace' }}>
                      {profile?.company_address || ''}{profile?.email ? `\n${profile.email}` : ''}{profile?.phone ? `\n${profile.phone}` : ''}
                    </div>
                  </div>
                  
                  {/* Right Column: Invoice Meta */}
                  <div className="flex flex-col gap-1 md:text-right print:text-right w-full md:w-auto print:w-auto">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-left md:text-right print:text-right">
                      <div className="text-[12px] text-[#45464d] uppercase font-bold">Invoice Number:</div>
                      <div className="text-sm font-semibold text-black" style={{ fontFamily: 'Geist, monospace' }}>{invoice.invoiceNumber}</div>
                      <div className="text-[12px] text-[#45464d] uppercase font-bold">Date Issued:</div>
                      <div className="text-sm text-black" style={{ fontFamily: 'Geist, monospace' }}>{formatDate(invoice.createdAt)}</div>
                      <div className="text-[12px] text-[#45464d] uppercase font-bold">Date Due:</div>
                      <div className="text-sm text-black" style={{ fontFamily: 'Geist, monospace' }}>{formatDate(dueDate)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-5 p-4 bg-[#eff4ff] border border-[#c6c6cd] flex flex-col md:flex-row print:flex-row justify-between gap-4">
                <div>
                  <div className="text-[12px] text-[#45464d] uppercase tracking-widest font-bold mb-2 border-b border-[#c6c6cd] pb-2 inline-block">Bill To</div>
                  <div className="font-bold text-black mt-2">{invoice.clientName}</div>
                  <div className="text-sm text-[#45464d] mt-1 whitespace-pre-line" style={{ fontFamily: 'Geist, monospace' }}>{invoice.clientAddress || invoice.clientPhone}</div>
                </div>
                <div className="flex-shrink-0">
                  <div className="text-[12px] text-[#45464d] uppercase tracking-widest font-bold mb-2 border-b border-[#c6c6cd] pb-2 inline-block">Amount Due</div>
                  <div className="text-[32px] leading-tight font-bold text-[#0058be] mt-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>{formatMoney(subtotal, sym)}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-[#c6c6cd] mb-4 overflow-x-auto rounded-sm">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-[#f1f5f9] border-b border-[#c6c6cd]">
                      <th className="py-1.5 px-4 text-[12px] font-bold text-[#45464d] uppercase tracking-wider border-r border-[#c6c6cd] w-12 text-center">#</th>
                      <th className="py-1.5 px-4 text-[12px] font-bold text-[#45464d] uppercase tracking-wider border-r border-[#c6c6cd]">Description</th>
                      <th className="py-1.5 px-4 text-[12px] font-bold text-[#45464d] uppercase tracking-wider border-r border-[#c6c6cd] text-right w-24">Qty</th>
                      <th className="py-1.5 px-4 text-[12px] font-bold text-[#45464d] uppercase tracking-wider border-r border-[#c6c6cd] text-right w-32">Rate</th>
                      <th className="py-1.5 px-4 text-[12px] font-bold text-[#45464d] uppercase tracking-wider text-right w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontFamily: 'Geist, monospace' }}>
                    {showGroups && invoice.groups && invoice.groups.length > 0 ? (
                      invoice.groups.map((group, gIdx) => (
                        <React.Fragment key={gIdx}>
                          {group.name && (
                            <tr className="bg-[#f1f5f9] font-bold">
                              <td colSpan={5} className="py-2 px-4 text-xs text-black border-b border-[#c6c6cd] uppercase text-left">{group.name}</td>
                            </tr>
                          )}
                          {group.items.map((item, iIdx) => (
                            <tr key={iIdx} className="border-b border-[#c6c6cd]">
                              <td className="py-1.5 px-4 border-r border-[#c6c6cd] text-center text-[#45464d]">{iIdx + 1}</td>
                              <td className="py-1.5 px-4 border-r border-[#c6c6cd]"><div className="font-bold">{item.name}</div></td>
                              <td className="py-1.5 px-4 border-r border-[#c6c6cd] text-right">{item.quantity}</td>
                              <td className="py-1.5 px-4 border-r border-[#c6c6cd] text-right">{formatMoney(item.unitPrice, sym)}</td>
                              <td className="py-1.5 px-4 text-right font-semibold">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))
                    ) : (
                      items.map((item, idx) => (
                        <tr key={idx} className={`border-b border-[#c6c6cd] ${idx % 2 === 1 ? 'bg-[#f8fafc]' : ''}`}>
                          <td className="py-1.5 px-4 border-r border-[#c6c6cd] text-center text-[#45464d]">{idx + 1}</td>
                          <td className="py-1.5 px-4 border-r border-[#c6c6cd]"><div className="font-bold">{item.name}</div></td>
                          <td className="py-1.5 px-4 border-r border-[#c6c6cd] text-right">{item.quantity}</td>
                          <td className="py-1.5 px-4 border-r border-[#c6c6cd] text-right">{formatMoney(item.unitPrice, sym)}</td>
                          <td className="py-1.5 px-4 text-right font-semibold">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-full md:w-1/3">
                  <div className="flex justify-between py-2 border-b border-dotted border-[#c6c6cd]">
                    <span className="text-[12px] font-bold text-[#45464d] uppercase">Subtotal</span>
                    <span className="text-sm" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(subtotal, sym)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dotted border-[#c6c6cd]">
                    <span className="text-[12px] font-bold text-[#45464d] uppercase">Tax (0%)</span>
                    <span className="text-sm" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(0, sym)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b-2 border-black mt-2">
                    <span className="font-bold text-black uppercase">Total</span>
                    <span className="text-xl font-bold text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>{formatMoney(subtotal, sym)}</span>
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

              {/* Bank Details & Signature Section */}
              {(((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ||
                ((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name))) && (
                <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 mb-6 border-t border-[#c6c6cd] pt-4">
                  {/* Bank Details */}
                  {((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ? (
                    <div>
                      <h4 className="text-[12px] font-bold text-black uppercase tracking-wider mb-2">Bank Details</h4>
                      <div className="text-sm text-[#45464d] space-y-1">
                        <p><span className="font-semibold text-black">Bank:</span> {invoice.bank_name || profile?.bank_name}</p>
                        {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                          <p><span className="font-semibold text-black">Holder:</span> {invoice.bank_account_holder || profile?.bank_account_holder}</p>
                        )}
                        {(invoice.bank_account_number || profile?.bank_account_number) && (
                          <p><span className="font-semibold text-black">Account:</span> {invoice.bank_account_number || profile?.bank_account_number}</p>
                        )}
                        {(invoice.bank_swift || profile?.bank_swift) && (
                          <p><span className="font-semibold text-black">SWIFT/BIC:</span> {invoice.bank_swift || profile?.bank_swift}</p>
                        )}
                      </div>
                    </div>
                  ) : <div></div>}

                  {/* Signature */}
                  {((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name)) && (
                    <div className="flex flex-col items-start md:items-end print:items-end">
                      {(invoice.signature_url || profile?.signature_url) && (
                        <img src={invoice.signature_url || profile?.signature_url || undefined} alt="Signature" className="h-10 mb-2 object-contain" />
                      )}
                      <div className="w-40 border-b border-[#c6c6cd] mb-1"></div>
                      <p className="text-xs text-[#76777d]">{invoice.signatory_name || profile?.signatory_name || 'Authorized Signatory'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="border-t-2 border-[#c6c6cd] pt-3 text-left">
                <div className="text-[11px] text-[#45464d] max-w-[500px]" style={{ fontFamily: 'Geist, monospace' }}>
                  <strong>Terms &amp; Conditions:</strong> All payments are final. Late payments may be subject to a 1.5% monthly fee.
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
