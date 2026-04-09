/**
 * POST /api/sessions/survey
 *
 * Submit post-session survey. Writes to survey_responses.
 * If testimonial is included, also writes to testimonials table.
 *
 * Body: { sessionId, memberId?, email, rating, takeaway, nextTopic, nps, testimonial }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, memberId, email: _email, rating, takeaway, nextTopic, nps, testimonial } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Insert survey response
    const { error: surveyErr } = await supabase
      .from('survey_responses')
      .insert({
        session_id: sessionId,
        member_id: memberId || null,
        rating: rating || null,
        takeaway: takeaway || null,
        next_topic: nextTopic || null,
        nps: nps || null,
        testimonial: testimonial || null,
      });

    if (surveyErr) {
      return NextResponse.json({ error: surveyErr.message }, { status: 500 });
    }

    // If testimonial provided, route to testimonials pipeline
    if (testimonial && testimonial.trim()) {
      await supabase
        .from('testimonials')
        .insert({
          member_id: memberId || null,
          session_id: sessionId,
          content: testimonial.trim(),
          status: 'pending',
        });
    }

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error('[sessions/survey] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Survey submission failed' },
      { status: 500 }
    );
  }
}
