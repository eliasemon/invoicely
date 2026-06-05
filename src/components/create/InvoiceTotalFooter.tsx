import Link from 'next/link';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';

interface InvoiceTotalFooterProps {
  totalAmount: number;
  subtotal?: number;
  discountType?: 'amount' | 'percentage';
  discountValue?: number;
  shippingCost?: number;
  currency?: string;
  currencySymbol?: string;
}

export function InvoiceTotalFooter({ 
  totalAmount, 
  subtotal = totalAmount, 
  discountType, 
  discountValue = 0, 
  shippingCost = 0,
  currency = 'USD', 
  currencySymbol 
}: Readonly<InvoiceTotalFooterProps>) {
  
  const discountAmount = discountType === 'percentage' 
    ? subtotal * (discountValue / 100) 
    : discountValue;

  const hasBreakdown = discountAmount > 0 || shippingCost > 0;

  return (
    <div className="fixed bottom-16 md:bottom-0 w-full bg-surface-container-lowest border-t border-outline-variant shadow-[0_-4px_12px_rgba(26,43,60,0.05)] p-margin-mobile z-40 md:static md:mt-xl md:shadow-none md:border-none md:bg-transparent">
      
      {hasBreakdown && (
        <div className="max-w-3xl mx-auto mb-sm px-sm md:px-0">
          <div className="flex justify-between items-center text-on-surface-variant font-body-sm mb-xs">
            <span>Subtotal</span>
            <CurrencyDisplay amount={subtotal} currency={currency} currencySymbol={currencySymbol} />
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-on-surface-variant font-body-sm mb-xs">
              <span>Discount {discountType === 'percentage' ? `(${discountValue}%)` : ''}</span>
              <span className="text-error">-<CurrencyDisplay amount={discountAmount} currency={currency} currencySymbol={currencySymbol} /></span>
            </div>
          )}
          {shippingCost > 0 && (
            <div className="flex justify-between items-center text-on-surface-variant font-body-sm mb-xs">
              <span>Shipping</span>
              <span>+<CurrencyDisplay amount={shippingCost} currency={currency} currencySymbol={currencySymbol} /></span>
            </div>
          )}
          <div className="h-px bg-outline-variant w-full my-xs"></div>
        </div>
      )}

      <div className="max-w-3xl mx-auto flex justify-between items-center gap-md">
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Amount ({currency})</p>
          <CurrencyDisplay 
            amount={totalAmount} 
            currency={currency} 
            currencySymbol={currencySymbol}
            showCurrencyCode={true}
            className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary font-bold block" 
          />
        </div>
        <Link 
          href="/create/customize"
          className="h-[48px] px-xl bg-primary text-on-primary rounded-lg font-body-md text-body-md font-medium hover:bg-primary-container transition-colors shadow-sm flex items-center gap-xs whitespace-nowrap"
        >
          Next <MaterialIcon icon="arrow_forward" className="text-[20px]" />
        </Link>
      </div>
    </div>
  );
}
