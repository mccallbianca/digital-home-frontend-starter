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
  personalized: 'HERR Personalized: $19/mo',
  elite: 'HERR Elite: $29/mo',
};

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, email, stripe_customer_id')
    .eq('id', user!.id)
    .single();

  // Get member details for billing info
  const { data: member } = await supabase
    .from('members')
    .select('tier, status, period_end, subscribed_at')
    .eq('email', profile?.email ?? user!.email ?? '')
    .single();

  const plan = profile?.plan ?? member?.tier ?? null;
  const status = member?.status ?? 'active';
  const periodEnd = member?.period_end ? new Date(member.period_end).toLocaleDateString() : null;
  const subscribedAt = member?.subscribed_at ? new Date(member.subscribed_at).toLocaleDateString() : null;

  return (
    <main className="min-h-screen">
      <section className="px-6 pt-32 pb-16 border-b border-[rgba(26,15,26,0.08)]" style={{ background: 'var(--herr-cream)' }}>
        <div className="max-w-[900px] mx-auto">
          <Link href="/dashboard" className="herr-label text-[rgba(26,15,26,0.6)] hover:text-[var(--herr-ink)] transition-colors mb-8 inline-block">
            ← Dashboard
          </Link>
          <p className="herr-label text-[rgba(26,15,26,0.6)] mb-4">All tiers</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-[var(--herr-ink)] leading-[0.9] mb-6">
            Billing + Account.
          </h1>
          <p className="text-[rgba(26,15,26,0.6)] max-w-xl leading-relaxed">
            Manage your subscription, payment method, and billing history.
          </p>
        </div>
      </section>

      <section className="px-6 py-16" style={{ background: 'var(--herr-cream)' }}>
        <div className="max-w-[900px] mx-auto">
          {/* Current plan */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="p-8 rounded" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p className="herr-label mb-2" style={{ color: '#666666' }}>Current Plan</p>
              <p className="font-display text-2xl font-light mb-2" style={{ color: 'var(--herr-ink)' }}>
                {plan ? (PLAN_LABELS[plan] ?? plan) : 'No active plan'}
              </p>
              <p className={`text-[0.8rem] ${status === 'active' ? 'text-[var(--herr-magenta)]' : 'text-[var(--herr-magenta)]'}`}>
                Status: {status.charAt(0).toUpperCase() + status.slice(1)}
              </p>
            </div>
            <div className="p-8 rounded" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p className="herr-label mb-2" style={{ color: '#666666' }}>Billing</p>
              {periodEnd && (
                <p className="mb-1" style={{ color: 'var(--herr-ink)' }}>
                  Next billing: <span style={{ color: '#666666' }}>{periodEnd}</span>
                </p>
              )}
              {subscribedAt && (
                <p className="text-sm" style={{ color: '#666666' }}>
                  Member since {subscribedAt}
                </p>
              )}
            </div>
          </div>

          {/* Manage subscription */}
          <div className="p-8 mb-8 rounded" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p className="herr-label mb-4" style={{ color: '#666666' }}>Manage Subscription</p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#666666', fontSize: '1rem' }}>
              View invoices, update your payment method, upgrade or downgrade your tier, or cancel your subscription through the secure billing portal.
            </p>
            <BillingPortalButton />
          </div>

          {/* Account details */}
          <div className="p-8 rounded" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p className="herr-label mb-4" style={{ color: '#666666' }}>Account</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: '#999999' }}>Email</span>
                <span style={{ color: 'var(--herr-ink)' }}>{profile?.email ?? user!.email}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#999999' }}>Member ID</span>
                <span className="font-mono text-[0.75rem]" style={{ color: '#666666' }}>{user!.id.slice(0, 8)}…</span>
              </div>
            </div>
          </div>

          <p className="mt-8 text-[0.72rem] leading-relaxed" style={{ color: '#999999' }}>
            HERR is a wellness tool and is not a substitute for professional mental health treatment.
            Always consult a licensed clinician for clinical concerns. © ECQO Holdings.
          </p>
        </div>
      </section>
    </main>
  );
}
