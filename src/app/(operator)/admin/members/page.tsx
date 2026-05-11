export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';

export default async function AdminMembersPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: members } = await db
    .from('members')
    .select('id, email, name, tier, status, subscribed_at, period_end, onboarded, beta_tester, community_paused')
    .order('subscribed_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all = (members ?? []) as any[];
  const active = all.filter(m => m.status === 'active');
  const pastDue = all.filter(m => m.status === 'past_due');

  const tierColors: Record<string, string> = {
    collective: 'text-[var(--herr-muted)]',
    personalized: 'text-[var(--herr-cobalt)]',
    elite: 'text-[var(--herr-pink)]',
  };

  const statusColors: Record<string, string> = {
    active: 'text-[var(--herr-cobalt)]',
    past_due: 'text-yellow-400',
    cancelled: 'text-[var(--herr-muted)]',
    trialing: 'text-[var(--herr-pink)]',
  };

  return (
    <main className="px-6 py-10 max-w-[1100px]">
      <p className="herr-label text-[var(--herr-cobalt)] mb-2">Members</p>
      <h1 className="font-display text-3xl font-light text-[var(--herr-white)] mb-2">
        Members Management
      </h1>
      <p className="text-[var(--herr-muted)] text-sm mb-8">
        {all.length} total &middot; {active.length} active &middot; {pastDue.length} past due
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--herr-border)]">
              {['Name / Email', 'Tier', 'Status', 'Onboarded', 'Beta', 'Subscribed'].map(h => (
                <th key={h} className="herr-label text-[var(--herr-muted)] text-left py-3 pr-6">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {all.map((m: any) => (
              <tr key={m.id} className="border-b border-[var(--herr-border)] hover:bg-[var(--herr-surface)] transition-colors">
                <td className="py-3 pr-6">
                  <p className="text-[var(--herr-white)]">{m.name || '-'}</p>
                  <p className="text-[0.72rem] text-[var(--herr-faint)]">{m.email}</p>
                </td>
                <td className={`py-3 pr-6 herr-label capitalize ${tierColors[m.tier] ?? ''}`}>
                  {m.tier}
                </td>
                <td className={`py-3 pr-6 herr-label capitalize ${statusColors[m.status] ?? ''}`}>
                  {(m.status || '').replace('_', ' ')}
                </td>
                <td className="py-3 pr-6">
                  <span className={m.onboarded ? 'text-[var(--herr-cobalt)]' : 'text-[var(--herr-faint)]'}>
                    {m.onboarded ? 'Yes' : 'Pending'}
                  </span>
                </td>
                <td className="py-3 pr-6">
                  {m.beta_tester ? (
                    <span className="text-[var(--herr-pink)] text-[0.72rem]">Beta</span>
                  ) : (
                    <span className="text-[var(--herr-faint)]">-</span>
                  )}
                </td>
                <td className="py-3 pr-6 text-[var(--herr-faint)]">
                  {m.subscribed_at ? new Date(m.subscribed_at).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
            {all.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-[var(--herr-faint)]">No members yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
