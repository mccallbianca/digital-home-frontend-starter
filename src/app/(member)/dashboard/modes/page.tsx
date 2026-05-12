import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ModesClient from './ModesClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Activity Modes | HERR',
  description: 'Choose which activity modes receive your daily affirmations.',
};

type Plan = 'free' | 'collective' | 'personalized' | 'elite';

export default async function ModesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/dashboard/modes');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const plan = (profile?.plan ?? 'free') as Plan;

  // Primary source: member_activity_modes (Phase 1 v2 EPIC B2).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase as any)
    .from('member_activity_modes')
    .select('mode, active')
    .eq('member_id', user.id)
    .eq('active', true);

  let existingModes: string[] = (rows ?? []).map((r: { mode: string }) => r.mode);

  // Legacy fallback: if the member has no rows yet (e.g., onboarded before
  // EPIC B2 migration), read from user_preferences.activity_modes.
  if (existingModes.length === 0) {
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('activity_modes')
      .eq('user_id', user.id)
      .single();
    existingModes = (prefs?.activity_modes ?? []) as string[];
  }

  return (
    <ModesClient
      userId={user.id}
      plan={plan}
      existingModes={existingModes}
    />
  );
}
