export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';

export default async function BListAdminPage() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from('blist_waitlist')
    .select('*')
    .order('created_at', { ascending: false });

  const items = entries || [];

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-light text-[var(--herr-white)]">
          B-LIST Waitlist
        </h1>
        <span className="herr-label text-[var(--herr-magenta)]">{items.length} signups</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[0.82rem]">
          <thead>
            <tr className="border-b border-[var(--herr-border)] text-[var(--herr-faint)]">
              <th className="text-left py-3 herr-label">Date</th>
              <th className="text-left py-3 herr-label">First Name</th>
              <th className="text-left py-3 herr-label">Email</th>
            </tr>
          </thead>
          <tbody>
            {items.map((entry) => (
              <tr key={entry.id} className="border-b border-[var(--herr-border)]">
                <td className="py-3 text-[var(--herr-muted)]">
                  {new Date(entry.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 text-[var(--herr-white)]">{entry.first_name}</td>
                <td className="py-3 text-[var(--herr-muted)]">{entry.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <p className="text-center text-[var(--herr-muted)] py-12">No signups yet.</p>
      )}
    </div>
  );
}
