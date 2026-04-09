import type { Metadata } from 'next';
import Link from 'next/link';
import MomentForMusic from '@/components/ecqo-sound/MomentForMusic';
import BListSection from '@/components/ecqo-sound/BListSection';

export const metadata: Metadata = {
  title: 'ECQO Sound — Def Jam meets Headspace | HERR',
  description: 'Genre-personalized therapeutic music tuned to 432Hz. Eight genres, eight activity modes, three clinical layers. Your healing has a soundtrack.',
  openGraph: {
    title: 'ECQO Sound — Your Healing Has a Soundtrack',
    description: 'Genre-personalized therapeutic music tuned to 432Hz. Science beneath the music. Your voice beneath the silence.',
    url: 'https://h3rr.com/ecqo-sound',
  },
};

const LAYERS = [
  {
    num: 1,
    label: 'Subliminal Affirmations',
    short: 'Your Voice, Below the Surface',
    detail: 'AI-generated I AM declarations in the member\u2019s own cloned voice, mixed at \u221220dB to \u221230dB \u2014 below conscious hearing threshold. Personalized daily from ECQO existential screener results. Generated automatically every morning by the ECQO platform.',
  },
  {
    num: 2,
    label: 'Solfeggio Frequency Tones',
    short: 'Tuning Your Nervous System',
    detail: 'Binaural beats and Solfeggio tones tuned per activity mode \u2014 528Hz for healing and morning, 639Hz for workout and driving, 174Hz for sleep. Embedded between the music and subliminal layers.',
  },
  {
    num: 3,
    label: 'Music',
    short: 'The Layer You Hear',
    detail: 'Original compositions in the member\u2019s preferred genre, tuned to A=432Hz, at activity-mode-specific BPM. This is the only layer members consciously hear. Every track created by a real producer.',
  },
];

const STEPS = [
  'Complete ECQO existential screener (conversational AI or click-through)',
  'Select activity modes and genre preference per mode',
  'Platform generates personalized affirmation scripts via Claude API',
  'ElevenLabs clones your voice and generates subliminal MP3 layer',
  'ECQO Sound music track for your genre + mode is selected from catalog',
  'Three layers are composited \u2014 subliminal + frequency + music',
  'Final personalized MP3 delivers to your Affirmation Library at 4AM ET daily',
  'Rate tracks, build playlists, discover new releases weekly',
  'Monthly screener reset generates progress report comparing growth over time',
  'New release drops weekly \u2014 \u201CNew This Week\u201D notification to your inbox',
];

const GENRES = ['Hip Hop', 'Gospel', 'R&B/Soul', 'Lo-fi', 'Latin', 'Afrobeats', 'Classical', 'Country'];

const MODES = [
  { name: 'Sleep', bpm: '50\u201365', freq: '174Hz + 285Hz', brainwave: 'Delta (0.5\u20134Hz)', tone: 'Dissolving, releasing', length: '6\u20138 min' },
  { name: 'Morning', bpm: '65\u201375', freq: '528Hz', brainwave: 'Alpha (8\u201312Hz)', tone: 'Opening, possibility', length: '3\u20134 min' },
  { name: 'Workout', bpm: '120\u2013140', freq: '639Hz', brainwave: 'Beta (12\u201330Hz)', tone: 'Power, activation', length: '3\u20134 min' },
  { name: 'Driving', bpm: '90\u2013110', freq: '639Hz', brainwave: 'Beta (12\u201330Hz)', tone: 'Forward motion, clarity', length: '3\u20134 min' },
  { name: 'Deep Work', bpm: '60\u201370', freq: '432Hz', brainwave: 'Alpha/Theta border', tone: 'Focused, sustained', length: '4\u20136 min' },
  { name: 'Love+Family', bpm: '70\u201380', freq: '528Hz + 639Hz', brainwave: 'Alpha (8\u201312Hz)', tone: 'Warmth, connection', length: '3\u20135 min' },
  { name: 'Abundance', bpm: '75\u201385', freq: '528Hz', brainwave: 'Alpha (8\u201312Hz)', tone: 'Expansion, joy', length: '3\u20134 min' },
  { name: 'Healing', bpm: '55\u201365', freq: '174Hz + 285Hz', brainwave: 'Theta (4\u20138Hz)', tone: 'Tender, held, safe', length: '6\u20138 min' },
];

