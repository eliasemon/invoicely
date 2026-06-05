'use client';

import { useState } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { CurrencySummary } from '@/app/actions/clientActions';
import { EditClientDialog } from '@/components/clients/EditClientDialog';
import Link from 'next/link';

interface ClientHeaderProps {
  id: string;
  name: string;
  phone: string;
  address: string;
  invoiceCount: number;
  currencies: Record<string, CurrencySummary>;
}

export function ClientHeader({
  id,
  name,
  phone,
  address,
  invoiceCount,
  currencies
}: Readonly<ClientHeaderProps>) {
  const [isEditing, setIsEditing] = useState(false);
  
  const currencyList = Object.values(currencies);

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-lg md:p-xl border border-outline-variant shadow-sm flex flex-col gap-lg mb-lg">
      
      {/* Top Bar: Back button and Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/clients" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors">
            <MaterialIcon icon="arrow_back" />
          </Link>
          <div className="flex flex-col">
            <h1 className="font-display-sm text-display-sm md:font-display-md md:text-display-md text-primary">{name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full flex items-center gap-2">
            <MaterialIcon icon="receipt_long" className="text-[18px]" />
            <span className="font-label-lg text-label-lg font-semibold">{invoiceCount} Invoices</span>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-variant text-primary px-4 py-2 rounded-full transition-colors font-label-lg font-semibold shadow-sm"
          >
            <MaterialIcon icon="edit" className="text-[18px]" />
            Edit
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-surface-variant"></div>

      {/* Details & Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        
        {/* Contact Info */}
        <div className="flex flex-col gap-md">
          <h3 className="font-title-md text-title-md text-on-surface">Contact Information</h3>
          <div className="flex flex-col gap-3">
            {phone ? (
              <div className="flex items-center gap-3 text-on-surface-variant">
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                  <MaterialIcon icon="call" className="text-[16px]" />
                </div>
                <span className="font-body-lg text-body-lg">{phone}</span>
              </div>
            ) : (
              <div className="text-on-surface-variant font-body-md italic">No phone number recorded.</div>
            )}
            
            {address ? (
              <div className="flex items-center gap-3 text-on-surface-variant">
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                  <MaterialIcon icon="location_on" className="text-[16px]" />
                </div>
                <span className="font-body-lg text-body-lg break-words">{address}</span>
              </div>
            ) : (
              <div className="text-on-surface-variant font-body-md italic">No address recorded.</div>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="flex flex-col gap-md">
          <h3 className="font-title-md text-title-md text-on-surface">Financial Overview</h3>
          
          <div className="flex flex-col gap-sm">
            {currencyList.map((cur) => {
              const paidPercentage = cur.totalBilled > 0 ? (cur.totalPaid / cur.totalBilled) * 100 : 0;
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
                <div key={cur.currency} className="flex flex-col gap-md bg-surface-container-low p-md rounded-2xl border border-outline-variant/50">
                  {currencyList.length > 1 && (
                    <span className="font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider">{cur.currency} Summary</span>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Total Billed</span>
                      <CurrencyDisplay amount={cur.totalBilled} currency={resolvedCurrency} currencySymbol={resolvedCurrencySymbol} className="font-headline-sm text-headline-sm text-on-surface" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Outstanding</span>
                      <CurrencyDisplay amount={cur.totalOutstanding} currency={resolvedCurrency} currencySymbol={resolvedCurrencySymbol} className={`font-headline-sm text-headline-sm ${cur.totalOutstanding > 0 ? 'text-error' : 'text-primary'}`} />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {cur.totalBilled > 0 && (
                    <div className="flex flex-col gap-xs mt-xs">
                      <div className="flex justify-between items-center text-sm text-on-surface-variant font-medium">
                        <span>Amount Paid</span>
                        <span>{Math.round(paidPercentage)}%</span>
                      </div>
                      <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(100, Math.max(0, paidPercentage))}%` }}
                        ></div>
                      </div>
                      <div className="text-right mt-1">
                        <CurrencyDisplay amount={cur.totalPaid} currency={resolvedCurrency} currencySymbol={resolvedCurrencySymbol} className="font-label-md text-label-md text-on-surface-variant font-medium" />
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
        </div>

      </div>

      {isEditing && (
        <EditClientDialog 
          id={id}
          name={name}
          phone={phone}
          address={address}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
