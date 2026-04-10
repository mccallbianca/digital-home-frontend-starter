'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateErr } = await supabase.auth.updateUser({
      password,
    });

    if (updateErr) {
      setError(updateErr.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.replace('/dashboard'), 2000);
  }

  if (success) {
    return (
      <div className="text-center">
        <p className="herr-label text-[var(--herr-cobalt)] mb-4">Password Updated</p>
        <h2 className="font-display text-3xl font-light text-[var(--herr-white)] mb-4">
          You&apos;re all set.
        </h2>
        <p className="text-[var(--herr-muted)] leading-relaxed">
          Redirecting you to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
      {error && (
        <div className="mb-4 p-3 border border-[var(--herr-pink)] bg-[var(--herr-surface)]">
          <p className="text-[0.8rem] text-[var(--herr-pink)]">{error}</p>
        </div>
      )}

      <label className="herr-label text-[var(--herr-muted)] block mb-2">New Password</label>
      <input
        type="password"
        required
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Minimum 8 characters"
        className="w-full bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--herr-cobalt)] transition-colors mb-4"
      />

      <label className="herr-label text-[var(--herr-muted)] block mb-2">Confirm Password</label>
      <input
        type="password"
        required
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        placeholder="Re-enter your new password"
        className="w-full bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--herr-cobalt)] transition-colors mb-6"
      />

      <button
        type="submit"
        disabled={loading}
        className="btn-herr-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Updating...' : 'Set New Password'}
      </button>
    </form>
  );
}
