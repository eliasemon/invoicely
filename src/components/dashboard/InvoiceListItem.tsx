import { StatusBadge, StatusType } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';

interface InvoiceListItemProps {
  id: string;
  clientName: string;
  clientInitials: string;
  amount: number;
  status: string;
  currency?: string | null;
  currencySymbol?: string | null;
}

export function InvoiceListItem({ id, clientName, clientInitials, amount, status, currency, currencySymbol }: Readonly<InvoiceListItemProps>) {
  return (
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
    </div>
  );
}
