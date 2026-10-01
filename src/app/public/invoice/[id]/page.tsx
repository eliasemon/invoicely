import { getPublicInvoice } from '@/app/actions/invoiceActions';
import { getProfile } from '@/app/actions/profileActions';
import { getUserId } from '@/lib/supabase/admin';
import { PublicInvoiceViewer } from '@/components/invoices/PublicInvoiceViewer';
import { PublicInvoiceHeader } from '@/components/invoices/PublicInvoiceHeader';
import { notFound } from 'next/navigation';

import { DocumentType } from '@/components/templates/templateUtils';

export default async function PublicInvoicePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ type?: string }>;
}) {
  const { id } = await params;
  const sParams = searchParams ? await searchParams : {};
  const rawType = sParams.type?.toLowerCase();
  
  const invoice = await getPublicInvoice(id);
  if (!invoice) return notFound();

  // Ownership check
  let currentUserId: string | undefined = undefined;
  try {
    currentUserId = await getUserId();
  } catch {
    // Not authenticated
  }
  const isOwner = Boolean(currentUserId && invoice.profile_id && currentUserId === invoice.profile_id);

  // Check mode permissions: if public user, fallback to allowed mode
  const invoiceModeEnabled = invoice.invoice_mode_enabled ?? true;
  const challanModeEnabled = invoice.challan_mode_enabled ?? true;
  const quotationModeEnabled = invoice.quotation_mode_enabled ?? true;

  let initialDocumentType: DocumentType;
  if (rawType === 'quotation' && (isOwner || quotationModeEnabled)) {
    initialDocumentType = 'quotation';
  } else if (rawType === 'challan' && (isOwner || challanModeEnabled)) {
    initialDocumentType = 'challan';
  } else if ((rawType === 'invoice' || !rawType) && (isOwner || invoiceModeEnabled)) {
    initialDocumentType = 'invoice';
  } else {
    // Fallback for public viewers accessing disabled mode
    if (invoiceModeEnabled) initialDocumentType = 'invoice';
    else if (challanModeEnabled) initialDocumentType = 'challan';
    else if (quotationModeEnabled) initialDocumentType = 'quotation';
    else initialDocumentType = 'invoice';
  }



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
    amountPaid: invoice.amount_paid || 0,
    status: invoice.status,
    issued_at: invoice.issued_at,
    due_date: invoice.due_date,
  };

  const headersList = await import('next/headers').then(m => m.headers());
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  const fallbackUrl = host ? `${protocol}://${host}` : '';
  const baseUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || fallbackUrl;
  const publicUrl = `${baseUrl}/public/invoice/${id}`;

  return (
    <div className="bg-surface-container-lowest min-h-screen flex flex-col print:block print:bg-white print:min-h-0 print:p-0 print:m-0 print:w-[210mm]">
      <PublicInvoiceHeader invoiceNumber={invoice.invoice_number} />
      <div className="flex-1 pt-3 pb-24 md:py-12 print:py-0 print:px-0 print:m-0 print:block print:w-full">
        <PublicInvoiceViewer 
          templateId={invoice.template} 
          invoice={fullInvoice as any} 
          profile={invoice.profile} 
          publicUrl={publicUrl}
          initialDocumentType={initialDocumentType}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
}
