'use client';

import { useCreateInvoice } from '@/core/contexts/CreateInvoiceContext';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

export function InvoiceDates() {
  const { issuedAt, setIssuedAt, dueDate, setDueDate } = useCreateInvoice();
  
  const isDateValid = !issuedAt || !dueDate || new Date(dueDate) >= new Date(issuedAt);

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
      <div className="flex items-center gap-2 mb-md">
        <MaterialIcon icon="calendar_today" className="text-primary" />
        <h3 className="font-label-lg text-label-lg text-on-surface">Invoice Dates</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div>
          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Issue Date</label>
          <input 
            type="date" 
            value={issuedAt ? issuedAt.split('T')[0] : ''} 
            onChange={(e) => {
              const dateVal = e.target.value;
              setIssuedAt(dateVal ? new Date(dateVal).toISOString() : '');
            }}
            className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
        
        <div>
          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1" htmlFor="dueDate">Due Date</label>
          <input 
            id="dueDate"
            type="date" 
            value={dueDate ? dueDate.split('T')[0] : ''} 
            onChange={(e) => {
              const dateVal = e.target.value;
              setDueDate(dateVal ? new Date(dateVal).toISOString() : '');
            }}
            className={`w-full bg-surface-bright border rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none transition-colors ${!isDateValid ? 'border-error focus:border-error focus:ring-1 focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'}`}
          />
          {!isDateValid && (
            <p className="text-error text-label-sm mt-1">Due date cannot be before issue date</p>
          )}
        </div>
      </div>
    </section>
  );
}
