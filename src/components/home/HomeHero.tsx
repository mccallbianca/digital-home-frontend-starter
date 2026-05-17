import Link from 'next/link';

const H1_WORDS_LINE_1 = ["You've", 'done', 'the', 'work.'];
const H1_WORDS_LINE_2 = ['Why', "isn't", 'it', 'working?'];

export default function HomeHero() {
  let delayStep = 0;
  const stagger = (n: number) => `${100 + n * 90}ms`;

  return (
    <section className="home-hero" aria-label="HERR hero">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/hero-poster.jpg"
        className="home-hero__video home-hero__video--desktop"
      >
        <source src="/videos/hero-loop.mp4" type="video/mp4" />
      </video>
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/hero-poster.jpg"
        className="home-hero__video home-hero__video--mobile"
      >
        <source src="/videos/hero-loop-mobile.mp4" type="video/mp4" />
      </video>

      <div className="home-hero__overlay" aria-hidden />

      <div className="home-hero__content">
        <p className="home-eyebrow home-eyebrow--reveal">A PRODUCT OF ECQO HOLDINGS™</p>

        <h1 className="home-hero__title">
          <span className="home-hero__line">
            {H1_WORDS_LINE_1.map((w) => {
              const i = delayStep++;
              return (
                <span key={`l1-${i}`} className="home-hero__word" style={{ animationDelay: stagger(i) }}>
                  {w}
                </span>
              );
            })}
          </span>
          <span className="home-hero__line">
            {H1_WORDS_LINE_2.map((w) => {
              const i = delayStep++;
              return (
                <span key={`l2-${i}`} className="home-hero__word" style={{ animationDelay: stagger(i) }}>
                  {w}
                </span>
              );
            })}
          </span>
        </h1>

        <p className="home-hero__subhead">
          The strategies aren&rsquo;t broken. Your nervous system is stuck in survival mode,
          and your brain can&rsquo;t see the path forward through the noise.
        </p>

        {/* ECQO Sound visualizer pulse */}
        <div className="home-hero__pulse" aria-hidden>
          <span /><span /><span /><span /><span />
          <span /><span /><span /><span /><span />
        </div>

        <div className="home-hero__ctas">
          <Link href="/assessment" className="home-btn home-btn--primary">
            Find Your Gap <span aria-hidden>→</span>
          </Link>
          <a href="#how-it-feels" className="home-btn home-btn--ghost-light">
            See How It Feels <span aria-hidden>↓</span>
          </a>
        </div>

        <p className="home-hero__trust">
          Designed by a licensed clinician · For athletes, executives, professionals, performers, healers, and leaders.
        </p>
      </div>

      <div className="home-hero__accent-line" aria-hidden />
    </section>
  );
}
