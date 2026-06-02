'use client';
import { useState } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { LineItem, LineItemData } from '@/components/create/LineItem';
import { useCreateInvoice } from '@/core/contexts/CreateInvoiceContext';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';

export interface GroupData {
  id: string;
  name: string;
  items: LineItemData[];
}

interface LineItemGroupProps {
  group: GroupData;
  updateGroupName: (id: string, name: string) => void;
  addItemToGroup: (groupId: string) => void;
  updateItemInGroup: (groupId: string, itemId: string, field: keyof LineItemData, value: string | number) => void;
  deleteItemFromGroup: (groupId: string, itemId: string) => void;
}

export function LineItemGroup({ 
  group, 
  updateGroupName, 
  addItemToGroup, 
  updateItemInGroup, 
  deleteItemFromGroup 
}: Readonly<LineItemGroupProps>) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { currency, currencySymbol } = useCreateInvoice();

  const groupTotal = group.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_12px_rgba(26,43,60,0.05)] overflow-hidden">
      <div 
        className="bg-surface-container p-sm border-b border-outline-variant flex justify-between items-center cursor-pointer select-none" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-xs w-2/3">
          <input 
            className="font-headline-md text-headline-md text-primary bg-transparent border-none p-0 focus:ring-0 w-full truncate font-semibold" 
            type="text" 
            value={group.name}
            onChange={(e) => updateGroupName(group.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <CurrencyDisplay 
            amount={groupTotal} 
            currency={currency} 
            currencySymbol={currencySymbol}
            className="font-headline-md text-headline-md text-primary ml-auto mr-sm whitespace-nowrap" 
          />
        </div>
        <MaterialIcon icon={isExpanded ? 'expand_less' : 'expand_more'} className="text-primary transition-transform" />
      </div>
      
      <div className={`transition-all duration-300 ${isExpanded ? 'block' : 'hidden'}`}>
        <div className="p-0">
          {group.items.map((item) => (
            <LineItem 
              key={item.id}
              item={item}
              updateItem={(itemId, field, value) => updateItemInGroup(group.id, itemId, field, value)}
              deleteItem={(itemId) => deleteItemFromGroup(group.id, itemId)}
            />
          ))}
        </div>
        
        <div className="p-sm bg-surface-container-lowest border-t border-outline-variant">
          <button 
            onClick={() => addItemToGroup(group.id)}
            className="text-primary font-label-sm text-label-sm font-semibold flex items-center gap-xs hover:underline"
          >
            <MaterialIcon icon="add" className="text-[16px]" /> 
            Add Item to Group
          </button>
        </div>
      </div>
    </div>
  );
}
