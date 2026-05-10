import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Settings | HERR',
  description: 'Manage your HERR account settings.',
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/dashboard/settings');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, first_name, preferred_name, email')
    .eq('id', user.id)
    .single();

  const { data: voiceConsent } = await supabase
    .from('voice_consents')
    .select('file_path')
    .eq('user_id', user.id)
    .single();

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('activity_modes')
    .eq('user_id', user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: genrePrefs } = await (supabase as any)
    .from('user_preferences')
    .select('genres')
    .eq('user_id', user.id)
    .single();

  const plan = profile?.plan ?? 'free';
  const hasVoice = plan === 'personalized' || plan === 'elite';

  return (
    <SettingsClient
      userId={user.id}
      email={profile?.email ?? user.email ?? ''}
      displayName={profile?.preferred_name || profile?.first_name || ''}
      plan={plan}
      hasVoice={hasVoice}
      voiceActive={!!voiceConsent?.file_path}
      modes={prefs?.activity_modes ?? []}
      genres={genrePrefs?.genres ?? []}
    />
  );
}
