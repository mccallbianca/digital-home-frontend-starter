/**
 * POST /api/cron/daily-affirmations
 *
 * Daily cron job (4:00 AM ET) — generates fresh affirmation script
 * + MP3 for every active member. Called by external scheduler.
 *
 * Protected by CRON_SECRET header.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const CRON_SECRET = process.env.CRON_SECRET || '';

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Get all active members with their activity modes
  const { data: members, error: membersErr } = await supabase
    .from('members')
    .select('email, tier')
    .eq('status', 'active');

  if (membersErr || !members) {
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }

  let generated = 0;
  let errors = 0;

  for (const member of members) {
    try {
      // Find auth user by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, preferred_name, first_name')
        .eq('email', member.email)
        .single();

      if (!profile) continue;

      // Get user's activity modes
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('activity_modes')
        .eq('user_id', profile.id)
        .single();

      const modes: string[] = prefs?.activity_modes || ['morning'];
      // Pick one mode for today's delivery (rotate through modes)
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const todayMode = modes[dayOfYear % modes.length];

      // Call the generate endpoint internally
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.h3rr.com';
      const res = await fetch(`${baseUrl}/api/affirmations/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          activityMode: todayMode,
        }),
      });

      if (res.ok) {
        generated++;
      } else {
        errors++;
      }
    } catch {
      errors++;
    }
  }

  return NextResponse.json({
    ok: true,
    totalMembers: members.length,
    generated,
    errors,
    timestamp: new Date().toISOString(),
  });
}
