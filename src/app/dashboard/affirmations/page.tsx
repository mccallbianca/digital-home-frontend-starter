import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AffirmationsClient from './AffirmationsClient';

export const metadata: Metadata = {
  title: 'My Affirmations — HERR',
  description: 'Your daily personalized affirmations.',
};

export default async function AffirmationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/dashboard/affirmations');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const plan = profile?.plan ?? 'free';

  // Free users see tier gate
  if (plan === 'free') {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block' }}>
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, color: '#FFFFFF', marginBottom: 8 }}>Unlock Daily Affirmations</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 24 }}>
            Upgrade to HERR Collective to receive daily affirmations in Bianca&apos;s voice,
            or HERR Personalized to hear them in your own.
          </p>
          <a href="/checkout" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 48, padding: '0 32px', background: '#C42D8E', color: '#FFFFFF', borderRadius: 12, fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none' }}>
            Upgrade Now
          </a>
        </div>
      </div>
    );
  }

  const hasVoice = plan === 'personalized' || plan === 'elite';

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('activity_modes')
    .eq('user_id', user.id)
    .single();

  const selectedModes = prefs?.activity_modes ?? ['morning'];

  // Fetch affirmation tracks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tracks } = await (supabase as any)
    .from('affirmation_scripts')
    .select('id, script, activity_mode, audio_url, generated_at, delivered')
    .eq('member_id', user.id)
    .order('generated_at', { ascending: false })
    .limit(30);

  return (
    <AffirmationsClient
      userId={user.id}
      hasVoice={hasVoice}
      selectedModes={selectedModes}
      tracks={tracks ?? []}
    />
  );
}
