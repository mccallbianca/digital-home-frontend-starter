import Link from 'next/link';
import ScrollFadeIn from './ScrollFadeIn';

const LAYERS = [
  {
    n: 'ONE',
    title: 'Clinical Sonic Architecture',
    preview: 'Proprietary frequencies, tempo, and mixing methodology engineered by ECQO Holdings.',
    rest:
      ' Backed by peer-reviewed research linking music to parasympathetic activation, heart rate variability, and autonomic regulation. The specific protocols are trade-secret.',
  },
  {
    n: 'TWO',
    title: 'Affirmations Built For You',
    preview: 'HERR delivers daily affirmations written from your screener results.',
    rest:
      ' Personalized tier and above unlock delivery in your own cloned voice. Research in cognitive neuroscience shows that hearing your own voice activates self-referential brain networks more deeply than hearing others, making affirmations in your voice measurably more effective for self-regulation.',
  },
  {
    n: 'THREE',
    title: 'Culturally Responsive Sound',
    preview: 'Choose a genre that already speaks your language.',
    rest: ' Audio therapy lands harder when the sound feels like home.',
  },
];

const GENRES = ['Hip-Hop', 'R&B / Soul', 'Ambient', 'Classical', 'Lo-Fi', 'Jazz', 'Gospel', 'Latin'];

const MODES = [
  { name: 'Workout', body: 'Anchor identity while your body pushes limits.' },
  { name: 'Driving', body: 'Use the space between home and work to rewire your default thinking.' },
  { name: 'Sleep', body: 'Low-volume, slow-cadence delivery that works while you rest.' },
  { name: 'Morning', body: 'Set the tone before the world gets a vote.' },
  { name: 'Deep Work', body: 'Ambient pacing that keeps your focus aligned while you create.' },
  { name: 'Love + Family', body: 'Reprogram how you show up for the people who matter most.' },
  { name: 'Abundance', body: 'Interrupt the scripts that limit what you believe you deserve.' },
  { name: 'Healing', body: 'A regulated space to rewrite the stories that keep you stuck in pain.' },
];

const CITATIONS_VOICE = [
  'Jo HJ et al. (2024). Neural Effects of One\u2019s Own Voice on Self-Talk for Emotion Regulation. Brain Sciences, 14(7), 637.',
  'Morin A & Hamper B (2012). Self-Reflection and the Inner Voice. Open Neuroimaging Journal.',
  'Neural representations of own-voice in the human auditory cortex (2020). PMC7804419.',
];

const CITATIONS_MUSIC = [
  'Effect of music intervention on heart rate variability: a systematic review and meta-analysis (Frontiers in Psychology, 2026).',
  'Can music influence cardiac autonomic system? A systematic review (ScienceDirect, 2020).',
];

export default function HomeEcqoSound() {
  return (
    <section className="home-section home-section--ink" id="ecqo-sound" aria-labelledby="ecqo-sound-heading">
      <div className="home-section__inner">
        <ScrollFadeIn>
          <p className="home-eyebrow home-eyebrow--cream">ECQO SOUND™</p>
          <h2 id="ecqo-sound-heading" className="home-h2 home-h2--cream">
            The sound of regulation.
          </h2>
          <p className="home-lead home-lead--cream home-lead--wide">
            ECQO Sound is the proprietary sonic architecture inside HERR. Three layers, engineered to move
            the nervous system out of survival mode and into regulated action.
          </p>
        </ScrollFadeIn>

        <div className="layers-stack">
          {LAYERS.map((l, i) => (
            <ScrollFadeIn key={l.n} delay={120 + i * 100}>
              <details className="layer-card">
                <summary className="layer-card__summary">
                  <span className="layer-card__head">
                    <span className="layer-card__eyebrow">LAYER {l.n}</span>
                    <span className="layer-card__title">{l.title}</span>
                    <span className="layer-card__preview">{l.preview}</span>
                  </span>
                  <span className="layer-card__caret" aria-hidden>&#9656;</span>
                </summary>
                <p className="layer-card__rest">{l.rest}</p>
              </details>
            </ScrollFadeIn>
          ))}
        </div>

        <ScrollFadeIn delay={120}>
          <p className="genres-eyebrow">EIGHT GENRES</p>
          <ul className="genres-row" aria-label="Available genres">
            {GENRES.map((g, i) => (
              <li key={g} className="genres-row__item">
                {i > 0 && <span className="genres-row__dot" aria-hidden>·</span>}
                <span>{g}</span>
              </li>
            ))}
          </ul>
          <p className="genres-note">
            Select up to 2 genres per week. Personalized and Elite members. New genres added by member request.
          </p>
        </ScrollFadeIn>

        <ScrollFadeIn delay={120}>
          <p className="modes-eyebrow">EIGHT ACTIVITY MODES</p>
          <div className="modes-grid">
            {MODES.map((m) => (
              <div key={m.name} className="mode-card">
                <p className="mode-card__name">{m.name}</p>
                <p className="mode-card__body">{m.body}</p>
                {/* TODO: re-enable Preview buttons when ECQO Sound music tracks live in Supabase storage */}
                <p className="mode-card__status">Coming this week</p>
              </div>
            ))}
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={120}>
          <div className="ecqo-cta-row">
            <Link href="/ecqo-sound" className="home-link home-link--magenta">
              Explore ECQO Sound <span aria-hidden>→</span>
            </Link>
          </div>

          <details className="research-reveal">
            <summary className="research-reveal__summary">
              <span className="research-reveal__caret" aria-hidden>›</span>
              Read the research
            </summary>
            <div className="research-reveal__body">
              <p className="research-reveal__group">Voice and the brain:</p>
              <ol className="research-reveal__list">
                {CITATIONS_VOICE.map((c, i) => (
                  <li key={`v-${i}`}>{c}</li>
                ))}
              </ol>
              <p className="research-reveal__group">Music and nervous system regulation:</p>
              <ol className="research-reveal__list" start={4}>
                {CITATIONS_MUSIC.map((c, i) => (
                  <li key={`m-${i}`}>{c}</li>
                ))}
              </ol>
            </div>
          </details>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
