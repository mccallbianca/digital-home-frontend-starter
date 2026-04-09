import { createClient } from '@/lib/supabase/server';
import JournalAdmin from './JournalAdmin';

export default async function AdminJournalPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: articles } = await db
    .from('content_objects')
    .select('id, title, status, body, slug, seo_title, published_at, created_at, peer_review_thread_id')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <main className="px-6 py-10 max-w-[900px]">
      <p className="herr-label text-[var(--herr-cobalt)] mb-2">Journal</p>
      <h1 className="font-display text-3xl font-light text-[var(--herr-white)] mb-8">
        Journal Approval
      </h1>
      <JournalAdmin articles={articles ?? []} />
    </main>
  );
}
