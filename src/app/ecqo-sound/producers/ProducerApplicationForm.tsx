'use client';

import { useState } from 'react';

const GENRE_OPTIONS = ['Hip Hop', 'Gospel', 'R&B/Soul', 'Lo-fi', 'Latin', 'Afrobeats', 'Classical', 'Country'];

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function ProducerApplicationForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [stageName, setStageName] = useState('');
  const [email, setEmail] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [statement, setStatement] = useState('');
  const [originalityConfirmed, setOriginalityConfirmed] = useState(false);
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function toggleGenre(genre: string) {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    // Client validation
    if (!firstName.trim() || !lastName.trim() || !stageName.trim()) {
      setErrorMsg('All name fields are required.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (genres.length === 0) {
      setErrorMsg('Select at least one genre specialty.');
      return;
    }
    if (!portfolioUrl.trim()) {
      setErrorMsg('Portfolio URL is required.');
      return;
    }
    if (!statement.trim() || statement.trim().length < 20) {
      setErrorMsg('Statement must be at least 20 characters.');
      return;
    }
    if (!originalityConfirmed) {
      setErrorMsg('You must confirm the originality agreement.');
      return;
    }

    setState('loading');

    try {
      const res = await fetch('/api/producer-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          stageName: stageName.trim(),
          email: email.trim(),
          genreSpecialties: genres,
          portfolioUrl: portfolioUrl.trim(),
          statement: statement.trim(),
          originalityConfirmed: true,
        }),
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

  if (state === 'success') {
    return (
      <div className="bg-[var(--herr-surface)] border border-[var(--herr-border)] p-10 text-center animate-fade-up">
        <h3 className="font-display text-2xl font-light text-[var(--herr-white)] mb-4">
          Your application has been received.
        </h3>
        <p className="text-[var(--herr-muted)] leading-relaxed">
          We review every submission personally. You&apos;ll hear from us within 7 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Name fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="herr-label text-[var(--herr-muted)] block mb-2">First Name *</label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--herr-magenta)] transition-colors"
          />
        </div>
        <div>
          <label className="herr-label text-[var(--herr-muted)] block mb-2">Last Name *</label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--herr-magenta)] transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="herr-label text-[var(--herr-muted)] block mb-2">Stage / Producer Name *</label>
        <input
          type="text"
          required
          value={stageName}
          onChange={(e) => setStageName(e.target.value)}
          className="w-full bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--herr-magenta)] transition-colors"
        />
      </div>

      <div>
        <label className="herr-label text-[var(--herr-muted)] block mb-2">Email *</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--herr-magenta)] transition-colors"
        />
      </div>

      {/* Genre checkboxes */}
      <div>
        <label className="herr-label text-[var(--herr-muted)] block mb-3">Genre Specialties * (select all that apply)</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GENRE_OPTIONS.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => toggleGenre(genre)}
              className={`px-3 py-2 text-[0.82rem] border transition-colors ${
                genres.includes(genre)
                  ? 'border-[var(--herr-magenta)] bg-[rgba(196,45,142,0.15)] text-[var(--herr-white)]'
                  : 'border-[var(--herr-border)] text-[var(--herr-muted)] hover:border-[var(--herr-muted)]'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="herr-label text-[var(--herr-muted)] block mb-2">Portfolio / SoundCloud Link *</label>
        <input
          type="url"
          required
          placeholder="https://"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          className="w-full bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--herr-magenta)] transition-colors"
        />
      </div>

      <div>
        <label className="herr-label text-[var(--herr-muted)] block mb-2">
          Why do you want to produce for HERR? * <span className="text-[var(--herr-faint)]">(20-1000 chars)</span>
        </label>
        <textarea
          required
          minLength={20}
          maxLength={1000}
          rows={5}
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          className="w-full bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--herr-magenta)] transition-colors resize-y"
        />
        <p className="text-[0.72rem] text-[var(--herr-faint)] mt-1">{statement.length}/1000</p>
      </div>

      {/* Originality checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={originalityConfirmed}
          onChange={(e) => setOriginalityConfirmed(e.target.checked)}
          className="mt-1 accent-[var(--herr-magenta)]"
        />
        <span className="text-[0.85rem] text-[var(--herr-muted)] leading-relaxed">
          I confirm all submitted work will be original compositions with no third-party samples or licensed elements. *
        </span>
      </label>

      {errorMsg && (
        <p className="text-[0.82rem] text-[var(--herr-pink)]">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === 'loading'}
        className="btn-herr-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === 'loading' ? 'Submitting...' : 'Submit Application'}
      </button>

      {state === 'error' && (
        <p className="text-center text-[0.78rem] text-[var(--herr-faint)]">
          Or email us directly at mccall.bianca@gmail.com
        </p>
      )}
    </form>
  );
}
