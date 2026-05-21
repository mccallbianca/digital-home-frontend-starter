import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MemberNav, { type MemberPlan } from '@/components/layout/MemberNav';

const ADMIN_EMAILS = ['bianca@h3rr.com', 'bdmccall@gmail.com', 'mccall.bianca@gmail.com'];

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('plan, onboarding_complete, preferred_name, first_name, is_tester')
    .eq('id', user.id)
    .single();

  if (profile && !profile.onboarding_complete) redirect('/onboarding');

  // Canonical tier source = profile.plan, null treated as 'free'.
  const plan = ((profile?.plan ?? 'free') as MemberPlan);
  const displayName = profile?.preferred_name || profile?.first_name || 'Member';
  const isTester = profile?.is_tester === true;
  const isAdmin  = ADMIN_EMAILS.includes(user.email ?? '');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--herr-cream)', color: 'var(--herr-ink)' }}>
      <MemberNav plan={plan} displayName={displayName} isTester={isTester} isAdmin={isAdmin} />
      <main className="md:ml-60" style={{ minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
