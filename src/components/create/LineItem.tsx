'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { searchItems, upsertItem } from '@/app/actions/itemActions';
import { useCreateInvoice } from '@/core/contexts/CreateInvoiceContext';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';

export interface LineItemData {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  isFlatRate?: boolean;
}

interface CatalogItem {
  name: string;
  unit_price: Record<string, number>;
}

const PREDEFINED_UNITS = ['pcs', 'kg', 'g', 'lb', 'L', 'mL', 'm', 'cm', 'ft', 'in', 'hr', 'day', 'mo', 'box', 'pack', 'set', 'job', 'svc', 'unit'];

interface LineItemProps {
  item: LineItemData;
  updateItem: (id: string, field: keyof LineItemData, value: string | number) => void;
  deleteItem: (id: string) => void;
}

export function LineItem({ item, updateItem, deleteItem }: Readonly<LineItemProps>) {
  const [suggestions, setSuggestions] = useState<CatalogItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUnitSuggestions, setShowUnitSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const unitWrapperRef = useRef<HTMLDivElement>(null);
  const { currency, currencySymbol } = useCreateInvoice();

  const total = (item.isFlatRate ? 1 : item.quantity) * item.unitPrice;

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (unitWrapperRef.current && !unitWrapperRef.current.contains(event.target as Node)) {
        setShowUnitSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchItems(query);
      setSuggestions(results as CatalogItem[]);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(item.name);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [item.name, fetchSuggestions]);

  const handleSelectSuggestion = (suggestion: CatalogItem) => {
    updateItem(item.id, 'name', suggestion.name);

    // Only auto-populate the price if the catalog item has a price for the current currency
    const priceForCurrency = suggestion.unit_price?.[currency];
    if (priceForCurrency !== undefined && priceForCurrency !== null) {
      updateItem(item.id, 'unitPrice', priceForCurrency);
    }

    setShowSuggestions(false);
  };

  const handlePriceChange = async (newPrice: number) => {
    updateItem(item.id, 'unitPrice', newPrice);
    if (item.name.trim() && currency) {
      // Update global catalog in background for specific currency
      try {
        await upsertItem(item.name, newPrice, currency);
      } catch (error) {
        console.error('Error updating global price:', error);
      }
    }
  };

  return (
    <div className="p-sm border-b border-surface-container flex flex-col gap-xs hover:bg-surface-container-low transition-colors">
      <div className="flex justify-between items-start">
        <div className="relative w-3/4" ref={wrapperRef}>
          <input
            className="font-body-md text-body-md text-on-surface font-medium bg-transparent border-none p-0 focus:ring-0 w-full truncate placeholder:text-outline"
            type="text"
            placeholder="Item name"
            maxLength={150}
            value={item.name}
            onChange={(e) => {
              updateItem(item.id, 'name', e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (item.name.trim() && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />

          {showSuggestions && (
            <div className="absolute z-50 mt-1 w-full bg-surface border border-outline-variant rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="p-sm text-center text-on-surface-variant font-label-sm">Loading...</div>
              ) : (
                suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="p-sm hover:bg-surface-container cursor-pointer flex justify-between items-center"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <span className="font-body-md text-on-surface">{suggestion.name}</span>
                    {suggestion.unit_price?.[currency] !== undefined && (
                      <CurrencyDisplay amount={suggestion.unit_price[currency]} currency={currency} currencySymbol={currencySymbol} className="font-data-mono text-on-surface-variant" />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateItem(item.id, 'isFlatRate', !item.isFlatRate)}
            className={`transition-colors flex items-center justify-center p-1 rounded-full ${item.isFlatRate ? 'text-primary bg-primary-container/20' : 'text-outline hover:text-primary hover:bg-surface-container-high'}`}
            title={item.isFlatRate ? "Switch to quantity" : "Switch to flat rate"}
          >
            <MaterialIcon icon={item.isFlatRate ? 'tag' : 'exposure_plus_1'} className="text-[20px]" />
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-outline hover:text-error transition-colors flex items-center justify-center p-1 rounded-full hover:bg-surface-container-high"
            title="Delete item"
          >
            <MaterialIcon icon="delete" className="text-[20px]" />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center mt-xs">
        <div className="flex items-center gap-sm flex-wrap">
          {!item.isFlatRate && (
            <>
              <div className="flex items-center border border-outline-variant rounded-lg bg-surface">
                <button
                  onClick={() => updateItem(item.id, 'quantity', Math.max(0, item.quantity - 1))}
                  className="px-2 py-1 text-on-surface-variant hover:text-primary"
                >-</button>
                <input
                  className="w-12 text-center bg-transparent border-none p-0 font-body-md text-body-md text-on-surface focus:ring-0 h-[32px]"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                />
                <button
                  onClick={() => updateItem(item.id, 'quantity', item.quantity + 1)}
                  className="px-2 py-1 text-on-surface-variant hover:text-primary"
                >+</button>
              </div>
              <div className="relative flex items-center" ref={unitWrapperRef}>
                <input
                  className="w-20 bg-transparent border-b border-outline-variant py-1 pl-1 pr-6 font-body-md text-body-md text-on-surface focus:ring-0 focus:border-primary"
                  type="text"
                  placeholder="Unit"
                  value={item.unit || ''}
                  onChange={(e) => {
                    updateItem(item.id, 'unit', e.target.value);
                    setShowUnitSuggestions(true);
                  }}
                  onFocus={() => setShowUnitSuggestions(true)}
                />
                <MaterialIcon icon="arrow_drop_down" className="absolute right-0 text-on-surface-variant pointer-events-none text-[20px]" />
                
                {showUnitSuggestions && (
                  <div className="absolute top-full right-0 z-50 mt-1 w-24 bg-surface border border-outline-variant rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {PREDEFINED_UNITS.filter(u => u.toLowerCase().includes((item.unit || '').toLowerCase())).length > 0 ? (
                      PREDEFINED_UNITS.filter(u => u.toLowerCase().includes((item.unit || '').toLowerCase())).map((u) => (
                        <div
                          key={u}
                          className="p-xs px-sm hover:bg-surface-container cursor-pointer font-body-md text-on-surface"
                          onClick={() => {
                            updateItem(item.id, 'unit', u);
                            setShowUnitSuggestions(false);
                          }}
                        >
                          {u}
                        </div>
                      ))
                    ) : (
                      <div className="p-xs px-sm text-on-surface-variant font-label-sm">Custom</div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
          <div className="flex items-center gap-1 font-body-md text-body-md text-on-surface-variant">
            {!item.isFlatRate && <span>x {currencySymbol}</span>}
            {item.isFlatRate && <span>{currencySymbol}</span>}
            <input
              className="w-20 bg-transparent border-b border-outline-variant p-0 font-body-md text-body-md text-on-surface focus:ring-0 focus:border-primary"
              type="number"
              step="0.01"
              value={item.unitPrice}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
            />
          </div>
        </div>
        <CurrencyDisplay amount={total} currency={currency} currencySymbol={currencySymbol} className="font-body-md text-body-md text-on-surface font-medium" />
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
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Delete Item</h3>
              <p className="font-body-md text-on-surface-variant mb-4">
                Are you sure you want to delete this item? This action cannot be undone.
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
                  onClick={() => {
                    deleteItem(item.id);
                    setShowDeleteModal(false);
                  }}
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
