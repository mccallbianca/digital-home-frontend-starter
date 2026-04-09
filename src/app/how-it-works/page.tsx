import type { Metadata } from 'next';
import Link from 'next/link';
import HERRImageSlot, { HERR_GRADIENTS } from '@/components/ui/HERRImageSlot';

export const metadata: Metadata = {
  title: 'How It Works — HERR',
  description:
    'HERR works in two phases: Regulate and Reprogram. Understand your existential concerns at the point of onset, then receive personalized voice affirmations delivered in your own cloned voice across eight daily activity modes.',
};

const STEPS = [
  {
    number: '01',
    phase: 'Assess',
    title: 'Understand your existential concerns at the point of onset.',
    body: 'HERR begins with a clinical assessment designed to surface the fears, questions, and unresolved patterns that quietly conduct your daily performance. Not symptoms. Origins. The assessment identifies which of the core existential concerns — identity, meaning, freedom, isolation, mortality — are most active in your current season of life.',
    gradient: HERR_GRADIENTS.stepAssess,
    alt: 'A contemplative figure in violet light, head slightly bowed, representing the clinical assessment phase of HERR — surfacing existential concerns at the point of onset.',
    imageFile: '/images/step-01-assess.jpg',
  },
  {
    number: '02',
    phase: 'Regulate',
    title: 'Bring the nervous system into a state of safety.',
    body: 'Before any reprogramming can reach the subconscious, the body must first feel safe. HERR delivers targeted nervous system regulation through your chosen mode — Sleep, Morning, Healing — so that the ground is prepared before the inner voice is addressed. Regulation is not optional. It is the prerequisite.',
    gradient: HERR_GRADIENTS.stepRegulate,
    alt: 'A figure mid-breath, lit in cobalt from the side, chest expanded — representing the nervous system regulation phase of HERR, the prerequisite before reprogramming.',
    imageFile: '/images/step-02-regulate.jpg',
  },
  {
    number: '03',
    phase: 'Clone',
    title: 'Record your voice. HERR makes it yours.',
    body: 'You record a short set of voice samples. HERR uses ElevenLabs voice cloning to create a precise digital replica of your voice. Every affirmation, every I AM declaration you receive will be spoken by you, to you. Because the subconscious trusts your own voice above all others.',
    gradient: HERR_GRADIENTS.stepClone,
    alt: 'A close-up of a professional microphone in magenta-pink light, representing the voice cloning step of HERR — where the member\'s voice is captured and transformed into a personal reprogramming instrument.',
    imageFile: '/images/step-03-clone-voice.jpg',
  },
  {
    number: '04',
    phase: 'Reprogram',
    title: 'Receive your personalized affirmations daily.',
    body: 'Your personalized I AM declarations — built from your assessment and Bianca D. McCall\'s clinical framework — are delivered in your own voice across eight activity modes every day. The inner voice that once limited you becomes the inner voice that carries you forward. Who you believe you are begins to match who you are becoming.',
    gradient: HERR_GRADIENTS.stepReprogram,
    alt: 'A person wearing headphones with eyes closed, lit in violet and pink, in a state of deep absorption — representing the daily reprogramming phase of HERR, where personalized I AM declarations are received.',
    imageFile: '/images/step-04-reprogram.jpg',
  },
];

const MODES = [
  { name: 'Workout', description: 'Performance activation and pre-competition regulation' },
  { name: 'Driving', description: 'Subconscious input during transition time' },
  { name: 'Sleep', description: 'Deep nervous system regulation and subconscious imprinting' },
  { name: 'Morning', description: 'Identity declaration to begin the day from strength' },
  { name: 'Deep Work', description: 'Focus, clarity, and executive function support' },
  { name: 'Love & Family', description: 'Relational identity and emotional safety' },
  { name: 'Abundance', description: 'Financial identity and worthiness reprogramming' },
  { name: 'Healing', description: 'Grief, transition, and recovery support' },
];

