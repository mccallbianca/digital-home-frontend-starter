import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AffirmationsClient from './AffirmationsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Affirmations | HERR',
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

  const plan = (profile?.plan ?? 'free') as 'free' | 'collective' | 'personalized' | 'elite';

  // Free users see tier gate (themed cream/ink/magenta per Phase 1 v2 portal palette)
  if (plan === 'free') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--herr-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--herr-magenta)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block' }}>
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, color: 'var(--herr-ink)', marginBottom: 8 }}>Unlock Daily Affirmations</h1>
          <p style={{ fontSize: 15, color: 'var(--herr-ink-soft)', lineHeight: 1.6, marginBottom: 24 }}>
            Upgrade to HERR Collective to receive daily affirmations in Bianca&apos;s voice,
            or HERR Personalized to hear them in your own.
          </p>
          <a href="/checkout" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 48, padding: '0 32px', background: 'var(--herr-magenta)', color: 'var(--herr-cream)', borderRadius: 12, fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>
            Upgrade Now
          </a>
        </div>
      </div>
    );
  }

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('activity_modes, genre_preference')
    .eq('user_id', user.id)
    .single();

  const selectedModes = prefs?.activity_modes ?? ['morning'];
  const selectedGenre = (prefs as { genre_preference?: string } | null)?.genre_preference ?? 'Hip Hop';

  // Phase 1 v2 fix: filter soft-deleted rows so the May 7 demo cards don't leak through.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tracks } = await (supabase as any)
    .from('affirmation_scripts')
    .select('id, script, activity_mode, audio_url, generated_at, delivered')
    .eq('member_id', user.id)
    .is('deleted_at', null)
    .order('generated_at', { ascending: false })
    .limit(30);

  // Personalized + Elite tier: fetch data for the inline ECQOSoundPlayer.
  const isLayered = plan === 'personalized' || plan === 'elite';
  let latestAffirmation = null;
  let soundTracks: unknown[] = [];

  if (isLayered) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: latest } = await (supabase as any)
      .from('affirmation_scripts')
      .select('id, script, activity_mode, audio_url, generated_at')
      .eq('member_id', user.id)
      .is('deleted_at', null)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    latestAffirmation = latest;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: catalog } = await (supabase as any)
      .from('track_catalog')
      .select('id, genre, activity_mode, title, audio_url, stem_url, clinical_label, duration_seconds')
      .eq('genre', selectedGenre)
      .eq('is_published', true)
      .order('activity_mode');
    soundTracks = catalog ?? [];
  }

  return (
    <AffirmationsClient
      userId={user.id}
      plan={plan as 'collective' | 'personalized' | 'elite'}
      selectedModes={selectedModes}
      tracks={tracks ?? []}
      genre={selectedGenre}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      latestAffirmation={latestAffirmation as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      soundTracks={soundTracks as any}
    />
  );
}
