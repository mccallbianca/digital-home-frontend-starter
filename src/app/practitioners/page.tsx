import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'For Practitioners — HERR',
  description:
    'HERR for behavioral health practitioners, coaches, and institutional partners. A clinical wellness operating system built by Bianca D. McCall, LMFT — Federal SAMHSA Advisor. Inquire about group licensing and enterprise integration.',
};

const USE_CASES = [
  {
    audience: 'Behavioral Health Clinicians',
    description:
      'Offer HERR as a between-session support tool for clients navigating identity transition, existential crisis, or performance-related stress. Built on the same clinical framework you practice in.',
  },
  {
    audience: 'Performance Coaches',
    description:
      'Integrate HERR into your athlete or executive coaching programs. The inner voice work you do in session, your clients can continue daily — in their own voice.',
  },
  {
    audience: 'Employee Wellness Programs',
    description:
      'HERR for teams navigating organizational transition, leadership development, or burnout recovery. Group licensing available for HR and wellness program administrators.',
  },
  {
    audience: 'Sports Organizations',
    description:
      'HERR was built at the intersection of clinical psychology and elite performance. Bianca D. McCall\'s background as a professional athlete and LMFT makes HERR uniquely suited for sports psychology programs.',
  },
];

export default function PractitionersPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-40 pb-24 border-b border-[var(--herr-border)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_60%,rgba(37,99,235,0.07),transparent)] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto relative">

          <p className="herr-label text-[var(--herr-muted)] mb-6">HERR for Practitioners</p>
          <h1 className="font-display text-5xl md:text-7xl xl:text-8xl font-light text-[var(--herr-white)] leading-[0.9] mb-8">
            HERR<br />
            <span className="text-[var(--herr-cobalt)]">For All</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--herr-muted)] max-w-2xl leading-relaxed mb-10">
            HERR is designed for individual members. It is also built to scale. Practitioners, coaches, institutions, and enterprise partners can inquire about group licensing and integration.
          </p>

          <Link href="/contact" className="btn-herr-primary">
            Inquire About Partnership
          </Link>

        </div>
      </section>

      {/* ── Use Cases ─────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-[1200px] mx-auto">

          <p className="herr-label text-[var(--herr-muted)] mb-4">Who HERR Serves</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-12">
            Every professional context.
          </h2>

          <div className="grid md:grid-cols-2 gap-px bg-[var(--herr-border)]">
            {USE_CASES.map((item) => (
              <div
                key={item.audience}
                className="bg-[var(--herr-black)] p-8 md:p-10 hover:bg-[var(--herr-surface)] transition-colors duration-300"
              >
                <h3 className="font-display text-2xl font-light text-[var(--herr-white)] mb-4">
                  {item.audience}
                </h3>
                <p className="text-[0.88rem] text-[var(--herr-muted)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Clinical Credibility ──────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)] bg-[var(--herr-surface)]">
        <div className="max-w-[1200px] mx-auto">

          <div className="grid md:grid-cols-2 gap-14 items-center">

            <div>
              <p className="herr-label text-[var(--herr-muted)] mb-6">Clinical Authority</p>
              <h2 className="font-display text-4xl font-light text-[var(--herr-white)] mb-6 leading-tight">
                Built by a clinician.<br />
                Designed for the field.
              </h2>
              <p className="text-[var(--herr-muted)] leading-relaxed">
                HERR was designed by Bianca D. McCall, LMFT — a Licensed Marriage and Family Therapist, federal SAMHSA advisor, and existential psychology subject matter expert. It is not a wellness consumer app that borrowed clinical language. It is a clinical framework delivered through technology.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {[
                'Grounded in existential psychology — not motivational content',
                'Compliant with wellness (non-treatment) standards',
                'Designed for use alongside, not instead of, clinical care',
                'Group licensing available for practices and organizations',
                'Enterprise integration inquiry available for Phase 3',
              ].map((point) => (
                <div
                  key={point}
                  className="herr-card border border-[var(--herr-border)] border-l-2 border-l-[var(--herr-cobalt)] p-4"
                >
                  <p className="text-[0.88rem] text-[var(--herr-muted)]">{point}</p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ── Phase Roadmap ─────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)]">
        <div className="max-w-[1200px] mx-auto">

          <p className="herr-label text-[var(--herr-muted)] mb-4">The Roadmap</p>
          <h2 className="font-display text-4xl font-light text-[var(--herr-white)] mb-12">
            Built for the long arc.
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--herr-border)]">
            {[
              { phase: 'Phase 1', label: 'Now', detail: 'DTC subscription. Manual delivery. $19–29/month.' },
              { phase: 'Phase 2', label: 'App', detail: 'Native app via Google Antigravity. Automated delivery.' },
              { phase: 'Phase 3', label: 'Enterprise', detail: 'ECQO Holdings Tier 2/3 enterprise feature. Group licensing.' },
              { phase: 'Phase 4', label: 'Institutional', detail: 'Enterprise wellness feature. BMS and similar institutional integration.' },
            ].map((item) => (
              <div key={item.phase} className="bg-[var(--herr-black)] p-8 hover:bg-[var(--herr-surface)] transition-colors duration-300">
                <p className="herr-label text-[var(--herr-cobalt)] mb-2">{item.phase}</p>
                <p className="font-display text-2xl font-light text-[var(--herr-white)] mb-3">{item.label}</p>
                <p className="text-[0.82rem] text-[var(--herr-muted)] leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="relative px-6 py-28 border-t border-[var(--herr-border)] text-center overflow-hidden bg-[var(--herr-surface)]">
        <div className="max-w-[700px] mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-6">
            Ready to bring HERR to your practice or organization?
          </h2>
          <p className="text-[var(--herr-muted)] mb-10">
            Reach out to begin a partnership conversation.
          </p>
          <Link href="/contact" className="btn-herr-primary">
            Contact Us
          </Link>
        </div>
      </section>

    </main>
  );
}
