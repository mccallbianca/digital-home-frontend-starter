export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PeerReviewDetailClient, { type Paper, type Comment, type AggregateStats, type Survey } from './PeerReviewDetailClient';

const PAID_PLANS = ['collective', 'personalized', 'elite'];

export default async function PeerReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db.from('profiles').select('plan').eq('id', user.id).maybeSingle();
  if (!PAID_PLANS.includes(profile?.plan ?? 'free')) {
    redirect('/checkout?from=/dashboard/peer-review');
  }

  let paper: Paper | null = null;
  let comments: Comment[] = [];
  let aggregate: AggregateStats = { count: 0, rating: null, clinical_relevance: null, methodological_rigor: null };
  let mySurvey: Survey | null = null;
  let signedPdfUrl: string | null = null;

  try {
    const { data: paperRow } = await db
      .from('peer_review_papers')
      .select('id, title, description, pdf_url, uploaded_at, status')
      .eq('id', id)
      .maybeSingle();
    if (paperRow && paperRow.status === 'published') {
      paper = paperRow as Paper;
    }

    if (paper) {
      // Generate signed URL for the PDF (24h)
      if (paper.pdf_url) {
        const path = extractStoragePath(paper.pdf_url);
        if (path) {
          const { data: signed } = await supabase.storage
            .from('peer-review-papers')
            .createSignedUrl(path, 60 * 60 * 24);
          signedPdfUrl = signed?.signedUrl ?? null;
        }
      }

      const { data: commentRows } = await db
        .from('peer_review_comments')
        .select('id, member_id, comment_text, created_at, profiles:member_id (preferred_name, first_name)')
        .eq('paper_id', id)
        .order('created_at', { ascending: true });
      comments = ((commentRows ?? []) as Array<Record<string, unknown>>).map((c) => {
        const p = c.profiles as { preferred_name?: string; first_name?: string } | null;
        return {
          id: String(c.id),
          comment_text: String(c.comment_text),
          created_at: String(c.created_at),
          author_name: p?.preferred_name || p?.first_name || 'Member',
        };
      });

      const { data: surveyRows } = await db
        .from('peer_review_surveys')
        .select('rating, clinical_relevance, methodological_rigor')
        .eq('paper_id', id);
      const surveys = (surveyRows ?? []) as Array<{ rating: number | null; clinical_relevance: number | null; methodological_rigor: number | null }>;
      aggregate = {
        count: surveys.length,
        rating: avg(surveys.map((s) => s.rating)),
        clinical_relevance: avg(surveys.map((s) => s.clinical_relevance)),
        methodological_rigor: avg(surveys.map((s) => s.methodological_rigor)),
      };

      const { data: mine } = await db
        .from('peer_review_surveys')
        .select('rating, clinical_relevance, methodological_rigor, free_response')
        .eq('paper_id', id)
        .eq('member_id', user.id)
        .maybeSingle();
      if (mine) mySurvey = mine as Survey;
    }
  } catch {
    // pre-migration
  }

  if (!paper) notFound();

  return (
    <PeerReviewDetailClient
      paper={paper}
      signedPdfUrl={signedPdfUrl}
      comments={comments}
      aggregate={aggregate}
      mySurvey={mySurvey}
    />
  );
}

function avg(arr: Array<number | null>): number | null {
  const xs = arr.filter((x): x is number => typeof x === 'number');
  if (!xs.length) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function extractStoragePath(pdfUrl: string): string | null {
  // pdf_url may be a bare storage path (e.g. "abc/paper.pdf") OR a full
  // supabase URL — try both.
  if (!pdfUrl.startsWith('http')) return pdfUrl;
  const m = pdfUrl.match(/peer-review-papers\/(.+?)(?:\?|$)/);
  return m ? m[1] : null;
}
