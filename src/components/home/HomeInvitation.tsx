import Link from 'next/link';
import ScrollFadeIn from './ScrollFadeIn';

const CLOSING_LINES = ['Reclaim Your Power.', 'Protect Your Peace.', 'Heal with HERR.'];

export default function HomeInvitation() {
  return (
    <section className="home-section home-section--ink home-section--center" id="invitation" aria-labelledby="invitation-heading">
      <div className="home-section__inner">
        <ScrollFadeIn delay={160}>
          <div className="invitation-cta">
            <Link href="/assessment" className="home-btn home-btn--primary home-btn--xl">
              Complete the Self-Screen <span aria-hidden>&rarr;</span>
            </Link>
            <p className="invitation-trust">
              Start Your Free Trial Today.
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
