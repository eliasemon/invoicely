'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { InvoiceTemplateRenderer } from '@/components/templates/InvoiceTemplateRenderer';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { DocumentType, TextSize, DEFAULT_NOTE_TEXT } from '@/components/templates/templateUtils';
import { updateInvoiceSettings, checkIsInvoiceOwner } from '@/app/actions/invoiceActions';
import { useAuth } from '@/hooks/useAuth';
import { PublicInvoiceHeader } from './PublicInvoiceHeader';
import { PublicInvoiceSettingsTabs } from './PublicInvoiceSettingsTabs';

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
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [templateSavedNotification, setTemplateSavedNotification] = useState<string | null>(null);

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
  const [subjectEnabled, setSubjectEnabled] = useState<boolean>(invoice.subject_enabled ?? true);
  const [subjectInvoice, setSubjectInvoice] = useState<string>(invoice.subject_invoice || invoice.subject || 'Bill for Items/Services');
  const [subjectChallan, setSubjectChallan] = useState<string>(invoice.subject_challan || invoice.subject || 'Delivery Challan for Items/Services');
  const [subjectQuotation, setSubjectQuotation] = useState<string>(invoice.subject_quotation || invoice.subject || 'Quotation for Items/Services');
  
  const [invoiceModeEnabled, setInvoiceModeEnabled] = useState<boolean>(invoice.invoice_mode_enabled ?? true);
  const [challanModeEnabled, setChallanModeEnabled] = useState<boolean>(invoice.challan_mode_enabled ?? true);
  const [quotationModeEnabled, setQuotationModeEnabled] = useState<boolean>(invoice.quotation_mode_enabled ?? true);
  const [noteEnabled, setNoteEnabled] = useState<boolean>(invoice.note_enabled ?? true);
  const [noteText, setNoteText] = useState<string>(invoice.note_text !== undefined && invoice.note_text !== null ? invoice.note_text : DEFAULT_NOTE_TEXT);

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

  const handleSaveSettings = async () => {
    if (!effectiveIsOwner || !invoice?.id) return;
    setIsSavingSettings(true);
    setSettingsSavedMessage(null);
    try {
      await updateInvoiceSettings(invoice.id, {
        subject_enabled: subjectEnabled,
        subject_invoice: subjectInvoice,
        subject_challan: subjectChallan,
        subject_quotation: subjectQuotation,
        invoice_mode_enabled: invoiceModeEnabled,
        challan_mode_enabled: challanModeEnabled,
        quotation_mode_enabled: quotationModeEnabled,
        note_enabled: noteEnabled,
        note_text: noteText || null,
        template: currentTemplate,
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
    template: currentTemplate,
    subject_enabled: subjectEnabled,
    subject_invoice: subjectInvoice,
    subject_challan: subjectChallan,
    subject_quotation: subjectQuotation,
    invoice_mode_enabled: invoiceModeEnabled,
    challan_mode_enabled: challanModeEnabled,
    quotation_mode_enabled: quotationModeEnabled,
    note_enabled: noteEnabled,
    note_text: noteText || null,
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



  return (
    <div className="w-full flex flex-col items-center">
      <PublicInvoiceHeader
        invoiceNumber={invoice.invoiceNumber || invoice.invoice_number}
        documentType={documentType}
        isOwner={effectiveIsOwner}
        onPrint={handlePrint}
      />

      <div className="w-full flex flex-col items-center pt-3">
        {/* Sticky Action Toolbar for Desktop (Zoom, Doc Text Resizer, Row Text Resizer, Print) */}
        <div className="hidden md:flex sticky top-16 z-40 mb-4 items-center gap-2 bg-surface-container shadow-md p-1.5 rounded-xl border border-outline-variant/30 print:hidden flex-wrap justify-center">
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

          {/* Print / Download Button */}
          <button
            onClick={handlePrint}
            className="px-3 h-8 bg-primary text-on-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <MaterialIcon icon="download" className="text-[16px]" />
            <span>Print / PDF</span>
          </button>
        </div>

        {/* Desktop Tabbed Settings Panel (Organized by tabs like profile settings) */}
        <div className="hidden md:block w-full max-w-4xl px-4 md:px-0 mx-auto mb-4">
          <PublicInvoiceSettingsTabs
            documentType={documentType}
            setDocumentType={setDocumentType}
            quotationWithPricing={quotationWithPricing}
            setQuotationWithPricing={setQuotationWithPricing}
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
            hasGroups={hasGroups}
            showGroups={showGroups}
            setShowGroups={setShowGroups}
            showGroupTotals={showGroupTotals}
            setShowGroupTotals={setShowGroupTotals}
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
          />
        </div>

      {/* Scrollable Document Canvas Viewport (On mobile this appears 1st right at the top!) */}
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

      {/* Mobile Floating Bottom Action Bar */}
      <div className="md:hidden fixed bottom-4 left-3 right-3 z-40 flex items-center justify-between gap-2.5 pointer-events-none print:hidden">
        <button
          type="button"
          onClick={() => setShowMobileDrawer(true)}
          className="pointer-events-auto flex-1 bg-surface-container-highest/95 backdrop-blur-md text-on-surface border border-outline-variant/60 shadow-xl rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer active:scale-95 transition-all hover:bg-surface-container-highest"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
              <MaterialIcon icon="tune" className="text-[18px]" />
            </span>
            <div className="text-left">
              <p className="font-bold text-xs text-on-surface leading-tight">Document Options</p>
              <p className="text-[10px] text-on-surface-variant capitalize">{documentType} • {currentTemplate.replace(/-/g, ' ')}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
            {documentType}
          </span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="pointer-events-auto bg-primary text-on-primary shadow-xl rounded-2xl px-4 py-3 flex items-center gap-1.5 font-bold text-xs cursor-pointer active:scale-95 transition-all hover:opacity-90"
          title="Print or Save as PDF"
        >
          <MaterialIcon icon="download" className="text-[18px]" />
          <span>PDF</span>
        </button>
      </div>

      {/* Mobile Options Drawer (Bottom Sheet) */}
      {showMobileDrawer && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end print:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setShowMobileDrawer(false)}
          />

          {/* Bottom Sheet */}
          <div className="relative bg-surface rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl border-t border-outline-variant/40 z-10 animate-in slide-in-from-bottom duration-200">
            {/* Handle & Header */}
            <div className="sticky top-0 bg-surface z-10 px-4 pt-3 pb-2.5 border-b border-outline-variant/30 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <MaterialIcon icon="tune" className="text-[18px]" />
                </span>
                <span className="font-bold text-sm text-on-surface">Invoice Options & Controls</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileDrawer(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer"
                title="Close"
              >
                <MaterialIcon icon="close" className="text-[18px]" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
              {/* Quick Zoom Bar */}
              <div className="flex items-center justify-between bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/40">
                <span className="text-xs font-bold text-on-surface">Zoom / View Size</span>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={previewZoomOut} 
                    className="w-7 h-7 flex items-center justify-center bg-surface rounded-lg text-on-surface border border-outline-variant/40 active:scale-95 cursor-pointer"
                    title="Zoom Out"
                  >
                    <MaterialIcon icon="remove" className="text-[16px]" />
                  </button>
                  <span className="text-xs font-bold px-1.5 min-w-[42px] text-center">
                    {Math.round(previewZoom * 100)}%
                  </span>
                  <button 
                    onClick={previewZoomIn} 
                    className="w-7 h-7 flex items-center justify-center bg-surface rounded-lg text-on-surface border border-outline-variant/40 active:scale-95 cursor-pointer"
                    title="Zoom In"
                  >
                    <MaterialIcon icon="add" className="text-[16px]" />
                  </button>
                  <button 
                    onClick={previewFitToWidth} 
                    className="px-2.5 h-7 flex items-center gap-1 bg-surface rounded-lg text-on-surface border border-outline-variant/40 active:scale-95 text-xs font-semibold cursor-pointer"
                    title="Fit to Screen Width"
                  >
                    <MaterialIcon icon="fit_width" className="text-[14px]" />
                    <span>Fit</span>
                  </button>
                </div>
              </div>

              {/* Tabbed Settings inside Mobile Drawer */}
              <PublicInvoiceSettingsTabs
                documentType={documentType}
                setDocumentType={setDocumentType}
                quotationWithPricing={quotationWithPricing}
                setQuotationWithPricing={setQuotationWithPricing}
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
                hasGroups={hasGroups}
                showGroups={showGroups}
                setShowGroups={setShowGroups}
                showGroupTotals={showGroupTotals}
                setShowGroupTotals={setShowGroupTotals}
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
                isMobileDrawer={true}
              />

              {/* Primary Download / Print PDF Button */}
              <button
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  setTimeout(() => handlePrint(), 150);
                }}
                className="w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-98 transition-all cursor-pointer mt-2"
              >
                <MaterialIcon icon="download" className="text-[20px]" />
                <span>Download / Print {documentType === 'challan' ? 'Challan' : documentType === 'quotation' ? (quotationWithPricing ? 'Quotation' : 'Quotation (Without Money)') : 'Invoice'} PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      </div>

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
