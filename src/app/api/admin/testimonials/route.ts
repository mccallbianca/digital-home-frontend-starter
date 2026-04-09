/**
 * POST /api/admin/testimonials
 * Update testimonial status (approve/reject)
 * Body: { id, status: 'approved' | 'rejected' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'id and status required' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { error } = await supabase
      .from('testimonials')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}
