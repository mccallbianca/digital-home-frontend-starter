import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ModesClient from './ModesClient';

export const metadata: Metadata = {
  title: 'Activity Modes — HERR',
  description: 'Choose which activity modes receive your daily affirmations.',
};

export default async function ModesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/dashboard/modes');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const plan = profile?.plan ?? 'free';

  // Get existing mode selections
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('activity_modes')
    .eq('user_id', user.id)
    .single();

  return (
    <ModesClient
      userId={user.id}
      plan={plan}
      existingModes={prefs?.activity_modes ?? []}
    />
  );
}
