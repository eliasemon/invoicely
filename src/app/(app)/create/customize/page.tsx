'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { TemplateSelector } from '@/components/create/TemplateSelector';
import { useCreateInvoice } from '@/core/contexts/CreateInvoiceContext';
import { createInvoice, saveDraftInvoice } from '@/app/actions/invoiceActions';

import { useProfile } from '@/hooks/useProfile';
import { InvoiceTemplateRenderer } from '@/components/templates/InvoiceTemplateRenderer';
import { InvoiceDisplayOptions } from '@/components/templates/InvoiceDisplayOptions';

export default function CustomizeInvoicePage() {
  const router = useRouter();
  const { draftInvoiceId, clientId, clientName, mobileNumber, clientAddress, groups, selectedTemplate, setSelectedTemplate, discountType, discountValue, shippingCost, amountPaid, issuedAt, dueDate } = useCreateInvoice();
  const { profile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [showGroupTotals, setShowGroupTotals] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(0.5);
  const [previewInvoiceHeight, setPreviewInvoiceHeight] = useState(1123);
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const previewInvoiceRef = useRef<HTMLDivElement>(null);

  // Auto-fit zoom to viewport width when preview opens or viewport resizes
  const calculateFitZoom = useCallback(() => {
    if (!previewViewportRef.current) return;
    const viewportWidth = previewViewportRef.current.clientWidth;
    const padding = 32; // 16px each side
    const fitZoom = (viewportWidth - padding) / 794;
    setPreviewZoom(Math.max(0.15, Math.min(fitZoom, 2.0)));
  }, []);

  // Observe preview invoice height changes
  useEffect(() => {
    if (!isPreviewOpen || !previewInvoiceRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPreviewInvoiceHeight(entry.contentRect.height || 1123);
      }
    });
    observer.observe(previewInvoiceRef.current);
    return () => observer.disconnect();
  }, [isPreviewOpen]);

  // Observe viewport size and auto-fit on open
  useEffect(() => {
    if (!isPreviewOpen) return;
    // Use requestAnimationFrame to wait for DOM layout
    const raf = requestAnimationFrame(() => {
      calculateFitZoom();
    });

    const viewport = previewViewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(() => {
      calculateFitZoom();
    });
    observer.observe(viewport);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [isPreviewOpen, calculateFitZoom]);

  const previewZoomIn = () => setPreviewZoom((z) => Math.min(z + 0.1, 2.0));
  const previewZoomOut = () => setPreviewZoom((z) => Math.max(z - 0.1, 0.15));
  const previewFitToWidth = () => calculateFitZoom();

  const totalAmount = groups.reduce((acc, g) => 
    acc + g.items.reduce((itemAcc, item) => itemAcc + (item.quantity * item.unitPrice), 0), 
  0);

  const mockInvoice = {
    id: draftInvoiceId || 'preview',
    userId: profile?.id || '',
    clientId: clientId || null,
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
    discount_type: discountType,
    discount_value: discountValue,
    shipping_cost: shippingCost,
    amountPaid: amountPaid,
    issued_at: issuedAt || undefined,
    due_date: dueDate || undefined,
  };

  const handleFinalize = async () => {
    setIsSubmitting(true);
    try {
      const invoice = await createInvoice({
        invoiceId: draftInvoiceId || undefined,
        clientId,
        clientName,
        clientPhone: mobileNumber,
        clientAddress,
        template: selectedTemplate,
        groups,
        discountType,
        discountValue,
        shippingCost,
        issuedAt: issuedAt || undefined,
        dueDate: dueDate || undefined,
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
        clientId,
        clientName,
        clientPhone: mobileNumber,
        clientAddress,
        template: selectedTemplate,
        groups,
        discountType,
        discountValue,
        shippingCost,
        issuedAt: issuedAt || undefined,
        dueDate: dueDate || undefined,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 md:p-8 print:p-0 print:absolute print:inset-0 print:bg-white print:z-50 print:block print:w-[210mm]">
          <div className="relative w-full h-full sm:h-[90vh] sm:max-w-5xl bg-surface sm:rounded-xl overflow-hidden shadow-2xl flex flex-col print:h-auto print:shadow-none print:rounded-none print:w-[210mm] print:max-w-[210mm] print:block">
            {/* Modal Header with Zoom Controls */}
            <div className="flex justify-between items-center px-3 py-2 sm:px-4 sm:py-3 border-b border-outline-variant bg-surface print:hidden flex-shrink-0">
              <h3 className="font-headline-sm text-primary font-bold text-sm sm:text-base">Preview</h3>
              
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-surface-container-low p-0.5 sm:p-1 rounded-lg border border-outline-variant/30">
                <button 
                  onClick={previewZoomOut} 
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-surface-container-high rounded-md text-on-surface-variant transition-colors active:scale-95" 
                  title="Zoom Out"
                >
                  <MaterialIcon icon="remove" className="text-[16px] sm:text-[18px]" />
                </button>
                
                <span className="font-label-sm text-on-surface-variant px-1 sm:px-2 min-w-[40px] sm:min-w-[50px] text-center font-semibold text-[11px] sm:text-xs">
                  {Math.round(previewZoom * 100)}%
                </span>
                
                <button 
                  onClick={previewZoomIn} 
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-surface-container-high rounded-md text-on-surface-variant transition-colors active:scale-95" 
                  title="Zoom In"
                >
                  <MaterialIcon icon="add" className="text-[16px] sm:text-[18px]" />
                </button>
                
                <div className="w-px bg-outline-variant/50 h-4 sm:h-5 mx-0.5 sm:mx-1"></div>
                
                <button 
                  onClick={previewFitToWidth} 
                  className="px-1.5 sm:px-2.5 h-7 sm:h-8 flex items-center gap-1 hover:bg-surface-container-high rounded-md text-on-surface-variant transition-colors active:scale-95 text-[10px] sm:text-[11px] font-medium" 
                  title="Fit to Width"
                >
                  <MaterialIcon icon="fit_width" className="text-[14px] sm:text-[15px]" />
                  <span className="hidden sm:inline">Fit</span>
                </button>
              </div>

              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 sm:p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center ml-1"
              >
                <MaterialIcon icon="close" />
              </button>
            </div>

            {/* Display Options / Toggles (Unscaled, inside modal but outside viewport) */}
            <div className="flex-shrink-0 px-4 pt-4 print:hidden">
              <InvoiceDisplayOptions 
                showGroups={showGroups} 
                setShowGroups={setShowGroups} 
                showGroupTotals={showGroupTotals} 
                setShowGroupTotals={setShowGroupTotals} 
                hasGroups={groups && groups.length > 0 && groups.some(g => g.name && g.name.trim() !== '')}
              />
            </div>

            {/* Scrollable Document Canvas Viewport (Hidden during print) */}
            <div 
              ref={previewViewportRef}
              className="flex-1 overflow-auto bg-surface-container select-text print:hidden"
              style={{ touchAction: 'manipulation' }}
            >
              {/* Zoom Wrapper - Reserves space for the scaled container */}
              <div 
                style={{ 
                  height: `${previewInvoiceHeight * previewZoom}px`,
                  width: previewViewportRef.current ? `${Math.max(previewViewportRef.current.clientWidth, 794 * previewZoom)}px` : '100%',
                  position: 'relative' 
                }} 
                className="transition-all duration-200 mx-auto"
              >
                {/* Scaled Invoice Document */}
                <div
                  ref={previewInvoiceRef}
                  style={{
                    width: previewViewportRef.current ? `${previewViewportRef.current.clientWidth / previewZoom}px` : '100%',
                    minWidth: '794px',
                    transform: `scale(${previewZoom})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                  }}
                  className="transition-shadow hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden bg-transparent"
                >
                  <InvoiceTemplateRenderer 
                    templateId={selectedTemplate} 
                    invoice={mockInvoice} 
                    profile={profile}
                    isPreview={true}
                    showGroups={showGroups}
                    showGroupTotals={showGroupTotals}
                    publicUrl={`${process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/public/invoice/mock-12345`}
                  />
                </div>
              </div>
            </div>

            {/* Dedicated Print Container */}
            <div className="hidden print:block w-[210mm] mx-auto bg-white border-none shadow-none m-0 p-0">
              <InvoiceTemplateRenderer 
                templateId={selectedTemplate} 
                invoice={mockInvoice} 
                profile={profile}
                isPreview={true}
                showGroups={showGroups}
                showGroupTotals={showGroupTotals}
                publicUrl={`${process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/public/invoice/mock-12345`}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
