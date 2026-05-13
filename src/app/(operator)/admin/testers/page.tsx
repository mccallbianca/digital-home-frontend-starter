export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import TestersClient from './TestersClient';

type Tester = {
  id: string;
  email: string | null;
  first_name: string | null;
  preferred_name: string | null;
  created_at: string | null;
};

type InviteCode = {
  code: string;
  created_at: string;
  used_at: string | null;
};

export default async function AdminTestersPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let testers: Tester[] = [];
  let unusedCodes: InviteCode[] = [];

  try {
    const { data: testerRows } = await db
      .from('profiles')
      .select('id, email, first_name, preferred_name, created_at')
      .eq('is_tester', true)
      .order('created_at', { ascending: false });
    testers = (testerRows ?? []) as Tester[];
  } catch {
    // is_tester / profiles.email may not exist yet (pre-migration)
  }

  try {
    const { data: codeRows } = await db
      .from('tester_invite_codes')
      .select('code, created_at, used_at')
      .is('used_at', null)
      .order('created_at', { ascending: false });
    unusedCodes = (codeRows ?? []) as InviteCode[];
  } catch {
    // table may not exist yet
  }

  return <TestersClient testers={testers} unusedCodes={unusedCodes} />;
}
