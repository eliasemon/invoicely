'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { GroupData } from '@/components/create/LineItemGroup';
import { useProfile } from '@/hooks/useProfile';
import { saveDraftInvoice } from '@/app/actions/invoiceActions';

interface CreateInvoiceContextType {
  draftInvoiceId: string | null;
  setDraftInvoiceId: (id: string | null) => void;
  invoiceStatus: string;
  setInvoiceStatus: (status: string) => void;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;
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
  subjectEnabled: boolean;
  setSubjectEnabled: (enabled: boolean) => void;
  subjectInvoice: string;
  setSubjectInvoice: (val: string) => void;
  subjectChallan: string;
  setSubjectChallan: (val: string) => void;
  subjectQuotation: string;
  setSubjectQuotation: (val: string) => void;
  invoiceModeEnabled: boolean;
  setInvoiceModeEnabled: (enabled: boolean) => void;
  challanModeEnabled: boolean;
  setChallanModeEnabled: (enabled: boolean) => void;
  quotationModeEnabled: boolean;
  setQuotationModeEnabled: (enabled: boolean) => void;
  noteEnabled: boolean;
  setNoteEnabled: (enabled: boolean) => void;
  noteText: string;
  setNoteText: (text: string) => void;
}

const CreateInvoiceContext = createContext<CreateInvoiceContextType | undefined>(undefined);

export function CreateInvoiceProvider({ children, initialCurrency, initialCurrencySymbol }: { children: ReactNode, initialCurrency?: string, initialCurrencySymbol?: string }) {
  const { profile } = useProfile();
  const [draftInvoiceId, setDraftInvoiceId] = useState<string | null>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<string>('DRAFT');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
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
  const [subjectEnabled, setSubjectEnabled] = useState(true);
  const [subjectInvoice, setSubjectInvoice] = useState('Bill for Items/Services');
  const [subjectChallan, setSubjectChallan] = useState('Delivery Challan for Items/Services');
  const [subjectQuotation, setSubjectQuotation] = useState('Quotation for Items/Services');
  const [invoiceModeEnabled, setInvoiceModeEnabled] = useState(true);
  const [challanModeEnabled, setChallanModeEnabled] = useState(true);
  const [quotationModeEnabled, setQuotationModeEnabled] = useState(true);
  const [noteEnabled, setNoteEnabled] = useState(true);
  const [noteText, setNoteText] = useState('Thank you for your business. Please make payment within the due date.');

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
  const isSavingRef = useRef(false);
  const latestDataRef = useRef<any>(null);

  // Sync state to ref to use in useEffect without infinite loops
  useEffect(() => {
    draftIdRef.current = draftInvoiceId;
  }, [draftInvoiceId]);

  // Keep latest data in ref for queued saves
  latestDataRef.current = {
    clientId,
    clientName,
    mobileNumber,
    clientAddress,
    groups,
    selectedTemplate,
    discountType,
    discountValue,
    shippingCost,
    issuedAt,
    dueDate,
    subjectEnabled,
    subjectInvoice,
    subjectChallan,
    subjectQuotation,
    invoiceModeEnabled,
    challanModeEnabled,
    quotationModeEnabled,
    noteEnabled,
    noteText,
    invoiceStatus
  };

  const triggerSave = async () => {
    if (isSavingRef.current) return;
    const data = latestDataRef.current;
    if (!data) return;

    // Only auto-save DRAFT invoices
    if (data.invoiceStatus && data.invoiceStatus !== 'DRAFT') return;

    // Check if there is anything to save
    const hasClientName = data.clientName.trim().length > 0;
    const hasItems = data.groups.some((g: GroupData) => g.items.length > 0);
    if (!hasClientName && !hasItems) return;

    isSavingRef.current = true;
    setAutoSaveStatus('saving');

    try {
      const invoice = await saveDraftInvoice({
        invoiceId: draftIdRef.current || undefined,
        clientId: data.clientId,
        clientName: data.clientName,
        clientPhone: data.mobileNumber,
        clientAddress: data.clientAddress,
        groups: data.groups,
        discountType: data.discountType,
        discountValue: data.discountValue,
        shippingCost: data.shippingCost,
        issuedAt: data.issuedAt || undefined,
        dueDate: data.dueDate || undefined,
        subjectEnabled: data.subjectEnabled,
        subjectInvoice: data.subjectInvoice,
        subjectChallan: data.subjectChallan,
        subjectQuotation: data.subjectQuotation,
        invoiceModeEnabled: data.invoiceModeEnabled,
        challanModeEnabled: data.challanModeEnabled,
        quotationModeEnabled: data.quotationModeEnabled,
        noteEnabled: data.noteEnabled,
        noteText: data.noteText,
        template: data.selectedTemplate,
      });

      if (invoice?.id) {
        if (!draftIdRef.current) {
          draftIdRef.current = invoice.id;
          setDraftInvoiceId(invoice.id);
          // Sync URL without page reload so refreshing maintains the draft
          if (typeof window !== 'undefined' && !window.location.search.includes('id=')) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('id', invoice.id);
            window.history.replaceState(null, '', newUrl.toString());
          }
        }
      }
      setAutoSaveStatus('saved');
      setLastSavedAt(new Date());
    } catch (err) {
      console.error('Auto-save failed:', err);
      setAutoSaveStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      triggerSave();
    }, 1500);

    return () => clearTimeout(timer);
  }, [clientId, clientName, mobileNumber, clientAddress, groups, selectedTemplate, discountType, discountValue, shippingCost, issuedAt, dueDate, subjectEnabled, subjectInvoice, subjectChallan, subjectQuotation, invoiceModeEnabled, challanModeEnabled, quotationModeEnabled, noteEnabled, noteText]);

  return (
    <CreateInvoiceContext.Provider value={{
      draftInvoiceId, setDraftInvoiceId,
      invoiceStatus, setInvoiceStatus,
      autoSaveStatus,
      lastSavedAt,
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
      dueDate, setDueDate,
      subjectEnabled, setSubjectEnabled,
      subjectInvoice, setSubjectInvoice,
      subjectChallan, setSubjectChallan,
      subjectQuotation, setSubjectQuotation,
      invoiceModeEnabled, setInvoiceModeEnabled,
      challanModeEnabled, setChallanModeEnabled,
      quotationModeEnabled, setQuotationModeEnabled,
      noteEnabled, setNoteEnabled,
      noteText, setNoteText,
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
