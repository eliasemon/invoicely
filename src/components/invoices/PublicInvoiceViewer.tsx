'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { InvoiceTemplateRenderer } from '@/components/templates/InvoiceTemplateRenderer';
import { InvoiceDisplayOptions } from '@/components/templates/InvoiceDisplayOptions';
import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { DocumentType, TextSize } from '@/components/templates/templateUtils';

interface PublicInvoiceViewerProps {
  invoice: any;
  profile: any;
  publicUrl?: string;
  templateId?: string;
  initialDocumentType?: DocumentType;
}

export function PublicInvoiceViewer({
  invoice,
  profile,
  publicUrl,
  templateId,
  initialDocumentType = 'invoice',
}: PublicInvoiceViewerProps) {
  const [showGroups, setShowGroups] = useState(false);
  const [showGroupTotals, setShowGroupTotals] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>(initialDocumentType);
  const [textSize, setTextSize] = useState<TextSize>('normal');
  const [currentTemplate, setCurrentTemplate] = useState(templateId || 'sleek-accent');
  
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

  const handleDecreaseTextSize = () => {
    if (textSize === 'large') setTextSize('normal');
    else if (textSize === 'normal') setTextSize('compact');
  };

  const handleIncreaseTextSize = () => {
    if (textSize === 'compact') setTextSize('normal');
    else if (textSize === 'normal') setTextSize('large');
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Sticky Action Toolbar (Zoom & PDF Text Size Controls) */}
      <div className="sticky top-4 z-40 mb-4 flex items-center gap-2 bg-surface-container shadow-md p-1.5 rounded-xl border border-outline-variant/30 print:hidden flex-wrap justify-center">
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

        {/* PDF Font Size Controls */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider px-1">
            Text:
          </span>
          <button
            onClick={handleDecreaseTextSize}
            disabled={textSize === 'compact'}
            className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-all cursor-pointer ${
              textSize === 'compact'
                ? 'opacity-30 cursor-not-allowed text-on-surface-variant'
                : 'hover:bg-surface-container-high text-on-surface active:scale-95'
            }`}
            title="Decrease text size (fit more rows)"
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
            title="Increase text size"
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

      <div className="w-full max-w-3xl px-4 md:px-0 mx-auto">
        <div className="print:hidden">
          <TemplateSelector 
            selectedTemplate={currentTemplate} 
            onSelect={setCurrentTemplate} 
          />
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
          />
        </div>
      </div>

      {/* Scrollable Document Canvas Viewport (Hidden during print) */}
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
              invoice={invoice} 
              profile={profile} 
              publicUrl={publicUrl}
              showGroups={showGroups}
              showGroupTotals={showGroupTotals}
              isPreview={false}
              isChallan={isChallan}
              isQuotation={isQuotation}
              documentType={documentType}
              textSize={textSize}
            />
          </div>
        </div>
      </div>

      {/* Dedicated Print Container */}
      <div className="hidden print:block w-[210mm] mx-auto bg-white border-none shadow-none m-0 p-0">
        <InvoiceTemplateRenderer 
          templateId={currentTemplate} 
          invoice={invoice} 
          profile={profile} 
          publicUrl={publicUrl}
          showGroups={showGroups}
          showGroupTotals={showGroupTotals}
          isPreview={false}
          isChallan={isChallan}
          isQuotation={isQuotation}
          documentType={documentType}
          textSize={textSize}
        />
      </div>
    </div>
  );
}
