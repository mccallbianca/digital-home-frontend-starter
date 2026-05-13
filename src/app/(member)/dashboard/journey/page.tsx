export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import JourneyClient, { type FeedPost } from './JourneyClient';

const PAID_PLANS = ['collective', 'personalized', 'elite'];
const POST_SIGNED_URL_TTL = 60 * 60 * 12; // 12h

type RawPost = {
  id: string;
  member_id: string;
  caption: string | null;
  media_url: string;
  media_type: string;
  created_at: string;
  profiles?: { preferred_name?: string; first_name?: string } | null;
};

function extractStoragePath(url: string): string | null {
  if (!url) return null;
  if (!url.startsWith('http')) return url;
  const m = url.match(/journey-media\/(.+?)(?:\?|$)/);
  return m ? m[1] : null;
}

export default async function JourneyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db.from('profiles').select('plan').eq('id', user.id).maybeSingle();
  if (!PAID_PLANS.includes(profile?.plan ?? 'free')) {
    redirect('/checkout?from=/dashboard/journey');
  }

  let posts: FeedPost[] = [];
  try {
    const { data: postRows } = await db
      .from('journey_posts')
      .select('id, member_id, caption, media_url, media_type, created_at, profiles:member_id (preferred_name, first_name)')
      .order('created_at', { ascending: false })
      .limit(40);
    const raws = (postRows ?? []) as RawPost[];

    const enriched: FeedPost[] = await Promise.all(
      raws.map(async (p) => {
        const [{ data: reactions }, { count: commentCount }] = await Promise.all([
          db.from('journey_reactions').select('reaction').eq('post_id', p.id),
          db.from('journey_comments').select('*', { count: 'exact', head: true }).eq('post_id', p.id),
        ]);
        const reactCounts = { heart: 0, strength: 0, support: 0 } as Record<string, number>;
        ((reactions ?? []) as Array<{ reaction: string }>).forEach((r) => {
          if (r.reaction in reactCounts) reactCounts[r.reaction] += 1;
        });

        let signedUrl: string | null = null;
        const path = extractStoragePath(p.media_url);
        if (path) {
          const { data: signed } = await supabase.storage
            .from('journey-media')
            .createSignedUrl(path, POST_SIGNED_URL_TTL);
          signedUrl = signed?.signedUrl ?? null;
        }

        return {
          id: p.id,
          member_id: p.member_id,
          author_name: p.profiles?.preferred_name || p.profiles?.first_name || 'Member',
          caption: p.caption,
          media_url: signedUrl,
          media_type: (p.media_type as 'image' | 'video') ?? 'image',
          created_at: p.created_at,
          comment_count: commentCount ?? 0,
          reactions: reactCounts,
        };
      }),
    );
    posts = enriched;
  } catch {
    // pre-migration
  }

  return <JourneyClient userId={user.id} posts={posts} />;
}
