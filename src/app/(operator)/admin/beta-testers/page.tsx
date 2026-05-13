export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import AdminBetaTestersClient, { type AdminReport } from './AdminBetaTestersClient';

export default async function AdminBetaTestersPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let reports: AdminReport[] = [];
  try {
    const { data: rows } = await db
      .from('beta_tester_reports')
      .select(`
        id, member_id, category, severity, title, description,
        url, screenshot_url, status, admin_response, created_at,
        profiles:member_id (preferred_name, first_name, email)
      `)
      .order('created_at', { ascending: false });
    reports = (rows ?? []).map((r: Record<string, unknown>) => {
      const profile = r.profiles as { preferred_name?: string; first_name?: string; email?: string } | null;
      const memberName =
        profile?.preferred_name || profile?.first_name || profile?.email || String(r.member_id).slice(0, 8);
      return { ...r, member_name: memberName } as AdminReport;
    });
  } catch {
    // table not yet migrated
  }

  return <AdminBetaTestersClient reports={reports} />;
}
