import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The Science — HERR',
  description:
    'HERR is grounded in existential psychology, nervous system regulation, and subconscious reprogramming science. Understand the clinical framework behind Regulate and Reprogram. Founded by Bianca D. McCall, LMFT — Federal SAMHSA Advisor.',
};

const PILLARS = [
  {
    number: '01',
    name: 'Existential Psychology',
    color: 'var(--herr-violet)',
    summary: 'The branch of clinical psychology that addresses the fundamental questions of human existence: meaning, identity, freedom, isolation, and mortality.',
    detail:
      'Existential psychology does not treat symptoms. It addresses origins. The fears and questions that emerge at the existential level are not clinical disorders to be managed. They are the signal beneath the signal. HERR was built on the clinical insight that unresolved existential concerns are the hidden conductors of performance, identity, and inner narrative.',
  },
  {
    number: '02',
    name: 'Nervous System Regulation',
    color: 'var(--herr-cobalt)',
    summary: 'The autonomic nervous system governs the body\'s threat response. Before cognitive reprogramming is possible, the body must first feel safe.',
    detail:
      'The prefrontal cortex — responsible for rational thought, identity, and decision-making — goes offline under chronic stress. This is why willpower fails. This is why affirmations delivered to an unregulated nervous system do not stick. HERR\'s sequence is clinically intentional: Regulate first. The inner voice cannot be rewired in a body that believes it is under threat.',
  },
  {
    number: '03',
    name: 'Subconscious Voice Imprinting',
    color: 'var(--herr-pink)',
    summary: 'The subconscious mind processes information differently from the conscious mind. It responds with heightened receptivity to the voice it trusts most: your own.',
    detail:
      'Research in auditory neuroscience confirms that self-referential processing — hearing and processing one\'s own voice — activates distinct neural pathways compared to hearing another person speak. HERR\'s use of cloned voice delivery is not a feature. It is the mechanism. The inner voice that shaped you becomes the inner voice that transforms you, because it is literally the same voice.',
  },
  {
    number: '04',
    name: 'Identity Reprogramming',
    color: 'var(--herr-violet)',
    summary: 'Identity is not fixed. It is a narrative construct, built from repeated internal and external messages over time. It can be deliberately rebuilt.',
    detail:
      'The self-concept — how a person defines who they are — is formed through repetition, environment, and the inner voice. Clinical research in identity development confirms that the self-concept is malleable across the lifespan. HERR delivers I AM declarations because the grammatical structure of identity language activates deeper self-schema processing than generic motivational statements. You are not being told you can. You are being reminded of who you already are becoming.',
  },
];

const FAQS = [
  {
    q: 'What is existential psychology?',
    a: 'Existential psychology is a branch of clinical psychology rooted in existential philosophy. It addresses the fundamental concerns of human existence: meaning and purpose, identity and authenticity, freedom and responsibility, isolation and connection, and mortality. Unlike symptom-focused approaches, existential psychology works at the level of origin.',
  },
  {
    q: 'Why does the voice matter?',
    a: 'The subconscious mind processes self-referential content differently from external input. Hearing your own voice activates distinct neural pathways — pathways associated with trust, familiarity, and identity. This is why HERR uses your cloned voice rather than a generated voice. The mechanism depends on it.',
  },
  {
    q: 'Why regulate before reprogram?',
    a: 'A nervous system in a state of chronic activation cannot fully access the prefrontal cortex — the region responsible for identity, rational thought, and behavioral change. Affirmations delivered to an unregulated nervous system are processed as noise. HERR sequences regulation before reprogramming because the science demands it.',
  },
  {
    q: 'Is HERR clinically validated?',
    a: 'HERR is grounded in established clinical frameworks including existential psychology, polyvagal theory, and self-concept research. HERR is a wellness tool, not a clinical treatment, and has not undergone independent clinical trials. It was designed by a Licensed Marriage and Family Therapist with expertise in existential psychology.',
  },
];

