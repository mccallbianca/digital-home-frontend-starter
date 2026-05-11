'use client';

import { useState } from 'react';

export default function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

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

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn-herr-primary disabled:opacity-50"
      >
        {loading ? 'Opening portal…' : 'Open Billing Portal'}
      </button>
      {error && (
        <p className="mt-3 text-[0.78rem] text-[var(--herr-pink)]">{error}</p>
      )}
    </div>
  );
}
