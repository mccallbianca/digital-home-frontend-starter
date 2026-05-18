import ScrollFadeIn from './ScrollFadeIn';
import EcqoArchitectureBeam from './EcqoArchitectureBeam';

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
              HERR was designed by Bianca D. McCall, a licensed clinician with 30 years in the behavioral
              sciences, in collaboration with an advisory team representing 300 combined years of expertise
              in clinical psychology, behavioral health disciplines, existential philosophy, performance
              science, technology and government.
            </p>
            <p>
              Every domain, every screener question, every affirmation flow is grounded in validated
              clinical instruments and trauma-informed, evidence-based methodology.
            </p>
          </div>
        </ScrollFadeIn>

        <div className="ecqo-architecture">
          <ScrollFadeIn delay={120}>
            <p className="home-eyebrow ecqo-architecture__eyebrow">POWERED BY ECQO</p>
            <p className="ecqo-architecture__body">
              Powered by ECQO &mdash; the world&rsquo;s first safe source code that supports most tech stacks
              with clinical-grade guardrails, protocols and response logic, designed and developed by
              clinical experts, researchers, and scientists.
            </p>
          </ScrollFadeIn>
          <EcqoArchitectureBeam />
        </div>

        <p className="science-disclaimer">
          HERR is a wellness platform. It is not a substitute for licensed clinical care.
        </p>
      </div>
    </section>
  );
}
