'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: 'Daily Queue' },
  { href: '/admin/journal', label: 'Journal' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/community', label: 'Community' },
  { href: '/admin/beta-lab', label: 'Beta Lab' },
  { href: '/admin/sessions', label: 'Sessions' },
  { href: '/admin/members', label: 'Members' },
  { href: '/admin/producers', label: 'Producers' },
  { href: '/admin/blist', label: 'B-LIST Waitlist' },
  { href: '/admin/moments', label: 'Moments' },
  { href: '/admin/metrics', label: 'Metrics' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-52 flex-col border-r border-[var(--herr-border)] bg-[var(--herr-black)] z-30">
      <div className="px-5 py-6 border-b border-[var(--herr-border)]">
        <Link href="/" className="font-display text-xl tracking-[0.2em] text-[var(--herr-white)]">
          HERR
        </Link>
        <span className="ml-2 herr-label text-[var(--herr-pink)]">Admin</span>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          const isExactAdmin = item.href === '/admin' && pathname === '/admin';
          const active = isActive || isExactAdmin;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-5 py-2.5 text-[0.85rem] transition-colors ${
                active
                  ? 'text-[var(--herr-white)] bg-[var(--herr-surface)] border-l-2 border-l-[var(--herr-pink)]'
                  : 'text-[var(--herr-muted)] hover:text-[var(--herr-white)] hover:bg-[var(--herr-surface)] border-l-2 border-l-transparent'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-[var(--herr-border)]">
        <Link href="/dashboard" className="text-[0.75rem] text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors">
          Member Dashboard &rarr;
        </Link>
      </div>
    </aside>
  );
}
