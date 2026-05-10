import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import AnimatedSection, { AnimatedItem } from '@/components/ui/AnimatedSection';
import HowItWorksClient from './HowItWorksClient';
import CrisisResource from '@/components/ui/CrisisResource';

export const metadata: Metadata = {
  title: 'How It Works | The HERR Method',
  description:
    'Four steps. One transformation. Assess your existential concerns, receive personalized scripts, record in your own voice, and listen daily across eight activity modes.',
};

const STEPS = [
  {
    num: '01',
    label: 'STEP 01',
    title: 'Assess Your Inner Voice',
    body: 'HERR begins with ECQO, a clinically informed assessment that maps your existential concerns: how you relate to meaning, purpose, identity, freedom, isolation, and mortality. This is not a personality quiz. It is a structured intake designed by a licensed clinician to understand what your inner voice is actually saying.',
    image: '/images/step-01-assess.jpg',
    alt: 'Contemplative figure representing existential assessment, the clinical foundation of the HERR method.',
  },
  {
    num: '02',
    label: 'STEP 02',
    title: 'Receive Your Personalized Scripts',
    body: 'Based on your assessment, HERR generates affirmation scripts tailored to your specific concerns. These are not generic mantras. Each script is a precise clinical intervention, written to address the exact patterns your inner voice uses to limit your performance, your healing, or your growth.',
    image: '/images/step-02-regulate-v2.jpg',
    alt: 'Personalized affirmation scripts generated from your ECQO assessment results.',
  },
  {
    num: '03',
    label: 'STEP 03',
    title: 'Record in Your Own Voice',
    body: 'You record each script using your own voice. HERR clones your vocal signature through ElevenLabs technology, then produces broadcast-quality audio affirmations that sound exactly like you, speaking directly to you. Your voice is the only voice powerful enough to reprogram your own conductor.',
    image: '/images/step-03-clone-voice.jpg',
    alt: 'Microphone in magenta light representing voice cloning, the mechanism that makes HERR personal.',
  },
  {
    num: '04',
    label: 'STEP 04',
    title: 'Listen Daily. Transform Deliberately.',
    body: 'Your personalized audio is delivered in eight activity modes: Workout, Driving, Sleep, Morning, Deep Work, Love and Family, Abundance, and Healing. HERR meets you where you are, every day, with the voice that matters most. Regulate first. Reprogram second. Rise always.',
    image: '/images/step-04-reprogram.jpg',
    alt: 'Person with headphones representing sustained daily reprogramming across all activity modes.',
  },
];

