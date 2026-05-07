'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/the-science', label: 'The Science' },
  { href: '/ecqo-sound', label: 'ECQO Sound' },
  { href: '/journal', label: 'Journal' },
];

export default function NavBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 px-6 transition-all duration-500 ${
          scrolled
            ? 'bg-[rgba(10,10,15,0.92)] backdrop-blur-md border-b border-[var(--herr-border)]'
            : ''
        }`}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between h-[72px]">

          {/* Logo */}
          <Link
            href="/"
            className="font-display text-xl font-light tracking-[0.25em] uppercase text-[var(--herr-white)] hover:text-[var(--herr-pink)] transition-colors duration-300"
          >
            HERR™
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[0.8rem] font-medium tracking-wide uppercase transition-colors duration-200 ${
                  pathname.startsWith(link.href)
                    ? 'text-[var(--herr-white)]'
                    : 'text-[var(--herr-muted)] hover:text-[var(--herr-white)]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Re-Enter button (returning members) */}
            <Link
              href="/login"
              className="text-[0.75rem] font-semibold tracking-[0.15em] uppercase px-5 py-2.5 rounded-xl border border-[var(--herr-pink)] text-[var(--herr-pink)] hover:bg-[var(--herr-pink)] hover:text-[var(--herr-white)] transition-all duration-200"
            >
              Re-Enter
            </Link>

            {/* Begin button (new members) */}
            <Link
              href="/checkout"
              className="btn-herr-primary text-[0.75rem]"
            >
              Begin
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span className={`block h-px w-6 bg-[var(--herr-white)] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-px w-6 bg-[var(--herr-white)] transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-6 bg-[var(--herr-white)] transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>

        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[var(--herr-black)] flex flex-col pt-24 px-8">
          <div className="flex flex-col gap-8 mt-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-display text-4xl font-light text-[var(--herr-white)] hover:text-[var(--herr-pink)] transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Re-Enter (mobile) */}
            <Link
              href="/login"
              className="font-display text-4xl font-light text-[var(--herr-white)] hover:text-[var(--herr-pink)] transition-colors"
            >
              Re-Enter
            </Link>

            {/* Begin (mobile) */}
            <Link
              href="/checkout"
              className="font-display text-4xl font-light text-[var(--herr-pink)]"
            >
              Begin
            </Link>
          </div>
          <div className="mt-auto pb-12 herr-label text-[var(--herr-faint)]">
            HERR™ by ECQO Holdings™
          </div>
        </div>
      )}
    </>
  );
}
