'use client';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import Link from 'next/link';

interface PublicInvoiceHeaderProps {
  invoiceNumber: string;
}

export function PublicInvoiceHeader({ invoiceNumber }: PublicInvoiceHeaderProps) {
  return (
    <header className="bg-surface/80 backdrop-blur-md w-full sticky top-0 border-b border-outline-variant z-40 print:hidden shadow-sm">
      <div className="flex items-center justify-between px-md py-sm w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-sm">
          <Link href="/" className="flex items-center gap-xs hover:opacity-85 transition-opacity">
            <MaterialIcon icon="account_balance_wallet" filled className="text-primary text-[24px]" />
            <span className="font-headline-md text-headline-md tracking-tight text-primary font-bold hidden sm:inline">Invorio</span>
          </Link>
          <div className="h-4 w-px bg-outline-variant hidden sm:block"></div>
          <span className="font-body-lg text-body-lg font-semibold text-primary">
            Invoice #{invoiceNumber}
          </span>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-primary text-on-primary font-body-sm text-body-sm font-semibold rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <MaterialIcon icon="download" className="text-[18px]" /> Download / Print
        </button>
      </div>
    </header>
  );
}
