/**
 * POST /api/onboarding/voice-consent
 * =====================================
 * Server-side route to save voice consent record.
 * Uses the service role key directly to bypass RLS.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: NextRequest) {
  try {
    const { userId, filePath } = await request.json();

    if (!userId || !filePath) {
      return NextResponse.json(
        { error: 'Missing userId or filePath' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Delete any existing record first, then insert fresh
    await supabase.from('voice_consents').delete().eq('user_id', userId);

    const { error } = await supabase.from('voice_consents').insert({
      user_id: userId,
      consented_at: new Date().toISOString(),
      file_path: filePath,
    });

    if (error) {
      console.error('[Voice Consent Error]', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Voice Consent Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
