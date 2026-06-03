import React from 'react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal } from './templateUtils';

export function ModernTemplate({ invoice, profile, isPreview }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt);
  const subtotal = getSubtotal(invoice);
  const tax = 0;
  const total = subtotal + tax;

  return (
    <div className="bg-[#f8f9ff] min-h-screen text-[#0b1c30] py-8 px-4 md:py-16" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
      {/* Action Bar - hidden in print */}
      {!isPreview && (
        <div className="max-w-[800px] mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
          <span className="text-2xl font-bold text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>Invoicely</span>
          <button onClick={() => window.print()} className="px-4 py-2 border border-[#c6c6cd] rounded-lg text-xs hover:bg-[#eff4ff] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download / Print PDF
          </button>
        </div>
      )}

      {/* Invoice Paper */}
      <div className="max-w-[800px] mx-auto bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="bg-[#0058be] text-white w-full md:w-[30%] p-8 flex flex-col justify-between">
          <div>
            <div className="mb-12">
              {profile?.company_logo && (
                <img alt="Logo" className="max-h-24 max-w-[200px] bg-white p-1 rounded-lg mb-4 object-contain w-auto h-auto" src={profile.company_logo} />
              )}
              <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>{profile?.company_name || 'Your Company'}</h2>
              {profile?.email && <p className="text-sm opacity-80" style={{ fontFamily: 'Geist, monospace' }}>{profile.email}</p>}
              {profile?.phone && <p className="text-sm opacity-80" style={{ fontFamily: 'Geist, monospace' }}>{profile.phone}</p>}
              {profile?.company_address && (
                <p className="text-xs opacity-70 mt-2 whitespace-pre-line font-light" style={{ fontFamily: 'Geist, monospace' }}>
                  {profile.company_address}
                </p>
              )}
            </div>
            <div className="mb-8">
              <p className="text-[12px] uppercase tracking-wider opacity-70 mb-1">Invoice Number</p>
              <p className="text-lg font-semibold">{invoice.invoiceNumber || invoice.id?.substring(0, 8).toUpperCase()}</p>
            </div>
            <div className="mb-8">
              <p className="text-[12px] uppercase tracking-wider opacity-70 mb-1">Date Issued</p>
              <p className="text-sm">{formatDate(invoice.createdAt)}</p>
            </div>
            <div className="mb-8">
              <p className="text-[12px] uppercase tracking-wider opacity-70 mb-1">Due Date</p>
              <p className="text-sm">{formatDate(dueDate)}</p>
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
        <div className="w-full md:w-[70%] p-8 md:p-12">
          <div className="flex justify-between items-start mb-16">
            <div>
              <p className="text-[12px] uppercase text-[#76777d] mb-2">Billed To</p>
              <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>{invoice.clientName}</h3>
              <p className="text-sm text-[#45464d] whitespace-pre-line">{invoice.clientAddress || invoice.clientPhone}</p>
            </div>
            <div className="inline-block bg-[#6ffbbe] text-[#005236] px-3 py-1 rounded-full text-[12px] font-bold uppercase">
              {invoice.status}
            </div>
          </div>

          {/* Items */}
          <div className="mb-12">
            <p className="text-[12px] uppercase text-[#76777d] mb-4 border-b border-[#dce9ff] pb-2">Description</p>
            {invoice.groups?.map((group, gIdx) => (
              <div key={gIdx} className="mb-6">
                {group.name && <h4 className="font-bold mb-2">{group.name}</h4>}
                {group.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex justify-between items-start mb-4">
                    <div className="pr-4">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-[#45464d] mt-1" style={{ fontFamily: 'Geist, monospace' }}>Qty: {item.quantity} × {formatMoney(item.unitPrice, sym)}</p>
                    </div>
                    <p className="text-sm whitespace-nowrap" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(item.quantity * item.unitPrice, sym)}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-[#dce9ff] pt-6">
            <div className="flex justify-end mb-3">
              <div className="w-full sm:w-2/3 md:w-1/2 flex justify-between">
                <p className="text-[12px] text-[#76777d]">Subtotal</p>
                <p className="text-sm" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(subtotal, sym)}</p>
              </div>
            </div>
            <div className="flex justify-end mb-6">
              <div className="w-full sm:w-2/3 md:w-1/2 flex justify-between">
                <p className="text-[12px] text-[#76777d]">Tax (0%)</p>
                <p className="text-sm" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(tax, sym)}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="w-full md:w-2/3 bg-[#131b2e] p-6 rounded-lg flex justify-between items-center">
                <p className="text-[12px] uppercase tracking-wider text-[#bec6e0]">Total Due</p>
                <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Work Sans, sans-serif' }}>{formatMoney(total, sym)}</p>
              </div>
            </div>
          </div>

          {/* Notes and Signature */}
          <div className="mt-16 pt-8 border-t border-[#dce9ff] flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <p className="text-[12px] uppercase text-[#76777d] mb-2">Notes</p>
              <p className="text-sm text-[#45464d]">{invoice.notes || 'Thank you for your business. Please process payment within 30 days of receiving this invoice.'}</p>
            </div>
            {((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name)) && (
              <div className="flex flex-col items-start md:items-end min-w-[200px]">
                {(invoice.signature_url || profile?.signature_url) && (
                  <img src={invoice.signature_url || profile?.signature_url || undefined} alt="Signature" className="h-10 mb-2 object-contain" />
                )}
                <div className="w-40 border-b border-[#c6c6cd] mb-1"></div>
                <p className="text-xs text-[#76777d]">{invoice.signatory_name || profile?.signatory_name || 'Authorized Signatory'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
