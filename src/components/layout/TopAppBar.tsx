'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
          <button 
            aria-label="Menu" 
            className="text-primary cursor-pointer active:opacity-80 p-2 -ml-2"
            onClick={() => setShowMobileMenu(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <Link href="/dashboard" className="flex items-center gap-xs font-headline-md text-headline-md font-bold text-primary">
            <MaterialIcon icon="account_balance_wallet" filled className="text-primary" />
            Invorio
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

      {/* Mobile Navigation Drawer */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[60] md:hidden flex">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowMobileMenu(false)}
          ></div>
          <div className="relative w-64 max-w-[80%] h-full bg-surface-container-lowest shadow-2xl flex flex-col animate-in slide-in-from-left">
            <div className="h-16 flex items-center px-4 border-b border-outline-variant/30">
              <Link href="/dashboard" className="flex items-center gap-xs font-headline-md text-headline-md font-bold text-primary" onClick={() => setShowMobileMenu(false)}>
                <MaterialIcon icon="account_balance_wallet" filled className="text-primary" />
                Invorio
              </Link>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
              <Link className="flex items-center gap-3 px-3 py-3 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors font-label-md" href="/dashboard" onClick={() => setShowMobileMenu(false)}>
                <MaterialIcon icon="home" className="text-on-surface-variant" />
                Home
              </Link>
              <Link className="flex items-center gap-3 px-3 py-3 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors font-label-md" href="/invoices" onClick={() => setShowMobileMenu(false)}>
                <MaterialIcon icon="receipt_long" className="text-on-surface-variant" />
                Invoices
              </Link>
              <Link className="flex items-center gap-3 px-3 py-3 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors font-label-md" href="/clients" onClick={() => setShowMobileMenu(false)}>
                <MaterialIcon icon="group" className="text-on-surface-variant" />
                Clients
              </Link>
              <Link className="flex items-center gap-3 px-3 py-3 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors font-label-md" href="/create" onClick={() => setShowMobileMenu(false)}>
                <MaterialIcon icon="add_circle" className="text-on-surface-variant" />
                Create
              </Link>
              <Link className="flex items-center gap-3 px-3 py-3 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors font-label-md" href="/profile" onClick={() => setShowMobileMenu(false)}>
                <MaterialIcon icon="person" className="text-on-surface-variant" />
                Profile
              </Link>
            </nav>
            <div className="p-4 border-t border-outline-variant/30">
              <button 
                onClick={() => {
                  setShowMobileMenu(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-error hover:bg-error-container/10 transition-colors font-label-md"
              >
                <MaterialIcon icon="logout" className="text-error" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TopAppBar (Web) */}
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant shadow-sm hidden md:block">
        <div className="flex justify-between items-center px-margin-desktop h-16 w-full max-w-[1280px] mx-auto">
          <div className="flex items-center gap-xs">
            <Link href="/dashboard" className="flex items-center gap-xs font-headline-md text-headline-md font-bold text-primary">
              <MaterialIcon icon="account_balance_wallet" filled className="text-primary" />
              Invorio
            </Link>
          </div>
          <nav className="flex items-center gap-md">
            <Link className="font-label-sm text-label-sm font-semibold text-primary" href="/dashboard">Home</Link>
            <Link className="font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-2 rounded-md" href="/invoices">Invoices</Link>
            <Link className="font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-2 rounded-md" href="/clients">Clients</Link>
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
