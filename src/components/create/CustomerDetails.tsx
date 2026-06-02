'use client';
import { useState, useEffect, useRef } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { searchClients } from '@/app/actions/invoiceActions';

interface CustomerDetailsProps {
  clientName: string;
  setClientName: (name: string) => void;
  mobileNumber: string;
  setMobileNumber: (num: string) => void;
  clientAddress?: string;
  setClientAddress?: (address: string) => void;
}

interface ClientSuggestion {
  name: string;
  phone: string;
  address: string;
}

export function CustomerDetails({ 
  clientName, setClientName, 
  mobileNumber, setMobileNumber,
  clientAddress = '', setClientAddress = () => {}
}: Readonly<CustomerDetailsProps>) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [suggestions, setSuggestions] = useState<ClientSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
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
    setClientName(client.name);
    if (client.phone) setMobileNumber(client.phone);
    if (client.address && setClientAddress) setClientAddress(client.address);
    setShowSuggestions(false);
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
                      {(client.phone || client.address) && (
                        <div className="font-body-sm text-on-surface-variant flex gap-2 mt-1 truncate">
                          {client.phone && <span>{client.phone}</span>}
                          {client.phone && client.address && <span>•</span>}
                          {client.address && <span className="truncate">{client.address}</span>}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-on-surface-variant block mb-base" htmlFor="customerMobile">Mobile Number</label>
          <PhoneInput
            international
            defaultCountry="US"
            value={mobileNumber}
            onChange={(val) => setMobileNumber(val ? val.toString() : '')}
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

        <div>
          <label className="font-label-sm text-label-sm text-on-surface-variant block mb-base" htmlFor="customerAddress">Address (Optional)</label>
          <textarea 
            className="w-full min-h-[80px] p-sm rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-body-md text-body-md text-on-surface placeholder:text-outline resize-y" 
            id="customerAddress" 
            placeholder="123 Business St&#10;City, Country 12345" 
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
          />
        </div>

      </div>
    </section>
  );
}
