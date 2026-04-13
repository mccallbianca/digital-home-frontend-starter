export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';

export default async function AdminSessionsPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: sessions } = await db
    .from('live_sessions')
    .select('id, title, scheduled_at, duration_minutes, capacity, status')
    .order('scheduled_at', { ascending: false })
    .limit(20);

  // Get registration counts and survey stats per session
  const sessionsWithStats = [];
  for (const s of (sessions || [])) {
    const { count: regCount } = await db
      .from('live_session_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', s.id);

    const { count: surveyCount } = await db
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', s.id);

    sessionsWithStats.push({
      ...s,
      registrations: regCount || 0,
      surveys: surveyCount || 0,
    });
  }

  return (
    <main className="px-6 py-10 max-w-[900px]">
      <p className="herr-label text-[var(--herr-cobalt)] mb-2">Sessions</p>
      <h1 className="font-display text-3xl font-light text-[var(--herr-white)] mb-8">
        Live Sessions
      </h1>

      {sessionsWithStats.length > 0 ? (
        <div className="space-y-px">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {sessionsWithStats.map((s: any) => (
            <div key={s.id} className="bg-[var(--herr-surface)] px-6 py-5 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[var(--herr-white)] text-sm font-medium">{s.title}</p>
                <p className="text-[0.75rem] text-[var(--herr-faint)]">
                  {new Date(s.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {' '}at{' '}
                  {new Date(s.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
              <div className="flex gap-6 shrink-0 text-[0.78rem]">
                <div className="text-center">
                  <p className="text-[var(--herr-white)]">{s.registrations}/{s.capacity}</p>
                  <p className="text-[0.65rem] text-[var(--herr-faint)]">Registered</p>
                </div>
                <div className="text-center">
                  <p className="text-[var(--herr-cobalt)]">{s.surveys}</p>
                  <p className="text-[0.65rem] text-[var(--herr-faint)]">Surveys</p>
                </div>
                <div>
                  <span className={`herr-label text-[0.65rem] ${s.status === 'upcoming' ? 'text-[var(--herr-cobalt)]' : s.status === 'completed' ? 'text-[var(--herr-muted)]' : 'text-[var(--herr-pink)]'}`}>
                    {s.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[var(--herr-faint)] text-sm">No sessions created yet.</p>
      )}
    </main>
  );
}
