/**
 * POST /api/stream/token
 *
 * Generates a Stream Chat user token server-side.
 * The token is used by the client to connect to Stream Chat.
 *
 * Body: { userId: string, name: string }
 * Returns: { token: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // Verify authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const apiKey = process.env.STREAM_API_KEY ?? '';
    const apiSecret = process.env.STREAM_API_SECRET ?? '';

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Stream Chat not configured' }, { status: 503 });
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret);

    const { name } = await req.json();

    // Get user's plan for role assignment
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, preferred_name, first_name')
      .eq('id', user.id)
      .single();

    const displayName = name || profile?.preferred_name || profile?.first_name || 'HERR Member';
    const isElite = profile?.plan === 'elite';

    // Upsert user in Stream
    await serverClient.upsertUser({
      id: user.id,
      name: displayName,
      role: isElite ? 'admin' : 'user',
    } as Parameters<typeof serverClient.upsertUser>[0]);

    // Generate token
    const token = serverClient.createToken(user.id);

    // Ensure channels exist
    const channelDefs = [
      { id: 'general', label: 'General' },
      { id: 'affirmations', label: 'Affirmations' },
      { id: 'wins', label: 'Wins' },
    ];

    for (const ch of channelDefs) {
      const channel = serverClient.channel('messaging', ch.id, {
        created_by_id: 'system',
      } as Record<string, unknown>);
      // Set name after creation to avoid type issues
      await channel.create();
      await channel.update({ name: ch.label } as Record<string, unknown>);
    }

    // Elite-only channel
    if (isElite) {
      const eliteChannel = serverClient.channel('messaging', 'herr-elite', {
        created_by_id: 'system',
      } as Record<string, unknown>);
      await eliteChannel.create();
      await eliteChannel.update({ name: 'HERR Elite' } as Record<string, unknown>);
      await eliteChannel.addMembers([user.id]);
    }

    return NextResponse.json({
      token,
      userId: user.id,
      name: displayName,
      isElite,
    });
  } catch (err) {
    console.error('[stream/token] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Token generation failed' },
      { status: 500 }
    );
  }
}
