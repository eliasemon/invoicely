'use client';

import { useState } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { deletePayment } from '@/app/actions/invoiceActions';
import { useRouter } from 'next/navigation';

export function DeletePaymentButton({ invoiceId, paymentLogId }: { invoiceId: string, paymentLogId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleTrigger = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deletePayment(invoiceId, paymentLogId);
      setShowModal(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete payment:', error);
      alert('Failed to delete payment.');
      setShowModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleTrigger}
        disabled={isDeleting}
        className="text-error hover:bg-error-container/20 p-2 rounded-full transition-colors active:scale-95 flex items-center justify-center disabled:opacity-50"
        title="Delete Payment"
        aria-label="Delete Payment"
      >
        <MaterialIcon icon="delete" className="text-[20px]" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="absolute inset-0" 
            onClick={!isDeleting ? () => setShowModal(false) : undefined} 
            aria-hidden="true" 
          />
          <div className="relative bg-surface rounded-3xl shadow-2xl w-[95vw] sm:w-[400px] md:w-[450px] overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="w-12 h-12 bg-error-container text-on-error-container rounded-full flex items-center justify-center mb-sm">
                <MaterialIcon icon="assignment_return" className="text-[24px]" />
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Reverse Payment</h3>
              <p className="font-body-md text-on-surface-variant mb-4">
                Are you sure you want to reverse this payment? This will create a contra entry.
              </p>
              
              <div className="flex gap-sm justify-end mt-lg">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 font-label-md text-primary hover:bg-surface-container-low rounded-full transition-colors active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 font-label-md bg-error text-on-error hover:bg-error/90 rounded-full transition-colors active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <MaterialIcon icon="sync" className="animate-spin text-[18px]" />
                      Reversing...
                    </>
                  ) : (
                    'Reverse'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
