'use client';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

interface TemplateOption {
  id: string;
  name: string;
  wireframe: React.ReactNode;
}

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (id: string) => void;
}

export function TemplateSelector({ selectedTemplate, onSelect }: Readonly<TemplateSelectorProps>) {
  const templates: TemplateOption[] = [
    {
      id: 'minimal',
      name: 'Minimal',
      wireframe: (
        <div className="p-2 space-y-2 opacity-50">
          <div className="h-2 w-12 bg-outline rounded"></div>
          <div className="h-1 w-8 bg-outline rounded"></div>
          <div className="mt-4 h-1 w-full bg-outline rounded"></div>
          <div className="h-1 w-3/4 bg-outline rounded"></div>
        </div>
      )
    },
    {
      id: 'corporate',
      name: 'Corporate',
      wireframe: (
        <div className="p-2 space-y-2 opacity-50">
          <div className="flex justify-between">
            <div className="h-2 w-8 bg-primary rounded"></div>
            <div className="h-2 w-8 bg-outline rounded"></div>
          </div>
          <div className="mt-4 h-1 w-full bg-outline rounded"></div>
          <div className="h-1 w-3/4 bg-outline rounded"></div>
        </div>
      )
    },
    {
      id: 'modern',
      name: 'Modern',
      wireframe: (
        <div className="p-2 space-y-2 opacity-50">
          <div className="h-6 w-6 rounded-full bg-primary mb-2"></div>
          <div className="h-2 w-16 bg-outline rounded"></div>
          <div className="h-1 w-full bg-outline rounded"></div>
        </div>
      )
    }
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
              <div className={`h-32 rounded-lg mb-2 overflow-hidden relative ${
                t.id === 'modern' ? 'bg-gradient-to-br from-surface-container to-surface-container-high' : 'bg-surface-container-low'
              } ${t.id === 'corporate' ? 'border-t-4 border-primary' : ''}`}>
                {t.wireframe}
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
