/**
 * /dashboard/companion
 *
 * The Companion chat surface — primary product. Server component fetches:
 *   1. user_identity_anchors (if missing, render an "anchor your identity"
 *      hand-off card instead of the chat — anchors are needed to make the
 *      ARAI arc work; we won't fake them).
 *   2. Last 50 turns of companion_messages for the user's most recent
 *      conversation_id, in chronological order.
 *
 * Client component handles the input, fetch, optimistic render, and
 * crisis-handoff display.
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import CompanionClient, { type CompanionMessage } from './CompanionClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Talk to HERR | HERR',
  description: 'Your ECQO Conversational AI Companion — clinical voice, your identity anchors, ARAI-arc responses.',
};

const HISTORY_LIMIT = 50;

type AnchorRow = {
  self_word_1: string | null;
  self_word_2: string | null;
  self_word_3: string | null;
  core_value_1: string | null;
  core_value_2: string | null;
  defining_achievement_description: string | null;
  aspirational_phrase: string | null;
};

function hasMeaningfulAnchors(a: AnchorRow | null | undefined): boolean {
  if (!a) return false;
  const slots = [
    a.self_word_1, a.self_word_2, a.self_word_3,
    a.core_value_1, a.core_value_2,
    a.defining_achievement_description, a.aspirational_phrase,
  ];
  return slots.some((v) => typeof v === 'string' && v.trim().length > 0);
}

export default async function CompanionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/dashboard/companion');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('preferred_name, first_name, onboarding_complete')
    .eq('id', user.id)
    .maybeSingle();
  const displayName: string = profile?.preferred_name || profile?.first_name || 'friend';

  // Pull anchors via admin client so RLS doesn't muddy the "missing vs
  // empty" distinction. Read-only.
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: anchorRow } = await (admin as any)
    .from('user_identity_anchors')
    .select('self_word_1, self_word_2, self_word_3, core_value_1, core_value_2, defining_achievement_description, aspirational_phrase')
    .eq('user_id', user.id)
    .maybeSingle();

  const anchored = hasMeaningfulAnchors(anchorRow);

  // Load the user's most recent conversation_id + last 50 turns.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: latestTurn } = await (admin as any)
    .from('companion_messages')
    .select('conversation_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let history: CompanionMessage[] = [];
  let conversationId: string | null = null;
  if (latestTurn?.conversation_id) {
    conversationId = latestTurn.conversation_id as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rows } = await (admin as any)
      .from('companion_messages')
      .select('id, role, content, safety_flag, safety_severity, created_at')
      .eq('user_id', user.id)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(HISTORY_LIMIT);
    history = (rows ?? []) as CompanionMessage[];
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--herr-cream)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 760, width: '100%', margin: '0 auto', padding: '32px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--herr-magenta, #C42D8E)', fontWeight: 700, margin: 0, marginBottom: 6 }}>
            Talk to HERR
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 30, fontWeight: 500, color: 'var(--herr-ink)', margin: 0, lineHeight: 1.15 }}>
            Your clinical AI companion.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--herr-ink-soft, #5a5a5a)', margin: 0, marginTop: 8, lineHeight: 1.55 }}>
            Direct. Trauma-informed. Speaks to <em>you</em> — not generic humanity. Anchored in your Phase 3 identity work.
          </p>
        </header>

        {!anchored ? (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--herr-line)',
              borderRadius: 16,
              padding: 28,
              marginTop: 12,
            }}
          >
            <p style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--herr-cobalt, #1A4789)', fontWeight: 700, margin: '0 0 10px' }}>
              One thing first
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 500, color: 'var(--herr-ink)', margin: '0 0 12px' }}>
              I want to know who I&apos;m talking to.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--herr-ink-soft)', lineHeight: 1.65, margin: '0 0 18px' }}>
              The Companion is clinical, not generic — that means it needs your three self-words, your core values, and the moment you defined yourself by. Take 6 minutes in onboarding to anchor that, then come back.
            </p>
            <Link
              href="/onboarding"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 44,
                padding: '0 22px',
                background: 'var(--herr-magenta, #C42D8E)',
                color: '#FFFFFF',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                textDecoration: 'none',
              }}
            >
              Anchor my identity →
            </Link>
          </div>
        ) : (
          <CompanionClient
            initialMessages={history}
            initialConversationId={conversationId}
            displayName={displayName}
          />
        )}
      </div>
    </div>
  );
}
