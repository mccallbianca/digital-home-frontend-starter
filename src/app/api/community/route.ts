/**
 * Community API — /api/community
 *
 * GET  ?action=spaces         — List community spaces
 * GET  ?action=threads&space=  — List threads in a space
 * GET  ?action=posts&threadId= — List posts in a thread
 * GET  ?action=dms&partnerId=  — Get DM conversation
 * GET  ?action=dm-list         — List DM conversations
 * POST action=create-thread    — Create a thread
 * POST action=create-post      — Reply in a thread
 * POST action=react            — Add/remove reaction
 * POST action=send-dm          — Send a DM
 * POST action=block            — Block/silence a user
 * POST action=unblock          — Remove block/silence
 * POST action=flag             — Flag a post
 * POST action=acknowledge      — Acknowledge community standards
 * POST action=beta-interest    — Submit beta lab interest form
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/security/rate-limit';
import { sanitizeInput } from '@/lib/security/sanitize';
import { checkContentPolicy } from '@/lib/security/content-policy';
import { sendSecurityAlert } from '@/lib/security/alerts';
import { TRAUMA_MESSAGES } from '@/lib/security/trauma-messages';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getDb() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const action = searchParams.get('action');
  const db = getDb();

  switch (action) {
    case 'spaces': {
      const { data } = await db
        .from('community_spaces')
        .select('*')
        .order('sort_order');
      return NextResponse.json({ spaces: data || [] });
    }

    case 'threads': {
      const space = searchParams.get('space');
      if (!space) return NextResponse.json({ error: 'space required' }, { status: 400 });

      const { data } = await db
        .from('community_threads')
        .select('*, profiles:author_id(preferred_name, first_name)')
        .eq('space', space)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);
      return NextResponse.json({ threads: data || [] });
    }

    case 'posts': {
      const threadId = searchParams.get('threadId');
      if (!threadId) return NextResponse.json({ error: 'threadId required' }, { status: 400 });

      const { data: thread } = await db
        .from('community_threads')
        .select('*')
        .eq('id', threadId)
        .single();

      const { data: posts } = await db
        .from('community_posts')
        .select('*, profiles:author_id(preferred_name, first_name)')
        .eq('thread_id', threadId)
        .eq('hidden', false)
        .order('created_at', { ascending: true })
        .limit(100);

      // Get reactions for these posts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const postIds = (posts || []).map((p: any) => p.id);
      const { data: reactions } = postIds.length > 0
        ? await db.from('community_reactions').select('*').in('post_id', postIds)
        : { data: [] };

      return NextResponse.json({ thread, posts: posts || [], reactions: reactions || [] });
    }

    case 'dm-list': {
      const userId = searchParams.get('userId');
      if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

      // Get latest DM from each conversation partner
      const { data: sent } = await db
        .from('community_dms')
        .select('recipient_id, body, created_at, read')
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });

      const { data: received } = await db
        .from('community_dms')
        .select('sender_id, body, created_at, read')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

      // Merge into conversation list
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const convos: Record<string, any> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const dm of [...(sent || []), ...(received || [])] as any[]) {
        const partnerId = dm.sender_id || dm.recipient_id;
        if (!convos[partnerId] || new Date(dm.created_at) > new Date(convos[partnerId].created_at)) {
          convos[partnerId] = dm;
        }
      }

      return NextResponse.json({ conversations: Object.entries(convos).map(([id, dm]) => ({ partnerId: id, ...dm })) });
    }

    case 'dms': {
      const userId = searchParams.get('userId');
      const partnerId = searchParams.get('partnerId');
      if (!userId || !partnerId) return NextResponse.json({ error: 'userId and partnerId required' }, { status: 400 });

      const { data } = await db
        .from('community_dms')
        .select('*')
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: true })
        .limit(100);

      // Mark as read
      await db
        .from('community_dms')
        .update({ read: true })
        .eq('recipient_id', userId)
        .eq('sender_id', partnerId);

      return NextResponse.json({ messages: data || [] });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const db = getDb();

    switch (action) {
      case 'create-thread': {
        const { space, title, content, authorId } = body;

        // Rate limit: 10 posts per hour
        const threadRlKey = getRateLimitKey('community-post', authorId);
        const threadRl = checkRateLimit(threadRlKey, RATE_LIMITS['community-post']);
        if (!threadRl.allowed) {
          return NextResponse.json({ error: TRAUMA_MESSAGES.rateLimitedPost }, { status: 429 });
        }

        // Sanitize + content policy (Layers 1-2)
        const titleSan = sanitizeInput(title, 200);
        const contentSan = sanitizeInput(content, 5000);
        if (titleSan.blocked || contentSan.blocked) {
          return NextResponse.json({ error: TRAUMA_MESSAGES.inputBlocked }, { status: 400 });
        }
        const policy = checkContentPolicy(contentSan.clean);
        if (policy.tier === 1) {
          await sendSecurityAlert({
            type: 'nlp_crisis_flag',
            subject: 'Crisis language detected in community thread',
            detail: `Member ${authorId} posted content flagged as ${policy.flag} in space ${space}`,
            memberId: authorId,
          });
        }

        const { data, error } = await db
          .from('community_threads')
          .insert({ space, title: titleSan.clean, body: contentSan.clean, author_id: authorId })
          .select('id')
          .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ threadId: data.id, crisisResources: policy.crisisResources });
      }

      case 'create-post': {
        const { threadId, content, authorId } = body;

        // Rate limit: 10 posts per hour
        const postRlKey = getRateLimitKey('community-post', authorId);
        const postRl = checkRateLimit(postRlKey, RATE_LIMITS['community-post']);
        if (!postRl.allowed) {
          return NextResponse.json({ error: TRAUMA_MESSAGES.rateLimitedPost }, { status: 429 });
        }

        // Sanitize + content policy (Layers 1-2)
        const postSan = sanitizeInput(content, 5000);
        if (postSan.blocked) {
          return NextResponse.json({ error: TRAUMA_MESSAGES.inputBlocked }, { status: 400 });
        }
        const postPolicy = checkContentPolicy(postSan.clean);
        if (postPolicy.tier === 1) {
          await sendSecurityAlert({
            type: 'nlp_crisis_flag',
            subject: 'Crisis language detected in community post',
            detail: `Member ${authorId} posted content flagged as ${postPolicy.flag}`,
            memberId: authorId,
          });
        }

        const { data, error } = await db
          .from('community_posts')
          .insert({ thread_id: threadId, body: postSan.clean, author_id: authorId })
          .select('id')
          .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ postId: data.id, crisisResources: postPolicy.crisisResources });
      }

      case 'react': {
        const { postId, authorId, emoji } = body;
        // Toggle: try insert, if conflict then delete
        const { error } = await db
          .from('community_reactions')
          .insert({ post_id: postId, author_id: authorId, emoji: emoji || '👏' });

        if (error?.code === '23505') {
          // Unique violation — remove reaction
          await db
            .from('community_reactions')
            .delete()
            .eq('post_id', postId)
            .eq('author_id', authorId)
            .eq('emoji', emoji || '👏');
          return NextResponse.json({ toggled: 'removed' });
        }
        return NextResponse.json({ toggled: 'added' });
      }

      case 'send-dm': {
        const { senderId, recipientId, content } = body;

        // Rate limit: 50 DMs per hour
        const dmRlKey = getRateLimitKey('community-dm', senderId);
        const dmRl = checkRateLimit(dmRlKey, RATE_LIMITS['community-dm']);
        if (!dmRl.allowed) {
          return NextResponse.json({ error: TRAUMA_MESSAGES.rateLimitedDm }, { status: 429 });
        }

        // Sanitize + content policy
        const dmSan = sanitizeInput(content, 2000);
        if (dmSan.blocked) {
          return NextResponse.json({ error: TRAUMA_MESSAGES.inputBlocked }, { status: 400 });
        }
        const dmPolicy = checkContentPolicy(dmSan.clean);
        if (dmPolicy.tier === 1) {
          await sendSecurityAlert({
            type: 'nlp_crisis_flag',
            subject: 'Crisis language detected in DM',
            detail: `Member ${senderId} sent DM flagged as ${dmPolicy.flag}`,
            memberId: senderId,
          });
        }

        // Check blocks
        const { data: blocked } = await db
          .from('community_blocks')
          .select('id')
          .or(`and(blocker_id.eq.${recipientId},blocked_id.eq.${senderId}),and(blocker_id.eq.${senderId},blocked_id.eq.${recipientId})`)
          .limit(1);

        if (blocked && blocked.length > 0) {
          return NextResponse.json({ error: 'Cannot send message to this member' }, { status: 403 });
        }

        const { error } = await db
          .from('community_dms')
          .insert({ sender_id: senderId, recipient_id: recipientId, body: dmSan.clean });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true });
      }

      case 'block': {
        const { blockerId, blockedId, type } = body; // type: 'block' or 'silence'
        if (type === 'silence') {
          await db.from('community_silences').insert({ silencer_id: blockerId, silenced_id: blockedId });
        } else {
          await db.from('community_blocks').insert({ blocker_id: blockerId, blocked_id: blockedId });
        }
        return NextResponse.json({ ok: true });
      }

      case 'unblock': {
        const { blockerId: unblocker, blockedId: unblocked, type: unblockType } = body;
        if (unblockType === 'silence') {
          await db.from('community_silences').delete().eq('silencer_id', unblocker).eq('silenced_id', unblocked);
        } else {
          await db.from('community_blocks').delete().eq('blocker_id', unblocker).eq('blocked_id', unblocked);
        }
        return NextResponse.json({ ok: true });
      }

      case 'flag': {
        const { postId: flagPostId, reason: _reason } = body;
        await db.from('community_posts').update({ flagged: true }).eq('id', flagPostId);
        return NextResponse.json({ ok: true });
      }

      case 'acknowledge': {
        const { userId: ackUserId } = body;
        // Store in profiles or a dedicated field
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.from('profiles').update({ community_acknowledged: true } as any).eq('id', ackUserId);
        return NextResponse.json({ ok: true });
      }

      case 'beta-interest': {
        const { memberId, name, email, reason } = body;
        const { error } = await db.from('beta_lab_submissions').insert({
          member_id: memberId, name, email, reason, status: 'pending',
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true });
      }

      case 'pause': {
        const { userId: pauseUserId, paused } = body;
        await db.from('members').update({ community_paused: paused }).eq('email',
          (await db.from('profiles').select('email').eq('id', pauseUserId).single()).data?.email
        );
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err) {
    console.error('[community] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Community action failed' },
      { status: 500 }
    );
  }
}
