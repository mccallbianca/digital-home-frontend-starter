import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import HERRNation from './HERRNation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'HERR Nation | Community',
  description: 'HERR Nation | the community for every human doing the reprogramming work.',
};

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('preferred_name, first_name, plan, community_acknowledged')
    .eq('id', user!.id)
    .single();

  const displayName = profile?.preferred_name || profile?.first_name || 'HERR Member';
  const userTier = profile?.plan || 'collective';
  const acknowledged = !!profile?.community_acknowledged;

  return (
    <main className="min-h-screen">
      <section className="px-6 pt-32 pb-8 border-b border-[var(--herr-border)]">
        <div className="max-w-[1200px] mx-auto">
          <Link href="/dashboard" className="herr-label text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors mb-8 inline-block">
            &larr; Dashboard
          </Link>
          <p className="herr-label text-[var(--herr-muted)] mb-4">All tiers</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] leading-[0.9] mb-4">
            HERR Nation.
          </h1>
          <p className="text-[var(--herr-muted)] max-w-xl leading-relaxed">
            Every version of HERR. Every human doing the work. One community.
          </p>
        </div>
      </section>

      <section className="px-6 py-4" style={{ background: '#FAF8F5' }}>
        <div className="max-w-[1200px] mx-auto">
          <HERRNation
            userId={user!.id}
            displayName={displayName}
            userTier={userTier}
            acknowledged={acknowledged}
          />
        </div>
      </section>
    </main>
  );
}
