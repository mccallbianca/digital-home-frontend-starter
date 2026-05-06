/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout session and returns the redirect URL.
 * Accepts { tier, email } — email is pre-filled and locked in Stripe.
 *
 * Trial structure:
 *   - Collective ($9): NO trial, immediate billing
 *   - Personalized ($19): 7-day free trial
 *   - Elite ($29): 7-day free trial
 *   - Testers: bypass Stripe entirely, granted 30-day access via profile flag
 */

import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { type HERRTier } from '@/lib/stripe';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const PRICE_MAP: Record<string, string> = {
  collective:   'STRIPE_PRICE_COLLECTIVE',
  personalized: 'STRIPE_PRICE_PERSONALIZED',
  elite:        'STRIPE_PRICE_ELITE',
};

const TRIAL_DAYS: Record<HERRTier, number> = {
  collective:   0,
  personalized: 7,
  elite:        7,
};

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY ?? '';
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const body = await req.json();
    const tier = body.tier as string;
    const email = body.email as string | undefined;

    if (!['free', 'collective', 'personalized', 'elite'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    if (tier === 'free') {
      return NextResponse.json({ url: '/signup' });
    }

    if (email && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const { data: testerRecord } = await supabase
          .from('testers')
          .select('email, trial_tier, status')
          .eq('email', email)
          .in('status', ['invited', 'active'])
          .maybeSingle();

        if (testerRecord) {
          return NextResponse.json({
            url: `/signup?tester=true&email=${encodeURIComponent(email)}`,
            tester: true,
            tier: testerRecord.trial_tier,
          });
        }
      } catch (testerErr) {
        console.error('[stripe/checkout] tester lookup failed (non-fatal):', testerErr);
      }
    }

    const stripe = new Stripe(secretKey, {
      httpClient: Stripe.createFetchHttpClient(),
    });

    const validTier = tier as HERRTier;

    const priceId = process.env[PRICE_MAP[validTier]] ?? '';
    if (!priceId || priceId.startsWith('price_your')) {
      return NextResponse.json({ error: 'Stripe price not configured' }, { status: 503 });
    }

    const trialDays = TRIAL_DAYS[validTier];

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
        trial_days: String(trialDays),
      },
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    if (trialDays > 0) {
      sessionParams.subscription_data = {
        trial_period_days: trialDays,
        trial_settings: {
          end_behavior: {
            missing_payment_method: 'cancel',
          },
        },
      };
      sessionParams.payment_method_collection = 'always';
    }

    try {
      const session = await stripe.checkout.sessions.create(sessionParams);
      return NextResponse.json({ url: session.url });
    } catch (stripeErr) {
      const errMessage = stripeErr instanceof Error ? stripeErr.message : String(stripeErr);
      console.error('[stripe/checkout] Stripe API error:', errMessage);
      console.error('[stripe/checkout] Full error:', JSON.stringify(stripeErr, Object.getOwnPropertyNames(stripeErr)));
      return NextResponse.json({ 
        error: 'Failed to create checkout session',
        debug: errMessage,
      }, { status: 500 });
    }
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : String(err);
    console.error('[stripe/checkout] Outer error:', errMessage);
    return NextResponse.json({ 
      error: 'Failed to create checkout session',
      debug: errMessage,
    }, { status: 500 });
  }
}
