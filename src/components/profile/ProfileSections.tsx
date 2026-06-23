'use client';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { UserProfile } from '@/hooks/useProfile';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface SectionProps {
  profile: Partial<UserProfile>;
  onChange: (updates: Partial<UserProfile>) => void;
}

export function BusinessInfoSection({ profile, onChange }: SectionProps) {
  return (
    <div className="scroll-mt-36 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300" id="business-section">
      <h2 className="font-headline-md text-headline-md mb-6 border-b border-surface-container-high pb-5">Business Information</h2>
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Legal Company Name</label>
          <input 
            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-outline" 
            type="text" 
            maxLength={50}
            value={profile.company_name || ''}
            onChange={(e) => onChange({ company_name: e.target.value })}
            placeholder="Acme Corporation Ltd."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Business Registration #</label>
            <input 
              className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-data-mono text-data-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-outline" 
              type="text" 
              maxLength={50}
              value={profile.business_registration || ''}
              onChange={(e) => onChange({ business_registration: e.target.value })}
              placeholder="CRN-98765432"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Tax ID / VAT Number</label>
            <input 
              className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-data-mono text-data-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-outline" 
              type="text" 
              maxLength={50}
              value={profile.tax_id || ''}
              onChange={(e) => onChange({ tax_id: e.target.value })}
              placeholder="US123456789"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegionalSettingsSection({ profile, onChange }: SectionProps) {
  const currencies = typeof Intl !== 'undefined' && Intl.supportedValuesOf 
    ? Intl.supportedValuesOf('currency').map(code => {
        try {
          const displayNames = new Intl.DisplayNames(['en'], { type: 'currency' });
          return { code, name: displayNames.of(code) || code };
        } catch {
          return { code, name: code };
        }
      }).sort((a, b) => a.name.localeCompare(b.name))
    : [
        { code: 'USD', name: 'US Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'British Pound' },
        { code: 'BDT', name: 'Bangladeshi Taka' }
      ];

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    try {
      const parts = new Intl.NumberFormat('en', { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
      const symbol = parts.find(p => p.type === 'currency')?.value || code;
      onChange({ default_currency: code, currency_symbol: symbol });
    } catch (err) {
      onChange({ default_currency: code });
    }
  };

  return (
    <div className="scroll-mt-36 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300" id="regional-section">
      <h2 className="font-headline-md text-headline-md mb-6 border-b border-surface-container-high pb-5">Regional Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Default Currency</label>
          <select 
            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-outline appearance-none"
            value={profile.default_currency || 'USD'}
            onChange={handleCurrencyChange}
          >
            {currencies.map(c => (
              <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Currency Symbol</label>
          <input 
            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-outline" 
            placeholder="e.g. $" 
            type="text" 
            maxLength={10}
            value={profile.currency_symbol || '$'}
            onChange={(e) => onChange({ currency_symbol: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export function ContactDetailsSection({ profile, onChange }: SectionProps) {
  return (
    <div className="scroll-mt-36 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300" id="contact-section">
      <h2 className="font-headline-md text-headline-md mb-6 border-b border-surface-container-high pb-5">Contact Details</h2>
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Primary Email Address</label>
          <input 
            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-outline" 
            type="email" 
            maxLength={150}
            value={profile.email || ''}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="billing@acmecorp.com"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 phone-input-wrapper">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Phone Number</label>
            <PhoneInput
              international
              defaultCountry="US"
              value={profile.phone ? (profile.phone.startsWith('+') ? '+' + profile.phone.replace(/\D/g, '') : '+' + profile.phone.replace(/\D/g, '')) : undefined}
              onChange={(val) => onChange({ phone: val ? val.toString() : '' })}
              className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body-md text-on-surface focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200 hover:border-outline phone-input-container"
            />
            <style jsx global>{`
              .phone-input-wrapper .phone-input-container .PhoneInputInput {
                border: none;
                outline: none;
                background: transparent;
                font-family: inherit;
                font-size: inherit;
                color: inherit;
                width: 100%;
                height: 100%;
              }
              .phone-input-wrapper .phone-input-container .PhoneInputCountry {
                margin-right: 12px;
              }
            `}</style>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Website</label>
            <input 
              className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-outline" 
              type="url" 
              maxLength={200}
              value={profile.website || ''}
              onChange={(e) => onChange({ website: e.target.value })}
              placeholder="https://acmecorp.com"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-4">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Billing Address</label>
          <textarea 
            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-outline resize-none" 
            rows={3} 
            maxLength={300}
            value={profile.billing_address || ''}
            onChange={(e) => onChange({ billing_address: e.target.value })}
            placeholder="123 Corporate Blvd, Suite 400&#10;San Francisco, CA 94105&#10;United States"
          />
        </div>
      </div>
    </div>
  );
}

import SignatureCanvas from 'react-signature-canvas';
import { useRef, useState } from 'react';

export function SignatureSection({ profile, onChange }: SectionProps) {
  const enabled = profile.signature_enabled ?? true;
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEditing, setIsEditing] = useState(false);

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
    onChange({ signature_url: null });
    setIsEditing(true);
  };

  const handleSignatureEnd = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataURL = sigCanvas.current.toDataURL('image/png');
      onChange({ signature_url: dataURL });
    }
  };

  const showCanvas = isEditing || !profile.signature_url;

  return (
    <div className="scroll-mt-36 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300" id="signature-section">
      <div className="flex items-center justify-between mb-6 border-b border-surface-container-high pb-5">
        <div>
          <h2 className="font-headline-md text-headline-md">Authorization Signature</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Appears at the bottom of standard invoices.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            checked={enabled} 
            onChange={(e) => onChange({ signature_enabled: e.target.checked })} 
            className="sr-only peer" 
            type="checkbox"
          />
          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
        </label>
      </div>
      <div className="transition-opacity duration-300 ease-in-out" style={{ opacity: enabled ? 1 : 0.4, pointerEvents: enabled ? 'auto' : 'none' }}>
        <div className="border border-outline-variant rounded-lg bg-surface relative overflow-hidden">
          <div className="absolute top-2 right-2 flex gap-2 z-20">
            <button 
              onClick={clearSignature}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors bg-surface/50 backdrop-blur-sm" 
              title="Clear"
            >
              <MaterialIcon icon="delete" className="text-sm" />
            </button>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors bg-surface/50 backdrop-blur-sm" 
              title="Draw New"
            >
              <MaterialIcon icon="draw" className="text-sm" />
            </button>
          </div>
          <div className="h-40 w-full relative">
            {!profile.signature_url && isEditing && (
              <span className="font-label-sm text-label-sm text-outline absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none z-0">
                Sign Here
              </span>
            )}
            
            {!showCanvas && profile.signature_url ? (
               // eslint-disable-next-line @next/next/no-img-element
               <img src={profile.signature_url} alt="Saved signature" className="w-full h-full object-contain z-10 relative" />
            ) : (
              <div className="absolute inset-0 z-10 cursor-crosshair">
                <SignatureCanvas 
                  ref={sigCanvas} 
                  onEnd={handleSignatureEnd}
                  penColor="#1c1b1f"
                  canvasProps={{ className: "w-full h-full" }} 
                />
              </div>
            )}
            <div className="absolute bottom-4 left-6 right-6 border-b border-surface-container-high border-dashed z-0"></div>
          </div>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <input 
            className="bg-transparent border-b border-outline-variant px-2 py-1 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-0 transition-colors w-1/2 hover:border-outline" 
            placeholder="Signatory Name (e.g. John Doe)" 
            type="text" 
            maxLength={50}
            value={profile.signatory_name || ''}
            onChange={(e) => onChange({ signatory_name: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export function BankDetailsSection({ profile, onChange }: SectionProps) {
  const enabled = profile.bank_enabled ?? true;

  return (
    <div className="scroll-mt-36 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300" id="bank-details-section">
      <div className="flex items-center justify-between mb-6 border-b border-surface-container-high pb-5">
        <div>
          <h2 className="font-headline-md text-headline-md">Bank Details</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Include banking information on your invoices.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            checked={enabled} 
            onChange={(e) => onChange({ bank_enabled: e.target.checked })} 
            className="sr-only peer" 
            type="checkbox"
          />
          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
        </label>
      </div>
      <div className="transition-opacity duration-300 ease-in-out" style={{ opacity: enabled ? 1 : 0.4, pointerEvents: enabled ? 'auto' : 'none' }}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Bank Name</label>
              <input 
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-outline" 
                placeholder="e.g. Chase Bank" 
                type="text"
                maxLength={100}
                value={profile.bank_name || ''}
                onChange={(e) => onChange({ bank_name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Account Holder Name</label>
              <input 
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-outline" 
                placeholder="e.g. Acme Corp Ltd" 
                type="text"
                maxLength={100}
                value={profile.bank_account_holder || ''}
                onChange={(e) => onChange({ bank_account_holder: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Account Number / IBAN</label>
              <input 
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-data-mono text-data-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-outline" 
                placeholder="e.g. US89 3704 ..." 
                type="text"
                maxLength={50}
                value={profile.bank_account_number || ''}
                onChange={(e) => onChange({ bank_account_number: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">SWIFT / BIC</label>
              <input 
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-data-mono text-data-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-outline" 
                placeholder="e.g. CHASUS33" 
                type="text"
                maxLength={30}
                value={profile.bank_swift || ''}
                onChange={(e) => onChange({ bank_swift: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QrCodeSection({ profile, onChange }: SectionProps) {
  const enabled = profile.qr_code_enabled ?? false;

  return (
    <div className="scroll-mt-36 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300" id="qr-code-section">
      <div className="flex items-center justify-between mb-6 border-b border-surface-container-high pb-5">
        <div>
          <h2 className="font-headline-md text-headline-md">QR Code Integration</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Display a QR Code on your invoices linking to the public invoice URL.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            checked={enabled} 
            onChange={(e) => onChange({ qr_code_enabled: e.target.checked })} 
            className="sr-only peer" 
            type="checkbox"
          />
          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
        </label>
      </div>
    </div>
  );
}

export function TermsAndConditionsSection({ profile, onChange }: SectionProps) {
  const enabled = profile.terms_and_conditions_enabled ?? true;

  return (
    <div className="scroll-mt-36 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300" id="terms-section">
      <div className="flex items-center justify-between mb-6 border-b border-surface-container-high pb-5">
        <div className="flex items-center gap-3">
          <MaterialIcon icon="gavel" className="text-secondary text-[24px]" />
          <div>
            <h2 className="font-headline-md text-headline-md">Terms & Conditions</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Add default terms, conditions, or notes to be displayed at the bottom of your invoices.</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            checked={enabled} 
            onChange={(e) => onChange({ terms_and_conditions_enabled: e.target.checked })} 
            className="sr-only peer" 
            type="checkbox"
          />
          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
        </label>
      </div>
      
      <div className={`transition-all duration-300 overflow-hidden ${enabled ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col gap-2">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Standard Terms</label>
          <textarea 
            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-outline min-h-[120px] resize-y" 
            placeholder="e.g. Please pay within 15 days of receiving this invoice. Late payments are subject to a 2% monthly fee." 
            value={profile.terms_and_conditions || ''}
            maxLength={2000}
            onChange={(e) => onChange({ terms_and_conditions: e.target.value })}
          />
          <p className="text-xs text-on-surface-variant mt-1">This text will be included on all new invoices.</p>
        </div>
      </div>
    </div>
  );
}

export function BrandVoiceSection({ profile, onChange }: SectionProps) {
  const enabled = profile.brand_voice_enabled ?? true;

  return (
    <div className="scroll-mt-36 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300" id="brand-voice-section">
      <div className="flex items-center justify-between mb-6 border-b border-surface-container-high pb-5">
        <div className="flex items-center gap-3">
          <MaterialIcon icon="record_voice_over" className="text-secondary text-[24px]" />
          <div>
            <h2 className="font-headline-md text-headline-md">Brand Voice & Note</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Add a company tagline, slogan, or a short note to appear below your company name.</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            checked={enabled} 
            onChange={(e) => onChange({ brand_voice_enabled: e.target.checked })} 
            className="sr-only peer" 
            type="checkbox"
          />
          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
        </label>
      </div>
      
      <div className={`transition-all duration-300 overflow-hidden ${enabled ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col gap-2">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Note / Tagline</label>
          <textarea 
            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-outline min-h-[80px] resize-y" 
            placeholder="e.g. Empowering Your Business | Thanks for working with us!" 
            value={profile.brand_voice || ''}
            maxLength={500}
            onChange={(e) => onChange({ brand_voice: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export function InvoiceSettingsSection({ profile, onChange }: SectionProps) {
  const enabled = profile.invoice_edit_enabled ?? true;

  return (
    <div className="scroll-mt-36 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300" id="invoice-settings-section">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MaterialIcon icon="edit_document" className="text-secondary text-[24px]" />
          <div>
            <h2 className="font-headline-md text-headline-md">Enable Invoice Editing</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Allow editing and deleting finalized invoices. Uncheck to lock finalized invoices.</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
          <input 
            checked={enabled} 
            onChange={(e) => onChange({ invoice_edit_enabled: e.target.checked })} 
            className="sr-only peer" 
            type="checkbox"
          />
          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
        </label>
      </div>
    </div>
  );
}

import { useAuth } from '@/hooks/useAuth';

export function SecuritySection() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      await updatePassword(password);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="scroll-mt-36 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300" id="security-section">
      <div className="flex items-center gap-3 mb-6 border-b border-surface-container-high pb-5">
        <MaterialIcon icon="security" className="text-secondary text-[24px]" />
        <div>
          <h2 className="font-headline-md text-headline-md">Security & Password</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
            Update your password. Essential if you signed up with Google and want to use email/password sign-in.
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">New Password</label>
            <input 
              className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-outline" 
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Confirm Password</label>
            <input 
              className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-outline" 
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
            />
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg font-body-sm ${message.type === 'success' ? 'bg-primary/10 text-primary' : 'bg-error-container text-error'}`}>
            {message.text}
          </div>
        )}

        <button 
          type="submit"
          disabled={isSubmitting || !password || !confirmPassword}
          className="bg-primary text-on-primary font-label-sm px-6 py-3 rounded-xl hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
        >
          {isSubmitting ? 'Updating...' : 'Set Password'}
        </button>
      </form>
    </div>
  );
}
