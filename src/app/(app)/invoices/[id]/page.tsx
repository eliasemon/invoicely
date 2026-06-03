import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { getInvoice, recordPayment } from '@/app/actions/invoiceActions';
import { getProfile } from '@/app/actions/profileActions';
import dayjs from 'dayjs';
import { redirect } from 'next/navigation';
import { GroupData } from '@/components/create/LineItemGroup';
import { revalidatePath } from 'next/cache';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import Link from 'next/link';
import { DeleteInvoiceButton } from '@/components/invoices/DeleteInvoiceButton';

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const invoice = await getInvoice(id);

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

  const remainingAmount = Number(invoice.total_amount) - Number(invoice.amount_paid || 0);

  const handlePayment = async (formData: FormData) => {
    'use server';
    const amountStr = formData.get('amount') as string;
    let amountToPay = Number(amountStr);
    
    if (isNaN(amountToPay) || amountToPay <= 0) return;
    if (amountToPay > remainingAmount) {
      amountToPay = remainingAmount;
    }

    await recordPayment(invoice.id, amountToPay);
    revalidatePath(`/invoices/${id}`);
  };

  const groups: GroupData[] = (invoice.line_items_snapshot as any) || [];
  const subtotal = groups.reduce((acc, g) => 
    acc + g.items.reduce((itemAcc, item) => itemAcc + (item.quantity * item.unitPrice), 0), 
  0);

  return (
    <div className="font-body-md antialiased min-h-screen pb-xl">
      {/* TopAppBar */}
      <header className="bg-surface dark:bg-background w-full top-0 sticky border-b border-outline-variant dark:border-outline z-40">
        <div className="flex items-center justify-between px-md py-xs w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-sm">
            <Link 
              href="/invoices" 
              aria-label="Go back" 
              className="text-primary dark:text-inverse-primary hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors p-2 rounded-full active:scale-95 duration-100 flex items-center justify-center"
            >
              <MaterialIcon icon="arrow_back" />
            </Link>
            <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary">
              Invoice #{invoice.invoice_number}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {invoice.status === 'DRAFT' && (
              <DeleteInvoiceButton invoiceId={invoice.id} iconOnly={true} className="p-2 rounded-full" />
            )}
            <button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-95 flex items-center justify-center">
              <MaterialIcon icon="more_vert" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Main Content Area */}
        <div className="md:col-span-8 flex flex-col gap-gutter">
          {/* Invoice Summary Card */}
          <section className="bg-surface-container-lowest rounded-xl shadow-level1 border border-surface-variant p-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-lg gap-sm">
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Billed To</p>
                <h2 className="font-headline-md text-headline-md text-primary">{invoice.client_name}</h2>
                {invoice.client_phone && (
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">{invoice.client_phone}</p>
                )}
                {invoice.client_address && (
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1 whitespace-pre-wrap">{invoice.client_address}</p>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full font-label-sm text-label-sm inline-flex items-center gap-1 border ${
                invoice.status === 'PAID' ? 'bg-success-container text-on-success-container border-success/20' : 
                invoice.status === 'PARTIAL' ? 'bg-warning-container text-on-warning-container border-warning/20' : 
                invoice.status === 'UNPAID' ? 'bg-error-container text-error border-error/20' :
                'bg-surface-variant text-on-surface-variant border-outline-variant/20'
              }`}>
                <MaterialIcon 
                  icon={invoice.status === 'PAID' ? 'check_circle' : invoice.status === 'UNPAID' ? 'error' : 'pending'} 
                  className="text-[14px]" 
                />
                <span>{invoice.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-sm border-b border-surface-container-high pb-md mb-md">
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">Issue Date</p>
                <p className="font-body-md text-body-md text-primary font-medium">{dayjs(invoice.created_at).format('MMM D, YYYY')}</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">Due Date</p>
                <p className="font-body-md text-body-md text-primary font-medium">{dayjs(invoice.created_at).add(30, 'day').format('MMM D, YYYY')}</p>
              </div>
            </div>

            {/* Itemized List Condensed */}
            <div>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-sm uppercase">Line Items</h3>
              <div className="flex flex-col">
                {groups.map((group, gIdx) => (
                  <div key={gIdx} className="mb-4 last:mb-0">
                    <h4 className="font-body-md font-bold text-primary mb-2">{group.name}</h4>
                    {group.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex justify-between py-sm border-b border-surface-container-high last:border-0 hover:bg-surface-bright transition-colors">
                        <div>
                          <p className="font-body-md text-body-md text-primary font-medium">{item.name}</p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant">
                            {item.quantity} x <CurrencyDisplay amount={item.unitPrice} currency={finalCurrency} currencySymbol={finalCurrencySymbol} />
                          </p>
                        </div>
                        <p className="font-body-md text-body-md text-primary">
                          <CurrencyDisplay amount={item.quantity * item.unitPrice} currency={finalCurrency} currencySymbol={finalCurrencySymbol} />
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              
              {invoice.notes && (
                <div className="mt-md pt-sm border-t border-surface-container-high">
                  <p className="font-label-caps text-label-caps text-on-surface-variant mb-xs uppercase">Notes</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar / Financial Overview */}
        <div className="md:col-span-4 flex flex-col gap-gutter">
          {/* Financial Overview Bento */}
          <section className="bg-primary text-on-primary rounded-xl shadow-level1 p-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container rounded-full blur-2xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
            
            <h3 className="font-label-caps text-label-caps text-inverse-primary mb-md uppercase relative z-10">Financial Overview</h3>
            
            <div className="flex justify-between items-end mb-sm relative z-10">
              <p className="font-body-md text-body-md text-inverse-primary">Total Amount</p>
              <p className="font-body-lg text-body-lg text-on-primary">
                <CurrencyDisplay amount={subtotal} currency={finalCurrency} currencySymbol={finalCurrencySymbol} />
              </p>
            </div>
            
            <div className="flex justify-between items-end mb-lg relative z-10">
              <p className="font-body-md text-body-md text-inverse-primary">Paid to Date</p>
              <p className="font-body-lg text-body-lg text-tertiary-fixed-dim">
                <CurrencyDisplay amount={invoice.amount_paid || 0} currency={finalCurrency} currencySymbol={finalCurrencySymbol} />
              </p>
            </div>
            
            <div className="pt-sm border-t border-primary-container relative z-10">
              <p className="font-label-caps text-label-caps text-inverse-primary mb-1 uppercase">Remaining Balance</p>
              <p className="font-headline-lg text-headline-lg text-on-primary font-bold">
                <CurrencyDisplay amount={remainingAmount} currency={finalCurrency} currencySymbol={finalCurrencySymbol} />
              </p>
              
              <Link href={`/public/invoice/${invoice.id}`} target="_blank" className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-secondary text-secondary hover:bg-secondary/5 rounded-lg transition-all active:scale-95 relative z-10 font-label-sm">
                <MaterialIcon icon="download" />
                <span>Download / Print Invoice</span>
              </Link>
            </div>
          </section>

          {/* Action Area */}
          <section className="bg-surface-container-lowest rounded-xl shadow-level1 border border-surface-variant p-md">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-md uppercase">Record Payment</h3>
            
            {invoice.status !== 'PAID' ? (
              <form action={handlePayment}>
                <div className="mb-md">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Amount to Pay</label>
                  <div className="relative flex items-center border border-outline-variant rounded-lg bg-surface-bright focus-within:border-primary transition-colors px-3 py-2">
                    <span className="text-on-surface-variant font-body-md mr-2">{finalCurrencySymbol || finalCurrency}</span>
                    <input 
                      name="amount"
                      type="number" 
                      step="0.01"
                      min="0.01"
                      max={remainingAmount}
                      defaultValue={remainingAmount}
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 font-body-md text-primary" 
                    />
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                    Remaining balance: <CurrencyDisplay amount={remainingAmount} currency={finalCurrency} currencySymbol={finalCurrencySymbol} />
                  </p>
                </div>
                
                <button type="submit" className="w-full bg-primary hover:bg-on-primary-fixed text-on-primary font-label-sm text-label-sm py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.98]">
                  <MaterialIcon icon="payments" className="text-[18px]" />
                  Confirm Payment
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-sm text-center">
                <div className="w-12 h-12 bg-success-container text-on-success-container rounded-full flex items-center justify-center mb-sm">
                  <MaterialIcon icon="check_circle" className="text-[24px]" />
                </div>
                <p className="font-headline-md text-headline-md text-primary mb-1">Fully Paid</p>
                <p className="font-body-md text-body-md text-on-surface-variant">Invoice balance is zero.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
