'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNavBar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: 'home' },
    { href: '/invoices', label: 'Invoices', icon: 'receipt_long' },
    { href: '/clients', label: 'Clients', icon: 'group' },
    { href: '/create', label: 'Create', icon: 'add_circle' },
    { href: '/profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 md:hidden bg-surface border-t border-outline-variant shadow-[0_-4px_12px_rgba(26,43,60,0.05)] pb-safe">
      <div className="flex justify-around items-center h-16 px-margin-mobile">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              className={`flex flex-col items-center justify-center transition-transform scale-95 active:scale-90 rounded-lg p-1 ${
                isActive 
                  ? 'bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
              href={item.href}
            >
              <span 
                className="material-symbols-outlined" 
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="font-label-sm text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
