'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { InvoiceTemplateRenderer } from '@/components/templates/InvoiceTemplateRenderer';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { DocumentType, TextSize, DEFAULT_NOTE_TEXT } from '@/components/templates/templateUtils';
import { updateInvoiceSettings, checkIsInvoiceOwner } from '@/app/actions/invoiceActions';
import { useAuth } from '@/hooks/useAuth';
import { PublicInvoiceHeader } from './PublicInvoiceHeader';
import { PublicInvoiceSettingsTabs } from './PublicInvoiceSettingsTabs';
import { SendDocumentDialog } from '@/components/integrations/SendDocumentDialog';
import { ShareDocumentType } from '@/lib/documentSharing';

interface PublicInvoiceViewerProps {
  invoice: any;
  profile: any;
  publicUrl?: string;
  templateId?: string;
  initialDocumentType?: DocumentType;
  initialQuotationWithPricing?: boolean;
  isOwner?: boolean;
}

export function PublicInvoiceViewer({
  invoice,
  profile,
  publicUrl,
  templateId,
  initialDocumentType = 'invoice',
  initialQuotationWithPricing = true,
  isOwner = false,
}: PublicInvoiceViewerProps) {
  const { user } = useAuth();
  const [effectiveIsOwner, setEffectiveIsOwner] = useState(isOwner);

  useEffect(() => {
    setEffectiveIsOwner(isOwner);
  }, [isOwner]);

  // Client-side verification fallback in case session wasn't hydrated during SSR
  useEffect(() => {
    if (!effectiveIsOwner && user?.uid && invoice?.id) {
      checkIsInvoiceOwner(invoice.id).then((verified) => {
        if (verified) {
          setEffectiveIsOwner(true);
        }
      }).catch(() => {});
    }
  }, [effectiveIsOwner, user?.uid, invoice?.id]);

  const [showGroups, setShowGroups] = useState(false);
  const [showGroupTotals, setShowGroupTotals] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>(initialDocumentType);
  const [quotationWithPricing, setQuotationWithPricing] = useState<boolean>(initialQuotationWithPricing);
  const [textSize, setTextSize] = useState<TextSize>('normal');
  const [overallTextSize, setOverallTextSize] = useState<TextSize>('normal');
  const [currentTemplate, setCurrentTemplate] = useState(invoice.template || templateId || 'sleek-accent');
  const [templateSavedNotification, setTemplateSavedNotification] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Sync initialDocumentType if prop changes
  useEffect(() => {
    if (initialDocumentType) {
      setDocumentType(initialDocumentType);
    }
  }, [initialDocumentType]);

  useEffect(() => {
    if (typeof initialQuotationWithPricing === 'boolean') {
      setQuotationWithPricing(initialQuotationWithPricing);
    }
  }, [initialQuotationWithPricing]);

  // Lock body scroll and handle Escape key when settings modal is open
  useEffect(() => {
    if (isSettingsModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsSettingsModalOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isSettingsModalOpen]);

  const handleTemplateChange = async (newTemplate: string) => {
    setCurrentTemplate(newTemplate);
    if (effectiveIsOwner && invoice?.id) {
      try {
        await updateInvoiceSettings(invoice.id, {
          template: newTemplate,
        });
        setTemplateSavedNotification('Template saved as default!');
        setTimeout(() => setTemplateSavedNotification(null), 2500);
      } catch (err) {
        console.error('Failed to auto-save default template:', err);
      }
    }
  };

  // Owner settings state
  const [issuedAt, setIssuedAt] = useState<string>(
    invoice.issued_at || invoice.created_at || invoice.createdAt || new Date().toISOString()
  );
  const [dueDate, setDueDate] = useState<string>(
    invoice.due_date ||
      (() => {
        const base = new Date(invoice.issued_at || invoice.created_at || invoice.createdAt || new Date());
        base.setDate(base.getDate() + 30);
        return base.toISOString();
      })()
  );

  const [subjectEnabled, setSubjectEnabled] = useState<boolean>(invoice.subject_enabled ?? true);
  const [subjectInvoice, setSubjectInvoice] = useState<string>(invoice.subject_invoice || invoice.subject || 'Bill for Items/Services');
  const [subjectChallan, setSubjectChallan] = useState<string>(invoice.subject_challan || invoice.subject || 'Delivery Challan for Items/Services');
  const [subjectQuotation, setSubjectQuotation] = useState<string>(invoice.subject_quotation || invoice.subject || 'Quotation for Items/Services');
  
  const [invoiceModeEnabled, setInvoiceModeEnabled] = useState<boolean>(invoice.invoice_mode_enabled ?? true);
  const [challanModeEnabled, setChallanModeEnabled] = useState<boolean>(invoice.challan_mode_enabled ?? true);
  const [quotationModeEnabled, setQuotationModeEnabled] = useState<boolean>(invoice.quotation_mode_enabled ?? true);
  const [noteEnabled, setNoteEnabled] = useState<boolean>(invoice.note_enabled ?? true);
  const [noteText, setNoteText] = useState<string>(invoice.note_text !== undefined && invoice.note_text !== null ? invoice.note_text : DEFAULT_NOTE_TEXT);
  const [currencySymbolDisplay, setCurrencySymbolDisplay] = useState<'all' | 'selected'>(
    invoice.currency_symbol_display || profile?.currency_symbol_display || 'all'
  );

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<string | null>(null);

  // Dedicated Print handler ensuring correct PDF name
  const handlePrint = () => {
    const docTitle =
      documentType === 'challan'
        ? 'Delivery-Challan'
        : documentType === 'quotation'
        ? (quotationWithPricing ? 'Quotation' : 'Quotation-Without-Money')
        : 'Invoice';
    const num = invoice.invoiceNumber || invoice.invoice_number || 'document';
    const prevTitle = document.title;
    document.title = `${docTitle}-${num}`;
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1500);
  };

  const handleToggleModeAvailability = async (
    mode: 'invoice' | 'challan' | 'quotation',
    newEnabled: boolean
  ) => {
    if (!effectiveIsOwner || !invoice?.id) return;

    const nextInvoice = mode === 'invoice' ? newEnabled : invoiceModeEnabled;
    const nextChallan = mode === 'challan' ? newEnabled : challanModeEnabled;
    const nextQuotation = mode === 'quotation' ? newEnabled : quotationModeEnabled;

    if (!nextInvoice && !nextChallan && !nextQuotation) {
      setSettingsSavedMessage('At least one document format must remain enabled for public view.');
      setTimeout(() => setSettingsSavedMessage(null), 3500);
      return;
    }

    if (mode === 'invoice') setInvoiceModeEnabled(newEnabled);
    if (mode === 'challan') setChallanModeEnabled(newEnabled);
    if (mode === 'quotation') setQuotationModeEnabled(newEnabled);

    setIsSavingSettings(true);
    setSettingsSavedMessage(null);
    try {
      await updateInvoiceSettings(invoice.id, {
        invoice_mode_enabled: nextInvoice,
        challan_mode_enabled: nextChallan,
        quotation_mode_enabled: nextQuotation,
      });
      const modeLabel =
        mode === 'invoice'
          ? 'Commercial Invoice'
          : mode === 'challan'
          ? 'Delivery Challan'
          : 'Quotation';
      setSettingsSavedMessage(`Public view for ${modeLabel} ${newEnabled ? 'enabled' : 'disabled'}.`);
      setTimeout(() => setSettingsSavedMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to update mode visibility:', err);
      if (mode === 'invoice') setInvoiceModeEnabled(!newEnabled);
      if (mode === 'challan') setChallanModeEnabled(!newEnabled);
      if (mode === 'quotation') setQuotationModeEnabled(!newEnabled);
      setSettingsSavedMessage('Failed to save mode change. Please try again.');
      setTimeout(() => setSettingsSavedMessage(null), 3500);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleToggleQuotationPricing = async (newEnabled: boolean) => {
    setQuotationWithPricing(newEnabled);
    if (!effectiveIsOwner || !invoice?.id) return;

    setIsSavingSettings(true);
    setSettingsSavedMessage(null);
    try {
      await updateInvoiceSettings(invoice.id, {
        quotation_with_pricing: newEnabled,
      });
      setSettingsSavedMessage(
        `Quotation pricing mode saved: ${newEnabled ? 'With Money (visible)' : 'Without Money (hidden)'}.`
      );
      setTimeout(() => setSettingsSavedMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to save quotation pricing setting:', err);
      setSettingsSavedMessage('Failed to save quotation pricing setting. Please try again.');
      setTimeout(() => setSettingsSavedMessage(null), 3500);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleToggleCurrencySymbolDisplay = async (newDisplay: 'all' | 'selected') => {
    setCurrencySymbolDisplay(newDisplay);
    if (!effectiveIsOwner || !invoice?.id) return;

    setIsSavingSettings(true);
    setSettingsSavedMessage(null);
    try {
      await updateInvoiceSettings(invoice.id, {
        currency_symbol_display: newDisplay,
      });
      setSettingsSavedMessage(
        `Currency symbol display saved: ${newDisplay === 'all' ? 'All items' : 'Only below sub-total'}.`
      );
      setTimeout(() => setSettingsSavedMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to save currency symbol display setting:', err);
      setSettingsSavedMessage('Failed to save currency symbol display setting. Please try again.');
      setTimeout(() => setSettingsSavedMessage(null), 3500);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveDates = async (newIssuedAt?: string, newDueDate?: string) => {
    if (!effectiveIsOwner || !invoice?.id) return;
    const targetIssuedAt = newIssuedAt !== undefined ? newIssuedAt : issuedAt;
    const targetDueDate = newDueDate !== undefined ? newDueDate : dueDate;

    setIsSavingSettings(true);
    setSettingsSavedMessage(null);
    try {
      await updateInvoiceSettings(invoice.id, {
        issued_at: targetIssuedAt,
        due_date: targetDueDate,
      });
      setSettingsSavedMessage('Invoice dates saved successfully!');
      setTimeout(() => setSettingsSavedMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to save invoice dates:', err);
      setSettingsSavedMessage('Failed to save dates. Please try again.');
      setTimeout(() => setSettingsSavedMessage(null), 3500);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!effectiveIsOwner || !invoice?.id) return;
    setIsSavingSettings(true);
    setSettingsSavedMessage(null);
    try {
      await updateInvoiceSettings(invoice.id, {
        issued_at: issuedAt,
        due_date: dueDate,
        subject_enabled: subjectEnabled,
        subject_invoice: subjectInvoice,
        subject_challan: subjectChallan,
        subject_quotation: subjectQuotation,
        invoice_mode_enabled: invoiceModeEnabled,
        challan_mode_enabled: challanModeEnabled,
        quotation_mode_enabled: quotationModeEnabled,
        quotation_with_pricing: quotationWithPricing,
        note_enabled: noteEnabled,
        note_text: noteText || null,
        template: currentTemplate,
        currency_symbol_display: currencySymbolDisplay,
      });
      setSettingsSavedMessage('Settings saved successfully!');
      setTimeout(() => setSettingsSavedMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setSettingsSavedMessage('Failed to save settings. Please try again.');
      setTimeout(() => setSettingsSavedMessage(null), 3000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const effectiveInvoice = {
    ...invoice,
    issued_at: issuedAt,
    due_date: dueDate,
    template: currentTemplate,
    subject_enabled: subjectEnabled,
    subject_invoice: subjectInvoice,
    subject_challan: subjectChallan,
    subject_quotation: subjectQuotation,
    invoice_mode_enabled: invoiceModeEnabled,
    challan_mode_enabled: challanModeEnabled,
    quotation_mode_enabled: quotationModeEnabled,
    quotation_with_pricing: quotationWithPricing,
    note_enabled: noteEnabled,
    note_text: noteText || null,
    currency_symbol_display: currencySymbolDisplay,
  };
  
  const [previewZoom, setPreviewZoom] = useState(0.5);
  const [previewInvoiceHeight, setPreviewInvoiceHeight] = useState(1123);
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const previewInvoiceRef = useRef<HTMLDivElement>(null);

  const hasGroups = invoice.groups && invoice.groups.length > 0 && invoice.groups.some((g: any) => g.name && g.name.trim() !== '');

  const isChallan = documentType === 'challan';
  const isQuotation = documentType === 'quotation';

  const calculateFitZoom = useCallback(() => {
    if (!previewViewportRef.current) return;
    const viewportWidth = previewViewportRef.current.clientWidth;
    const padding = 32; // 16px each side
    const fitZoom = (viewportWidth - padding) / 794;
    setPreviewZoom(Math.max(0.15, Math.min(fitZoom, 2.0)));
  }, []);

  useEffect(() => {
    if (!previewInvoiceRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPreviewInvoiceHeight(entry.contentRect.height || 1123);
      }
    });
    observer.observe(previewInvoiceRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
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
  }, [calculateFitZoom]);

  const previewZoomIn = () => setPreviewZoom((z) => Math.min(z + 0.1, 2.0));
  const previewZoomOut = () => setPreviewZoom((z) => Math.max(z - 0.1, 0.15));
  const previewFitToWidth = () => calculateFitZoom();

  // Table row text size handlers (existing)
  const handleDecreaseTextSize = () => {
    if (textSize === 'large') setTextSize('normal');
    else if (textSize === 'normal') setTextSize('compact');
  };

  const handleIncreaseTextSize = () => {
    if (textSize === 'compact') setTextSize('normal');
    else if (textSize === 'normal') setTextSize('large');
  };

  // Overall document content text size handlers (new!)
  const handleDecreaseOverallTextSize = () => {
    if (overallTextSize === 'large') setOverallTextSize('normal');
    else if (overallTextSize === 'normal') setOverallTextSize('compact');
  };

  const handleIncreaseOverallTextSize = () => {
    if (overallTextSize === 'compact') setOverallTextSize('normal');
    else if (overallTextSize === 'normal') setOverallTextSize('large');
  };



  // Financial breakdown calculations for sharing dialog
  const invoiceGroups: any[] = invoice?.groups || [];
  const computedSubtotal = invoiceGroups.reduce((acc: number, g: any) => {
    const items = g?.items || [];
    return acc + items.reduce((itemAcc: number, item: any) => {
      const unitPrice = Number(item?.unitPrice || 0);
      const qty = Number(item?.quantity || 1);
      const isFlatRate = Boolean(item?.isFlatRate);
      return itemAcc + (isFlatRate ? unitPrice : qty * unitPrice);
    }, 0);
  }, 0);

  const discountType = invoice?.discount_type || 'percentage';
  const discountVal = Number(invoice?.discount_value || 0);
  const computedDiscountAmount = discountType === 'percentage'
    ? (computedSubtotal * discountVal) / 100
    : discountVal;
  const computedShippingCost = Number(invoice?.shipping_cost || 0);
  const computedTotalAmount = Math.max(0, computedSubtotal - computedDiscountAmount + computedShippingCost);
  const paidAmount = Number(invoice?.amount_paid || 0);
  const computedRemainingAmount = Math.max(0, computedTotalAmount - paidAmount);

  return (
    <div className="w-full flex flex-col items-center">
      <PublicInvoiceHeader
        invoiceNumber={invoice.invoiceNumber || invoice.invoice_number}
        documentType={documentType}
        isOwner={effectiveIsOwner}
        onPrint={handlePrint}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
      />

      {/* PRIMARY VIEW: INVOICE PREVIEW CANVAS (Clean, not stacked below settings on same scroll) */}
      <section
        id="section-doc-preview"
        className="w-full max-w-full overflow-x-hidden flex flex-col items-center pt-3 sm:pt-6 pb-28 sm:pb-32 print:p-0"
      >
        {/* Sticky Action Toolbar for Preview (Zoom, Doc Text Resizer, Row Text Resizer, Settings & Print) */}
        <div className="hidden md:flex sticky top-16 z-20 mb-4 items-center gap-2 bg-surface/90 backdrop-blur-md shadow-md p-1.5 rounded-xl border border-outline-variant/50 print:hidden flex-wrap justify-center">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button 
              onClick={previewZoomOut} 
              className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-md text-on-surface-variant transition-colors active:scale-95 cursor-pointer" 
              title="Zoom Out"
            >
              <MaterialIcon icon="remove" className="text-[18px]" />
            </button>
            
            <span className="font-label-sm text-on-surface-variant px-1.5 min-w-[46px] text-center font-semibold text-xs">
              {Math.round(previewZoom * 100)}%
            </span>
            
            <button 
              onClick={previewZoomIn} 
              className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-md text-on-surface-variant transition-colors active:scale-95 cursor-pointer" 
              title="Zoom In"
            >
              <MaterialIcon icon="add" className="text-[18px]" />
            </button>
            
            <button 
              onClick={previewFitToWidth} 
              className="px-2 h-8 flex items-center gap-1 hover:bg-surface-container-high rounded-md text-on-surface-variant transition-colors active:scale-95 text-[11px] font-medium cursor-pointer" 
              title="Fit to Width"
            >
              <MaterialIcon icon="fit_width" className="text-[15px]" />
              <span>Fit</span>
            </button>
          </div>

          <div className="w-px bg-outline-variant/50 h-5"></div>

          {/* Overall Document Text Size Controls */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider px-1">
              Doc Text:
            </span>
            <button
              onClick={handleDecreaseOverallTextSize}
              disabled={overallTextSize === 'compact'}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-all cursor-pointer ${
                overallTextSize === 'compact'
                  ? 'opacity-30 cursor-not-allowed text-on-surface-variant'
                  : 'hover:bg-surface-container-high text-on-surface active:scale-95'
              }`}
              title="Decrease overall document font size"
            >
              A-
            </button>
            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-surface-container-high text-primary min-w-[58px] text-center capitalize">
              {overallTextSize}
            </span>
            <button
              onClick={handleIncreaseOverallTextSize}
              disabled={overallTextSize === 'large'}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-all cursor-pointer ${
                overallTextSize === 'large'
                  ? 'opacity-30 cursor-not-allowed text-on-surface-variant'
                  : 'hover:bg-surface-container-high text-on-surface active:scale-95'
              }`}
              title="Increase overall document font size"
            >
              A+
            </button>
          </div>

          <div className="w-px bg-outline-variant/50 h-5"></div>

          {/* Table Item Rows Font Size Controls */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider px-1">
              Items:
            </span>
            <button
              onClick={handleDecreaseTextSize}
              disabled={textSize === 'compact'}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-all cursor-pointer ${
                textSize === 'compact'
                  ? 'opacity-30 cursor-not-allowed text-on-surface-variant'
                  : 'hover:bg-surface-container-high text-on-surface active:scale-95'
              }`}
              title="Decrease items rows text size (fit more rows)"
            >
              A-
            </button>
            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-surface-container-high text-primary min-w-[58px] text-center capitalize">
              {textSize}
            </span>
            <button
              onClick={handleIncreaseTextSize}
              disabled={textSize === 'large'}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-all cursor-pointer ${
                textSize === 'large'
                  ? 'opacity-30 cursor-not-allowed text-on-surface-variant'
                  : 'hover:bg-surface-container-high text-on-surface active:scale-95'
              }`}
              title="Increase items rows text size"
            >
              A+
            </button>
          </div>

          <div className="w-px bg-outline-variant/50 h-5"></div>

          {/* Document Options Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-3 h-8 flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-container-highest text-primary rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 border border-primary/25 shadow-xs"
            title="Open Document Settings & Formats Modal"
          >
            <MaterialIcon icon="tune" className="text-[16px]" />
            <span>Document Options</span>
          </button>

          <div className="w-px bg-outline-variant/50 h-5"></div>

          {/* Share Document Trigger */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="px-3 h-8 flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-container-highest text-primary rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 border border-primary/25 shadow-xs"
            title="Share Document via WhatsApp or Email"
          >
            <MaterialIcon icon="share" className="text-[16px]" />
            <span>Share</span>
          </button>

          <div className="w-px bg-outline-variant/50 h-5"></div>

          {/* Print / Download Button */}
          <button
            onClick={handlePrint}
            className="px-3.5 h-8 bg-primary text-on-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <MaterialIcon icon="download" className="text-[16px]" />
            <span>Print / PDF</span>
          </button>
        </div>

        {/* Scrollable Document Canvas Viewport */}
        <div 
          ref={previewViewportRef}
          className="w-full overflow-auto bg-transparent select-text print:hidden"
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
              className="transition-shadow overflow-hidden bg-transparent"
            >
              <InvoiceTemplateRenderer 
                templateId={currentTemplate} 
                invoice={effectiveInvoice} 
                profile={profile} 
                publicUrl={publicUrl}
                showGroups={showGroups}
                showGroupTotals={showGroupTotals}
                isPreview={false}
                isChallan={isChallan}
                isQuotation={isQuotation}
                documentType={documentType}
                showPricing={documentType === 'quotation' ? quotationWithPricing : true}
                textSize={textSize}
                overallTextSize={overallTextSize}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Floating Bar: Horizontally full width on Mobile, Right Bottom side on Tablet & Desktop */}
      <div className="fixed bottom-0 inset-x-0 md:inset-x-auto md:bottom-6 md:right-6 z-40 print:hidden w-full md:w-auto md:max-w-md pointer-events-none">
        <div className="pointer-events-auto w-full md:w-auto bg-surface/95 dark:bg-surface-container-highest/95 backdrop-blur-xl border-t md:border border-outline-variant/80 md:rounded-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] md:shadow-2xl px-3 sm:px-4 py-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:p-2 flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex-1 min-w-0 md:w-64 text-left bg-surface-container-high/70 hover:bg-surface-container-highest dark:bg-surface-container/70 dark:hover:bg-surface-container-high border border-outline-variant/60 rounded-xl px-3.5 py-2 h-12 flex items-center justify-between gap-2.5 cursor-pointer active:scale-[0.98] transition-all group"
            title="Open Document Settings & Options"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors flex items-center justify-center shrink-0 shadow-xs">
                <MaterialIcon icon="tune" className="text-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-on-surface leading-tight truncate">Document Options</p>
                <p className="text-[10px] text-on-surface-variant capitalize truncate mt-0.5">
                  {documentType} • {currentTemplate.replace(/-/g, ' ')}
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
              {documentType}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="shrink-0 bg-surface border border-outline-variant hover:border-primary text-primary hover:bg-surface-container rounded-xl px-3 sm:px-3.5 h-12 flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm cursor-pointer active:scale-[0.98] transition-all shadow-xs"
            title="Share Document via WhatsApp or Email"
          >
            <MaterialIcon icon="share" className="text-[19px]" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="shrink-0 bg-primary text-on-primary hover:bg-primary/90 shadow-md rounded-xl px-4 sm:px-5 h-12 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm cursor-pointer active:scale-[0.98] transition-all"
            title="Print or Save as PDF"
          >
            <MaterialIcon icon="download" className="text-[19px]" />
            <span><span className="hidden md:inline">Download </span>PDF</span>
          </button>
        </div>
      </div>

      {/* BOTTOM SHEET MODAL POPUP FOR SETTINGS PANEL */}
      {isSettingsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Document Settings"
          className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-xs flex flex-col justify-end transition-opacity duration-300 print:hidden"
          onClick={() => setIsSettingsModalOpen(false)}
        >
          <div
            className="w-full max-w-5xl mx-auto bg-surface border-t border-x border-outline-variant rounded-t-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <PublicInvoiceSettingsTabs
              documentType={documentType}
              setDocumentType={setDocumentType}
              quotationWithPricing={quotationWithPricing}
              setQuotationWithPricing={setQuotationWithPricing}
              onToggleQuotationPricing={handleToggleQuotationPricing}
              invoiceModeEnabled={invoiceModeEnabled}
              challanModeEnabled={challanModeEnabled}
              quotationModeEnabled={quotationModeEnabled}
              onToggleModeAvailability={handleToggleModeAvailability}
              isUpdatingMode={isSavingSettings}
              currentTemplate={currentTemplate}
              onSelectTemplate={handleTemplateChange}
              templateSavedNotification={templateSavedNotification}
              textSize={textSize}
              setTextSize={setTextSize}
              overallTextSize={overallTextSize}
              setOverallTextSize={setOverallTextSize}
              currencySymbolDisplay={currencySymbolDisplay}
              onToggleCurrencySymbolDisplay={handleToggleCurrencySymbolDisplay}
              hasGroups={hasGroups}
              showGroups={showGroups}
              setShowGroups={setShowGroups}
              showGroupTotals={showGroupTotals}
              setShowGroupTotals={setShowGroupTotals}
              issuedAt={issuedAt}
              setIssuedAt={setIssuedAt}
              dueDate={dueDate}
              setDueDate={setDueDate}
              onSaveDates={handleSaveDates}
              isOwner={effectiveIsOwner}
              subjectEnabled={subjectEnabled}
              setSubjectEnabled={setSubjectEnabled}
              subjectInvoice={subjectInvoice}
              setSubjectInvoice={setSubjectInvoice}
              subjectChallan={subjectChallan}
              setSubjectChallan={setSubjectChallan}
              subjectQuotation={subjectQuotation}
              setSubjectQuotation={setSubjectQuotation}
              noteEnabled={noteEnabled}
              setNoteEnabled={setNoteEnabled}
              noteText={noteText}
              setNoteText={setNoteText}
              onSaveSettings={handleSaveSettings}
              isSavingSettings={isSavingSettings}
              settingsSavedMessage={settingsSavedMessage}
              onClose={() => setIsSettingsModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Share Document Dialog */}
      <SendDocumentDialog
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoiceNumber || invoice.invoice_number || ''}
        customerName={invoice.client_name || ''}
        customerPhone={invoice.client_phone || ''}
        customerEmail={invoice.client_email || ''}
        customerWhatsapp={invoice.client_whatsapp || ''}
        companyName={profile?.businessName || profile?.business_name || profile?.full_name || 'Our Company'}
        subtotal={computedSubtotal}
        discountAmount={computedDiscountAmount}
        shippingCost={computedShippingCost}
        totalAmount={computedTotalAmount}
        amountPaid={paidAmount}
        remainingAmount={computedRemainingAmount}
        currency={invoice.currency || 'USD'}
        currencySymbol={invoice.currency_symbol || '$'}
        status={invoice.status || 'UNPAID'}
        issueDate={issuedAt || invoice.issued_at || invoice.created_at || ''}
        dueDate={dueDate || invoice.due_date || ''}
        initialDocumentType={documentType as ShareDocumentType}
        initialQuotationWithPricing={quotationWithPricing}
      />

      {/* Dedicated Print Container */}
      <div className="hidden print:block w-[210mm] mx-auto bg-white border-none shadow-none m-0 p-0">
        <InvoiceTemplateRenderer 
          templateId={currentTemplate} 
          invoice={effectiveInvoice} 
          profile={profile} 
          publicUrl={publicUrl}
          showGroups={showGroups}
          showGroupTotals={showGroupTotals}
          isPreview={false}
          isChallan={isChallan}
          isQuotation={isQuotation}
          documentType={documentType}
          showPricing={documentType === 'quotation' ? quotationWithPricing : true}
          textSize={textSize}
          overallTextSize={overallTextSize}
        />
      </div>
    </div>
  );
}
