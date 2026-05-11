'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

export type MemberPlan = 'free' | 'collective' | 'personalized' | 'elite';

const TIER_RANK: Record<MemberPlan, number> = {
  free: 0,
  collective: 1,
  personalized: 2,
  elite: 3,
};

const TIER_BADGE: Record<MemberPlan, string> = {
  free: 'FREE',
  collective: 'COLLECTIVE',
  personalized: 'PERSONALIZED',
  elite: 'ELITE',
};

type NavItem = {
  href: string;
  label: string;
  requires: MemberPlan;
};

// All hrefs are internal /dashboard/* routes only.
// Verified against Phase 1 v2 spec EPIC A2.
const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',              label: 'Today',           requires: 'free' },
  { href: '/dashboard/affirmations', label: 'My Affirmations', requires: 'collective' },
  { href: '/dashboard/modes',        label: 'My Activities',   requires: 'collective' },
  { href: '/dashboard/genres',       label: 'My Music',        requires: 'personalized' },
  { href: '/dashboard/assessment',   label: 'My Progress',     requires: 'collective' },
  { href: '/dashboard/sessions',     label: 'Live w/ Bianca',  requires: 'collective' },
  { href: '/dashboard/community',    label: 'Community',       requires: 'collective' },
  { href: '/dashboard/billing',      label: 'Billing',         requires: 'collective' },
  { href: '/dashboard/settings',     label: 'Settings',        requires: 'free' },
];

export default function MemberNav({
  plan,
  displayName,
}: {
  plan: MemberPlan;
  displayName: string;
}) {
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
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname === href || pathname.startsWith(`${href}/`);

  const isLocked = (item: NavItem) => TIER_RANK[plan] < TIER_RANK[item.requires];

  const upsellHref = (item: NavItem) =>
    `/checkout?from=${encodeURIComponent(item.href)}`;

  const Brand = () => (
    <Link
      href="/dashboard"
      style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 22,
        fontWeight: 300,
        letterSpacing: '0.25em',
        color: 'var(--herr-ink)',
        textDecoration: 'none',
        textTransform: 'uppercase',
      }}
    >
      HERR
    </Link>
  );

  const NavList = () => (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        const locked = isLocked(item);
        const href = locked ? upsellHref(item) : item.href;

        return (
          <li key={item.href}>
            <Link
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                paddingLeft: active ? 12 : 14,
                borderRadius: 8,
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                opacity: locked ? 0.55 : 1,
                color: locked ? 'rgba(26,15,26,0.6)' : 'var(--herr-ink)',
                background: active ? 'rgba(196,45,142,0.08)' : 'transparent',
                borderLeft: active ? '2px solid var(--herr-magenta)' : '2px solid transparent',
                textDecoration: 'none',
                transition: 'background 150ms, color 150ms',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {item.label}
                {locked && (
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--herr-magenta)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
              </span>
              {locked && (
                <span
                  style={{
                    fontSize: 9,
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'var(--herr-magenta)',
                    color: 'var(--herr-cream)',
                    textTransform: 'uppercase',
                  }}
                >
                  {TIER_BADGE[item.requires]}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const Footer = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {plan === 'free' && (
        <Link
          href="/checkout"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 38,
            padding: '0 16px',
            background: 'var(--herr-magenta)',
            color: 'var(--herr-cream)',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          Upgrade
        </Link>
      )}
      <p style={{ fontSize: 11, color: 'rgba(26,15,26,0.5)', margin: 0, padding: '4px 0' }}>
        Signed in as <span style={{ color: 'var(--herr-ink)', fontWeight: 600 }}>{displayName}</span>
        <br />
        <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {TIER_BADGE[plan]} TIER
        </span>
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
          borderBottom: '1px solid rgba(26,15,26,0.1)',
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
            <Footer />
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
          borderRight: '1px solid rgba(26,15,26,0.1)',
          flexDirection: 'column',
          gap: 28,
          zIndex: 30,
          overflowY: 'auto',
        }}
      >
        <Brand />
        <NavList />
        <div style={{ marginTop: 'auto' }}>
          <Footer />
        </div>
      </aside>
    </>
  );
}
