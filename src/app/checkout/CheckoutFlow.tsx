'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ── Types ─────────────────────────────────────────────────────────────────── */

type Tier = 'free' | 'collective' | 'personalized' | 'elite';

interface Feature {
  text: string;
  /** true → white / bold (key differentiator), false → dimmed (inherited) */
  highlight: boolean;
  bold?: boolean;
}

interface Plan {
  tier: Tier;
  label: string;        // EXPLORE, COLLECTIVE, etc.
  name: string;
  price: string;
  period: string;
  freeNote?: string;    // "Forever free" for the $0 tier
  tagline: string;
  features: Feature[];
  cta: string;
  featured: boolean;
}

/* ── Plan Data ─────────────────────────────────────────────────────────────── */

const PLANS: Plan[] = [
  {
    tier: 'free',
    label: 'EXPLORE',
    name: 'HERR Free',
    price: '$0',
    period: '',
    freeNote: 'Forever free',
    tagline: 'Explore the framework.',
    features: [
      { text: 'Monthly existential screener', highlight: true },
      { text: 'HERR Journal content library', highlight: false },
      { text: 'Community portal (standard channels)', highlight: false },
      { text: 'HERR methodology introduction', highlight: false },
      { text: 'Self-guided awareness tools', highlight: false },
    ],
    cta: 'Start Free',
    featured: false,
  },
  {
    tier: 'collective',
    label: 'COLLECTIVE',
    name: 'HERR Collective',
    price: '$9',
    period: '/month',
    tagline: 'Bianca\u2019s voice. Your daily reprogramming.',
    features: [
      { text: 'Everything in Free', highlight: false },
      { text: 'Daily affirmations in Bianca\u2019s voice', highlight: true },
      { text: 'Up to 3 activity modes', highlight: true },
      { text: 'Monthly screener with insights', highlight: false },
      { text: 'Full journal access', highlight: false },
      { text: 'Collective community channels', highlight: false },
      { text: 'Voice-only delivery', highlight: false },
    ],
    cta: 'Join Collective',
    featured: false,
  },
  {
    tier: 'personalized',
    label: 'PERSONALIZED',
    name: 'HERR Personalized',
    price: '$19',
    period: '/month',
    tagline: 'Your voice. Your reprogramming.',
    features: [
      { text: 'Everything in Collective', highlight: false },
      { text: 'Daily affirmations in your own cloned voice', highlight: true, bold: true },
      { text: 'Up to 3 activity modes', highlight: false },
      { text: 'Voice or music delivery \u2014 you choose', highlight: true },
      { text: 'Genre selection (updatable weekly)', highlight: true },
      { text: 'Voice clone session + quarterly refresh', highlight: true },
      { text: 'Personalized community channels', highlight: false },
      { text: 'Priority support', highlight: false },
    ],
    cta: 'Get Personalized',
    featured: true,
  },
  {
    tier: 'elite',
    label: 'ELITE',
    name: 'HERR Elite',
    price: '$29',
    period: '/month',
    tagline: 'Clinical-grade. The full protocol.',
    features: [
      { text: 'Everything in Personalized', highlight: false },
      { text: 'Up to 5 activity modes', highlight: true },
      { text: 'Monthly live session with Bianca (25 seats)', highlight: true, bold: true },
      { text: 'Elite-only community channels', highlight: false },
      { text: 'Beta testing access', highlight: false },
      { text: 'Therapeutic progression tracking', highlight: true },
      { text: 'Quarterly 1-on-1 check-in (15 min)', highlight: true },
      { text: 'Early access to ECQO features', highlight: false },
    ],
    cta: 'Go Elite',
    featured: false,
  },
];

/* ── Magenta dot SVG ───────────────────────────────────────────────────────── */

function Dot() {
  return (
    <span
      className="shrink-0 mt-[7px] block rounded-full"
      style={{ width: 6, height: 6, backgroundColor: '#C42D8E' }}
    />
  );
}

/* ── Trust signal icons (simple SVG, no emoji) ─────────────────────────────── */

