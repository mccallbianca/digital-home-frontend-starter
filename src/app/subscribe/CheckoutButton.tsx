'use client';

import { useState } from 'react';

interface CheckoutButtonProps {
  tier: 'collective' | 'personalized' | 'elite';
  label: string;
  className?: string;
}

export default function CheckoutButton({ tier, label, className = '' }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleCheckout() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`${className} w-full justify-center ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Redirecting to checkout…' : label}
      </button>
      {error && (
        <p className="mt-3 text-[0.78rem] text-[var(--herr-pink)] text-center">
          {error}
        </p>
      )}
    </div>
  );
}
