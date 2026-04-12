import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ECQO Sound — HERR',
  description: 'Your personalized sonic architecture.',
};

export default async function SoundPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/dashboard/sound');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const plan = profile?.plan ?? 'free';
  if (plan !== 'personalized' && plan !== 'elite') {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block' }}>
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, color: '#FFFFFF', marginBottom: 8 }}>Unlock ECQO Sound</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 24 }}>
            Upgrade to HERR Personalized or Elite for music-layered affirmations with your chosen genres and activity modes.
          </p>
          <a href="/checkout?tier=personalized" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 48, padding: '0 32px', background: '#C42D8E', color: '#FFFFFF', borderRadius: 12, fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none' }}>
            Upgrade
          </a>
        </div>
      </div>
    );
  }

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('activity_modes')
    .eq('user_id', user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: genrePrefs } = await (supabase as any)
    .from('user_preferences')
    .select('genres')
    .eq('user_id', user.id)
    .single();

  const modes = prefs?.activity_modes ?? [];
  const genres = genrePrefs?.genres ?? [];

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', padding: '80px 24px 60px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', color: '#C42D8E', marginBottom: 8 }}>
          ECQO SOUND
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 600, color: '#FFFFFF', marginBottom: 32 }}>
          Your Sonic Architecture
        </h1>

        {/* Current preferences */}
        <div style={{ background: '#16161F', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Modes</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {modes.length > 0 ? modes.map((m: string) => (
                <span key={m} style={{ fontSize: 12, color: '#C42D8E', border: '1px solid #C42D8E', padding: '4px 12px', borderRadius: 12 }}>
                  {m.replace('-', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </span>
              )) : <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No modes selected</span>}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Genres</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {genres.length > 0 ? genres.map((g: string) => (
                <span key={g} style={{ fontSize: 12, color: '#C42D8E', border: '1px solid #C42D8E', padding: '4px 12px', borderRadius: 12 }}>
                  {g.replace('-', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </span>
              )) : <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No genres selected</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/dashboard/modes" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>Change Modes</Link>
            <Link href="/dashboard/genres" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>Change Genres</Link>
          </div>
        </div>

        {/* Today's tracks placeholder */}
        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
          TODAY&apos;S TRACKS
        </p>

        {modes.length > 0 ? modes.map((mode: string) => (
          <div
            key={mode}
            style={{
              background: '#16161F', borderRadius: 16, padding: 32,
              border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', color: '#C42D8E', border: '1px solid #C42D8E', padding: '4px 12px', borderRadius: 12 }}>
                {mode.replace('-', ' ')}
              </span>
              {genres[0] && (
                <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 12 }}>
                  {genres[0]}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: 'rgba(196,45,142,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Generating...</span>
            </div>
          </div>
        )) : (
          <div style={{ background: '#16161F', borderRadius: 16, padding: 32, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)' }}>
              Select your activity modes to start receiving personalized sound tracks.
            </p>
            <Link href="/dashboard/modes" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 40, padding: '0 24px',
              background: '#C42D8E', color: '#FFFFFF', borderRadius: 12, fontSize: 13, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none', marginTop: 16,
            }}>
              Choose Modes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