export default function HowItWorksPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0F' }}>
      <HowItWorksClient />

      {/* ── Hero (dark) ────────────────────────────────────────────── */}
      <section
        style={{
          background: '#0A0A0F',
          padding: 'clamp(80px, 12vw, 120px) 24px clamp(24px, 4vw, 40px)',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <AnimatedSection variant="fadeInUp">
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 600,
              color: '#FFFFFF',
              marginBottom: 16,
              lineHeight: 1.15,
            }}
          >
            The HERR Method
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.6)', marginBottom: 0 }}>
            Four steps. One transformation.
          </p>
        </AnimatedSection>
      </section>

      {/* ── Marquee banner ─────────────────────────────────────────── */}
      <div
        style={{
          background: '#C42D8E',
          padding: '14px 0',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <div className="marquee-track">
          {[...Array(3)].map((_, k) => (
            <span
              key={k}
              style={{
                display: 'inline-block',
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '3px',
                color: '#FFFFFF',
                paddingRight: 80,
              }}
            >
              Regulate. Reprogram. Rise. &nbsp;&nbsp;·&nbsp;&nbsp; Regulate. Reprogram. Rise. &nbsp;&nbsp;·&nbsp;&nbsp; Regulate. Reprogram. Rise. &nbsp;&nbsp;·&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── 4-Step Sections (alternating) ───────────────────────────── */}
      {STEPS.map((step, i) => {
        const isLight = i % 2 === 0;
        const imageLeft = i % 2 === 0;
        const contentVariant = imageLeft ? 'slideInRight' : 'slideInLeft';
        const imageVariant = imageLeft ? 'slideInLeft' : 'slideInRight';

        return (
          <section
            key={step.num}
            style={{
              background: isLight ? '#FAF8F5' : '#0A0A0F',
              padding: 'clamp(64px, 10vw, 100px) 24px',
            }}
          >
            <div
              className={`hiw-step-layout ${imageLeft ? '' : 'hiw-step-reversed'}`}
              style={{ maxWidth: 1100, margin: '0 auto' }}
            >
              {/* Image */}
              <div className="hiw-step-image">
                <AnimatedSection variant={imageVariant as 'slideInLeft' | 'slideInRight'}>
                  <div
                    style={{
                      background: isLight ? '#FFFFFF' : '#16161F',
                      borderRadius: 16,
                      overflow: 'hidden',
                      padding: 24,
                      maxWidth: 480,
                      ...(isLight ? { boxShadow: '0 4px 24px rgba(0,0,0,0.08)' } : {}),
                    }}
                  >
                    <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden' }}>
                      <Image
                        src={step.image}
                        alt={step.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 480px"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </AnimatedSection>
              </div>

              {/* Content */}
              <div className="hiw-step-content">
                <AnimatedSection variant={contentVariant as 'slideInLeft' | 'slideInRight'} delay={0.15}>
                  <p
                    style={{
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '2.5px',
                      color: '#C42D8E',
                      marginBottom: 16,
                    }}
                  >
                    {step.label}
                  </p>

                  {/* Animated step number */}
                  <AnimatedSection variant="scaleIn">
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: 72,
                        fontWeight: 700,
                        color: isLight ? 'rgba(196, 45, 142, 0.12)' : 'rgba(196, 45, 142, 0.15)',
                        lineHeight: 1,
                        marginBottom: -20,
                        position: 'relative',
                        zIndex: 0,
                      }}
                    >
                      {step.num}
                    </p>
                  </AnimatedSection>

                  <h2
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: 'clamp(26px, 3.5vw, 32px)',
                      fontWeight: 600,
                      color: isLight ? '#1A1A2E' : '#FFFFFF',
                      marginBottom: 20,
                      lineHeight: 1.3,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {step.title}
                  </h2>
                  <p
                    style={{
                      fontSize: '1.125rem',
                      color: isLight ? '#1A1A2E' : 'rgba(255,255,255,0.8)',
                      lineHeight: 1.75,
                    }}
                  >
                    {step.body}
                  </p>
                </AnimatedSection>
              </div>
            </div>
          </section>
        );
      })}

      {/* ── Bottom CTA (dark) ──────────────────────────────────────── */}
      <section
        style={{
          background: '#111118',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <AnimatedSection variant="fadeInUp">
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: 600,
              color: '#FFFFFF',
              marginBottom: 32,
            }}
          >
            Ready to begin?
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
            }}
          >
            Begin Your Assessment
          </Link>
          <p
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.35)',
              maxWidth: 600,
              margin: '32px auto 0',
              lineHeight: 1.6,
            }}
          >
            HERR is a wellness tool informed by existential psychology and behavioral science.
            It is not a substitute for licensed clinical care.
          </p>
        </AnimatedSection>
      </section>

      {/* ── Styles ─────────────────────────────────────────────────── */}
      <style>{`
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .marquee-track {
          display: inline-flex;
          animation: marqueeScroll 20s linear infinite;
        }

        .hiw-step-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        .hiw-step-reversed .hiw-step-image {
          order: 2;
        }
        .hiw-step-reversed .hiw-step-content {
          order: 1;
        }
        @media (max-width: 768px) {
          .hiw-step-layout {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .hiw-step-reversed .hiw-step-image { order: unset; }
          .hiw-step-reversed .hiw-step-content { order: unset; }
        }
      `}</style>

      <CrisisResource variant="light" />
    </main>
  );
}
