'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { GroupData } from '@/components/create/LineItemGroup';
import { useProfile } from '@/hooks/useProfile';

interface CreateInvoiceContextType {
  clientName: string;
  setClientName: (name: string) => void;
  mobileNumber: string;
  setMobileNumber: (num: string) => void;
  clientAddress: string;
  setClientAddress: (address: string) => void;
  groups: GroupData[];
  setGroups: (groups: GroupData[]) => void;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  currency: string;
  currencySymbol: string;
}

const CreateInvoiceContext = createContext<CreateInvoiceContextType | undefined>(undefined);

export function CreateInvoiceProvider({ children, initialCurrency, initialCurrencySymbol }: { children: ReactNode, initialCurrency?: string, initialCurrencySymbol?: string }) {
  const { profile } = useProfile();
  const [clientName, setClientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [groups, setGroups] = useState<GroupData[]>([{
    id: 'g1',
    name: 'New Group',
    items: []
  }]);
  const [selectedTemplate, setSelectedTemplate] = useState('minimal');

  const currency = profile?.default_currency || initialCurrency || 'USD';
  const currencySymbol = profile?.currency_symbol || initialCurrencySymbol || (() => {
    try {
      const parts = new Intl.NumberFormat('en', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
      return parts.find(p => p.type === 'currency')?.value || currency;
    } catch {
      return currency;
    }
  })();

  return (
    <CreateInvoiceContext.Provider value={{
      clientName, setClientName,
      mobileNumber, setMobileNumber,
      clientAddress, setClientAddress,
      groups, setGroups,
      selectedTemplate, setSelectedTemplate,
      currency, currencySymbol
    }}>
      {children}
    </CreateInvoiceContext.Provider>
  );
}

export function useCreateInvoice() {
  const context = useContext(CreateInvoiceContext);
  if (context === undefined) {
    throw new Error('useCreateInvoice must be used within a CreateInvoiceProvider');
  }
  return context;
}
