import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import VoiceUploader from './VoiceUploader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Voice — HERR',
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
      <section className="px-6 pt-32 pb-16 border-b border-[var(--herr-border)]">
        <div className="max-w-[900px] mx-auto">
          <Link href="/dashboard" className="herr-label text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors mb-8 inline-block">
            ← Dashboard
          </Link>
          <p className="herr-label text-[var(--herr-pink)] mb-4">Personalized + Elite</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-[var(--herr-white)] leading-[0.9] mb-6">
            My Voice.
          </h1>
          <p className="text-[var(--herr-muted)] max-w-xl leading-relaxed">
            Your voice is the instrument. The subconscious trusts it above all others.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-[900px] mx-auto">
          {/* Status cards */}
          <div className="grid md:grid-cols-2 gap-px bg-[var(--herr-border)] mb-12">
            <div className="bg-[var(--herr-black)] p-8">
              <p className="herr-label text-[var(--herr-muted)] mb-2">Voice Clone Status</p>
              <p className={`font-display text-2xl font-light mb-2 ${hasFile ? 'text-[var(--herr-cobalt)]' : 'text-[var(--herr-pink)]'}`}>
                {hasFile ? 'Sample Uploaded' : 'Pending'}
              </p>
              <p className="text-[0.8rem] text-[var(--herr-faint)]">
                {hasFile ? 'Your voice sample is being processed.' : 'Upload a voice sample to begin.'}
              </p>
            </div>
            <div className="bg-[var(--herr-black)] p-8">
              <p className="herr-label text-[var(--herr-muted)] mb-2">Consent</p>
              <p className={`font-display text-2xl font-light mb-2 ${hasConsent ? 'text-[var(--herr-cobalt)]' : 'text-[var(--herr-faint)]'}`}>
                {hasConsent ? 'Confirmed' : 'Not yet provided'}
              </p>
              <p className="text-[0.8rem] text-[var(--herr-faint)]">
                {hasConsent
                  ? `Consented on ${new Date(consent!.consented_at!).toLocaleDateString()}`
                  : 'Consent is required before voice cloning.'
                }
              </p>
            </div>
          </div>

          {/* Re-upload section */}
          <div className="border border-[var(--herr-border)] p-8">
            <p className="herr-label text-[var(--herr-muted)] mb-4">
              {hasFile ? 'Re-upload Voice Sample' : 'Upload Voice Sample'}
            </p>
            <VoiceUploader userId={user!.id} hasExisting={hasFile} />
          </div>

          {/* Privacy notice */}
          <div className="mt-8 p-6 border border-[var(--herr-border)] bg-[var(--herr-surface)]">
            <p className="text-[0.8rem] text-[var(--herr-faint)] leading-relaxed">
              Your voice recordings are encrypted, stored securely, and used exclusively to generate
              your personal affirmations. We never share, sell, or use your voice for any other purpose.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
