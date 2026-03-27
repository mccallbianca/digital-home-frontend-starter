import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services — [YOUR BRAND]',
  description: '[Describe your services here]',
};

export default function ServicesPage() {
  return (
    <main>
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4">
            Services
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            [How You Help Your Clients]
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl">
            [A clear description of your service offerings and who they are for.]
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {[
            { name: 'Service One', desc: 'What this service delivers and who it is for.' },
            { name: 'Service Two', desc: 'What this service delivers and who it is for.' },
            { name: 'Service Three', desc: 'What this service delivers and who it is for.' },
          ].map((service) => (
            <div key={service.name} className="border border-neutral-800 p-8">
              <h2 className="text-xl font-semibold text-white mb-3">[{service.name}]</h2>
              <p className="text-neutral-400 mb-6">[{service.desc}]</p>
              <a href="/contact" className="text-sm text-white underline underline-offset-4">
                Learn more →
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
