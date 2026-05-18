import Link from 'next/link';

const H1_WORDS_LINE_1 = ["You\u2019ve", 'done', 'the', 'work.'];
const H1_WORDS_LINE_2 = ['Why', 'isn\u2019t', 'it', 'working?'];

export default function HomeHero() {
  let delayStep = 0;
  const stagger = (n: number) => `${100 + n * 90}ms`;

  return (
    <section className="home-hero" aria-label="HERR hero">
      <div className="home-hero__grid">
        {/* Copy column (left, 60% desktop) */}
        <div className="home-hero__copy">
          <p className="home-eyebrow home-eyebrow--reveal">POWERED BY ECQO</p>

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

          {/* ECQO Sound visualizer pulse under H1 */}
          <div className="home-hero__pulse" aria-hidden>
            <span /><span /><span /><span /><span />
            <span /><span /><span /><span /><span />
          </div>

          <p className="home-hero__subhead">
            Even the most well-trained performers struggle to execute because the nervous system
            is unregulated and stuck in survival mode.
          </p>

          <div className="home-hero__ctas">
            <Link href="/assessment" className="home-btn home-btn--primary">
              Complete the Self-Screen <span aria-hidden>&rarr;</span>
            </Link>
            <a href="#how-it-feels" className="home-btn home-btn--ghost-light">
              See Results <span aria-hidden>&darr;</span>
            </a>
          </div>

          <p className="home-hero__trust">
            Designed by a licensed clinician with 30 years in behavioral sciences.
          </p>
        </div>

        {/* Video column (right, 40% desktop) — contained 16:9 frame */}
        <div className="home-hero__media">
          <div className="home-hero__frame" aria-hidden>
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/hero-poster.jpg"
              className="home-hero__video"
            >
              <source src="/videos/hero-loop.mp4" type="video/mp4" />
            </video>
          </div>

          <figcaption className="home-hero__caption">
            <p className="home-hero__caption-eyebrow">FOUNDER</p>
            <p className="home-hero__caption-name">Bianca D. McCall, M.A., LMFT</p>
            <p className="home-hero__caption-credentials">
              <span>Government Consultant</span>
              <span className="home-hero__caption-dot" aria-hidden>&middot;</span>
              <span>TED Speaker</span>
              <span className="home-hero__caption-dot" aria-hidden>&middot;</span>
              <span>Retired Pro Athlete</span>
            </p>
          </figcaption>
        </div>
      </div>

      <div className="home-hero__accent-line" aria-hidden />
    </section>
  );
}
