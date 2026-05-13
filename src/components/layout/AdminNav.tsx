'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

// Role gate: ADMIN_EMAILS list at (operator)/layout.tsx is the canonical source
// of admin authorization. Anyone reaching this component has already passed
// that gate; AdminNav itself does no internal role hiding.
// If profile.role becomes a real column later, refactor here.

type NavItem = { href: string; label: string };
type Section = { title: string; items: NavItem[] };

const SECTIONS: Section[] = [
  {
    title: 'Operations',
    items: [
      { href: '/admin',              label: 'Overview' },
      { href: '/admin/members',      label: 'Members' },
      { href: '/admin/sessions',     label: 'Sessions' },
      { href: '/admin/testers',      label: 'Testers' },
      { href: '/admin/beta-testers', label: 'Beta Reports' },
      { href: '/admin/briefings',    label: 'Briefings' },
    ],
  },
  {
    title: 'Content',
    items: [
      { href: '/admin/affirmations',   label: 'Affirmations Queue' },
      { href: '/admin/journal',        label: 'Journal' },
      { href: '/admin/journal-queue',  label: 'Journal AI Queue' },
      { href: '/admin/peer-review',    label: 'Peer-Review Papers' },
      { href: '/admin/sound',          label: 'ECQO Sound' },
    ],
  },
  {
    title: 'Programs',
    items: [
      { href: '/admin/bfrw',     label: 'BFRW' },
      { href: '/admin/producer', label: 'Producer Queue' },
    ],
  },
  {
    title: 'Reports',
    items: [
      { href: '/admin/analytics', label: 'Analytics' },
      { href: '/admin/billing',   label: 'Billing' },
    ],
  },
];

export default function AdminNav({ displayName }: { displayName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const isActive = (href: string) =>
    href === '/admin'
      ? pathname === '/admin'
      : pathname === href || pathname.startsWith(`${href}/`);

  const Brand = () => (
    <Link
      href="/admin"
      style={{ display: 'flex', alignItems: 'baseline', gap: 8, textDecoration: 'none' }}
    >
      <span
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 22,
          fontWeight: 300,
          letterSpacing: '0.25em',
          color: 'var(--herr-ink)',
          textTransform: 'uppercase',
        }}
      >
        HERR
      </span>
      <span
        style={{
          fontSize: 10,
          letterSpacing: '0.18em',
          color: 'var(--herr-magenta)',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        Admin
      </span>
    </Link>
  );

  const NavList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <p
            style={{
              fontSize: 10,
              letterSpacing: '0.18em',
              color: 'rgba(26,15,26,0.45)',
              textTransform: 'uppercase',
              fontWeight: 600,
              padding: '0 14px',
              marginBottom: 6,
            }}
          >
            {section.title}
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    style={{
                      display: 'block',
                      padding: '8px 14px',
                      paddingLeft: active ? 12 : 14,
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      color: active ? 'var(--herr-ink)' : 'rgba(26,15,26,0.7)',
                      background: active ? 'var(--herr-magenta-soft)' : 'transparent',
                      borderLeft: active ? '2px solid var(--herr-magenta)' : '2px solid transparent',
                      textDecoration: 'none',
                      transition: 'background 150ms, color 150ms',
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  const FooterLinks = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Link
        href="/dashboard"
        style={{ padding: '8px 14px', fontSize: 12, color: 'rgba(26,15,26,0.6)', textDecoration: 'none' }}
      >
        Member Dashboard →
      </Link>
      <p style={{ fontSize: 11, color: 'rgba(26,15,26,0.5)', margin: 0, padding: '4px 14px' }}>
        Signed in as <span style={{ color: 'var(--herr-ink)', fontWeight: 600 }}>{displayName}</span>
      </p>
      <button
        onClick={handleSignOut}
        style={{
          textAlign: 'left',
          padding: '8px 14px',
          background: 'transparent',
          border: 'none',
          color: 'rgba(26,15,26,0.6)',
          fontSize: 13,
          cursor: 'pointer',
          borderRadius: 8,
          fontFamily: 'inherit',
        }}
      >
        Sign out
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile top bar — sticky on viewports under md */}
      <div
        className="md:hidden"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'var(--herr-cream)',
          borderBottom: '1px solid var(--herr-line)',
        }}
      >
        <Brand />
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label="Toggle navigation"
          aria-expanded={drawerOpen}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 8,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}
        >
          <span style={{ display: 'block', height: 1.5, width: 22, background: 'var(--herr-ink)', transition: 'transform 200ms', transform: drawerOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
          <span style={{ display: 'block', height: 1.5, width: 22, background: 'var(--herr-ink)', transition: 'opacity 200ms', opacity: drawerOpen ? 0 : 1 }} />
          <span style={{ display: 'block', height: 1.5, width: 22, background: 'var(--herr-ink)', transition: 'transform 200ms', transform: drawerOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile drawer — real interactive slide-down full-screen on <md */}
      {drawerOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            top: 49,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 30,
            background: 'var(--herr-cream)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            overflowY: 'auto',
          }}
        >
          <NavList />
          <div style={{ marginTop: 'auto' }}>
            <FooterLinks />
          </div>
        </div>
      )}

      {/* Desktop left rail — md+ */}
      <aside
        className="hidden md:flex"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 240,
          padding: '32px 20px 24px',
          background: 'var(--herr-cream)',
          borderRight: '1px solid var(--herr-line)',
          flexDirection: 'column',
          gap: 28,
          zIndex: 30,
          overflowY: 'auto',
        }}
      >
        <Brand />
        <NavList />
        <div style={{ marginTop: 'auto' }}>
          <FooterLinks />
        </div>
      </aside>
    </>
  );
}
