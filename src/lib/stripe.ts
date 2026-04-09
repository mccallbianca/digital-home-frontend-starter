/**
 * Stripe client — singleton for server-side API calls.
 * Import this wherever you need to call the Stripe API.
 * Never expose STRIPE_SECRET_KEY to the client.
 */

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-03-25.dahlia',
});

/** Map tier slug → Stripe Price ID from env */
export const PRICE_IDS: Record<HERRTier, string> = {
  collective:   process.env.STRIPE_PRICE_COLLECTIVE   ?? '',
  personalized: process.env.STRIPE_PRICE_PERSONALIZED ?? '',
  elite:        process.env.STRIPE_PRICE_ELITE        ?? '',
};

export type HERRTier = 'collective' | 'personalized' | 'elite';

export const TIER_LABELS: Record<HERRTier, string> = {
  collective:   'HERR Collective',
  personalized: 'HERR Personalized',
  elite:        'HERR Elite',
};

export const TIER_PRICES: Record<HERRTier, string> = {
  collective:   '$9',
  personalized: '$19',
  elite:        '$29',
};
