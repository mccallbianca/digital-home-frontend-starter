import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Community — HERR',
  description: 'The space where HERR members connect, share, and grow together.',
};

export default function CommunityPage() {
  return (
    <main
      style={{
        minHeight: '60vh',
        background: '#0A0A0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 600 }}>
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
          Community
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
          The space where HERR members connect, share, and grow together.
        </p>
        <p
          style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          Community features are launching soon. As a member, you&apos;ll have access to tier-gated
          channels, live sessions with Bianca, and peer support — all moderated for clinical safety.
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
          Join the Waitlist
        </Link>
      </div>
    </main>
  );
}
