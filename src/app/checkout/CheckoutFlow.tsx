'use client';

import { useState } from 'react';

type Tier = 'personalized' | 'elite';

const PLANS: {
  tier: Tier;
  name: string;
  price: string;
  period: string;
  tagline: string;
  description: string;
  badge: string | null;
  badgeColor: string;
  features: string[];
  cta: string;
  featured: boolean;
}[] = [
  {
    tier: 'personalized',
    name: 'HERR Personalized',
    price: '$19',
    period: '/month',
    tagline: 'Your voice. Your reprogramming.',
    description:
      'Hear your own voice reprogramming your own mind. The subconscious trusts your voice above all others.',
    badge: 'Most Popular',
    badgeColor: 'text-[var(--herr-pink)]',
    features: [
      'Full affirmation library in your own cloned voice',
      'All 8 activity modes',
      'Personalized existential assessment',
      'Voice clone session + quarterly refresh',
      'HERR Nation community membership',
      'Billing & account management',
    ],
    cta: 'Begin at $19',
    featured: true,
  },
  {
    tier: 'elite',
    name: 'HERR Elite',
    price: '$29',
    period: '/month',
    tagline: 'Clinical-grade. Your voice. Your protocol.',
    description:
      'The full clinical operating system. Athletes. Executives. Practitioners. Those who need the deepest protocol.',
    badge: 'Clinical Grade',
    badgeColor: 'text-[var(--herr-cobalt)]',
    features: [
      'Everything in HERR Personalized',
      'Monthly live group session with Bianca D. McCall, LMFT',
      'Clinically sequenced reprogramming protocol',
      'Elite-only community channels',
      'Access to HERR Certified Moderators',
      'First access to new HERR features',
    ],
    cta: 'Begin at $29',
    featured: false,
  },
];

export default function CheckoutFlow() {
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleSelectPlan(tier: Tier) {
    setSelectedTier(tier);
    setError('');
  }

  function validateEmail(value: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  }

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setEmailError('');
    setError('');

    if (!email.trim()) {
      setEmailError('Email is required.');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (!selectedTier) return;

    setLoading(true);

    // Store email in sessionStorage for reference
    sessionStorage.setItem('herr_checkout_email', email);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedTier, email }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <section className="px-6 py-24">
      <div className="max-w-[900px] mx-auto">
        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-px bg-[var(--herr-border)]">
          {PLANS.map((plan) => {
            const isSelected = selectedTier === plan.tier;
            return (
              <button
                key={plan.tier}
                onClick={() => handleSelectPlan(plan.tier)}
                className={`flex flex-col p-8 md:p-10 text-left transition-all duration-300 ${
                  isSelected
                    ? 'bg-[var(--herr-surface)] ring-2 ring-[var(--herr-pink)]'
                    : plan.featured
                      ? 'bg-[var(--herr-surface)] hover:bg-[var(--herr-card)]'
                      : 'bg-[var(--herr-black)] hover:bg-[var(--herr-surface)]'
                }`}
              >
                {/* Badge */}
                <div className="h-6 mb-4">
                  {plan.badge && (
                    <p className={`herr-label ${plan.badgeColor}`}>{plan.badge}</p>
                  )}
                </div>

                {/* Selection indicator */}
                <div className="flex items-center justify-between mb-2">
                  <p className="herr-label text-[var(--herr-muted)]">{plan.name}</p>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-[var(--herr-pink)] bg-[var(--herr-pink)]'
                        : 'border-[var(--herr-border-mid)]'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-[var(--herr-black)]" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-display text-6xl font-light text-[var(--herr-white)]">
                    {plan.price}
                  </span>
                  <span className="text-[var(--herr-muted)] mb-2 text-sm">{plan.period}</span>
                </div>
                <p className="text-[0.78rem] text-[var(--herr-pink)] font-light italic font-display mb-4">
                  {plan.tagline}
                </p>
                <p className="text-[0.85rem] text-[var(--herr-muted)] mb-8 leading-relaxed">
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[0.85rem] text-[var(--herr-muted)]">
                      <span className="text-[var(--herr-pink)] mt-0.5 shrink-0 leading-none">+</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Email capture form */}
        {selectedTier && (
          <div className="mt-12 max-w-md mx-auto animate-fade-up">
            <form onSubmit={handleContinue}>
              <label className="herr-label text-[var(--herr-muted)] block mb-3">
                Enter your email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                placeholder="you@example.com"
                className={`w-full bg-[var(--herr-surface)] border text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none transition-colors mb-1 ${
                  emailError
                    ? 'border-[var(--herr-pink)]'
                    : 'border-[var(--herr-border)] focus:border-[var(--herr-cobalt)]'
                }`}
              />
              {emailError && (
                <p className="text-[0.75rem] text-[var(--herr-pink)] mb-3">{emailError}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-herr-primary w-full justify-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Redirecting to checkout…' : 'Continue to Payment'}
              </button>
              {error && (
                <p className="mt-3 text-[0.78rem] text-[var(--herr-pink)] text-center">{error}</p>
              )}
            </form>
            <p className="mt-4 text-center text-[0.72rem] text-[var(--herr-faint)]">
              Secure payment via Stripe. Cancel anytime.
            </p>
          </div>
        )}

        {/* Auto-renewal disclosure */}
        <p className="text-center text-[0.78rem] text-[var(--herr-faint)] mt-8">
          Subscriptions renew automatically each month. Cancel anytime from your member dashboard.
        </p>
      </div>
    </section>
  );
}
