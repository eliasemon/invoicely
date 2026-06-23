'use client';
import { useCreateInvoice } from '@/core/contexts/CreateInvoiceContext';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { GroupData } from '@/components/create/LineItemGroup';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

interface MobileInvoicePreviewProps {
  groups: GroupData[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
}

export function MobileInvoicePreview({ groups, subtotal, discountAmount, totalAmount }: Readonly<MobileInvoicePreviewProps>) {
  const { 
    clientName, 
    clientAddress, 
    mobileNumber, 
    issuedAt, 
    dueDate,
    currency,
    currencySymbol,
    shippingCost,
    discountType,
    discountValue
  } = useCreateInvoice();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-surface rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-outline-variant animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Accent */}
      <div className="h-2 w-full bg-gradient-to-r from-primary to-tertiary"></div>
      
      <div className="p-5 sm:p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary">
            <MaterialIcon icon="receipt_long" className="text-[20px]" />
          </div>
          <div>
            <h3 className="font-headline-sm text-on-surface font-bold">Invoice Preview</h3>
            <p className="font-body-sm text-on-surface-variant">Review details before finalizing</p>
          </div>
        </div>
        
        {/* Customer Details */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/50">
          <p className="font-label-sm text-primary uppercase tracking-wider mb-1">Billed To</p>
          <p className="font-body-lg text-on-surface font-semibold">{clientName || 'Unnamed Customer'}</p>
          {mobileNumber && <p className="font-body-sm text-on-surface-variant flex items-center gap-1.5 mt-1.5"><MaterialIcon icon="phone" className="text-[14px]" /> {mobileNumber}</p>}
          {clientAddress && <p className="font-body-sm text-on-surface-variant mt-1.5 leading-relaxed flex items-start gap-1.5"><MaterialIcon icon="location_on" className="text-[14px] mt-0.5 shrink-0" /> <span className="line-clamp-2">{clientAddress}</span></p>}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/50">
            <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Issue Date</p>
            <p className="font-body-md text-on-surface font-medium">{formatDate(issuedAt)}</p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/50">
            <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Due Date</p>
            <p className="font-body-md text-on-surface font-medium">{formatDate(dueDate)}</p>
          </div>
        </div>

        {/* Line Items Summary */}
        <div className="space-y-2">
          <p className="font-label-sm text-primary uppercase tracking-wider mb-1">Item Groups</p>
          {groups.length > 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/50 divide-y divide-outline-variant/30">
              {groups.map(group => {
                const groupTotal = group.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
                return (
                  <div key={group.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-body-md text-on-surface font-bold">{group.name || 'Unnamed Group'}</p>
                      <CurrencyDisplay amount={groupTotal} currency={currency} currencySymbol={currencySymbol} className="font-body-md font-bold text-on-surface" />
                    </div>
                    <div className="space-y-2 pl-2 border-l-2 border-outline-variant/30">
                      {group.items.map(item => (
                        <div key={item.id} className="flex justify-between items-start">
                          <div>
                            <p className="font-body-sm text-on-surface">{item.name || 'Unnamed Item'}</p>
                            <p className="font-label-sm text-on-surface-variant mt-0.5">
                              {item.quantity} {item.unit || 'pcs'} × <CurrencyDisplay amount={item.unitPrice} currency={currency} currencySymbol={currencySymbol} />
                            </p>
                          </div>
                          <CurrencyDisplay amount={item.quantity * item.unitPrice} currency={currency} currencySymbol={currencySymbol} className="font-body-sm text-on-surface-variant font-medium" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-body-sm text-on-surface-variant italic">No items added</p>
          )}
        </div>

        {/* Totals */}
        <div className="bg-surface-container rounded-2xl p-5 space-y-3">
          <div className="flex justify-between text-on-surface-variant font-body-sm">
            <span>Subtotal</span>
            <CurrencyDisplay amount={subtotal} currency={currency} currencySymbol={currencySymbol} className="font-medium text-on-surface" />
          </div>
          
          {discountValue > 0 && (
            <div className="flex justify-between text-success font-body-sm">
              <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : 'Fixed'})</span>
              <span className="flex items-center font-medium">
                -<CurrencyDisplay amount={discountAmount} currency={currency} currencySymbol={currencySymbol} />
              </span>
            </div>
          )}
          
          {shippingCost > 0 && (
            <div className="flex justify-between text-on-surface-variant font-body-sm">
              <span>Shipping</span>
              <span className="font-medium text-on-surface">
                +<CurrencyDisplay amount={shippingCost} currency={currency} currencySymbol={currencySymbol} />
              </span>
            </div>
          )}

          <div className="border-t border-outline-variant pt-4 mt-2 flex justify-between items-end">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Amount</span>
            <CurrencyDisplay amount={totalAmount} currency={currency} currencySymbol={currencySymbol} className="font-headline-md text-primary font-bold" />
          </div>
        </div>
      </div>
    </div>
  );
}
