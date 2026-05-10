import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import VoiceUploader from './VoiceUploader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Voice | HERR',
  description: 'Manage your cloned voice and recording sessions.',
};

export default async function VoicePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: consent } = await supabase
    .from('voice_consents')
    .select('*')
    .eq('user_id', user!.id)
    .single();

  const hasConsent = !!consent?.consented_at;
  const hasFile = !!consent?.file_path;

  return (
    <main className="min-h-screen">
      <section className="px-6 pt-32 pb-16 border-b border-[rgba(26,15,26,0.08)]" style={{ background: 'var(--herr-cream)' }}>
        <div className="max-w-[900px] mx-auto">
          <Link href="/dashboard" className="herr-label text-[rgba(26,15,26,0.6)] hover:text-[var(--herr-ink)] transition-colors mb-8 inline-block">
            ← Dashboard
          </Link>
          <p className="herr-label text-[var(--herr-magenta)] mb-4">Personalized + Elite</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-[var(--herr-ink)] leading-[0.9] mb-6">
            My Voice.
          </h1>
          <p className="text-[rgba(26,15,26,0.6)] max-w-xl leading-relaxed">
            Your voice is the instrument. The subconscious trusts it above all others.
          </p>
        </div>
      </section>

      <section className="px-6 py-16" style={{ background: 'var(--herr-cream)' }}>
        <div className="max-w-[900px] mx-auto">
          {/* Status cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="p-8 rounded" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p className="herr-label mb-2" style={{ color: '#666666' }}>Voice Clone Status</p>
              <p className={`font-display text-2xl font-light mb-2 ${hasFile ? 'text-[var(--herr-magenta)]' : 'text-[var(--herr-magenta)]'}`}>
                {hasFile ? 'Sample Uploaded' : 'Pending'}
              </p>
              <p className="text-[0.8rem]" style={{ color: '#999999' }}>
                {hasFile ? 'Your voice sample is being processed.' : 'Upload a voice sample to begin.'}
              </p>
            </div>
            <div className="p-8 rounded" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p className="herr-label mb-2" style={{ color: '#666666' }}>Consent</p>
              <p className={`font-display text-2xl font-light mb-2 ${hasConsent ? 'text-[var(--herr-magenta)]' : 'text-[rgba(26,15,26,0.4)]'}`}>
                {hasConsent ? 'Confirmed' : 'Not yet provided'}
              </p>
              <p className="text-[0.8rem]" style={{ color: '#999999' }}>
                {hasConsent
                  ? `Consented on ${new Date(consent!.consented_at!).toLocaleDateString()}`
                  : 'Consent is required before voice cloning.'
                }
              </p>
            </div>
          </div>

          {/* Re-upload section */}
          <div className="p-8 rounded" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p className="herr-label mb-4" style={{ color: '#666666' }}>
              {hasFile ? 'Re-upload Voice Sample' : 'Upload Voice Sample'}
            </p>
            <VoiceUploader userId={user!.id} hasExisting={hasFile} />
          </div>

          {/* Privacy notice */}
          <div className="mt-8 p-6 rounded" style={{ background: '#F4F1EB' }}>
            <p className="text-[0.8rem] leading-relaxed" style={{ color: '#999999' }}>
              Your voice recordings are encrypted, stored securely, and used exclusively to generate
              your personal affirmations. We never share, sell, or use your voice for any other purpose.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
