/**
 * POST /api/admin/beta-lab
 * Approve beta lab submission and flag member as beta_tester
 * Body: { id, action: 'approve' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { id, action: _action } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Update submission status
    await supabase.from('beta_lab_submissions').update({ status: 'approved' }).eq('id', id);

    // Get submission to find the member
    const { data: sub } = await supabase
      .from('beta_lab_submissions')
      .select('member_id, email')
      .eq('id', id)
      .single();

    // Flag member as beta tester
    if (sub?.email) {
      await supabase.from('members').update({ beta_tester: true }).eq('email', sub.email);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Beta lab action failed' }, { status: 500 });
  }
}
