'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { TemplateSelector } from '@/components/create/TemplateSelector';
import { useCreateInvoice } from '@/core/contexts/CreateInvoiceContext';
import { createInvoice, saveDraftInvoice } from '@/app/actions/invoiceActions';

import { useProfile } from '@/hooks/useProfile';
import { InvoiceTemplateRenderer } from '@/components/templates/InvoiceTemplateRenderer';

export default function CustomizeInvoicePage() {
  const router = useRouter();
  const { draftInvoiceId, clientName, mobileNumber, clientAddress, groups, selectedTemplate, setSelectedTemplate } = useCreateInvoice();
  const { profile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const totalAmount = groups.reduce((acc, g) => 
    acc + g.items.reduce((itemAcc, item) => itemAcc + (item.quantity * item.unitPrice), 0), 
  0);

  const mockInvoice = {
    id: draftInvoiceId || 'preview',
    userId: profile?.id || '',
    invoiceNumber: 'INV-PREVIEW',
    clientName: clientName || 'Client Name',
    clientPhone: mobileNumber || '',
    clientAddress: clientAddress || '',
    amount: totalAmount,
    status: 'DRAFT' as const,
    groups: groups,
    createdAt: new Date(),
    updatedAt: new Date(),
    currency: profile?.default_currency,
    currency_symbol: profile?.currency_symbol,
    signature_url: profile?.signature_url,
    signatory_name: profile?.signatory_name,
    bank_name: profile?.bank_name,
    bank_account_holder: profile?.bank_account_holder,
    bank_account_number: profile?.bank_account_number,
    bank_swift: profile?.bank_swift,
  };

  const handleFinalize = async () => {
    setIsSubmitting(true);
    try {
      const invoice = await createInvoice({
        invoiceId: draftInvoiceId || undefined,
        clientName,
        clientPhone: mobileNumber,
        clientAddress,
        template: selectedTemplate,
        groups
      });
      
      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const invoice = await saveDraftInvoice({
        invoiceId: draftInvoiceId || undefined,
        clientName,
        clientPhone: mobileNumber,
        clientAddress,
        template: selectedTemplate,
        groups
      });
      
      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Error saving draft:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-[512px] mx-auto space-y-lg pt-sm md:pt-0 pb-[100px] print:hidden">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between px-xs">
          <div className="flex flex-col items-center flex-1">
            <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm">
              <MaterialIcon icon="check" className="text-[14px]" />
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">Details</span>
          </div>
          <div className="h-[2px] bg-primary flex-1 mx-2"></div>
          <div className="flex flex-col items-center flex-1">
            <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm">2</div>
            <span className="font-label-sm text-label-sm text-primary font-bold mt-1">Style</span>
          </div>
        </div>

        <TemplateSelector 
          selectedTemplate={selectedTemplate} 
          onSelect={setSelectedTemplate} 
        />

        {/* Preview Button */}
        <button 
          onClick={() => setIsPreviewOpen(true)}
          className="w-full bg-surface-container-lowest border border-outline-variant text-primary font-body-md text-body-md font-medium h-12 rounded-lg flex items-center justify-center gap-2 shadow-sm active:bg-surface-container-low transition-colors"
        >
          <MaterialIcon icon="visibility" /> Preview Invoice
        </button>

        {/* Fixed Bottom Action Area */}
        <div className="fixed bottom-0 left-0 w-full bg-surface border-t border-outline-variant p-margin-mobile pb-safe shadow-[0_-4px_12px_rgba(26,43,60,0.05)] z-40 md:static md:shadow-none md:border-none md:p-0 md:bg-transparent md:mt-xl">
          <div className="max-w-[512px] mx-auto flex flex-col gap-sm">
            <button 
              onClick={handleFinalize}
              disabled={isSubmitting}
              className="w-full bg-primary text-on-primary font-body-lg text-body-lg font-semibold h-12 rounded-lg shadow-md active:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Generating...' : 'Finalize & Generate'}
              {!isSubmitting && <MaterialIcon icon="arrow_forward" />}
            </button>
            
            <div className="flex gap-sm">
              <Link 
                href="/create"
                className="flex-1 border border-outline-variant text-primary bg-surface-container-lowest font-body-lg text-body-lg font-semibold h-12 rounded-lg active:bg-surface-container-low transition-colors flex items-center justify-center"
              >
                Back
              </Link>
              <button 
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="flex-1 border border-outline-variant text-primary bg-surface-container-lowest font-body-lg text-body-lg font-semibold h-12 rounded-lg active:bg-surface-container-low transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <MaterialIcon icon="save" className="text-[20px]" />
                Save Draft
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8 print:p-0 print:absolute print:inset-0 print:bg-white print:z-50 print:block print:w-[210mm]">
          <div className="relative w-full max-w-5xl h-[90vh] bg-surface rounded-xl overflow-hidden shadow-2xl flex flex-col print:h-auto print:shadow-none print:rounded-none print:w-[210mm] print:max-w-[210mm] print:block">
            <div className="flex justify-between items-center p-4 border-b border-outline-variant bg-surface print:hidden">
              <h3 className="font-headline-sm text-primary font-bold">Template Preview</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center"
                >
                  <MaterialIcon icon="close" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-surface-container-lowest print:overflow-visible print:w-[210mm]">
              <div className="transform scale-[0.85] origin-top md:scale-100 min-h-max print:transform-none print:scale-100 print:w-[210mm]">
                <InvoiceTemplateRenderer 
                  templateId={selectedTemplate} 
                  invoice={mockInvoice} 
                  profile={profile}
                  isPreview={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
