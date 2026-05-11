export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';

export default async function AdminDailyQueue() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Fetch items needing review today
  const [journalRes, testimonialsRes, flaggedRes] = await Promise.all([
    db.from('content_objects').select('id, title, status, created_at').in('status', ['draft', 'pending_review']).order('created_at', { ascending: false }).limit(10),
    db.from('testimonials').select('id, content, status, created_at').eq('status', 'pending').order('created_at', { ascending: false }).limit(10),
    db.from('community_posts').select('id, body, author_id, created_at').eq('flagged', true).eq('hidden', false).order('created_at', { ascending: false }).limit(10),
  ]);

  const pendingJournal = journalRes.data ?? [];
  const pendingTestimonials = testimonialsRes.data ?? [];
  const flaggedPosts = flaggedRes.data ?? [];

  const totalItems = pendingJournal.length + pendingTestimonials.length + flaggedPosts.length;

  return (
    <main className="px-6 py-10 max-w-[900px]">
      <p className="herr-label text-[var(--herr-pink)] mb-2">Daily Queue</p>
      <h1 className="font-display text-3xl font-light text-[var(--herr-white)] mb-2">
        Review Queue
      </h1>
      <p className="text-[var(--herr-muted)] text-sm mb-8">
        {totalItems === 0 ? 'All clear. Nothing needs review.' : `${totalItems} items need attention.`}
      </p>

      {/* Pending Journal Articles */}
      {pendingJournal.length > 0 && (
        <section className="mb-10">
          <p className="herr-label text-[var(--herr-cobalt)] mb-4">Journal Articles ({pendingJournal.length})</p>
          <div className="space-y-px">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {pendingJournal.map((item: any) => (
              <div key={item.id} className="bg-[var(--herr-surface)] px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[var(--herr-white)] text-sm">{item.title}</p>
                  <p className="text-[0.75rem] text-[var(--herr-faint)]">
                    {new Date(item.created_at).toLocaleDateString()} &middot; {item.status}
                  </p>
                </div>
                <a href="/admin/journal" className="herr-label text-[var(--herr-cobalt)] text-[0.7rem] hover:text-[var(--herr-white)]">
                  Review &rarr;
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pending Testimonials */}
      {pendingTestimonials.length > 0 && (
        <section className="mb-10">
          <p className="herr-label text-[var(--herr-cobalt)] mb-4">Testimonials ({pendingTestimonials.length})</p>
          <div className="space-y-px">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {pendingTestimonials.map((item: any) => (
              <div key={item.id} className="bg-[var(--herr-surface)] px-6 py-4 flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-[var(--herr-muted)] text-sm truncate">&ldquo;{item.content}&rdquo;</p>
                  <p className="text-[0.75rem] text-[var(--herr-faint)]">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                <a href="/admin/testimonials" className="herr-label text-[var(--herr-cobalt)] text-[0.7rem] hover:text-[var(--herr-white)]">
                  Review &rarr;
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Flagged Community Posts */}
      {flaggedPosts.length > 0 && (
        <section className="mb-10">
          <p className="herr-label text-[var(--herr-pink)] mb-4">Flagged Posts ({flaggedPosts.length})</p>
          <div className="space-y-px">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {flaggedPosts.map((item: any) => (
              <div key={item.id} className="bg-[var(--herr-surface)] px-6 py-4 flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-[var(--herr-muted)] text-sm truncate">{item.body}</p>
                  <p className="text-[0.75rem] text-[var(--herr-faint)]">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                <a href="/admin/community" className="herr-label text-[var(--herr-pink)] text-[0.7rem] hover:text-[var(--herr-white)]">
                  Moderate &rarr;
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {totalItems === 0 && (
        <div className="border border-[var(--herr-border)] border-l-2 border-l-[var(--herr-cobalt)] p-8">
          <p className="text-[var(--herr-cobalt)] herr-label mb-2">All Clear</p>
          <p className="text-[var(--herr-muted)] text-sm leading-relaxed">
            No pending journal articles, testimonials, or flagged posts. Check back tomorrow.
          </p>
        </div>
      )}
    </main>
  );
}
