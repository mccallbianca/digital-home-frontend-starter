import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GenresClient from './GenresClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Genre Selection — HERR',
  description: 'Choose your ECQO Sound genres.',
};

export default async function GenresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/dashboard/genres');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const plan = profile?.plan ?? 'free';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: prefs } = await (supabase as any)
    .from('user_preferences')
    .select('genres')
    .eq('user_id', user.id)
    .single();

  return (
    <GenresClient
      userId={user.id}
      plan={plan}
      existingGenres={prefs?.genres ?? []}
    />
  );
}