const PHASE1_MODES = ['Sleep', 'Morning', 'Workout'];

const TIERS = [
  {
    tier: 'free',
    name: 'Free',
    price: '$0',
    badge: null,
    featured: false,
    eliteBorder: false,
    features: [
      'Browse the HERR platform',
      'Learn about the ECQO clinical framework',
      'Access public journal content',
    ],
    excluded: ['No voice affirmations', 'No ECQO Sound', 'No voice cloning'],
    cta: 'Get Started',
    href: '/signup',
  },
  {
    tier: 'collective',
    name: 'HERR Collective',
    price: '$9',
    badge: null,
    featured: false,
    eliteBorder: false,
    features: [
      'Conversational AI (ECQO Screener)',
      'Voice affirmations in text-to-speech',
      'All 8 activity modes',
      'HERR Nation community',
      'Monthly theme drops',
    ],
    excluded: ['No ECQO Sound music layer', 'No voice cloning'],
    cta: 'Subscribe \u2014 $9/mo',
    href: '/checkout?tier=collective',
  },
  {
    tier: 'personalized',
    name: 'HERR Personalized',
    price: '$19',
    badge: 'Most Popular',
    featured: true,
    eliteBorder: false,
    features: [
      'Everything in Collective',
      'Your own cloned voice via ElevenLabs',
      'Full ECQO Sound \u2014 genre selection, playlists, ratings',
      'Personalized existential assessment',
      'Quarterly voice + script refresh',
    ],
    excluded: [],
    cta: 'Subscribe \u2014 $19/mo',
    href: '/checkout?tier=personalized',
  },
  {
    tier: 'elite',
    name: 'HERR Elite',
    price: '$29',
    badge: 'Clinical Grade',
    featured: false,
    eliteBorder: true,
    features: [
      'Everything in Personalized',
      'Priority genre access + weekly genre switching',
      'Monthly live session with Bianca D. McCall, LMFT',
      'Elite Lounge + Beta-Testers Lab',
      'Clinically sequenced reprogramming protocol',
      'First access to new features',
    ],
    excluded: [],
    cta: 'Subscribe \u2014 $29/mo',
    href: '/checkout?tier=elite',
  },
];

