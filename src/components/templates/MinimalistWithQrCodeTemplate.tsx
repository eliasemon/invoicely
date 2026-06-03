import React from 'react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal, getAllItems } from './templateUtils';

export function MinimalistWithQrCodeTemplate({ invoice, profile, isPreview }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt);
  const subtotal = getSubtotal(invoice);
  const items = getAllItems(invoice);

  return (
    <div className="bg-[#f8f9ff] text-[#0f172a] min-h-screen py-8 md:py-16" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
      <main className="w-full max-w-[800px] mx-auto px-6 md:px-16 bg-white border border-[#e2e8f0] rounded-xl py-16 relative">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
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
          <div className="text-left md:text-right">
            <h1 className="text-[40px] leading-[48px] font-bold text-black mb-2" style={{ fontFamily: 'Work Sans, sans-serif', letterSpacing: '-0.02em' }}>Invoice</h1>
            <p className="text-sm text-[#45464d] mb-6" style={{ fontFamily: 'Geist, monospace' }}>{invoice.invoiceNumber}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e2e8f0] text-[12px] bg-[#f1f5f9]">
              <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
              {invoice.status}
            </div>
          </div>
        </header>

        {/* Meta */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-[12px] text-[#45464d] mb-4 uppercase tracking-widest">Billed To</h2>
            <p className="text-lg font-semibold text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>{invoice.clientName}</p>
            <p className="whitespace-pre-line mt-1">{invoice.clientAddress || ''}</p>
            {invoice.clientPhone && <p className="pt-2 text-[#45464d] text-sm" style={{ fontFamily: 'Geist, monospace' }}>{invoice.clientPhone}</p>}
          </div>
          <div className="grid grid-cols-2 gap-8 text-left md:text-right">
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
        <section className="mb-16">
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-[#e2e8f0] text-[#45464d] text-[12px] lowercase">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>
          <div className="flex flex-col gap-6 py-6 border-b border-[#f1f5f9]">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start md:items-center">
                <div className="col-span-1 md:col-span-6">
                  <p className="font-medium">{item.name}</p>
                </div>
                <div className="col-span-1 md:col-span-2 md:text-right text-sm text-[#45464d]" style={{ fontFamily: 'Geist, monospace' }}>
                  <span className="md:hidden">Qty: </span>{item.quantity}
                </div>
                <div className="col-span-1 md:col-span-2 md:text-right text-sm text-[#45464d]" style={{ fontFamily: 'Geist, monospace' }}>
                  <span className="md:hidden">Rate: </span>{formatMoney(item.unitPrice, sym)}
                </div>
                <div className="col-span-1 md:col-span-2 text-right text-sm" style={{ fontFamily: 'Geist, monospace' }}>
                  {formatMoney(item.quantity * item.unitPrice, sym)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end gap-4 py-8">
            <div className="w-full md:w-1/2 flex justify-between text-sm text-[#45464d]" style={{ fontFamily: 'Geist, monospace' }}>
              <span>Subtotal</span>
              <span>{formatMoney(subtotal, sym)}</span>
            </div>
            <div className="w-full md:w-1/2 flex justify-between text-sm text-[#45464d]" style={{ fontFamily: 'Geist, monospace' }}>
              <span>Tax (0%)</span>
              <span>{formatMoney(0, sym)}</span>
            </div>
            <div className="w-full md:w-1/2 flex justify-between text-2xl font-semibold text-black mt-4 pt-4 border-t border-[#e2e8f0]" style={{ fontFamily: 'Work Sans, sans-serif' }}>
              <span>Total</span>
              <span>{formatMoney(subtotal, sym)}</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col md:flex-row justify-between items-end gap-8 pt-16 mt-16 border-t border-[#f1f5f9] w-full">
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

          <div className="flex flex-col items-start md:items-end gap-4">
            {((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name)) && (
              <div className="flex flex-col items-start md:items-end">
                {(invoice.signature_url || profile?.signature_url) && (
                  <img src={invoice.signature_url || profile?.signature_url || undefined} alt="Signature" className="h-10 mb-2 object-contain" />
                )}
                <div className="w-40 border-b border-[#e2e8f0] mb-1"></div>
                <p className="text-xs text-[#76777d]">{invoice.signatory_name || profile?.signatory_name || 'Authorized Signatory'}</p>
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
