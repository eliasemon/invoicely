import { SearchBar } from '@/components/invoices/SearchBar';
import { FilterChips } from '@/components/invoices/FilterChips';
import { InvoiceCard } from '@/components/invoices/InvoiceCard';
import { StatusType } from '@/components/shared/StatusBadge';
import { getInvoices } from '@/app/actions/invoiceActions';
import { getProfile } from '@/app/actions/profileActions';
import dayjs from 'dayjs';

export default async function InvoicesPage() {
  const allInvoices = await getInvoices();
  
  let defaultCurrency = 'USD';
  let defaultCurrencySymbol: string | undefined = undefined;
  try {
    const profile = await getProfile();
    if (profile) {
      defaultCurrency = profile.default_currency || 'USD';
      defaultCurrencySymbol = profile.currency_symbol || undefined;
    }
  } catch (e) {
    // Ignore error if profile not found or not authenticated
  }

  return (
    <div className="flex-1 flex flex-col gap-md w-full max-w-2xl mx-auto">
      {/* Search Input Header */}
      <div className="flex flex-col gap-xs">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">Search Invoices</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Find by name, mobile, or invoice number.</p>
      </div>

      <SearchBar />
      <FilterChips />

      <div className="flex flex-col gap-sm mt-2">
        {allInvoices.map((invoice, idx) => (
          <InvoiceCard 
            key={`${invoice.id}-${idx}`}
            id={invoice.invoice_number}
            clientName={invoice.client_name}
            amount={invoice.total_amount}
            status={invoice.status as StatusType}
            date={dayjs(invoice.created_at).format('MMM D, YYYY')}
            phone={invoice.client_phone || 'N/A'}
            currency={invoice.currency || defaultCurrency}
            currencySymbol={invoice.currency_symbol || defaultCurrencySymbol}
          />
        ))}
        
        {allInvoices.length === 0 && (
          <div className="text-center py-xl text-on-surface-variant font-body-lg">
            No invoices found. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
}
