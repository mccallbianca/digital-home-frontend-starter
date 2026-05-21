'use client';

/**
 * Post-purchase Voice Clone Plus upsell.
 *
 * Renders below the "You're in" confirmation on /welcome. Two CTAs:
 *   - "Yes, Add Voice Clone Plus" → POST /api/stripe/vcp-checkout, redirect.
 *   - "Maybe Later" → dismiss (sets a localStorage key so it doesn't re-appear).
 *
 * The modal is dismissible (top-right ×) and self-hides for 30 days
 * once Maybe Later is clicked, so it never re-nags the user.
 */

import { useEffect, useState } from 'react';

const DISMISS_KEY = 'herr.vcp.upsell.dismissed_at';
const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export default function VCPUpsellModal({ source = 'welcome' }: { source?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = window.localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const age = Date.now() - parseInt(dismissed, 10);
      if (Number.isFinite(age) && age < DISMISS_TTL_MS) return;
    }
    // Small delay so the page settles before the modal appears.
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setOpen(false);
  }

  async function handleYes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stripe/vcp-checkout?source=${encodeURIComponent(source)}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data?.error ?? `Couldn't start checkout (HTTP ${res.status})`);
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vcp-upsell-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,10,15,0.72)',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'vcpFadeIn 220ms ease-out',
      }}
      onClick={dismiss}
    >
      <style>{`
        @keyframes vcpFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes vcpSlideUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: 480,
          width: '100%',
          background: 'linear-gradient(160deg, #0A0A0F 0%, #1A0A18 100%)',
          color: '#F4F1EB',
          borderRadius: 18,
          padding: '36px 32px 28px',
          border: '1px solid rgba(196, 45, 142, 0.4)',
          boxShadow: '0 24px 72px rgba(196,45,142,0.18)',
          animation: 'vcpSlideUp 240ms ease-out 80ms backwards',
        }}
      >
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'transparent',
            border: 'none',
            color: 'rgba(244,241,235,0.55)',
            fontSize: 22,
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#FF5BAA', fontWeight: 600, margin: '0 0 12px' }}>
          Add-on · $20/mo
        </p>
        <h2 id="vcp-upsell-title" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 30, fontWeight: 500, color: '#FFFFFF', margin: '0 0 16px', lineHeight: 1.15 }}>
          Hear your daily affirmations in your own voice.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(244,241,235,0.82)', margin: '0 0 22px' }}>
          Voice Clone Plus records your voice once, then renders every personalized affirmation in your own tone. The fastest path to nervous-system buy-in.
        </p>

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', fontSize: 14, lineHeight: 1.7, color: 'rgba(244,241,235,0.78)' }}>
          <li style={{ paddingLeft: 22, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, color: '#FF5BAA' }}>·</span> Bianca&apos;s clinical script delivered by you, to you
          </li>
          <li style={{ paddingLeft: 22, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, color: '#FF5BAA' }}>·</span> Private to you — encrypted in transit and at rest
          </li>
          <li style={{ paddingLeft: 22, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, color: '#FF5BAA' }}>·</span> Cancel anytime from your billing portal
          </li>
        </ul>

        {error && (
          <p style={{ fontSize: 13, color: '#FF8A8A', margin: '0 0 14px' }} role="alert">
            {error}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleYes}
            disabled={loading}
            style={{
              height: 50,
              padding: '0 24px',
              background: '#C42D8E',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Opening checkout…' : 'Yes, add Voice Clone Plus'}
          </button>
          <button
            onClick={dismiss}
            disabled={loading}
            style={{
              height: 44,
              padding: '0 24px',
              background: 'transparent',
              color: 'rgba(244,241,235,0.7)',
              border: '1px solid rgba(244,241,235,0.18)',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.06em',
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            Maybe later
          </button>
        </div>

        <p style={{ fontSize: 11, color: 'rgba(244,241,235,0.5)', textAlign: 'center', margin: '18px 0 0', lineHeight: 1.55 }}>
          $20/mo, billed monthly. Independent from your base subscription.
        </p>
      </div>
    </div>
  );
}
