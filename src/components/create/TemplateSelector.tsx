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
  const templates: TemplateOption[] = [
    { id: 'corporate-template', name: 'Corporate', image: '/templates/corporate-template.png' },
    { id: 'elegant-template', name: 'Elegant', image: '/templates/elegant-template.png' },
    { id: 'modern-template', name: 'Modern', image: '/templates/modern-template.png' },
    { id: 'minimalist-with-qr-code', name: 'Minimalist QR', image: '/templates/minimalist-with-qr-code.png' },
    { id: 'pristine-a4', name: 'Pristine (A4)', image: '/templates/pristine-a4.png' },
    { id: 'grouped-fintech-a4', name: 'Grouped Fintech', image: '/templates/grouped-fintech-a4.png' },
    { id: 'high-density-flat-a4', name: 'High Density', image: '/templates/high-density-flat-a4.png' },
    { id: 'mixed-groups-a4', name: 'Mixed Groups', image: '/templates/mixed-groups-a4.png' },
    { id: 'geometric-a4', name: 'Geometric', image: '/templates/geometric-a4.png' },
    { id: 'fintech-a4', name: 'Fintech (A4)', image: '/templates/fintech-a4.png' },
    { id: 'heritage-a4', name: 'Heritage (A4)', image: '/templates/heritage-a4.png' },
    { id: 'enterprise-a4', name: 'Enterprise (A4)', image: '/templates/enterprise-a4.png' },
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
