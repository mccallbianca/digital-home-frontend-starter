import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — [YOUR BRAND]',
  description: '[Your brand story and mission]',
};

export default function AboutPage() {
  return (
    <main>
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4">
            About
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            [Your Brand Story]
          </h1>
          <p className="text-lg text-neutral-400">
            [Tell your story here. Who are you? Why did you start this? What drives you?
            This is where visitors connect with the human behind the brand.]
          </p>
        </div>
      </section>

      {/* ── Values / Beliefs ── */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">What We Believe</h2>
          <div className="space-y-6">
            {[
              'You should own your digital infrastructure, not rent it.',
              'AI should amplify your voice, not replace it.',
              'Great systems beat great hustle every time.',
            ].map((belief) => (
              <div key={belief} className="border-l-2 border-neutral-700 pl-6">
                <p className="text-neutral-300">[{belief}]</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">The Team</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { name: '[Your Name]', role: '[Founder & CEO]' },
              { name: '[Team Member]', role: '[Their Role]' },
            ].map((member) => (
              <div key={member.name} className="border border-neutral-800 p-6">
                <div className="w-16 h-16 bg-neutral-800 rounded-full mb-4" />
                <h3 className="text-white font-semibold">{member.name}</h3>
                <p className="text-sm text-neutral-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
