import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import WaveformVisual from '@/components/home/WaveformVisual';
import ScrollFadeIn from '@/components/home/ScrollFadeIn';
import ParticleField from '@/components/ui/ParticleField';
import { JsonLd } from '@/components/seo/JsonLd';
import CrisisResource from '@/components/ui/CrisisResource';

export const metadata: Metadata = {
  title: 'HERR | Human Existential Response and Reprogramming',
  description:
    'A clinical wellness operating system that delivers personalized voice affirmations in your own cloned voice. Regulate first. Reprogram second. Founded by Bianca D. McCall, LMFT.',
};

/* ── Static data ─────────────────────────────────────────────────────── */

const METHOD_STEPS = [
  {
    num: '01',
    name: 'ASSESS',
    body: 'Surface what the conscious mind hides. The existential screener quantifies your inner landscape.',
  },
  {
    num: '02',
    name: 'REGULATE',
    body: 'Calm the nervous system first. Personalized regulation calibrated to your screener results.',
  },
  {
    num: '03',
    name: 'REPROGRAM',
    body: 'Daily affirmations in your own cloned voice. The subconscious trusts your voice above all others.',
  },
];

const TIERS = [
  {
    name: 'HERR Collective',
    price: '$9',
    tagline: "Bianca\u2019s voice. Your daily reprogramming.",
    btnStyle: 'outlined' as const,
  },
  {
    name: 'HERR Personalized',
    price: '$19',
    tagline: 'Your voice. Your reprogramming.',
    btnStyle: 'solid' as const,
    popular: true,
  },
  {
    name: 'HERR Elite',
    price: '$29',
    tagline: 'Clinical-grade. The full protocol.',
    btnStyle: 'gradient' as const,
  },
];

const CREDENTIALS = [
  'SAMHSA Advisor',
  'LMFT',
  'TEDx Speaker',
  'Pro Athlete',
  'NFL/MLB Consultant',
];

