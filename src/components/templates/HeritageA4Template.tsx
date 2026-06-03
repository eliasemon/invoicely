import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TemplateProps, formatDate, formatMoney, getDueDate, getSubtotal, getAllItems } from './templateUtils';

export function HeritageA4Template({ invoice, profile, showGroups , publicUrl }: TemplateProps) {
  const sym = invoice.currency_symbol || '$';
  const dueDate = getDueDate(invoice.createdAt);
  const subtotal = getSubtotal(invoice);
  const amountPaid = invoice.amountPaid || 0;
  const balanceDue = Math.max(0, subtotal - amountPaid);
  const items = getAllItems(invoice);

  return (
    <div className="bg-[#f5f0eb] min-h-screen py-8 px-4 print:bg-white print:p-0 print:m-0 print:min-h-0 print:w-[210mm]" style={{ fontFamily: 'Georgia, serif' }}>
      <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-[#fffdf8] shadow-lg border border-[#d4c5b0] print:shadow-none print:rounded-none print:border-none print:w-[210mm] print:max-w-[210mm] print:mx-0 print:min-h-[297mm] print:my-0">
        <div className="p-6 md:p-10 print:p-6">
          {/* Header with ornamental line */}
          <div className="text-center mb-6">
            <div className="w-24 h-[2px] bg-[#8b7355] mx-auto mb-4"></div>
            {profile?.company_logo && (
              <img alt="Company Logo" className="max-h-24 max-w-[200px] mx-auto mb-4 object-contain w-auto h-auto" src={profile.company_logo} />
            )}
            <h1 className="text-4xl font-bold text-[#2c1810] mb-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>{profile?.company_name || 'Your Company'}</h1>
            <p className="text-sm text-[#8b7355] tracking-widest uppercase">{profile?.company_address || ''}</p>
            {(profile?.email || profile?.phone) && (
              <p className="text-xs text-[#8b7355]/85 tracking-wider mt-1" style={{ fontFamily: 'Geist, monospace' }}>
                {profile.email}{profile.email && profile.phone ? ' • ' : ''}{profile.phone}
              </p>
            )}
            <div className="w-24 h-[2px] bg-[#8b7355] mx-auto mt-4"></div>
          </div>

          <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start gap-4 sm:gap-6 mb-6">
            <div>
              <p className="text-[11px] text-[#8b7355] uppercase tracking-[0.2em] mb-1.5">Invoice To</p>
              <p className="text-xl font-bold text-[#2c1810]">{invoice.clientName}</p>
              <p className="text-sm text-[#6b5b4a] mt-1 whitespace-pre-line">{invoice.clientAddress || invoice.clientPhone}</p>
            </div>
            <div className="text-left sm:text-right print:text-right w-full sm:w-auto print:w-auto">
              <p className="text-[11px] text-[#8b7355] uppercase tracking-[0.2em] mb-1.5">Invoice Details</p>
              <p className="text-sm" style={{ fontFamily: 'Geist, monospace' }}><span className="text-[#8b7355]">No:</span> {invoice.invoiceNumber}</p>
              <p className="text-sm mt-1" style={{ fontFamily: 'Geist, monospace' }}><span className="text-[#8b7355]">Date:</span> {formatDate(invoice.createdAt)}</p>
              <p className="text-sm mt-1" style={{ fontFamily: 'Geist, monospace' }}><span className="text-[#8b7355]">Due:</span> {formatDate(dueDate)}</p>
            </div>
          </div>

          {/* Items */}
          <table className="w-full mb-6">
            <thead>
              <tr className="border-y-2 border-[#8b7355]">
                <th className="text-left py-1.5 text-[11px] text-[#8b7355] uppercase tracking-wider">Item</th>
                <th className="text-right py-1.5 text-[11px] text-[#8b7355] uppercase tracking-wider w-20">Qty</th>
                <th className="text-right py-1.5 text-[11px] text-[#8b7355] uppercase tracking-wider w-28">Rate</th>
                <th className="text-right py-1.5 text-[11px] text-[#8b7355] uppercase tracking-wider w-28">Amount</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: 'Geist, monospace' }}>
              {showGroups && invoice.groups && invoice.groups.length > 0 ? (
                invoice.groups.map((group, gIdx) => (
                  <React.Fragment key={gIdx}>
                    {group.name && (
                      <tr className="bg-[#fcfaf7] font-bold">
                        <td colSpan={4} className="py-1.5 text-xs text-[#2c1810] border-b border-[#e8ddd0] uppercase text-left font-semibold" style={{ fontFamily: 'Georgia, serif' }}>{group.name}</td>
                      </tr>
                    )}
                    {group.items.map((item, iIdx) => (
                      <tr key={iIdx} className="border-b border-[#e8ddd0]">
                        <td className="py-1.5 text-[#2c1810]" style={{ fontFamily: 'Georgia, serif' }}>{item.name}</td>
                        <td className="py-1.5 text-right text-sm text-[#6b5b4a]">{item.quantity}</td>
                        <td className="py-1.5 text-right text-sm text-[#6b5b4a]">{formatMoney(item.unitPrice, sym)}</td>
                        <td className="py-1.5 text-right text-sm font-semibold text-[#2c1810]">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                items.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#e8ddd0]">
                    <td className="py-1.5 text-[#2c1810]" style={{ fontFamily: 'Georgia, serif' }}>{item.name}</td>
                    <td className="py-1.5 text-right text-sm text-[#6b5b4a]">{item.quantity}</td>
                    <td className="py-1.5 text-right text-sm text-[#6b5b4a]">{formatMoney(item.unitPrice, sym)}</td>
                    <td className="py-1.5 text-right text-sm font-semibold text-[#2c1810]">{formatMoney(item.quantity * item.unitPrice, sym)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-full sm:w-64 print:w-64">
              <div className="flex justify-between py-2 text-sm text-[#6b5b4a]"><span>Subtotal</span><span style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(subtotal, sym)}</span></div>
              <div className="flex justify-between py-2 text-sm text-[#6b5b4a]"><span>Tax</span><span style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(0, sym)}</span></div>
              <div className="flex justify-between py-3 border-t-2 border-[#8b7355] mt-2 text-xl font-bold text-[#2c1810]">
                <span>Total</span><span style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(subtotal, sym)}</span>
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
          {(((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ||
            ((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name))) && (
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 mb-6 border-t border-[#d4c5b0] pt-4 text-left w-full">
              {/* Bank Details */}
              {((profile?.bank_enabled ?? true) && (invoice.bank_name || profile?.bank_name)) ? (
                <div>
                  <h4 className="text-[11px] text-[#8b7355] uppercase tracking-wider mb-2">Payment Transfer Details</h4>
                  <div className="text-sm text-[#6b5b4a] space-y-1">
                    <p><span className="font-semibold text-[#2c1810]">Bank:</span> {invoice.bank_name || profile?.bank_name}</p>
                    {(invoice.bank_account_holder || profile?.bank_account_holder) && (
                      <p><span className="font-semibold text-[#2c1810]">Holder:</span> {invoice.bank_account_holder || profile?.bank_account_holder}</p>
                    )}
                    {(invoice.bank_account_number || profile?.bank_account_number) && (
                      <p><span className="font-semibold text-[#2c1810]">Account:</span> {invoice.bank_account_number || profile?.bank_account_number}</p>
                    )}
                    {(invoice.bank_swift || profile?.bank_swift) && (
                      <p><span className="font-semibold text-[#2c1810]">SWIFT:</span> {invoice.bank_swift || profile?.bank_swift}</p>
                    )}
                  </div>
                </div>
              ) : <div></div>}

              {/* Signature */}
              <div className="flex flex-row items-end gap-6 justify-start md:justify-end print:justify-end w-full">
                    {profile?.qr_code_enabled && publicUrl && (
                      <div className="flex flex-col items-center mb-1">
                        <QRCodeSVG value={publicUrl} size={54} />
                      </div>
                    )}
                    {((profile?.signature_enabled ?? true) && (invoice.signature_url || profile?.signature_url || invoice.signatory_name || profile?.signatory_name)) && (
                <div className="flex flex-col items-start md:items-end print:items-end">
                  {(invoice.signature_url || profile?.signature_url) && (
                    <img src={invoice.signature_url || profile?.signature_url || undefined} alt="Signature" className="h-10 mb-2 object-contain" />
                  )}
                  <div className="w-full border-b border-[#d4c5b0] mb-1"></div>
                  <p className="text-xs text-[#8b7355]">{invoice.signatory_name || profile?.signatory_name || 'Authorized Signatory'}</p>
                </div>
              )}
                  </div>
            
            </div>
          )}

          {/* Footer */}
          <div className="text-center border-t border-[#d4c5b0] pt-4">
            <p className="text-sm text-[#8b7355] italic">Thank you for your patronage</p>
          </div>
        </div>
      </div>
    </div>
  );
}
