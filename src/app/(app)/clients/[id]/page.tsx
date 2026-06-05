import { SearchBar } from '@/components/invoices/SearchBar';
import { FilterChips } from '@/components/invoices/FilterChips';
import { InvoiceCard } from '@/components/invoices/InvoiceCard';
import { StatusType } from '@/components/shared/StatusBadge';
import { getInvoices } from '@/app/actions/invoiceActions';
import { getClientSummary } from '@/app/actions/clientActions';
import { getProfile } from '@/app/actions/profileActions';
import { ClientHeader } from '@/components/clients/ClientHeader';
import dayjs from 'dayjs';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const clientId = resolvedParams.id;
  const clientSummary = await getClientSummary(clientId);
  
  return {
    title: `${clientSummary?.name || 'Client'} | Invoicely Clients`,
  };
}

export default async function ClientDetailsPage(
  props: {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{
      search?: string;
      status?: string;
    }>;
  }
) {
  const resolvedParams = await props.params;
  const clientId = resolvedParams.id;
  const searchParams = await props.searchParams;
  
  const [clientSummary, allInvoices] = await Promise.all([
    getClientSummary(clientId),
    getInvoices({
      clientId: clientId,
      search: searchParams?.search,
      status: searchParams?.status,
    })
  ]);

  if (!clientSummary) {
    notFound();
  }

  let defaultCurrency = 'USD';
  let defaultCurrencySymbol: string | undefined = undefined;
  try {
    const profile = await getProfile();
    if (profile) {
      defaultCurrency = profile.default_currency || 'USD';
      defaultCurrencySymbol = profile.currency_symbol || undefined;
    }
  } catch (e) {
    // Ignore error
  }

  return (
    <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto">
      <ClientHeader 
        id={clientSummary.id}
        name={clientSummary.name}
        phone={clientSummary.phone}
        address={clientSummary.address}
        invoiceCount={clientSummary.invoiceCount}
        currencies={clientSummary.currencies}
      />

      <div className="flex flex-col gap-md">
        <div className="flex flex-col gap-xs mt-4">
          <h2 className="font-headline-sm text-headline-sm text-primary">Invoices</h2>
        </div>

        <SearchBar />
        <FilterChips />

        <div className="flex flex-col gap-sm mt-2">
          {allInvoices.map((invoice, idx) => (
            <InvoiceCard 
              key={`${invoice.id}-${idx}`}
              invoiceId={invoice.id}
              id={invoice.invoice_number}
              clientName={invoice.client_name}
              amount={invoice.total_amount}
              status={invoice.status as StatusType}
              date={dayjs(invoice.created_at).format('MMM D, YYYY')}
              phone={invoice.client_phone || 'N/A'}
              currency={invoice.currency || defaultCurrency}
              currencySymbol={invoice.currency_symbol || defaultCurrencySymbol}
              amountPaid={invoice.amount_paid}
            />
          ))}
          
          {allInvoices.length === 0 && (
            <div className="text-center py-xl text-on-surface-variant font-body-lg">
              No invoices found for this client matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
