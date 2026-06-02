'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { TemplateSelector } from '@/components/create/TemplateSelector';
import { useCreateInvoice } from '@/core/contexts/CreateInvoiceContext';
import { createInvoice } from '@/app/actions/invoiceActions';

export default function CustomizeInvoicePage() {
  const router = useRouter();
  const { clientName, mobileNumber, clientAddress, groups, selectedTemplate, setSelectedTemplate } = useCreateInvoice();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinalize = async () => {
    setIsSubmitting(true);
    try {
      const invoice = await createInvoice({
        clientName,
        clientPhone: mobileNumber,
        clientAddress,
        template: selectedTemplate,
        groups
      });
      
      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      // Ideally show a toast notification here
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[512px] mx-auto space-y-lg pt-sm md:pt-0 pb-[100px]">
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
      <button className="w-full bg-surface-container-lowest border border-outline-variant text-primary font-body-md text-body-md font-medium h-12 rounded-lg flex items-center justify-center gap-2 shadow-sm active:bg-surface-container-low transition-colors">
        <MaterialIcon icon="visibility" /> Preview Invoice
      </button>

      {/* Fixed Bottom Action Area */}
      <div className="fixed bottom-0 left-0 w-full bg-surface border-t border-outline-variant p-margin-mobile pb-safe shadow-[0_-4px_12px_rgba(26,43,60,0.05)] z-40 md:static md:shadow-none md:border-none md:p-0 md:bg-transparent md:mt-xl">
        <div className="max-w-[512px] mx-auto flex gap-sm">
          <Link 
            href="/create"
            className="flex-1 border border-outline-variant text-primary bg-surface-container-lowest font-body-lg text-body-lg font-semibold h-12 rounded-lg active:bg-surface-container-low transition-colors flex items-center justify-center"
          >
            Back
          </Link>
          <button 
            onClick={handleFinalize}
            disabled={isSubmitting}
            className="flex-[2] bg-primary text-on-primary font-body-lg text-body-lg font-semibold h-12 rounded-lg shadow-md active:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Generating...' : 'Finalize & Generate'}
            {!isSubmitting && <MaterialIcon icon="arrow_forward" />}
          </button>
        </div>
      </div>
    </div>
  );
}
