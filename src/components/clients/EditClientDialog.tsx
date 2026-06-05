'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { updateClient } from '@/app/actions/clientActions';
import { useRouter } from 'next/navigation';

interface EditClientDialogProps {
  id: string;
  name: string;
  phone: string;
  address: string;
  onClose: () => void;
}

export function EditClientDialog({ id, name: initialName, phone: initialPhone, address: initialAddress, onClose }: EditClientDialogProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateClient(id, { name, phone, address });
      router.refresh();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to update client.');
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-3xl w-[95vw] md:w-[70vw] lg:w-[50vw] xl:w-[40vw] p-6 shadow-2xl flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Edit Client</h2>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full">
            <MaterialIcon icon="close" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant">Client Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg h-12 px-4 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant">Phone Number</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg h-12 px-4 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant">Address</label>
            <textarea 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg p-4 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[100px] resize-none"
              placeholder="123 Business Rd&#10;Suite 100&#10;City, State 12345"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 font-label-lg font-medium text-primary hover:bg-surface-variant rounded-full transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isLoading || !name.trim()}
            className="px-6 py-2.5 bg-primary text-on-primary font-label-lg font-medium rounded-full shadow-sm hover:shadow-md active:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
