export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import AdminPeerReviewClient, { type AdminPaper } from './AdminPeerReviewClient';

export default async function AdminPeerReviewPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  let papers: AdminPaper[] = [];
  try {
    const { data: rows } = await db
      .from('peer_review_papers')
      .select('id, title, description, status, uploaded_at')
      .order('uploaded_at', { ascending: false });
    papers = (rows ?? []) as AdminPaper[];
  } catch {
    // pre-migration
  }
  return <AdminPeerReviewClient papers={papers} />;
}
