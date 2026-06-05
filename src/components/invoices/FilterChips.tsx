'use client';
import { cn } from '@/lib/utils';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

interface FilterChipsProps {
  onFilterChange?: (filter: string) => void;
}

const filters = ['All', 'Paid', 'Unpaid', 'Partial', 'Draft'];

export function FilterChips({ onFilterChange }: Readonly<FilterChipsProps>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const active = searchParams.get('status') || 'All';

  const handleClick = (filter: string) => {
    const params = new URLSearchParams(searchParams);
    if (filter === 'All') {
      params.delete('status');
    } else {
      params.set('status', filter);
    }
    replace(`${pathname}?${params.toString()}`);
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
