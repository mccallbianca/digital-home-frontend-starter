'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { createClient } from '@/lib/supabase/browser';

export default function SignupForm() {
  const router = useRouter();
  const captchaRef = useRef<HCaptcha>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ?? '';

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (siteKey && !captchaToken) errs.captcha = 'Please complete the captcha.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    const supabase = createClient();

    const signUpOptions: { captchaToken?: string; emailRedirectTo: string } = {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
    };
    if (captchaToken) signUpOptions.captchaToken = captchaToken;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: signUpOptions,
    });

    if (error) {
      setErrors({ form: error.message });
      setLoading(false);
      captchaRef.current?.resetCaptcha();
      setCaptchaToken('');
      return;
    }

    router.push('/onboarding');
  }

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
    transition: 'border-color 200ms ease, box-shadow 200ms ease',
    ...(hasError ? { animation: 'inputShake 400ms ease' } : {}),
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {errors.form && (
        <p style={{ fontSize: 12, color: '#EF4444', textAlign: 'center' }}>{errors.form}</p>
      )}

      {/* Email */}
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
          onFocus={(e) => {
            if (!errors.email) {
              e.currentTarget.style.borderColor = '#C42D8E';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(196, 45, 142, 0.2)';
            }
          }}
          onBlur={(e) => {
            if (!errors.email) {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        />
        {errors.email && (
          <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label style={labelStyle}>PASSWORD</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            style={{ ...inputStyle(!!errors.password), paddingRight: 48 }}
            onFocus={(e) => {
              if (!errors.password) {
                e.currentTarget.style.borderColor = '#C42D8E';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(196, 45, 142, 0.2)';
              }
            }}
            onBlur={(e) => {
              if (!errors.password) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {showPassword ? (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
        </div>
        {errors.password && (
          <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label style={labelStyle}>CONFIRM PASSWORD</label>
        <input
          type={showPassword ? 'text' : 'password'}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          style={inputStyle(!!errors.confirmPassword)}
          onFocus={(e) => {
            if (!errors.confirmPassword) {
              e.currentTarget.style.borderColor = '#C42D8E';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(196, 45, 142, 0.2)';
            }
          }}
          onBlur={(e) => {
            if (!errors.confirmPassword) {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        />
        {errors.confirmPassword && (
          <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.confirmPassword}</p>
        )}
      </div>

      {/* hCaptcha */}
      {siteKey && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <HCaptcha
            sitekey={siteKey}
            onVerify={setCaptchaToken}
            onExpire={() => setCaptchaToken('')}
            theme="dark"
            ref={captchaRef}
          />
        </div>
      )}
      {errors.captcha && (
        <p style={{ fontSize: 12, color: '#EF4444', textAlign: 'center' }}>{errors.captcha}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
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
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1,
          transition: 'background 200ms ease',
          marginTop: 8,
        }}
      >
        {loading ? 'Creating account\u2026' : 'Create Account'}
      </button>

      <style>{`
        @keyframes inputShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
      `}</style>
    </form>
  );
}
