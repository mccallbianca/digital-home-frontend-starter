import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AffirmationsClient from './AffirmationsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Affirmations | HERR',
  description: 'Your daily personalized affirmations.',
};

export default async function AffirmationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/dashboard/affirmations');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('plan, is_tester')
    .eq('id', user.id)
    .single();

  const plan = (profile?.plan ?? 'free') as 'free' | 'collective' | 'personalized' | 'elite';
  const isTester = profile?.is_tester === true;

  // Free users see tier gate (themed cream/ink/magenta per Phase 1 v2 portal palette).
  // Block 5 Task 2c: testers always pass — they have Founding Tester access.
  if (plan === 'free' && !isTester) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--herr-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--herr-magenta)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block' }}>
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, color: 'var(--herr-ink)', marginBottom: 8 }}>Unlock Daily Affirmations</h1>
          <p style={{ fontSize: 15, color: 'var(--herr-ink-soft)', lineHeight: 1.6, marginBottom: 24 }}>
            Upgrade to HERR Collective to receive daily affirmations in Bianca&apos;s voice,
            or HERR Personalized to hear them in your own.
          </p>
          <a href="/checkout" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 48, padding: '0 32px', background: 'var(--herr-magenta)', color: 'var(--herr-cream)', borderRadius: 12, fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>
            Upgrade Now
          </a>
        </div>
      </div>
    );
  }

  // Phase 1 v2 EPIC B2: read activity modes from member_activity_modes; fall back
  // to user_preferences.activity_modes for legacy onboarded members.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: modeRows } = await (supabase as any)
    .from('member_activity_modes')
    .select('mode')
    .eq('member_id', user.id)
    .eq('active', true);

  let selectedModes: string[] = (modeRows ?? []).map((r: { mode: string }) => r.mode);

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('activity_modes, genre_preference')
    .eq('user_id', user.id)
    .single();

  if (selectedModes.length === 0) {
    selectedModes = (prefs?.activity_modes ?? ['morning']) as string[];
  }
  const selectedGenre = (prefs as { genre_preference?: string } | null)?.genre_preference ?? 'Hip Hop';

  // FIX-3 A2 — re-point to B5.x stack.
  //
  // Resolution order:
  //   1. PRIMARY  user_daily_deliveries (status ready|delivered) — the
  //                personalized 3-layer mix produced by the daily cron.
  //   2. FALLBACK affirmation_template_library (5 random voice_rendered)
  //                with caption "Sample affirmations — your personalized
  //                daily delivery begins tomorrow morning."
  //   3. LEGACY   affirmation_scripts — only shown when neither primary
  //                nor fallback returns anything (true bootstrap users).
  //
  // The Track shape downstream (AffirmationsClient) is preserved; we just
  // map each source into it on the server so the client stays unchanged.

  // ── Look up user's cultural routing for the template fallback filter.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: anchors } = await (supabase as any)
    .from('user_identity_anchors')
    .select('cultural_routing')
    .eq('user_id', user.id)
    .maybeSingle();
  const culturalRouting = (anchors?.cultural_routing as string | undefined) ?? 'default';

  // ── Source 1: user_daily_deliveries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: deliveries } = await (supabase as any)
    .from('user_daily_deliveries')
    .select('id, activity_mode, existential_domain_targeted, final_mix_url, final_mix_storage_path, delivery_date, status, voice_source')
    .eq('user_id', user.id)
    .in('status', ['ready', 'delivered'])
    .order('delivery_date', { ascending: false })
    .limit(30);

  type DailyRow = {
    id: string;
    activity_mode: string;
    existential_domain_targeted: string;
    final_mix_url: string | null;
    final_mix_storage_path: string | null;
    delivery_date: string;
    status: string;
    voice_source: string;
  };

  // Re-sign stored mix URLs in parallel so members always get a working
  // play link (stored sign URL expires in 48h; the row may outlive it).
  const deliveryTracks: Array<{
    id: string;
    script: string;
    activity_mode: string;
    audio_url: string | null;
    generated_at: string;
    delivered: boolean;
    source: 'daily';
  }> = await Promise.all(
    ((deliveries ?? []) as DailyRow[]).map(async (d) => {
      let audioUrl = d.final_mix_url;
      if (d.final_mix_storage_path) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: signed } = await (supabase as any).storage
          .from('affirmations-daily-mixes')
          .createSignedUrl(d.final_mix_storage_path, 60 * 60 * 24);
        if (signed?.signedUrl) audioUrl = signed.signedUrl;
      }
      const voiceLabel = d.voice_source === 'user_clone' ? 'your voice' : "Bianca's voice";
      return {
        id: d.id,
        script: `Today's anchor — ${d.existential_domain_targeted} (mode: ${d.activity_mode}, ${voiceLabel}).`,
        activity_mode: d.activity_mode,
        audio_url: audioUrl,
        generated_at: `${d.delivery_date}T07:00:00.000Z`,
        delivered: d.status === 'delivered',
        source: 'daily' as const,
      };
    }),
  );

  // ── Source 2: template-library samples (when source 1 is empty).
  let sampleTracks: Array<{
    id: string;
    script: string;
    activity_mode: string;
    audio_url: string | null;
    generated_at: string;
    delivered: boolean;
    source: 'sample';
  }> = [];

  if (deliveryTracks.length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: samples } = await (supabase as any)
      .from('affirmation_template_library')
      .select('id, activity_mode, existential_domain, full_template_text, fallback_slot_values, bianca_audio_url')
      .not('bianca_audio_url', 'is', null)
      .eq('status', 'voice_rendered')
      .eq('risk_tier', 'low_concern')
      .in('cultural_routing', [culturalRouting, 'default'])
      .limit(20);
    type TplRow = {
      id: string;
      activity_mode: string;
      existential_domain: string;
      full_template_text: string;
      fallback_slot_values: Record<string, string> | null;
      bianca_audio_url: string;
    };
    const all = ((samples ?? []) as TplRow[]).slice();
    // Lightweight shuffle, take 5.
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    sampleTracks = all.slice(0, 5).map((t) => {
      const fb = t.fallback_slot_values ?? {};
      const rendered = (t.full_template_text || '').replace(/\{([a-z_0-9]+)\}/gi, (_, k: string) =>
        fb[k] != null ? fb[k] : `{${k}}`,
      );
      return {
        id: t.id,
        script: rendered,
        activity_mode: t.activity_mode,
        audio_url: t.bianca_audio_url,
        generated_at: new Date().toISOString(),
        delivered: false,
        source: 'sample' as const,
      };
    });
  }

  // ── Source 3: legacy affirmation_scripts (only if 1 + 2 both empty).
  let legacyTracks: Array<{
    id: string;
    script: string;
    activity_mode: string;
    audio_url: string | null;
    generated_at: string;
    delivered: boolean;
    source: 'legacy';
  }> = [];

  if (deliveryTracks.length === 0 && sampleTracks.length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: legacy } = await (supabase as any)
      .from('affirmation_scripts')
      .select('id, script, activity_mode, audio_url, generated_at, delivered')
      .eq('member_id', user.id)
      .is('deleted_at', null)
      .order('generated_at', { ascending: false })
      .limit(30);
    legacyTracks = (legacy ?? []).map((t: { id: string; script: string; activity_mode: string; audio_url: string | null; generated_at: string; delivered: boolean }) => ({
      ...t,
      source: 'legacy' as const,
    }));
  }

  const tracks = [...deliveryTracks, ...sampleTracks, ...legacyTracks];
  const trackSource: 'daily' | 'sample' | 'legacy' | 'empty' =
    deliveryTracks.length > 0 ? 'daily'
      : sampleTracks.length > 0 ? 'sample'
      : legacyTracks.length > 0 ? 'legacy'
      : 'empty';

  // Personalized + Elite tier: fetch data for the inline ECQOSoundPlayer.
  const isLayered = plan === 'personalized' || plan === 'elite';
  let latestAffirmation = null;
  let soundTracks: unknown[] = [];

  if (isLayered) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: latest } = await (supabase as any)
      .from('affirmation_scripts')
      .select('id, script, activity_mode, audio_url, generated_at')
      .eq('member_id', user.id)
      .is('deleted_at', null)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    latestAffirmation = latest;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: catalog } = await (supabase as any)
      .from('track_catalog')
      .select('id, genre, activity_mode, title, audio_url, stem_url, clinical_label, duration_seconds')
      .eq('genre', selectedGenre)
      .eq('is_published', true)
      .order('activity_mode');
    soundTracks = catalog ?? [];
  }

  return (
    <AffirmationsClient
      userId={user.id}
      plan={plan as 'collective' | 'personalized' | 'elite'}
      selectedModes={selectedModes}
      tracks={tracks}
      trackSource={trackSource}
      genre={selectedGenre}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      latestAffirmation={latestAffirmation as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      soundTracks={soundTracks as any}
    />
  );
}
