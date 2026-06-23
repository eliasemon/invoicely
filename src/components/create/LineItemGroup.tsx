'use client';
import { useState, MouseEvent } from 'react';
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
  deleteGroup?: (groupId: string) => void;
}

export function LineItemGroup({ 
  group, 
  updateGroupName, 
  addItemToGroup, 
  updateItemInGroup, 
  deleteItemFromGroup,
  deleteGroup
}: Readonly<LineItemGroupProps>) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { currency, currencySymbol } = useCreateInvoice();

  const groupTotal = group.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  const handleDeleteTrigger = (e: MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteGroup) {
      deleteGroup(group.id);
    }
    setShowDeleteModal(false);
  };

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
            maxLength={100}
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
        <div className="flex items-center gap-2">
          {deleteGroup && (
            <button 
              onClick={handleDeleteTrigger}
              className="text-error hover:bg-error-container hover:text-on-error-container p-1 rounded-full transition-colors flex items-center justify-center"
              title="Delete group"
            >
              <MaterialIcon icon="delete" className="text-[20px]" />
            </button>
          )}
          <MaterialIcon icon={isExpanded ? 'expand_less' : 'expand_more'} className="text-primary transition-transform" />
        </div>
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

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowDeleteModal(false)} 
            aria-hidden="true" 
          />
          <div className="relative bg-surface rounded-3xl shadow-2xl w-[95vw] sm:w-[400px] md:w-[450px] overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="w-12 h-12 bg-error-container text-on-error-container rounded-full flex items-center justify-center mb-sm">
                <MaterialIcon icon="delete_forever" className="text-[24px]" />
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Delete Group</h3>
              <p className="font-body-md text-on-surface-variant mb-4">
                Are you sure you want to delete this group and all its items? This action cannot be undone.
              </p>
              
              <div className="flex gap-sm justify-end mt-lg">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 font-label-md text-primary hover:bg-surface-container-low rounded-full transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 font-label-md bg-error text-on-error hover:bg-error/90 rounded-full transition-colors active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
