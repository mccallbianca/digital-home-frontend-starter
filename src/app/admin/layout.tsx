import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminNav from '@/components/layout/AdminNav';

export const metadata: Metadata = { title: 'Admin | HERR' };

const ADMIN_EMAILS = ['bianca@h3rr.com', 'bdmccall@gmail.com', 'mccall.bianca@gmail.com'];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    redirect('/login?redirect=/admin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('preferred_name, first_name')
    .eq('id', user.id)
    .single();

  const displayName = profile?.preferred_name || profile?.first_name || (user.email ?? 'Admin');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--herr-cream)', color: 'var(--herr-ink)' }}>
      <AdminNav displayName={displayName} />
      <main className="md:ml-60" style={{ minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
