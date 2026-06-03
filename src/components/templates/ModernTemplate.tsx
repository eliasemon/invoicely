import React from 'react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal } from './templateUtils';

export function ModernTemplate({ invoice, profile, isPreview }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt);
  const subtotal = getSubtotal(invoice);
  const tax = 0;
  const total = subtotal + tax;

  return (
    <div className="bg-[#f8f9ff] min-h-screen text-[#0b1c30] py-8 px-4 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
      {/* Action Bar - hidden in print */}
      {!isPreview && (
        <div className="max-w-[210mm] mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
          <span className="text-2xl font-bold text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>Invoicely</span>
          <button onClick={() => window.print()} className="px-4 py-2 border border-[#c6c6cd] rounded-lg text-xs hover:bg-[#eff4ff] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download / Print PDF
          </button>
        </div>
      )}

      {/* Invoice Paper */}
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        {/* Sidebar */}
        <div className="bg-[#0058be] text-white w-full md:w-[30%] print:w-[30%] p-6 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              {profile?.company_logo && (
                <img alt="Logo" className="max-h-20 max-w-[160px] bg-white p-1 rounded-lg mb-3 object-contain w-auto h-auto" src={profile.company_logo} />
              )}
              <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>{profile?.company_name || 'Your Company'}</h2>
              {profile?.email && <p className="text-xs opacity-80" style={{ fontFamily: 'Geist, monospace' }}>{profile.email}</p>}
              {profile?.phone && <p className="text-xs opacity-80" style={{ fontFamily: 'Geist, monospace' }}>{profile.phone}</p>}
              {profile?.company_address && (
                <p className="text-[11px] opacity-70 mt-1.5 whitespace-pre-line font-light" style={{ fontFamily: 'Geist, monospace' }}>
                  {profile.company_address}
                </p>
              )}
            </div>
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">Invoice Number</p>
              <p className="text-base font-semibold">{invoice.invoiceNumber || invoice.id?.substring(0, 8).toUpperCase()}</p>
            </div>
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">Date Issued</p>
              <p className="text-xs">{formatDate(invoice.createdAt)}</p>
            </div>
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">Due Date</p>
              <p className="text-xs font-semibold">{formatDate(dueDate)}</p>
            </div>
          </div>
          {((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) && (
            <div className="mt-8 hidden md:block">
              <p className="text-[12px] uppercase tracking-wider opacity-70 mb-2">Payment Details</p>
              <div className="bg-white/10 p-4 rounded-lg text-white w-full border border-white/10">
                <p className="text-sm font-semibold">{invoice.bank_name || profile?.bank_name}</p>
                {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                  <p className="text-xs mt-1 opacity-80">{invoice.bank_account_holder || profile?.bank_account_holder}</p>
                )}
                {(invoice.bank_account_number || profile?.bank_account_number) && (
                  <p className="text-xs mt-1 opacity-80 font-mono">{invoice.bank_account_number || profile?.bank_account_number}</p>
                )}
                {(invoice.bank_swift || profile?.bank_swift) && (
                  <p className="text-xs mt-1 opacity-80">SWIFT: {invoice.bank_swift || profile?.bank_swift}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="w-full md:w-[70%] print:w-[70%] p-6 print:p-6">
          <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start gap-4 mb-4">
            <div>
              <p className="text-[10px] uppercase text-[#76777d] mb-1">Billed To</p>
              <h3 className="text-lg font-semibold mb-0.5" style={{ fontFamily: 'Work Sans, sans-serif' }}>{invoice.clientName}</h3>
              <p className="text-xs text-[#45464d] whitespace-pre-line">{invoice.clientAddress || invoice.clientPhone}</p>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {invoice.status}
            </div>
          </div>

          {/* Items */}
          <div className="mb-4">
            <p className="text-[10px] uppercase text-[#76777d] mb-1.5 border-b border-[#dce9ff] pb-1">Description</p>
            {invoice.groups?.map((group, gIdx) => (
              <div key={gIdx} className="mb-3">
                {group.name && <h4 className="font-bold text-xs mb-1">{group.name}</h4>}
                {group.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex justify-between items-start mb-1.5">
                    <div className="pr-4">
                      <h4 className="font-semibold text-xs">{item.name}</h4>
                      <p className="text-[10px] text-[#45464d] mt-0.5" style={{ fontFamily: 'Geist, monospace' }}>Qty: {item.quantity} × {formatMoney(item.unitPrice, sym)}</p>
                    </div>
                    <p className="text-xs whitespace-nowrap" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(item.quantity * item.unitPrice, sym)}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-[#dce9ff] pt-4">
            <div className="flex justify-end mb-1.5">
              <div className="w-full sm:w-2/3 md:w-1/2 print:w-1/2 flex justify-between text-xs">
                <p className="text-[10px] text-[#76777d]">Subtotal</p>
                <p style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(subtotal, sym)}</p>
              </div>
            </div>
            <div className="flex justify-end mb-3">
              <div className="w-full sm:w-2/3 md:w-1/2 print:w-1/2 flex justify-between text-xs">
                <p className="text-[10px] text-[#76777d]">Tax (0%)</p>
                <p style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(tax, sym)}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="w-full md:w-2/3 print:w-2/3 bg-[#131b2e] py-3 px-4 rounded-lg flex justify-between items-center">
                <p className="text-[10px] uppercase tracking-wider text-[#bec6e0]">Total Due</p>
                <p className="text-xl font-bold text-white" style={{ fontFamily: 'Work Sans, sans-serif' }}>{formatMoney(total, sym)}</p>
              </div>
            </div>
          </div>

          {/* Notes and Signature */}
          <div className="mt-4 pt-3 border-t border-[#dce9ff] flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <p className="text-[10px] uppercase text-[#76777d] mb-1">Notes</p>
              <p className="text-xs text-[#45464d]">{invoice.notes || 'Thank you for your business. Please process payment within 30 days of receiving this invoice.'}</p>
            </div>
            {((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name)) && (
              <div className="flex flex-col items-start md:items-end min-w-[160px]">
                {(invoice.signature_url || profile?.signature_url) && (
                  <img src={invoice.signature_url || profile?.signature_url || undefined} alt="Signature" className="h-8 mb-1.5 object-contain" />
                )}
                <div className="w-36 border-b border-[#c6c6cd] mb-1"></div>
                <p className="text-[10px] text-[#76777d]">{invoice.signatory_name || profile?.signatory_name || 'Authorized Signatory'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
