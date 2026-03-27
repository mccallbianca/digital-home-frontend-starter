-- Seed: Offers
-- The BraveBrand value ladder from content-corpus/positioning/offers.md

insert into offers (slug, name, tagline, description, price_display, price_cents, currency, billing_cycle, who_its_for, target_segments, position_in_ladder, benefits, cta_text, cta_url, status) values

(
  'skool-standard',
  'BraveBrand Skool Community — Standard',
  'Start using AI tools in your business without the overwhelm.',
  'Community access, AI tool guides and tutorials, weekly content, peer network of business owners implementing AI.',
  '$7/month',
  700,
  'USD',
  'monthly',
  'Coaches, consultants, and service providers who want to start using AI tools in their business without the overwhelm.',
  array['first-visit', 'organic', 'social-referral'],
  1,
  array[
    'Community access',
    'AI tool guides and tutorials',
    'Weekly content',
    'Peer network of business owners implementing AI'
  ],
  'Join for $7/month',
  'https://www.skool.com/bravebrand',
  'active'
),

(
  'skool-premium',
  'BraveBrand Skool Community — Premium',
  'Go deeper. More implementation, more access, faster results.',
  'Everything in Standard + live training calls, advanced AI automation playbooks, brand and positioning frameworks, templates and done-with-you resources.',
  '$97/month',
  9700,
  'USD',
  'monthly',
  'Business owners ready to go deeper — more implementation, more access, faster results.',
  array['returning-visitor', 'content-engaged', 'email-subscriber'],
  2,
  array[
    'Everything in Standard',
    'Live training calls',
    'Advanced AI automation playbooks',
    'Brand and positioning frameworks',
    'Templates and done-with-you resources'
  ],
  'Join for $97/month',
  'https://www.skool.com/bravebrand',
  'active'
),

(
  'skool-vip',
  'BraveBrand Skool Community — VIP',
  'For established consultants serious about building a premium brand.',
  'Everything in Premium + monthly 1:1 call with Luke, personalised Digital Home strategy, direct access and priority support, weekly coaching from multi-millionaire Paul Counsel.',
  '$497/month',
  49700,
  'USD',
  'monthly',
  'Established consultants serious about building a premium brand and AI-powered business.',
  array['high-engagement', 'returning-multi', 'member-referral'],
  3,
  array[
    'Everything in Premium',
    'Monthly 1:1 call with Luke',
    'Personalised Digital Home strategy',
    'Direct access and priority support',
    'Weekly coaching from Paul Counsel (2 hours/week)'
  ],
  'Apply for VIP',
  'https://www.skool.com/bravebrand',
  'active'
),

(
  'bravebrand-strategy',
  'BraveBrand Strategy',
  'Direct 1:1 guidance on positioning, premium pricing, and brand strategy.',
  '1:1 work with Luke — brand positioning, offer architecture, premium pricing strategy, digital presence audit and growth roadmap.',
  'Price on application',
  null,
  'USD',
  'custom',
  'Coaches, consultants, and service providers who want direct 1:1 guidance on positioning, premium pricing, and brand strategy.',
  array['high-intent', 'qualified'],
  4,
  array[
    '1:1 work with Luke',
    'Brand positioning',
    'Offer architecture',
    'Premium pricing strategy',
    'Digital presence audit and growth roadmap'
  ],
  'Join waitlist',
  '/services#strategy',
  'active'
),

(
  'bravebrand-icon',
  'BraveBrand ICON',
  'Your entire Digital Home built for you — strategy through to launch.',
  'Full Digital Home build — brand identity, website, AI agents, content systems, entity SEO, personalization engine, ongoing support.',
  'Price on application',
  null,
  'USD',
  'custom',
  'Business owners who want their entire Digital Home built for them — strategy through to launch.',
  array['high-intent', 'high-budget', 'qualified'],
  5,
  array[
    'Full Digital Home build',
    'Brand identity',
    'Website',
    'AI agents',
    'Content systems',
    'Entity SEO',
    'Personalization engine',
    'Ongoing support'
  ],
  'Get a proposal',
  '/services#icon',
  'active'
);
