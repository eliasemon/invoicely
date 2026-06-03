import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal, getAllItems } from './templateUtils';

export function MinimalistWithQrCodeTemplate({ invoice, profile, isPreview, showGroups , publicUrl }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt);
  const subtotal = getSubtotal(invoice);
  const amountPaid = invoice.amountPaid || 0;
  const balanceDue = Math.max(0, subtotal - amountPaid);
  const items = getAllItems(invoice);

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-[#2d3748] py-8 px-4 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <main className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-md rounded-lg p-6 md:p-8 print:p-6 relative print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        {/* Header */}
        <header className="flex flex-col md:flex-row print:flex-row justify-between items-start md:items-center print:items-center gap-8 mb-6">
          <div>
            {profile?.company_logo && (
              <img alt="Logo" className="max-h-20 max-w-[220px] mb-6 object-contain w-auto h-auto" src={profile.company_logo} />
            )}
            <div className="text-[#45464d] text-sm space-y-1" style={{ fontFamily: 'Geist, monospace' }}>
              <p className="font-semibold text-black">{profile?.company_name || 'Your Company'}</p>
              {profile?.company_address && <p className="whitespace-pre-line">{profile.company_address}</p>}
              {(profile?.email || profile?.phone) && (
                <p className="text-xs text-[#565e74] mt-1">
                  {profile.email}{profile.email && profile.phone ? ' • ' : ''}{profile.phone}
                </p>
              )}
            </div>
          </div>
          <div className="text-left md:text-right print:text-right w-full md:w-auto print:w-auto">
            <h1 className="text-[40px] leading-[48px] font-bold text-black mb-2" style={{ fontFamily: 'Work Sans, sans-serif', letterSpacing: '-0.02em' }}>Invoice</h1>
            <p className="text-sm text-[#45464d] mb-6" style={{ fontFamily: 'Geist, monospace' }}>{invoice.invoiceNumber}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e2e8f0] text-[12px] bg-[#f1f5f9]">
              <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
              {invoice.status}
            </div>
          </div>
        </header>

        {/* Meta */}
        <section className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-[12px] text-[#45464d] mb-4 uppercase tracking-widest">Billed To</h2>
            <p className="text-lg font-semibold text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>{invoice.clientName}</p>
            <p className="whitespace-pre-line mt-1">{invoice.clientAddress || ''}</p>
            {invoice.clientPhone && <p className="pt-2 text-[#45464d] text-sm" style={{ fontFamily: 'Geist, monospace' }}>{invoice.clientPhone}</p>}
          </div>
          <div className="grid grid-cols-2 gap-8 text-left md:text-right print:text-right">
            <div>
              <h2 className="text-[12px] text-[#45464d] mb-2 uppercase tracking-widest">Issue Date</h2>
              <p className="text-sm" style={{ fontFamily: 'Geist, monospace' }}>{formatDate(invoice.createdAt)}</p>
            </div>
            <div>
              <h2 className="text-[12px] text-[#45464d] mb-2 uppercase tracking-widest">Due Date</h2>
              <p className="text-sm" style={{ fontFamily: 'Geist, monospace' }}>{formatDate(dueDate)}</p>
            </div>
          </div>
        </section>

        {/* Line Items */}
        <section className="mb-6">
          <div className="hidden md:grid print:grid grid-cols-12 gap-4 pb-2 border-b border-[#e2e8f0] text-[#45464d] text-[12px] lowercase">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>
          <div className="flex flex-col gap-3 py-3 border-b border-[#f1f5f9]">
            {showGroups && invoice.groups && invoice.groups.length > 0 ? (
              invoice.groups.map((group, gIdx) => (
                <div key={gIdx} className="mb-4 last:mb-0 w-full text-left">
                  {group.name && (
                    <div className="text-[10px] font-bold tracking-wider text-black border-b border-[#e2e8f0] pb-1 mb-2 uppercase">
                      {group.name}
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    {group.items.map((item, iIdx) => (
                      <div key={iIdx} className="grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 gap-4 items-start md:items-center print:items-center">
                        <div className="col-span-1 md:col-span-6 print:col-span-6">
                          <p className="font-medium">{item.name}</p>
                        </div>
                        <div className="col-span-1 md:col-span-2 print:col-span-2 md:text-right print:text-right text-sm text-[#45464d]" style={{ fontFamily: 'Geist, monospace' }}>
                          <span className="md:hidden print:hidden">Qty: </span>{item.quantity}
                        </div>
                        <div className="col-span-1 md:col-span-2 print:col-span-2 md:text-right print:text-right text-sm text-[#45464d]" style={{ fontFamily: 'Geist, monospace' }}>
                          <span className="md:hidden print:hidden">Rate: </span>{formatMoney(item.unitPrice, sym)}
                        </div>
                        <div className="col-span-1 md:col-span-2 print:col-span-2 text-right text-sm" style={{ fontFamily: 'Geist, monospace' }}>
                          {formatMoney(item.quantity * item.unitPrice, sym)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 gap-4 items-start md:items-center print:items-center">
                  <div className="col-span-1 md:col-span-6 print:col-span-6">
                    <p className="font-medium">{item.name}</p>
                  </div>
                  <div className="col-span-1 md:col-span-2 print:col-span-2 md:text-right print:text-right text-sm text-[#45464d]" style={{ fontFamily: 'Geist, monospace' }}>
                    <span className="md:hidden print:hidden">Qty: </span>{item.quantity}
                  </div>
                  <div className="col-span-1 md:col-span-2 print:col-span-2 md:text-right print:text-right text-sm text-[#45464d]" style={{ fontFamily: 'Geist, monospace' }}>
                    <span className="md:hidden print:hidden">Rate: </span>{formatMoney(item.unitPrice, sym)}
                  </div>
                  <div className="col-span-1 md:col-span-2 print:col-span-2 text-right text-sm" style={{ fontFamily: 'Geist, monospace' }}>
                    {formatMoney(item.quantity * item.unitPrice, sym)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end gap-2 py-4">
            <div className="w-full md:w-1/2 print:w-1/2 flex justify-between text-sm text-[#45464d]" style={{ fontFamily: 'Geist, monospace' }}>
              <span>Subtotal</span>
              <span>{formatMoney(subtotal, sym)}</span>
            </div>
            <div className="w-full md:w-1/2 print:w-1/2 flex justify-between text-sm text-[#45464d]" style={{ fontFamily: 'Geist, monospace' }}>
              <span>Tax (0%)</span>
              <span>{formatMoney(0, sym)}</span>
            </div>
            <div className="w-full md:w-1/2 print:w-1/2 flex justify-between text-2xl font-semibold text-black mt-2 pt-2 border-t border-[#e2e8f0]" style={{ fontFamily: 'Work Sans, sans-serif' }}>
              <span>Total</span>
              <span>{formatMoney(subtotal, sym)}</span>
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
        </section>

        {/* Footer */}
        <footer className="flex flex-col md:flex-row print:flex-row justify-between items-end print:items-end gap-4 pt-6 mt-6 border-t border-[#f1f5f9] w-full">
          {((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ? (
            <div className="space-y-1">
              <h2 className="text-[12px] text-[#45464d] mb-2 uppercase tracking-widest">Payment Method</h2>
              <p className="text-sm text-black font-semibold">{invoice.bank_name || profile?.bank_name}</p>
              {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                <p className="text-xs text-[#45464d]">{invoice.bank_account_holder || profile?.bank_account_holder}</p>
              )}
              {(invoice.bank_account_number || profile?.bank_account_number) && (
                <p className="text-xs text-[#45464d] font-mono">Account: {invoice.bank_account_number || profile?.bank_account_number}</p>
              )}
              {(invoice.bank_swift || profile?.bank_swift) && (
                <p className="text-xs text-[#45464d]">SWIFT/BIC: {invoice.bank_swift || profile?.bank_swift}</p>
              )}
            </div>
          ) : <div></div>}

          <div className="flex flex-col items-start md:items-end print:items-end gap-4">
            {((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name)) && (
              <div className="flex flex-col items-start md:items-end print:items-end">
                {(invoice.signature_url || profile?.signature_url) && (
                  <img src={invoice.signature_url || profile?.signature_url || undefined} alt="Signature" className="h-10 mb-2 object-contain" />
                )}
                <div className="w-40 border-b border-[#e2e8f0] mb-1"></div>
                <p className="text-xs text-[#76777d]">{invoice.signatory_name || profile?.signatory_name || 'Authorized Signatory'}</p>
              </div>
            )}
            {profile?.qr_code_enabled && publicUrl && (
              <div className="flex flex-col items-start md:items-end print:items-end mt-4 break-inside-avoid">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Scan to View Online</p>
                <QRCodeSVG value={publicUrl} size={64} />
              </div>
            )}

            {!isPreview && (
              <button onClick={() => window.print()} className="print:hidden flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg text-[12px]">
                <span className="material-symbols-outlined">download</span>
                Download PDF
              </button>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}
