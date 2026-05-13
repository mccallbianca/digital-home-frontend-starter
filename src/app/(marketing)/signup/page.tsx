import type { Metadata } from 'next';
import Link from 'next/link';
import SignupForm from './SignupForm';
import { createAdminClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Begin Your Journey | HERR',
  description: 'Create your free HERR account and begin your reprogramming journey.',
};

type InviteState =
  | { code: null; status: 'none' }
  | { code: string; status: 'valid' | 'used' | 'unknown' };

async function resolveInvite(raw: string | undefined): Promise<InviteState> {
  if (!raw) return { code: null, status: 'none' };
  const code = raw.trim().toUpperCase();
  if (!code) return { code: null, status: 'none' };
  try {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row } = await (admin as any)
      .from('tester_invite_codes')
      .select('code, used_at')
      .eq('code', code)
      .maybeSingle();
    if (!row) return { code, status: 'unknown' };
    if (row.used_at) return { code, status: 'used' };
    return { code, status: 'valid' };
  } catch {
    return { code, status: 'unknown' };
  }
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const params = await searchParams;
  const invite = await resolveInvite(params.invite);
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
          {invite.status === 'valid' ? 'Welcome, Beta Tester' : 'Begin Your Journey'}
        </h1>

        {invite.status === 'valid' && (
          <div
            style={{
              background: 'rgba(196,45,142,0.12)',
              border: '1px solid rgba(196,45,142,0.4)',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 20,
              fontSize: 13,
              color: '#FFFFFF',
              textAlign: 'center',
            }}
          >
            Tester invite verified. Code: <strong>{invite.code}</strong>
          </div>
        )}
        {(invite.status === 'used' || invite.status === 'unknown') && invite.code && (
          <div
            style={{
              background: 'rgba(239,68,68,0.10)',
              border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 20,
              fontSize: 13,
              color: 'rgba(255,255,255,0.85)',
              textAlign: 'center',
            }}
          >
            This invite code has already been used or is not recognized. Please request a new code from Bianca.
          </div>
        )}

        <SignupForm inviteCode={invite.status === 'valid' ? invite.code : null} />

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
