import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OnboardingFlow from './OnboardingFlow';

export const metadata: Metadata = {
  title: 'Onboarding — HERR',
  description: 'Complete your HERR member profile and begin your reprogramming protocol.',
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/onboarding');
  }

  // Check if already onboarded
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile?.onboarding_complete) {
    redirect('/dashboard');
  }

  // Get user's plan from profile or members table
  let plan = profile?.plan ?? null;
  if (!plan && user.email) {
    const { data: member } = await supabase
      .from('members')
      .select('tier')
      .eq('email', user.email)
      .single();
    plan = member?.tier === 'personalized' || member?.tier === 'elite' ? member.tier : null;
  }

  return (
    <main className="min-h-screen">
      <OnboardingFlow
        userId={user.id}
        userEmail={user.email ?? ''}
        plan={plan as 'personalized' | 'elite' | null}
        existingProfile={profile ? {
          firstName: profile.first_name ?? '',
          lastName: profile.last_name ?? '',
          preferredName: profile.preferred_name ?? '',
          pronouns: profile.pronouns ?? '',
          timezone: profile.timezone ?? '',
        } : null}
      />
    </main>
  );
}
