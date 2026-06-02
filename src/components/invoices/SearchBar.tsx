import { MaterialIcon } from '@/components/shared/MaterialIcon';

export function SearchBar() {
  return (
    <div className="relative w-full shadow-[0_4px_12px_rgba(26,43,60,0.02)]">
      <MaterialIcon 
        icon="search" 
        className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" 
      />
      <input 
        className="w-full h-12 bg-surface-container-lowest border border-outline-variant rounded-full pl-[44px] pr-4 py-2 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" 
        placeholder="Search..." 
        type="text" 
      />
    </div>
  );
}
