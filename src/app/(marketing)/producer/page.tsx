import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollFadeIn from '@/components/home/ScrollFadeIn';

export const metadata: Metadata = {
  title: 'Producer Portal | HERR',
  description: 'Create. Upload. Impact. The HERR Producer Network is where clinicians, sonic architects, and wellness creators build the content that powers daily reprogramming.',
};

const FEATURES = [
  {
    title: 'Upload in 90 Seconds',
    body: 'Three steps. Drag and drop. Done.',
  },
  {
    title: 'See Your Impact',
    body: 'Real-time plays, listener demographics, and engagement metrics.',
  },
  {
    title: 'Get Recognized',
    body: 'Badges, rankings, and verification for top creators.',
  },
];

export default function ProducerPage() {
  return (
    <main
      style={{
        minHeight: '60vh',
        background: '#0A0A0F',
        padding: '120px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 600,
            color: '#FFFFFF',
            marginBottom: 12,
            lineHeight: 1.2,
          }}
        >
          Producer Portal
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
          Create. Upload. Impact.
        </p>
        <p
          style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          The HERR Producer Network is where clinicians, sonic architects, and wellness creators
          build the content that powers daily reprogramming for thousands. Simple uploads. Real-time
          analytics. Clinical review in under 24 hours.
        </p>
        <Link
          href="/signup"
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
          }}
        >
          Apply to Create
        </Link>
      </div>

      {/* Feature Preview */}
      <div className="producer-grid" style={{ maxWidth: 1100, margin: '64px auto 0' }}>
        {FEATURES.map((f, i) => (
          <ScrollFadeIn key={f.title} delay={i * 100}>
            <div
              style={{
                background: '#16161F',
                borderRadius: 16,
                padding: 32,
                border: '1px solid rgba(255,255,255,0.08)',
                textAlign: 'center',
                height: '100%',
              }}
            >
              <p style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', marginBottom: 8 }}>
                {f.title}
              </p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                {f.body}
              </p>
            </div>
          </ScrollFadeIn>
        ))}
      </div>

      <style>{`
        .producer-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 768px) {
          .producer-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
