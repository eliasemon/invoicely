'use client';
import { CustomerDetails } from '@/components/create/CustomerDetails';
import { LineItemGroup } from '@/components/create/LineItemGroup';
import { AddActions } from '@/components/create/AddActions';
import { InvoiceDates } from '@/components/create/InvoiceDates';
import { DiscountShippingInputs } from '@/components/create/DiscountShippingInputs';
import { InvoiceTotalFooter } from '@/components/create/InvoiceTotalFooter';
import { useCreateInvoice } from '@/core/contexts/CreateInvoiceContext';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import { getInvoice } from '@/app/actions/invoiceActions';
import { useProfile } from '@/hooks/useProfile';

function CreateInvoiceForm() {
  const { 
    draftInvoiceId, setDraftInvoiceId,
    clientId, setClientId,
    clientName, setClientName,
    mobileNumber, setMobileNumber,
    groups, setGroups,
    currency, currencySymbol,
    clientAddress, setClientAddress,
    setSelectedTemplate,
    discountType, setDiscountType,
    discountValue, setDiscountValue,
    shippingCost, setShippingCost,
    amountPaid, setAmountPaid,
    issuedAt, setIssuedAt,
    dueDate, setDueDate
  } = useCreateInvoice();

  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useProfile();

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && id !== draftInvoiceId) {
      setIsLoading(true);
      getInvoice(id).then(invoice => {
        const canEdit = invoice && (invoice.status === 'DRAFT' || (profile?.invoice_edit_enabled ?? true));
        if (canEdit) {
          setDraftInvoiceId(invoice.id);
          if (invoice.client_id) setClientId(invoice.client_id);
          setClientName(invoice.client_name || '');
          setMobileNumber(invoice.client_phone || '');
          setClientAddress(invoice.client_address || '');
          setGroups((invoice.line_items_snapshot as any) || []);
          if (invoice.template) setSelectedTemplate(invoice.template);
          if (invoice.discount_type) setDiscountType(invoice.discount_type as 'amount' | 'percentage');
          if (invoice.discount_value) setDiscountValue(invoice.discount_value);
          if (invoice.shipping_cost) setShippingCost(invoice.shipping_cost);
          setAmountPaid(Number(invoice.amount_paid) || 0);
          if (invoice.issued_at) setIssuedAt(invoice.issued_at);
          if (invoice.due_date) setDueDate(invoice.due_date);
        } else if (invoice && invoice.status !== 'DRAFT') {
           console.warn('Invoice editing is disabled for non-draft invoices');
        }
      }).catch(err => {
        console.error('Failed to load draft invoice', err);
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [searchParams, profile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const updateGroupName = (id: string, name: string) => {
    setGroups(groups.map(g => g.id === id ? { ...g, name } : g));
  };

  const addItemToGroup = (groupId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          items: [...g.items, { id: Date.now().toString(), name: '', quantity: 1, unitPrice: 0 }]
        };
      }
      return g;
    }));
  };

  const updateItemInGroup = (groupId: string, itemId: string, field: string, value: string | number) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          items: g.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
        };
      }
      return g;
    }));
  };

  const deleteItemFromGroup = (groupId: string, itemId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          items: g.items.filter(item => item.id !== itemId)
        };
      }
      return g;
    }));
  };

  const deleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
  };

  const onAddGroup = () => {
    setGroups([...groups, { id: Date.now().toString(), name: 'New Group', items: [] }]);
  };

  const onAddItem = () => {
    if (groups.length === 0) {
      onAddGroup();
    } else {
      addItemToGroup(groups[groups.length - 1].id);
    }
  };

  const subtotal = groups.reduce((acc, g) => 
    acc + g.items.reduce((itemAcc, item) => itemAcc + (item.quantity * item.unitPrice), 0), 
  0);

  const discountAmount = discountType === 'percentage' 
    ? subtotal * ((discountValue || 0) / 100) 
    : (discountValue || 0);

  const totalAmount = Math.max(0, subtotal - discountAmount) + (shippingCost || 0);

  const isClientNameValid = clientName.trim().length > 0;
  const hasValidGroupsAndItems = groups.length > 0 && groups.some(g => g.items.length > 0);
  const isDateValid = !issuedAt || !dueDate || new Date(dueDate) >= new Date(issuedAt);
  const isValid = isClientNameValid && hasValidGroupsAndItems && isDateValid;

  const handleValidationFailed = () => {
    let message = 'Please fix the following to proceed:\n';
    if (!isClientNameValid) message += '- Customer name is required\n';
    if (groups.length === 0) message += '- At least one group is required\n';
    else if (!groups.some(g => g.items.length > 0)) message += '- At least one item is required\n';
    if (!isDateValid) message += '- Due date cannot be before the issue date\n';
    alert(message);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-lg pt-sm md:pt-0 pb-[100px]">
      {/* Header Section */}
      <section>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mb-xs">Create Invoice</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">New Invoice</p>
      </section>

      <CustomerDetails 
        clientId={clientId}
        setClientId={setClientId}
        clientName={clientName} 
        setClientName={setClientName} 
        mobileNumber={mobileNumber} 
        setMobileNumber={setMobileNumber}
        clientAddress={clientAddress}
        setClientAddress={setClientAddress}
      />

      <InvoiceDates />

      <section className="space-y-md">
        {groups.map((group) => (
          <LineItemGroup 
            key={group.id}
            group={group}
            updateGroupName={updateGroupName}
            addItemToGroup={addItemToGroup}
            updateItemInGroup={updateItemInGroup}
            deleteItemFromGroup={deleteItemFromGroup}
            deleteGroup={deleteGroup}
          />
        ))}

        <AddActions onAddGroup={onAddGroup} onAddItem={onAddItem} />
        
        <DiscountShippingInputs />
      </section>

      <InvoiceTotalFooter 
        totalAmount={totalAmount} 
        subtotal={subtotal}
        discountType={discountType}
        discountValue={discountValue}
        shippingCost={shippingCost}
        currency={currency} 
        currencySymbol={currencySymbol} 
        isValid={isValid}
        onValidationFailed={handleValidationFailed}
      />
    </div>
  );
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CreateInvoiceForm />
    </Suspense>
  );
}
