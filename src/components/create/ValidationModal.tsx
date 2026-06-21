'use client';

import { MaterialIcon } from '@/components/shared/MaterialIcon';

export interface ValidationError {
  message: string;
  elementId: string;
}

interface ValidationModalProps {
  isOpen: boolean;
  errors: ValidationError[];
  onClose: (elementId?: string) => void;
}

export function ValidationModal({ isOpen, errors, onClose }: ValidationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="absolute inset-0" 
        onClick={() => onClose()} 
        aria-hidden="true" 
      />
      <div className="relative bg-surface rounded-3xl shadow-2xl w-[95vw] sm:w-[400px] md:w-[450px] overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="w-12 h-12 bg-error-container text-on-error-container rounded-full flex items-center justify-center mb-sm">
            <MaterialIcon icon="warning" className="text-[24px]" />
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Please fix errors</h3>
          <p className="font-body-md text-on-surface-variant mb-4">
            The following issues must be resolved before proceeding:
          </p>
          
          <ul className="space-y-2 mb-lg">
            {errors.map((error, idx) => (
              <li key={idx} className="flex gap-2 items-start font-body-sm text-error">
                <MaterialIcon icon="error" className="text-[16px] mt-[2px] shrink-0" />
                <span>{error.message}</span>
              </li>
            ))}
          </ul>
          
          <div className="flex justify-end mt-lg">
            <button
              type="button"
              onClick={() => onClose(errors[0]?.elementId)}
              className="px-6 py-2 font-label-md bg-primary text-on-primary hover:bg-on-primary-fixed rounded-full transition-colors active:scale-95"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
