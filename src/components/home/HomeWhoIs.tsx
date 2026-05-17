import ScrollFadeIn from './ScrollFadeIn';

const ROLES = [
  { name: 'The Performance Medic', tail: 'for the part of you chasing the strategy.' },
  { name: 'The Alignment Architect', tail: 'for the part of you chasing the vibration.' },
  { name: 'The Primary Stabilizer', tail: 'for when both parts are exhausted.' },
];

export default function HomeWhoIs() {
  return (
    <section className="home-section home-section--cream" id="who-herr-is" aria-labelledby="who-herr-is-heading">
      <div className="home-section__inner">
        <ScrollFadeIn>
          <p className="home-eyebrow home-eyebrow--ink">WHO HERR IS</p>
          <h2 id="who-herr-is-heading" className="home-h2 home-h2--ink">
            Not another coach. Not another guru.
            <br />
            <span className="home-h2__accent">The Quiet Professional.</span>
          </h2>
        </ScrollFadeIn>

        <ScrollFadeIn delay={120}>
          <div className="home-prose home-prose--ink">
            <p>
              You already have enough motivators. Enough teachers.
              Enough people telling you what you should be doing differently.
            </p>
            <p>
              HERR is none of those. HERR is the calm, data-driven partner in the room when the noise gets loud.
              HERR doesn&rsquo;t ask you to believe harder or try harder. HERR shows you what&rsquo;s happening in your body,
              gives it the safety it needs to come back online, and lets your brain catch up to the life you&rsquo;re
              already building.
            </p>
          </div>
        </ScrollFadeIn>

        <div className="roles-stack">
          {ROLES.map((r, i) => (
            <ScrollFadeIn key={r.name} delay={200 + i * 100}>
              <div className="role-row">
                <span className="role-row__accent" aria-hidden />
                <p>
                  <strong className="role-row__name">{r.name}</strong>
                  <span className="role-row__sep"> — </span>
                  <span className="role-row__tail">{r.tail}</span>
                </p>
              </div>
            </ScrollFadeIn>
          ))}
        </div>

        <ScrollFadeIn delay={520}>
          <blockquote className="hull-quote">
            If the strategists are the engine and the aligners are the compass, HERR is the hull of the ship.
          </blockquote>
          <p className="home-prose home-prose--ink home-prose--centered">
            Without HERR, the engine shakes you apart and the compass is unreadable through the storm.
            HERR makes the vessel strong enough to handle the journey.
          </p>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
