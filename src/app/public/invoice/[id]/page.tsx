import { getPublicInvoice } from '@/app/actions/invoiceActions';
import { getProfile } from '@/app/actions/profileActions';
import { InvoiceTemplateRenderer } from '@/components/templates/InvoiceTemplateRenderer';
import { PublicInvoiceHeader } from '@/components/invoices/PublicInvoiceHeader';
import { notFound } from 'next/navigation';

export default async function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const invoice = await getPublicInvoice(id);
  if (!invoice) return notFound();



  // Set default values if needed
  const fullInvoice = {
    ...invoice,
    groups: invoice.line_items_snapshot || [],
    createdAt: invoice.created_at,
    updatedAt: invoice.updated_at,
    invoiceNumber: invoice.invoice_number,
    clientName: invoice.client_name,
    clientPhone: invoice.client_phone,
    clientAddress: invoice.client_address,
    amount: invoice.total_amount,
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen flex flex-col print:block print:bg-white print:min-h-0 print:p-0 print:m-0 print:w-[210mm]">
      <PublicInvoiceHeader invoiceNumber={invoice.invoice_number} />
      <div className="flex-1 py-8 md:py-12 print:py-0 print:px-0 print:m-0 print:block print:w-full">
        <InvoiceTemplateRenderer 
          templateId={invoice.template} 
          invoice={fullInvoice as any} 
          profile={invoice.profile} 
        />
      </div>
    </div>
  );
}
