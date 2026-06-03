'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FilterChipsProps {
  onFilterChange?: (filter: string) => void;
}

const filters = ['All', 'Paid', 'Unpaid', 'Partial', 'Draft'];

export function FilterChips({ onFilterChange }: Readonly<FilterChipsProps>) {
  const [active, setActive] = useState('All');

  const handleClick = (filter: string) => {
    setActive(filter);
    if (onFilterChange) onFilterChange(filter);
  };

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0">
      {filters.map((filter) => {
        const isActive = active === filter;
        return (
          <button
            key={filter}
            onClick={() => handleClick(filter)}
            className={cn(
              "whitespace-nowrap px-4 py-[6px] rounded-full font-label-sm text-label-sm border transition-colors shadow-sm",
              isActive 
                ? "bg-primary text-on-primary border-transparent" 
                : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low"
            )}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