export default function SciencePage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-40 pb-24 border-b border-[var(--herr-border)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_40%_60%,rgba(124,58,237,0.08),transparent)] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto relative">

          <p className="herr-label text-[var(--herr-muted)] mb-6">The Clinical Framework</p>
          <h1 className="font-display text-5xl md:text-7xl xl:text-8xl font-light text-[var(--herr-white)] leading-[0.9] mb-8">
            The Science<br />
            <span className="text-[var(--herr-violet)]">Behind HERR™</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--herr-muted)] max-w-2xl leading-relaxed">
            HERR is grounded in four clinical frameworks. Each one was chosen because it addresses something most wellness tools never reach.
          </p>

          <div className="mt-10 herr-label text-[var(--herr-faint)]">
            Designed by Bianca D. McCall, LMFT — Licensed Marriage and Family Therapist, Federal SAMHSA Advisor, Existential Psychology Subject Matter Expert
          </div>

        </div>
      </section>

      {/* ── Clinical Pillars ──────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-[1200px] mx-auto">

          <div className="flex flex-col gap-px bg-[var(--herr-border)]">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.number}
                className="bg-[var(--herr-black)] p-8 md:p-12 grid md:grid-cols-[100px_1fr_1fr] gap-8 hover:bg-[var(--herr-surface)] transition-colors duration-300"
              >
                <div>
                  <p
                    className="font-display text-5xl font-light opacity-40"
                    style={{ color: pillar.color }}
                  >
                    {pillar.number}
                  </p>
                </div>
                <div>
                  <h2
                    className="font-display text-2xl md:text-3xl font-light mb-4"
                    style={{ color: pillar.color }}
                  >
                    {pillar.name}
                  </h2>
                  <p className="text-[var(--herr-white)] text-[0.95rem] leading-relaxed font-medium">
                    {pillar.summary}
                  </p>
                </div>
                <div>
                  <p className="text-[0.88rem] text-[var(--herr-muted)] leading-relaxed">
                    {pillar.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Authority Bar ─────────────────────────────────────────── */}
      <section className="px-6 py-20 border-t border-[var(--herr-border)] bg-[var(--herr-surface)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Clinical Discipline', value: 'Existential Psychology' },
              { label: 'Regulatory Advisory', value: 'Federal SAMHSA' },
              { label: 'Licensure', value: 'LMFT' },
              { label: 'Delivery Science', value: 'Subconscious Voice Imprinting' },
            ].map((item) => (
              <div key={item.label}>
                <p className="herr-label text-[var(--herr-muted)] mb-2">{item.label}</p>
                <p className="font-display text-lg font-light text-[var(--herr-white)]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)]">
        <div className="max-w-[800px] mx-auto">

          <p className="herr-label text-[var(--herr-muted)] mb-4">The Questions</p>
          <h2 className="font-display text-4xl font-light text-[var(--herr-white)] mb-12">
            What clinicians ask.
          </h2>

          <div className="flex flex-col gap-px bg-[var(--herr-border)]">
            {FAQS.map((faq) => (
              <div key={faq.q} className="bg-[var(--herr-black)] p-8 hover:bg-[var(--herr-surface)] transition-colors duration-300">
                <h3 className="text-[var(--herr-white)] font-medium mb-3">{faq.q}</h3>
                <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-[0.72rem] text-[var(--herr-faint)] leading-relaxed">
            HERR™ is a wellness tool and is not a substitute for professional mental health treatment. Always consult a licensed clinician for clinical concerns. The HERR™ Progressive Reprogramming System — Patent Pending. © ECQO Holdings™. All rights reserved.
          </p>

        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="relative px-6 py-28 border-t border-[var(--herr-border)] text-center overflow-hidden">
        <div className="absolute inset-0 herr-glow pointer-events-none" />
        <div className="relative max-w-[700px] mx-auto">
          <h2 className="font-display text-4xl md:text-6xl font-light text-[var(--herr-white)] mb-6 uppercase tracking-wide">
            Experience the science.
          </h2>
          <p className="text-[var(--herr-muted)] mb-10">
            The framework is clinical. The delivery is personal. The voice is yours.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
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
