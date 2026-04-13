import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OnboardingClient from './OnboardingClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Onboarding — HERR',
  description: 'Complete your HERR member setup and begin your reprogramming protocol.',
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ fromScreener?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/onboarding');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile?.onboarding_complete) {
    redirect('/dashboard');
  }

  let plan = profile?.plan ?? null;
  if (!plan && user.email) {
    const { data: member } = await supabase
      .from('members')
      .select('tier')
      .eq('email', user.email)
      .single();
    plan = member?.tier === 'personalized' || member?.tier === 'elite' ? member.tier : null;
  }

  const displayName = profile?.preferred_name || profile?.first_name || 'there';
  const fromScreener = params.fromScreener === '1';

  return (
    <OnboardingClient
      userId={user.id}
      displayName={displayName}
      plan={plan as 'personalized' | 'elite' | 'collective' | null}
      fromScreener={fromScreener}
    />
  );
}
