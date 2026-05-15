/**
 * POST /api/journey/post
 *
 * Body: { caption, media_url?, media_type?, category? }
 *   - caption: text body of the post (up to 500 chars)
 *   - media_url: storage path in `journey-media` bucket (optional)
 *   - media_type: 'image' | 'video' | 'text' (defaults to 'text' if no media)
 *   - category: 'mindset' | 'mental-health' | 'money' (optional)
 *
 * Auth: paid plan required (RLS enforces too).
 *
 * Block 4 bug 5: prior version required media_url; this iteration
 * supports text-only reflections plus the BFRW category tag.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PAID_PLANS = ['collective', 'personalized', 'elite'];
const VALID_CATEGORIES = ['mindset', 'mental-health', 'money'] as const;
const VALID_MEDIA_TYPES = ['image', 'video', 'text'] as const;
const MAX_CAPTION = 500;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db.from('profiles').select('plan').eq('id', user.id).maybeSingle();
  if (!PAID_PLANS.includes(profile?.plan ?? 'free')) {
    return NextResponse.json({ error: 'Paid plan required' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const caption = body.caption ? String(body.caption).slice(0, MAX_CAPTION) : null;
  const rawMediaUrl = String(body.media_url ?? '').trim();
  const media_url = rawMediaUrl || null;
  const requestedType = String(body.media_type ?? '');
  const rawCategory = String(body.category ?? '').trim();
  const category = (VALID_CATEGORIES as readonly string[]).includes(rawCategory) ? rawCategory : null;

  let media_type: 'image' | 'video' | 'text';
  if (media_url) {
    if (requestedType === 'image' || requestedType === 'video') {
      media_type = requestedType;
    } else {
      return NextResponse.json({ error: 'Invalid media_type' }, { status: 400 });
    }
  } else {
    media_type = 'text';
  }

  if (!media_url && !caption) {
    return NextResponse.json({ error: 'Reflection cannot be empty.' }, { status: 400 });
  }

  if (!(VALID_MEDIA_TYPES as readonly string[]).includes(media_type)) {
    return NextResponse.json({ error: 'Invalid media_type' }, { status: 400 });
  }

  // Best-effort insert with category. If the `category` column hasn't been
  // added to journey_posts yet, retry without it so text-only posts still
  // succeed during the migration rollout window.
  const baseRow = { member_id: user.id, caption, media_url, media_type };
  let insert = await db
    .from('journey_posts')
    .insert(category ? { ...baseRow, category } : baseRow)
    .select('id')
    .single();
  if (insert.error && /column .*category.* does not exist/i.test(insert.error.message)) {
    insert = await db.from('journey_posts').insert(baseRow).select('id').single();
  }
  if (insert.error) {
    return NextResponse.json({ error: insert.error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, post_id: insert.data.id });
}
