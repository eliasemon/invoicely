import Link from 'next/link';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

export function QuickActions() {
  return (
    <section className="flex gap-sm">
      <Link 
        href="/create"
        className="flex-1 bg-primary text-on-primary rounded-xl py-3 px-4 font-label-sm text-label-sm font-semibold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(26,43,60,0.1)] active:scale-95 transition-transform"
      >
        <MaterialIcon icon="add" className="text-sm" />
        Create New Invoice
      </Link>
      <button className="bg-surface-container-lowest border border-outline-variant text-primary rounded-xl py-3 px-4 font-label-sm text-label-sm font-semibold flex items-center justify-center shadow-[0_4px_12px_rgba(26,43,60,0.05)] active:scale-95 transition-transform">
        <MaterialIcon icon="filter_list" className="text-sm" />
      </button>
    </section>
  );
}
