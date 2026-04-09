import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AffirmationPlayer from './AffirmationPlayer';

export const metadata: Metadata = {
  title: 'Affirmation Library — HERR',
  description: 'Your daily I AM declarations across all 8 HERR activity modes.',
};

const MODES = [
  { id: 'workout',     name: 'Workout',       description: 'Push harder. Declare your strength.', icon: '💪' },
  { id: 'driving',     name: 'Driving',        description: 'Move with intention. Own your direction.', icon: '🚗' },
  { id: 'sleep',       name: 'Sleep',          description: 'Rest and reprogram. Let your subconscious receive.', icon: '🌙' },
  { id: 'morning',     name: 'Morning',        description: 'Start from power. Set the tone for your day.', icon: '☀️' },
  { id: 'deep-work',   name: 'Deep Work',      description: 'Focus is a declaration. Protect your output.', icon: '🎯' },
  { id: 'love-family', name: 'Love + Family',  description: 'Anchor your heart. Speak love into your people.', icon: '❤️' },
  { id: 'abundance',   name: 'Abundance',      description: 'Wealth is a mindset. Claim it daily.', icon: '✨' },
  { id: 'healing',     name: 'Healing',        description: 'Meet yourself with grace. You are becoming.', icon: '🕊️' },
];

export default async function AffirmationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('activity_modes')
    .eq('user_id', user!.id)
    .single();

  const selectedModes = prefs?.activity_modes ?? [];

  // Fetch affirmation tracks (newest first)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tracks } = await (supabase as any)
    .from('affirmation_scripts')
    .select('id, script, activity_mode, audio_url, generated_at, delivered')
    .eq('member_id', user!.id)
    .order('generated_at', { ascending: false })
    .limit(30);

  return (
    <main className="min-h-screen">
      <section className="px-6 pt-32 pb-16 border-b border-[var(--herr-border)]">
        <div className="max-w-[900px] mx-auto">
          <Link href="/dashboard" className="herr-label text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors mb-8 inline-block">
            &larr; Dashboard
          </Link>
          <p className="herr-label text-[var(--herr-muted)] mb-4">Affirmation Library</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-[var(--herr-white)] leading-[0.9] mb-6">
            Your daily<br />
            <span className="text-[var(--herr-pink)]">I AM declarations.</span>
          </h1>
          <p className="text-[var(--herr-muted)] max-w-xl leading-relaxed">
            Personalized affirmations generated daily in your own voice. Listen, download, and reprogram.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-[900px] mx-auto">
          {/* Player / Track list */}
          <p className="herr-label text-[var(--herr-pink)] mb-6">Your Affirmations</p>
          <AffirmationPlayer
            tracks={tracks || []}
            userId={user!.id}
          />

          {/* Activity modes reference */}
          <div className="mt-16">
            <p className="herr-label text-[var(--herr-muted)] mb-6">All 8 Activity Modes</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--herr-border)]">
              {MODES.map((mode) => {
                const isActive = selectedModes.includes(mode.id);
                return (
                  <div
                    key={mode.id}
                    className={`p-6 transition-colors ${isActive ? 'bg-[var(--herr-surface)]' : 'bg-[var(--herr-black)]'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{mode.icon}</span>
                      <h2 className="font-display text-xl font-light text-[var(--herr-white)]">
                        {mode.name}
                      </h2>
                      {isActive && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-[var(--herr-pink)]" />
                      )}
                    </div>
                    <p className="text-[0.82rem] text-[var(--herr-muted)] leading-relaxed">
                      {mode.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
