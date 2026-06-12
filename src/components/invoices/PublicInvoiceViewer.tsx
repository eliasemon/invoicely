'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { InvoiceTemplateRenderer } from '@/components/templates/InvoiceTemplateRenderer';
import { InvoiceDisplayOptions } from '@/components/templates/InvoiceDisplayOptions';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

export function PublicInvoiceViewer({ invoice, profile, publicUrl, templateId }: any) {
  const [showGroups, setShowGroups] = useState(false);
  const [showGroupTotals, setShowGroupTotals] = useState(false);
  
  const [previewZoom, setPreviewZoom] = useState(0.5);
  const [previewInvoiceHeight, setPreviewInvoiceHeight] = useState(1123);
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const previewInvoiceRef = useRef<HTMLDivElement>(null);

  const hasGroups = invoice.groups && invoice.groups.length > 0 && invoice.groups.some((g: any) => g.name && g.name.trim() !== '');

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

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Zoom Controls (Sticky for easy access) */}
      <div className="sticky top-4 z-40 mb-4 flex items-center gap-1 bg-surface-container shadow-md p-1 rounded-lg border border-outline-variant/30 print:hidden">
        <button 
          onClick={previewZoomOut} 
          className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-md text-on-surface-variant transition-colors active:scale-95" 
          title="Zoom Out"
        >
          <MaterialIcon icon="remove" className="text-[18px]" />
        </button>
        
        <span className="font-label-sm text-on-surface-variant px-2 min-w-[50px] text-center font-semibold text-xs">
          {Math.round(previewZoom * 100)}%
        </span>
        
        <button 
          onClick={previewZoomIn} 
          className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-md text-on-surface-variant transition-colors active:scale-95" 
          title="Zoom In"
        >
          <MaterialIcon icon="add" className="text-[18px]" />
        </button>
        
        <div className="w-px bg-outline-variant/50 h-5 mx-1"></div>
        
        <button 
          onClick={previewFitToWidth} 
          className="px-2.5 h-8 flex items-center gap-1 hover:bg-surface-container-high rounded-md text-on-surface-variant transition-colors active:scale-95 text-[11px] font-medium" 
          title="Fit to Width"
        >
          <MaterialIcon icon="fit_width" className="text-[15px]" />
          <span>Fit</span>
        </button>
      </div>

      <div className="w-full max-w-3xl px-4 md:px-0 mx-auto">
        <InvoiceDisplayOptions 
          showGroups={showGroups}
          setShowGroups={setShowGroups}
          showGroupTotals={showGroupTotals}
          setShowGroupTotals={setShowGroupTotals}
          hasGroups={hasGroups}
        />
      </div>

      {/* Scrollable Document Canvas Viewport */}
      <div 
        ref={previewViewportRef}
        className="w-full overflow-auto bg-transparent select-text"
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
            className="transition-shadow overflow-hidden bg-transparent print:transform-none print:static print:w-[210mm] print:shadow-none print:border-none"
          >
            <InvoiceTemplateRenderer 
              templateId={templateId} 
              invoice={invoice} 
              profile={profile} 
              publicUrl={publicUrl}
              showGroups={showGroups}
              showGroupTotals={showGroupTotals}
              isPreview={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
