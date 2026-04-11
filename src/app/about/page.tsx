import type { Metadata } from 'next';
import Link from 'next/link';
import HERRImageSlot, { HERR_GRADIENTS } from '@/components/ui/HERRImageSlot';

export const metadata: Metadata = {
  title: 'About Bianca D. McCall, LMFT — Founder of HERR',
  description:
    'HERR is for every human who has ever questioned their own voice. Founded by Bianca D. McCall, LMFT — Licensed Marriage and Family Therapist, federal SAMHSA advisor, existential psychology expert, and retired professional athlete.',
};

const CREDENTIALS = [
  {
    category: 'Clinical',
    items: [
      'Licensed Marriage and Family Therapist (LMFT)',
      'Existential Psychology Subject Matter Expert',
      'Federal SAMHSA Advisor — Substance Abuse and Mental Health Services Administration',
      'National Committee Member in Behavioral Health',
    ],
  },
  {
    category: 'Platform',
    items: [
      'International Keynote Speaker',
      'AI Startup Founder — ECQO Holdings',
      'Retired Professional Women\'s Basketball Player',
      'Builder at the intersection of clinical science and human performance',
    ],
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex flex-col justify-end overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0">
          <HERRImageSlot
            src="/images/about-hero-voice-frequency.jpg"
            alt="Abstract voice frequency visualization — cobalt and pink light trails representing the sound and identity at the foundation of the HERR clinical wellness system."
            gradient={HERR_GRADIENTS.voiceFrequency}
            width={1920}
            height={800}
            className="w-full h-full"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[rgba(10,10,15,0.5)] to-[rgba(10,10,15,0.2)]" />
        </div>

        {/* Content */}
        <div className="relative max-w-[1200px] mx-auto w-full px-6 pt-40 pb-20">

          <p className="herr-label text-[var(--herr-muted)] mb-6">About HERR</p>

          <h1 className="font-display text-5xl md:text-7xl xl:text-8xl font-light text-[var(--herr-white)] leading-[0.9] mb-8">
            HERR™ is for every human<br />
            who has ever questioned<br />
            <span className="text-[var(--herr-pink)]">their own voice.</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--herr-muted)] max-w-2xl leading-relaxed">
            Built from clinical expertise, lived performance, and a deep belief that the inner voice is not fixed. It is reprogrammable. And it belongs to you.
          </p>

        </div>
      </section>

      {/* ── Bianca ───────────────────────────────────────────────── */}
      <section className="px-6 py-24 bg-[var(--herr-surface)]">
        <div className="max-w-[1200px] mx-auto">

          <div className="grid md:grid-cols-2 gap-14 items-start">

            {/* Founder image */}
            <div className="sticky top-24">
              <HERRImageSlot
                src="/images/founder-bianca-mccall-processed.jpg"
                alt="Bianca D. McCall, LMFT — Licensed Marriage and Family Therapist, federal SAMHSA advisor, existential psychology expert, and founder of HERR and ECQO Holdings."
                gradient={HERR_GRADIENTS.founder}
                width={600}
                height={750}
                className="w-full"
              />
            </div>

            <div>
              <p className="herr-label text-[var(--herr-muted)] mb-6">The Founder</p>
              <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-8 leading-tight">
                Bianca D. McCall,<br />LMFT
              </h2>

              <div className="flex flex-col gap-6 text-[var(--herr-muted)] leading-relaxed mb-10">
                <p>
                  Bianca D. McCall is a Licensed Marriage and Family Therapist with a clinical specialization in existential psychology. She is a federal SAMHSA advisor, a national committee member in behavioral health, a retired professional women&apos;s basketball player, and an international keynote speaker.
                </p>
                <p>
                  Bianca is the IP. Bianca is the brand. She built HERR because she understood something most wellness tools miss: the nervous system must be regulated before the inner voice can be reprogrammed. You cannot think your way into a new identity. You must feel your way there first.
                </p>
                <p>
                  Sports is the bridge, not the identity. The arena taught her that performance is an inside job. The clinic showed her the science behind why. HERR is what happens when both truths are held at once.
                </p>
              </div>

              {/* Credentials */}
              <div className="flex flex-col gap-6">
                {CREDENTIALS.map((group) => (
                  <div key={group.category}>
                    <p className="herr-label text-[var(--herr-pink)] mb-4">{group.category}</p>
                    <div className="flex flex-col gap-3">
                      {group.items.map((item) => (
                        <div
                          key={item}
                          className="herr-card border border-[var(--herr-border)] border-l-2 border-l-[var(--herr-violet)] p-4"
                        >
                          <p className="text-[0.88rem] text-[var(--herr-muted)]">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── The Arena ─────────────────────────────────────────────── */}
      <section className="border-t border-[var(--herr-border)]">
        <div className="max-w-[1200px] mx-auto">

          <div className="grid md:grid-cols-2 gap-px bg-[var(--herr-border)]">

            {/* Arena image */}
            <div className="bg-[var(--herr-black)]">
              <HERRImageSlot
                src="/images/about-arena-after.jpg"
                alt="An empty basketball arena receding into darkness — representing the moment of identity transition when the athlete role ends and a deeper self must be found. The arena that shaped Bianca D. McCall, LMFT."
                gradient={HERR_GRADIENTS.arena}
                width={600}
                height={500}
                className="w-full"
              />
            </div>

            {/* Arena copy */}
            <div className="bg-[var(--herr-black)] p-10 md:p-14 flex flex-col justify-center">
              <p className="herr-label text-[var(--herr-cobalt)] mb-6">The Origin</p>
              <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-8 leading-tight">
                What the arena<br />
                <span className="text-[var(--herr-pink)]">teaches you.</span>
              </h2>
              <div className="flex flex-col gap-5 text-[var(--herr-muted)] leading-relaxed">
                <p>
                  There is a specific kind of silence that happens when a career ends. Especially an athletic one. The crowd disappears. The structure disappears. And what is left is the question most high performers have never had to answer: who are you when performance is not the answer?
                </p>
                <p>
                  Bianca D. McCall lived that question. And she built HERR so that others would not have to navigate it alone — or without the clinical science to back them up.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── What HERR Is ─────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)]">
        <div className="max-w-[1200px] mx-auto">

          <p className="herr-label text-[var(--herr-muted)] mb-6">The System</p>

          <div className="grid md:grid-cols-2 gap-14 items-start">

            <div>
              <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-8 leading-tight">
                One tool.<br />
                Every version<br />
                of you.
              </h2>
            </div>

            <div className="flex flex-col gap-6 text-[var(--herr-muted)] leading-relaxed">
              <p>
                HERR is a clinical wellness operating system delivered through your own voice. It begins with assessment: understanding your existential concerns at the point of onset. The fears, questions, and unresolved patterns that quietly conduct your daily performance.
              </p>
              <p>
                Then it responds. Personalized voice affirmations and I AM declarations, recorded in your own cloned voice, delivered daily across eight activity modes: Workout, Driving, Sleep, Morning, Deep Work, Love and Family, Abundance, and Healing.
              </p>
              <p>
                HERR&apos;s customer is any high-performing human navigating identity, transition, or wellness. Athletes, executives, behavioral health professionals, caregivers, community leaders. The mission: regulate the nervous system first, then reprogram the inner voice at the subconscious level, so that who you believe you are begins to match who you are becoming.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── ECQO Holdings ────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)] bg-[var(--herr-surface)]">
        <div className="max-w-[1200px] mx-auto text-center">

          <p className="herr-label text-[var(--herr-muted)] mb-6">The Company</p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--herr-white)] mb-6">
            ECQO Holdings™
          </h2>
          <p className="text-[var(--herr-muted)] max-w-2xl mx-auto leading-relaxed mb-10">
            HERR™ is the market entry product of ECQO Holdings™, the clinical AI platform founded by Bianca D. McCall, LMFT. Built for the long arc: from individual wellness to enterprise behavioral health. One clinical intelligence. Multiple delivery layers.
          </p>
          <p className="text-[0.68rem] text-[var(--herr-faint)] max-w-xl mx-auto mb-8">
            HERR™ and Human Existential Response and Reprogramming™ are trademarks of ECQO Holdings™. The HERR™ Progressive Reprogramming System — Patent Pending.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/subscribe" className="btn-herr-primary">
              Begin Your Reprogramming
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
