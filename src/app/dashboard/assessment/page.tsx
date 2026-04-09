import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ProgressChart from './ProgressChart';

export const metadata: Metadata = {
  title: 'My Progress — HERR',
  description: 'Track your existential wellness over time.',
};

const QUESTIONS = [
  'How often do you reflect on the meaning or purpose of your life?',
  'How connected do you feel to something larger than yourself?',
  'How comfortable are you sitting with uncertainty about the future?',
  'How would you describe your relationship with your inner voice?',
  'How often do feelings of isolation or disconnection affect your daily experience?',
  'How clear is your sense of personal identity outside of your roles?',
  'How do you relate to the concept of your own mortality?',
  'How frequently do you experience a sense of aliveness or deep presence?',
];

const DOMAINS = [
  { label: 'Meaning & Purpose',     questions: [0, 1] },
  { label: 'Uncertainty & Freedom',  questions: [2, 3] },
  { label: 'Connection & Identity',  questions: [4, 5] },
  { label: 'Mortality & Vitality',   questions: [6, 7] },
];

const LIKERT_LABELS = ['', 'Never', 'Rarely', 'Sometimes', 'Often', 'Always'];

export default async function AssessmentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Current responses
  const { data: responses } = await supabase
    .from('existential_responses')
    .select('question_index, response')
    .eq('user_id', user!.id)
    .order('question_index');

  const responseMap: Record<number, number> = {};
  responses?.forEach(r => { responseMap[r.question_index] = r.response; });
  const hasResponses = responses && responses.length > 0;

  // Progress reports (most recent first)
  const { data: progressReports } = await db
    .from('progress_reports')
    .select('period, current_scores, previous_scores, growth_summary, created_at')
    .eq('member_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(6);

  // Most recent snapshot for chart
  const { data: snapshots } = await db
    .from('screener_snapshots')
    .select('responses, month, year')
    .eq('member_id', user!.id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(2);

  const latestReport = progressReports?.[0] || null;

  return (
    <main className="min-h-screen">
      <section className="px-6 pt-32 pb-16 border-b border-[var(--herr-border)]">
        <div className="max-w-[900px] mx-auto">
          <Link href="/dashboard" className="herr-label text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors mb-8 inline-block">
            &larr; Dashboard
          </Link>
          <p className="herr-label text-[var(--herr-pink)] mb-4">My Progress</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-[var(--herr-white)] leading-[0.9] mb-6">
            Existential<br />Assessment.
          </h1>
          <p className="text-[var(--herr-muted)] max-w-xl leading-relaxed">
            Track your existential wellness over time. Your screener resets monthly so you can measure growth.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-[900px] mx-auto">

          {/* Progress chart (if we have history) */}
          {latestReport && (
            <div className="mb-16">
              <p className="herr-label text-[var(--herr-cobalt)] mb-6">Progress Comparison</p>
              <ProgressChart
                current={latestReport.current_scores}
                previous={latestReport.previous_scores && Object.keys(latestReport.previous_scores).length > 0
                  ? latestReport.previous_scores
                  : null}
                growthSummary={latestReport.growth_summary}
              />
            </div>
          )}

          {/* Current responses */}
          {hasResponses ? (
            <>
              <p className="herr-label text-[var(--herr-muted)] mb-6">Current Assessment</p>

              {/* Domain summary bars */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {DOMAINS.map(domain => {
                  const scores = domain.questions.map(q => responseMap[q] ?? 0);
                  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                  const pct = (avg / 5) * 100;

                  return (
                    <div key={domain.label} className="bg-[var(--herr-surface)] border border-[var(--herr-border)] p-6">
                      <p className="text-[var(--herr-white)] font-medium text-sm mb-3">{domain.label}</p>
                      <div className="w-full h-2 bg-[var(--herr-black)] overflow-hidden mb-2">
                        <div
                          className="h-full bg-[var(--herr-pink)] transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[0.75rem] text-[var(--herr-faint)]">
                        Average: {avg.toFixed(1)} / 5
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Individual responses */}
              <p className="herr-label text-[var(--herr-muted)] mb-6">Your Responses</p>
              <div className="space-y-6">
                {QUESTIONS.map((q, idx) => (
                  <div key={idx} className="border-b border-[var(--herr-border)] pb-6">
                    <p className="text-[var(--herr-white)] mb-2 leading-relaxed">
                      <span className="text-[var(--herr-pink)] font-display mr-2">{idx + 1}.</span>
                      {q}
                    </p>
                    <p className="text-[var(--herr-muted)] text-sm">
                      Your response: <span className="text-[var(--herr-white)]">{LIKERT_LABELS[responseMap[idx] ?? 0] || '—'}</span>
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="border border-[var(--herr-border)] border-l-2 border-l-[var(--herr-violet)] p-8">
              <p className="herr-label text-[var(--herr-cobalt)] mb-3">Ready for a Fresh Assessment</p>
              <p className="text-[var(--herr-muted)] leading-relaxed">
                Your screener has been reset for this month. Retake it to update your existential profile
                and generate fresh personalized affirmations.
              </p>
              <Link href="/onboarding" className="btn-herr-primary mt-6 inline-flex">
                Retake Screener
              </Link>
            </div>
          )}

          {/* Past snapshots */}
          {snapshots && snapshots.length > 0 && (
            <div className="mt-16">
              <p className="herr-label text-[var(--herr-muted)] mb-6">Assessment History</p>
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {snapshots.map((snap: any, i: number) => (
                  <div key={i} className="bg-[var(--herr-surface)] border border-[var(--herr-border)] px-6 py-4 flex items-center justify-between">
                    <p className="text-[var(--herr-white)] text-sm">
                      {new Date(snap.year, snap.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-[0.75rem] text-[var(--herr-faint)]">
                      {Object.keys(snap.responses).length} responses archived
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-8 text-[0.72rem] text-[var(--herr-faint)] leading-relaxed">
            This assessment is a wellness screening tool and does not constitute a clinical diagnosis.
            Results are used exclusively to personalize your HERR affirmation protocol.
          </p>
        </div>
      </section>
    </main>
  );
}
