import type { Metadata } from 'next';
import CheckoutFlow from './CheckoutFlow';

export const metadata: Metadata = {
  title: 'Begin — Choose Your HERR Membership',
  description:
    'Four tiers of clinical reprogramming. HERR Free to explore. Collective at $9/month in Bianca\'s voice. Personalized at $19/month in your own cloned voice. Elite at $29/month with live sessions and ECQO Sound.',
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative px-6 pt-40 pb-24 border-b border-[var(--herr-border)] overflow-hidden text-center">
        <div className="absolute inset-0 herr-glow pointer-events-none" />
        <div className="max-w-[900px] mx-auto relative">
          <p className="herr-label text-[var(--herr-muted)] mb-6">Membership</p>
          <h1 className="font-display text-5xl md:text-7xl xl:text-8xl font-light text-[var(--herr-white)] leading-[0.9] mb-8">
            Begin Your<br />
            <span className="text-[var(--herr-pink)]">Reprogramming.</span>
          </h1>
          <p className="text-lg text-[var(--herr-muted)] max-w-2xl mx-auto leading-relaxed">
            Whether you say I&apos;m HERR, I&apos;m HIM with HERR, or We&apos;re HERR — this is where it begins.
          </p>
        </div>
      </section>

      {/* Plan cards + email capture */}
      <CheckoutFlow />

      {/* Clinical Disclaimer */}
      <section className="px-6 py-10 border-t border-[var(--herr-border)] bg-[var(--herr-surface)]">
        <div className="max-w-[800px] mx-auto text-center">
          <p className="text-[0.82rem] text-[var(--herr-muted)] leading-relaxed">
            HERR™ is a wellness tool and is not a substitute for professional mental health treatment.
            Always consult a licensed clinician for clinical concerns. © ECQO Holdings.
          </p>
        </div>
      </section>
    </main>
  );
}
