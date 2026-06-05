import Link from 'next/link';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-background text-on-background flex flex-col antialiased">
      <header className="absolute top-0 w-full p-margin-mobile md:p-margin-desktop z-10 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-xs">
          <MaterialIcon icon="account_balance_wallet" filled className="text-primary text-2xl" />
          <span className="text-headline-md font-headline-md font-bold tracking-tight text-primary">Invorio</span>
        </Link>
      </header>
      <main className="flex-1 w-full flex items-center justify-center p-margin-mobile">
        {children}
      </main>
    </div>
  );
}
