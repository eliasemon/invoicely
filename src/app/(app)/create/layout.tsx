import { CreateInvoiceProvider } from '@/core/contexts/CreateInvoiceContext';
import { getProfile } from '@/app/actions/profileActions';

export default async function CreateLayout({ children }: { children: React.ReactNode }) {
  let initialCurrency = 'USD';
  let initialCurrencySymbol: string | undefined = undefined;

  try {
    const profile = await getProfile();
    if (profile) {
      initialCurrency = profile.default_currency || 'USD';
      initialCurrencySymbol = profile.currency_symbol || undefined;
    }
  } catch (e) {
    // ignore
  }

  return (
    <CreateInvoiceProvider initialCurrency={initialCurrency} initialCurrencySymbol={initialCurrencySymbol}>
      {children}
    </CreateInvoiceProvider>
  );
}
