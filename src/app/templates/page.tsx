'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { availableTemplates } from '@/components/templates/TemplateSelector';
import { InvoiceTemplateRenderer } from '@/components/templates/InvoiceTemplateRenderer';
import { InvoiceDisplayOptions } from '@/components/templates/InvoiceDisplayOptions';

export default function TemplatesGalleryPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(availableTemplates[0]?.id || 'modern-template');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [zoom, setZoom] = useState(0.85);
  const [showGroups, setShowGroups] = useState(false);
  const [showGroupTotals, setShowGroupTotals] = useState(false);

  // Refs and dimensions for scaling
  const previewPaneRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [invoiceHeight, setInvoiceHeight] = useState(1123);
  const [paneDimensions, setPaneDimensions] = useState({ width: 800, height: 600 });

  // Observe unscaled invoice height
  useEffect(() => {
    if (!invoiceRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setInvoiceHeight(entry.contentRect.height || 1123);
      }
    });
    observer.observe(invoiceRef.current);
    return () => observer.disconnect();
  }, []);

  // Observe preview pane dimensions
  useEffect(() => {
    if (!previewPaneRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setPaneDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(previewPaneRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-fit on initial load depending on window size
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        // Dynamically calculate zoom to fit A4 width within mobile viewport
        const mobilePadding = 48; // p-md = 24px each side
        const fitZoom = (window.innerWidth - mobilePadding) / 794;
        setZoom(Math.max(0.2, Math.min(fitZoom, 1.0)));
      } else {
        setZoom(0.85); // Desktop standard preview size
      }
    }
  }, []);

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2.0));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.3));
  };

  const fitToWidth = () => {
    if (!previewPaneRef.current) return;
    const padding = 48; // Padding on sides
    const widthScale = (paneDimensions.width - padding) / 794;
    setZoom(Math.max(0.3, Math.min(widthScale, 2.0)));
  };

  const fitToPage = () => {
    if (!previewPaneRef.current) return;
    const padding = 48; // Padding top/bottom
    const heightScale = (paneDimensions.height - padding) / invoiceHeight;
    setZoom(Math.max(0.3, Math.min(heightScale, 2.0)));
  };
  
  const mockProfile = {
    id: 'demo-profile-123',
    company_name: 'NovaTech Industries',
    company_address: '123 Innovation Blvd.\nSuite 400\nSan Francisco, CA 94105',
    email: 'billing@novatech.io',
    phone: '+1 (555) 019-8273',
    website: 'www.novatech.io',
    default_currency: 'USD',
    currency_symbol: '$',
    bank_enabled: true,
    bank_name: 'Global Horizon Bank',
    bank_account_holder: 'NovaTech Industries Inc.',
    bank_account_number: '0987654321',
    bank_swift: 'GHB-US33',
    signature_enabled: true,
    signature_url: null,
    signatory_name: 'Alexander Wright',
    qr_code_enabled: true,
    tax_id: 'US-123456789',
    business_registration: 'REG-987654'
  };

  const mockInvoice = {
    id: 'preview',
    profile_id: mockProfile.id,
    client_id: 'client-123',
    invoice_number: 'INV-2026-042',
    client_name: 'Acme Corporation',
    client_phone: '+1 (555) 123-4567',
    client_address: '123 Business Rd.\nSuite 100\nMetropolis, NY 10001',
    total_amount: 1450,
    amount_paid: 0,
    status: 'DRAFT' as const,
    line_items_snapshot: [
      {
        id: 'group-1',
        name: 'Web Development Services',
        items: [
          { id: 'item-1', name: 'Frontend React Development', quantity: 40, unitPrice: 65 },
          { id: 'item-2', name: 'Backend Node.js API', quantity: 20, unitPrice: 75 },
          { id: 'item-3', name: 'UI/UX Design', quantity: 15, unitPrice: 50 },
        ]
      }
    ],
    logs: [] as any[],
    created_at: new Date(),
    updated_at: new Date(),
    currency: 'USD',
    currency_symbol: '$',
    signature_url: null,
    signatory_name: mockProfile.signatory_name,
    bank_name: mockProfile.bank_name,
    bank_account_holder: mockProfile.bank_account_holder,
    bank_account_number: mockProfile.bank_account_number,
    bank_swift: mockProfile.bank_swift,
    discount_type: 'percentage' as const,
    discount_value: 0,
    shipping_cost: 0,
    // CamelCase aliases for template compatibility
    invoiceNumber: 'INV-2026-042',
    clientName: 'Acme Corporation',
    clientPhone: '+1 (555) 123-4567',
    clientAddress: '123 Business Rd.\nSuite 100\nMetropolis, NY 10001',
    amount: 1450,
    amountPaid: 0,
    groups: [
      {
        id: 'group-1',
        name: 'Web Development Services',
        items: [
          { id: 'item-1', name: 'Frontend React Development', quantity: 40, unitPrice: 65 },
          { id: 'item-2', name: 'Backend Node.js API', quantity: 20, unitPrice: 75 },
          { id: 'item-3', name: 'UI/UX Design', quantity: 15, unitPrice: 50 },
        ]
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const selectedTemplateName = availableTemplates.find(t => t.id === selectedTemplate)?.name || selectedTemplate;

  return (
    <div className="min-h-screen bg-background flex flex-col antialiased">
      {/* Header */}
      <header className="bg-surface border-b border-outline-variant h-16 flex items-center justify-between px-margin-mobile md:px-margin-desktop sticky top-0 z-40">
        <div className="flex items-center gap-xs">
          <Link href="/" className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-surface-container">
            <MaterialIcon icon="arrow_back" />
          </Link>
          <div className="flex flex-col ml-xs">
            <h1 className="font-headline-sm text-primary font-bold leading-tight">Template Gallery</h1>
            <p className="font-label-sm text-on-surface-variant hidden md:block">Explore and preview all available invoice styles</p>
          </div>
        </div>
        <div className="flex items-center gap-sm">
          <button 
            className="md:hidden text-primary flex items-center gap-xs border border-outline-variant px-sm py-xs rounded-lg text-label-sm font-label-sm hover:bg-surface-container"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <MaterialIcon icon="menu" className="text-[18px]" />
            Templates
          </button>
          <Link href={`/create`} className="bg-primary text-on-primary font-label-sm text-label-sm px-md py-xs rounded-lg hover:bg-primary-container transition-colors duration-200 active:scale-95 flex items-center gap-xs h-10 shadow-sm hidden sm:flex">
            <MaterialIcon icon="add" className="text-[18px]" />
            Use Template
          </Link>
          {/* Mobile use template icon only */}
          <Link href={`/create`} className="bg-primary text-on-primary w-10 h-10 rounded-lg hover:bg-primary-container transition-colors duration-200 active:scale-95 flex items-center justify-center shadow-sm sm:hidden">
            <MaterialIcon icon="add" className="text-[20px]" />
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar: Template List */}
        <aside className={`absolute md:relative inset-y-0 left-0 z-30 w-[85%] max-w-[320px] md:w-80 lg:w-96 bg-surface-container-lowest border-r border-outline-variant overflow-y-auto flex-shrink-0 transition-transform duration-300 transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-md pb-xs sticky top-0 bg-surface-container-lowest/90 backdrop-blur z-10 border-b border-outline-variant/30 flex justify-between items-start">
            <div>
              <h2 className="font-headline-sm text-primary mb-xs">Available Templates</h2>
              <p className="font-body-sm text-on-surface-variant mb-0">{availableTemplates.length} professionally designed styles.</p>
            </div>
            <button 
              className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-full -mr-2 -mt-2 transition-colors"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <MaterialIcon icon="close" />
            </button>
          </div>
          
          <div className="p-sm grid grid-cols-2 gap-sm">
            {availableTemplates.map((template) => {
              const isActive = selectedTemplate === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`flex flex-col items-center text-left border-2 rounded-xl p-xs relative transition-all duration-200 group overflow-hidden ${
                    isActive ? 'border-primary bg-primary-fixed/20' : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="w-full aspect-[3/4] rounded-lg mb-2 overflow-hidden bg-surface-container-low border border-outline-variant/30 relative">
                    {template.image ? (
                      <img src={template.image} alt={template.name} className="w-full h-full object-cover object-top" />
                    ) : (
                      template.wireframe
                    )}
                    {/* Hover overlay */}
                    <div className={`absolute inset-0 bg-primary/5 transition-opacity ${isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}></div>
                  </div>
                  <p className={`font-label-sm w-full text-center truncate ${isActive ? 'font-bold text-primary' : 'font-medium text-on-surface-variant'}`}>
                    {template.name}
                  </p>
                  
                  {isActive && (
                    <div className="absolute top-2 right-2 bg-primary text-on-primary rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                      <MaterialIcon icon="check" className="text-[14px]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content: Live Preview */}
        <main className="flex-1 bg-surface-container relative overflow-hidden flex flex-col">
          {/* Subheader Toolbar */}
          <div className="bg-surface/85 backdrop-blur border-b border-outline-variant/50 p-sm z-20 flex flex-wrap gap-y-sm justify-between items-center shadow-sm">
            <div className="flex items-center gap-xs">
              <span className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">Previewing</span>
              <span className="font-label-sm font-bold text-primary bg-primary-container text-on-primary-container px-2 py-0.5 rounded-md">{selectedTemplateName}</span>
            </div>

            {/* Document Zoom Controls */}
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/30">
              <button 
                onClick={zoomOut} 
                className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-md text-on-surface-variant transition-colors active:scale-95" 
                title="Zoom Out"
              >
                <MaterialIcon icon="remove" className="text-[18px]" />
              </button>
              
              <span className="font-label-sm text-on-surface-variant px-2 min-w-[50px] text-center font-semibold">
                {Math.round(zoom * 100)}%
              </span>
              
              <button 
                onClick={zoomIn} 
                className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-md text-on-surface-variant transition-colors active:scale-95" 
                title="Zoom In"
              >
                <MaterialIcon icon="add" className="text-[18px]" />
              </button>
              
              <div className="w-px bg-outline-variant/50 h-5 mx-1"></div>
              
              <button 
                onClick={fitToWidth} 
                className="px-2.5 h-8 flex items-center gap-1 hover:bg-surface-container-high rounded-md text-on-surface-variant transition-colors active:scale-95 text-[11px] font-medium" 
                title="Fit to Width"
              >
                <MaterialIcon icon="swap_horiz" className="text-[15px]" />
                <span className="hidden sm:inline">Fit Width</span>
              </button>

              <button 
                onClick={fitToPage} 
                className="px-2.5 h-8 flex items-center gap-1 hover:bg-surface-container-high rounded-md text-on-surface-variant transition-colors active:scale-95 text-[11px] font-medium" 
                title="Fit to Page"
              >
                <MaterialIcon icon="swap_vert" className="text-[15px]" />
                <span className="hidden sm:inline">Fit Page</span>
              </button>
            </div>
          </div>
          
          <div className="flex-shrink-0 px-md pt-sm print:hidden bg-surface-container">
            <InvoiceDisplayOptions 
              showGroups={showGroups} 
              setShowGroups={setShowGroups} 
              showGroupTotals={showGroupTotals} 
              setShowGroupTotals={setShowGroupTotals} 
              hasGroups={mockInvoice.groups && mockInvoice.groups.length > 0}
            />
          </div>

          {/* Scrollable Document Canvas Viewport */}
          <div 
            ref={previewPaneRef}
            className="flex-1 overflow-auto flex justify-center items-start bg-surface-container select-text"
            style={{ touchAction: 'manipulation' }}
          >
            {/* Zoom Wrapper */}
            <div 
              style={{
                width: '100%',
                height: `${invoiceHeight * zoom}px`,
                position: 'relative',
              }}
              className="transition-all duration-200 ease-out"
            >
              {/* Scaled Invoice Document */}
              <div
                ref={invoiceRef}
                style={{
                  width: previewPaneRef.current ? `${previewPaneRef.current.clientWidth / zoom}px` : '100%',
                  minWidth: '794px',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                }}
                className="bg-transparent overflow-hidden"
              >
                <InvoiceTemplateRenderer 
                  templateId={selectedTemplate} 
                  invoice={mockInvoice} 
                  profile={mockProfile}
                  isPreview={true}
                  showGroups={showGroups}
                  showGroupTotals={showGroupTotals}
                  publicUrl={`${process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/public/invoice/demo-123`}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
