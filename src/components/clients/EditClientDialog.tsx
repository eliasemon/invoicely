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
  email?: string;
  whatsappPhone?: string;
  whatsappPreferred?: boolean;
  onClose: () => void;
}

export function EditClientDialog({ 
  id, 
  name: initialName, 
  phone: initialPhone, 
  address: initialAddress, 
  email: initialEmail = '',
  whatsappPhone: initialWhatsappPhone = '',
  whatsappPreferred: initialWhatsappPreferred = false,
  onClose 
}: EditClientDialogProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [email, setEmail] = useState(initialEmail);
  const [whatsappPhone, setWhatsappPhone] = useState(initialWhatsappPhone);
  const [whatsappPreferred, setWhatsappPreferred] = useState(initialWhatsappPreferred);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!val.trim()) {
      setEmailError(null);
    } else {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(val.trim())) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError(null);
      }
    }
  };

  const handleSave = async () => {
    if (email && emailError) return;
    setIsLoading(true);
    try {
      await updateClient(id, { 
        name, 
        phone, 
        address, 
        email: email.trim() || undefined,
        whatsappPhone: whatsappPhone.trim() || undefined,
        whatsappPreferred
      });
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface rounded-3xl w-[95vw] md:w-[70vw] lg:w-[50vw] xl:w-[40vw] p-6 shadow-2xl flex flex-col gap-5 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-outline-variant pb-3">
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
            <label className="font-label-md text-label-md text-on-surface-variant">Primary Phone Number</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg h-12 px-4 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="+8801712345678"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant">WhatsApp Number (Optional)</label>
            <input 
              type="tel" 
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg h-12 px-4 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Leave blank to use primary phone"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-on-surface font-medium select-none">
            <input 
              type="checkbox"
              checked={whatsappPreferred}
              onChange={(e) => setWhatsappPreferred(e.target.checked)}
              className="rounded border-outline-variant accent-primary cursor-pointer w-4 h-4"
            />
            <span>Customer prefers WhatsApp communication</span>
          </label>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-label-md text-label-md text-on-surface-variant">Email Address (Optional)</label>
              <span className="text-xs text-outline">Optional</span>
            </div>
            <input 
              type="email" 
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`w-full bg-surface-container-lowest border text-on-surface font-body-lg h-12 px-4 rounded-xl outline-none transition-all ${
                emailError ? 'border-error focus:ring-1 focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
              placeholder="billing@acmecorp.com"
            />
            {emailError && (
              <p className="text-error text-xs">{emailError}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant">Address</label>
            <textarea 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg p-4 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[80px] resize-none"
              placeholder="123 Business Rd&#10;City, Country"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2 border-t border-outline-variant/60 pt-4">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 font-label-lg font-medium text-primary hover:bg-surface-variant rounded-full transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isLoading || !name.trim() || Boolean(emailError)}
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
