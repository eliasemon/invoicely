'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { availableTemplates } from '@/components/create/TemplateSelector';
import { InvoiceTemplateRenderer } from '@/components/templates/InvoiceTemplateRenderer';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function TemplatesGalleryPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(availableTemplates[0]?.id || 'modern-template');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
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
    userId: mockProfile.id,
    clientId: 'client-123',
    invoiceNumber: 'INV-2026-042',
    clientName: 'Acme Corporation',
    clientPhone: '+1 (555) 123-4567',
    clientAddress: '123 Business Rd.\nSuite 100\nMetropolis, NY 10001',
    amount: 1450,
    status: 'DRAFT' as const,
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
        <aside className={`absolute md:relative inset-y-0 left-0 z-50 w-[85%] max-w-[320px] md:w-80 lg:w-96 bg-surface-container-lowest border-r border-outline-variant overflow-y-auto flex-shrink-0 transition-transform duration-300 transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
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
        <main className="flex-1 bg-surface-container relative overflow-y-auto overflow-x-hidden flex flex-col">
          <div className="sticky top-0 bg-surface/80 backdrop-blur border-b border-outline-variant/50 p-sm z-20 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-xs">
              <span className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">Previewing</span>
              <span className="font-label-sm font-bold text-primary bg-primary-container text-on-primary-container px-2 py-0.5 rounded-md">{selectedTemplateName}</span>
            </div>
            <div className="flex items-center gap-xs">
               <MaterialIcon icon="desktop_windows" className="text-on-surface-variant text-[16px]" />
               <span className="font-label-sm text-on-surface-variant hidden sm:inline">Desktop View</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden relative bg-surface-container">
            <TransformWrapper
              initialScale={typeof window !== 'undefined' && window.innerWidth < 768 ? 0.35 : 1}
              minScale={0.2}
              maxScale={3}
              centerOnInit={true}
              wheel={{ step: 0.1 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  {/* Zoom Controls Overlay */}
                  <div className="absolute bottom-4 right-4 z-30 flex gap-2 bg-surface-container-lowest p-1.5 rounded-lg shadow-md border border-outline-variant/30">
                    <button onClick={() => zoomOut()} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container rounded-md text-on-surface-variant transition-colors" title="Zoom Out">
                      <MaterialIcon icon="remove" className="text-[24px]" />
                    </button>
                    <div className="w-px bg-outline-variant/30 my-1 mx-0.5"></div>
                    <button onClick={() => resetTransform()} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container rounded-md text-on-surface-variant transition-colors" title="Reset">
                      <MaterialIcon icon="fit_screen" className="text-[20px]" />
                    </button>
                    <div className="w-px bg-outline-variant/30 my-1 mx-0.5"></div>
                    <button onClick={() => zoomIn()} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container rounded-md text-on-surface-variant transition-colors" title="Zoom In">
                      <MaterialIcon icon="add" className="text-[24px]" />
                    </button>
                  </div>
                  
                  {/* Interactive Viewport */}
                  <TransformComponent wrapperClass="w-full h-full cursor-grab active:cursor-grabbing" contentClass="w-full h-full flex items-center justify-center py-xl">
                    <div className="bg-surface-container-lowest rounded-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden w-[210mm] max-w-[210mm] border border-outline-variant/20 flex-shrink-0 transition-shadow hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] pointer-events-none sm:pointer-events-auto">
                      <InvoiceTemplateRenderer 
                        templateId={selectedTemplate} 
                        invoice={mockInvoice} 
                        profile={mockProfile}
                        isPreview={true}
                        publicUrl={`${process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')}/public/invoice/demo-123`}
                      />
                    </div>
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </div>
        </main>
      </div>
    </div>
  );
}
