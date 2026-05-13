'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type Paper = {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string;
  uploaded_at: string;
};

export type Comment = {
  id: string;
  comment_text: string;
  created_at: string;
  author_name: string;
};

export type AggregateStats = {
  count: number;
  rating: number | null;
  clinical_relevance: number | null;
  methodological_rigor: number | null;
};

export type Survey = {
  rating: number | null;
  clinical_relevance: number | null;
  methodological_rigor: number | null;
  free_response: string | null;
};

function Stars({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => !disabled && onChange?.(n)}
          disabled={disabled}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: disabled ? 'default' : 'pointer',
            padding: 2,
            color: n <= value ? 'var(--herr-magenta)' : 'rgba(26,15,26,0.25)',
            fontSize: 20,
            lineHeight: 1,
          }}
        >
          {n <= value ? '\u2605' : '\u2606'}
        </button>
      ))}
    </div>
  );
}

export default function PeerReviewDetailClient({
  paper,
  signedPdfUrl,
  comments,
  aggregate,
  mySurvey,
}: {
  paper: Paper;
  signedPdfUrl: string | null;
  comments: Comment[];
  aggregate: AggregateStats;
  mySurvey: Survey | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(mySurvey?.rating ?? 0);
  const [clinicalRelevance, setClinicalRelevance] = useState(mySurvey?.clinical_relevance ?? 0);
  const [methodologicalRigor, setMethodologicalRigor] = useState(mySurvey?.methodological_rigor ?? 0);
  const [freeResponse, setFreeResponse] = useState(mySurvey?.free_response ?? '');
  const [comment, setComment] = useState('');
  const [savingSurvey, setSavingSurvey] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitSurvey() {
    setSavingSurvey(true);
    setError(null);
    try {
      const res = await fetch(`/api/peer-review/${paper.id}/survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: rating || null,
          clinical_relevance: clinicalRelevance || null,
          methodological_rigor: methodologicalRigor || null,
          free_response: freeResponse || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Submission failed.');
      } else {
        router.refresh();
      }
    } finally {
      setSavingSurvey(false);
    }
  }

  async function submitComment() {
    if (!comment.trim()) return;
    setPostingComment(true);
    setError(null);
    try {
      const res = await fetch(`/api/peer-review/${paper.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_text: comment }),
      });
      if (res.ok) {
        setComment('');
        router.refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Comment failed.');
      }
    } finally {
      setPostingComment(false);
    }
  }

  function fmt(s: string) {
    return new Date(s).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  }

  return (
    <main className="px-6 py-10 max-w-[920px] mx-auto">
      <p className="herr-label mb-2" style={{ color: 'var(--herr-magenta)' }}>Peer Review</p>
      <h1 className="font-display text-3xl font-light mb-2" style={{ color: 'var(--herr-ink)' }}>{paper.title}</h1>
      {paper.description && (
        <p className="text-sm mb-6" style={{ color: 'rgba(26,15,26,0.75)' }}>{paper.description}</p>
      )}

      {signedPdfUrl ? (
        <div className="mb-8 rounded-lg overflow-hidden" style={{ border: '1px solid var(--herr-line)' }}>
          <iframe src={signedPdfUrl} title={paper.title} style={{ width: '100%', height: 600, border: 'none' }} />
          <div className="px-4 py-2 text-xs" style={{ background: 'rgba(26,15,26,0.04)', color: 'rgba(26,15,26,0.55)' }}>
            <a href={signedPdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--herr-magenta)' }}>
              Open PDF in new tab
            </a>
            &nbsp;&middot; Signed URL expires in 24h
          </div>
        </div>
      ) : (
        <p className="text-sm mb-8" style={{ color: 'rgba(26,15,26,0.5)' }}>PDF unavailable.</p>
      )}

      {error && (
        <div className="mb-6 px-4 py-3 rounded-md text-sm" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.4)', color: '#B91C1C' }}>
          {error}
        </div>
      )}

      <section className="mb-10 p-6 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)' }}>
        <h2 className="font-display text-xl mb-1">Your Review</h2>
        {aggregate.count > 0 && (
          <p className="text-xs mb-4" style={{ color: 'rgba(26,15,26,0.55)' }}>
            Aggregate from {aggregate.count} reviewer{aggregate.count === 1 ? '' : 's'}:
            &nbsp;overall {aggregate.rating?.toFixed(1) ?? '—'},
            &nbsp;clinical {aggregate.clinical_relevance?.toFixed(1) ?? '—'},
            &nbsp;methodology {aggregate.methodological_rigor?.toFixed(1) ?? '—'}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-y-3 items-center">
          <span className="text-sm">Overall rating</span>
          <Stars value={rating} onChange={setRating} />
          <span className="text-sm">Clinical relevance</span>
          <Stars value={clinicalRelevance} onChange={setClinicalRelevance} />
          <span className="text-sm">Methodological rigor</span>
          <Stars value={methodologicalRigor} onChange={setMethodologicalRigor} />
        </div>

        <label className="block mt-5">
          <span className="herr-label" style={{ color: 'rgba(26,15,26,0.55)' }}>Free response (optional)</span>
          <textarea
            value={freeResponse}
            onChange={(e) => setFreeResponse(e.target.value)}
            rows={4}
            className="mt-1 w-full"
            style={{ padding: '10px 14px', border: '1px solid var(--herr-line)', borderRadius: 8, background: '#FFFFFF', resize: 'vertical' }}
            placeholder="What stood out? What would you challenge or extend?"
          />
        </label>

        <button
          onClick={submitSurvey}
          disabled={savingSurvey}
          className="mt-4 px-5 py-2.5 rounded-md text-sm font-medium"
          style={{
            background: 'var(--herr-magenta)',
            color: '#FFFFFF',
            opacity: savingSurvey ? 0.6 : 1,
            border: 'none',
            cursor: savingSurvey ? 'not-allowed' : 'pointer',
          }}
        >
          {savingSurvey ? 'Saving\u2026' : mySurvey ? 'Update Review' : 'Submit Review'}
        </button>
      </section>

      <section>
        <h2 className="font-display text-xl mb-5">Discussion</h2>

        <div className="flex flex-col gap-4 mb-6">
          {comments.length === 0 ? (
            <p className="text-sm" style={{ color: 'rgba(26,15,26,0.5)' }}>Start the discussion below.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="p-4 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)' }}>
                <p className="text-xs mb-1" style={{ color: 'rgba(26,15,26,0.55)' }}>
                  <strong style={{ color: 'var(--herr-ink)' }}>{c.author_name}</strong> &middot; {fmt(c.created_at)}
                </p>
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{c.comment_text}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)' }}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Add to the discussion\u2026"
            className="w-full"
            style={{ padding: '10px 14px', border: '1px solid var(--herr-line)', borderRadius: 8, background: '#FFFFFF', resize: 'vertical' }}
          />
          <button
            onClick={submitComment}
            disabled={postingComment || !comment.trim()}
            className="mt-3 px-4 py-2 text-sm rounded-md"
            style={{
              background: 'var(--herr-magenta)',
              color: '#FFFFFF',
              opacity: postingComment || !comment.trim() ? 0.5 : 1,
              border: 'none',
              cursor: postingComment ? 'not-allowed' : 'pointer',
            }}
          >
            {postingComment ? 'Posting\u2026' : 'Post comment'}
          </button>
        </div>
      </section>
    </main>
  );
}
