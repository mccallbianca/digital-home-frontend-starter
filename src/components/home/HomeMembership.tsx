import Link from 'next/link';
import ScrollFadeIn from './ScrollFadeIn';

interface Tier {
  slug: 'collective' | 'personalized' | 'elite';
  name: string;
  tagline: string;
  price: string;
  features: { lead?: boolean; text: string }[];
  ctaLabel: string;
  buttonVariant: 'outline' | 'solid';
  popular?: boolean;
}

const TIERS: Tier[] = [
  {
    slug: 'collective',
    name: 'HERR COLLECTIVE',
    tagline: "Bianca's voice. Your daily reprogramming.",
    price: '$9',
    features: [
      { text: "Full ECQO Sound library with Bianca's voice" },
      { text: 'All 8 activity modes' },
      { text: 'Voice-Only delivery' },
      { text: 'AI Companion (text) — 8 sessions/month' },
      { text: 'Full HERR Nation community access' },
      { text: '90-second clinical screener' },
    ],
    ctaLabel: 'Choose Collective',
    buttonVariant: 'outline',
  },
  {
    slug: 'personalized',
    name: 'HERR PERSONALIZED',
    tagline: 'Your voice. Your reprogramming.',
    price: '$19',
    features: [
      { lead: true, text: 'Everything in Collective, plus:' },
      { text: 'Your own cloned voice on every affirmation' },
      { text: 'Music Delivery — all 8 genres' },
      { text: 'AI Companion (text + voice) — 20 text + 5 voice sessions/month' },
      { text: 'Personalized audio tracks tuned to your screener results' },
      { text: 'Priority HERR Nation features' },
    ],
    ctaLabel: 'Choose Personalized',
    buttonVariant: 'solid',
    popular: true,
  },
  {
    slug: 'elite',
    name: 'HERR ELITE',
    tagline: 'Clinical-grade. The full protocol.',
    price: '$29',
    features: [
      { lead: true, text: 'Everything in Personalized, plus:' },
      { text: 'AI Companion with extended access — 50 text + 8 voice sessions/month' },
      { text: 'Direct access to Bianca — monthly live group sessions' },
      { text: "Bianca's professional network access" },
      { text: 'Early access to new ECQO products' },
      { text: 'Path to ECQO Certifications and Marketplace revenue share' },
    ],
    ctaLabel: 'Choose Elite',
    buttonVariant: 'outline',
  },
];

export default function HomeMembership() {
  return (
    <section className="home-section home-section--cream" id="membership" aria-labelledby="membership-heading">
      <div className="home-section__inner">
        <ScrollFadeIn>
          <p className="home-eyebrow home-eyebrow--ink">MEMBERSHIP</p>
          <h2 id="membership-heading" className="home-h2 home-h2--ink">
            Choose your level of self-care.
          </h2>
        </ScrollFadeIn>

        <div className="tier-grid">
          {TIERS.map((t, i) => (
            <ScrollFadeIn key={t.slug} delay={120 + i * 100}>
              <div className={`tier-card${t.popular ? ' tier-card--popular' : ''}`}>
                {t.popular && <div className="tier-card__banner">MOST POPULAR</div>}
                <p className="tier-card__name">{t.name}</p>
                <p className="tier-card__tag">{t.tagline}</p>
                <div className="tier-card__price">
                  <span className="tier-card__price-amount">{t.price}</span>
                  <span className="tier-card__price-period">/month</span>
                </div>
                <ul className="tier-card__features">
                  {t.features.map((f, idx) => (
                    <li key={idx} className={f.lead ? 'tier-card__feature tier-card__feature--lead' : 'tier-card__feature'}>
                      {!f.lead && <span className="tier-card__feature-dot" aria-hidden />}
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
                {t.slug === 'elite' && (
                  <p className="tier-card__footnote">
                    <Link href="/certifications" className="tier-card__footnote-link">
                      Learn more about ECQO Certifications →
                    </Link>
                  </p>
                )}
                <Link
                  href={`/checkout?tier=${t.slug}`}
                  className={`tier-card__cta tier-card__cta--${t.buttonVariant}`}
                >
                  {t.ctaLabel} <span aria-hidden>→</span>
                </Link>
              </div>
            </ScrollFadeIn>
          ))}
        </div>

        <ScrollFadeIn delay={300}>
          <div className="addon-card">
            <div className="addon-card__head">
              <p className="addon-card__eyebrow">VOICE CLONE PLUS</p>
              <p className="addon-card__price">+$20 /month on Elite</p>
            </div>
            <p className="addon-card__title">
              Receive affirmations and a conversational AI companion who speaks in your own voice.
            </p>
            <p className="addon-card__body">
              Faster results. Scientifically proven. Unlock 150 minutes of voice clone usage per month.
            </p>
            <Link href="/portal/billing" className="home-link home-link--magenta-light">
              Upgrade Voice Clone Plus <span aria-hidden>→</span>
            </Link>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
