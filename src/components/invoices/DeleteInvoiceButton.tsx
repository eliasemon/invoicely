'use client';
import { useState } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { deleteInvoice } from '@/app/actions/invoiceActions';
import { useRouter } from 'next/navigation';

interface DeleteInvoiceButtonProps {
  invoiceId: string;
  className?: string;
  iconOnly?: boolean;
}

export function DeleteInvoiceButton({ invoiceId, className = '', iconOnly = false }: Readonly<DeleteInvoiceButtonProps>) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleTrigger = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteInvoice(invoiceId);
      setShowModal(false);
      router.refresh();
      // If we are on the invoice detail page, redirect to dashboard
      if (window.location.pathname.includes(`/invoices/${invoiceId}`)) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      alert('Failed to delete invoice.');
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
        className={`text-error hover:bg-error-container/20 transition-colors flex items-center gap-2 disabled:opacity-50 ${className}`}
        title="Delete Invoice"
      >
        <MaterialIcon icon="delete" className={iconOnly ? "text-[20px]" : "text-[18px]"} />
        {!iconOnly && <span>Delete</span>}
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
                <MaterialIcon icon="delete_forever" className="text-[24px]" />
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Delete Invoice</h3>
              <p className="font-body-md text-on-surface-variant mb-4">
                Are you sure you want to delete this invoice? This action cannot be undone.
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
                      Deleting...
                    </>
                  ) : (
                    'Delete'
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
