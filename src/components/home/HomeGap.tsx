import ScrollFadeIn from './ScrollFadeIn';

const COLUMNS = [
  {
    label: 'The Strategists say:',
    body: 'Take massive action. Push through. Crush your limiting beliefs.',
  },
  {
    label: 'The Aligners say:',
    body: 'Let go. Allow. Get into the Vortex.',
  },
  {
    label: "What's actually happening:",
    body: 'Your nervous system is in survival mode. Neither strategy can land until the body feels safe.',
  },
];

export default function HomeGap() {
  return (
    <section className="home-section home-section--cream" id="the-gap" aria-labelledby="the-gap-heading">
      <div className="home-section__inner">
        <ScrollFadeIn>
          <p className="home-eyebrow home-eyebrow--ink">THE GAP</p>
          <h2 id="the-gap-heading" className="home-h2 home-h2--ink">
            You&rsquo;re not failing. You&rsquo;re stuck in the Gap.
          </h2>
        </ScrollFadeIn>

        <ScrollFadeIn delay={120}>
          <div className="home-prose home-prose--ink">
            <p>
              You&rsquo;ve read every book. Taken every course. Tried every framework. You&rsquo;ve got the planners,
              the 5 AM routines, the breathwork apps, the cold plunges, the journaling practice,
              the supplements, the therapist.
            </p>
            <p>
              And you&rsquo;re still stuck in the same loop. One day you tell yourself you need to push harder.
              The next you tell yourself you need to let go. Neither lands. The result is the same.
              You feel like you&rsquo;re doing everything and getting nowhere.
            </p>
            <p>
              That&rsquo;s not a strategy problem. That&rsquo;s not an alignment problem.
              Your body never got the message that the war is over.
            </p>
          </div>
        </ScrollFadeIn>

        <div className="gap-grid">
          {COLUMNS.map((c, i) => (
            <ScrollFadeIn key={c.label} delay={200 + i * 100}>
              <div className="gap-col">
                <p className="gap-col__label">{c.label}</p>
                <p className="gap-col__body">{c.body}</p>
              </div>
            </ScrollFadeIn>
          ))}
        </div>

        <ScrollFadeIn delay={520}>
          <p className="home-closing-line">HERR is the missing link.</p>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
