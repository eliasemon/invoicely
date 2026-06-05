import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { InvoiceListItem } from '@/components/dashboard/InvoiceListItem';
import { getInvoices } from '@/app/actions/invoiceActions';
import { getProfile } from '@/app/actions/profileActions';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { SearchBar } from '@/components/invoices/SearchBar';
import Link from 'next/link';
import dayjs from 'dayjs';
import { StatusType } from '@/components/shared/StatusBadge';

interface CurrencyStats {
  total: number;
  unpaid: number;
  unpaidCount: number;
  paid: number;
  paidCount: number;
}

export default async function DashboardPage(
  props: {
    searchParams?: Promise<{ search?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const allInvoices = await getInvoices({ search: searchParams?.search });
  
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
  
  // Group stats by currency
  const statsByCurrency = new Map<string, CurrencyStats>();

  allInvoices.forEach(inv => {
    const cur = inv.currency || defaultCurrency;
    const existing = statsByCurrency.get(cur) || { total: 0, unpaid: 0, unpaidCount: 0, paid: 0, paidCount: 0 };
    const amt = Number(inv.total_amount);
    existing.total += amt;
    if (inv.status === 'PAID') {
      existing.paid += amt;
      existing.paidCount++;
    } else {
      existing.unpaid += amt;
      existing.unpaidCount++;
    }
    statsByCurrency.set(cur, existing);
  });

  // Convert to sorted array (primary currency first — the one with most invoices)
  const currencyEntries = Array.from(statsByCurrency.entries())
    .sort((a, b) => (b[1].paidCount + b[1].unpaidCount) - (a[1].paidCount + a[1].unpaidCount));

  const recentInvoices = allInvoices.slice(0, 5).map(inv => ({
    invoiceId: inv.id,
    id: inv.invoice_number,
    clientName: inv.client_name,
    clientInitials: inv.client_name.substring(0, 2).toUpperCase(),
    amount: inv.total_amount,
    status: inv.status as StatusType,
    date: dayjs(inv.created_at).format('MMM D, YYYY'),
    phone: inv.client_phone || 'N/A',
    currency: inv.currency || defaultCurrency,
    currencySymbol: inv.currency_symbol || defaultCurrencySymbol
  }));

  return (
    <>
      {/* Search Section */}
      <section className="w-full">
        <SearchBar placeholder="Search invoices by ID, name, or phone..." />
      </section>

      {/* Summary Cards - grouped by currency */}
      <details className="w-full group" open>
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between mb-md focus:outline-none">
          <h2 className="font-headline-md text-headline-md text-primary font-bold">Summary Details</h2>
          <MaterialIcon icon="expand_more" className="text-on-surface-variant transition-transform group-open:rotate-180" />
        </summary>
        
        <div className="space-y-md">
          {currencyEntries.map(([cur, stats]) => (
            <section key={cur} className="space-y-xs">
              {currencyEntries.length > 1 && (
                <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider px-1">{cur} Summary</h3>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
                <SummaryCard 
                  title="Total Revenue"
                  amount={<CurrencyDisplay amount={stats.total} currency={cur} />}
                  subtitle=""
                  trend="+0% from last month"
                  type="total"
                />
                <SummaryCard 
                  title="Unpaid"
                  amount={<CurrencyDisplay amount={stats.unpaid} currency={cur} />}
                  subtitle={`${stats.unpaidCount} Invoices`}
                  type="unpaid"
                />
                <SummaryCard 
                  title="Paid"
                  amount={<CurrencyDisplay amount={stats.paid} currency={cur} />}
                  subtitle={`${stats.paidCount} Invoices`}
                  type="paid"
                />
              </div>
            </section>
          ))}

          {currencyEntries.length === 0 && (
            <section className="grid grid-cols-2 md:grid-cols-4 gap-sm">
              <SummaryCard 
                title="Total Revenue"
                amount={<CurrencyDisplay amount={0} currency={defaultCurrency} currencySymbol={defaultCurrencySymbol} />}
                subtitle=""
                trend="+0% from last month"
                type="total"
              />
              <SummaryCard 
                title="Unpaid"
                amount={<CurrencyDisplay amount={0} currency={defaultCurrency} currencySymbol={defaultCurrencySymbol} />}
                subtitle="0 Invoices"
                type="unpaid"
              />
              <SummaryCard 
                title="Paid"
                amount={<CurrencyDisplay amount={0} currency={defaultCurrency} currencySymbol={defaultCurrencySymbol} />}
                subtitle="0 Invoices"
                type="paid"
              />
            </section>
          )}
        </div>
      </details>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Invoices */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_4px_12px_rgba(26,43,60,0.05)] overflow-hidden">
        <div className="p-md border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-headline-md text-headline-md text-primary font-bold">Recent Invoices</h3>
          <Link href="/invoices" className="font-label-sm text-label-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        <div className="flex flex-col">
          {recentInvoices.map((invoice) => (
            <InvoiceListItem 
              key={invoice.id}
              {...invoice}
            />
          ))}
          {recentInvoices.length === 0 && (
            <div className="text-center py-8 text-on-surface-variant font-body-sm">
              No recent invoices found.
            </div>
          )}
        </div>
      </section>
    </>
  );
}

