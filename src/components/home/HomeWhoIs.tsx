import ScrollFadeIn from './ScrollFadeIn';

export default function HomeWhoIs() {
  return (
    <section className="home-section home-section--cream" id="who-herr-is" aria-labelledby="who-herr-is-heading">
      <div className="home-section__inner">
        <ScrollFadeIn>
          <p className="home-eyebrow home-eyebrow--ink">WHO HERR IS</p>
          <h2 id="who-herr-is-heading" className="home-h2 home-h2--ink whois-h2">
            <span className="whois-h2__line">Not another coach.</span>
            <span className="whois-h2__line">Not another guru.</span>
            <span className="whois-h2__line home-h2__accent">Your Private Existentialist.</span>
          </h2>
        </ScrollFadeIn>

        <ScrollFadeIn delay={120}>
          <div className="home-prose home-prose--ink">
            <p>
              You already have enough motivators. Enough teachers.
              Enough people telling you what you should be doing differently.
            </p>
            <p>
              HERR is none of those. HERR is the calm, data-driven partner in the room when your body&rsquo;s
              survival mechanics are actively overriding your strategy. HERR doesn&rsquo;t ask you to believe
              harder or try harder. HERR shows you exactly what is happening physiologically, provides
              the biological safety your nervous system needs to come back online, and allows your brain
              to finally catch up to the life you are already building.
            </p>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
