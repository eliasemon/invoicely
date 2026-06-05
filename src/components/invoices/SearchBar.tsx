'use client';

import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';

export function SearchBar({ placeholder = "Search..." }: { placeholder?: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchTerm) {
        params.set('search', searchTerm);
      } else {
        params.delete('search');
      }
      
      const currentSearch = searchParams.get('search') || '';
      if (currentSearch !== searchTerm) {
        startTransition(() => {
          replace(`${pathname}?${params.toString()}`);
        });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, pathname, replace]);

  return (
    <div className="relative w-full shadow-[0_4px_12px_rgba(26,43,60,0.02)]">
      <MaterialIcon 
        icon="search" 
        className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" 
      />
      <input 
        className="w-full h-12 bg-surface-container-lowest border border-outline-variant rounded-full pl-[44px] pr-4 py-2 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" 
        placeholder={placeholder}
        type="text" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