const FAQS = [
  {
    q: 'What makes HERR different from other affirmation apps?',
    a: 'HERR is built on clinical existential psychology, not motivational content. Every affirmation is grounded in a clinical assessment of your specific existential concerns. And every word is spoken in your own voice — not a stranger\'s, not an AI voice. Yours. The subconscious responds differently to its own voice.',
  },
  {
    q: 'How does the voice cloning work?',
    a: 'You record a short set of voice samples through the HERR platform. Our system uses professional voice cloning technology to create a precise replica of your voice. All recordings are processed securely and used exclusively to generate your personal affirmations.',
  },
  {
    q: 'How long before I notice a difference?',
    a: 'Most members report a shift in internal dialogue within the first two weeks of consistent daily use. Neurological reprogramming at the subconscious level is cumulative — the more consistently you engage, the deeper the rewiring.',
  },
  {
    q: 'Is HERR a substitute for therapy?',
    a: 'No. HERR is a wellness tool, not a clinical treatment. It is designed to complement professional mental health support, not replace it. If you are experiencing a mental health crisis, please consult a licensed clinician.',
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex flex-col justify-end overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0">
          <HERRImageSlot
            src="/images/how-it-works-hero-double-exposure.jpg"
            alt="A double-exposure portrait — one figure lit in cobalt, one in pink, overlapping in stillness. Representing the two phases of HERR: Regulate and Reprogram."
            gradient={HERR_GRADIENTS.doubleExposure}
            width={1920}
            height={800}
            className="w-full h-full"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[rgba(10,10,15,0.45)] to-[rgba(10,10,15,0.15)]" />
        </div>

        {/* Content */}
        <div className="relative max-w-[1200px] mx-auto w-full px-6 pt-40 pb-20">

          <p className="herr-label text-[var(--herr-muted)] mb-6">The Mechanism</p>
          <h1 className="font-display text-5xl md:text-7xl xl:text-8xl font-light text-[var(--herr-white)] leading-[0.9] mb-8">
            Regulate.<br />
            <span className="text-[var(--herr-pink)]">Reprogram.</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--herr-muted)] max-w-2xl leading-relaxed">
            HERR™ works in two phases. First, the nervous system. Then, the inner voice. In that order. Always.
          </p>
          <p className="mt-6 text-[0.72rem] text-[var(--herr-faint)] tracking-wide">
            The HERR™ Progressive Reprogramming System — Patent Pending.
          </p>

        </div>
      </section>

      {/* ── Steps ─────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6">

          <div className="mb-4 text-[0.7rem] text-[var(--herr-faint)] tracking-wide">
            The HERR™ Progressive Reprogramming Protocol — Patent Pending. © ECQO Holdings™. All rights reserved.
          </div>
          <div className="flex flex-col gap-px bg-[var(--herr-border)]">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`grid md:grid-cols-2 gap-px bg-[var(--herr-border)] ${i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}
              >
                {/* Image */}
                <div className="bg-[var(--herr-black)]">
                  <HERRImageSlot
                    src={step.imageFile}
                    alt={step.alt}
                    gradient={step.gradient}
                    width={600}
                    height={480}
                    className="w-full"
                  />
                </div>

                {/* Content */}
                <div className="bg-[var(--herr-black)] p-10 md:p-14 flex flex-col justify-center hover:bg-[var(--herr-surface)] transition-colors duration-300">
                  <p className="font-display text-6xl font-light text-[var(--herr-pink)] opacity-25 mb-2">
                    {step.number}
                  </p>
                  <p className="herr-label text-[var(--herr-cobalt)] mb-6">{step.phase}</p>
                  <h2 className="font-display text-2xl md:text-3xl font-light text-[var(--herr-white)] mb-5 leading-snug">
                    {step.title}
                  </h2>
                  <p className="text-[var(--herr-muted)] leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Activity Modes ────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)] bg-[var(--herr-surface)]">
        <div className="max-w-[1200px] mx-auto">

          <p className="herr-label text-[var(--herr-muted)] mb-4">Eight Activity Modes</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-12">
            Every dimension of your life.
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--herr-border)]">
            {MODES.map((mode) => (
              <div
                key={mode.name}
                className="bg-[var(--herr-surface)] p-6 hover:bg-[var(--herr-card)] transition-colors duration-300"
              >
                <h3 className="font-display text-xl font-light text-[var(--herr-white)] mb-2">
                  {mode.name}
                </h3>
                <p className="text-[0.82rem] text-[var(--herr-muted)] leading-relaxed">
                  {mode.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)]">
        <div className="max-w-[800px] mx-auto">

          <p className="herr-label text-[var(--herr-muted)] mb-4">Questions</p>
          <h2 className="font-display text-4xl font-light text-[var(--herr-white)] mb-12">
            What people ask.
          </h2>

          <div className="flex flex-col gap-px bg-[var(--herr-border)]">
            {FAQS.map((faq) => (
              <div key={faq.q} className="bg-[var(--herr-black)] p-8 hover:bg-[var(--herr-surface)] transition-colors duration-300">
                <h3 className="text-[var(--herr-white)] font-medium mb-3">{faq.q}</h3>
                <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="relative px-6 py-28 border-t border-[var(--herr-border)] text-center overflow-hidden">
        <div className="absolute inset-0 herr-glow pointer-events-none" />
        <div className="relative max-w-[700px] mx-auto">
          <h2 className="font-display text-4xl md:text-6xl font-light text-[var(--herr-white)] mb-6 uppercase tracking-wide">
            Ready to begin?
          </h2>
          <p className="text-[var(--herr-muted)] mb-10">
            Start your reprogramming. $19/month.
          </p>
          <Link href="/subscribe" className="btn-herr-primary">
            Begin Your Reprogramming
          </Link>
        </div>
      </section>

    </main>
  );
}
