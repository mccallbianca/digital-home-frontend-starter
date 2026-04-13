export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import CommunityModeration from './CommunityModeration';

export default async function AdminCommunityPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: flaggedPosts } = await db
    .from('community_posts')
    .select('id, thread_id, body, author_id, created_at, flagged, hidden')
    .eq('flagged', true)
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: modLog } = await db
    .from('moderation_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <main className="px-6 py-10 max-w-[900px]">
      <p className="herr-label text-[var(--herr-pink)] mb-2">Community</p>
      <h1 className="font-display text-3xl font-light text-[var(--herr-white)] mb-2">
        Community Moderation
      </h1>
      <p className="text-[var(--herr-muted)] text-sm mb-8">
        Review flagged posts and manage moderation actions.
      </p>
      <CommunityModeration flaggedPosts={flaggedPosts ?? []} modLog={modLog ?? []} />
    </main>
  );
}
