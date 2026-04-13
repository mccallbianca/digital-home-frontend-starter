import type { Metadata } from 'next';
import ProducerApplicationForm from './ProducerApplicationForm';

export const metadata: Metadata = {
  title: 'Produce for HERR | ECQO Sound Producer Program | HERR',
  description: 'Independent producers: create original therapeutic compositions for the HERR platform. 30% royalty pool, pro-rata streaming revenue, real creative impact.',
  openGraph: {
    title: 'Produce for HERR | Join the ECQO Sound Catalog',
    description: 'Original compositions. Real royalties. Therapeutic impact. Apply to produce for the HERR platform.',
    url: 'https://h3rr.com/ecqo-sound/producers',
  },
};

const GENRE_BRIEFS = [
  {
    genre: 'Hip Hop',
    character: 'Hard 808, crisp snare, hi-hat patterns, boom-bap and trap textures. No vocals, no samples.',
    brief: 'Workout \u00B7 Level 1 Mild: BPM 130. Hard 808, crisp snare, hi-hat pattern. Clean intro, drops at bar 4, consistent energy. The sound of someone who already knows they are going to win.',
  },
  {
    genre: 'Gospel',
    character: 'Organ, soft choir (wordless humming only), acoustic bass, warm Rhodes piano, Hammond B3 textures.',
    brief: 'Healing \u00B7 Level 2 Moderate: BPM 62. Organ, soft choir (wordless humming), acoustic bass, warm Rhodes piano. Sparse 2-min opening \u2192 full by minute 4 \u2192 back to sparse by minute 7. Sitting in a quiet church alone at sunset. Nothing broken. Everything held.',
  },
  {
    genre: 'R&B/Soul',
    character: 'Warm bass, neo-soul keys, smooth guitar, lush pads, vintage warmth.',
    brief: 'Love+Family \u00B7 Level 1 Mild: BPM 75. Warm electric piano, fingerpicked guitar, gentle bass groove, atmospheric pads. Builds warmth gradually. The sound of being completely safe with someone.',
  },
  {
    genre: 'Lo-fi',
    character: 'Vinyl crackle, mellow keys, soft drums, tape hiss texture, jazzy chords.',
    brief: 'Deep Work \u00B7 Level 1 Mild: BPM 65. Lo-fi piano chords, vinyl crackle, soft boom-bap drum loop, ambient rain texture. Steady, unchanging, the perfect background for deep focus.',
  },
  {
    genre: 'Latin',
    character: 'Nylon string guitar, soft percussion (caj\u00F3n/shaker), warm bass, optional light keys, Latin jazz and bossa nova textures.',
    brief: 'Morning \u00B7 Level 1 Mild: BPM 72. Nylon string guitar, soft percussion (caj\u00F3n/shaker), warm bass, optional light keys. Gentle intro, builds into warmth by minute 2. The first quiet morning when everything feels possible.',
  },
  {
    genre: 'Afrobeats',
    character: 'Polyrhythmic percussion, talking drum textures, warm synth bass, bright melodic hooks, highlife and amapiano influences.',
    brief: 'Abundance \u00B7 Level 1 Mild: BPM 80. Light polyrhythmic percussion, warm synth bass, bright melodic hook, shaker groove. Steady joyful energy. The feeling of expansion without effort.',
  },
  {
    genre: 'Classical',
    character: 'Orchestral strings, piano, woodwinds, harp, cinematic warmth without bombast.',
    brief: 'Sleep \u00B7 Level 3 Therapeutic: BPM 55. Solo piano with very sparse string pad underneath. Extremely slow, spacious, each note given room to breathe. Dissolving into safety.',
  },
  {
    genre: 'Country',
    character: 'Acoustic guitar, pedal steel, soft fiddle, gentle bass, warm Americana textures.',
    brief: 'Driving \u00B7 Level 1 Mild: BPM 100. Acoustic guitar picking pattern, gentle pedal steel, soft bass, light brush drums. Open road, windows down, clarity in every mile.',
  },
];

const PROJECTIONS = [
  { scale: '500 Personalized members', revenue: '$9,500', pool: '$2,850/mo', share: '$1,710/mo at 60% stream share' },
  { scale: '2,500 members', revenue: '$47,500', pool: '$14,250/mo', share: '$5,700/mo at 40% stream share' },
  { scale: '10,000 members', revenue: '$190,000', pool: '$57,000/mo', share: '$17,100/mo at 30% stream share' },
];

