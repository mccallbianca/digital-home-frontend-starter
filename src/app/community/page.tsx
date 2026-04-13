import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CommunityClient from './CommunityClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Community | HERR',
  description: 'The space where HERR members connect, share, and grow together.',
};

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/community');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, preferred_name, first_name')
    .eq('id', user.id)
    .single();

  const plan = profile?.plan ?? 'free';
  const displayName = profile?.preferred_name || profile?.first_name || 'Member';

  return (
    <CommunityClient
      userId={user.id}
      displayName={displayName}
      plan={plan}
    />
  );
}