export default async function ECQOSoundPage() {
  return (
    <main className="min-h-screen">

      {/* ── 1. Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 herr-glow pointer-events-none" />
        <div className="relative max-w-[1200px] mx-auto w-full px-6 pt-32 pb-24">
          <p className="herr-label text-[var(--herr-magenta)] mb-6 animate-fade-up animate-delay-1">ECQO Sound</p>
          <h1 className="font-display text-[clamp(3rem,10vw,8rem)] font-light leading-[0.9] text-[var(--herr-white)] mb-8 animate-fade-up animate-delay-2">
            Def Jam meets<br />
            <span className="text-[var(--herr-magenta)]">Headspace</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--herr-muted)] max-w-xl leading-relaxed mb-10 animate-fade-up animate-delay-3">
            Genre-personalized therapeutic music. Clinically designed. Composed for your nervous system. Delivered in your genre, every morning.
          </p>
          <a href="#pricing" className="btn-herr-primary animate-fade-up animate-delay-4">
            Start Listening
          </a>
        </div>
      </section>

      {/* ── 2. Three-Layer System ────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)]">
        <div className="max-w-[1200px] mx-auto">
          <p className="herr-label text-[var(--herr-muted)] mb-4">How It Works</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-14">
            Three layers. One track.
          </h2>

          <div className="grid md:grid-cols-3 gap-px bg-[var(--herr-border)]">
            {LAYERS.map((layer) => (
              <div key={layer.num} className="bg-[var(--herr-surface)] p-8 md:p-10">
                <p className="herr-label text-[var(--herr-magenta)] mb-2">Layer {layer.num}</p>
                <h3 className="font-display text-2xl font-light text-[var(--herr-white)] mb-2">{layer.label}</h3>
                <p className="text-[0.78rem] text-[var(--herr-pink)] font-display italic mb-4">{layer.short}</p>
                <p className="text-[0.88rem] text-[var(--herr-muted)] leading-relaxed">{layer.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. The User Journey — 10 Steps ───────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)] bg-[var(--herr-surface)]">
        <div className="max-w-[800px] mx-auto">
          <p className="herr-label text-[var(--herr-muted)] mb-4">Your Journey</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-14">
            From screener to soundtrack.
          </h2>

          <div className="flex flex-col gap-0">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-6 pb-8 relative">
                {/* Line */}
                {i < STEPS.length - 1 && (
                  <div className="absolute left-[15px] top-10 bottom-0 w-px bg-[var(--herr-border)]" />
                )}
                {/* Number */}
                <div className="shrink-0 w-8 h-8 flex items-center justify-center border border-[var(--herr-magenta)] text-[var(--herr-magenta)] text-[0.7rem] font-semibold">
                  {String(i + 1).padStart(2, '0')}
                </div>
                {/* Text */}
                <p className="text-[var(--herr-muted)] text-[0.9rem] leading-relaxed pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Genre Catalog — 8×8 Grid ──────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)]">
        <div className="max-w-[1200px] mx-auto">
          <p className="herr-label text-[var(--herr-muted)] mb-4">64-Track Catalog</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-6">
            Every genre. Every mode.
          </h2>
          <p className="text-[var(--herr-muted)] mb-10 max-w-xl">
            Columns highlighted in gold are Phase 1 — Beta Launch priority. Full catalog rolls out by genre.
          </p>

          {/* Mode spec reference */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-[0.72rem] text-[var(--herr-muted)]">
              <thead>
                <tr className="border-b border-[var(--herr-border)]">
                  <th className="text-left py-2 pr-4 herr-label text-[var(--herr-faint)]">Mode</th>
                  <th className="text-left py-2 pr-4 herr-label text-[var(--herr-faint)]">BPM</th>
                  <th className="text-left py-2 pr-4 herr-label text-[var(--herr-faint)]">Frequency</th>
                  <th className="text-left py-2 pr-4 herr-label text-[var(--herr-faint)]">Brainwave</th>
                  <th className="text-left py-2 pr-4 herr-label text-[var(--herr-faint)]">Tone</th>
                  <th className="text-left py-2 herr-label text-[var(--herr-faint)]">Length</th>
                </tr>
              </thead>
              <tbody>
                {MODES.map((m) => (
                  <tr key={m.name} className="border-b border-[var(--herr-border)]">
                    <td className="py-2 pr-4 text-[var(--herr-white)]">{m.name}</td>
                    <td className="py-2 pr-4">{m.bpm}</td>
                    <td className="py-2 pr-4">{m.freq}</td>
                    <td className="py-2 pr-4">{m.brainwave}</td>
                    <td className="py-2 pr-4">{m.tone}</td>
                    <td className="py-2">{m.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 8x8 Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Column headers */}
              <div className="grid grid-cols-[140px_repeat(8,1fr)] gap-px mb-px">
                <div />
                {MODES.map((m) => (
                  <div
                    key={m.name}
                    className={`text-center py-2 text-[0.6rem] font-semibold uppercase tracking-wider ${
                      PHASE1_MODES.includes(m.name)
                        ? 'text-[var(--herr-warning)] bg-[rgba(255,179,0,0.08)]'
                        : 'text-[var(--herr-faint)]'
                    }`}
                  >
                    {m.name}
                    {PHASE1_MODES.includes(m.name) && (
                      <span className="block text-[0.5rem] mt-0.5 opacity-70">Phase 1</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Genre rows */}
              {GENRES.map((genre) => (
                <div key={genre} className="grid grid-cols-[140px_repeat(8,1fr)] gap-px mb-px">
                  <div className="flex items-center text-[0.78rem] text-[var(--herr-white)] pr-2">
                    {genre}
                  </div>
                  {MODES.map((m) => (
                    <div
                      key={`${genre}-${m.name}`}
                      className={`aspect-square flex items-center justify-center border text-[0.5rem] ${
                        PHASE1_MODES.includes(m.name)
                          ? 'border-[var(--herr-warning)] bg-[rgba(255,179,0,0.06)] text-[var(--herr-warning)]'
                          : 'border-[var(--herr-border)] bg-[var(--herr-surface)] text-[var(--herr-faint)]'
                      }`}
                    >
                      {PHASE1_MODES.includes(m.name) ? '\u2713' : '\u00B7'}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Membership Tiers ──────────────────────────────── */}
      <section id="pricing" className="px-6 py-24 border-t border-[var(--herr-border)] bg-[var(--herr-surface)]">
        <div className="max-w-[1200px] mx-auto">
          <p className="herr-label text-[var(--herr-muted)] mb-4 text-center">Membership</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-14 text-center">
            Choose your tier.
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((plan) => {
              // Personalized card: white bg with inline styles
              if (plan.featured) {
                return (
                  <div
                    key={plan.tier}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#0A0A0F',
                      border: '2px solid #C42D8E',
                      borderRadius: '12px',
                      padding: '2rem',
                      display: 'flex',
                      flexDirection: 'column' as const,
                    }}
                  >
                    {plan.badge && (
                      <p style={{ color: '#C42D8E', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' as const, marginBottom: '0.5rem' }}>
                        {plan.badge}
                      </p>
                    )}
                    <p style={{ color: '#0A0A0F', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase' as const, marginBottom: '0.5rem' }}>
                      {plan.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '1rem' }}>
                      <span style={{ color: '#0A0A0F', fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 300, lineHeight: 1 }}>{plan.price}</span>
                      <span style={{ color: '#555', fontSize: '0.85rem', marginBottom: '4px' }}>/month</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, marginBottom: '1.5rem' }}>
                      {plan.features.map((f) => (
                        <li key={f} style={{ color: '#0A0A0F', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', gap: '8px' }}>
                          <span style={{ color: '#C42D8E', flexShrink: 0 }}>+</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.href} className="btn-herr-primary text-center justify-center" style={{ backgroundColor: '#C42D8E', color: '#FFFFFF' }}>
                      {plan.cta}
                    </Link>
                  </div>
                );
              }

              return (
                <div
                  key={plan.tier}
                  className={`flex flex-col p-8 bg-[var(--herr-black)] ${
                    plan.eliteBorder ? 'border-2 border-[var(--herr-magenta)] rounded-xl' : 'border border-[var(--herr-border)] rounded-xl'
                  }`}
                >
                  {plan.badge && (
                    <p className="herr-label text-[var(--herr-cobalt)] mb-2">{plan.badge}</p>
                  )}
                  <p className="herr-label text-[var(--herr-muted)] mb-2">{plan.name}</p>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="font-display text-5xl font-light text-[var(--herr-white)]">{plan.price}</span>
                    <span className="text-[var(--herr-muted)] mb-1 text-sm">/month</span>
                  </div>
                  <ul className="flex flex-col gap-2 mb-4 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[0.85rem] text-[var(--herr-muted)]">
                        <span className="text-[var(--herr-pink)] mt-0.5 shrink-0">+</span>
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.excluded.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[0.82rem] text-[var(--herr-faint)]">
                        <span className="text-[var(--herr-faint)] mt-0.5 shrink-0">\u2013</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className={plan.tier === 'free' ? 'btn-herr-ghost text-center justify-center' : 'btn-herr-primary text-center justify-center'}>
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="text-center text-[0.78rem] text-[var(--herr-faint)] mt-6">
            Subscriptions renew automatically each month. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ── 6. A Moment for Music ────────────────────────────── */}
      <MomentForMusic />

      {/* ── 7. The B-LIST ────────────────────────────────────── */}
      <BListSection />

      {/* ── 8. Producer Recruitment CTA ──────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)]">
        <div className="max-w-[800px] mx-auto text-center">
          <p className="herr-label text-[var(--herr-magenta)] mb-6">For Producers</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-6 leading-tight">
            Your genre. Their healing. Your legacy.
          </h2>
          <p className="text-[var(--herr-muted)] leading-relaxed mb-10 max-w-xl mx-auto">
            We&apos;re building the world&apos;s first clinically designed music catalog. Independent producers in all eight genres — your compositions become the delivery mechanism for therapeutic change. Original work. Real royalties. Lasting impact.
          </p>
          <Link href="/ecqo-sound/producers" className="btn-herr-primary">
            Join the Catalog
          </Link>
        </div>
      </section>

    </main>
  );
}
