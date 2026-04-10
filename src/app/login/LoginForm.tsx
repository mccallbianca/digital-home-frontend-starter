'use client';

import { useState, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { createClient } from '@/lib/supabase/browser';

export default function LoginForm({ redirectTo = '/dashboard' }: { redirectTo?: string }) {
  const captchaRef = useRef<HCaptcha>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState(false);

  // Forgot password state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ?? '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked) return;

    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email is required.';
    if (!password) errs.password = 'Password is required.';
    if (siteKey && !captchaToken) errs.captcha = 'Please complete the captcha.';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Use hardened login endpoint for lockout tracking + security logging
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captchaToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.locked) {
          setLocked(true);
          setErrors({ form: data.error });
        } else {
          setErrors({ form: data.error || 'We couldn\'t find a match for those credentials. Take a moment and try again.' });
        }
        setLoading(false);
        captchaRef.current?.resetCaptcha();
        setCaptchaToken('');
        return;
      }

      // Session was set server-side; now set it client-side too
      const supabase = createClient();
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      // Full page navigation ensures cookies propagate before server components run.
      // router.push does a soft navigation which can race with cookie writes,
      // causing server-side auth checks (e.g. admin layout) to fail.
      window.location.href = redirectTo;
    } catch {
      setErrors({ form: 'Something didn\'t work as expected. Let\'s try again.' });
      setLoading(false);
      captchaRef.current?.resetCaptcha();
      setCaptchaToken('');
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetError('Email is required.');
      return;
    }

    setResetLoading(true);
    setResetError('');

    try {
      // Route through our custom send-link endpoint (branded Resend email)
      // Redirect to /update-password after callback so user can set new password
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          next: '/update-password',
        }),
      });

      if (!res.ok) {
        console.error('[reset-password] send-link failed');
      }
    } catch (err) {
      console.error('[reset-password]', err);
    }

    // Always show success to prevent email enumeration
    setResetSent(true);
    setResetLoading(false);
  }

  // Forgot password view
  if (showReset) {
    if (resetSent) {
      return (
        <div className="text-center">
          <p className="herr-label text-[var(--herr-cobalt)] mb-4">Check Your Inbox</p>
          <h2 className="font-display text-3xl font-light text-[var(--herr-white)] mb-4">
            Check your inbox.
          </h2>
          <p className="text-[var(--herr-muted)] leading-relaxed max-w-sm mx-auto">
            If that email is in our system, a reset link is on its way. Check your inbox.
          </p>
          <button
            onClick={() => { setShowReset(false); setResetSent(false); setResetEmail(''); }}
            className="mt-8 herr-label text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors"
          >
            Back to login
          </button>
        </div>
      );
    }

    return (
      <div>
        <p className="herr-label text-[var(--herr-cobalt)] mb-4 text-center">Reset Password</p>
        <form onSubmit={handleResetPassword}>
          <label className="herr-label text-[var(--herr-muted)] block mb-2">Email Address</label>
          <input
            type="email"
            required
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--herr-cobalt)] transition-colors mb-4"
          />
          <button
            type="submit"
            disabled={resetLoading}
            className="btn-herr-primary w-full justify-center disabled:opacity-50"
          >
            {resetLoading ? 'Sending…' : 'Send Reset Link'}
          </button>
          {resetError && <p className="mt-3 text-[0.78rem] text-[var(--herr-pink)] text-center">{resetError}</p>}
        </form>
        <button
          onClick={() => setShowReset(false)}
          className="mt-6 herr-label text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors w-full text-center block"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
      {errors.form && (
        <div className={`mb-4 p-3 border bg-[var(--herr-surface)] ${
          locked ? 'border-[#2D2561]' : 'border-[#E8388A]'
        }`}>
          <p className={`text-[0.8rem] ${locked ? 'text-[#8888aa]' : 'text-[#E8388A]'}`}>{errors.form}</p>
          {locked && (
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="mt-2 text-[0.75rem] text-[#1A3A8F] hover:underline"
            >
              Reset your password instead
            </button>
          )}
        </div>
      )}

      <label className="herr-label text-[var(--herr-muted)] block mb-2">Email Address</label>
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        className={`w-full bg-[var(--herr-surface)] border text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none transition-colors mb-1 ${
          errors.email ? 'border-[var(--herr-pink)]' : 'border-[var(--herr-border)] focus:border-[var(--herr-cobalt)]'
        }`}
      />
      {errors.email && <p className="text-[0.75rem] text-[var(--herr-pink)] mb-2">{errors.email}</p>}

      <label className="herr-label text-[var(--herr-muted)] block mb-2 mt-4">Password</label>
      <input
        type="password"
        required
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Your password"
        className={`w-full bg-[var(--herr-surface)] border text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none transition-colors mb-1 ${
          errors.password ? 'border-[var(--herr-pink)]' : 'border-[var(--herr-border)] focus:border-[var(--herr-cobalt)]'
        }`}
      />
      {errors.password && <p className="text-[0.75rem] text-[var(--herr-pink)] mb-2">{errors.password}</p>}

      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={() => setShowReset(true)}
          className="text-[0.75rem] text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors"
        >
          Forgot password?
        </button>
      </div>

      {/* hCaptcha — only rendered when siteKey is configured */}
      {siteKey && (
        <div className="mt-6 flex justify-center">
          <HCaptcha
            sitekey={siteKey}
            onVerify={setCaptchaToken}
            onExpire={() => setCaptchaToken('')}
            theme="dark"
            ref={captchaRef}
          />
        </div>
      )}
      {errors.captcha && <p className="text-[0.75rem] text-[var(--herr-pink)] text-center mt-1">{errors.captcha}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-herr-primary w-full justify-center mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Logging in…' : 'Log In'}
      </button>
    </form>
  );
}
