/**
 * POST /api/stripe/vcp-checkout
 *
 * Creates a Stripe Checkout session for the Voice Clone Plus ($20/mo)
 * add-on subscription. Distinct from /api/stripe/checkout (base tier
 * checkout) — VCP is a second subscription a customer can have on
 * top of their Collective / Personalized / Elite plan.
 *
 * Auth: signed-in member required (their email must be on file so
 *       Stripe can match the existing customer).
 *
 * Body: { } — no params needed; we use the authed user's email.
 *
 * Returns: { url: <stripe checkout URL> }
 *
 * Setup required (Bianca):
 *   1. Stripe Dashboard → Products → "HERR Voice Clone Plus" $20/mo recurring
 *   2. Copy the price ID
 *   3. Update wrangler.jsonc → STRIPE_PRICE_VCP_MONTHLY=price_xxxxx
 *   4. Re-deploy
 */

import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.h3rr.com';

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY ?? '';
  const vcpPriceId = process.env.STRIPE_PRICE_VCP_MONTHLY ?? '';

  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }
  if (!vcpPriceId || vcpPriceId.startsWith('price_pending')) {
    return NextResponse.json(
      { error: 'Voice Clone Plus is launching soon. Check back shortly.', vcp_unconfigured: true },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to add Voice Clone Plus' }, { status: 401 });
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2026-03-25.dahlia',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const { searchParams } = req.nextUrl;
  const sourceHint = searchParams.get('source') ?? 'unknown';

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: [{ price: vcpPriceId, quantity: 1 }],
    success_url: `${SITE_URL}/dashboard/voice-clone-setup?vcp_session={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${SITE_URL}/dashboard/settings?vcp_cancelled=1`,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    customer_email: user.email ?? undefined,
    metadata: {
      product: 'voice_clone_plus',
      vcp: '1',
      user_id: user.id,
      source: sourceHint,
      founder: 'Bianca D. McCall, M.A., LMFT',
    },
    subscription_data: {
      metadata: {
        product: 'voice_clone_plus',
        vcp: '1',
        user_id: user.id,
      },
    },
  };

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[stripe/vcp-checkout] error:', msg);
    let hint: string | undefined;
    if (/No such price/i.test(msg)) {
      hint = `Price ${vcpPriceId} not found in Stripe. Confirm STRIPE_PRICE_VCP_MONTHLY matches your live-mode VCP product.`;
    }
    return NextResponse.json(
      { error: "Couldn't open Voice Clone Plus checkout. Please try again.", debug: msg, ...(hint ? { hint } : {}) },
      { status: 500 },
    );
  }
}
