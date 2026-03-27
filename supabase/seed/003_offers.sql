-- Seed: Offers
-- Your value ladder from content-corpus/positioning/offers.md
-- Replace these examples with your actual offers.
-- The offers table powers dynamic CTAs and personalization.

insert into offers (slug, name, tagline, description, price_display, price_cents, currency, billing_cycle, who_its_for, target_segments, position_in_ladder, benefits, cta_text, cta_url, status) values

(
  'starter-offer',
  '[YOUR STARTER OFFER]',
  '[One-line tagline for your entry-level offer]',
  '[Full description of what this offer includes]',
  '$XX/month',
  null,
  'USD',
  'monthly',
  '[Who this offer is for]',
  array['first-visit', 'organic'],
  1,
  array[
    '[Benefit 1]',
    '[Benefit 2]',
    '[Benefit 3]'
  ],
  '[CTA Button Text]',
  '/services',
  'active'
),

(
  'premium-offer',
  '[YOUR PREMIUM OFFER]',
  '[One-line tagline for your premium offer]',
  '[Full description of what this offer includes]',
  'Price on application',
  null,
  'USD',
  'custom',
  '[Who this offer is for]',
  array['high-intent', 'qualified'],
  2,
  array[
    '[Benefit 1]',
    '[Benefit 2]',
    '[Benefit 3]'
  ],
  '[CTA Button Text]',
  '/contact',
  'active'
);
