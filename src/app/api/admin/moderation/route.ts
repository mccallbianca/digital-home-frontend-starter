/**
 * POST /api/admin/moderation
 * Moderate flagged community posts
 * Body: { postId, action: 'hide' | 'dismiss' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { postId, action } = await req.json();
    if (!postId || !action) {
      return NextResponse.json({ error: 'postId and action required' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    if (action === 'hide') {
      await supabase.from('community_posts').update({ hidden: true }).eq('id', postId);
      await supabase.from('moderation_log').insert({
        action: 'post_hidden',
        target_post_id: postId,
        reason: 'Flagged post hidden by admin',
      });
    } else if (action === 'dismiss') {
      await supabase.from('community_posts').update({ flagged: false }).eq('id', postId);
      await supabase.from('moderation_log').insert({
        action: 'flag_dismissed',
        target_post_id: postId,
        reason: 'Flag dismissed by admin',
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Moderation action failed' }, { status: 500 });
  }
}
