import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import BillingPortalButton from './BillingPortalButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Billing + Account | HERR',
  description: 'Manage your HERR subscription, payment method, and billing history.',
};

const PLAN_LABELS: Record<string, string> = {
  free: 'HERR Free',
  collective: 'HERR Collective: $9/mo',
  personalized: 'HERR Personalized: $19/mo',
  elite: 'HERR Elite: $29/mo',
};

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('plan, email, stripe_customer_id, is_tester')
    .eq('id', user!.id)
    .single();

  const isTester = profile?.is_tester === true;

  const { data: member } = await supabase
    .from('members')
    .select('tier, status, period_end, subscribed_at')
    .eq('email', profile?.email ?? user!.email ?? '')
    .single();

  const plan = (profile?.plan ?? member?.tier ?? 'free') as 'free' | 'collective' | 'personalized' | 'elite';
  const status = member?.status ?? 'active';
  const periodEnd = member?.period_end ? new Date(member.period_end).toLocaleDateString() : null;
  const subscribedAt = member?.subscribed_at ? new Date(member.subscribed_at).toLocaleDateString() : null;

  const canUpgrade = plan === 'free' || plan === 'collective' || plan === 'personalized';
  const canDowngrade = plan === 'collective' || plan === 'personalized' || plan === 'elite';
  const isPaidPlan = plan !== 'free';

  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? process.env.STRIPE_PUBLISHABLE_KEY ?? '';
  const isTestMode = stripeKey.startsWith('pk_test_');

  return (
    <main style={{ minHeight: '100vh', background: 'var(--herr-cream)', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Link
          href="/dashboard"
          style={{
            fontSize: 12,
            color: 'var(--herr-ink-soft)',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: 24,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          ← Dashboard
        </Link>

        {isTester && (
          <div
            style={{
              background: '#0A0A0F',
              border: '1px solid #C42D8E',
              borderRadius: 16,
              padding: 28,
              marginBottom: 24,
              color: '#F4F1EB',
              boxShadow: '0 8px 32px rgba(196,45,142,0.18)',
            }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#C42D8E',
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              Founding Tester
            </p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 28,
                fontWeight: 500,
                color: '#F4F1EB',
                margin: '0 0 12px',
                lineHeight: 1.2,
              }}
            >
              Founding Tester Access
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: 'rgba(244,241,235,0.78)', margin: 0 }}>
              You have full Elite tier access for the duration of the
              HERR beta. Thank you for testing the product.
            </p>
            <p style={{ fontSize: 12, color: 'rgba(244,241,235,0.45)', marginTop: 14, marginBottom: 0 }}>
              No payment method on file. Nothing to upgrade, downgrade,
              or cancel.
            </p>
          </div>
        )}

        {isTestMode && (
          <div
            style={{
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: '#92400E' }}>
              TEST MODE
            </span>
            <span style={{ fontSize: 13, color: '#78350F' }}>
              Stripe is in test mode. Use card 4242 4242 4242 4242 with any future expiry + any CVC. No real charges.
            </span>
          </div>
        )}

        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--herr-magenta)', fontWeight: 600, marginBottom: 8 }}>
          ALL TIERS
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 500, color: 'var(--herr-ink)', marginBottom: 8 }}>
          Billing + Account
        </h1>
        <p style={{ fontSize: 16, color: 'var(--herr-ink-soft)', marginBottom: 32, maxWidth: 540 }}>
          Manage your subscription, payment method, and billing history.
        </p>

        {!isTester && (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--herr-line)',
              borderRadius: 16,
              padding: 32,
              marginBottom: 24,
            }}
          >
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--herr-ink-soft)', fontWeight: 600, marginBottom: 8 }}>
              CURRENT PLAN
            </p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 28,
                fontWeight: 500,
                color: 'var(--herr-ink)',
                marginBottom: 12,
              }}
            >
              {PLAN_LABELS[plan] ?? plan}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 24, fontSize: 13 }}>
              <div>
                <span style={{ color: 'var(--herr-ink-soft)' }}>Status: </span>
                <span
                  style={{
                    color: status === 'active' ? 'var(--herr-magenta)' : 'var(--herr-magenta-deep)',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                >
                  {status}
                </span>
              </div>
              {periodEnd && (
                <div>
                  <span style={{ color: 'var(--herr-ink-soft)' }}>Next billing: </span>
                  <span style={{ color: 'var(--herr-ink)', fontWeight: 500 }}>{periodEnd}</span>
                </div>
              )}
              {subscribedAt && (
                <div>
                  <span style={{ color: 'var(--herr-ink-soft)' }}>Member since: </span>
                  <span style={{ color: 'var(--herr-ink)', fontWeight: 500 }}>{subscribedAt}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {canUpgrade && (
                isPaidPlan ? (
                  <BillingPortalButton label="Upgrade Plan" variant="primary" />
                ) : (
                  <Link
                    href="/checkout"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 44,
                      padding: '0 24px',
                      background: 'var(--herr-magenta)',
                      color: 'var(--herr-cream)',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                    }}
                  >
                    Upgrade Plan
                  </Link>
                )
              )}
              {canDowngrade && <BillingPortalButton label="Downgrade Plan" variant="secondary" />}
            </div>
          </div>
        )}

        {!isTester && (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--herr-line)',
              borderRadius: 16,
              padding: 32,
              marginBottom: 24,
            }}
          >
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--herr-ink-soft)', fontWeight: 600, marginBottom: 12 }}>
              MANAGE SUBSCRIPTION
            </p>
            <p style={{ fontSize: 15, color: 'var(--herr-ink-soft)', lineHeight: 1.6, marginBottom: 20 }}>
              View invoices, update your payment method, or cancel your subscription through the secure billing portal.
            </p>
            {isPaidPlan ? (
              <BillingPortalButton label="Open Billing Portal" variant="ghost" />
            ) : (
              <p style={{ fontSize: 13, color: 'var(--herr-ink-soft)', fontStyle: 'italic' }}>
                Available after you upgrade to a paid plan.
              </p>
            )}
          </div>
        )}

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--herr-line)',
            borderRadius: 16,
            padding: 32,
            marginBottom: 24,
          }}
        >
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--herr-ink-soft)', fontWeight: 600, marginBottom: 12 }}>
            ACCOUNT
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--herr-ink-soft)' }}>Email</span>
              <span style={{ color: 'var(--herr-ink)', fontWeight: 500 }}>{profile?.email ?? user!.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--herr-ink-soft)' }}>Member ID</span>
              <span style={{ color: 'var(--herr-ink-soft)', fontFamily: 'monospace', fontSize: 12 }}>{user!.id.slice(0, 8)}…</span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--herr-ink-soft)', lineHeight: 1.6, marginTop: 24 }}>
          HERR is a wellness tool and is not a substitute for professional mental health treatment.
          Always consult a licensed clinician for clinical concerns. © ECQO Holdings.
        </p>
      </div>
    </main>
  );
}
