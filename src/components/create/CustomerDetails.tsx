'use client';
import { useState, useEffect, useRef } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { searchClients } from '@/app/actions/invoiceActions';

interface CustomerDetailsProps {
  clientId?: string;
  setClientId?: (id: string | undefined) => void;
  clientName: string;
  setClientName: (name: string) => void;
  mobileNumber: string;
  setMobileNumber: (num: string) => void;
  clientAddress?: string;
  setClientAddress?: (address: string) => void;
  clientEmail?: string;
  setClientEmail?: (email: string) => void;
  clientWhatsapp?: string;
  setClientWhatsapp?: (whatsapp: string) => void;
  whatsappPreferred?: boolean;
  setWhatsappPreferred?: (pref: boolean) => void;
}

interface ClientSuggestion {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  whatsapp_phone?: string;
  whatsapp_preferred?: boolean;
}

export function CustomerDetails({ 
  clientId, setClientId,
  clientName, setClientName, 
  mobileNumber, setMobileNumber,
  clientAddress = '', setClientAddress = () => {},
  clientEmail = '', setClientEmail = () => {},
  clientWhatsapp = '', setClientWhatsapp = () => {},
  whatsappPreferred = false, setWhatsappPreferred = () => {}
}: Readonly<CustomerDetailsProps>) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [suggestions, setSuggestions] = useState<ClientSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [hasSeparateWhatsapp, setHasSeparateWhatsapp] = useState(Boolean(clientWhatsapp && clientWhatsapp !== mobileNumber));
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Click outside to close dropdown
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setClientName(val);
    if (setClientId) setClientId(undefined); // Reset client ID when typing
    
    if (val.trim().length >= 2) {
      setIsSearching(true);
      setShowSuggestions(true);
      
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchClients(val);
          setSuggestions(results);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (client: ClientSuggestion) => {
    if (setClientId) setClientId(client.id);
    setClientName(client.name);
    if (client.phone) setMobileNumber(client.phone);
    if (client.address && setClientAddress) setClientAddress(client.address);
    if (client.email && setClientEmail) setClientEmail(client.email);
    if (client.whatsapp_phone && setClientWhatsapp) {
      setClientWhatsapp(client.whatsapp_phone);
      if (client.whatsapp_phone !== client.phone) setHasSeparateWhatsapp(true);
    }
    if (client.whatsapp_preferred !== undefined && setWhatsappPreferred) {
      setWhatsappPreferred(Boolean(client.whatsapp_preferred));
    }
    setShowSuggestions(false);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setClientEmail(val);
    if (!val.trim()) {
      setEmailError(null);
    } else {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(val.trim())) {
        setEmailError('Please enter a valid email format');
      } else {
        setEmailError(null);
      }
    }
  };

  return (
    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_12px_rgba(26,43,60,0.05)] p-md">
      <div 
        className="flex justify-between items-center cursor-pointer select-none" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-xs">
          <MaterialIcon icon="person" className="text-outline" /> 
          Customer Details
        </h3>
        <MaterialIcon icon={isExpanded ? 'expand_less' : 'expand_more'} className="text-outline transition-transform" />
      </div>
      
      <div className={`space-y-sm mt-sm transition-all duration-300 ${isExpanded ? 'block' : 'hidden'}`}>
        
        <div className="relative" ref={containerRef}>
          <label className="font-label-sm text-label-sm text-on-surface-variant block mb-base" htmlFor="customerName">Client Name</label>
          <input 
            className="w-full h-[48px] px-sm rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-body-md text-body-md text-on-surface placeholder:text-outline" 
            id="customerName" 
            placeholder="e.g. Acme Corp" 
            type="text" 
            maxLength={50}
            value={clientName}
            onChange={handleNameChange}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            autoComplete="off"
          />
          
          {showSuggestions && (isSearching || suggestions.length > 0) && (
            <div className="absolute z-10 w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg max-h-[250px] overflow-y-auto">
              {isSearching && suggestions.length === 0 ? (
                <div className="p-3 text-center font-body-sm text-on-surface-variant">Searching...</div>
              ) : (
                <ul>
                  {suggestions.map((client, idx) => (
                    <li 
                      key={idx} 
                      className="p-3 border-b border-surface-container-high last:border-b-0 hover:bg-surface-container-low cursor-pointer transition-colors"
                      onClick={() => handleSelectSuggestion(client)}
                    >
                      <div className="font-body-md font-semibold text-on-surface">{client.name}</div>
                      <div className="font-body-sm text-on-surface-variant flex flex-wrap gap-2 mt-1 truncate">
                        {client.phone && <span>{client.phone}</span>}
                        {client.email && <span>• {client.email}</span>}
                        {client.address && <span>• {client.address}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-on-surface-variant block mb-base" htmlFor="customerMobile">Mobile Phone Number</label>
          <PhoneInput
            international
            defaultCountry="BD"
            value={mobileNumber ? (mobileNumber.startsWith('+') ? '+' + mobileNumber.replace(/\D/g, '') : '+' + mobileNumber.replace(/\D/g, '')) : undefined}
            onChange={(val) => {
              const strVal = val ? val.toString() : '';
              setMobileNumber(strVal);
              if (!hasSeparateWhatsapp) {
                setClientWhatsapp(strVal);
              }
            }}
            className="w-full h-[48px] px-sm rounded-lg border border-outline-variant bg-surface focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors font-body-md text-body-md text-on-surface phone-input-container"
          />
          <style jsx global>{`
            .phone-input-container .PhoneInputInput {
              border: none;
              outline: none;
              background: transparent;
              font-family: inherit;
              font-size: inherit;
              color: inherit;
              width: 100%;
              height: 100%;
            }
            .phone-input-container .PhoneInputCountry {
              margin-right: 12px;
            }
          `}</style>
        </div>

        {/* WhatsApp Specific Controls */}
        <div className="bg-surface/50 border border-outline-variant/60 rounded-lg p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface flex items-center gap-1.5 font-medium">
              <MaterialIcon icon="chat" className="text-emerald-500 text-[18px]" />
              WhatsApp Messaging
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-on-surface-variant">
              <input 
                type="checkbox"
                checked={hasSeparateWhatsapp}
                onChange={(e) => {
                  setHasSeparateWhatsapp(e.target.checked);
                  if (!e.target.checked) {
                    setClientWhatsapp(mobileNumber);
                  }
                }}
                className="rounded border-outline-variant accent-primary cursor-pointer"
              />
              <span>Different WhatsApp number</span>
            </label>
          </div>

          {hasSeparateWhatsapp && (
            <div className="pt-1">
              <label className="font-label-sm text-xs text-on-surface-variant block mb-1">WhatsApp Number</label>
              <PhoneInput
                international
                defaultCountry="BD"
                value={clientWhatsapp ? (clientWhatsapp.startsWith('+') ? '+' + clientWhatsapp.replace(/\D/g, '') : '+' + clientWhatsapp.replace(/\D/g, '')) : undefined}
                onChange={(val) => setClientWhatsapp(val ? val.toString() : '')}
                className="w-full h-[44px] px-sm rounded-lg border border-outline-variant bg-surface focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors font-body-sm text-body-sm text-on-surface phone-input-container"
              />
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer text-xs text-on-surface font-medium pt-1">
            <input 
              type="checkbox"
              checked={whatsappPreferred}
              onChange={(e) => setWhatsappPreferred(e.target.checked)}
              className="rounded border-outline-variant accent-primary cursor-pointer"
            />
            <span>Customer prefers WhatsApp communication</span>
          </label>
        </div>

        {/* Email Address (Optional) */}
        <div>
          <div className="flex justify-between items-center mb-base">
            <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="customerEmail">Email Address (Optional)</label>
            <span className="text-[11px] text-outline">For Gmail delivery</span>
          </div>
          <input 
            className={`w-full h-[48px] px-sm rounded-lg border bg-surface focus:outline-none transition-colors font-body-md text-body-md text-on-surface placeholder:text-outline ${
              emailError ? 'border-error focus:ring-1 focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'
            }`}
            id="customerEmail" 
            placeholder="e.g. billing@acme.com" 
            type="email" 
            value={clientEmail}
            onChange={handleEmailChange}
            autoComplete="email"
          />
          {emailError && (
            <p className="text-error text-xs mt-1">{emailError}</p>
          )}
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-on-surface-variant block mb-base" htmlFor="customerAddress">Address (Optional)</label>
          <textarea 
            className="w-full min-h-[80px] p-sm rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-body-md text-body-md text-on-surface placeholder:text-outline resize-y" 
            id="customerAddress" 
            placeholder="123 Business St&#10;City, Country 12345" 
            maxLength={300}
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
          />
        </div>

      </div>
    </section>
  );
}
