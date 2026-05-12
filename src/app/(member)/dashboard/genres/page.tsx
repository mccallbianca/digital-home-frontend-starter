import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GenresClient from './GenresClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Genre Selection | HERR',
  description: 'Choose your ECQO Sound genres.',
};

type Plan = 'free' | 'collective' | 'personalized' | 'elite';

export default async function GenresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/dashboard/genres');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const plan = (profile?.plan ?? 'free') as Plan;

  // Primary source: member_genre_preferences (Phase 1 v2 EPIC B3).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase as any)
    .from('member_genre_preferences')
    .select('genre, active')
    .eq('member_id', user.id)
    .eq('active', true);

  let existingGenres: string[] = (rows ?? []).map((r: { genre: string }) => r.genre);

  // Legacy fallback: user_preferences.genres (array) for members who selected
  // genres before the migration. Skipped if the new table already has rows.
  if (existingGenres.length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prefs } = await (supabase as any)
      .from('user_preferences')
      .select('genres')
      .eq('user_id', user.id)
      .single();
    existingGenres = (prefs?.genres ?? []) as string[];
  }

  return (
    <GenresClient
      userId={user.id}
      plan={plan}
      existingGenres={existingGenres}
    />
  );
}
