import ScrollFadeIn from './ScrollFadeIn';

const OUTCOMES = [
  'You stop scanning the room for what could go wrong.',
  'A spilled coffee stops feeling like a life-or-death emergency.',
  'Your jaw unclenches before you notice you were clenching it.',
  'The "what if" loop in your head goes quiet.',
  'You make eye contact again. You feel connection again.',
  'You stop needing to numb out at 9 PM.',
];

export default function HomeHowItFeels() {
  return (
    <section className="home-section home-section--ink" id="how-it-feels" aria-labelledby="how-it-feels-heading">
      <div className="home-section__inner">
        <ScrollFadeIn>
          <p className="home-eyebrow home-eyebrow--cream">HOW IT FEELS</p>
          <h2 id="how-it-feels-heading" className="home-h2 home-h2--cream">
            What changes after two weeks.
          </h2>
          <p className="home-lead home-lead--cream">Not in clinical terms. In your actual life.</p>
        </ScrollFadeIn>

        <div className="feel-grid">
          {OUTCOMES.map((line, i) => (
            <ScrollFadeIn key={i} delay={120 + i * 80}>
              <article className="feel-card">
                <span className="feel-card__accent" aria-hidden />
                <p>{line}</p>
              </article>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
