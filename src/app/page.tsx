import type { Metadata } from 'next';
import Link from 'next/link';
import HERRImageSlot, { HERR_GRADIENTS } from '@/components/ui/HERRImageSlot';
import ECQOSoundSection from '@/components/ecqo-sound/ECQOSoundSection';
import MomentForMusic from '@/components/ecqo-sound/MomentForMusic';
import BListSection from '@/components/ecqo-sound/BListSection';

export const metadata: Metadata = {
  title: 'HERR — Human Existential Response and Reprogramming',
  description:
    'A clinical wellness operating system that delivers personalized voice affirmations and I AM declarations in your own cloned voice. Regulate your nervous system. Reprogram your inner voice. Founded by Bianca D. McCall, LMFT.',
};

const MODES = [
  'Workout', 'Driving', 'Sleep', 'Morning',
  'Deep Work', 'Love & Family', 'Abundance', 'Healing',
];

const CAMPAIGN = [
  { phrase: "I'M HERR",          gradient: HERR_GRADIENTS.campaignPink,   file: '/images/campaign-im-herr-01.jpg',    alt: 'A Black woman in cinematic stillness, lit in magenta-violet, embodying the universal declaration I\'M HERR — the sovereign inner voice that HERR is designed to reprogram.' },
  { phrase: "I'M HIM WITH HERR", gradient: HERR_GRADIENTS.campaignCobalt, file: '/images/campaign-im-herr-02.jpg',    alt: 'A Latino man in his early thirties looking directly at camera in quiet determination under cobalt light, representing I\'M HIM WITH HERR — men reclaiming wellness.' },
  { phrase: "THEY'RE HERR",      gradient: HERR_GRADIENTS.campaignViolet, file: '/images/campaign-im-herr-03.jpg',    alt: 'A non-binary person with a knowing expression under violet-mid light, representing THEY\'RE HERR — the inner voice has no gender.' },
  { phrase: "I'M HERR MAN",      gradient: HERR_GRADIENTS.campaignGold,   file: '/images/campaign-im-herr-04.jpg',    alt: 'A White man in his fifties with executive presence, hand on chest, eyes closed, in gold light against near-black, representing I\'M HERR MAN — a direct masculine identity claim.' },
  { phrase: "COACH IS HERR",     gradient: HERR_GRADIENTS.campaignPink,   file: '/images/campaign-im-herr-05.jpg',    alt: 'An Asian woman with an athlete\'s build, mid-breath, eyes beginning to open in magenta-violet light, representing COACH IS HERR — the athletic and performance market.' },
  { phrase: "WE'RE HERR",        gradient: HERR_GRADIENTS.campaignCobalt, file: '/images/campaign-im-herr-06.jpg',    alt: 'An Indigenous-presenting person in sovereign stillness with a direct gaze in cobalt and gold light, representing WE\'RE HERR — community and movement language.' },
];

