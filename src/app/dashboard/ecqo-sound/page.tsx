import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ECQOSoundPlayer from './ECQOSoundPlayer';

export const metadata: Metadata = {
  title: 'ECQO Sound — HERR',
  description: 'Your personalized therapeutic soundtrack. Three layers. One experience.',
};

export default async function ECQOSoundDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch member preferences (genre + modes)
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('activity_modes, genre_preference')
    .eq('user_id', user!.id)
    .single();

  const selectedGenre = prefs?.genre_preference ?? 'Hip Hop';
  const selectedModes = prefs?.activity_modes ?? [];

  // Fetch today's affirmation for layering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: latestAffirmation } = await (supabase as any)
    .from('affirmation_scripts')
    .select('id, script, activity_mode, audio_url, generated_at')
    .eq('member_id', user!.id)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();

  // Fetch available tracks from catalog for the member's genre
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tracks } = await (supabase as any)
    .from('track_catalog')
    .select('id, genre, activity_mode, title, audio_url, stem_url, clinical_label, duration_seconds')
    .eq('genre', selectedGenre)
    .eq('is_published', true)
    .order('activity_mode');

  return (
    <main className="min-h-screen">
      <section className="px-6 pt-32 pb-16 border-b border-[var(--herr-border)]">
        <div className="max-w-[900px] mx-auto">
          <Link href="/dashboard" className="herr-label text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors mb-8 inline-block">
            &larr; Dashboard
          </Link>
          <p className="herr-label text-[var(--herr-pink)] mb-4">ECQO Sound</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-[var(--herr-white)] leading-[0.9] mb-6">
            Your healing has<br />
            <span className="text-[var(--herr-pink)]">a soundtrack.</span>
          </h1>
          <p className="text-[var(--herr-muted)] max-w-xl leading-relaxed">
            Three layers of therapeutic sound — your voice affirmation, genre-composed music, and clinically calibrated ambient frequencies — playing simultaneously.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-[900px] mx-auto">
          <ECQOSoundPlayer
            genre={selectedGenre}
            modes={selectedModes}
            latestAffirmation={latestAffirmation}
            tracks={tracks || []}
            userId={user!.id}
          />
        </div>
      </section>
    </main>
  );
}
