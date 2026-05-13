export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BetaTestersClient, { type Report } from './BetaTestersClient';

export default async function BetaTestersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  let isTester = false;
  try {
    const { data: profile } = await db
      .from('profiles')
      .select('is_tester')
      .eq('id', user.id)
      .maybeSingle();
    isTester = profile?.is_tester === true;
  } catch {
    // pre-migration: column missing
  }
  if (!isTester) redirect('/dashboard');

  let reports: Report[] = [];
  try {
    const { data: rows } = await db
      .from('beta_tester_reports')
      .select('id, category, severity, title, description, url, screenshot_url, status, admin_response, created_at')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false });
    reports = (rows ?? []) as Report[];
  } catch {
    // table not yet migrated
  }

  return <BetaTestersClient userId={user.id} reports={reports} />;
}
