import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — [YOUR BRAND]',
  description: '[How to get in touch with you]',
};

export default function ContactPage() {
  return (
    <main>
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4">
            Contact
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            [Let&apos;s Talk]
          </h1>
          <p className="text-lg text-neutral-400 mb-12">
            [A short note about how you like to work with people. Keep it human.]
          </p>

          <div className="space-y-8">
            <div className="border border-neutral-800 p-6">
              <h3 className="text-white font-semibold mb-2">Email</h3>
              <p className="text-neutral-400">[your@email.com]</p>
            </div>

            <div className="border border-neutral-800 p-6">
              <h3 className="text-white font-semibold mb-2">Book a Call</h3>
              <p className="text-neutral-400">
                [Add your Calendly, Cal.com, or booking link here]
              </p>
            </div>

            <div className="border border-neutral-800 p-6">
              <h3 className="text-white font-semibold mb-2">Community</h3>
              <p className="text-neutral-400">
                [Link to your community — Skool, Discord, Slack, etc.]
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
