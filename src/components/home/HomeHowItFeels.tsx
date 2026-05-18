import Image from 'next/image';
import ScrollFadeIn from './ScrollFadeIn';

// Note: stock photo content didn't match the original prompt's per-image
// descriptions verbatim. Images are mapped to outcomes by visual mood, not
// by literal description match.
interface Row {
  text: string;
  image?: { src: string; alt: string };
  side?: 'left' | 'right';
}

const ROWS: Row[] = [
  {
    text: 'You stop scanning the room for what could go wrong.',
    image: { src: '/images/wellness/reflection.jpg', alt: 'Hands holding a singing bowl during a quiet ritual' },
    side: 'left',
  },
  {
    text: 'A spilled coffee stops feeling like a life-or-death emergency.',
  },
  {
    text: 'Your jaw unclenches before you notice you were clenching it.',
    image: { src: '/images/wellness/nature.jpg', alt: 'A woman releasing tension during a workout, framed in soft light' },
    side: 'right',
  },
  {
    text: '"What if" loops in your head go quiet.',
    image: { src: '/images/wellness/connection.jpg', alt: 'A focused group working together in a warm interior' },
    side: 'left',
  },
  {
    text: 'You make eye contact again. You feel connection again.',
    image: { src: '/images/wellness/meditation.jpg', alt: 'A group practicing yoga together on a sunlit beach' },
    side: 'right',
  },
  {
    text: 'You stop needing to numb out at 9 PM.',
  },
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

        <div className="feel-stack">
          {ROWS.map((row, i) => (
            <ScrollFadeIn key={i} delay={120 + i * 80}>
              {row.image ? (
                <article className={`feel-row feel-row--${row.side}`}>
                  <div className="feel-row__media">
                    <Image
                      src={row.image.src}
                      alt={row.image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="feel-row__img"
                    />
                  </div>
                  <div className="feel-row__copy">
                    <span className="feel-row__accent" aria-hidden />
                    <p>{row.text}</p>
                  </div>
                </article>
              ) : (
                <article className="feel-row feel-row--text">
                  <span className="feel-row__accent" aria-hidden />
                  <p>{row.text}</p>
                </article>
              )}
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
