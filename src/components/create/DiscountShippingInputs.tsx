import { useCreateInvoice } from '@/core/contexts/CreateInvoiceContext';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

export function DiscountShippingInputs() {
  const { 
    discountType, setDiscountType,
    discountValue, setDiscountValue,
    shippingCost, setShippingCost,
    currencySymbol
  } = useCreateInvoice();

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mt-md">
      <h3 className="font-title-md text-title-md text-on-surface mb-md">Additional Charges</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        
        {/* Discount Section */}
        <div className="space-y-sm">
          <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-xs">
            <MaterialIcon icon="sell" className="text-[18px]" /> Discount
          </label>
          <div className="flex items-stretch border border-outline-variant rounded-lg overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <input
              type="number"
              min="0"
              step="any"
              value={discountValue || ''}
              onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
              className="flex-1 min-w-0 bg-transparent p-sm outline-none font-body-md text-on-surface"
              placeholder="0.00"
            />
            <div className="flex shrink-0 bg-surface-container-low border-l border-outline-variant">
              <button
                type="button"
                onClick={() => setDiscountType('amount')}
                className={`px-4 py-sm font-label-md transition-colors ${discountType === 'amount' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
              >
                {currencySymbol}
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('percentage')}
                className={`px-4 py-sm font-label-md transition-colors ${discountType === 'percentage' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
              >
                %
              </button>
            </div>
          </div>
        </div>

        {/* Shipping Section */}
        <div className="space-y-sm">
          <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-xs">
            <MaterialIcon icon="local_shipping" className="text-[18px]" /> Shipping
          </label>
          <div className="flex items-stretch border border-outline-variant rounded-lg overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <div className="flex items-center pl-sm text-on-surface-variant">{currencySymbol}</div>
            <input
              type="number"
              min="0"
              step="any"
              value={shippingCost || ''}
              onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
              className="flex-1 min-w-0 bg-transparent py-sm pr-sm pl-xs outline-none font-body-md text-on-surface"
              placeholder="0.00"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
