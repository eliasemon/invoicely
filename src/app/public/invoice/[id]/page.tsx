import { getPublicInvoice } from '@/app/actions/invoiceActions';
import { getUserId, getLinkedUserIds } from '@/lib/supabase/admin';
import { PublicInvoiceViewer } from '@/components/invoices/PublicInvoiceViewer';
import { notFound } from 'next/navigation';

import { DocumentType, PaperSize } from '@/components/templates/templateUtils';

export const dynamic = 'force-dynamic';

export default async function PublicInvoicePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ type?: string; pricing?: string; with_money?: string; paper?: string }>;
}) {
  const { id } = await params;
  const sParams = searchParams ? await searchParams : {};
  const rawType = sParams.type?.toLowerCase();
  const rawPaper = sParams.paper?.toLowerCase();
  const initialPaperSize: PaperSize = rawPaper === 'a5' ? 'a5' : rawPaper === 'thermal' ? 'thermal' : 'a4';
  const invoice = await getPublicInvoice(id);
  if (!invoice) return notFound();

  // Ownership check supporting linked accounts
  let currentUserId: string | null | undefined = undefined;
  try {
    currentUserId = await getUserId();
  } catch {
    // Not authenticated
  }
  const isOwner = Boolean(
    currentUserId &&
    invoice.profile_id &&
    getLinkedUserIds(currentUserId).includes(invoice.profile_id)
  );

  // Priority: The quotation pricing state chosen by the invoice owner is authoritative.
  // Neither customer requests nor query parameters can override the owner's decision.
  const initialQuotationWithPricing = invoice.quotation_with_pricing ?? true;

  // Check mode permissions: if public user, fallback to allowed mode
  const invoiceModeEnabled = invoice.invoice_mode_enabled ?? true;
  const challanModeEnabled = invoice.challan_mode_enabled ?? true;
  const quotationModeEnabled = invoice.quotation_mode_enabled ?? true;

  // If public viewer and all public document modes are turned off, deny access
  if (!isOwner && !invoiceModeEnabled && !challanModeEnabled && !quotationModeEnabled) {
    return notFound();
  }

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
    quotation_with_pricing: invoice.quotation_with_pricing ?? true,
  };

  const headersList = await import('next/headers').then(m => m.headers());
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  const fallbackUrl = host ? `${protocol}://${host}` : '';
  const baseUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || fallbackUrl;
  const publicUrl = `${baseUrl}/public/invoice/${id}`;

  return (
    <div className="bg-surface-container-lowest min-h-screen flex flex-col overflow-x-hidden w-full max-w-full print:block print:bg-white print:min-h-0 print:p-0 print:m-0 print:w-full print:max-w-none">
      <div className="flex-1 w-full max-w-full overflow-x-hidden pb-28 md:pb-20 print:py-0 print:px-0 print:m-0 print:block print:w-full">
        <PublicInvoiceViewer 
          templateId={invoice.template} 
          invoice={fullInvoice as any} 
          profile={invoice.profile} 
          publicUrl={publicUrl}
          initialDocumentType={initialDocumentType}
          initialQuotationWithPricing={initialQuotationWithPricing}
          initialPaperSize={initialPaperSize}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
}
