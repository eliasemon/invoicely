'use client';
import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge, StatusType } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { DeleteInvoiceButton } from '@/components/invoices/DeleteInvoiceButton';

interface InvoiceCardProps {
  invoiceId: string;
  id: string;
  clientName: string;
  amount: number;
  status: StatusType;
  date: string;
  phone: string;
  currency?: string | null;
  currencySymbol?: string | null;
  amountPaid?: number;
}

import { recordPayment } from '@/app/actions/invoiceActions';
import { useRouter } from 'next/navigation';

export function InvoiceCard({ invoiceId, id, clientName, amount, status, date, phone, currency, currencySymbol, amountPaid = 0 }: Readonly<InvoiceCardProps>) {
  const router = useRouter();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [paymentNote, setPaymentNote] = useState('');
  
  const remainingAmount = amount - amountPaid;
  const [paymentAmount, setPaymentAmount] = useState(remainingAmount > 0 ? remainingAmount : amount);

  const handleConfirmPayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) return;
    setIsSubmitting(true);
    try {
      await recordPayment(invoiceId, paymentAmount, paymentNote);
      setShowPaymentForm(false);
      setShowNotes(false);
      setPaymentNote('');
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolvedCurrency = currency || 'USD';
  const resolvedCurrencySymbol = currencySymbol || (() => {
    try {
      const parts = new Intl.NumberFormat('en', { style: 'currency', currency: resolvedCurrency, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
      return parts.find(p => p.type === 'currency')?.value || resolvedCurrency;
    } catch {
      return resolvedCurrency;
    }
  })();

  return (
    <Link href={status === 'DRAFT' ? `/create?id=${invoiceId}` : `/invoices/${invoiceId}`} className="block">
    <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-[0_4px_12px_rgba(26,43,60,0.05)] flex flex-col gap-sm hover:border-primary-fixed-dim transition-colors cursor-pointer">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="font-headline-md text-headline-md text-on-surface">{clientName}</span>
          <span className="font-body-md text-body-md text-on-surface-variant">#{id}</span>
        </div>
        <div className="flex items-center gap-2">
          {status === 'DRAFT' && (
            <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <DeleteInvoiceButton invoiceId={invoiceId} iconOnly={true} className="p-1.5 rounded-full" />
            </div>
          )}
          <StatusBadge status={status} />
        </div>
      </div>
      
      <div className="h-px w-full bg-surface-variant"></div>
      
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <MaterialIcon icon="call" className="text-[16px]" />
            <span className="font-body-md text-body-md">{phone}</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <MaterialIcon icon="calendar_today" className="text-[16px]" />
            <span className="font-label-sm text-label-sm">{date}</span>
          </div>
        </div>
        <CurrencyDisplay amount={amount} currency={resolvedCurrency} currencySymbol={resolvedCurrencySymbol} className="font-headline-md text-headline-md text-primary" />
      </div>

      {/* Show amount paid if partial */}
      {status === 'PARTIAL' && amountPaid > 0 && (
        <div className="flex justify-between items-center text-label-sm font-label-sm mt-xs">
          <span className="text-on-surface-variant">Amount Paid:</span>
          <CurrencyDisplay amount={amountPaid} currency={resolvedCurrency} currencySymbol={resolvedCurrencySymbol} className="text-primary font-semibold" />
        </div>
      )}

      {(status === 'UNPAID' || status === 'PARTIAL') && (
        <div className="flex flex-col gap-sm pt-xs">
          <div className="h-px w-full bg-surface-variant"></div>
          <div className="flex flex-col gap-sm">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPaymentForm(!showPaymentForm);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-outline text-primary font-label-sm hover:bg-surface-container-low transition-colors"
            >
              <MaterialIcon icon="payments" className="text-[18px]" />
              Record Payment
              <MaterialIcon 
                icon="expand_more" 
                className={`transition-transform duration-200 ml-auto ${showPaymentForm ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {showPaymentForm && (
              <div 
                className="flex flex-col gap-xs p-sm bg-surface-container-low rounded-xl border border-outline-variant"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                <label className="font-label-sm text-on-surface-variant">Amount to Pay</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-body-md">{resolvedCurrencySymbol}</span>
                    <input 
                      className="w-full h-10 pl-7 pr-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md" 
                      type="number" 
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    />
                  </div>
                  <button 
                    disabled={isSubmitting}
                    onClick={handleConfirmPayment}
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-sm shadow-sm active:opacity-90 disabled:opacity-70"
                  >
                    {isSubmitting ? 'Saving...' : 'Confirm'}
                  </button>
                </div>
                
                <div className="flex flex-col mt-2">
                  <button 
                    onClick={() => setShowNotes(!showNotes)}
                    className="flex items-center text-primary font-label-sm w-fit gap-1 hover:underline focus:outline-none"
                  >
                    <MaterialIcon icon={showNotes ? "expand_less" : "expand_more"} className="text-[16px]" />
                    {showNotes ? 'Hide Note' : 'Add Note (Optional)'}
                  </button>
                  {showNotes && (
                    <textarea
                      placeholder="Add comments or notes..."
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      className="mt-2 w-full p-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-sm resize-none"
                      rows={2}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </Link>
  );
}

