import ScrollFadeIn from './ScrollFadeIn';

const PROOFS = [
  {
    title: 'SAMHSA-Aligned',
    body: 'Trauma-informed protocols meeting Substance Abuse and Mental Health Services Administration standards.',
  },
  {
    title: 'HIPAA-Aligned',
    body: 'Privacy-first architecture. Your inner work stays yours.',
  },
  {
    title: 'Federal Advisory',
    body: 'Designed by a federal HHS and SAMHSA advisor on AI safety in behavioral health.',
  },
  {
    title: 'Clinically Validated',
    body: 'Built on six clinical domains drawn from validated instruments.',
  },
];

export default function HomeScience() {
  return (
    <section className="home-section home-section--ink" id="science" aria-labelledby="science-heading">
      <div className="home-section__inner">
        <ScrollFadeIn>
          <p className="home-eyebrow home-eyebrow--cream">THE SCIENCE</p>
          <h2 id="science-heading" className="home-h2 home-h2--cream">
            Built on 300 combined years of clinical and federal advisory expertise.
          </h2>
        </ScrollFadeIn>

        <ScrollFadeIn delay={120}>
          <div className="home-prose home-prose--cream">
            <p>
              HERR was designed by a licensed clinician with 30 years in behavioral sciences,
              in collaboration with an advisory team representing 300 combined years of expertise in
              clinical psychology, existential philosophy, federal AI safety, and performance science.
            </p>
            <p>
              Every domain, every screener question, every affirmation flow is grounded in validated
              clinical instruments and trauma-informed, evidence-based methodology.
            </p>
          </div>
        </ScrollFadeIn>

        <div className="proof-grid">
          {PROOFS.map((p, i) => (
            <ScrollFadeIn key={p.title} delay={120 + i * 90}>
              <div className="proof-chip">
                <p className="proof-chip__title">{p.title}</p>
                <p className="proof-chip__body">{p.body}</p>
              </div>
            </ScrollFadeIn>
          ))}
        </div>

        <p className="science-disclaimer">
          HERR is a wellness platform. It is not a substitute for licensed clinical care.
        </p>
      </div>
    </section>
  );
}
