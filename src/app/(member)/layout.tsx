import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MemberNav, { type MemberPlan } from '@/components/layout/MemberNav';

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, onboarding_complete, preferred_name, first_name')
    .eq('id', user.id)
    .single();

  if (profile && !profile.onboarding_complete) redirect('/onboarding');

  // Canonical tier source = profile.plan, null treated as 'free'.
  const plan = ((profile?.plan ?? 'free') as MemberPlan);
  const displayName = profile?.preferred_name || profile?.first_name || 'Member';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--herr-cream)', color: 'var(--herr-ink)' }}>
      <MemberNav plan={plan} displayName={displayName} />
      <main className="md:ml-60" style={{ minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
