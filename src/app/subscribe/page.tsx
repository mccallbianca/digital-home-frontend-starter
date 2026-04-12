import type { Metadata } from 'next';
import CheckoutButton from './CheckoutButton';

export const metadata: Metadata = {
  title: 'Subscribe — Begin Your Reprogramming',
  description:
    'Four tiers of clinical reprogramming. HERR Free to explore. Collective at $9/month in Bianca D. McCall\'s voice. Personalized at $19/month in your own cloned voice. Elite at $29/month with live sessions and ECQO Sound.',
};

const PLANS = [
  {
    tier:        'free' as const,
    name:        'HERR Free',
    price:       '$0',
    period:      '',
    tagline:     'Explore the framework.',
    description: 'Access the existential screener and experience the HERR methodology. Your journey starts with awareness.',
    badge:       null,
    badgeColor:  '',
    features: [
      'Monthly existential screener',
      'Access to the HERR Journal content library',
      'Community portal (standard channels)',
    ],
    cta:      'Create Free Account',
    featured: false,
  },
  {
    tier:        'collective' as const,
    name:        'HERR Collective',
    price:       '$9',
    period:      '/month',
    tagline:     'Bianca\u2019s voice. Your daily reprogramming.',
    description: 'Daily affirmations delivered in the voice of Bianca D. McCall, LMFT \u2014 the clinician behind the framework.',
    badge:       null,
    badgeColor:  '',
    features: [
      'Daily affirmations in Bianca D. McCall\u2019s voice',
      'Up to 3 activity modes',
      'Monthly existential screener',
      'HERR Journal content library',
      'Community portal (standard channels)',
      'Voice-only delivery',
    ],
    cta:      'Begin at $9',
    featured: false,
  },
  {
    tier:        'personalized' as const,
    name:        'HERR Personalized',
    price:       '$19',
    period:      '/month',
    tagline:     'Your voice. Your reprogramming.',
    description: 'Hear your own voice reprogramming your own mind. The subconscious trusts your voice above all others.',
    badge:       'Most Popular',
    badgeColor:  'text-[var(--herr-pink)]',
    features: [
      'Daily affirmations in your own cloned voice',
      'Up to 3 activity modes',
      'Voice or music delivery \u2014 you choose',
      'Genre selection (updatable weekly)',
      'Voice clone session + quarterly refresh',
      'Community portal (standard channels)',
      'Monthly existential screener',
    ],
    cta:      'Begin at $19',
    featured: true,
  },
  {
    tier:        'elite' as const,
    name:        'HERR Elite',
    price:       '$29',
    period:      '/month',
    tagline:     'Clinical-grade. The full protocol.',
    description: 'The full clinical operating system. Athletes. Executives. Practitioners. Those who need the deepest protocol.',
    badge:       'Clinical Grade',
    badgeColor:  'text-[var(--herr-cobalt)]',
    features: [
      'Everything in HERR Personalized',
      'Up to 5 activity modes',
      'Monthly live group session with Bianca D. McCall, LMFT (25 seats)',
      'Elite-only community channels',
      'Access to beta testing areas',
      'Monthly therapeutic progression: reprogramming \u2192 support \u2192 maintenance',
      'First access to new HERR features',
    ],
    cta:      'Begin at $29',
    featured: false,
  },
];

const FAQS = [
  {
    q: 'Can I change my tier later?',
    a: 'Yes. Upgrade or downgrade anytime from your member dashboard. Changes take effect at the next billing cycle.',
  },
  {
    q: 'Is my voice data secure?',
    a: 'All voice recordings are encrypted, stored securely, and used exclusively to generate your personal affirmations. We never share, sell, or use your voice for any other purpose. See our Privacy Policy for full details.',
  },
  {
    q: 'What if I want to cancel?',
    a: 'Cancel anytime. No contracts. Your access continues through the end of your paid billing period.',
  },
  {
    q: 'Is HERR covered by insurance?',
    a: 'HERR is a wellness subscription and is not currently covered by health insurance. HSA/FSA eligibility may vary — consult your plan administrator.',
  },
  {
    q: 'Which tier is right for me?',
    a: 'Start with HERR Free to experience the existential screener. If you want daily affirmations in Bianca\u2019s voice, choose Collective. If you are ready to hear your own voice doing the work, choose Personalized. If you want the full clinical protocol with live sessions and ECQO Sound, choose Elite.',
  },
];

