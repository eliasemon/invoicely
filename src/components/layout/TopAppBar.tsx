'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

function AvatarImage({ src, fallback }: { src: string; fallback: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return <>{fallback}</>;
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img 
      src={src} 
      alt="Profile Avatar" 
      className="w-full h-full object-cover" 
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
}

export function TopAppBar() {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const [showDropdown, setShowDropdown] = useState(false);

  // Extract initials from displayName or email
  const getInitials = () => {
    if (user?.displayName) {
      const parts = user.displayName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.displayName.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  const handleLogout = async () => {
    try {
      await logout();
      // AuthGuard will handle redirect
    } catch (err) {
      console.error('Failed to logout', err);
    }
  };

  // Inlining UserMenu to prevent re-creation during render

  return (
    <>
      {/* TopAppBar (Mobile) */}
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant shadow-sm md:hidden">
        <div className="flex justify-between items-center px-margin-mobile h-16 w-full mx-auto">
          <button aria-label="Menu" className="text-primary cursor-pointer active:opacity-80 p-2 -ml-2">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <Link href="/dashboard" className="font-headline-md text-headline-md font-bold text-primary">
            Invoicely
          </Link>
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm cursor-pointer active:opacity-80 transition-opacity overflow-hidden"
            >
              <AvatarImage 
                src={profile?.avatar_url || user?.photoURL || ''} 
                fallback={getInitials()} 
              />
            </button>
            
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant py-2 z-50">
                  <div className="px-4 py-2 border-b border-outline-variant mb-2">
                    <p className="font-label-sm text-on-surface font-semibold truncate">{user?.displayName || 'User'}</p>
                    <p className="font-body-sm text-xs text-on-surface-variant truncate">{user?.email}</p>
                  </div>
                  <Link 
                    href="/profile" 
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    Profile Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* TopAppBar (Web) */}
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant shadow-sm hidden md:block">
        <div className="flex justify-between items-center px-margin-desktop h-16 w-full max-w-[1280px] mx-auto">
          <div className="flex items-center gap-xs">
            <button aria-label="Menu" className="text-primary cursor-pointer active:opacity-80 p-2 -ml-2">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <Link href="/dashboard" className="font-headline-md text-headline-md font-bold text-primary">
              Invoicely
            </Link>
          </div>
          <nav className="flex items-center gap-md">
            <Link className="font-label-sm text-label-sm font-semibold text-primary" href="/dashboard">Home</Link>
            <Link className="font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-2 rounded-md" href="/invoices">Invoices</Link>
            <Link className="font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-2 rounded-md" href="/create">Create</Link>
            <Link className="font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-2 rounded-md" href="/profile">Profile</Link>
          </nav>
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm cursor-pointer active:opacity-80 transition-opacity overflow-hidden"
            >
              <AvatarImage 
                src={profile?.avatar_url || user?.photoURL || ''} 
                fallback={getInitials()} 
              />
            </button>
            
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant py-2 z-50">
                  <div className="px-4 py-2 border-b border-outline-variant mb-2">
                    <p className="font-label-sm text-on-surface font-semibold truncate">{user?.displayName || 'User'}</p>
                    <p className="font-body-sm text-xs text-on-surface-variant truncate">{user?.email}</p>
                  </div>
                  <Link 
                    href="/profile" 
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    Profile Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
