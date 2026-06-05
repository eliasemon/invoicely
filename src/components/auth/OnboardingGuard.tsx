'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useProfile();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Wait until profile is loaded
    if (loading) return;

    // If profile is missing entirely (first login) or hasn't completed onboarding, and we are not on the profile page
    if ((!profile || profile.onboarding_completed === false) && !pathname.startsWith('/profile') && !hasRedirected) {
      setHasRedirected(true);
      router.push('/profile?tour=true');
    }
  }, [profile, loading, pathname, router, hasRedirected]);

  return <>{children}</>;
}
