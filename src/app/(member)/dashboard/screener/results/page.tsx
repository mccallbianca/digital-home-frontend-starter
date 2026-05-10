import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ResultsClient from './ResultsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your Results | HERR',
  description: 'Your ECQO existential assessment results.',
};

const DOMAINS = ['meaning', 'identity', 'freedom', 'isolation', 'mortality'] as const;

export default async function ResultsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard/screener/results');
  }

  // Get current responses
  const { data: responses } = await supabase
    .from('existential_responses')
    .select('question_index, response')
    .eq('user_id', user.id)
    .order('question_index');

  if (!responses || responses.length === 0) {
    redirect('/dashboard/screener');
  }

  // Calculate domain scores (3 questions per domain, mapped by index)
  const domainScores: Record<string, { total: number; count: number; avg: number }> = {};
  for (const domain of DOMAINS) {
    domainScores[domain] = { total: 0, count: 0, avg: 0 };
  }

  for (const r of responses) {
    const domain = DOMAINS[Math.floor(r.question_index / 3)];
    if (domainScores[domain]) {
      domainScores[domain].total += r.response;
      domainScores[domain].count += 1;
    }
  }

  let overallTotal = 0;
  let overallCount = 0;
  for (const domain of DOMAINS) {
    const d = domainScores[domain];
    d.avg = d.count > 0 ? d.total / d.count : 0;
    overallTotal += d.total;
    overallCount += d.count;
  }

  const overallAvg = overallCount > 0 ? overallTotal / overallCount : 0;

  // Get user preferences to check if modes are set
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('activity_modes')
    .eq('user_id', user.id)
    .single();

  const hasModes = prefs?.activity_modes && prefs.activity_modes.length > 0;

  // Get historical assessments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: snapshots } = await (supabase as any)
    .from('screener_snapshots')
    .select('responses, month, year')
    .eq('member_id', user.id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(5);

  const scores = DOMAINS.map(d => ({
    domain: d,
    avg: Math.round(domainScores[d].avg * 10) / 10,
  }));

  return (
    <ResultsClient
      overallAvg={Math.round(overallAvg * 10) / 10}
      scores={scores}
      hasModes={!!hasModes}
      snapshots={snapshots ?? []}
    />
  );
}
