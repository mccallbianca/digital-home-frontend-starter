import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — HERR',
  description:
    'Contact HERR by ECQO Holdings. General inquiries, media requests, and practitioner partnerships. Founded by Bianca D. McCall, LMFT.',
};

const CONTACT_TYPES = [
  {
    type: 'General Inquiries',
    description: 'Questions about HERR, the subscription, or your account.',
    email: 'hello@h3rr.com',
  },
  {
    type: 'Media & Press',
    description: 'Interview requests, media kits, and press inquiries about Bianca D. McCall, LMFT or ECQO Holdings.',
    email: 'media@h3rr.com',
  },
  {
    type: 'Practitioner & Enterprise',
    description: 'Group licensing, partnership inquiries, and enterprise integration for Phase 3.',
    email: 'partners@h3rr.com',
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-40 pb-24 border-b border-[var(--herr-border)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(217,70,239,0.05),transparent)] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto relative">

          <p className="herr-label text-[var(--herr-muted)] mb-6">Contact</p>
          <h1 className="font-display text-5xl md:text-7xl xl:text-8xl font-light text-[var(--herr-white)] leading-[0.9] mb-8">
            We&apos;re<br />
            <span className="text-[var(--herr-pink)]">HERR.</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--herr-muted)] max-w-xl leading-relaxed">
            Reach out for general inquiries, media requests, or partnership conversations. We respond to every message.
          </p>

        </div>
      </section>

      {/* ── Contact Options ───────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-[900px] mx-auto">

          <div className="flex flex-col gap-px bg-[var(--herr-border)]">
            {CONTACT_TYPES.map((item) => (
              <div
                key={item.type}
                className="bg-[var(--herr-black)] p-8 md:p-10 hover:bg-[var(--herr-surface)] transition-colors duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
              >
                <div>
                  <p className="herr-label text-[var(--herr-muted)] mb-2">{item.type}</p>
                  <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed max-w-md">
                    {item.description}
                  </p>
                </div>
                <a
                  href={`mailto:${item.email}`}
                  className="btn-herr-ghost whitespace-nowrap shrink-0"
                >
                  {item.email}
                </a>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Location & Brand ──────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)] bg-[var(--herr-surface)]">
        <div className="max-w-[900px] mx-auto">

          <div className="grid md:grid-cols-2 gap-14">
            <div>
              <p className="herr-label text-[var(--herr-muted)] mb-4">ECQO Holdings</p>
              <p className="text-[var(--herr-muted)] leading-relaxed text-[0.9rem]">
                HERR is the market entry product of ECQO Holdings, the clinical AI platform founded by Bianca D. McCall, LMFT. ECQO Holdings is committed to building clinical intelligence that serves every version of every human.
              </p>
            </div>
            <div>
              <p className="herr-label text-[var(--herr-muted)] mb-4">Response Time</p>
              <p className="text-[var(--herr-muted)] leading-relaxed text-[0.9rem]">
                We respond to all inquiries within two business days. Media and press requests are typically handled within 24 hours.
              </p>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
