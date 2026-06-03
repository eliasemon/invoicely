import React from 'react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal, getAllItems } from './templateUtils';

export function ElegantTemplate({ invoice, profile, isPreview, showGroups }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt, 14);
  const subtotal = getSubtotal(invoice);
  const amountPaid = invoice.amountPaid || 0;
  const balanceDue = Math.max(0, subtotal - amountPaid);
  const items = getAllItems(invoice);

  return (
    <div className="bg-[#cbdbf5] min-h-screen text-[#0b1c30] py-8 px-4 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
      {/* Floating Actions */}
      {!isPreview && (
        <div className="fixed top-6 right-6 md:right-12 z-50 flex gap-4 print:hidden">
          <button onClick={() => window.print()} className="bg-black text-white px-6 py-2.5 rounded-full shadow-md text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download PDF
          </button>
        </div>
      )}

      {/* Invoice Canvas */}
      <main className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-[0_4px_40px_rgba(11,28,48,0.06)] rounded-sm overflow-hidden p-6 md:p-10 print:p-6 relative print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        {/* Header */}
        <header className="flex flex-col md:flex-row print:flex-row justify-between items-start md:items-end print:items-end gap-8 mb-6">
          <div>
            {profile?.company_logo && (
              <img alt="Company Logo" className="max-h-28 max-w-[240px] mb-4 object-contain w-auto h-auto" src={profile.company_logo} />
            )}
            <h1 className="text-[40px] leading-[48px] font-bold text-black mb-2" style={{ fontFamily: 'Work Sans, sans-serif', letterSpacing: '-0.02em' }}>
              {profile?.company_name || 'Your Company'}
            </h1>
            <p className="text-[#565e74] max-w-[250px] whitespace-pre-line text-sm mt-1">
              {profile?.company_address || ''}
              {profile?.email ? `\n${profile.email}` : ''}
              {profile?.phone ? `\n${profile.phone}` : ''}
            </p>
          </div>
          <div className="text-left md:text-right print:text-right w-full md:w-auto print:w-auto">
            <h2 className="text-2xl font-semibold text-[#76777d] tracking-wider mb-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>INVOICE</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left md:text-right print:text-right">
              <span className="text-[12px] text-[#76777d] text-left md:text-right print:text-right">Invoice No.</span>
              <span className="text-sm" style={{ fontFamily: 'Geist, monospace' }}>{invoice.invoiceNumber || invoice.id?.substring(0, 8).toUpperCase()}</span>
              <span className="text-[12px] text-[#76777d] text-left md:text-right print:text-right">Issue Date</span>
              <span className="text-sm" style={{ fontFamily: 'Geist, monospace' }}>{formatDate(invoice.createdAt)}</span>
              <span className="text-[12px] text-[#76777d] text-left md:text-right print:text-right">Due Date</span>
              <span className="text-sm font-semibold" style={{ fontFamily: 'Geist, monospace' }}>{formatDate(dueDate)}</span>
            </div>
          </div>
        </header>

        {/* Bill To */}
        <section className="mb-6 border-l-2 border-[#565e74] pl-4">
          <h3 className="text-[12px] text-[#76777d] mb-3">BILL TO</h3>
          <p className="text-2xl font-semibold mb-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>{invoice.clientName}</p>
          <p className="text-[#565e74] whitespace-pre-line">{invoice.clientAddress || invoice.clientPhone}</p>
        </section>

        {/* Line Items Table */}
        <section className="mb-6">
          <div className="w-full">
            <div className="grid grid-cols-12 gap-4 border-b border-[#c6c6cd] pb-2 mb-2">
              <div className="col-span-6 text-[12px] text-[#76777d]">DESCRIPTION</div>
              <div className="col-span-2 text-right text-[12px] text-[#76777d]">QTY/HRS</div>
              <div className="col-span-2 text-right text-[12px] text-[#76777d]">RATE</div>
              <div className="col-span-2 text-right text-[12px] text-[#76777d]">AMOUNT</div>
            </div>
            {showGroups && invoice.groups && invoice.groups.length > 0 ? (
              invoice.groups.map((group, gIdx) => (
                <React.Fragment key={gIdx}>
                  {group.name && (
                    <div className="col-span-12 text-[10px] font-bold tracking-wider text-slate-700 bg-slate-100 px-3 py-1 mb-2 mt-4 uppercase rounded">
                      {group.name}
                    </div>
                  )}
                  {group.items.map((item, iIdx) => (
                    <div key={iIdx} className="grid grid-cols-12 gap-4 py-2 border-b border-[#dce9ff] items-start col-span-12">
                      <div className="col-span-6">
                        <p className="font-medium">{item.name}</p>
                      </div>
                      <div className="col-span-2 text-right text-sm text-[#565e74]" style={{ fontFamily: 'Geist, monospace' }}>{item.quantity.toFixed(2)}</div>
                      <div className="col-span-2 text-right text-sm text-[#565e74]" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(item.unitPrice, sym)}</div>
                      <div className="col-span-2 text-right text-sm" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(item.quantity * item.unitPrice, sym)}</div>
                    </div>
                  ))}
                </React.Fragment>
              ))
            ) : (
              items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 py-2 border-b border-[#dce9ff] items-start">
                  <div className="col-span-6">
                    <p className="font-medium">{item.name}</p>
                  </div>
                  <div className="col-span-2 text-right text-sm text-[#565e74]" style={{ fontFamily: 'Geist, monospace' }}>{item.quantity.toFixed(2)}</div>
                  <div className="col-span-2 text-right text-sm text-[#565e74]" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(item.unitPrice, sym)}</div>
                  <div className="col-span-2 text-right text-sm" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(item.quantity * item.unitPrice, sym)}</div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Totals */}
        <section className="flex flex-col items-end mb-6">
          <div className="w-full md:w-1/2 lg:w-1/3 print:w-1/3">
            <div className="flex justify-between py-2 border-b border-[#dce9ff]">
              <span className="text-[#565e74]">Subtotal</span>
              <span className="text-sm" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(subtotal, sym)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#dce9ff]">
              <span className="text-[#565e74]">Tax (0%)</span>
              <span className="text-sm" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(0, sym)}</span>
            </div>
            <div className="flex justify-between py-3 mt-1">
              <span className="text-2xl font-semibold" style={{ fontFamily: 'Work Sans, sans-serif' }}>Total Due</span>
              <span className="text-2xl font-bold" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(subtotal, sym)}</span>
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
        <footer className="flex flex-col md:flex-row print:flex-row justify-between items-start md:items-end print:items-end gap-6 mt-auto w-full pt-6 border-t border-[#dce9ff]">
          <div className="w-full md:w-1/2 print:w-1/2 space-y-3">
            <div>
              <h4 className="text-[12px] text-[#76777d] mb-2">PAYMENT TERMS</h4>
              <p className="text-[#565e74] text-sm">
                Payment is due within 14 days of issue. Please include invoice number on bank transfer details.
              </p>
            </div>
            {((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) && (
              <div>
                <h4 className="text-[12px] text-[#76777d] mb-2">BANK DETAILS</h4>
                <div className="text-sm text-[#565e74] space-y-0.5">
                  <p><span className="font-semibold text-black">Bank:</span> {invoice.bank_name || profile?.bank_name}</p>
                  {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                    <p><span className="font-semibold text-black">Account Holder:</span> {invoice.bank_account_holder || profile?.bank_account_holder}</p>
                  )}
                  {(invoice.bank_account_number || profile?.bank_account_number) && (
                    <p><span className="font-semibold text-black">Account Number:</span> {invoice.bank_account_number || profile?.bank_account_number}</p>
                  )}
                  {(invoice.bank_swift || profile?.bank_swift) && (
                    <p><span className="font-semibold text-black">SWIFT:</span> {invoice.bank_swift || profile?.bank_swift}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="w-full md:w-1/2 print:w-1/2 flex justify-start md:justify-end print:justify-end">
            {((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name)) && (
              <div className="flex flex-col items-start md:items-end print:items-end">
                {(invoice.signature_url || profile?.signature_url) && (
                  <img src={invoice.signature_url || profile?.signature_url || undefined} alt="Signature" className="h-12 mb-2 object-contain" />
                )}
                <div className="w-48 border-b border-[#565e74] mb-2"></div>
                <p className="text-[12px] text-[#76777d]">{invoice.signatory_name || profile?.signatory_name || 'Authorized Signature'}</p>
              </div>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}
