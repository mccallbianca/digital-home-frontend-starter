'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import Link from 'next/link';

export default function ResetPasswordClient() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      if (updateError.message.includes('expired')) {
        setError('This reset link has expired. Request a new one.');
      } else {
        setError(updateError.message);
      }
      setSaving(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/login'), 2000);
  };

  const inputStyle = {
    width: '100%',
    height: 48,
    background: '#16161F',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: '0 16px',
    color: '#FFFFFF',
    fontSize: 15,
    outline: 'none',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
      }}
    >
      <div style={{ maxWidth: 440, width: '100%' }}>
        <div
          style={{
            background: '#16161F',
            borderRadius: 16,
            padding: '48px 40px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 20,
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            HERR&trade;
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 28,
              fontWeight: 600,
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: 32,
            }}
          >
            Set New Password
          </h1>

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 16, color: '#22C55E', marginBottom: 8 }}>Password updated.</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  style={{
                    ...inputStyle,
                    borderColor: error && error.includes('match') ? '#EF4444' : 'rgba(255,255,255,0.15)',
                  }}
                />
                {error && (
                  <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6 }}>{error}</p>
                )}
                {error && error.includes('expired') && (
                  <Link href="/login" style={{ fontSize: 13, color: '#C42D8E', textDecoration: 'underline', display: 'inline-block', marginTop: 8 }}>
                    Go to login
                  </Link>
                )}
              </div>
              <button
                type="submit"
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                  cursor: saving ? 'default' : 'pointer',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
