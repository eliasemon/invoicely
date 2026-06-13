'use client';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';

interface ConfirmPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  currency: string;
  currencySymbol?: string;
  isSubmitting?: boolean;
}

export function ConfirmPaymentModal({ isOpen, onClose, onConfirm, amount, currency, currencySymbol, isSubmitting }: ConfirmPaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="absolute inset-0" 
        onClick={!isSubmitting ? onClose : undefined} 
        aria-hidden="true" 
      />
      <div className="relative bg-surface rounded-3xl shadow-2xl w-[95vw] sm:w-[400px] md:w-[450px] overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-sm">
            <MaterialIcon icon="payments" className="text-[24px]" />
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Confirm Payment</h3>
          <p className="font-body-md text-on-surface-variant mb-4">
            Are you sure you want to record a payment of <strong className="text-on-surface"><CurrencyDisplay amount={amount} currency={currency} currencySymbol={currencySymbol || undefined} /></strong>?
          </p>
          
          <div className="flex gap-sm justify-end mt-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 font-label-md text-primary hover:bg-surface-container-low rounded-full transition-colors active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="px-4 py-2 font-label-md bg-primary text-on-primary hover:bg-on-primary-fixed rounded-full transition-colors active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <MaterialIcon icon="sync" className="animate-spin text-[18px]" />
                  Confirming...
                </>
              ) : (
                'Confirm'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
