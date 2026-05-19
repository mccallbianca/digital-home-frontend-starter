'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ResultsClient from '@/app/(member)/dashboard/screener/results/ResultsClient';
import {
  STORAGE_KEY_RESPONSES,
  scoreResponses,
  responsesMapToList,
  type ScoredResult,
} from '@/lib/screener-scoring';

/**
 * Public results page — client-only because it reads localStorage.
 * Recomputes domain scores from the anonymous response set buffered by
 * ScreenerClient (publicMode), then renders the same ResultsClient as the
 * authenticated /dashboard/screener/results page. Adds a "Save Your Results"
 * CTA driving the visitor into /checkout to create their account.
 */
export default function PublicResultsPage() {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'empty' }
    | { status: 'ready'; result: ScoredResult }
  >({ status: 'loading' });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_RESPONSES);
      if (!raw) {
        setState({ status: 'empty' });
        return;
      }
      const parsed = JSON.parse(raw) as Record<string, number>;
      if (!parsed || Object.keys(parsed).length === 0) {
        setState({ status: 'empty' });
        return;
      }
      const list = responsesMapToList(parsed);
      const result = scoreResponses(list);
      setState({ status: 'ready', result });
    } catch {
      setState({ status: 'empty' });
    }
  }, []);

  if (state.status === 'loading') {
    return (
      <main className="screener-results-shell">
        <p className="screener-results-shell__msg">Loading your results…</p>
      </main>
    );
  }

  if (state.status === 'empty') {
    return (
      <main className="screener-results-shell">
        <div className="screener-results-empty">
          <p className="home-eyebrow home-eyebrow--reveal">RESULTS</p>
          <h1 className="screener-results-empty__title">
            No screener responses found.
          </h1>
          <p className="screener-results-empty__body">
            Complete the screener first to see your clinical summary.
          </p>
          <Link href="/screener" className="home-btn home-btn--primary">
            Complete the Self-Screen <span aria-hidden>→</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <ResultsClient
        overallAvg={state.result.overallAvg}
        scores={state.result.scores}
        hasModes={false}
        snapshots={[]}
      />
      <section className="screener-save-cta">
        <div className="screener-save-cta__card">
          <p className="home-eyebrow home-eyebrow--ink">SAVE YOUR RESULTS</p>
          <h2 className="screener-save-cta__title">
            Create your HERR account to lock in your results.
          </h2>
          <p className="screener-save-cta__body">
            Save these results, unlock your personalized affirmations, and access ECQO Sound.
          </p>
          <Link href="/checkout" className="home-btn home-btn--primary home-btn--xl">
            Start Your Free Trial <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
