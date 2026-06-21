'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { GroupData } from '@/components/create/LineItemGroup';
import { useProfile } from '@/hooks/useProfile';
import { saveDraftInvoice } from '@/app/actions/invoiceActions';

interface CreateInvoiceContextType {
  draftInvoiceId: string | null;
  setDraftInvoiceId: (id: string | null) => void;
  clientId: string | undefined;
  setClientId: (id: string | undefined) => void;
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
  discountType: 'amount' | 'percentage';
  setDiscountType: (type: 'amount' | 'percentage') => void;
  discountValue: number;
  setDiscountValue: (value: number) => void;
  shippingCost: number;
  setShippingCost: (cost: number) => void;
  currency: string;
  currencySymbol: string;
  amountPaid: number;
  setAmountPaid: (val: number) => void;
  issuedAt: string;
  setIssuedAt: (val: string) => void;
  dueDate: string;
  setDueDate: (val: string) => void;
}

const CreateInvoiceContext = createContext<CreateInvoiceContextType | undefined>(undefined);

export function CreateInvoiceProvider({ children, initialCurrency, initialCurrencySymbol }: { children: ReactNode, initialCurrency?: string, initialCurrencySymbol?: string }) {
  const { profile } = useProfile();
  const [draftInvoiceId, setDraftInvoiceId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [clientName, setClientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [groups, setGroups] = useState<GroupData[]>([{
    id: 'g1',
    name: 'New Group',
    items: []
  }]);
  const [selectedTemplate, setSelectedTemplate] = useState('corporate-template');
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [discountValue, setDiscountValue] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [issuedAt, setIssuedAt] = useState('');
  const [dueDate, setDueDate] = useState('');

  const currency = profile?.default_currency || initialCurrency || 'USD';
  const currencySymbol = profile?.currency_symbol || initialCurrencySymbol || (() => {
    try {
      const parts = new Intl.NumberFormat('en', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
      return parts.find(p => p.type === 'currency')?.value || currency;
    } catch {
      return currency;
    }
  })();

  const isInitialMount = useRef(true);
  const draftIdRef = useRef<string | null>(null);

  // Sync state to ref to use in useEffect without infinite loops
  useEffect(() => {
    draftIdRef.current = draftInvoiceId;
  }, [draftInvoiceId]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const hasItems = groups.some(g => g.items.length > 0);
    if (!hasItems) return; // Only auto-save if an item has been put on the invoice

    const timer = setTimeout(async () => {
      try {
        const invoice = await saveDraftInvoice({
          invoiceId: draftIdRef.current || undefined,
          clientId,
          clientName,
          clientPhone: mobileNumber,
          clientAddress,
          template: selectedTemplate,
          groups,
          discountType,
          discountValue,
          shippingCost,
          issuedAt: issuedAt || undefined,
          dueDate: dueDate || undefined
        });
        
        if (!draftIdRef.current && invoice?.id) {
          setDraftInvoiceId(invoice.id);
        }
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [clientId, clientName, mobileNumber, clientAddress, groups, selectedTemplate, discountType, discountValue, shippingCost, issuedAt, dueDate]);

  return (
    <CreateInvoiceContext.Provider value={{
      draftInvoiceId, setDraftInvoiceId,
      clientId, setClientId,
      clientName, setClientName,
      mobileNumber, setMobileNumber,
      clientAddress, setClientAddress,
      groups, setGroups,
      selectedTemplate, setSelectedTemplate,
      discountType, setDiscountType,
      discountValue, setDiscountValue,
      shippingCost, setShippingCost,
      currency, currencySymbol,
      amountPaid, setAmountPaid,
      issuedAt, setIssuedAt,
      dueDate, setDueDate
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