export default function ProducersPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative px-6 pt-40 pb-24 border-b border-[var(--herr-border)] overflow-hidden">
        <div className="absolute inset-0 herr-glow pointer-events-none" />
        <div className="max-w-[800px] mx-auto relative">
          <p className="herr-label text-[var(--herr-magenta)] mb-6">ECQO Sound Producer Program</p>
          <h1 className="font-display text-5xl md:text-7xl font-light text-[var(--herr-white)] leading-[0.9] mb-6">
            Your genre.<br />Their healing.<br />
            <span className="text-[var(--herr-magenta)]">Your legacy.</span>
          </h1>
          <p className="text-lg text-[var(--herr-muted)] max-w-xl leading-relaxed mb-4">
            Produce music once. Earn on every play, forever.
          </p>
          <p className="text-[var(--herr-muted)] leading-relaxed mb-10 max-w-xl">
            A personal invitation from Bianca D. McCall, LMFT, ECQO Sound is building the world&apos;s first clinically designed, genre-personalized therapeutic music catalog. We need independent producers who can create original compositions that become the delivery mechanism for real therapeutic change.
          </p>
          <a href="#apply" className="btn-herr-primary">Apply Now</a>
        </div>
      </section>

      {/* ── Three-Layer System — Producer Perspective ─────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)]">
        <div className="max-w-[1000px] mx-auto">
          <p className="herr-label text-[var(--herr-muted)] mb-4">Where Your Work Lives</p>
          <h2 className="font-display text-4xl font-light text-[var(--herr-white)] mb-12">
            The three-layer system.
          </h2>

          <div className="grid md:grid-cols-3 gap-px bg-[var(--herr-border)]">
            <div className="bg-[var(--herr-surface)] p-8 opacity-50">
              <p className="herr-label text-[var(--herr-faint)] mb-2">Layer 1 · ECQO-Generated</p>
              <h3 className="font-display text-xl font-light text-[var(--herr-muted)] mb-3">Subliminal Affirmations</h3>
              <p className="text-[0.85rem] text-[var(--herr-faint)]">AI-generated I AM declarations in the member&apos;s cloned voice, mixed at −20dB to −30dB. You don&apos;t touch this layer.</p>
            </div>
            <div className="bg-[var(--herr-surface)] p-8 opacity-50">
              <p className="herr-label text-[var(--herr-faint)] mb-2">Layer 2 · ECQO-Generated</p>
              <h3 className="font-display text-xl font-light text-[var(--herr-muted)] mb-3">Solfeggio Frequency Tones</h3>
              <p className="text-[0.85rem] text-[var(--herr-faint)]">Binaural beats tuned per activity mode. You maintain low-frequency headroom in the 100–300Hz range so this layer integrates cleanly.</p>
            </div>
            <div className="bg-[var(--herr-card)] p-8 border-2 border-[var(--herr-magenta)]">
              <p className="herr-label text-[var(--herr-magenta)] mb-2">Layer 3 · YOUR Work</p>
              <h3 className="font-display text-xl font-light text-[var(--herr-white)] mb-3">Music</h3>
              <p className="text-[0.85rem] text-[var(--herr-muted)]">Original compositions in your genre. Tuned to A=432Hz. Activity-mode-specific BPM. This is the only layer members consciously hear, and the one that makes the clinical treatment possible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Creative Guidelines ───────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)] bg-[var(--herr-surface)]">
        <div className="max-w-[1000px] mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-3xl font-light text-[var(--herr-white)] mb-6">What you CAN include</h2>
            <ul className="space-y-3">
              {[
                'Wordless vocals (humming, harmonizing, melodic runs)',
                'Instrumental ad libs, riffs, production flourishes',
                'Ambient sound textures (rain, nature sounds, atmospheric pads)',
                'Atmospheric sound design (pads, reverb, spatial effects)',
                'Gradual dynamic builds',
                'Genre-authentic texture (gospel choir breathiness, hip hop crackle, Latin warmth)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[0.88rem] text-[var(--herr-muted)]">
                  <span className="text-[var(--herr-success)] shrink-0 mt-0.5">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-3xl font-light text-[var(--herr-white)] mb-6">What you CANNOT include</h2>
            <ul className="space-y-3">
              {[
                'Lyrics of any kind (competes with subliminal layer, clinical requirement)',
                'Spoken word or vocal chanting with words',
                'Jarring drops, hard transitions, or sonic surprises (disrupts nervous system regulation)',
                'Dramatic tempo changes or key modulations (destabilizes brainwave entrainment)',
                'Third-party samples or licensed elements (legal and IP requirement)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[0.88rem] text-[var(--herr-muted)]">
                  <span className="text-[var(--herr-pink)] shrink-0 mt-0.5">\u2013</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Technical Requirements ────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)]">
        <div className="max-w-[800px] mx-auto">
          <h2 className="font-display text-3xl font-light text-[var(--herr-white)] mb-8">Technical Requirements</h2>
          <div className="bg-[var(--herr-surface)] border border-[var(--herr-border)] p-8 space-y-4">
            {[
              ['Tuning', 'A=432Hz at the project level (DAW default is 440Hz \u2014 must be changed before production begins)'],
              ['BPM', 'Per activity mode specification (see genre briefs below)'],
              ['Track Length', 'Sleep/Healing 6\u20138 min \u00B7 Deep Work 4\u20136 min \u00B7 Love+Family 3\u20135 min \u00B7 All other modes 3\u20134 min'],
              ['Low-frequency headroom', 'Maintain space in 100\u2013300Hz range for ECQO frequency layer integration'],
              ['Delivery format', 'Mixed + mastered stereo WAV (24-bit, 48kHz) PLUS dry instrumental stem set'],
              ['Originality', 'Substantial original human creative contribution \u2014 artistic standard and legal standard for copyright'],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col sm:flex-row gap-2">
                <span className="text-[var(--herr-white)] font-medium text-[0.85rem] sm:w-48 shrink-0">{label}</span>
                <span className="text-[var(--herr-muted)] text-[0.85rem]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Royalty Model ─────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)] bg-[var(--herr-surface)]">
        <div className="max-w-[800px] mx-auto">
          <h2 className="font-display text-3xl font-light text-[var(--herr-white)] mb-8">Royalty Model</h2>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-[var(--herr-card)] border border-[var(--herr-border)] p-6">
              <p className="herr-label text-[var(--herr-magenta)] mb-2">Music Royalty Pool</p>
              <p className="font-display text-3xl font-light text-[var(--herr-white)]">30%</p>
              <p className="text-[0.78rem] text-[var(--herr-muted)] mt-2">of Net Revenue ring-fenced monthly</p>
            </div>
            <div className="bg-[var(--herr-card)] border border-[var(--herr-border)] p-6">
              <p className="herr-label text-[var(--herr-muted)] mb-2">Your Share</p>
              <p className="text-[0.85rem] text-[var(--herr-muted)] leading-relaxed">Your tracks&apos; streams \u00F7 total platform streams \u00D7 the pool (pro-rata)</p>
            </div>
            <div className="bg-[var(--herr-card)] border border-[var(--herr-border)] p-6">
              <p className="herr-label text-[var(--herr-muted)] mb-2">Payment</p>
              <p className="text-[0.85rem] text-[var(--herr-muted)] leading-relaxed">Monthly, within 15 days of end of each calendar month</p>
            </div>
          </div>

          {/* Projections */}
          <div className="overflow-x-auto">
            <table className="w-full text-[0.82rem]">
              <thead>
                <tr className="border-b border-[var(--herr-border)]">
                  <th className="text-left py-2 text-[var(--herr-faint)] herr-label">Platform Scale</th>
                  <th className="text-left py-2 text-[var(--herr-faint)] herr-label">Monthly Revenue</th>
                  <th className="text-left py-2 text-[var(--herr-faint)] herr-label">Royalty Pool</th>
                  <th className="text-left py-2 text-[var(--herr-faint)] herr-label">Producer Share</th>
                </tr>
              </thead>
              <tbody>
                {PROJECTIONS.map((p) => (
                  <tr key={p.scale} className="border-b border-[var(--herr-border)]">
                    <td className="py-3 text-[var(--herr-white)]">{p.scale}</td>
                    <td className="py-3 text-[var(--herr-muted)]">{p.revenue}</td>
                    <td className="py-3 text-[var(--herr-magenta)]">{p.pool}</td>
                    <td className="py-3 text-[var(--herr-muted)]">{p.share}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[0.72rem] text-[var(--herr-faint)] mt-4">
            Projections are illustrative. Actual earnings depend on total platform streams and your tracks&apos; share of listening.
          </p>
        </div>
      </section>

      {/* ── Genre Briefs Accordion ────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)]">
        <div className="max-w-[800px] mx-auto">
          <h2 className="font-display text-3xl font-light text-[var(--herr-white)] mb-8">Genre Briefs</h2>

          <div className="flex flex-col gap-px bg-[var(--herr-border)]">
            {GENRE_BRIEFS.map((g) => (
              <details key={g.genre} className="bg-[var(--herr-surface)] group">
                <summary className="px-6 py-5 cursor-pointer flex items-center justify-between text-[var(--herr-white)] hover:bg-[var(--herr-card)] transition-colors">
                  <span className="font-display text-xl font-light">{g.genre}</span>
                  <span className="text-[var(--herr-muted)] group-open:rotate-45 transition-transform duration-200 text-xl">+</span>
                </summary>
                <div className="px-6 pb-6 pt-2">
                  <p className="text-[0.88rem] text-[var(--herr-muted)] mb-4 leading-relaxed">
                    <strong className="text-[var(--herr-white)]">Character:</strong> {g.character}
                  </p>
                  <div className="bg-[var(--herr-card)] border border-[var(--herr-border)] p-5">
                    <p className="herr-label text-[var(--herr-magenta)] mb-2">Sample Brief</p>
                    <p className="text-[0.85rem] text-[var(--herr-muted)] leading-relaxed italic">{g.brief}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Application Form ──────────────────────────────────── */}
      <section id="apply" className="px-6 py-24 border-t border-[var(--herr-border)] bg-[var(--herr-surface)]">
        <div className="max-w-[800px] mx-auto">
          <p className="herr-label text-[var(--herr-magenta)] mb-4 text-center">Apply</p>
          <h2 className="font-display text-4xl font-light text-[var(--herr-white)] mb-12 text-center">
            Apply to Produce for HERR
          </h2>

          <ProducerApplicationForm />
        </div>
      </section>

    </main>
  );
}
