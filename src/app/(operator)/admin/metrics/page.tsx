export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';

export default async function AdminMetricsPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Fetch all stats in parallel
  const [
    membersRes,
    sessionsRes,
    surveysRes,
    postsRes,
    threadsRes,
    testimonialsRes,
    betaRes,
    visitorsRes,
  ] = await Promise.all([
    db.from('members').select('tier, status', { count: 'exact' }),
    db.from('live_sessions').select('id', { count: 'exact' }),
    db.from('survey_responses').select('rating'),
    db.from('community_posts').select('id', { count: 'exact' }),
    db.from('community_threads').select('id', { count: 'exact' }),
    db.from('testimonials').select('status'),
    db.from('beta_lab_submissions').select('status'),
    supabase.from('visitors').select('id', { count: 'exact' }),
  ]);

  const members = membersRes.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const active = members.filter((m: any) => m.status === 'active');
  const byTier = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collective: active.filter((m: any) => m.tier === 'collective').length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    personalized: active.filter((m: any) => m.tier === 'personalized').length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    elite: active.filter((m: any) => m.tier === 'elite').length,
  };
  const mrr = byTier.collective * 9 + byTier.personalized * 19 + byTier.elite * 29;

  const surveys = surveysRes.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ratingsOnly = surveys.filter((s: any) => s.rating);
  const avgRating = ratingsOnly.length > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (surveys.reduce((sum: number, s: any) => sum + (s.rating || 0), 0) / ratingsOnly.length).toFixed(1)
    : '-';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const testimonials = (testimonialsRes.data ?? []) as any[];
  const approvedTestimonials = testimonials.filter(t => t.status === 'approved').length;

  const betaSubs = betaRes.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const approvedBeta = betaSubs.filter((b: any) => b.status === 'approved').length;

  const kpis = [
    { label: 'Active Members', value: active.length, color: 'text-[var(--herr-white)]' },
    { label: 'MRR', value: `$${mrr.toLocaleString()}`, color: 'text-[var(--herr-cobalt)]' },
    { label: 'Total Visitors', value: visitorsRes.count ?? visitorsRes.data?.length ?? 0, color: 'text-[var(--herr-muted)]' },
    { label: 'Community Posts', value: postsRes.count ?? postsRes.data?.length ?? 0, color: 'text-[var(--herr-white)]' },
    { label: 'Community Threads', value: threadsRes.count ?? threadsRes.data?.length ?? 0, color: 'text-[var(--herr-muted)]' },
    { label: 'Live Sessions', value: sessionsRes.count ?? sessionsRes.data?.length ?? 0, color: 'text-[var(--herr-cobalt)]' },
    { label: 'Avg Session Rating', value: avgRating, color: 'text-[var(--herr-pink)]' },
    { label: 'Survey Responses', value: surveys.length, color: 'text-[var(--herr-muted)]' },
    { label: 'Testimonials (Approved)', value: approvedTestimonials, color: 'text-[var(--herr-cobalt)]' },
    { label: 'Beta Testers', value: approvedBeta, color: 'text-[var(--herr-pink)]' },
  ];

  return (
    <main className="px-6 py-10 max-w-[1000px]">
      <p className="herr-label text-[var(--herr-cobalt)] mb-2">Metrics</p>
      <h1 className="font-display text-3xl font-light text-[var(--herr-white)] mb-8">
        Platform Metrics
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-[var(--herr-border)]">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-[var(--herr-black)] p-5">
            <p className="herr-label text-[var(--herr-faint)] mb-2 text-[0.65rem]">{kpi.label}</p>
            <p className={`font-display text-2xl font-light ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Tier Breakdown */}
      <section className="mt-10">
        <p className="herr-label text-[var(--herr-muted)] mb-4">Revenue by Tier</p>
        <div className="grid md:grid-cols-3 gap-px bg-[var(--herr-border)]">
          {[
            { tier: 'Collective', count: byTier.collective, price: 9, color: 'text-[var(--herr-muted)]' },
            { tier: 'Personalized', count: byTier.personalized, price: 19, color: 'text-[var(--herr-cobalt)]' },
            { tier: 'Elite', count: byTier.elite, price: 29, color: 'text-[var(--herr-pink)]' },
          ].map(row => (
            <div key={row.tier} className="bg-[var(--herr-surface)] p-6">
              <p className={`herr-label mb-1 ${row.color}`}>{row.tier} &mdash; ${row.price}/mo</p>
              <p className="font-display text-3xl font-light text-[var(--herr-white)]">{row.count}</p>
              <p className="text-[0.75rem] text-[var(--herr-faint)] mt-1">
                ${(row.count * row.price).toLocaleString()}/mo
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