const JOURNAL_PREVIEW = [
  {
    slug: 'understanding-your-inner-conductor',
    image: '/images/dim-existential-figure-void.jpg',
    category: 'Performance',
    title: 'Understanding Your Inner Conductor',
    excerpt: 'The conductor of your life is not your talent, your training, or your discipline. It is the voice only you can hear.',
    readTime: '5 min read',
  },
  {
    slug: 'science-of-voice-based-reprogramming',
    image: '/images/dim-emotional-eye-release.jpg',
    category: 'Clinical',
    title: 'The Science of Voice-Based Reprogramming',
    excerpt: 'Why every attempt to install new beliefs fails without first calming the nervous system.',
    readTime: '4 min read',
  },
  {
    slug: 'why-your-voice-is-your-most-powerful-tool',
    image: '/images/dim-executive-hand-decides.jpg',
    category: 'Mindset',
    title: 'Why Your Voice Is Your Most Powerful Tool',
    excerpt: 'Self-referential processing is not a theory. It is the mechanism that makes HERR different.',
    readTime: '6 min read',
  },
];

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function HomePage() {
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HERR | Human Existential Response and Reprogramming',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    url: 'https://h3rr.com',
    description:
      'A clinical wellness operating system that delivers personalized voice affirmations in your own cloned voice.',
    creator: {
      '@type': 'Person',
      name: 'Bianca D. McCall, LMFT',
      jobTitle: 'Licensed Marriage and Family Therapist',
    },
    offers: [
      { '@type': 'Offer', name: 'HERR Free', price: '0', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'HERR Collective', price: '9', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'HERR Personalized', price: '19', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'HERR Elite', price: '29', priceCurrency: 'USD' },
    ],
  };

  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0F' }}>
      <JsonLd data={softwareAppSchema} />

      {/* ── Section 1: Hero (dark) ─────────────────────────────────── */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 24px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0A0A0F 0%, #111118 50%, #0A0A0F 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease infinite',
        }}
      >
        <ParticleField />
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 600,
            color: '#FFFFFF',
            lineHeight: 1.15,
            maxWidth: 720,
            margin: '0 0 24px',
          }}
        >
          Reclaim Your Power with HERR
        </h1>

        <p
          className="animate-fade-up animate-delay-3"
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '1.25rem',
            color: '#FAF8F5',
            margin: '16px 0 40px',
            maxWidth: 640,
            lineHeight: 1.5,
          }}
        >
          The first clinically-informed defense against a world designed to dysregulate your nervous system.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 48,
              padding: '0 32px',
              background: '#C42D8E',
              color: '#FFFFFF',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textDecoration: 'none',
              transition: 'background 200ms ease',
            }}
          >
            Begin Your Journey
          </Link>
          <a
            href="#method"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 48,
              padding: '0 32px',
              background: 'transparent',
              color: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.3)',
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textDecoration: 'none',
              transition: 'border-color 200ms ease',
            }}
          >
            See How It Works
          </a>
        </div>

        <p
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.4)',
            marginTop: 32,
            maxWidth: 480,
          }}
        >
          Designed by a licensed clinician · Used by athletes, executives &amp; practitioners
        </p>
      </section>

      {/* ── Section 2: The Method (warm light) ─────────────────────── */}
      <section
        id="method"
        style={{
          background: '#FAF8F5',
          padding: 'clamp(64px, 10vw, 120px) 24px',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '2.5px',
              color: '#C42D8E',
              marginBottom: 16,
            }}
          >
            THE METHOD
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: 600,
              color: '#1A1A2E',
              marginBottom: 48,
              lineHeight: 1.2,
            }}
          >
            Three steps to reprogramming your inner voice.
          </h2>

          <div className="method-grid">
            {METHOD_STEPS.map((step, i) => (
              <ScrollFadeIn key={step.num} delay={i * 100}>
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    padding: '40px 32px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: 56,
                      fontWeight: 700,
                      color: '#C42D8E',
                      lineHeight: 1,
                      marginBottom: 16,
                    }}
                  >
                    {step.num}
                  </p>
                  <p
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: '#1A1A2E',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: 12,
                    }}
                  >
                    {step.name}
                  </p>
                  <p
                    style={{
                      fontSize: 15,
                      color: '#6B6B7B',
                      lineHeight: 1.6,
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link
              href="/how-it-works"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 48,
                padding: '0 32px',
                background: 'transparent',
                color: '#1A1A2E',
                borderRadius: 12,
                border: '1px solid rgba(26,26,46,0.3)',
                fontSize: 14,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textDecoration: 'none',
              }}
            >
              Explore the Full Method
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 3: Voice Clone Moment (dark) ───────────────────── */}
      <section
        style={{
          background: '#0A0A0F',
          padding: 'clamp(64px, 10vw, 120px) 24px',
        }}
      >
        <div className="voice-clone-layout" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Left: Waveform */}
          <div className="voice-clone-visual">
            <ScrollFadeIn>
              <WaveformVisual />
            </ScrollFadeIn>
          </div>

          {/* Right: Content */}
          <div className="voice-clone-content">
            <ScrollFadeIn delay={200}>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(28px, 4vw, 36px)',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginBottom: 24,
                  lineHeight: 1.2,
                }}
              >
                The first clinically-informed defense against a world designed to dysregulate your nervous system.
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.7,
                  marginBottom: 32,
                }}
              >
                HERR clones your voice and delivers daily affirmations, written by AI, reviewed by a
                clinician, spoken by you. The subconscious trusts your own voice above all others.
                That&apos;s the science. That&apos;s the edge.
              </p>
              <Link
                href="/ecqo-sound"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 48,
                  padding: '0 32px',
                  background: '#C42D8E',
                  color: '#FFFFFF',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  textDecoration: 'none',
                }}
              >
                Explore ECQO Sound
              </Link>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* ── Section 4: Founder Authority (warm light) ──────────────── */}
      <section
        style={{
          background: '#F4F1EB',
          padding: 'clamp(64px, 10vw, 120px) 24px',
        }}
      >
        <div className="founder-layout" style={{ maxWidth: 960, margin: '0 auto' }}>
          {/* Image */}
          <div className="founder-image">
            <ScrollFadeIn>
              <div
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  position: 'relative',
                  width: '100%',
                  maxHeight: 500,
                  aspectRatio: '3/4',
                  background: '#E8E5DE',
                }}
              >
                <Image
                  src="/images/founder-bianca-mccall-processed.jpg"
                  alt="Bianca D. McCall, LMFT, Licensed Marriage and Family Therapist, federal advisor, existential psychology expert, and founder of HERR and ECQO Holdings."
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            </ScrollFadeIn>
          </div>

          {/* Content */}
          <div className="founder-content">
            <ScrollFadeIn delay={200}>
              <p
                style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '2.5px',
                  color: '#C42D8E',
                  marginBottom: 16,
                }}
              >
                THE FOUNDER
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(28px, 3.5vw, 32px)',
                  fontWeight: 600,
                  color: '#1A1A2E',
                  marginBottom: 20,
                  lineHeight: 1.3,
                }}
              >
                Bianca D. McCall, LMFT
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: '#6B6B7B',
                  lineHeight: 1.7,
                  marginBottom: 24,
                }}
              >
                Licensed clinician. Federal advisor. Retired professional athlete. Bianca
                built HERR from the intersection of existential psychology, performance science, and
                personal transformation, to reprogram the voice that drives every performance in your
                life.
              </p>

              {/* Credential pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                {CREDENTIALS.map((c) => (
                  <span
                    key={c}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontSize: 12,
                      color: '#1A1A2E',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>

              <Link
                href="/about"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 48,
                  padding: '0 32px',
                  background: 'transparent',
                  color: '#1A1A2E',
                  borderRadius: 12,
                  border: '1px solid rgba(26,26,46,0.3)',
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  textDecoration: 'none',
                }}
              >
                Read Full Story
              </Link>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* ── Section 5: Tier Preview (dark) ─────────────────────────── */}
      <section
        style={{
          background: '#0A0A0F',
          padding: 'clamp(64px, 10vw, 120px) 24px',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p
            style={{
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '2.5px',
              color: '#C42D8E',
              marginBottom: 16,
            }}
          >
            MEMBERSHIP
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: 600,
              color: '#FFFFFF',
              marginBottom: 48,
              lineHeight: 1.2,
            }}
          >
            Choose your level of care.
          </h2>

          <div className="tier-grid">
            {TIERS.map((tier, i) => (
              <ScrollFadeIn key={tier.name} delay={i * 100}>
                <div
                  className={tier.popular ? 'tier-card-popular' : undefined}
                  style={{
                    background: '#16161F',
                    borderRadius: 16,
                    padding: 32,
                    border: tier.popular
                      ? '1px solid rgba(196, 45, 142, 0.4)'
                      : '1px solid rgba(255,255,255,0.08)',
                    position: 'relative',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    ...(tier.popular ? { animation: 'borderGlow 3s ease-in-out infinite' } : {}),
                  }}
                >
                  {tier.popular && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -14,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#C42D8E',
                        color: '#FFFFFF',
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                        padding: '4px 14px',
                        borderRadius: 12,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Most Popular
                    </span>
                  )}

                  <p style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF', marginBottom: 8 }}>
                    {tier.name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: 40,
                        fontWeight: 600,
                        color: '#FFFFFF',
                      }}
                    >
                      {tier.price}
                    </span>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>/mo</span>
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: '#E8388A',
                      fontStyle: 'italic',
                      marginBottom: 24,
                      flex: 1,
                    }}
                  >
                    {tier.tagline}
                  </p>

                  <Link
                    href="/checkout"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 48,
                      width: '100%',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      textDecoration: 'none',
                      ...(tier.btnStyle === 'solid'
                        ? { background: '#C42D8E', color: '#FFFFFF', border: 'none' }
                        : tier.btnStyle === 'gradient'
                          ? { background: 'linear-gradient(135deg, #C42D8E, #E8388A)', color: '#FFFFFF', border: 'none' }
                          : { background: 'transparent', color: '#C42D8E', border: '1.5px solid #C42D8E' }),
                    }}
                  >
                    Choose Plan
                  </Link>
                </div>
              </ScrollFadeIn>
            ))}
          </div>

          <Link
            href="/checkout"
            style={{
              display: 'inline-block',
              marginTop: 32,
              fontSize: 14,
              color: '#E8388A',
              textDecoration: 'none',
            }}
          >
            Compare all plans →
          </Link>
        </div>
      </section>

      {/* ── Section 6: Journal Preview (warm light) ────────────────── */}
      <section
        style={{
          background: '#FAF8F5',
          padding: 'clamp(64px, 10vw, 120px) 24px',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '2.5px',
              color: '#C42D8E',
              marginBottom: 16,
            }}
          >
            THE HERR JOURNAL
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: 600,
              color: '#1A1A2E',
              marginBottom: 48,
              lineHeight: 1.2,
            }}
          >
            Clinical insights for the inner voice.
          </h2>

          <div className="journal-grid">
            {JOURNAL_PREVIEW.map((article, i) => (
              <ScrollFadeIn key={article.slug} delay={i * 100}>
                <Link
                  href={`/journal/${article.slug}`}
                  style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                >
                  <div
                    className="journal-card"
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 16,
                      overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Image */}
                    <div
                      style={{
                        position: 'relative',
                        aspectRatio: '16/9',
                        overflow: 'hidden',
                      }}
                    >
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover journal-card-img"
                        loading="lazy"
                      />
                    </div>

                    {/* Content */}
                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          background: '#C42D8E',
                          color: '#FFFFFF',
                          fontSize: 10,
                          textTransform: 'uppercase',
                          borderRadius: 12,
                          padding: '4px 10px',
                          width: 'fit-content',
                          marginBottom: 12,
                        }}
                      >
                        {article.category}
                      </span>
                      <h3
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: 20,
                          fontWeight: 600,
                          color: '#1A1A2E',
                          marginBottom: 8,
                          lineHeight: 1.3,
                        }}
                      >
                        {article.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 14,
                          color: '#6B6B7B',
                          lineHeight: 1.5,
                          flex: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {article.excerpt}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: '#6B6B7B',
                          marginTop: 8,
                        }}
                      >
                        {article.readTime}
                      </p>
                    </div>
                  </div>
                </Link>
              </ScrollFadeIn>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link
              href="/journal"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 48,
                padding: '0 32px',
                background: 'transparent',
                color: '#1A1A2E',
                borderRadius: 12,
                border: '1px solid rgba(26,26,46,0.3)',
                fontSize: 14,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textDecoration: 'none',
              }}
            >
              Read the Journal
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 7: Final CTA (dark) ────────────────────────────── */}
      <section
        style={{
          background: '#0A0A0F',
          padding: 'clamp(80px, 12vw, 120px) 24px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(32px, 5vw, 44px)',
            fontWeight: 600,
            color: '#FFFFFF',
            marginBottom: 32,
            lineHeight: 1.2,
          }}
        >
          Your voice is waiting.
        </h2>
        <Link
          href="/signup"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 48,
            padding: '0 40px',
            background: '#C42D8E',
            color: '#FFFFFF',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textDecoration: 'none',
            animation: 'ctaPulse 2s ease-in-out infinite',
          }}
        >
          Start Free
        </Link>
        <p
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.4)',
            marginTop: 16,
          }}
        >
          No credit card required. Cancel anytime.
        </p>
      </section>

      {/* ── Responsive Styles ───────────────────────────────────────── */}
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(196, 45, 142, 0.15); }
          50%      { box-shadow: 0 0 50px rgba(196, 45, 142, 0.3); }
        }

        @keyframes ctaPulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.02); }
        }

        .method-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .voice-clone-layout {
          display: grid;
          grid-template-columns: 55% 45%;
          gap: 48px;
          align-items: center;
        }
        .voice-clone-visual { order: 1; }
        .voice-clone-content { order: 2; }

        .founder-layout {
          display: grid;
          grid-template-columns: 40% 60%;
          gap: 48px;
          align-items: center;
        }

        .tier-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          text-align: left;
        }

        .journal-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .journal-card-img {
          transition: transform 300ms ease;
        }
        .journal-card:hover .journal-card-img {
          transform: scale(1.03);
        }

        @media (max-width: 1024px) {
          .method-grid { grid-template-columns: 1fr; }
          .voice-clone-layout { grid-template-columns: 1fr; }
          .voice-clone-visual { order: 2; }
          .voice-clone-content { order: 1; }
          .founder-layout { grid-template-columns: 1fr; }
          .tier-grid { grid-template-columns: 1fr; }
          .journal-grid { grid-template-columns: 1fr; }
        }

        @media (min-width: 640px) and (max-width: 1024px) {
          .journal-grid { grid-template-columns: repeat(2, 1fr); }
          .tier-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <CrisisResource variant="light" />
    </main>
  );
}
