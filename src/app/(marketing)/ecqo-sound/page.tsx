import type { Metadata } from 'next';
import Link from 'next/link';
import AnimatedSection from '@/components/ui/AnimatedSection';
import ScrollFadeIn from '@/components/home/ScrollFadeIn';
import Waveform from '@/components/ui/Waveform';
import CrisisResource from '@/components/ui/CrisisResource';
import GenreSVGCard from '@/components/marketing/GenreSVGCard';

export const metadata: Metadata = {
  title: 'ECQO Sound\u2122 | Sonic Architecture for the Inner Voice',
  description:
    'Eight activity modes. Your cloned voice. Producer-crafted soundscapes. ECQO Sound is the proprietary sonic architecture that powers HERR\u2019s daily reprogramming.',
};

const MODES = [
  {
    name: 'Workout',
    desc: 'High-intensity sessions need high-intensity programming. Workout mode delivers your affirmations over energizing beats to anchor your identity while your body pushes limits.',
    accent: '#E8388A',
    icon: 'M6 3v12M1 8l5-5 5 5',
  },
  {
    name: 'Driving',
    desc: 'Your commute is untapped reprogramming time. Driving mode fills the space between home and work with the voice that is rewiring your default thinking.',
    accent: '#D946A8',
    icon: 'M5 17h14M2 12h20M7 7l5-5 5 5',
  },
  {
    name: 'Sleep',
    desc: 'The subconscious is most receptive during the transition to sleep. Sleep mode delivers low-volume, slow-cadence affirmations that work while you rest.',
    accent: '#8B5CF6',
    icon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z',
  },
  {
    name: 'Morning',
    desc: 'Start every day with intention. Morning mode sets the tone before the world gets a vote, anchoring your identity before any external voice can override it.',
    accent: '#F59E0B',
    icon: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
  },
  {
    name: 'Deep Work',
    desc: 'Flow state requires a regulated inner voice. Deep Work mode uses ambient pacing and subtle vocal cues to keep your conductor aligned while you create.',
    accent: '#3B82F6',
    icon: 'M12 2a8 8 0 0 1 8 8c0 3-2 5.5-4 7l-1 3H9l-1-3c-2-1.5-4-4-4-7a8 8 0 0 1 8-8z',
  },
  {
    name: 'Love + Family',
    desc: 'The roles we perform at home are the most important and the most vulnerable. Love + Family mode reprograms how you show up for the people who matter most.',
    accent: '#EC4899',
    icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z',
  },
  {
    name: 'Abundance',
    desc: 'Scarcity is a program. Abundance mode targets the financial and opportunity-related scripts your inner voice uses to limit what you believe you deserve.',
    accent: '#10B981',
    icon: 'M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z',
  },
  {
    name: 'Healing',
    desc: 'Recovery requires safety. Healing mode creates a gentle, regulated space for your inner voice to begin rewriting the stories that keep you stuck in pain.',
    accent: '#14B8A6',
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  },
];

const GENRES = [
  { name: 'Hip-Hop', image: '/images/genres/hiphop.jpg' },
  { name: 'R&B / Soul', image: '/images/genres/rnb-soul.jpg' },
  { name: 'Ambient', image: '/images/genres/ambient.jpg' },
  { name: 'Classical', image: '/images/genres/classical.jpg' },
  { name: 'Lo-Fi', image: null }, // PR4 replacement URL returned 404 — magenta placeholder
  { name: 'Jazz', image: '/images/genres/jazz.jpg' },
  { name: 'Gospel', image: '/images/genres/gospel.jpg' },
  { name: 'Latin', image: null }, // PR3 + PR4 source URLs returned 404 — magenta placeholder
  { name: 'Reggae', image: null }, // PR6 — branded SVG pending; magenta-island placeholder for now
];

