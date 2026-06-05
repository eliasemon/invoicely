import { getClients } from '@/app/actions/clientActions';
import { getProfile } from '@/app/actions/profileActions';
import { ClientCard } from '@/components/clients/ClientCard';

export const metadata = {
  title: 'Clients | Invoicely',
};

export default async function ClientsPage() {
  const clients = await getClients();
  
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
    <div className="flex-1 flex flex-col gap-lg w-full max-w-5xl mx-auto">
      <div className="flex flex-col gap-xs">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">Your Clients</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">An overview of your client history and balances.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {clients.map((client) => (
          <ClientCard 
            key={client.id}
            id={client.id}
            name={client.name}
            phone={client.phone}
            invoiceCount={client.invoiceCount}
            currencies={client.currencies}
          />
        ))}
      </div>
      
      {clients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-sm text-center">
          <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[32px]">group</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">No Clients Yet</h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Your client list will automatically populate as you create invoices. Go ahead and create your first invoice!
          </p>
        </div>
      )}
    </div>
  );
}
