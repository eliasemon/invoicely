'use client';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import Link from 'next/link';
import { DocumentType } from '@/components/templates/templateUtils';

interface PublicInvoiceHeaderProps {
  invoiceNumber: string;
  documentType?: DocumentType;
  isOwner?: boolean;
  onPrint?: () => void;
}

export function PublicInvoiceHeader({
  invoiceNumber,
  documentType = 'invoice',
  isOwner = false,
  onPrint,
}: PublicInvoiceHeaderProps) {
  const docTitle =
    documentType === 'challan'
      ? 'Delivery Challan'
      : documentType === 'quotation'
      ? 'Quotation'
      : 'Invoice';

  const handleDownload = () => {
    if (onPrint) {
      onPrint();
    } else {
      const prevTitle = document.title;
      document.title = `${docTitle}-${invoiceNumber}`;
      window.print();
      setTimeout(() => {
        document.title = prevTitle;
      }, 1000);
    }
  };

  return (
    <header className="bg-surface/80 backdrop-blur-md w-full sticky top-0 border-b border-outline-variant z-40 print:hidden shadow-sm">
      <div className="flex items-center justify-between px-md py-sm w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-sm">
          <Link href="/" className="flex items-center gap-xs hover:opacity-85 transition-opacity">
            <MaterialIcon icon="account_balance_wallet" filled className="text-primary text-[24px]" />
            <span className="font-headline-md text-headline-md tracking-tight text-primary font-bold hidden sm:inline">Invorio</span>
          </Link>
          <div className="h-4 w-px bg-outline-variant hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <span className="font-body-lg text-body-lg font-semibold text-primary">
              {docTitle} #{invoiceNumber}
            </span>
            {isOwner && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 hidden sm:inline-flex items-center gap-1">
                <MaterialIcon icon="verified_user" className="text-[12px]" />
                Owner
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-primary text-on-primary font-body-sm text-body-sm font-semibold rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <MaterialIcon icon="download" className="text-[18px]" />
          <span>Download / Print {documentType === 'challan' ? 'Challan' : documentType === 'quotation' ? 'Quotation' : 'Invoice'}</span>
        </button>
      </div>
    </header>
  );
}
