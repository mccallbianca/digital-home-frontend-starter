'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import RevShareModal from './RevShareModal';

/* ── Types ─────────────────────────────────────────────────────────────────── */

type Tier = 'collective' | 'personalized' | 'elite' | 'enterprise';

interface Plan {
  tier: Tier;
  label: string;
  name: string;
  price: string;
  period: string;
  taglineLines: string[];
  features: string[];
  cta: string;
  featured: boolean;
  trialBadge?: boolean;
  enterpriseHref?: string;
}

/* ── Plan Data ─────────────────────────────────────────────────────────────── */

const PLANS: Plan[] = [
  {
    tier: 'collective',
    label: 'COLLECTIVE',
    name: 'HERR Collective',
    price: '$9',
    period: '/month',
    taglineLines: [
      'Daily Voice Affirmations.',
      'AI Companion.',
      'HERR Nation Member Access.',
    ],
    features: [
      'Daily Voice Affirmations in Standard Voice Model',
      'Select up to 2 Activity Modes per week — Themed Affirmations',
      'AI Companion — (8) Text Sessions per month',
      'Find YOUR Community in HERR Nation',
    ],
    cta: 'Collective Healing',
    featured: false,
  },
  {
    tier: 'personalized',
    label: 'PERSONALIZED',
    name: 'HERR Personalized',
    price: '$19',
    period: '/month',
    taglineLines: [
      'ECQO Sound Access.',
      'AI Companion Voice.',
      'HERR Nation Priority Member.',
    ],
    trialBadge: true,
    features: [
      'Everything in Collective',
      'Access ECQO Sound to receive affirmations in a layered music track',
      'AI Companion — (20) Text Sessions + (5) Voice Sessions per month',
      'Monthly Screener Session with Conversational AI to Measure Progress',
      'Priority HERR Nation features',
    ],
    cta: 'Personalized Healing',
    featured: true,
  },
  {
    tier: 'elite',
    label: 'ELITE',
    name: 'HERR Elite',
    price: '$29',
    period: '/month',
    taglineLines: ['Clinical-grade. The full protocol.'],
    trialBadge: true,
    features: [
      'Everything in Personalized',
      'AI Companion — (50) Text Sessions + (8) Voice Sessions per month',
      'Invited to attend monthly live group sessions with the Founder',
      'Early access to new ECQO products',
      "We'll Pay YOU — Marketplace revenue share opportunities for Elite Members ONLY",
    ],
    cta: 'Healing for the Elite',
    featured: false,
  },
  {
    tier: 'enterprise',
    label: 'ENTERPRISE',
    name: 'HERR Enterprise',
    price: 'Contact for Pricing',
    period: '',
    taglineLines: ['For organizations and integration partners.'],
    features: [
      'Powered by ECQO clinical AI infrastructure',
      'Custom integration with your platform',
      'Dedicated clinical advisor',
      'Volume PMPM pricing',
      'SAMHSA-aligned compliance support',
      'Federal advisory consultation',
    ],
    cta: 'Contact for Pricing',
    featured: false,
    enterpriseHref: '/enterprise',
  },
];