export default function ECQOSoundPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0F' }}>

      {/* ── Hero (dark with magenta gradient) ──────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(160deg, #0A0A0F 0%, #1a0a18 40%, #0A0A0F 100%)',
          padding: 'clamp(100px, 14vw, 140px) 24px clamp(48px, 8vw, 80px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle waveform pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(196,45,142,0.03) 48px, rgba(196,45,142,0.03) 49px)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <AnimatedSection variant="scaleIn">
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(32px, 5.5vw, 52px)',
                fontWeight: 600,
                color: '#FFFFFF',
                marginBottom: 20,
                lineHeight: 1.15,
                maxWidth: 800,
                margin: '0 auto 20px',
              }}
            >
              HERR is a <span style={{ color: '#E8388A' }}>VIBE.</span><br />
              Life is a <span style={{ color: '#E8388A' }}>SoundTrack.</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection variant="fadeIn" delay={0.3}>
            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.75)', marginBottom: 32, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.45 }}>
              For challenging times &mdash; Heal with <span style={{ color: '#E8388A', fontWeight: 600 }}>HERR</span>. Your Sound. Your Choice.
            </p>
            <Waveform barCount={7} />
          </AnimatedSection>
        </div>
      </section>

      {/* ── Why HERR? Value Proposition (warm) ─────────────────────── */}
      <section style={{ background: '#F4F1EB', padding: 'clamp(64px, 10vw, 100px) 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
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
              WHY HERR?
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 3.5vw, 32px)',
                fontWeight: 600,
                color: '#1A1A2E',
                marginBottom: 32,
                lineHeight: 1.3,
              }}
            >
              There is nothing else like this.
            </h2>
          </ScrollFadeIn>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { bold: 'The only app that features YOUR VOICE as the expert in the room.', rest: ' You are enough.' },
              { bold: 'Personalized to your specific existential concerns', rest: ', not recycled content from a template library. Every script is built from your ECQO assessment.' },
              { bold: 'Clinically informed by a licensed practitioner', rest: ', not a tech startup guessing at wellness. The frameworks behind HERR come from years of clinical practice.' },
              { bold: 'Eight activity modes', rest: ' so your transformation follows you through every part of your day, from the gym to the boardroom to the pillow.' },
              { bold: 'Created by producers who have lived experience', rest: ' with stress, anxiety, depression, transition, and grief. The human layer of the music collaborates with you to make your life a soundtrack.' },
              { bold: 'For us, by us.', rest: ' This is not corporate wellness. This is community-built healing.' },
            ].map((point, i) => (
              <ScrollFadeIn key={i} delay={i * 80}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#C42D8E',
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    ✓
                  </span>
                  <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.75, margin: 0 }}>
                    <strong>{point.bold}</strong>{point.rest}
                  </p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Eight Activity Modes (dark) ────────────────────────────── */}
      <section style={{ background: '#0A0A0F', padding: 'clamp(64px, 10vw, 100px) 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
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
              ACTIVITY MODES
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
              Eight modes. Every moment of your day.
            </h2>
          </ScrollFadeIn>

          <div className="modes-grid">
            {MODES.map((m, i) => (
              <ScrollFadeIn key={m.name} delay={i * 60}>
                <div
                  className="mode-card"
                  style={{
                    background: '#F4F1EB',
                    borderRadius: 12,
                    padding: 24,
                    border: '1.5px solid #C42D8E',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 220ms ease, box-shadow 220ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'rgba(196, 45, 142, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#C42D8E"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={m.icon} />
                      </svg>
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#1A0F1A', margin: 0 }}>
                      {m.name}
                    </p>
                  </div>

                  <p style={{ fontSize: 14, color: 'rgba(26, 15, 26, 0.72)', lineHeight: 1.6, flex: 1, marginBottom: 16 }}>
                    {m.desc}
                  </p>

                  <p style={{ fontSize: 11, color: 'rgba(26, 15, 26, 0.5)', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                    Coming this week
                  </p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Genre Selection (warm) ─────────────────────────────────── */}
      <section style={{ background: '#FAF8F5', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
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
              GENRES
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 3.5vw, 32px)',
                fontWeight: 600,
                color: '#1A1A2E',
                marginBottom: 32,
                lineHeight: 1.3,
              }}
            >
              Your sound. Your choice.
            </h2>
          </ScrollFadeIn>

          <div className="genre-grid">
            {GENRES.map((g, i) => (
              <ScrollFadeIn key={g.name} delay={80 + i * 70}>
                <div className="genre-card">
                  {g.image ? (
                    <>
                      <div
                        className="genre-card__image"
                        style={{ backgroundImage: `url(${g.image})` }}
                        aria-hidden
                      />
                      <div className="genre-card__scrim" aria-hidden />
                      <p className="genre-card__name">{g.name}</p>
                    </>
                  ) : (
                    // SVG fallback: self-contained card with gradient + motif +
                    // label, replaces the old magenta placeholder + name overlay.
                    <div style={{ position: 'absolute', inset: 0 }} aria-hidden>
                      <GenreSVGCard name={g.name} />
                    </div>
                  )}
                </div>
              </ScrollFadeIn>
            ))}
          </div>

          <p style={{ fontSize: 14, color: '#6B6B7B', fontStyle: 'italic' }}>
            Genre selection available for Personalized and Elite members.
          </p>
        </div>
      </section>

      {/* ── Bottom CTA (warm) ──────────────────────────────────────── */}
      <section
        style={{
          background: '#F4F1EB',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <AnimatedSection variant="fadeInUp">
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(24px, 3.5vw, 32px)',
              fontWeight: 600,
              color: '#1A1A2E',
              maxWidth: 600,
              margin: '0 auto 32px',
              lineHeight: 1.3,
            }}
          >
            Your daily reprogramming, delivered in the format that moves you.
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
              color: '#6B6B7B',
              marginTop: 32,
              maxWidth: 600,
              margin: '32px auto 0',
            }}
          >
            ECQO Sound™ is proprietary sonic architecture. Specific frequencies, BPM, and mixing
            methodology are trade secrets of ECQO Holdings™.
          </p>
        </AnimatedSection>
      </section>

      {/* ── Styles ─────────────────────────────────────────────────── */}
      <style>{`
        .modes-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .mode-card {
          transition: border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease;
        }
        .mode-card:hover {
          border-color: rgba(196, 45, 142, 0.4) !important;
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(196, 45, 142, 0.1);
        }
        .delivery-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .modes-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .modes-grid { grid-template-columns: 1fr; }
          .delivery-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <CrisisResource variant="light" />
    </main>
  );
}
