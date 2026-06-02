'use client';
import { CustomerDetails } from '@/components/create/CustomerDetails';
import { LineItemGroup } from '@/components/create/LineItemGroup';
import { AddActions } from '@/components/create/AddActions';
import { InvoiceTotalFooter } from '@/components/create/InvoiceTotalFooter';
import { useCreateInvoice } from '@/core/contexts/CreateInvoiceContext';

export default function CreateInvoicePage() {
  const { 
    clientName, setClientName,
    mobileNumber, setMobileNumber,
    groups, setGroups,
    currency, currencySymbol,
    clientAddress, setClientAddress
  } = useCreateInvoice();

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

  const totalAmount = groups.reduce((acc, g) => 
    acc + g.items.reduce((itemAcc, item) => itemAcc + (item.quantity * item.unitPrice), 0), 
  0);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-lg pt-sm md:pt-0 pb-[100px]">
      {/* Header Section */}
      <section>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mb-xs">Create Invoice</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">New Invoice</p>
      </section>

      <CustomerDetails 
        clientName={clientName} 
        setClientName={setClientName} 
        mobileNumber={mobileNumber} 
        setMobileNumber={setMobileNumber}
        clientAddress={clientAddress}
        setClientAddress={setClientAddress}
      />

      <section className="space-y-md">
        {groups.map((group) => (
          <LineItemGroup 
            key={group.id}
            group={group}
            updateGroupName={updateGroupName}
            addItemToGroup={addItemToGroup}
            updateItemInGroup={updateItemInGroup}
            deleteItemFromGroup={deleteItemFromGroup}
          />
        ))}

        <AddActions onAddGroup={onAddGroup} onAddItem={onAddItem} />
      </section>

      <InvoiceTotalFooter totalAmount={totalAmount} currency={currency} currencySymbol={currencySymbol} />
    </div>
  );
}