/* ── Trust signal icons ─────────────────────────────────────────────────────── */

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
  const [highlightedTier, setHighlightedTier] = useState<Tier | null>(null);
  const [revShareOpen, setRevShareOpen] = useState(false);

  // Pre-select / highlight the tier requested via ?tier=collective|personalized|elite|enterprise.
  // Does NOT auto-fire checkout — user must click the tier's CTA to proceed.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('tier');
    if (!requested) return;
    const valid: Tier[] = ['collective', 'personalized', 'elite', 'enterprise'];
    if (!valid.includes(requested as Tier)) return;
    setHighlightedTier(requested as Tier);
    // Scroll the highlighted card into view on mount.
    setTimeout(() => {
      const el = document.querySelector(`[data-tier="${requested}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
  }, []);

  async function handleCta(plan: Plan) {
    setError('');

    // Enterprise tier uses mailto — let the browser handle it.
    if (plan.tier === 'enterprise' && plan.enterpriseHref) {
      window.location.href = plan.enterpriseHref;
      return;
    }

    setLoading(plan.tier);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: plan.tier }),
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

  return (
    <section className="checkout-section">
      <div className="checkout-inner">
        <div className="checkout-header">
          <p className="checkout-eyebrow">Membership</p>
          <h2 className="checkout-h2">Choose your level of self-care.</h2>
          <p className="checkout-lead">
            Every journey begins with awareness. Select the level of care that meets you where you are.
          </p>
        </div>

        <div className="checkout-grid">
          {PLANS.map((plan) => {
            const isHighlighted = highlightedTier === plan.tier;
            return (
              <div
                key={plan.tier}
                data-tier={plan.tier}
                className={[
                  'checkout-card',
                  plan.featured ? 'checkout-card--featured' : '',
                  isHighlighted ? 'checkout-card--highlighted' : '',
                  plan.tier === 'enterprise' ? 'checkout-card--enterprise' : '',
                ].filter(Boolean).join(' ')}
              >
                {plan.featured && (
                  <span className="checkout-card__popular">MOST POPULAR</span>
                )}

                {plan.trialBadge && (
                  <span className="checkout-card__trial">7-DAY FREE TRIAL</span>
                )}

                <p className="checkout-card__label">{plan.label}</p>
                <h3 className="checkout-card__name">{plan.name}</h3>

                <div className="checkout-card__price">
                  <span className="checkout-card__price-amount">{plan.price}</span>
                  {plan.period && (
                    <span className="checkout-card__price-period">{plan.period}</span>
                  )}
                </div>

                <div className="checkout-card__taglines">
                  {plan.taglineLines.map((line, i) => (
                    <p key={i} className="checkout-card__tagline">{line}</p>
                  ))}
                </div>

                <div className="checkout-card__divider" />

                <ul className="checkout-card__features">
                  {plan.features.map((text) => (
                    <li key={text} className="checkout-card__feature">
                      <span className="checkout-card__feature-dot" aria-hidden />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>

                {plan.tier === 'elite' && (
                  <p className="checkout-card__footnote">
                    <button
                      type="button"
                      onClick={() => setRevShareOpen(true)}
                      className="checkout-card__footnote-link checkout-card__footnote-button"
                    >
                      Contact Us to Join the RevShare Interest List &rarr;
                    </button>
                  </p>
                )}

                <button
                  onClick={() => handleCta(plan)}
                  disabled={loading === plan.tier}
                  className={[
                    'checkout-card__cta',
                    plan.featured
                      ? 'checkout-card__cta--solid'
                      : 'checkout-card__cta--outline',
                  ].join(' ')}
                >
                  {loading === plan.tier ? 'Redirecting\u2026' : plan.cta}{' '}
                  <span aria-hidden>&rarr;</span>
                </button>

                {plan.trialBadge && (
                  <p className="checkout-card__reassurance">
                    No charge for 7 days. Cancel anytime.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <p className="checkout-error">{error}</p>
        )}

        <div className="checkout-trust">
          {[
            { icon: <IconLock />, text: 'Cancel anytime' },
            { icon: <IconShield />, text: 'Secure checkout via Stripe' },
            { icon: <IconHeart />, text: 'HIPAA-aligned' },
            { icon: <IconClipboard />, text: 'No contracts' },
          ].map((item) => (
            <span key={item.text} className="checkout-trust__chip">
              {item.icon}
              {item.text}
            </span>
          ))}
        </div>

        <div className="checkout-legal">
          <p>
            Personalized and Elite tiers include a 7-day free trial. Subscriptions auto-renew monthly.
            Cancel anytime from your account settings.
          </p>
          <p>
            By subscribing, you agree to our{' '}
            <Link href="/terms" className="checkout-legal__link">Terms of Service</Link>{' '}and{' '}
            <Link href="/privacy" className="checkout-legal__link">Privacy Policy</Link>.
          </p>
          <p>HERR is a wellness platform and is not a substitute for licensed clinical care.</p>
          <p>If you are in crisis, call or text <a href="tel:988" className="checkout-legal__link">988</a>.</p>
        </div>
      </div>

      <RevShareModal open={revShareOpen} onClose={() => setRevShareOpen(false)} />
    </section>
  );
}
