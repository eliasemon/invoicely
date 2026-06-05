'use client';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

interface TemplateOption {
  id: string;
  name: string;
  image?: string;
  wireframe?: React.ReactNode;
}

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (id: string) => void;
}

export function TemplateSelector({ selectedTemplate, onSelect }: Readonly<TemplateSelectorProps>) {
  const getWireframeForTemplate = (id: string) => {
    switch (id) {
      case 'modern-purple':
        return (
          <div className="w-full h-full p-2 flex flex-col gap-1 bg-white">
            <div className="flex justify-between items-center">
              <div className="w-4 h-4 border border-dashed border-[#a78bfa] rounded"></div>
              <div className="w-8 h-2 bg-[#8b5cf6] rounded"></div>
            </div>
            <div className="w-full h-2 bg-[#ede9fe] rounded mt-1"></div>
            <div className="w-full h-2 bg-gray-50 rounded"></div>
            <div className="w-full h-2 bg-gray-50 rounded"></div>
            <div className="flex justify-end mt-auto">
              <div className="w-12 h-4 bg-gradient-to-r from-[#e9d5ff] to-[#f3e8ff] rounded"></div>
            </div>
          </div>
        );
      case 'sleek-accent':
        return (
          <div className="w-full h-full p-2 flex flex-col gap-1 bg-white">
            <div className="flex justify-between items-center">
              <div className="w-4 h-4 rounded-full bg-[#0b1b3d]"></div>
              <div className="w-8 h-2 bg-[#0b1b3d] rounded"></div>
            </div>
            <div className="w-full h-12 bg-[#0b1b3d]/10 rounded mt-1"></div>
            <div className="flex justify-between mt-auto">
              <div className="w-8 h-8 bg-gray-100 rounded"></div>
              <div className="w-10 h-8 bg-[#0b1b3d] rounded"></div>
            </div>
          </div>
        );
      case 'minimalist-with-qr-code':
        return (
          <div className="w-full h-full p-2 flex flex-col gap-1 bg-white">
            <div className="flex justify-between items-start">
              <div className="w-8 h-2 bg-gray-800 rounded"></div>
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
            <div className="w-full h-12 bg-gray-50 rounded mt-1"></div>
            <div className="flex justify-end mt-auto">
              <div className="w-10 h-6 bg-gray-100 rounded"></div>
            </div>
          </div>
        );
      case 'red-classic-grouped':
        return (
          <div className="w-full h-full p-2 flex flex-col gap-1 bg-white border-t-4 border-red-600">
            <div className="flex justify-between items-center mt-1">
              <div className="w-6 h-3 bg-red-600 rounded"></div>
              <div className="w-10 h-2 bg-gray-200 rounded"></div>
            </div>
            <div className="w-full h-2 bg-red-50 rounded mt-1"></div>
            <div className="w-full h-2 bg-gray-50 rounded"></div>
            <div className="flex justify-end mt-auto">
              <div className="w-12 h-3 bg-red-100 rounded"></div>
            </div>
          </div>
        );
      default:
        // Generic wireframe
        return (
          <div className="w-full h-full p-2 flex flex-col gap-1 bg-white">
            <div className="flex justify-between items-center">
              <div className="w-6 h-3 bg-gray-300 rounded"></div>
              <div className="w-10 h-2 bg-gray-200 rounded"></div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded mt-1"></div>
            <div className="w-full h-2 bg-gray-50 rounded"></div>
            <div className="w-full h-2 bg-gray-50 rounded"></div>
            <div className="w-full h-2 bg-gray-50 rounded"></div>
            <div className="flex justify-end mt-auto pt-1 border-t border-gray-100">
              <div className="w-12 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        );
    }
  };

  const templates: TemplateOption[] = [
    { id: 'corporate-template', name: 'Corporate', wireframe: getWireframeForTemplate('corporate-template') },
    { id: 'elegant-template', name: 'Elegant', wireframe: getWireframeForTemplate('elegant-template') },
    { id: 'modern-template', name: 'Modern', wireframe: getWireframeForTemplate('modern-template') },
    { id: 'minimalist-with-qr-code', name: 'Minimalist QR', wireframe: getWireframeForTemplate('minimalist-with-qr-code') },
    { id: 'pristine-a4', name: 'Pristine (A4)', wireframe: getWireframeForTemplate('pristine-a4') },
    { id: 'grouped-fintech-a4', name: 'Grouped Fintech', wireframe: getWireframeForTemplate('grouped-fintech-a4') },
    { id: 'high-density-flat-a4', name: 'High Density', wireframe: getWireframeForTemplate('high-density-flat-a4') },
    { id: 'mixed-groups-a4', name: 'Mixed Groups', wireframe: getWireframeForTemplate('mixed-groups-a4') },
    { id: 'red-classic-grouped', name: 'Red Classic', wireframe: getWireframeForTemplate('red-classic-grouped') },
    { id: 'geometric-a4', name: 'Geometric', wireframe: getWireframeForTemplate('geometric-a4') },
    { id: 'fintech-a4', name: 'Fintech (A4)', wireframe: getWireframeForTemplate('fintech-a4') },
    { id: 'heritage-a4', name: 'Heritage (A4)', wireframe: getWireframeForTemplate('heritage-a4') },
    { id: 'sleek-accent', name: 'Sleek Accent', wireframe: getWireframeForTemplate('sleek-accent') },
    { id: 'modern-purple', name: 'Modern Purple', wireframe: getWireframeForTemplate('modern-purple') },
    { id: 'enterprise-a4', name: 'Enterprise (A4)', wireframe: getWireframeForTemplate('enterprise-a4') },
  ];

  return (
    <section>
      <h2 className="font-body-lg text-body-lg font-semibold text-on-surface mb-sm">Template</h2>
      <div className="flex overflow-x-auto gap-sm hide-scrollbar pb-xs">
        {templates.map((t) => {
          const isActive = selectedTemplate === t.id;
          return (
            <div 
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`flex-shrink-0 w-[140px] border-2 rounded-xl p-xs relative cursor-pointer transition-all duration-200 ${
                isActive ? 'border-primary bg-surface-bright' : 'border-outline-variant'
              }`}
            >
              <div className={`h-32 rounded-lg mb-2 overflow-hidden relative bg-surface-container-low`}>
                {t.image ? (
                  <img src={t.image} alt={t.name} className="w-full h-full object-cover object-top" />
                ) : (
                  t.wireframe
                )}
              </div>
              <p className="font-label-sm text-label-sm text-center font-medium">{t.name}</p>
              <div className={`absolute top-2 right-2 bg-primary text-on-primary rounded-full w-5 h-5 flex items-center justify-center transition-opacity ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}>
                <MaterialIcon icon="check" className="text-[14px]" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
