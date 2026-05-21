/**
 * /admin/live-sessions
 *
 * Lists upcoming live_sessions with inline Zoom URL editor.
 * Bianca uses this to replace the PLACEHOLDER seed values before
 * each session.
 */

export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/server';
import LiveSessionsClient from './LiveSessionsClient';

export type LiveSessionRow = {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number | null;
  capacity: number | null;
  zoom_meeting_id: string | null;
  zoom_join_url: string | null;
  zoom_start_url: string | null;
  host_notes: string | null;
  status: string | null;
};

export default async function AdminLiveSessionsPage() {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const { data: sessions, error } = await db
    .from('live_sessions')
    .select('id, title, description, scheduled_at, duration_minutes, capacity, zoom_meeting_id, zoom_join_url, zoom_start_url, host_notes, status')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true });

  const rows = (sessions ?? []) as LiveSessionRow[];
  const needsZoom = rows.filter((r) => !r.zoom_join_url || r.zoom_join_url.includes('PLACEHOLDER')).length;

  return (
    <main className="px-6 py-10 max-w-[1100px]">
      <p className="herr-label text-[var(--herr-cobalt)] mb-2">Operations</p>
      <h1 className="font-display text-3xl font-light text-[var(--herr-ink)] mb-2">
        Live Sessions
      </h1>
      <p className="text-[var(--herr-ink-soft,#5a5a5a)] text-sm mb-8" style={{ maxWidth: 620 }}>
        Upcoming monthly sessions. {needsZoom > 0
          ? <strong style={{ color: '#8a1c1c' }}>{needsZoom} session{needsZoom === 1 ? '' : 's'} still need a real Zoom URL.</strong>
          : 'All sessions have Zoom URLs configured.'}
      </p>

      {error && (
        <div style={{ background: '#fbdada', color: '#8a1c1c', padding: 12, borderRadius: 4, marginBottom: 16, fontSize: 13 }}>
          Query error: {error.message}
        </div>
      )}

      <LiveSessionsClient initialSessions={rows} />
    </main>
  );
}
