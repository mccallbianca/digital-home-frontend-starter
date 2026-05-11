export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import BetaLabAdmin from './BetaLabAdmin';

export default async function AdminBetaLabPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: submissions } = await db
    .from('beta_lab_submissions')
    .select('id, member_id, name, email, reason, status, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: betaMembers } = await db
    .from('members')
    .select('id, email, name, beta_tester')
    .eq('beta_tester', true);

  return (
    <main className="px-6 py-10 max-w-[900px]">
      <p className="herr-label text-[var(--herr-cobalt)] mb-2">Beta Lab</p>
      <h1 className="font-display text-3xl font-light text-[var(--herr-white)] mb-2">
        Beta Testers Lab
      </h1>
      <p className="text-[var(--herr-muted)] text-sm mb-8">
        Review interest forms and manage beta testers.
      </p>
      <BetaLabAdmin submissions={submissions ?? []} betaMembers={betaMembers ?? []} />
    </main>
  );
}
