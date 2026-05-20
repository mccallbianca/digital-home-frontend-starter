/**
 * /admin/wave-1
 *
 * Tester Wave 1 email campaign admin. Distinct from /admin/testers
 * which lists already-signed-up testers from `profiles.is_tester`.
 * This page manages the pre-signup invite list in `beta_testers`.
 */

export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/server';
import WaveOneClient from './WaveOneClient';

export type BetaTesterRow = {
  id: string;
  email: string;
  full_name: string | null;
  signup_source: string | null;
  invited_at: string | null;
  welcome_email_sent_at: string | null;
  signed_up_at: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export default async function WaveOnePage() {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const { data: testers, error } = await db
    .from('beta_testers')
    .select('id, email, full_name, signup_source, invited_at, welcome_email_sent_at, signed_up_at, status, notes, created_at')
    .order('created_at', { ascending: false });

  // Counts for the header
  const rows = (testers ?? []) as BetaTesterRow[];
  const counts = {
    total: rows.length,
    invited: rows.filter((r) => r.status === 'invited').length,
    welcomed: rows.filter((r) => r.status === 'welcomed').length,
    signed_up: rows.filter((r) => r.status === 'signed_up' || r.status === 'active').length,
    churned: rows.filter((r) => r.status === 'churned').length,
    pending_send: rows.filter((r) => !r.welcome_email_sent_at).length,
  };

  return (
    <main className="px-6 py-10 max-w-[1200px]">
      <p className="herr-label text-[var(--herr-cobalt)] mb-2">Campaign</p>
      <h1 className="font-display text-3xl font-light text-[var(--herr-ink)] mb-2">
        Tester Wave 1
      </h1>
      <p className="text-[var(--herr-ink-soft,#5a5a5a)] text-sm mb-8" style={{ maxWidth: 620 }}>
        Pre-signup invite list. Add testers, fire the Wave 1 welcome batch, and watch them convert.
        Distinct from <a href="/admin/testers" style={{ color: 'var(--herr-cobalt,#1a4789)', textDecoration: 'underline' }}>/admin/testers</a> (active testers).
      </p>

      {error && (
        <div style={{ background: '#fbdada', color: '#8a1c1c', padding: 12, borderRadius: 4, marginBottom: 16, fontSize: 13 }}>
          Query error: {error.message}
        </div>
      )}

      <WaveOneClient initialTesters={rows} counts={counts} />
    </main>
  );
}
