import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import ScrollFadeIn from '@/components/home/ScrollFadeIn';
import HowItWorksClient from './HowItWorksClient';
import CrisisResource from '@/components/ui/CrisisResource';

export const metadata: Metadata = {
  title: 'How It Works | The HERR Method',
  description:
    'Four steps. One transformation. Assess your existential concerns, regulate the nervous system, reprogram the inner voice in your own cloned voice, and sustain the change over time.',
};

const STEPS = [
  {
    num: '01',
    label: 'STEP 01',
    title: 'Assess',
    subtitle: 'Know where you stand.',
    body: 'The monthly existential screener surfaces what the conscious mind hides. Concerns about meaning, identity, freedom, isolation, mortality, quantified and tracked over time.',
    detail: 'Based on the Existential Concerns Questionnaire framework',
    image: '/images/step-01-assess.jpg',
    alt: 'Contemplative figure representing existential assessment, the clinical foundation of the HERR method.',
  },
  {
    num: '02',
    label: 'STEP 02',
    title: 'Regulate',
    subtitle: 'Calm the nervous system first.',
    body: 'Before reprogramming can take hold, the body must be safe. HERR uses personalized regulation exercises calibrated to your screener results.',
    detail: null,
    image: '/images/step-02-regulate-v2.jpg',
    alt: 'A person in a state of nervous system regulation, the prerequisite before reprogramming can begin.',
  },
  {
    num: '03',
    label: 'STEP 03',
    title: 'Reprogram',
    subtitle: 'Install new identity programming.',
    body: "Daily affirmations written by AI, reviewed for clinical safety, delivered in YOUR cloned voice. The subconscious trusts your own voice above all others. That\u2019s the science. That\u2019s the edge.",
    detail: null,
    image: '/images/step-03-clone-voice.jpg',
    alt: 'Microphone in magenta light representing voice cloning, the mechanism that makes HERR personal.',
  },
  {
    num: '04',
    label: 'STEP 04',
    title: 'Sustain',
    subtitle: 'Track the transformation.',
    body: "Monthly reassessment. Adjusting scripts. Therapeutic progression from reprogramming to support to maintenance. This isn\u2019t a one-size-fits-all meditation app. It\u2019s a clinical operating system.",
    detail: null,
    image: '/images/step-04-reprogram.jpg',
    alt: 'Person with headphones representing sustained daily reprogramming, the ongoing HERR protocol.',
  },
];

export default function HowItWorksPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0F' }}>
      {/* Scroll progress bar (client component) */}
      <HowItWorksClient />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        style={{
          background: '#0A0A0F',
          paddingTop: 'clamp(80px, 12vw, 120px)',
          paddingBottom: 'clamp(48px, 8vw, 80px)',
          textAlign: 'center',
          padding: 'clamp(80px, 12vw, 120px) 24px clamp(48px, 8vw, 80px)',
        }}
      >
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
        <p
          style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          Four steps. One transformation.
        </p>
      </section>

      {/* ── 4-Step Sections (alternating) ───────────────────────────── */}
      {STEPS.map((step, i) => {
        const imageLeft = i % 2 === 0;
        const isLight = i === 1 || i === 3; // steps 2 & 4 get warm light bg

        return (
          <section
            key={step.num}
            style={{
              background: isLight ? '#FAF8F5' : i % 2 === 0 ? '#0A0A0F' : '#111118',
              padding: 'clamp(64px, 10vw, 100px) 24px',
            }}
          >
            <div
              className={`hiw-step-layout ${imageLeft ? '' : 'hiw-step-reversed'}`}
              style={{ maxWidth: 1100, margin: '0 auto' }}
            >
              {/* Image */}
              <div className="hiw-step-image">
                <ScrollFadeIn delay={0}>
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
                </ScrollFadeIn>
              </div>

              {/* Content */}
              <div className="hiw-step-content">
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
                    {step.label}
                  </p>
                  <h2
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: 'clamp(28px, 3.5vw, 32px)',
                      fontWeight: 600,
                      color: isLight ? '#1A1A2E' : '#FFFFFF',
                      marginBottom: 8,
                      lineHeight: 1.3,
                    }}
                  >
                    {step.title}
                  </h2>
                  <p
                    style={{
                      fontSize: 20,
                      color: '#E8388A',
                      fontStyle: 'italic',
                      marginBottom: 20,
                    }}
                  >
                    {step.subtitle}
                  </p>
                  <p
                    style={{
                      fontSize: 16,
                      color: isLight ? '#6B6B7B' : 'rgba(255,255,255,0.7)',
                      lineHeight: 1.7,
                      marginBottom: step.detail ? 16 : 0,
                    }}
                  >
                    {step.body}
                  </p>
                  {step.detail && (
                    <p
                      style={{
                        fontSize: 14,
                        color: isLight ? '#6B6B7B' : 'rgba(255,255,255,0.4)',
                        fontStyle: 'italic',
                      }}
                    >
                      {step.detail}
                    </p>
                  )}
                </ScrollFadeIn>
              </div>
            </div>
          </section>
        );
      })}

      {/* ── Bottom CTA ──────────────────────────────────────────────── */}
      <section
        style={{
          background: '#0A0A0F',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
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
          href="/checkout"
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
          Choose Your Plan
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
      </section>

      {/* ── Responsive Styles ───────────────────────────────────────── */}
      <style>{`
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