export default function SubscribePage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-40 pb-24 border-b border-[var(--herr-border)] overflow-hidden text-center">
        <div className="absolute inset-0 herr-glow pointer-events-none" />
        <div className="max-w-[900px] mx-auto relative">

          <p className="herr-label text-[var(--herr-muted)] mb-6">Phase 1 — Now Available</p>
          <h1 className="font-display text-5xl md:text-7xl xl:text-8xl font-light text-[var(--herr-white)] leading-[0.9] mb-8">
            Begin Your<br />
            <span className="text-[var(--herr-pink)]">Reprogramming.</span>
          </h1>
          <p className="text-lg text-[var(--herr-muted)] max-w-2xl mx-auto leading-relaxed">
            Whether you say I&apos;m HERR, I&apos;m HIM with HERR, or We&apos;re HERR — this is where it begins.
          </p>

        </div>
      </section>

      {/* ── Pricing Cards ─────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-[1200px] mx-auto">

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--herr-border)]">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col p-8 md:p-10 ${
                  plan.featured
                    ? 'bg-[var(--herr-surface)]'
                    : 'bg-[var(--herr-black)]'
                }`}
              >
                {/* Badge */}
                <div className="h-6 mb-4">
                  {plan.badge && (
                    <p className={`herr-label ${plan.badgeColor}`}>{plan.badge}</p>
                  )}
                </div>

                {/* Name + price */}
                <p className="herr-label text-[var(--herr-muted)] mb-2">{plan.name}</p>
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
                <ul className="flex flex-col gap-3 mb-10 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[0.85rem] text-[var(--herr-muted)]">
                      <span className="text-[var(--herr-pink)] mt-0.5 shrink-0 leading-none">+</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <CheckoutButton
                  tier={plan.tier}
                  label={plan.cta}
                  className={plan.featured ? 'btn-herr-primary' : 'btn-herr-ghost'}
                />
              </div>
            ))}
          </div>

          {/* Auto-renewal disclosure */}
          <p className="text-center text-[0.78rem] text-[var(--herr-faint)] mt-6">
            Subscriptions renew automatically each month. Cancel anytime from your member dashboard.
          </p>

        </div>
      </section>

      {/* ── Clinical Disclaimer ───────────────────────────────────── */}
      <section className="px-6 py-10 border-t border-[var(--herr-border)] bg-[var(--herr-surface)]">
        <div className="max-w-[800px] mx-auto text-center">
          <p className="text-[0.82rem] text-[var(--herr-muted)] leading-relaxed">
            HERR™ is a wellness tool and is not a substitute for professional mental health treatment.
            Always consult a licensed clinician for clinical concerns. The HERR™ Progressive Reprogramming System — Patent Pending.
          </p>
        </div>
      </section>

      {/* ── What Happens Next ─────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)]">
        <div className="max-w-[1200px] mx-auto">

          <p className="herr-label text-[var(--herr-muted)] mb-4">What Happens Next</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-12">
            The process.
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--herr-border)]">
            {[
              { step: '01', title: 'Subscribe', body: 'Choose your tier and complete checkout. Secure payment via Stripe.' },
              { step: '02', title: 'Assess', body: 'Complete your clinical existential assessment. This is the foundation everything is built on.' },
              { step: '03', title: 'Record', body: 'Tier 2 + 3: Record your voice samples. This becomes the voice that guides you. Tier 1: Skip to Receive.' },
              { step: '04', title: 'Receive', body: 'Your personalized I AM declarations — in your voice or Bianca D. McCall\'s — delivered across your chosen activity modes.' },
            ].map((item) => (
              <div key={item.step} className="bg-[var(--herr-black)] p-8 hover:bg-[var(--herr-surface)] transition-colors duration-300">
                <p className="font-display text-4xl font-light text-[var(--herr-pink)] opacity-30 mb-4">{item.step}</p>
                <h3 className="font-display text-xl font-light text-[var(--herr-white)] mb-3">{item.title}</h3>
                <p className="text-[0.82rem] text-[var(--herr-muted)] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)] bg-[var(--herr-surface)]">
        <div className="max-w-[800px] mx-auto">

          <p className="herr-label text-[var(--herr-muted)] mb-4">Questions</p>
          <h2 className="font-display text-4xl font-light text-[var(--herr-white)] mb-12">
            Before you begin.
          </h2>

          <div className="flex flex-col gap-px bg-[var(--herr-border)]">
            {FAQS.map((faq) => (
              <div key={faq.q} className="bg-[var(--herr-surface)] p-8 hover:bg-[var(--herr-card)] transition-colors duration-300">
                <h3 className="text-[var(--herr-white)] font-medium mb-3">{faq.q}</h3>
                <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-[0.72rem] text-[var(--herr-faint)] leading-relaxed">
            HERR™ is a wellness tool and is not a substitute for professional mental health treatment. Always consult a licensed clinician for clinical concerns. HERR™ and Human Existential Response and Reprogramming™ are trademarks of ECQO Holdings™. The HERR™ Progressive Reprogramming System — Patent Pending. © ECQO Holdings™. All rights reserved.
          </p>

        </div>
      </section>

    </main>
  );
}
