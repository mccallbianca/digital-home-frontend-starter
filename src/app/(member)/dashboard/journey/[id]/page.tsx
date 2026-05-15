export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import JourneyDetailClient, { type DetailPost, type DetailComment } from './JourneyDetailClient';

const PAID_PLANS = ['collective', 'personalized', 'elite'];

function extractStoragePath(url: string): string | null {
  if (!url) return null;
  if (!url.startsWith('http')) return url;
  const m = url.match(/journey-media\/(.+?)(?:\?|$)/);
  return m ? m[1] : null;
}

export default async function JourneyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db
    .from('profiles')
    .select('plan, is_tester')
    .eq('id', user.id)
    .maybeSingle();
  const isTester = profile?.is_tester === true;
  if (!isTester && !PAID_PLANS.includes(profile?.plan ?? 'free')) {
    redirect('/checkout?from=/dashboard/journey');
  }

  let post: DetailPost | null = null;
  let comments: DetailComment[] = [];
  let myReactions: string[] = [];
  let signedMediaUrl: string | null = null;
  const reactionCounts = { heart: 0, strength: 0, support: 0 } as Record<string, number>;

  try {
    const { data: postRow } = await db
      .from('journey_posts')
      .select('id, member_id, caption, media_url, media_type, created_at, profiles:member_id (preferred_name, first_name)')
      .eq('id', id)
      .maybeSingle();
    if (postRow) {
      const path = extractStoragePath(postRow.media_url);
      if (path) {
        const { data: signed } = await supabase.storage
          .from('journey-media')
          .createSignedUrl(path, 60 * 60 * 12);
        signedMediaUrl = signed?.signedUrl ?? null;
      }
      const profileRel = postRow.profiles as { preferred_name?: string; first_name?: string } | null;
      post = {
        id: postRow.id,
        member_id: postRow.member_id,
        author_name: profileRel?.preferred_name || profileRel?.first_name || 'Member',
        caption: postRow.caption,
        media_url: signedMediaUrl,
        media_type: postRow.media_type,
        created_at: postRow.created_at,
      };

      const [{ data: commentRows }, { data: reactionRows }, { data: mine }] = await Promise.all([
        db.from('journey_comments')
          .select('id, member_id, comment_text, created_at, profiles:member_id (preferred_name, first_name)')
          .eq('post_id', id)
          .order('created_at', { ascending: true }),
        db.from('journey_reactions').select('reaction').eq('post_id', id),
        db.from('journey_reactions').select('reaction').eq('post_id', id).eq('member_id', user.id),
      ]);

      comments = ((commentRows ?? []) as Array<Record<string, unknown>>).map((c) => {
        const p = c.profiles as { preferred_name?: string; first_name?: string } | null;
        return {
          id: String(c.id),
          comment_text: String(c.comment_text),
          created_at: String(c.created_at),
          author_name: p?.preferred_name || p?.first_name || 'Member',
        };
      });

      ((reactionRows ?? []) as Array<{ reaction: string }>).forEach((r) => {
        if (r.reaction in reactionCounts) reactionCounts[r.reaction] += 1;
      });
      myReactions = ((mine ?? []) as Array<{ reaction: string }>).map((r) => r.reaction);
    }
  } catch {
    // pre-migration
  }

  if (!post) notFound();

  return (
    <JourneyDetailClient
      post={post}
      comments={comments}
      reactionCounts={reactionCounts}
      myReactions={myReactions}
    />
  );
}
