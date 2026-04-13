import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollFadeIn from '@/components/home/ScrollFadeIn';

export const metadata: Metadata = {
  title: 'ECQO for Developers — Clinical Wellness Infrastructure',
  description:
    'Integrate ECQO\'s clinical wellness technology into your platform. Voice affirmation APIs, existential assessment frameworks, and certified practitioner tools.',
};

const TIERS = [
  {
    label: 'SAFE SOURCE CODE',
    title: 'Source Code License',
    body: 'Deploy ECQO\'s clinical wellness framework in your own environment. White-label ready. Full source access with usage-based licensing.',
    features: [
      'Existential screener engine',
      'Voice affirmation pipeline',
      'Activity mode framework',
      'Supabase-compatible schema',
    ],
  },
  {
    label: 'CUSTOMIZABLE MODELS',
    title: 'API Access',
    body: 'Integrate ECQO\'s clinical AI models into your existing platform via REST APIs. Affirmation generation, screener scoring, and voice synthesis endpoints.',
    features: [
      'Affirmation generation API',
      'Screener scoring engine',
      'Voice synthesis integration',
      'Webhook event system',
    ],
    featured: true,
  },
  {
    label: 'CERTIFIED PRACTITIONERS',
    title: 'Practitioner Platform',
    body: 'Give clinicians, coaches, and wellness professionals the tools to deliver ECQO-powered reprogramming to their clients.',
    features: [
      'Client management dashboard',
      'Custom screener configurations',
      'Branded affirmation delivery',
      'Clinical outcome tracking',
    ],
  },
];

export default function DevelopersPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0F' }}>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        style={{
          background: '#0A0A0F',
          padding: 'clamp(80px, 12vw, 120px) 24px clamp(48px, 8vw, 80px)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '2.5px',
            color: '#C42D8E',
            marginBottom: 16,
          }}
        >
          ECQO FOR DEVELOPERS
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 600,
            color: '#FFFFFF',
            marginBottom: 16,
            lineHeight: 1.15,
            maxWidth: 720,
            margin: '0 auto 16px',
          }}
        >
          Clinical Wellness Infrastructure
        </h1>
        <p
          style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.6)',
            maxWidth: 600,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Build on ECQO&apos;s clinical AI framework. Voice affirmation APIs,
          existential assessment tools, and certified practitioner platforms.
        </p>
      </section>

      {/* ── B2B Tiers ──────────────────────────────────────────────── */}
      <section style={{ background: '#111118', padding: 'clamp(64px, 10vw, 100px) 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="dev-grid">
            {TIERS.map((tier, i) => (
              <ScrollFadeIn key={tier.label} delay={i * 120}>
                <div
                  style={{
                    background: tier.featured ? 'rgba(22, 22, 31, 0.7)' : '#16161F',
                    backdropFilter: tier.featured ? 'blur(20px)' : undefined,
                    WebkitBackdropFilter: tier.featured ? 'blur(20px)' : undefined,
                    borderRadius: 16,
                    padding: 32,
                    border: tier.featured
                      ? '2px solid rgba(196, 45, 142, 0.5)'
                      : '1px solid rgba(255,255,255,0.08)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    ...(tier.featured ? { boxShadow: '0 0 40px rgba(196, 45, 142, 0.15)' } : {}),
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '2.5px',
                      color: tier.featured ? '#C42D8E' : 'rgba(255,255,255,0.4)',
                      marginBottom: 16,
                    }}
                  >
                    {tier.label}
                  </p>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: 24,
                      fontWeight: 600,
                      color: '#FFFFFF',
                      marginBottom: 12,
                    }}
                  >
                    {tier.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 15,
                      color: 'rgba(255,255,255,0.6)',
                      lineHeight: 1.6,
                      marginBottom: 24,
                    }}
                  >
                    {tier.body}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginBottom: 10,
                          fontSize: 14,
                          color: 'rgba(255,255,255,0.7)',
                        }}
                      >
                        <span style={{ color: '#C42D8E', flexShrink: 0 }}>+</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
                    Coming 2026
                  </p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section
        style={{
          background: '#0A0A0F',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <ScrollFadeIn>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(24px, 3.5vw, 32px)',
              fontWeight: 600,
              color: '#FFFFFF',
              marginBottom: 16,
              lineHeight: 1.3,
            }}
          >
            Interested in building on ECQO?
          </h2>
          <p
            style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: 32,
              maxWidth: 480,
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            Developer access is opening in 2026. Request early access to be among
            the first to integrate clinical wellness AI into your platform.
          </p>
          <Link
            href="mailto:developers@h3rr.com"
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
            Request Access
          </Link>
        </ScrollFadeIn>
      </section>

      {/* ── Footer Disclaimer ──────────────────────────────────────── */}
      <section
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
          ECQO&trade;, HERR&trade;, and all associated methodologies are proprietary intellectual
          property of ECQO Holdings&trade;. Developer access is subject to licensing agreements.
        </p>
      </section>

      {/* ── Responsive Styles ───────────────────────────────────────── */}
      <style>{`
        .dev-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 768px) {
          .dev-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
