import { TopAppBar } from '@/components/layout/TopAppBar';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-on-background pb-24 md:pb-0">
        <TopAppBar />
        <main className="w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop pt-lg pb-xl space-y-lg">
          {children}
        </main>
        <BottomNavBar />
      </div>
    </AuthGuard>
  );
}
