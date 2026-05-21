'use client';

/**
 * Keyboard navigation + slide counter for the /enterprise/sports deck.
 *
 * - ArrowDown / ArrowRight / Space → next slide
 * - ArrowUp   / ArrowLeft         → previous slide
 * - ESC                            → slide index (slide 1)
 * - Updates the URL hash so the deck is shareable mid-presentation
 *
 * Renders the small slide counter pill in the corner.
 */

import { useCallback, useEffect, useState } from 'react';

const TOTAL = 5;
const SILVER = '#A5ACAF';

export default function SportsDeckNav() {
  const [current, setCurrent] = useState<number>(1);

  // On mount, hop to the slide referenced by the URL hash if present.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    const m = hash.match(/^#slide-(\d+)$/);
    if (m) {
      const n = Math.min(TOTAL, Math.max(1, parseInt(m[1], 10)));
      setCurrent(n);
      requestAnimationFrame(() => {
        document.getElementById(`slide-${n}`)?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
      });
    }
  }, []);

  const goTo = useCallback((n: number) => {
    const next = Math.min(TOTAL, Math.max(1, n));
    setCurrent(next);
    history.replaceState(null, '', `#slide-${next}`);
    document.getElementById(`slide-${next}`)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore key events while typing in form fields.
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          goTo(current + 1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          goTo(current - 1);
          break;
        case 'Escape':
          e.preventDefault();
          goTo(1);
          break;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, goTo]);

  // Track scroll position to keep counter in sync on free-scroll devices.
  useEffect(() => {
    let raf = 0;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const slides = Array.from(document.querySelectorAll<HTMLElement>('[data-slide]'));
        const mid = window.innerHeight / 2;
        let best = 1;
        let bestDist = Infinity;
        for (const el of slides) {
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const d = Math.abs(center - mid);
          if (d < bestDist) {
            bestDist = d;
            best = parseInt(el.dataset.slide ?? '1', 10);
          }
        }
        setCurrent(best);
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 18,
        right: 18,
        zIndex: 40,
        background: 'rgba(10,10,15,0.78)',
        border: `1px solid ${SILVER}`,
        color: SILVER,
        borderRadius: 999,
        padding: '6px 14px',
        fontSize: 12,
        letterSpacing: '0.2em',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        backdropFilter: 'blur(8px)',
      }}
      aria-live="polite"
    >
      {String(current).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
    </div>
  );
}
