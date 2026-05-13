export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import JournalDraftEditor, { type Draft } from './JournalDraftEditor';

export default async function JournalDraftEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: draft } = await db
    .from('content_objects')
    .select('id, title, subtitle, body, slug, status, ai_generated, ai_generated_at')
    .eq('id', id)
    .maybeSingle();
  if (!draft) notFound();
  return <JournalDraftEditor draft={draft as Draft} />;
}
