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

    // Signup successful — redirect to onboarding
    router.push('/onboarding');
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
      {errors.form && (
        <div className="mb-4 p-3 border border-[var(--herr-pink)] bg-[var(--herr-surface)]">
          <p className="text-[0.8rem] text-[var(--herr-pink)]">{errors.form}</p>
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
      {errors.email && <p className="text-[0.75rem] text-[var(--herr-pink)] mb-3">{errors.email}</p>}

      <label className="herr-label text-[var(--herr-muted)] block mb-2 mt-4">Password</label>
      <input
        type="password"
        required
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Minimum 8 characters"
        className={`w-full bg-[var(--herr-surface)] border text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none transition-colors mb-1 ${
          errors.password ? 'border-[var(--herr-pink)]' : 'border-[var(--herr-border)] focus:border-[var(--herr-cobalt)]'
        }`}
      />
      {errors.password && <p className="text-[0.75rem] text-[var(--herr-pink)] mb-3">{errors.password}</p>}

      <label className="herr-label text-[var(--herr-muted)] block mb-2 mt-4">Confirm Password</label>
      <input
        type="password"
        required
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        placeholder="Re-enter your password"
        className={`w-full bg-[var(--herr-surface)] border text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none transition-colors mb-1 ${
          errors.confirmPassword ? 'border-[var(--herr-pink)]' : 'border-[var(--herr-border)] focus:border-[var(--herr-cobalt)]'
        }`}
      />
      {errors.confirmPassword && <p className="text-[0.75rem] text-[var(--herr-pink)] mb-3">{errors.confirmPassword}</p>}

      {/* hCaptcha */}
      <div className="mt-6 flex justify-center">
        {siteKey ? (
          <HCaptcha
            sitekey={siteKey}
            onVerify={setCaptchaToken}
            onExpire={() => setCaptchaToken('')}
            theme="dark"
            ref={captchaRef}
          />
        ) : (
          <p className="text-[0.75rem] text-[var(--herr-faint)]">Captcha not configured</p>
        )}
      </div>
      {errors.captcha && <p className="text-[0.75rem] text-[var(--herr-pink)] text-center mt-1">{errors.captcha}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-herr-primary w-full justify-center mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
}
