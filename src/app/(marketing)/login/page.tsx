import type { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Welcome Back | HERR',
  description: 'Sign in to your HERR member dashboard.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect ?? '/dashboard';
  const errorType = params.error;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#16161F',
          borderRadius: 16,
          padding: '48px 40px',
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {/* Logo */}
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 24,
            color: '#FFFFFF',
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          HERR™
        </p>

        {/* Heading */}
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
          Welcome Back
        </h1>

        {errorType === 'link_expired' && (
          <div
            style={{
              marginBottom: 24,
              padding: 12,
              border: '1px solid #EF4444',
              borderRadius: 8,
              background: 'rgba(239,68,68,0.08)',
            }}
          >
            <p style={{ fontSize: 13, color: '#EF4444' }}>
              That login link has expired. Please log in with your password.
            </p>
          </div>
        )}

        <LoginForm redirectTo={redirectTo} />

        {/* Toggle */}
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            marginTop: 24,
          }}
        >
          New to HERR?{' '}
          <Link href="/signup" style={{ color: '#E8388A', textDecoration: 'none' }}>
            Create an account
          </Link>
        </p>

        {/* Legal */}
        <p
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.3)',
            textAlign: 'center',
            marginTop: 24,
            lineHeight: 1.5,
          }}
        >
          By signing in, you agree to our{' '}
          <Link href="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>.
        </p>
      </div>
    </main>
  );
}
