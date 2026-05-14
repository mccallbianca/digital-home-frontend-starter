import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  // Check onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', user.id)
    .single();

  if (profile && !profile.onboarding_complete) {
    redirect('/onboarding');
  }

  return (
    <>
      {children}
      <PWAInstallPrompt />
    </>
  );
}
