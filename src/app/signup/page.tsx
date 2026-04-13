import type { Metadata } from 'next';
import Link from 'next/link';
import SignupForm from './SignupForm';

export const metadata: Metadata = {
  title: 'Begin Your Journey | HERR',
  description: 'Create your free HERR account and begin your reprogramming journey.',
};

export default function SignupPage() {
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
          Begin Your Journey
        </h1>

        <SignupForm />

        {/* Below CTA */}
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            marginTop: 16,
          }}
        >
          Free forever. No credit card required.
        </p>

        {/* Toggle */}
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            marginTop: 24,
          }}
        >
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#E8388A', textDecoration: 'none' }}>
            Sign in
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
          By creating an account, you agree to our{' '}
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
