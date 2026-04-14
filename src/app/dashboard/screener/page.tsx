import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ScreenerClient from './ScreenerClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ECQO Assessment | HERR',
  description: 'Complete your existential concerns questionnaire to personalize your HERR experience.',
};

export default async function ScreenerPage({
  searchParams,
}: {
  searchParams: Promise<{ fromOnboarding?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard/screener');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  return (
    <ScreenerClient
      userId={user.id}
      plan={profile?.plan ?? null}
      fromOnboarding={params.fromOnboarding === '1'}
    />
  );
}
