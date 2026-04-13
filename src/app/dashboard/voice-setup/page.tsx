import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import VoiceSetupClient from './VoiceSetupClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Voice Clone Setup — HERR',
  description: 'Set up your voice clone for personalized affirmations.',
};

export default async function VoiceSetupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/dashboard/voice-setup');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const plan = profile?.plan ?? 'free';
  if (plan !== 'personalized' && plan !== 'elite') {
    redirect('/dashboard/settings');
  }

  const { data: voiceConsent } = await supabase
    .from('voice_consents')
    .select('file_path')
    .eq('user_id', user.id)
    .single();

  return (
    <VoiceSetupClient
      userId={user.id}
      hasVoice={!!voiceConsent?.file_path}
      voiceDate={null}
    />
  );
}
