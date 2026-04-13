import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import ScrollFadeIn from '@/components/home/ScrollFadeIn';
import CrisisResource from '@/components/ui/CrisisResource';

export const metadata: Metadata = {
  title: 'About | Bianca D. McCall, LMFT',
  description:
    'Licensed clinician. Federal advisor. Retired professional athlete. Bianca D. McCall, LMFT built HERR from the intersection of existential psychology, performance science, and personal transformation.',
};

const CREDENTIALS = [
  {
    title: 'Licensed Marriage & Family Therapist (LMFT)',
    context: 'Behavioral health, existential psychology, trauma-informed care',
  },
  {
    title: 'SAMHSA SPRC Advisor',
    context: 'Federal advisory: Suicide Prevention Resource Center (HHS designated)',
  },
  {
    title: 'Lived Experience Advisory Committee',
    context: 'Federal committee: best practices reviewer and subject matter expert',
  },
  {
    title: 'International Speaker',
    context: 'TED, keynote, and clinical conference speaker: existential psychology and performance',
  },
  {
    title: 'NFL & MLB Wellness Consultant',
    context: 'Native American Athletic Foundation: wellness and performance consulting',
  },
  {
    title: 'Retired Professional Athlete',
    context: 'Professional women&apos;s basketball: the bridge to elite performance psychology',
  },
];

const ENTITIES = [
  'ECQO Holdings\u2122',
  'The Wealth League',
  "Three M\u2019s Enterprises",
  'Desert Rose Gives',
];

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0F' }}>

      {/* TODO: Replace banner image — Bianca wants elevateUs.ai clip or still frame instead of current hair photo. Requires separate image asset. */}
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          overflow: 'hidden',
        }}
      >
        <Image
          src="/images/founder-bianca-mccall-processed.jpg"
          alt="Bianca D. McCall, LMFT, Licensed Marriage and Family Therapist, federal advisor, existential psychology expert, and founder of HERR and ECQO Holdings."
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: 'center top' }}
          priority
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,10,15,0.3), rgba(10,10,15,0.9))',
          }}
        />
        <div
          style={{
            position: 'relative',
            padding: '48px',
            maxWidth: 1280,
            margin: '0 auto',
            width: '100%',
          }}
        >
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(32px, 5vw, 44px)',
              fontWeight: 600,
              color: '#FFFFFF',
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            Bianca D. McCall, LMFT
          </h1>
          <p style={{ fontSize: 16, color: '#E8388A' }}>
            Clinician · Federal Advisor · Founder · The IP Behind HERR
          </p>
        </div>
      </section>

      {/* ── Section 1: Bio (warm light) ──────────────────────────────── */}
      <section
        style={{
          background: '#FAF8F5',
          padding: 'clamp(48px, 8vw, 80px) 24px',
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}
        >
          <ScrollFadeIn>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.75 }}>
              The connection between the self, and whatever sense, or being, or power we surrender to and share inner-dialogue with is the voice, the gatekeeper which we leave it all up to interpretation, internalization, and executive judgement.{' '}
              <span style={{ fontWeight: 600 }}>Bianca D. McCall, LMFT</span> has spent her entire career studying that voice and the relationship between it, and every performer in sports, music, entertainment, academia, and special workforces, during transitions - the separation events that are most significant in a lifetime.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.75 }}>
              The performance philosophy emerged from the intersection of the basketball court and the clinic: we are all performing roles, in school, at work, in community, family, and life. The inner voice is the conductor of every performance. When that conductor is dysregulated, every performance suffers. Reprogramming initiates transformation to heal the distance between who you are and the best version of yourself in this moment.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={200}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.75 }}>
              HERR is the technology that empowers you to take command over your own programming. This is not a generic meditation app. Not a chatbot pretending to be a therapist. HERR is a clinically informed operating system that assesses your existential concerns, and combines science with sound therapies. The only app that restores your agency and puts you in command, to author your own story in your own voice.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={300}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.75 }}>
              Today, Bianca advises on federal and local government public health and prevention initiatives. She is a chief advisor and consultant for professional sports clubs, speaks internationally on stages from TED to the world&apos;s largest conferences, and is the creator of ECQO - the clinical AI company building the future of personalized and protective wellness treatments.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={400}>
            <p
              style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                fontWeight: 700,
                color: '#E8388A',
                textAlign: 'center',
                marginTop: 16,
                lineHeight: 1.4,
              }}
            >
              #1 Self-Care Tool in the World.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Section 2: Credentials (dark) ─────────────────────────────── */}
      <section
        style={{
          background: '#0A0A0F',
          padding: 'clamp(48px, 8vw, 80px) 24px',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '2.5px',
              color: '#C42D8E',
              marginBottom: 48,
            }}
          >
            CREDENTIALS &amp; EXPERIENCE
          </p>

          <div className="credentials-grid">
            {CREDENTIALS.map((cred, i) => (
              <ScrollFadeIn key={cred.title} delay={i * 100}>
                <div
                  style={{
                    background: '#16161F',
                    borderRadius: 16,
                    padding: 32,
                    border: '1px solid rgba(255,255,255,0.06)',
                    height: '100%',
                  }}
                >
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#FFFFFF',
                      marginBottom: 8,
                      lineHeight: 1.4,
                    }}
                  >
                    {cred.title}
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: 'rgba(255,255,255,0.6)',
                      lineHeight: 1.5,
                    }}
                  >
                    {cred.context}
                  </p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: The Enterprise (warm light) ─────────────────────── */}
      <section
        style={{
          background: '#F4F1EB',
          padding: 'clamp(48px, 8vw, 80px) 24px',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <ScrollFadeIn>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 28,
                fontWeight: 600,
                color: '#1A1A2E',
                marginBottom: 20,
              }}
            >
              The Enterprise
            </h2>
            <p
              style={{
                fontSize: '1.125rem',
                color: '#1A1A2E',
                lineHeight: 1.75,
                marginBottom: 24,
              }}
            >
              HERR is the flagship product of ECQO Holdings™, a clinical AI company building the
              future of personalized behavioral wellness. The ECQO ecosystem includes The Wealth
              League (financial wellness), Three M&apos;s Enterprises (speaking, training,
              consulting), and Desert Rose Gives (501c3 community impact).
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {ENTITIES.map((e) => (
                <span
                  key={e}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.08)',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#1A1A2E',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  {e}
                </span>
              ))}
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Section 4: CTA (dark) ──────────────────────────────────────── */}
      <section
        style={{
          background: '#111118',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <ScrollFadeIn>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 600,
              color: '#FFFFFF',
              fontStyle: 'italic',
              maxWidth: 600,
              margin: '0 auto 32px',
              lineHeight: 1.3,
            }}
          >
            &ldquo;The inner voice is the conductor of every performance.&rdquo;
          </p>
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
            Experience HERR
          </Link>
        </ScrollFadeIn>
      </section>

      {/* ── Responsive Styles ───────────────────────────────────────── */}
      <style>{`
        .credentials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .credentials-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .credentials-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <CrisisResource variant="light" />
    </main>
  );
}
