'use client';

import { useEffect, useRef, useState } from 'react';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function RevShareModal({ open, onClose }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const firstInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock body scroll while modal open + focus first field
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => firstInputRef.current?.focus(), 80);
    return () => {
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
    };
  }, [open]);

  function resetForm() {
    setFirstName('');
    setLastName('');
    setEmail('');
    setState('');
    setSubmitting(false);
    setSuccess(false);
    setError('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/revshare-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          state,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please email hello@h3rr.com directly.');
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setSubmitting(false);
    } catch {
      setError('Something went wrong. Please email hello@h3rr.com directly.');
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="revshare-modal__backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="revshare-modal-title"
    >
      <div className="revshare-modal">
        <button
          type="button"
          className="revshare-modal__close"
          onClick={handleClose}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {success ? (
          <div className="revshare-modal__success">
            <p className="revshare-modal__check" aria-hidden>&#10003;</p>
            <h2 id="revshare-modal-title" className="revshare-modal__title">You&rsquo;re on the list.</h2>
            <p className="revshare-modal__subhead">We&rsquo;ll be in touch when RevShare opens.</p>
            <button type="button" onClick={handleClose} className="revshare-modal__cta">
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 id="revshare-modal-title" className="revshare-modal__title">
              Join the Elite RevShare Interest List
            </h2>
            <p className="revshare-modal__subhead">
              We&rsquo;ll pay you to share HERR with your network. Drop your info to be the first to know when RevShare opens.
            </p>

            <form onSubmit={handleSubmit} className="revshare-modal__form" noValidate>
              <div className="revshare-modal__row">
                <label className="revshare-modal__field">
                  <span className="revshare-modal__label">First name</span>
                  <input
                    ref={firstInputRef}
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="revshare-modal__input"
                    autoComplete="given-name"
                  />
                </label>
                <label className="revshare-modal__field">
                  <span className="revshare-modal__label">Last name</span>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="revshare-modal__input"
                    autoComplete="family-name"
                  />
                </label>
              </div>

              <label className="revshare-modal__field">
                <span className="revshare-modal__label">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="revshare-modal__input"
                  autoComplete="email"
                />
              </label>

              <label className="revshare-modal__field">
                <span className="revshare-modal__label">Resident state</span>
                <select
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="revshare-modal__input revshare-modal__select"
                >
                  <option value="">Select your state</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>

              {error && (
                <p className="revshare-modal__error" role="alert">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="revshare-modal__cta"
              >
                {submitting ? 'Submitting\u2026' : 'Join the Interest List'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