function IconLock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconClipboard() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}
function IconHeart() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function CheckoutFlow() {
  const [loading, setLoading] = useState<Tier | null>(null);
  const [error, setError] = useState('');

  async function handleCta(tier: Tier) {
    setError('');

    if (tier === 'free') {
      window.location.href = '/signup';
      return;
    }

    setLoading(tier);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(null);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('Connection error. Please try again.');
      setLoading(null);
    }
  }

  /* ── Button style per tier ─────────────────────────────────────────────── */

  function ctaStyle(tier: Tier): React.CSSProperties {
    const base: React.CSSProperties = {
      width: '100%',
      height: 48,
      borderRadius: 12,
      fontWeight: 600,
      fontSize: 14,
      textTransform: 'uppercase',
      letterSpacing: 1,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginTop: 'auto',
      border: 'none',
    };

    switch (tier) {
      case 'free':
        return { ...base, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#FFFFFF' };
      case 'collective':
        return { ...base, background: 'transparent', border: '1px solid #C42D8E', color: '#C42D8E' };
      case 'personalized':
        return { ...base, background: '#C42D8E', color: '#FFFFFF' };
      case 'elite':
        return { ...base, background: 'linear-gradient(135deg, #C42D8E, #8B1A5E)', color: '#FFFFFF' };
    }
  }

  /* ── Card style per tier ───────────────────────────────────────────────── */

  function cardStyle(featured: boolean): React.CSSProperties {
    if (featured) {
      return {
        background: 'rgba(22, 22, 31, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '2px solid rgba(196, 45, 142, 0.5)',
        borderRadius: 16,
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 0 40px rgba(196, 45, 142, 0.15)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      };
    }
    return {
      background: '#16161F',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 16,
      padding: '40px 32px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    };
  }

  /* ── Render ────────────────────────────────────────────────────────────── */

  return (
    <>
      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div style={{ paddingTop: 80, paddingBottom: 40, textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 36,
            fontWeight: 600,
            color: '#FFFFFF',
            margin: 0,
          }}
          className="max-md:!text-[28px]"
        >
          Choose Your HERR Experience
        </h1>
        <p
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 16,
            color: 'rgba(255,255,255,0.6)',
            marginTop: 12,
            maxWidth: 560,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}
        >
          Every journey begins with awareness. Select the level of care that meets you where you are.
        </p>
      </div>

      {/* ── Tier Cards ───────────────────────────────────────────────────── */}
      <div
        className="checkout-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px',
          alignItems: 'stretch',
        }}
      >
        {PLANS.map((plan) => (
          <div
            key={plan.tier}
            className={`checkout-card${plan.featured ? ' checkout-card--featured' : ''}`}
            style={cardStyle(plan.featured)}
          >
            {/* "MOST POPULAR" pill */}
            {plan.featured && (
              <span
                style={{
                  position: 'absolute',
                  top: -16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#C42D8E',
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  padding: '6px 20px',
                  borderRadius: 20,
                  whiteSpace: 'nowrap',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                Most Popular
              </span>
            )}

            {/* Tier label */}
            <p
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 2.5,
                textTransform: 'uppercase',
                color: plan.featured ? '#C42D8E' : 'rgba(255,255,255,0.5)',
                marginTop: plan.featured ? 12 : 0,
                marginBottom: 8,
              }}
            >
              {plan.label}
            </p>

            {/* Tier name */}
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 24,
                fontWeight: 600,
                color: '#FFFFFF',
                margin: 0,
              }}
            >
              {plan.name}
            </h2>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 24 }}>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 56,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1,
                }}
              >
                {plan.price}
              </span>
              {plan.period && (
                <span
                  style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: 16,
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {plan.period}
                </span>
              )}
            </div>
            {plan.freeNote && (
              <p
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: 14,
                  fontStyle: 'italic',
                  color: '#F4F1EB',
                  marginTop: 4,
                }}
              >
                {plan.freeNote}
              </p>
            )}

            {/* Tagline */}
            <p
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 15,
                fontStyle: 'italic',
                color: '#E8388A',
                marginTop: 8,
              }}
            >
              {plan.tagline}
            </p>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '24px 0' }} />

            {/* Feature list */}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {plan.features.map((f) => (
                <li
                  key={f.text}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: f.highlight ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                    fontWeight: f.bold ? 600 : 400,
                  }}
                >
                  <Dot />
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button
              onClick={() => handleCta(plan.tier)}
              disabled={loading === plan.tier}
              style={{
                ...ctaStyle(plan.tier),
                marginTop: 32,
                opacity: loading === plan.tier ? 0.6 : 1,
              }}
              className="checkout-cta"
            >
              {loading === plan.tier ? 'Redirecting\u2026' : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p style={{ textAlign: 'center', color: '#E8388A', fontSize: 14, marginTop: 16 }}>
          {error}
        </p>
      )}

      {/* ── Trust Signals ────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 32,
          marginTop: 60,
          flexWrap: 'wrap',
          padding: '0 24px',
        }}
      >
        {[
          { icon: <IconLock />, text: 'Cancel anytime' },
          { icon: <IconShield />, text: 'Secure checkout via Stripe' },
          { icon: <IconHeart />, text: 'HIPAA-aligned' },
          { icon: <IconClipboard />, text: 'No contracts' },
        ].map((item) => (
          <span
            key={item.text}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: 13,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            {item.icon}
            {item.text}
          </span>
        ))}
      </div>

      {/* ── Legal Footer ─────────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: 40,
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 12,
          color: 'rgba(255,255,255,0.35)',
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.8,
          padding: '0 24px 60px',
        }}
      >
        <p style={{ margin: 0 }}>
          Subscriptions auto-renew monthly. Cancel anytime from your account settings.
        </p>
        <p style={{ margin: '4px 0 0' }}>
          By subscribing, you agree to our{' '}
          <Link href="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }} className="hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }} className="hover:underline">
            Privacy Policy
          </Link>.
        </p>
        <p style={{ margin: '4px 0 0' }}>
          HERR is a wellness platform and is not a substitute for licensed clinical care.
        </p>
        <p style={{ margin: '4px 0 0' }}>
          If you are in crisis, call or text 988.
        </p>
      </div>

      {/* ── Responsive + hover CSS ───────────────────────────────────────── */}
      <style>{`
        .checkout-card:hover {
          border-color: rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .checkout-card--featured:hover {
          border-color: #C42D8E !important;
          box-shadow: 0 0 60px rgba(196, 45, 142, 0.25) !important;
        }
        .checkout-card--featured {
          transform: scale(1.03);
          animation: checkoutGlow 3s ease-in-out infinite;
        }
        @keyframes checkoutGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(196, 45, 142, 0.15); }
          50%      { box-shadow: 0 0 50px rgba(196, 45, 142, 0.3); }
        }
        .checkout-cta:hover {
          filter: brightness(1.15);
        }
        @media (max-width: 1024px) {
          .checkout-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 767px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
          .checkout-card--featured {
            order: -1;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}
