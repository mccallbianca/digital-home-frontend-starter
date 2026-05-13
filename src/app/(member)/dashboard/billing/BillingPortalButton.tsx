'use client';

import { useState } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

export default function BillingPortalButton({
  label = 'Open Billing Portal',
  variant = 'primary',
}: {
  label?: string;
  variant?: Variant;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Could not open billing portal.');
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  }

  const style: React.CSSProperties =
    variant === 'primary'
      ? {
          background: 'var(--herr-magenta)',
          color: 'var(--herr-cream)',
          border: 'none',
        }
      : variant === 'secondary'
      ? {
          background: 'transparent',
          color: 'var(--herr-magenta)',
          border: '1.5px solid var(--herr-magenta)',
        }
      : {
          background: 'transparent',
          color: 'var(--herr-ink-soft)',
          border: '1px solid var(--herr-line)',
        };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 44,
          padding: '0 24px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.6 : 1,
          ...style,
        }}
      >
        {loading ? 'Opening…' : label}
      </button>
      {error && (
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--herr-magenta-deep)' }}>{error}</p>
      )}
    </div>
  );
}
