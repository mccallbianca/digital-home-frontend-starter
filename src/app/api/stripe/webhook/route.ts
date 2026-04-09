/**
 * POST /api/stripe/webhook
 *
 * Receives and verifies Stripe webhook events.
 *
 * Events handled:
 *   checkout.session.completed       → create member + profile records, send welcome email
 *   customer.subscription.updated    → update member tier + profile plan
 *   customer.subscription.deleted    → mark cancelled, set plan = null
 *   invoice.payment_failed           → trigger grace period
 *   invoice.payment_succeeded        → log renewal
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
  const secretKey     = process.env.STRIPE_SECRET_KEY ?? '';
  const stripe = new Stripe(secretKey, {
    apiVersion: '2026-03-25.dahlia',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const body = await req.text();
  const sig  = req.headers.get('stripe-signature') ?? '';

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

  try {
    switch (event.type) {

      /* ── New subscription created ─────────────────────────────── */
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;

        const tier           = session.metadata?.tier ?? 'personalized';
        const customerId     = session.customer as string;
        const subscriptionId = session.subscription as string;
        const email          = session.customer_details?.email ?? '';
        const name           = session.customer_details?.name ?? '';

        // Upsert into members table
        await supabase.from('members').upsert({
          stripe_customer_id:    customerId,
          stripe_subscription_id: subscriptionId,
          email,
          name,
          tier,
          status:                'active',
          source:                session.metadata?.source ?? 'website',
          subscribed_at:         new Date().toISOString(),
          period_end:            null,
        }, { onConflict: 'stripe_customer_id' });

        // Create Supabase auth user if needed and create profile
        if (email) {
          // Create or find the auth user
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers?.users?.find(u => u.email === email);

          let userId = existingUser?.id;

          if (!userId) {
            // Invite creates the auth user
            const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
              redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/onboarding`,
              data: { name, tier },
            });
            if (inviteError) {
              console.log(`[webhook] Auth invite note for ${email}: ${inviteError.message}`);
            }
            userId = inviteData?.user?.id;
          }

          // Create profile record
          if (userId) {
            const plan = (tier === 'personalized' || tier === 'elite') ? tier : null;
            await supabase.from('profiles').upsert({
              id: userId,
              email,
              plan,
              onboarding_complete: false,
              stripe_customer_id: customerId,
            }, { onConflict: 'id' });
          }

          // Send welcome email via internal API
          try {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.h3rr.com';
            await fetch(`${siteUrl}/api/send-welcome`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, name, tier }),
            });
          } catch (emailErr) {
            console.error('[webhook] Welcome email error:', emailErr);
          }
        }

        console.log(`[webhook] New member: ${email} → ${tier}`);
        break;
      }

      /* ── Subscription tier changed ────────────────────────────── */
      case 'customer.subscription.updated': {
        const sub         = event.data.object as Stripe.Subscription;
        const customerId  = sub.customer as string;
        const priceId     = sub.items.data[0]?.price?.id ?? '';

        const tierMap: Record<string, string> = {
          [process.env.STRIPE_PRICE_COLLECTIVE   ?? '']: 'collective',
          [process.env.STRIPE_PRICE_PERSONALIZED ?? '']: 'personalized',
          [process.env.STRIPE_PRICE_ELITE        ?? '']: 'elite',
        };
        const tier = tierMap[priceId] ?? 'personalized';

        await supabase
          .from('members')
          .update({ tier, status: sub.status === 'active' ? 'active' : sub.status })
          .eq('stripe_customer_id', customerId);

        // Update profile plan
        const plan = (tier === 'personalized' || tier === 'elite') ? tier : null;
        await supabase
          .from('profiles')
          .update({ plan })
          .eq('stripe_customer_id', customerId);

        console.log(`[webhook] Subscription updated: ${customerId} → ${tier}`);
        break;
      }

      /* ── Subscription cancelled ───────────────────────────────── */
      case 'customer.subscription.deleted': {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const periodEnd  = new Date(((sub as any).current_period_end ?? 0) * 1000).toISOString();

        await supabase
          .from('members')
          .update({ status: 'cancelled', period_end: periodEnd })
          .eq('stripe_customer_id', customerId);

        // Set profile plan to null
        await supabase
          .from('profiles')
          .update({ plan: null })
          .eq('stripe_customer_id', customerId);

        console.log(`[webhook] Subscription cancelled: ${customerId}, access until ${periodEnd}`);
        break;
      }

      /* ── Payment failed ───────────────────────────────────────── */
      case 'invoice.payment_failed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice    = event.data.object as any;
        const customerId = invoice.customer as string;

        await supabase
          .from('members')
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', customerId);

        console.log(`[webhook] Payment failed: ${customerId}`);
        break;
      }

      /* ── Payment succeeded ────────────────────────────────────── */
      case 'invoice.payment_succeeded': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice        = event.data.object as any;
        const customerId     = invoice.customer as string;
        const subscriptionId = invoice.subscription as string | undefined;
        if (subscriptionId) {
          const sub       = await stripe.subscriptions.retrieve(subscriptionId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const periodEnd = new Date(((sub as any).current_period_end ?? 0) * 1000).toISOString();

          await supabase
            .from('members')
            .update({ status: 'active', period_end: periodEnd })
            .eq('stripe_customer_id', customerId);
        }

        console.log(`[webhook] Payment succeeded: ${customerId}`);
        break;
      }

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('[stripe/webhook] Handler error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
