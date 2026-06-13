'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { ConfirmPaymentModal } from '@/components/invoices/ConfirmPaymentModal';
import { recordPayment } from '@/app/actions/invoiceActions';

interface RecordPaymentFormProps {
  invoiceId: string;
  remainingAmount: number;
  finalCurrency: string;
  finalCurrencySymbol?: string;
}

export function RecordPaymentForm({ invoiceId, remainingAmount, finalCurrency, finalCurrencySymbol }: RecordPaymentFormProps) {
  const router = useRouter();
  const [paymentAmount, setPaymentAmount] = useState(remainingAmount);
  const [paymentNote, setPaymentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfirmPayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) return;
    setIsSubmitting(true);
    try {
      let amountToPay = Number(paymentAmount);
      if (amountToPay > remainingAmount) {
        amountToPay = remainingAmount;
      }
      await recordPayment(invoiceId, amountToPay, paymentNote);
      setShowConfirmModal(false);
      setPaymentNote('');
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-md">
        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Amount to Pay</label>
        <div className="relative flex items-center border border-outline-variant rounded-lg bg-surface-bright focus-within:border-primary transition-colors px-3 py-2">
          <span className="text-on-surface-variant font-body-md mr-2">{finalCurrencySymbol || finalCurrency}</span>
          <input 
            name="amount"
            type="number" 
            step="0.01"
            min="0.01"
            max={remainingAmount}
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(Number(e.target.value))}
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 font-body-md text-primary" 
          />
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
          Remaining balance: <CurrencyDisplay amount={remainingAmount} currency={finalCurrency} currencySymbol={finalCurrencySymbol} />
        </p>
        
        <details className="mt-2 group">
          <summary className="flex items-center text-primary font-label-sm w-fit gap-1 hover:underline focus:outline-none cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <MaterialIcon icon="expand_more" className="text-[16px] group-open:hidden" />
            <MaterialIcon icon="expand_less" className="text-[16px] hidden group-open:block" />
            <span className="group-open:hidden">Add Note (Optional)</span>
            <span className="hidden group-open:inline">Hide Note</span>
          </summary>
          <textarea
            name="note"
            placeholder="Add comments or notes..."
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            className="mt-2 w-full p-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-sm resize-none"
            rows={2}
          />
        </details>
      </div>
      
      <button 
        type="button" 
        onClick={() => setShowConfirmModal(true)}
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-on-primary-fixed text-on-primary font-label-sm text-label-sm py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
      >
        <MaterialIcon icon="payments" className="text-[18px]" />
        Confirm Payment
      </button>

      {showConfirmModal && (
        <ConfirmPaymentModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmPayment}
          amount={paymentAmount}
          currency={finalCurrency}
          currencySymbol={finalCurrencySymbol}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
}
