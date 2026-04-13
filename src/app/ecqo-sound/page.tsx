import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollFadeIn from '@/components/home/ScrollFadeIn';
import Waveform from '@/components/ui/Waveform';

export const metadata: Metadata = {
  title: 'ECQO Sound\u2122 — Sonic Architecture for the Inner Voice',
  description:
    'Eight activity modes. Eight genres. Voice-only or music delivery. ECQO Sound is the proprietary sonic architecture that powers HERR\u2019s daily reprogramming.',
};

const MODES = [
  { name: 'Workout', desc: 'High-intensity reprogramming', icon: 'M6 3v12M1 8l5-5 5 5' },
  { name: 'Driving', desc: 'Commute transformation', icon: 'M5 17h14M2 12h20M7 7l5-5 5 5' },
  { name: 'Sleep', desc: 'Subconscious overnight work', icon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z' },
  { name: 'Morning', desc: 'Start with intention', icon: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83' },
  { name: 'Deep Work', desc: 'Flow state activation', icon: 'M12 2a8 8 0 0 1 8 8c0 3-2 5.5-4 7l-1 3H9l-1-3c-2-1.5-4-4-4-7a8 8 0 0 1 8-8z' },
  { name: 'Love + Family', desc: 'Relational affirmations', icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z' },
  { name: 'Abundance', desc: 'Wealth consciousness', icon: 'M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z' },
  { name: 'Healing', desc: 'Restoration and recovery', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
];

const GENRES = [
  'Ambient', 'R&B', 'Classical', 'Lo-Fi', 'Jazz', 'Electronic', 'Acoustic', 'Orchestral',
];

export default function ECQOSoundPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0F' }}>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        style={{
          background: '#0A0A0F',
          padding: 'clamp(80px, 12vw, 120px) 24px clamp(40px, 6vw, 60px)',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 600,
            color: '#FFFFFF',
            marginBottom: 12,
            lineHeight: 1.15,
          }}
        >
          ECQO Sound™
        </h1>
        <p style={{ fontSize: 18, color: '#E8388A', marginBottom: 24 }}>
          Sonic architecture for the inner voice.
        </p>
        <Waveform barCount={7} />
      </section>

      {/* ── Activity Modes ──────────────────────────────────────────── */}
      <section style={{ background: '#111118', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
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
            Eight modes. One purpose.
          </h2>

          <div className="modes-grid">
            {MODES.map((m, i) => (
              <ScrollFadeIn key={m.name} delay={i * 60}>
                <div className="mode-card"
                  style={{
                    background: '#16161F',
                    borderRadius: 16,
                    padding: 24,
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'default',
                    transition: 'border-color 200ms ease',
                    height: '100%',
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mode-icon"
                    style={{ margin: '0 auto 12px', transition: 'stroke 200ms ease' }}
                  >
                    <path d={m.icon} />
                  </svg>
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#FFFFFF',
                      marginBottom: 8,
                    }}
                  >
                    {m.name}
                  </p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                    {m.desc}
                  </p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Genre Selection ─────────────────────────────────────────── */}
      <section style={{ background: '#0A0A0F', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
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
            GENRES
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(28px, 3.5vw, 32px)',
              fontWeight: 600,
              color: '#FFFFFF',
              marginBottom: 32,
              lineHeight: 1.3,
            }}
          >
            Your sound. Your choice.
          </h2>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            {GENRES.map((g) => (
              <span
                key={g}
                style={{
                  background: '#16161F',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '10px 20px',
                  borderRadius: 24,
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {g}
              </span>
            ))}
          </div>

          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
            Genre selection available for Personalized and Elite members.
          </p>
        </div>
      </section>

      {/* ── Voice vs. Music ─────────────────────────────────────────── */}
      <section style={{ background: '#111118', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
        <div className="delivery-grid" style={{ maxWidth: 960, margin: '0 auto' }}>
          {[
            {
              icon: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8',
              title: 'Voice-Only Delivery',
              body: 'Pure affirmation delivery. Your cloned voice, uninterrupted. Maximum clarity for the subconscious.',
              tag: 'Available on all paid tiers',
            },
            {
              icon: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
              title: 'Music Delivery',
              body: 'Affirmations layered with proprietary sonic architecture. Frequency-calibrated soundscapes designed to deepen the reprogramming effect.',
              tag: 'Available on Personalized and Elite tiers',
            },
          ].map((card, i) => (
            <ScrollFadeIn key={card.title} delay={i * 150}>
              <div
                style={{
                  background: '#16161F',
                  borderRadius: 16,
                  padding: 32,
                  border: '1px solid rgba(255,255,255,0.08)',
                  height: '100%',
                }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C42D8E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginBottom: 20 }}
                >
                  <path d={card.icon} />
                </svg>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: '#FFFFFF',
                    marginBottom: 12,
                  }}
                >
                  {card.title}
                </p>
                <p
                  style={{
                    fontSize: 16,
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}
                >
                  {card.body}
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  {card.tag}
                </p>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </section>

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
            fontSize: 'clamp(24px, 3.5vw, 32px)',
            fontWeight: 600,
            color: '#FFFFFF',
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
            color: 'rgba(255,255,255,0.3)',
            marginTop: 32,
            maxWidth: 600,
            margin: '32px auto 0',
          }}
        >
          ECQO Sound™ is proprietary sonic architecture. Specific frequencies, BPM, and mixing
          methodology are trade secrets of ECQO Holdings™.
        </p>
      </section>

      {/* ── Responsive Styles ───────────────────────────────────────── */}
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
          border-color: #C42D8E !important;
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(196, 45, 142, 0.1);
        }
        .mode-card:hover .mode-icon {
          stroke: #C42D8E !important;
        }
        .delivery-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        @media (max-width: 768px) {
          .modes-grid { grid-template-columns: repeat(2, 1fr); }
          .delivery-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
