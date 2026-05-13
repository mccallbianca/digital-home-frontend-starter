'use client';

import { useState } from 'react';

export default function SessionRegisterButton({
  sessionId,
  alreadyRegistered = false,
}: {
  sessionId: string;
  alreadyRegistered?: boolean;
}) {
  const [registered, setRegistered] = useState(alreadyRegistered);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sessions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Registration failed (HTTP ${res.status})`);
        setLoading(false);
        return;
      }
      setRegistered(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px',
          background: 'var(--herr-magenta-soft)',
          color: 'var(--herr-magenta-deep)',
          border: '1px solid var(--herr-magenta)',
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        Registered
      </span>
    );
  }

  return (
    <div>
      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 40,
          padding: '0 22px',
          background: loading ? 'var(--herr-ink-soft)' : 'var(--herr-magenta)',
          color: 'var(--herr-cream)',
          border: 'none',
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: loading ? 'default' : 'pointer',
        }}
      >
        {loading ? 'Registering…' : 'Register'}
      </button>
      {error && (
        <p style={{ marginTop: 6, fontSize: 12, color: 'var(--herr-magenta-deep)' }}>{error}</p>
      )}
    </div>
  );
}
