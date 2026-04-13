export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import TestimonialsAdmin from './TestimonialsAdmin';

export default async function AdminTestimonialsPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: testimonials } = await db
    .from('testimonials')
    .select('id, member_id, session_id, content, status, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <main className="px-6 py-10 max-w-[900px]">
      <p className="herr-label text-[var(--herr-cobalt)] mb-2">Testimonials</p>
      <h1 className="font-display text-3xl font-light text-[var(--herr-white)] mb-2">
        Testimonials Pipeline
      </h1>
      <p className="text-[var(--herr-muted)] text-sm mb-8">
        Review, approve, or reject testimonials from post-session surveys.
      </p>
      <TestimonialsAdmin testimonials={testimonials ?? []} />
    </main>
  );
}
