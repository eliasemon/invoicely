'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { InvoiceTemplateRenderer } from '@/components/templates/InvoiceTemplateRenderer';
import { InvoiceDisplayOptions } from '@/components/templates/InvoiceDisplayOptions';
import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { DocumentType, TextSize } from '@/components/templates/templateUtils';
import { updateInvoiceSettings } from '@/app/actions/invoiceActions';

interface PublicInvoiceViewerProps {
  invoice: any;
  profile: any;
  publicUrl?: string;
  templateId?: string;
  initialDocumentType?: DocumentType;
  isOwner?: boolean;
}

export function PublicInvoiceViewer({
  invoice,
  profile,
  publicUrl,
  templateId,
  initialDocumentType = 'invoice',
  isOwner = false,
}: PublicInvoiceViewerProps) {
  const [showGroups, setShowGroups] = useState(false);
  const [showGroupTotals, setShowGroupTotals] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>(initialDocumentType);
  const [textSize, setTextSize] = useState<TextSize>('normal');
  const [overallTextSize, setOverallTextSize] = useState<TextSize>('normal');
  const [currentTemplate, setCurrentTemplate] = useState(invoice.template || templateId || 'sleek-accent');
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [templateSavedNotification, setTemplateSavedNotification] = useState<string | null>(null);

  const handleTemplateChange = async (newTemplate: string) => {
    setCurrentTemplate(newTemplate);
    if (isOwner && invoice?.id) {
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

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<string | null>(null);
  const [showOwnerDrawer, setShowOwnerDrawer] = useState(false);

  const handleSaveSettings = async () => {
    if (!isOwner || !invoice?.id) return;
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

  // Render owner settings card
  const renderOwnerControls = () => {
    if (!isOwner) return null;
    return (
      <div className="mb-4 bg-surface-container-low border border-primary/25 rounded-2xl p-4 shadow-sm print:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <MaterialIcon icon="admin_panel_settings" className="text-[18px]" />
              Owner Controls (Invoice Owner)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowOwnerDrawer(!showOwnerDrawer)}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showOwnerDrawer ? 'Hide Details' : 'Configure Modes & Subjects'}</span>
            <MaterialIcon icon={showOwnerDrawer ? 'expand_less' : 'tune'} className="text-[16px]" />
          </button>
        </div>

        {/* Quick active mode subject edit */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-outline-variant/40">
            <span className="text-[11px] font-bold text-on-surface-variant whitespace-nowrap">
              {documentType === 'quotation' ? 'Quotation Subject:' : documentType === 'challan' ? 'Challan Subject:' : 'Invoice Subject:'}
            </span>
            <input
              type="text"
              value={
                documentType === 'quotation' ? subjectQuotation : documentType === 'challan' ? subjectChallan : subjectInvoice
              }
              onChange={(e) => {
                const val = e.target.value;
                if (documentType === 'quotation') setSubjectQuotation(val);
                else if (documentType === 'challan') setSubjectChallan(val);
                else setSubjectInvoice(val);
              }}
              disabled={!subjectEnabled}
              placeholder="Enter subject..."
              className="w-full text-xs bg-transparent outline-none disabled:opacity-50 text-on-surface"
            />
          </div>

          <div className="flex items-center gap-2 justify-end">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-on-surface select-none">
              <input
                type="checkbox"
                checked={subjectEnabled}
                onChange={(e) => setSubjectEnabled(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-primary focus:ring-primary"
              />
              <span>Subject</span>
            </label>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="px-3 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSavingSettings ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <MaterialIcon icon="save" className="text-[15px]" />
              )}
              <span>{isSavingSettings ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>

        {settingsSavedMessage && (
          <div className="mt-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
            {settingsSavedMessage}
          </div>
        )}

        {/* Expanded Mode & All Subjects Drawer */}
        {showOwnerDrawer && (
          <div className="mt-3 pt-3 border-t border-outline-variant/30 space-y-3">
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1.5 uppercase tracking-wider">
                Public Document Mode Availability
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="flex items-center justify-between p-2 rounded-lg bg-surface border border-outline-variant/40 cursor-pointer text-xs">
                  <span className="font-medium text-on-surface">Invoice Mode</span>
                  <input
                    type="checkbox"
                    checked={invoiceModeEnabled}
                    onChange={(e) => {
                      if (invoiceModeEnabled && !challanModeEnabled && !quotationModeEnabled) return;
                      setInvoiceModeEnabled(e.target.checked);
                    }}
                    className="w-4 h-4 rounded text-primary"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg bg-surface border border-outline-variant/40 cursor-pointer text-xs">
                  <span className="font-medium text-on-surface">Challan Mode</span>
                  <input
                    type="checkbox"
                    checked={challanModeEnabled}
                    onChange={(e) => {
                      if (challanModeEnabled && !invoiceModeEnabled && !quotationModeEnabled) return;
                      setChallanModeEnabled(e.target.checked);
                    }}
                    className="w-4 h-4 rounded text-primary"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg bg-surface border border-outline-variant/40 cursor-pointer text-xs">
                  <span className="font-medium text-on-surface">Quotation Mode</span>
                  <input
                    type="checkbox"
                    checked={quotationModeEnabled}
                    onChange={(e) => {
                      if (quotationModeEnabled && !invoiceModeEnabled && !challanModeEnabled) return;
                      setQuotationModeEnabled(e.target.checked);
                    }}
                    className="w-4 h-4 rounded text-primary"
                  />
                </label>
              </div>
            </div>

            {/* All Subjects */}
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1.5 uppercase tracking-wider">
                Custom Subjects per Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-on-surface-variant font-semibold">Commercial Invoice</span>
                  <input
                    type="text"
                    value={subjectInvoice}
                    onChange={(e) => setSubjectInvoice(e.target.value)}
                    placeholder="Bill for Items/Services"
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-surface border border-outline-variant/40 focus:border-primary outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-on-surface-variant font-semibold">Delivery Challan</span>
                  <input
                    type="text"
                    value={subjectChallan}
                    onChange={(e) => setSubjectChallan(e.target.value)}
                    placeholder="Delivery Challan for Items/Services"
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-surface border border-outline-variant/40 focus:border-primary outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-on-surface-variant font-semibold">Quotation</span>
                  <input
                    type="text"
                    value={subjectQuotation}
                    onChange={(e) => setSubjectQuotation(e.target.value)}
                    placeholder="Quotation for Items/Services"
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-surface border border-outline-variant/40 focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="px-4 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <MaterialIcon icon="save" className="text-[16px]" />
                <span>Save Mode & Subject Changes</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Sticky Action Toolbar for Desktop (Zoom, Doc Text Resizer, Row Text Resizer, Print) */}
      <div className="hidden md:flex sticky top-4 z-40 mb-4 items-center gap-2 bg-surface-container shadow-md p-1.5 rounded-xl border border-outline-variant/30 print:hidden flex-wrap justify-center">
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
          onClick={() => window.print()}
          className="px-3 h-8 bg-primary text-on-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <MaterialIcon icon="download" className="text-[16px]" />
          <span>Print / PDF</span>
        </button>
      </div>

      {/* Desktop Configuration & Display Options Panel (Hidden on mobile so invoice is 1st!) */}
      <div className="hidden md:block w-full max-w-3xl px-4 md:px-0 mx-auto mb-4">
        {renderOwnerControls()}

        <div className="print:hidden">
          <TemplateSelector 
            selectedTemplate={currentTemplate} 
            onSelect={handleTemplateChange} 
          />
          {templateSavedNotification && (
            <div className="mt-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {templateSavedNotification}
            </div>
          )}
        </div>
        <div className="mt-4">
          <InvoiceDisplayOptions 
            showGroups={showGroups}
            setShowGroups={setShowGroups}
            showGroupTotals={showGroupTotals}
            setShowGroupTotals={setShowGroupTotals}
            hasGroups={hasGroups}
            isChallan={isChallan}
            setIsChallan={(val) => setDocumentType(val ? 'challan' : 'invoice')}
            isQuotation={isQuotation}
            setIsQuotation={(val) => setDocumentType(val ? 'quotation' : 'invoice')}
            documentType={documentType}
            setDocumentType={setDocumentType}
            textSize={textSize}
            setTextSize={setTextSize}
            overallTextSize={overallTextSize}
            setOverallTextSize={setOverallTextSize}
            invoiceModeEnabled={invoiceModeEnabled}
            challanModeEnabled={challanModeEnabled}
            quotationModeEnabled={quotationModeEnabled}
            isOwner={isOwner}
          />
        </div>
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
          onClick={() => window.print()}
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

              {/* Owner Controls inside Mobile Drawer */}
              {renderOwnerControls()}

              {/* Template Selector */}
              <div>
                <TemplateSelector 
                  selectedTemplate={currentTemplate} 
                  onSelect={handleTemplateChange} 
                />
                {templateSavedNotification && (
                  <div className="mt-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {templateSavedNotification}
                  </div>
                )}
              </div>

              {/* Document Format, Overall Font Size, Table Items Font Size, Group Toggles */}
              <InvoiceDisplayOptions 
                showGroups={showGroups}
                setShowGroups={setShowGroups}
                showGroupTotals={showGroupTotals}
                setShowGroupTotals={setShowGroupTotals}
                hasGroups={hasGroups}
                isChallan={isChallan}
                setIsChallan={(val) => setDocumentType(val ? 'challan' : 'invoice')}
                isQuotation={isQuotation}
                setIsQuotation={(val) => setDocumentType(val ? 'quotation' : 'invoice')}
                documentType={documentType}
                setDocumentType={setDocumentType}
                textSize={textSize}
                setTextSize={setTextSize}
                overallTextSize={overallTextSize}
                setOverallTextSize={setOverallTextSize}
                invoiceModeEnabled={invoiceModeEnabled}
                challanModeEnabled={challanModeEnabled}
                quotationModeEnabled={quotationModeEnabled}
                isOwner={isOwner}
              />

              {/* Primary Download / Print PDF Button */}
              <button
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  setTimeout(() => window.print(), 150);
                }}
                className="w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-98 transition-all cursor-pointer mt-2"
              >
                <MaterialIcon icon="download" className="text-[20px]" />
                <span>Download / Print PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
          textSize={textSize}
          overallTextSize={overallTextSize}
        />
      </div>
    </div>
  );
}
