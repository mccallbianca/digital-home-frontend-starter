import type { Metadata } from 'next';
import ScreenerClient from '@/app/(member)/dashboard/screener/ScreenerClient';

export const metadata: Metadata = {
  title: 'Complete Your Self-Screen | HERR',
  description:
    'A 5-minute clinical screener used by performers, professionals, and leaders to identify where the nervous system is stuck.',
};

export default function PublicScreenerPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--herr-black)' }}>
      <section
        style={{
          padding: 'clamp(120px, 14vw, 160px) clamp(20px, 4vw, 48px) clamp(20px, 3vw, 32px)',
          textAlign: 'center',
          fontFamily: 'var(--font-sans-display), system-ui, sans-serif',
        }}
      >
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-sans-display), system-ui, sans-serif',
              fontSize: '0.78rem',
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--herr-magenta-aa)',
              margin: '0 0 1rem',
            }}
          >
            POWERED BY ECQO
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-sans-display), system-ui, sans-serif',
              fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              color: 'var(--herr-cream)',
              margin: '0 0 1.1rem',
            }}
          >
            Your Self-Screen Awaits
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
              lineHeight: 1.55,
              color: 'rgba(244, 241, 235, 0.78)',
              margin: 0,
            }}
          >
            5 minutes. Clinically validated. Your results unlock your HERR experience.
          </p>
        </div>
      </section>

      <ScreenerClient
        userId={null}
        plan={null}
        fromOnboarding={false}
        publicMode={true}
      />
    </main>
  );
}