const DIMENSIONS = [
  {
    letter: 'E',
    name: 'Existential',
    description: 'The questions that quietly conduct your life. Meaning, purpose, identity, freedom. HERR addresses the concerns most systems never name.',
    gradient: HERR_GRADIENTS.existential,
    file: '/images/dim-existential-figure-void.jpg',
    alt: 'Abstract cinematic portrait representing the existential dimension of HERR — a human figure dwarfed by infinite dark space, confronting questions of meaning and purpose.',
  },
  {
    letter: 'E',
    name: 'Emotional',
    description: 'The nervous system first. Before reprogramming can happen, the body must feel safe. HERR begins with regulation.',
    gradient: HERR_GRADIENTS.emotional,
    file: '/images/dim-emotional-eye-release.jpg',
    alt: 'Close-up of a closed eye releasing in violet light, representing emotional regulation at the foundation of the HERR reprogramming protocol — the nervous system finally safe.',
  },
  {
    letter: 'E',
    name: 'Executive',
    description: 'Performance, decision-making, leadership, output. When the inner voice aligns with who you are becoming, everything else follows.',
    gradient: HERR_GRADIENTS.executive,
    file: '/images/dim-executive-hand-decides.jpg',
    alt: 'A decisive hand on a glass surface in cobalt and gold light, representing the executive performance dimension of HERR — when the inner voice aligns, everything follows.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0">
          <HERRImageSlot
            src="/images/hero-im-herr-portrait.jpg"
            alt="A person standing in stillness, lit by deep blue light against a near-black background, embodying the sovereign inner voice that HERR is designed to reprogram."
            gradient={HERR_GRADIENTS.heroPortrait}
            width={1920}
            height={1080}
            className="w-full h-full"
            priority
          />
          {/* Bottom gradient scrim for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-[rgba(10,10,15,0.4)]" />
        </div>

        {/* Content */}
        <div className="relative max-w-[1200px] mx-auto w-full px-6 pt-32 pb-24">

          <p className="herr-label text-[var(--herr-muted)] mb-6 animate-fade-up animate-delay-1">
            Human Existential Response and Reprogramming™
          </p>

          <h1 className="font-display text-[clamp(5rem,16vw,13rem)] font-light leading-[0.88] tracking-[0.06em] uppercase text-[var(--herr-white)] mb-8 animate-fade-up animate-delay-2">
            I&apos;M<br />
            <span className="text-[var(--herr-pink)]">HERR</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--herr-muted)] max-w-xl leading-relaxed mb-10 animate-fade-up animate-delay-3">
            A clinical wellness operating system that delivers personalized voice affirmations in your own cloned voice. Regulate first. Reprogram second.
          </p>

          <div className="flex flex-wrap gap-4 animate-fade-up animate-delay-4">
            <Link href="/subscribe" className="btn-herr-primary">
              Begin Your Reprogramming
            </Link>
            <Link href="/how-it-works" className="btn-herr-ghost">
              How It Works
            </Link>
          </div>

        </div>
      </section>

      {/* ── The System ─────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)]">
        <div className="max-w-[1200px] mx-auto">

          <p className="herr-label text-[var(--herr-muted)] mb-12">The Mechanism</p>

          <div className="grid md:grid-cols-2 gap-px bg-[var(--herr-border)]">

            {/* Regulate */}
            <div className="bg-[var(--herr-black)]">
              <HERRImageSlot
                src="/images/phase-regulate-open-hand.jpg"
                gradient={HERR_GRADIENTS.regulateHand}
                alt="An open hand resting in stillness, representing the nervous system regulation phase of the HERR clinical wellness protocol."
                width={600}
                height={400}
                className="w-full"
              />
              <div className="p-10 md:p-12">
                <p className="herr-label text-[var(--herr-cobalt)] mb-6">Phase 01</p>
                <h2 className="font-display text-5xl md:text-6xl font-light text-[var(--herr-white)] mb-6">
                  Regulate.
                </h2>
                <p className="text-[var(--herr-muted)] leading-relaxed max-w-sm">
                  Before reprogramming can reach the subconscious, the nervous system must first feel safe. HERR begins with assessment: understanding your existential concerns at the point of onset.
                </p>
              </div>
            </div>

            {/* Reprogram */}
            <div className="bg-[var(--herr-surface)]">
              <HERRImageSlot
                src="/images/phase-reprogram-fist.jpg"
                gradient={HERR_GRADIENTS.reprogramFist}
                alt="A closed hand in sovereign stillness, representing the inner voice reprogramming phase of the HERR methodology."
                width={600}
                height={400}
                className="w-full"
              />
              <div className="p-10 md:p-12">
                <p className="herr-label text-[var(--herr-pink)] mb-6">Phase 02</p>
                <h2 className="font-display text-5xl md:text-6xl font-light text-[var(--herr-white)] mb-6">
                  Reprogram.
                </h2>
                <p className="text-[var(--herr-muted)] leading-relaxed max-w-sm">
                  Personalized I AM declarations, recorded in your own cloned voice, delivered daily. Eight activity modes. Every dimension of your life.
                </p>
              </div>
            </div>

          </div>

          {/* Activity modes */}
          <div className="mt-8 flex flex-wrap gap-3">
            {MODES.map((mode) => (
              <span key={mode} className="herr-label text-[var(--herr-faint)] border border-[var(--herr-border)] px-4 py-2">
                {mode}
              </span>
            ))}
          </div>
          <p className="mt-6 text-[0.68rem] text-[var(--herr-faint)] tracking-wide">
            The HERR™ Progressive Reprogramming System — Patent Pending. © ECQO Holdings™.
          </p>

        </div>
      </section>

      {/* ── The Three Dimensions ──────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)] bg-[var(--herr-surface)]">
        <div className="max-w-[1200px] mx-auto">

          <p className="herr-label text-[var(--herr-muted)] mb-4">The Three Dimensions</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-14">
            Why h<span className="text-[var(--herr-pink)]">3</span>rr.com
          </h2>

          <div className="grid md:grid-cols-3 gap-px bg-[var(--herr-border)]">
            {DIMENSIONS.map((dim) => (
              <div key={dim.name} className="bg-[var(--herr-surface)] hover:bg-[var(--herr-card)] transition-colors duration-300">
                <HERRImageSlot
                  src={dim.file}
                  gradient={dim.gradient}
                  alt={dim.alt}
                  width={400}
                  height={300}
                  className="w-full"
                />
                <div className="p-8">
                  <p className="font-display text-5xl font-light text-[var(--herr-pink)] opacity-30 mb-4">{dim.letter}</p>
                  <h3 className="font-display text-2xl font-light text-[var(--herr-white)] mb-4">{dim.name}</h3>
                  <p className="text-[0.88rem] text-[var(--herr-muted)] leading-relaxed">{dim.description}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-[0.72rem] text-[var(--herr-faint)]">
            h3rr.com — the 3 represents the three dimensions of human experience HERR addresses: Existential, Emotional, and Executive. One tool. Every version of you.
          </p>

        </div>
      </section>

      {/* ── I'M HERR Campaign ─────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)]">
        <div className="max-w-[1200px] mx-auto">

          <p className="herr-label text-[var(--herr-muted)] mb-6 text-center">
            HERR is for every human who has ever questioned their own voice.
          </p>

          {/* Portrait strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-[var(--herr-border)] mb-16">
            {CAMPAIGN.map((item) => (
              <div key={item.phrase} className="relative group">
                <HERRImageSlot
                  src={item.file}
                  gradient={item.gradient}
                  alt={item.alt}
                  width={320}
                  height={420}
                  className="w-full"
                />
                {/* Campaign phrase overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-[rgba(10,10,15,0.85)] via-transparent to-transparent">
                  <span className="font-display text-[0.7rem] md:text-[0.8rem] font-light tracking-[0.15em] uppercase text-[var(--herr-white)] leading-tight">
                    {item.phrase}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center font-display text-xl md:text-2xl font-light italic text-[var(--herr-muted)] max-w-2xl mx-auto">
            &ldquo;The inner voice has no gender. Existential concerns are universal.&rdquo;
          </p>

        </div>
      </section>

      {/* ── ECQO Sound ─────────────────────────────────────────────── */}
      <ECQOSoundSection />

      {/* ── ECQO Sound Studio Presents ───────────────────────────── */}
      <MomentForMusic />

      {/* ── The B-LIST ────────────────────────────────────────────── */}
      <BListSection />

      {/* ── Clinical Authority ────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)] bg-[var(--herr-surface)]">
        <div className="max-w-[1200px] mx-auto">

          <div className="grid md:grid-cols-2 gap-14 items-center">

            {/* Founder image */}
            <div>
              <HERRImageSlot
                src="/images/founder-bianca-mccall-lmft.jpg"
                gradient={HERR_GRADIENTS.founder}
                alt="Bianca D. McCall, LMFT — Licensed Marriage and Family Therapist, federal SAMHSA advisor, existential psychology expert, and founder of HERR and ECQO Holdings."
                width={600}
                height={700}
                className="w-full"
              />
            </div>

            <div>
              <p className="herr-label text-[var(--herr-muted)] mb-6">Founded by</p>
              <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-6 leading-tight">
                Bianca D. McCall,<br />
                <span className="text-[var(--herr-muted)]">LMFT</span>
              </h2>
              <p className="text-[var(--herr-muted)] leading-relaxed mb-8">
                Licensed Marriage and Family Therapist. Existential psychology subject matter expert. Federal SAMHSA advisor. National committee member. Retired professional women&apos;s basketball player. International keynote speaker. AI startup founder.
              </p>
              <Link href="/about" className="btn-herr-ghost">
                Bianca&apos;s Story
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-center">

        {/* Threshold image */}
        <div className="absolute inset-0">
          <HERRImageSlot
            src="/images/cta-begin-reprogramming-threshold.jpg"
            gradient={HERR_GRADIENTS.threshold}
            alt="A human figure walking toward a distant light through a dark corridor, representing the threshold moment of beginning the HERR reprogramming journey."
            width={1920}
            height={800}
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-[rgba(10,10,15,0.65)]" />
        </div>

        <div className="relative px-6 py-32 max-w-[800px] mx-auto">
          <p className="herr-label text-[var(--herr-muted)] mb-6">Phase 1 — Now Available</p>
          <h2 className="font-display text-5xl md:text-7xl font-light tracking-[0.04em] uppercase text-[var(--herr-white)] mb-8 leading-tight">
            Begin Your<br />
            <span className="text-[var(--herr-pink)]">Reprogramming</span>
          </h2>
          <p className="text-[var(--herr-muted)] text-lg mb-10 max-w-md mx-auto">
            Personalized voice affirmations in your own voice. Starting at $19/month.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/subscribe" className="btn-herr-primary">
              Subscribe Now
            </Link>
            <Link href="/how-it-works" className="btn-herr-ghost">
              How It Works
            </Link>
          </div>
        </div>

      </section>

    </main>
  );
}
