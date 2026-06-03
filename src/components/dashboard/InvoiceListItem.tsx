import { StatusBadge, StatusType } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import Link from 'next/link';
import { DeleteInvoiceButton } from '@/components/invoices/DeleteInvoiceButton';

interface InvoiceListItemProps {
  invoiceId: string;
  id: string;
  clientName: string;
  clientInitials: string;
  amount: number;
  status: string;
  currency?: string | null;
  currencySymbol?: string | null;
}

export function InvoiceListItem({ invoiceId, id, clientName, clientInitials, amount, status, currency, currencySymbol }: Readonly<InvoiceListItemProps>) {
  return (
    <Link href={status === 'DRAFT' ? `/create?id=${invoiceId}` : `/invoices/${invoiceId}`} className="block">
      <div className="p-md border-b border-outline-variant flex justify-between items-center hover:bg-surface-container-low transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold text-sm">
            {clientInitials}
          </div>
          <div>
            <div className="font-label-sm text-label-sm font-semibold text-on-surface">{clientName}</div>
            <div className="font-body-md text-body-md text-on-surface-variant">#{id}</div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <CurrencyDisplay amount={amount} currency={currency || undefined} currencySymbol={currencySymbol || undefined} className="font-label-sm text-label-sm font-semibold text-on-surface" />
          <StatusBadge status={status as StatusType} className="mt-1" />
        </div>
        {status === 'DRAFT' && (
          <div className="ml-4 flex items-center justify-center h-full">
            <DeleteInvoiceButton 
              invoiceId={invoiceId} 
              iconOnly={true} 
              className="p-2 rounded-full" 
            />
          </div>
        )}
      </div>
    </Link>
  );
}
