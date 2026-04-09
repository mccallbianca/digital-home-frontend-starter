'use client';

import { useState } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function BListSection() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;

    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/blist-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: firstName.trim(), email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong.');
      }

      setState('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setState('error');
    }
  }

  return (
    <section className="px-6 py-24 border-t border-[var(--herr-border)] relative overflow-hidden">
      {/* Magenta gradient accent */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[rgba(196,45,142,0.06)] to-transparent pointer-events-none" />

      <div className="max-w-[800px] mx-auto relative">

        <p className="herr-label text-[var(--herr-muted)] mb-4">Life Is a SoundTrack</p>

        <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-6 leading-tight">
          Music. Mental Health. Movement.
        </h2>

        <p className="text-[var(--herr-muted)] leading-relaxed mb-8 max-w-xl">
          The B-LIST is where ECQO Sound lives in the world — a festival combining grassroots music, mental health advocacy, and community empowerment. Producers, healers, athletes, artists, and community leaders converging around the belief that your life deserves a soundtrack that heals you while you live it.
        </p>

        {/* Status badge */}
        <span className="inline-block bg-[var(--herr-magenta)] text-[var(--herr-white)] text-[0.7rem] font-semibold tracking-wider uppercase px-4 py-1.5 mb-10">
          Coming Soon — Join the Movement
        </span>

        {/* Form / Success / Error */}
        {state === 'success' ? (
          <div className="bg-[var(--herr-surface)] border border-[var(--herr-border)] p-8 animate-fade-up">
            <p className="text-[var(--herr-white)] font-display text-xl font-light">
              You&apos;re on the list. We&apos;ll see you there.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="flex-1 bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--herr-magenta)] transition-colors"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--herr-magenta)] transition-colors"
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              className="btn-herr-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state === 'loading' ? 'Joining...' : 'Join the Movement'}
            </button>
          </form>
        )}

        {state === 'error' && (
          <p className="mt-3 text-[0.78rem] text-[var(--herr-pink)]">{errorMsg}</p>
        )}

      </div>
    </section>
  );
}
