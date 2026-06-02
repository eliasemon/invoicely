import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { getInvoice, updateInvoiceStatus } from '@/app/actions/invoiceActions';
import dayjs from 'dayjs';
import { redirect } from 'next/navigation';
import { GroupData } from '@/components/create/LineItemGroup';
import { revalidatePath } from 'next/cache';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Actually we need to fetch by ID or invoice number, but in the URL it's the internal ID.
  // Wait, if the list passes invoice.id as the URL param, we need the UUID.
  // Oh, in page.tsx I passed invoice.invoice_number as the ID to InvoiceCard.
  // Let me adjust this: we should fetch by invoice_number if that's what's in the URL, or fix the list to pass the UUID.
  // Let's assume the ID in the URL is the UUID. Wait, the list passes `id={invoice.invoice_number}` to InvoiceCard, but the link might be generated differently.
  // Let's just fetch all and find it if it's the number, or use a new action.
  
  // For simplicity, let's fetch by ID (UUID). 
  // Wait, the previous code in `invoices/page.tsx` was: `<InvoiceCard id={invoice.invoice_number} ... />`
  // But wait, the `InvoiceCard` doesn't have a Link inside it in my mock. Let me check.
  // Ah, it's clickable, maybe it uses the `id` prop to navigate? Yes, probably.
  // Let's just create a new helper or fetch all and find it.
  
  // I will just change the `getInvoice` action to accept either UUID or invoice_number, 
  // but since we can't change it here easily, let's fetch all and find by invoice_number.
  
  const { getInvoices, updateInvoiceStatus } = await import('@/app/actions/invoiceActions');
  const { getProfile } = await import('@/app/actions/profileActions');
  const invoices = await getInvoices();
  const invoice = invoices.find((inv: any) => inv.id === id || inv.invoice_number === id);

  if (!invoice) {
    redirect('/invoices');
  }

  let defaultCurrency = 'USD';
  let defaultCurrencySymbol: string | undefined = undefined;
  try {
    const profile = await getProfile();
    if (profile) {
      defaultCurrency = profile.default_currency || 'USD';
      defaultCurrencySymbol = profile.currency_symbol || undefined;
    }
  } catch (e) {
    // Ignore error
  }
  
  const finalCurrency = invoice.currency || defaultCurrency;
  const finalCurrencySymbol = invoice.currency_symbol || defaultCurrencySymbol;

  const handlePayment = async () => {
    'use server';
    await updateInvoiceStatus(invoice.id, 'PAID');
    revalidatePath(`/invoices/${id}`);
  };

  const groups: GroupData[] = invoice.line_items_snapshot as any;
  const subtotal = groups.reduce((acc, g) => 
    acc + g.items.reduce((itemAcc, item) => itemAcc + (item.quantity * item.unitPrice), 0), 
  0);

  return (
    <div className="w-full max-w-[1000px] mx-auto py-8 px-4 md:py-16 md:px-0 pb-[100px]">
      {/* Top Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="font-headline-md text-headline-md font-bold text-primary">{invoice.invoice_number}</span>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-outline-variant text-on-surface rounded-lg font-label-sm text-label-sm hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <MaterialIcon icon="download" className="text-[18px]" />
            Download PDF
          </button>
          
          {invoice.status !== 'PAID' && (
            <form action={handlePayment}>
              <button type="submit" className="px-6 py-2 bg-secondary text-on-secondary rounded-lg font-label-sm text-label-sm hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-md flex items-center gap-2">
                <MaterialIcon icon="payment" filled className="text-[18px]" />
                Pay <CurrencyDisplay amount={invoice.total_amount} currency={finalCurrency} currencySymbol={finalCurrencySymbol} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Invoice Paper Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row border border-outline-variant/30">
        
        {/* Modern Sidebar / Left Column */}
        <div className="bg-secondary text-on-secondary w-full md:w-[30%] p-8 flex flex-col justify-between">
          <div>
            <div className="mb-12">
              <div className="w-16 h-16 rounded-full bg-surface-container-lowest mb-4 flex items-center justify-center text-secondary font-bold text-xl">
                ND
              </div>
              <h2 className="font-headline-md text-headline-md text-on-secondary mb-1">Nexus Design Co.</h2>
              <p className="font-data-mono text-data-mono text-secondary-fixed-dim">contact@nexusdesign.io</p>
            </div>
            
            <div className="mb-8">
              <p className="font-label-sm text-label-sm uppercase text-secondary-fixed mb-1">Invoice Number</p>
              <p className="font-headline-md text-[20px] font-semibold text-on-secondary">{invoice.invoice_number}</p>
            </div>
            
            <div className="mb-8">
              <p className="font-label-sm text-label-sm uppercase text-secondary-fixed mb-1">Date Issued</p>
              <p className="font-data-mono text-data-mono text-on-secondary">{dayjs(invoice.created_at).format('MMM D, YYYY')}</p>
            </div>
            
            <div className="mb-8">
              <p className="font-label-sm text-label-sm uppercase text-secondary-fixed mb-1">Due Date</p>
              <p className="font-data-mono text-data-mono text-on-secondary">{dayjs(invoice.created_at).add(30, 'day').format('MMM D, YYYY')}</p>
            </div>
          </div>
          
          <div className="mt-8 hidden md:block">
            <p className="font-label-sm text-label-sm uppercase text-secondary-fixed mb-2">Status</p>
            <div className={`p-2 rounded-lg inline-block font-bold ${invoice.status === 'PAID' ? 'bg-primary text-on-primary' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'}`}>
              {invoice.status}
            </div>
          </div>
        </div>

        {/* Main Content Area / Right Column */}
        <div className="w-full md:w-[70%] p-8 md:p-12">
          {/* Header row inside main content */}
          <div className="flex justify-between items-start mb-16">
            <div>
              <p className="font-label-sm text-label-sm uppercase text-outline mb-2">Billed To</p>
              <h3 className="font-headline-md text-[20px] font-semibold text-on-surface mb-1">{invoice.client_name}</h3>
              <p className="font-data-mono text-data-mono text-on-surface-variant">{invoice.client_phone}</p>
              {invoice.client_address && (
                <p className="font-data-mono text-data-mono text-on-surface-variant mt-1 max-w-[250px] whitespace-pre-wrap">{invoice.client_address}</p>
              )}
            </div>
            <div className="text-right">
              <div className={`inline-block px-3 py-1 rounded-full font-label-sm text-label-sm font-bold tracking-wide uppercase ${invoice.status === 'PAID' ? 'bg-primary-container text-on-primary-container' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'}`}>
                {invoice.status}
              </div>
            </div>
          </div>

          {/* Line Items Area */}
          <div className="mb-12">
            <p className="font-label-sm text-label-sm uppercase text-outline mb-4 border-b border-surface-container-high pb-2">Description</p>
            
            {groups.map((group, gIdx) => (
              <div key={gIdx} className="mb-6">
                <h4 className="font-body-lg font-bold text-primary mb-3">{group.name}</h4>
                {group.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex justify-between items-start mb-4 pl-4 border-l-2 border-surface-variant">
                    <div className="pr-4">
                      <h4 className="font-body-md font-semibold text-on-surface">{item.name}</h4>
                      <p className="font-data-mono text-data-mono text-on-surface-variant mt-1 flex items-center gap-1">
                        {item.quantity} x <CurrencyDisplay amount={item.unitPrice} currency={finalCurrency} currencySymbol={finalCurrencySymbol} />
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <CurrencyDisplay amount={item.quantity * item.unitPrice} currency={finalCurrency} currencySymbol={finalCurrencySymbol} className="font-data-mono text-data-mono text-on-surface" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Totals Area */}
          <div className="border-t border-surface-container-high pt-6">
            <div className="flex justify-end mb-3">
              <div className="w-full md:w-2/3 flex justify-between items-center">
                <p className="font-label-sm text-label-sm text-outline">Subtotal</p>
                <CurrencyDisplay amount={subtotal} currency={finalCurrency} currencySymbol={finalCurrencySymbol} className="font-data-mono text-data-mono text-on-surface" />
              </div>
            </div>
            
            {/* Grand Total Box */}
            <div className="flex justify-end mt-6">
              <div className="w-full md:w-2/3 bg-primary-container text-on-primary-container p-6 rounded-lg flex justify-between items-center">
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary-fixed-dim">Total Due</p>
                <CurrencyDisplay amount={invoice.total_amount} currency={finalCurrency} currencySymbol={finalCurrencySymbol} className="font-display-lg text-[32px] md:text-display-lg text-on-primary font-bold" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-16 pt-8 border-t border-surface-container-high">
            <p className="font-label-sm text-label-sm uppercase text-outline mb-2">Notes</p>
            <p className="font-data-mono text-data-mono text-on-surface-variant">
              {invoice.notes || 'Thank you for your business. Please process payment within 30 days of receiving this invoice. Late payments may be subject to a 1.5% monthly fee.'}
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
