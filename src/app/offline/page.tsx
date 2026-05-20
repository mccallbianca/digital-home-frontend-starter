'use client';

import { useCallback } from 'react';

export default function OfflinePage() {
  const handleReconnect = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        color: '#F4F1EB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '64px 24px 32px',
        textAlign: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <p
          style={{
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#E8388A',
            fontWeight: 700,
            margin: '0 0 16px',
          }}
        >
          Offline
        </p>
        <h1
          style={{
            fontSize: 'clamp(28px, 6vw, 48px)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#F4F1EB',
            margin: '0 0 16px',
            maxWidth: 600,
            lineHeight: 1.1,
          }}
        >
          You&rsquo;re offline.
        </h1>
        <p
          style={{
            fontSize: '1.05rem',
            color: 'rgba(244, 241, 235, 0.78)',
            margin: '0 0 32px',
            maxWidth: 520,
            lineHeight: 1.55,
          }}
        >
          Your last received affirmation should auto-play below if cached.
          Otherwise, breathe and try again in a moment.
        </p>
        <button
          type="button"
          onClick={handleReconnect}
          style={{
            background: '#C42D8E',
            color: '#FFFFFF',
            border: '1.5px solid #C42D8E',
            borderRadius: 4,
            padding: '14px 36px',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Reconnect
        </button>
      </div>

      <p
        style={{
          fontSize: '0.82rem',
          color: 'rgba(244, 241, 235, 0.55)',
          maxWidth: 540,
          margin: 0,
          lineHeight: 1.55,
        }}
      >
        If you or someone you know is in crisis, call or text{' '}
        <a href="tel:988" style={{ color: '#F4F1EB', textDecoration: 'underline' }}>988</a>.
      </p>
    </main>
  );
}
