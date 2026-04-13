import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminNav from './AdminNav';

export const metadata: Metadata = { title: 'Admin | HERR' };

const ADMIN_EMAILS = ['bianca@h3rr.com', 'bdmccall@gmail.com', 'mccall.bianca@gmail.com'];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    redirect('/login?redirect=/admin');
  }

  return (
    <div className="min-h-screen flex">
      <AdminNav />
      <div className="flex-1 ml-0 md:ml-52">
        {children}
      </div>
    </div>
  );
}
