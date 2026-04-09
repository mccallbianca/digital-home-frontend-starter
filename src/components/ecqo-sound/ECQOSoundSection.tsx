import Link from 'next/link';

const GENRES = [
  { name: 'Hip Hop', gradient: 'from-[#1a1a2e] to-[#16213e]' },
  { name: 'Gospel', gradient: 'from-[#2d1b4e] to-[#1a1a2e]' },
  { name: 'R&B/Soul', gradient: 'from-[#1e3a5f] to-[#1a1a2e]' },
  { name: 'Lo-fi', gradient: 'from-[#1a2a1a] to-[#1a1a2e]' },
  { name: 'Latin', gradient: 'from-[#3e1a1a] to-[#1a1a2e]' },
  { name: 'Afrobeats', gradient: 'from-[#3e2e1a] to-[#1a1a2e]' },
  { name: 'Classical', gradient: 'from-[#1a1a3e] to-[#1a1a2e]' },
  { name: 'Country', gradient: 'from-[#2e2a1a] to-[#1a1a2e]' },
];

const MODES = [
  { name: 'Sleep', freq: '174Hz + 285Hz' },
  { name: 'Morning', freq: '528Hz' },
  { name: 'Workout', freq: '639Hz' },
  { name: 'Driving', freq: '639Hz' },
  { name: 'Deep Work', freq: '432Hz' },
  { name: 'Love+Family', freq: '528Hz + 639Hz' },
  { name: 'Abundance', freq: '528Hz' },
  { name: 'Healing', freq: '174Hz + 285Hz' },
];

const LAYERS = [
  {
    num: 1,
    label: 'Subliminal',
    text: 'Your I AM declarations. Your voice. Below conscious hearing. Working every morning.',
    opacity: 'opacity-40',
  },
  {
    num: 2,
    label: 'Frequency',
    text: 'Solfeggio tones and binaural beats. Tuned to your activity mode. Guiding your nervous system.',
    opacity: 'opacity-65',
  },
  {
    num: 3,
    label: 'Music',
    text: 'Your genre. Your sonic home. The only layer you consciously hear — and the one that makes everything else possible.',
    opacity: 'opacity-100',
  },
];

export default function ECQOSoundSection() {
  return (
    <section className="px-6 py-24 border-t border-[var(--herr-border)]">
      <div className="max-w-[1200px] mx-auto">

        <p className="herr-label text-[var(--herr-magenta)] mb-6">ECQO Sound</p>

        <h2 className="font-display text-4xl md:text-6xl font-light text-[var(--herr-white)] mb-6 leading-tight">
          Your healing has a soundtrack.
        </h2>

        <p className="text-lg text-[var(--herr-muted)] max-w-2xl leading-relaxed mb-16">
          Genre-personalized therapeutic music, tuned to 432Hz, composed to guide your nervous system into the exact brainwave state your healing requires. Science beneath the music. Your voice beneath the silence.
        </p>

        {/* Three-Layer Visual */}
        <div className="relative mb-20">
          <div className="grid md:grid-cols-3 gap-6">
            {LAYERS.map((layer) => (
              <div
                key={layer.num}
                className={`relative bg-[var(--herr-surface)] border border-[var(--herr-border)] p-8 ${layer.opacity}`}
              >
                <p className="herr-label text-[var(--herr-magenta)] mb-3">
                  Layer {layer.num} · {layer.label}
                </p>
                <p className="text-[var(--herr-muted)] text-[0.9rem] leading-relaxed">
                  {layer.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Genre Grid */}
        <p className="herr-label text-[var(--herr-muted)] mb-6">Eight Genres</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {GENRES.map((genre) => (
            <div
              key={genre.name}
              className={`bg-gradient-to-br ${genre.gradient} border border-[var(--herr-border)] p-6 text-center hover:border-[var(--herr-magenta)] transition-colors duration-300`}
            >
              <p className="font-display text-lg font-light text-[var(--herr-white)]">
                {genre.name}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[0.78rem] text-[var(--herr-faint)] mb-16">
          Every genre. Every activity mode. Your soundtrack, your way.
        </p>

        {/* Activity Mode Strip */}
        <p className="herr-label text-[var(--herr-muted)] mb-6">Eight Activity Modes</p>
        <div className="flex flex-wrap gap-3 mb-12">
          {MODES.map((mode) => (
            <div
              key={mode.name}
              className="border border-[var(--herr-border)] px-4 py-2.5 flex items-center gap-2"
            >
              <span className="text-[0.82rem] text-[var(--herr-white)]">{mode.name}</span>
              <span className="text-[0.68rem] text-[var(--herr-faint)]">{mode.freq}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href="/ecqo-sound#pricing" className="btn-herr-primary">
          Unlock ECQO Sound
        </Link>

      </div>
    </section>
  );
}
