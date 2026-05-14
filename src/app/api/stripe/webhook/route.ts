/**
 * POST /api/stripe/webhook
 *
 * Receives and verifies Stripe webhook events.
 *
 * Phase 1 v2 Block 3 Part 2 rewrite:
 *   - Audit-logs every event into stripe_webhook_events (idempotent via
 *     UNIQUE event_id — replays from Stripe become no-ops).
 *   - Updates profiles.plan AND profiles.subscription_status on every
 *     relevant event so the rest of the app reads a single source of
 *     truth.
 *   - Sends transactional Resend emails on created / canceled /
 *     payment_failed.
 *   - Verifies signature before any side effects.
 *
 * Events handled:
 *   checkout.session.completed       (legacy bootstrap — still wired for
 *                                     marketing checkout flow)
 *   customer.subscription.created    new sub -> plan set, welcome email
 *   customer.subscription.updated    plan/status change
 *   customer.subscription.deleted    cancel -> plan null, canceled email
 *   invoice.payment_succeeded        active status
 *   invoice.payment_failed           past_due status + recovery email
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/resend';

type TierSlug = 'collective' | 'personalized' | 'elite';

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );
}

function tierForPriceId(priceId: string): TierSlug | null {
  const map: Record<string, TierSlug> = {
    [process.env.STRIPE_PRICE_COLLECTIVE ?? '']: 'collective',
    [process.env.STRIPE_PRICE_PERSONALIZED ?? '']: 'personalized',
    [process.env.STRIPE_PRICE_ELITE ?? '']: 'elite',
  };
  return map[priceId] ?? null;
}

const TIER_LABELS: Record<TierSlug, string> = {
  collective: 'HERR Collective',
  personalized: 'HERR Personalized',
  elite: 'HERR Elite',
};

function brandedEmail({ heading, bodyHtml }: { heading: string; bodyHtml: string }): string {
  return `
    <div style="background:#0A0A0F;color:#F4F1EB;padding:40px 24px;font-family:system-ui,-apple-system,sans-serif;">
      <div style="max-width:540px;margin:0 auto;">
        <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#C42D8E;font-weight:600;margin:0 0 16px;">HERR</p>
        <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;font-weight:500;color:#FFFFFF;margin:0 0 18px;line-height:1.2;">${heading}</h1>
        <div style="font-size:15px;line-height:1.65;color:rgba(244,241,235,0.85);">
          ${bodyHtml}
        </div>
        <p style="margin-top:32px;font-size:12px;color:rgba(244,241,235,0.45);line-height:1.6;">
          Bianca D. McCall, M.A., LMFT<br/>
          HERR by ECQO Holdings
        </p>
      </div>
    </div>
  `;
}

async function logEvent(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  event: Stripe.Event,
  errorText: string | null = null,
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('stripe_webhook_events').insert({
      event_id: event.id,
      event_type: event.type,
      payload: event,
      error: errorText,
    });
  } catch (err) {
    // Duplicate event_id is expected on replays — ignore.
    console.warn('[stripe/webhook] audit log skip:', err);
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
  const secretKey = process.env.STRIPE_SECRET_KEY ?? '';
  const stripe = new Stripe(secretKey, {
    apiVersion: '2026-03-25.dahlia',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }
  if (!webhookSecret || webhookSecret.startsWith('whsec_your')) {
    console.warn('[stripe/webhook] STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  await logEvent(supabase, event);

  try {
    switch (event.type) {
      /* ── Legacy bootstrap (still wired for marketing flow) ─────── */
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;

        const tier = (session.metadata?.tier as TierSlug | undefined) ?? 'personalized';
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const email = session.customer_details?.email ?? '';
        const name = session.customer_details?.name ?? '';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('members').upsert(
          {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            email,
            name,
            tier,
            status: 'active',
            source: session.metadata?.source ?? 'website',
            subscribed_at: new Date().toISOString(),
            period_end: null,
          },
          { onConflict: 'stripe_customer_id' },
        );

        if (email) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: existingUsers } = await (supabase as any).auth.admin.listUsers();
          const existingUser = existingUsers?.users?.find(
            (u: { email?: string | null }) => u.email === email,
          );
          let userId: string | undefined = existingUser?.id;

          if (!userId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: inviteData, error: inviteError } = await (supabase as any).auth.admin.inviteUserByEmail(
              email,
              {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/onboarding`,
                data: { name, tier },
              },
            );
            if (inviteError) {
              console.log(`[webhook] Auth invite note for ${email}: ${inviteError.message}`);
            }
            userId = inviteData?.user?.id;
          }

          if (userId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('profiles').upsert(
              {
                id: userId,
                email,
                plan: tier,
                subscription_status: 'active',
                onboarding_complete: false,
                stripe_customer_id: customerId,
              },
              { onConflict: 'id' },
            );
          }
        }

        console.log(`[webhook] checkout.session.completed: ${email} -> ${tier}`);
        break;
      }

      /* ── New subscription ──────────────────────────────────────── */
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const priceId = sub.items.data[0]?.price?.id ?? '';
        const tier = tierForPriceId(priceId);
        if (!tier) {
          console.warn(`[webhook] unknown price ${priceId} on sub ${sub.id}`);
          break;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('profiles')
          .update({ plan: tier, subscription_status: 'active' })
          .eq('stripe_customer_id', customerId);

        // Welcome email
        try {
          const customer = await stripe.customers.retrieve(customerId);
          if (customer && !customer.deleted && customer.email) {
            await sendEmail({
              to: customer.email,
              subject: `Welcome to ${TIER_LABELS[tier]}`,
              html: brandedEmail({
                heading: `Welcome to ${TIER_LABELS[tier]}.`,
                bodyHtml: `
                  <p>Your membership is active. Your daily affirmations, voice tools, and live session access are unlocked.</p>
                  <p>Open your portal: <a href="https://www.h3rr.com/dashboard" style="color:#C42D8E;text-decoration:underline;">www.h3rr.com/dashboard</a></p>
                  <p>Anytime you want to update payment, switch tiers, or pause your membership: <a href="https://www.h3rr.com/dashboard/billing" style="color:#C42D8E;text-decoration:underline;">/dashboard/billing</a>.</p>
                `,
              }),
            });
          }
        } catch (emailErr) {
          console.error('[webhook] welcome email error:', emailErr);
        }

        console.log(`[webhook] subscription.created: ${customerId} -> ${tier}`);
        break;
      }

      /* ── Subscription tier or status changed ───────────────────── */
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const priceId = sub.items.data[0]?.price?.id ?? '';
        const tier = tierForPriceId(priceId);
        if (!tier) break;

        const status = sub.status === 'active' ? 'active' : sub.status;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('members')
          .update({ tier, status })
          .eq('stripe_customer_id', customerId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('profiles')
          .update({ plan: tier, subscription_status: status })
          .eq('stripe_customer_id', customerId);

        console.log(`[webhook] subscription.updated: ${customerId} -> ${tier} (${status})`);
        break;
      }

      /* ── Subscription canceled ─────────────────────────────────── */
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const periodEnd = new Date((((sub as any).current_period_end as number) ?? 0) * 1000).toISOString();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('members')
          .update({ status: 'cancelled', period_end: periodEnd })
          .eq('stripe_customer_id', customerId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('profiles')
          .update({ plan: null, subscription_status: 'canceled' })
          .eq('stripe_customer_id', customerId);

        try {
          const customer = await stripe.customers.retrieve(customerId);
          if (customer && !customer.deleted && customer.email) {
            await sendEmail({
              to: customer.email,
              subject: 'Your HERR membership ended',
              html: brandedEmail({
                heading: 'Your HERR membership ended.',
                bodyHtml: `
                  <p>Your access continued through ${new Date(periodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. You are always welcome back.</p>
                  <p>Reactivate any time: <a href="https://www.h3rr.com/checkout" style="color:#C42D8E;text-decoration:underline;">www.h3rr.com/checkout</a></p>
                `,
              }),
            });
          }
        } catch (emailErr) {
          console.error('[webhook] cancellation email error:', emailErr);
        }

        console.log(`[webhook] subscription.deleted: ${customerId}`);
        break;
      }

      /* ── Payment failed ────────────────────────────────────────── */
      case 'invoice.payment_failed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        const customerId = invoice.customer as string;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('members')
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', customerId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', customerId);

        try {
          const customer = await stripe.customers.retrieve(customerId);
          if (customer && !customer.deleted && customer.email) {
            await sendEmail({
              to: customer.email,
              subject: 'Action needed: payment issue on your HERR membership',
              html: brandedEmail({
                heading: 'Action needed: payment issue.',
                bodyHtml: `
                  <p>We were not able to process the most recent payment on your HERR membership. Your access stays on for now while Stripe retries.</p>
                  <p>Update your card or billing method: <a href="https://www.h3rr.com/dashboard/billing" style="color:#C42D8E;text-decoration:underline;">/dashboard/billing</a></p>
                  <p>If this is unexpected, reply to this email and we will sort it together.</p>
                `,
              }),
            });
          }
        } catch (emailErr) {
          console.error('[webhook] payment-failed email error:', emailErr);
        }

        console.log(`[webhook] invoice.payment_failed: ${customerId}`);
        break;
      }

      /* ── Payment succeeded ─────────────────────────────────────── */
      case 'invoice.payment_succeeded': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string | undefined;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const periodEnd = new Date((((sub as any).current_period_end as number) ?? 0) * 1000).toISOString();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('members')
            .update({ status: 'active', period_end: periodEnd })
            .eq('stripe_customer_id', customerId);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('profiles')
          .update({ subscription_status: 'active' })
          .eq('stripe_customer_id', customerId);
        console.log(`[webhook] invoice.payment_succeeded: ${customerId}`);
        break;
      }

      default:
        console.log(`[webhook] Unhandled: ${event.type}`);
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[stripe/webhook] Handler error:', errMsg);
    await logEvent(supabase, event, errMsg);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
