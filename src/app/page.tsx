export default function HomePage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6">
            [Your Tagline]
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            [Your Headline Goes Here]
          </h1>
          <p className="text-lg text-neutral-400 mb-10 max-w-xl mx-auto">
            [A short description of what you do and who you help. Keep it clear and direct.]
          </p>
          <a
            href="/contact"
            className="inline-block text-sm font-semibold uppercase tracking-wider bg-white text-black px-8 py-3 hover:bg-transparent hover:text-white border border-white transition-all"
          >
            [Your CTA]
          </a>
        </div>
      </section>

      {/* ── Services Preview ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-12">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {['Service One', 'Service Two', 'Service Three'].map((s) => (
              <div key={s} className="border border-neutral-800 p-8">
                <h3 className="text-lg font-semibold text-white mb-3">[{s}]</h3>
                <p className="text-sm text-neutral-400">
                  [Describe this service. What problem does it solve? Who is it for?]
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">
            [Your Closing Statement]
          </h2>
          <a
            href="/contact"
            className="inline-block text-sm font-semibold uppercase tracking-wider bg-white text-black px-8 py-3 hover:bg-transparent hover:text-white border border-white transition-all"
          >
            [Your CTA]
          </a>
        </div>
      </section>
    </main>
  );
}
