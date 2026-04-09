/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Billing Portal session for the currently logged-in member.
 */

import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerSupabase } from '@/lib/supabase/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function POST() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const admin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Check profiles table first, then members table
    let customerId: string | null = null;

    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    customerId = profile?.stripe_customer_id ?? null;

    if (!customerId) {
      const { data: member } = await admin
        .from('members')
        .select('stripe_customer_id')
        .eq('email', user.email)
        .single();
      customerId = member?.stripe_customer_id ?? null;
    }

    if (!customerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const session = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: `${SITE_URL}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[stripe/portal]', err);
    return NextResponse.json({ error: 'Could not open billing portal' }, { status: 500 });
  }
}
