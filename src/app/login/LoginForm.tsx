'use client';

import { useState, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { createClient } from '@/lib/supabase/browser';

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%',
  background: '#16161F',
  border: `1px solid ${hasError ? '#EF4444' : 'rgba(255,255,255,0.15)'}`,
  borderRadius: 12,
  height: 48,
  padding: '0 16px',
  color: '#FFFFFF',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 200ms ease',
});

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: 'rgba(255,255,255,0.5)',
  marginBottom: 6,
};

const btnPrimary: React.CSSProperties = {
  width: '100%',
  height: 48,
  background: '#C42D8E',
  color: '#FFFFFF',
  borderRadius: 12,
  border: 'none',
  fontSize: 14,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  cursor: 'pointer',
  transition: 'background 200ms ease',
  marginTop: 8,
};

export default function LoginForm({ redirectTo = '/dashboard' }: { redirectTo?: string }) {
  const captchaRef = useRef<HCaptcha>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState(false);

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
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});

    try {
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
          setErrors({ form: data.error || "We couldn\u2019t find a match for those credentials. Take a moment and try again." });
        }
        setLoading(false);
        captchaRef.current?.resetCaptcha();
        setCaptchaToken('');
        return;
      }

      const supabase = createClient();
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
      window.location.href = redirectTo;
    } catch {
      setErrors({ form: "Something didn\u2019t work as expected. Let\u2019s try again." });
      setLoading(false);
      captchaRef.current?.resetCaptcha();
      setCaptchaToken('');
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail.trim()) { setResetError('Email is required.'); return; }

    setResetLoading(true);
    setResetError('');

    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, next: '/update-password' }),
      });
      if (!res.ok) console.error('[reset-password] send-link failed');
    } catch (err) {
      console.error('[reset-password]', err);
    }

    setResetSent(true);
    setResetLoading(false);
  }

  // Reset password flow
  if (showReset) {
    if (resetSent) {
      return (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF', marginBottom: 12 }}>Check your inbox.</p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 24, lineHeight: 1.6 }}>
            If that email is in our system, a reset link is on its way.
          </p>
          <button
            onClick={() => { setShowReset(false); setResetSent(false); setResetEmail(''); }}
            style={{ background: 'none', border: 'none', color: '#E8388A', fontSize: 14, cursor: 'pointer' }}
          >
            Back to login
          </button>
        </div>
      );
    }

    return (
      <div>
        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>EMAIL</label>
            <input
              type="email"
              required
              autoFocus
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle(!!resetError)}
            />
          </div>
          <button type="submit" disabled={resetLoading} style={{ ...btnPrimary, opacity: resetLoading ? 0.5 : 1 }}>
            {resetLoading ? 'Sending\u2026' : 'Send Reset Link'}
          </button>
          {resetError && <p style={{ fontSize: 12, color: '#EF4444', textAlign: 'center' }}>{resetError}</p>}
        </form>
        <button
          onClick={() => setShowReset(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 13,
            cursor: 'pointer',
            display: 'block',
            margin: '16px auto 0',
          }}
        >
          Back to login
        </button>
      </div>
    );
  }

  // Main login form
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {errors.form && (
        <p style={{ fontSize: 12, color: locked ? 'rgba(255,255,255,0.5)' : '#EF4444', textAlign: 'center' }}>
          {errors.form}
          {locked && (
            <button
              type="button"
              onClick={() => setShowReset(true)}
              style={{ display: 'block', margin: '8px auto 0', background: 'none', border: 'none', color: '#E8388A', fontSize: 12, cursor: 'pointer' }}
            >
              Reset your password instead
            </button>
          )}
        </p>
      )}

      <div>
        <label style={labelStyle}>EMAIL</label>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={inputStyle(!!errors.email)}
          onFocus={(e) => { if (!errors.email) e.currentTarget.style.borderColor = '#C42D8E'; }}
          onBlur={(e) => { if (!errors.email) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
        />
        {errors.email && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.email}</p>}
      </div>

      <div>
        <label style={labelStyle}>PASSWORD</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          style={inputStyle(!!errors.password)}
          onFocus={(e) => { if (!errors.password) e.currentTarget.style.borderColor = '#C42D8E'; }}
          onBlur={(e) => { if (!errors.password) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
        />
        {errors.password && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.password}</p>}
      </div>

      <div style={{ textAlign: 'right' }}>
        <button
          type="button"
          onClick={() => setShowReset(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#E8388A',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Forgot password?
        </button>
      </div>

      {siteKey && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <HCaptcha sitekey={siteKey} onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} theme="dark" ref={captchaRef} />
        </div>
      )}
      {errors.captcha && <p style={{ fontSize: 12, color: '#EF4444', textAlign: 'center' }}>{errors.captcha}</p>}

      <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Signing in\u2026' : 'Sign In'}
      </button>
    </form>
  );
}
