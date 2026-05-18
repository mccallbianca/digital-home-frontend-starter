import ScrollFadeIn from './ScrollFadeIn';
import KineticMissingLink from './KineticMissingLink';

const CARDS = [
  {
    eyebrow: 'WHAT THE INDUSTRY SAYS',
    title: 'The Motivational Strategists Say:',
    body: 'Try harder. Push through. Build better habits. Optimize your discipline.',
    variant: 'industry' as const,
  },
  {
    eyebrow: 'WHAT THE INDUSTRY SAYS',
    title: 'The Alignment & Attraction Coaches Say:',
    body: 'Raise your vibration. Manifest your reality. Align with your highest self.',
    variant: 'industry' as const,
  },
  {
    eyebrow: 'WHAT IS ACTUALLY HAPPENING',
    title: "What's actually happening:",
    body: 'Your nervous system is in survival mode. Neither strategy can land until the body feels safe.',
    variant: 'truth' as const,
  },
];

export default function HomeGap() {
  return (
    <section className="home-section home-section--cream" id="gap" aria-labelledby="gap-heading">
      <div className="home-section__inner">
        <ScrollFadeIn>
          <p className="home-eyebrow home-eyebrow--ink">THE GAP</p>
          <h2 id="gap-heading" className="home-h2 home-h2--ink gap-h2">
            <span className="gap-h2__line">You&rsquo;re not failing.</span>
            <span className="gap-h2__line">
              You&rsquo;re stuck <span className="home-h2__accent">in the Gap.</span>
            </span>
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
              That&rsquo;s not a strategy problem. That&rsquo;s not an alignment problem. That&rsquo;s not a motivation
              problem. Even the most well-trained performers in media, entertainment, sports, academia,
              finance and special workforces struggle to execute because the nervous system is unregulated
              and stuck in survival mode.
            </p>
          </div>
        </ScrollFadeIn>

        <div className="gap-cards">
          {CARDS.map((c, i) => (
            <ScrollFadeIn key={c.title} delay={200 + i * 120}>
              <article className={`gap-card gap-card--${c.variant}`}>
                <span className="gap-card__accent" aria-hidden />
                <p className="gap-card__eyebrow">{c.eyebrow}</p>
                <h3 className="gap-card__title">{c.title}</h3>
                <p className="gap-card__body">{c.body}</p>
              </article>
            </ScrollFadeIn>
          ))}
        </div>

        <KineticMissingLink />
      </div>
    </section>
  );
}
