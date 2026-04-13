import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollFadeIn from '@/components/home/ScrollFadeIn';
import WaveformVisual from '@/components/home/WaveformVisual';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'The Science Behind HERR',
  description:
    'Existential psychology meets voice technology. Understand the clinical framework, the voice mechanism, and the regulate-then-reprogram protocol behind HERR.',
};

const CONCERNS = [
  { num: '01', name: 'Meaning', question: 'Why am I here?' },
  { num: '02', name: 'Identity', question: 'Who am I beyond my roles?' },
  { num: '03', name: 'Freedom', question: 'What choices define me?' },
  { num: '04', name: 'Isolation', question: 'Am I truly connected?' },
  { num: '05', name: 'Mortality', question: 'How do I face the finite?' },
];

export default function TheSciencePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0F' }}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is HERR?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'HERR (Human Existential Response and Reprogramming) is a clinical wellness operating system that delivers personalized voice affirmations in your own cloned voice, founded by Bianca D. McCall, LMFT.',
              },
            },
            {
              '@type': 'Question',
              name: 'How does voice cloning work in HERR?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'HERR clones your voice using AI technology and delivers daily affirmations spoken in your own voice. Self-referential processing research shows the subconscious trusts your own voice above all others.',
              },
            },
            {
              '@type': 'Question',
              name: 'Is HERR a therapy app?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'HERR is a wellness platform, not a healthcare provider or therapy replacement. It is informed by existential psychology and clinical frameworks but is not a substitute for licensed clinical care.',
              },
            },
          ],
        }}
      />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        style={{
          background: '#0A0A0F',
          padding: 'clamp(80px, 12vw, 120px) 24px clamp(48px, 8vw, 80px)',
          textAlign: 'center',
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
          The Science Behind HERR
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>
          Existential psychology meets voice technology.
        </p>
      </section>

      {/* ── Section 1: The Existential Framework (light) ──────────── */}
      <section style={{ background: '#FAF8F5', padding: 'clamp(64px, 10vw, 100px) 24px' }}>
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
            THE FRAMEWORK
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
            Existential Concerns Questionnaire at Onset
          </h2>
          <p
            style={{
              fontSize: 16,
              color: '#6B6B7B',
              lineHeight: 1.7,
              maxWidth: 720,
              marginBottom: 48,
            }}
          >
            ECQO — Existential Concerns Questionnaire at Onset — is the diagnostic foundation of
            HERR. It surfaces the five core existential concerns that shape every human experience.
          </p>

          <div className="concerns-grid">
            {CONCERNS.map((c, i) => (
              <ScrollFadeIn key={c.num} delay={i * 80}>
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    padding: 24,
                    textAlign: 'center',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    height: '100%',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: 36,
                      fontWeight: 600,
                      color: '#C42D8E',
                      marginBottom: 8,
                    }}
                  >
                    {c.num}
                  </p>
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#1A1A2E',
                      marginBottom: 8,
                    }}
                  >
                    {c.name}
                  </p>
                  <p style={{ fontSize: 13, color: '#6B6B7B' }}>
                    {c.question}
                  </p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Voice & The Subconscious ─────────────────────── */}
      <section style={{ background: '#0A0A0F', padding: 'clamp(64px, 10vw, 100px) 24px' }}>
        <div className="voice-science-layout" style={{ maxWidth: 960, margin: '0 auto' }}>
          {/* Left: Content */}
          <div className="voice-science-content">
            <ScrollFadeIn>
              <p
                style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '2.5px',
                  color: '#C42D8E',
                  marginBottom: 16,
                }}
              >
                THE MECHANISM
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(28px, 3.5vw, 32px)',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginBottom: 20,
                  lineHeight: 1.3,
                }}
              >
                Your Voice Is the Key
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.7,
                }}
              >
                The subconscious mind processes your own voice differently than any external voice.
                Self-referential processing — a well-documented phenomenon in neuroscience — means
                affirmations delivered in your own voice bypass the skepticism filters that block
                generic recordings. HERR leverages this by cloning your voice and delivering daily
                personalized affirmations that speak directly to your subconscious.
              </p>
            </ScrollFadeIn>
          </div>

          {/* Right: Waveform */}
          <div className="voice-science-visual">
            <ScrollFadeIn delay={200}>
              <WaveformVisual />
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* ── Section 3: Regulate → Reprogram ─────────────────────────── */}
      <section style={{ background: '#111118', padding: 'clamp(64px, 10vw, 100px) 24px' }}>
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
            THE PROTOCOL
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(28px, 3.5vw, 32px)',
              fontWeight: 600,
              color: '#FFFFFF',
              marginBottom: 48,
              lineHeight: 1.3,
            }}
          >
            Regulate First. Reprogram Second.
          </h2>

          <div className="protocol-grid">
            {[
              {
                num: '01',
                name: 'Regulate',
                body: 'Before new programming can take hold, the nervous system must be calm. HERR uses personalized regulation exercises — calibrated to your screener results — to create the safe internal environment where change becomes possible.',
              },
              {
                num: '02',
                name: 'Reprogram',
                body: 'With the nervous system regulated, HERR delivers daily I AM declarations — written by AI, reviewed for clinical safety, spoken in your cloned voice. Over time, these declarations install new identity programming at the subconscious level.',
              },
            ].map((step, i) => (
              <ScrollFadeIn key={step.num} delay={i * 150}>
                <div
                  style={{
                    background: '#16161F',
                    borderRadius: 16,
                    padding: 32,
                    border: '1px solid rgba(255,255,255,0.08)',
                    height: '100%',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: 48,
                      fontWeight: 600,
                      color: '#C42D8E',
                      marginBottom: 12,
                      lineHeight: 1,
                    }}
                  >
                    {step.num}
                  </p>
                  <p
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: '#FFFFFF',
                      marginBottom: 16,
                    }}
                  >
                    {step.name}
                  </p>
                  <p
                    style={{
                      fontSize: 16,
                      color: 'rgba(255,255,255,0.7)',
                      lineHeight: 1.7,
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Evidence & Validation (light) ──────────────── */}
      <section style={{ background: '#FAF8F5', padding: 'clamp(64px, 10vw, 100px) 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <ScrollFadeIn>
            <p
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '2.5px',
                color: '#C42D8E',
                marginBottom: 16,
              }}
            >
              THE EVIDENCE
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 3.5vw, 32px)',
                fontWeight: 600,
                color: '#1A1A2E',
                marginBottom: 24,
                lineHeight: 1.3,
              }}
            >
              Informed by Established Science
            </h2>
            <p
              style={{
                fontSize: 16,
                color: '#6B6B7B',
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              HERR is informed by established clinical frameworks including existential psychology,
              trauma-informed care, behavioral activation, and self-referential processing research.
              The founder, Bianca D. McCall, LMFT, serves as Subject 1 — documenting personal
              outcomes monthly across body, wealth, relationships, business, and emotional baseline to
              build the clinical validation foundation for future peer-reviewed research.
            </p>
            <p
              style={{
                fontSize: 16,
                color: '#6B6B7B',
                lineHeight: 1.7,
              }}
            >
              The ECQO assessment framework draws from decades of existential psychology research. The
              voice cloning delivery mechanism is built on neuroscience evidence that self-generated
              speech activates unique neural pathways associated with identity formation and belief
              change.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Bottom CTA + Disclaimer ─────────────────────────────────── */}
      <section
        style={{
          background: '#111118',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
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
          Experience the Science
        </Link>
        <p
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            maxWidth: 600,
            margin: '40px auto 0',
            lineHeight: 1.6,
          }}
        >
          HERR is a wellness technology platform. It is not a medical device and is not intended to
          diagnose, treat, cure, or prevent any disease or mental health condition. If you are
          experiencing a mental health crisis, please contact{' '}
          <a href="tel:988" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>
            988
          </a>{' '}
          or your local emergency services.
        </p>
      </section>

      {/* ── Responsive Styles ───────────────────────────────────────── */}
      <style>{`
        .concerns-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        .voice-science-layout {
          display: grid;
          grid-template-columns: 55% 45%;
          gap: 48px;
          align-items: center;
        }
        .protocol-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        @media (max-width: 1024px) {
          .concerns-grid { grid-template-columns: repeat(3, 1fr); }
          .voice-science-layout { grid-template-columns: 1fr; }
          .protocol-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .concerns-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
