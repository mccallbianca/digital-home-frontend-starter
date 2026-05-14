import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline',
  description: 'You are offline. Your affirmations are saved. Reconnect to continue.',
};

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        color: '#F4F1EB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#C42D8E',
          fontWeight: 600,
          margin: '0 0 16px',
        }}
      >
        Offline
      </p>
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(28px, 6vw, 44px)',
          fontWeight: 400,
          color: '#FFFFFF',
          margin: '0 0 16px',
          maxWidth: 540,
          lineHeight: 1.2,
        }}
      >
        You are offline.
      </h1>
      <p
        style={{
          fontSize: 16,
          color: 'rgba(244, 241, 235, 0.7)',
          margin: 0,
          maxWidth: 480,
          lineHeight: 1.6,
        }}
      >
        Your affirmations are saved. Reconnect to continue.
      </p>
    </main>
  );
}
