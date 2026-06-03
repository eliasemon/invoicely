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
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this draft invoice?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteInvoice(invoiceId);
      router.refresh();
      // If we are on the invoice detail page, redirect to dashboard
      if (window.location.pathname.includes(`/invoices/${invoiceId}`)) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      alert('Failed to delete invoice.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className={`text-error hover:bg-error-container/20 transition-colors flex items-center gap-2 disabled:opacity-50 ${className}`}
      title="Delete Draft"
    >
      <MaterialIcon icon="delete" className={iconOnly ? "text-[20px]" : "text-[18px]"} />
      {!iconOnly && <span>Delete</span>}
    </button>
  );
}
