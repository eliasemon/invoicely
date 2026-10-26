import { MaterialIcon } from '@/components/shared/MaterialIcon';
import Link from 'next/link';
import { DocumentType, PaperSize } from '@/components/templates/templateUtils';

interface PublicInvoiceHeaderProps {
  invoiceNumber: string;
  documentType?: DocumentType;
  paperSize?: PaperSize;
  setPaperSize?: (size: PaperSize) => void;
  isOwner?: boolean;
  onPrint?: () => void;
  onOpenSettings?: () => void;
  onOpenShare?: () => void;
}

export function PublicInvoiceHeader({
  invoiceNumber,
  documentType = 'invoice',
  paperSize = 'a4',
  setPaperSize,
  isOwner = false,
  onPrint,
  onOpenSettings,
  onOpenShare,
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
      document.title = `${docTitle}-${invoiceNumber}-${paperSize.toUpperCase()}`;
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
        <div className="flex items-center gap-2">
          {setPaperSize && (
            <div className="hidden sm:flex items-center bg-surface-container-high/60 p-0.5 rounded-lg border border-outline-variant/40">
              <button
                type="button"
                onClick={() => setPaperSize('a4')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  paperSize === 'a4'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="A4 Full Page (210×297mm)"
              >
                A4
              </button>
              <button
                type="button"
                onClick={() => setPaperSize('a5')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  paperSize === 'a5'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="A5 Half Page (148×210mm)"
              >
                A5
              </button>
              <button
                type="button"
                onClick={() => setPaperSize('thermal')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  paperSize === 'thermal'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="3-inch Thermal POS Receipt (80mm)"
              >
                3" Thermal
              </button>
            </div>
          )}

          {onOpenShare && (
            <button
              type="button"
              onClick={onOpenShare}
              className="px-3 sm:px-3.5 py-2 bg-surface border border-outline-variant hover:border-primary text-on-surface hover:text-primary font-body-sm text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Share Document via WhatsApp or Email"
            >
              <MaterialIcon icon="share" className="text-[18px] text-primary" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="px-3 sm:px-3.5 py-2 bg-surface border border-outline-variant hover:border-primary text-on-surface hover:text-primary font-body-sm text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Open Document Settings & Options"
            >
              <MaterialIcon icon="tune" className="text-[18px] text-primary" />
              <span className="hidden sm:inline">Options</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="px-3.5 sm:px-4 py-2 bg-primary text-on-primary font-body-sm text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 sm:gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <MaterialIcon icon="download" className="text-[18px]" />
            <span>Download ({paperSize.toUpperCase()})</span>
          </button>
        </div>
      </div>
    </header>
  );
}
