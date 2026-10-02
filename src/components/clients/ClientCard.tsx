import Link from 'next/link';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { CurrencySummary } from '@/app/actions/clientActions';

interface ClientCardProps {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  invoiceCount?: number;
  currencies?: Record<string, CurrencySummary> | null;
}

export function ClientCard({
  id,
  name,
  phone = '',
  address = '',
  invoiceCount = 0,
  currencies = {}
}: Readonly<ClientCardProps>) {
  const safeCurrencies = currencies || {};
  const currencyList = Object.values(safeCurrencies);
  const safePhone = phone || '';
  const safeAddress = address || '';
  const safeName = name || 'Unnamed Client';
  const safeId = id || '';

  const createInvoiceUrl = `/create?clientId=${encodeURIComponent(safeId)}&clientName=${encodeURIComponent(safeName)}${safePhone ? `&clientPhone=${encodeURIComponent(safePhone)}` : ''}${safeAddress ? `&clientAddress=${encodeURIComponent(safeAddress)}` : ''}`;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant shadow-[0_4px_12px_rgba(26,43,60,0.03)] hover:shadow-[0_8px_24px_rgba(26,43,60,0.08)] flex flex-col gap-md transition-all duration-300 hover:-translate-y-1 h-full">
      
      {/* Clickable Card Body linking to Client Details */}
      <Link href={`/clients/${encodeURIComponent(safeId)}`} className="block group flex-1 flex flex-col gap-md focus:outline-none">
        {/* Header: Name and Badge */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-xs">
            <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">
              {safeName}
            </h3>
            {safePhone && (
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <MaterialIcon icon="call" className="text-[16px]" />
                <span className="font-body-md text-body-md">{safePhone}</span>
              </div>
            )}
          </div>
          <div className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full flex items-center gap-1">
            <MaterialIcon icon="receipt_long" className="text-[14px]" />
            <span className="font-label-sm text-label-sm font-semibold">{invoiceCount}</span>
          </div>
        </div>

        <div className="h-px w-full bg-surface-variant mt-auto"></div>

        {/* Financial Summary per currency */}
        <div className="flex flex-col gap-md">
          {currencyList.map((cur) => {
            const totalBilled = Number(cur.totalBilled) || 0;
            const totalPaid = Number(cur.totalPaid) || 0;
            const totalOutstanding = Number(cur.totalOutstanding) || 0;
            const paidPercentage = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0;
            const resolvedCurrency = cur.currency || 'USD';
            const resolvedCurrencySymbol = cur.currencySymbol || (() => {
              try {
                const parts = new Intl.NumberFormat('en', { style: 'currency', currency: resolvedCurrency, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
                return parts.find(p => p.type === 'currency')?.value || resolvedCurrency;
              } catch {
                return resolvedCurrency;
              }
            })();

            return (
              <div key={cur.currency} className="flex flex-col gap-sm">
                {currencyList.length > 1 && (
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">{cur.currency}</span>
                )}
                <div className="grid grid-cols-2 gap-md">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Total Billed</span>
                    <CurrencyDisplay amount={totalBilled} currency={resolvedCurrency} currencySymbol={resolvedCurrencySymbol} className="font-title-md text-title-md text-on-surface font-medium" />
                  </div>
                  <div className="flex flex-col gap-0.5 items-end">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Outstanding</span>
                    <CurrencyDisplay amount={totalOutstanding} currency={resolvedCurrency} currencySymbol={resolvedCurrencySymbol} className={`font-title-md text-title-md font-medium ${totalOutstanding > 0 ? 'text-error' : 'text-primary'}`} />
                  </div>
                </div>

                {totalBilled > 0 && (
                  <div className="flex flex-col gap-xs">
                    <div className="flex justify-between items-center text-xs text-on-surface-variant font-medium">
                      <span>Amount Paid</span>
                      <span>{Math.round(paidPercentage)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, paidPercentage))}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {currencyList.length === 0 && (
             <div className="text-on-surface-variant font-body-sm italic">No billing data.</div>
          )}
        </div>
      </Link>

      {/* Create Invoice CTA - Sibling to detail link, NO nested <a> tags */}
      <div className="h-px w-full bg-surface-variant"></div>
      <Link
        href={createInvoiceUrl}
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-primary/8 hover:bg-primary/15 text-primary font-label-md text-label-md transition-colors active:scale-95"
      >
        <MaterialIcon icon="add_circle" className="text-[18px]" />
        Create Invoice
      </Link>

    </div>
  );
}
