import Link from 'next/link';
import ScrollFadeIn from './ScrollFadeIn';

const CLOSING_LINES = ['Reclaim Your Power.', 'Protect Your Peace.', 'Heal with HERR.'];

export default function HomeInvitation() {
  return (
    <section className="home-section home-section--ink home-section--center" id="invitation" aria-labelledby="invitation-heading">
      <div className="home-section__inner">
        <ScrollFadeIn>
          <h2 id="invitation-heading" className="home-h2 home-h2--cream home-h2--massive">
            Find your Gap.
          </h2>
          <p className="home-lead home-lead--cream home-lead--centered">
            Free in five minutes. No diagnosis. No spam. A clinical baseline you can act on tonight.
          </p>
        </ScrollFadeIn>

        <ScrollFadeIn delay={160}>
          <div className="invitation-cta">
            <Link href="/assessment" className="home-btn home-btn--primary home-btn--xl">
              Take the Screener <span aria-hidden>→</span>
            </Link>
            <p className="invitation-trust">
              Free tier available. No credit card required.
            </p>
          </div>
        </ScrollFadeIn>

        <div className="closing-credits">
          {CLOSING_LINES.map((line, i) => (
            <ScrollFadeIn key={i} delay={120 + i * 220}>
              <p className="closing-credits__line">{line}</p>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
