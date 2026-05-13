export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import JournalQueueClient, { type Draft } from './JournalQueueClient';

export default async function JournalQueuePage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  let drafts: Draft[] = [];
  try {
    const { data: rows } = await db
      .from('content_objects')
      .select('id, title, subtitle, body, slug, ai_generated_at')
      .eq('status', 'draft')
      .eq('ai_generated', true)
      .order('ai_generated_at', { ascending: false });
    drafts = (rows ?? []) as Draft[];
  } catch {
    // pre-migration
  }
  return <JournalQueueClient drafts={drafts} />;
}
