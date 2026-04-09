/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout session and returns the redirect URL.
 * Accepts { tier, email } — email is pre-filled and locked in Stripe.
 */

import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { type HERRTier } from '@/lib/stripe';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const PRICE_MAP: Record<string, string> = {
  collective:   'STRIPE_PRICE_COLLECTIVE',
  personalized: 'STRIPE_PRICE_PERSONALIZED',
  elite:        'STRIPE_PRICE_ELITE',
};

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY ?? '';
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }
    const stripe = new Stripe(secretKey, {
      apiVersion: '2026-03-25.dahlia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const body = await req.json();
    const tier = body.tier as string;
    const email = body.email as string | undefined;

    if (!['free', 'collective', 'personalized', 'elite'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Free tier — no Stripe checkout needed
    if (tier === 'free') {
      return NextResponse.json({ url: '/signup' });
    }

    const validTier = tier as HERRTier;

    const priceId = process.env[PRICE_MAP[validTier]] ?? '';
    if (!priceId || priceId.startsWith('price_your')) {
      return NextResponse.json({ error: 'Stripe price not configured' }, { status: 503 });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],

      success_url: `${SITE_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${SITE_URL}/checkout`,

      allow_promotion_codes:      true,
      billing_address_collection: 'auto',

      custom_text: {
        submit: {
          message:
            'HERR™ is a wellness tool and is not a substitute for professional mental health treatment. By subscribing you agree to our Terms of Service and Privacy Policy.',
        },
      },

      metadata: {
        tier,
        source: 'website',
        founder: 'Bianca D. McCall LMFT',
      },
    };

    // Pre-fill and lock customer email if provided
    if (email) {
      sessionParams.customer_email = email;
    }

    // 14-day free trial for Collective tier
    if (tier === 'collective') {
      sessionParams.subscription_data = { trial_period_days: 14 };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
