/**
 * /dashboard/voice-clone-setup
 *
 * Landing page after a successful Voice Clone Plus checkout (the success_url
 * on /api/stripe/vcp-checkout points here). Recording UX is not yet built —
 * for now we confirm the upgrade and tell the user what to expect.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Voice Clone Plus | HERR',
  description: 'Your Voice Clone Plus add-on is active. Recording instructions coming via email.',
};

export default async function VoiceCloneSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ vcp_session?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/dashboard/voice-clone-setup');

  const sp = await searchParams;
  const fromCheckout = !!sp.vcp_session;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: anchors } = await (supabase as any)
    .from('user_identity_anchors')
    .select('voice_clone_plus_subscriber')
    .eq('user_id', user.id)
    .maybeSingle();
  const vcpActive = anchors?.voice_clone_plus_subscriber === true;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--herr-cream)', padding: '60px 24px 100px' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--herr-magenta)', fontWeight: 600, marginBottom: 12 }}>
          Voice Clone Plus
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, fontWeight: 500, color: 'var(--herr-ink)', marginBottom: 16, lineHeight: 1.15 }}>
          {vcpActive ? 'You&rsquo;re in.' : 'Voice Clone Plus setup'}
        </h1>

        {fromCheckout && vcpActive && (
          <div style={{ background: '#dff2e1', border: '1px solid #1b6b2c', color: '#1b6b2c', padding: '14px 18px', borderRadius: 12, fontSize: 14, marginBottom: 24, lineHeight: 1.55 }}>
            ✓ Subscription confirmed. We&apos;ve received your payment and your Voice Clone Plus add-on is active.
          </div>
        )}

        {fromCheckout && !vcpActive && (
          <div style={{ background: '#fff7e0', border: '1px solid #d4a017', color: '#7a5800', padding: '14px 18px', borderRadius: 12, fontSize: 14, marginBottom: 24, lineHeight: 1.55 }}>
            We received your payment — your subscription will activate within a minute. Refresh this page if the status hasn&apos;t flipped to <strong>Active</strong> on Settings.
          </div>
        )}

        <p style={{ fontSize: 16, color: 'var(--herr-ink-soft)', lineHeight: 1.65, marginBottom: 22 }}>
          Voice recording is a careful process — clinical script, quiet room, single take. We send recording instructions and a private upload link to your inbox so you can take your time.
        </p>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)', borderRadius: 16, padding: 24, marginBottom: 28 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--herr-ink-soft)', fontWeight: 600, marginBottom: 12 }}>
            What happens next
          </p>
          <ol style={{ paddingLeft: 22, margin: 0, fontSize: 14, color: 'var(--herr-ink)', lineHeight: 1.7 }}>
            <li>You&apos;ll get a recording brief by email within 24 hours.</li>
            <li>Record a 3–5 minute neutral-toned sample in a quiet room.</li>
            <li>Upload via the private link in that email.</li>
            <li>Your clone is ready within 1–2 days. Your next daily affirmation comes back in your voice.</li>
          </ol>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{ height: 44, padding: '0 22px', display: 'inline-flex', alignItems: 'center', background: 'var(--herr-magenta)', color: '#FFFFFF', borderRadius: 10, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>
            Back to Dashboard
          </Link>
          <Link href="/dashboard/billing" style={{ height: 44, padding: '0 22px', display: 'inline-flex', alignItems: 'center', background: 'transparent', color: 'var(--herr-ink)', border: '1px solid var(--herr-line)', borderRadius: 10, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>
            Manage Billing
          </Link>
        </div>

        <p style={{ marginTop: 32, fontSize: 12, color: 'var(--herr-ink-soft)', lineHeight: 1.55 }}>
          Questions? Reply to your subscription confirmation email or visit your billing portal to manage the add-on. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
