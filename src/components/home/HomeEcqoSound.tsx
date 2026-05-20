import Link from 'next/link';
import ScrollFadeIn from './ScrollFadeIn';
import LayerCardReveal from './LayerCardReveal';

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

const GENRES = ['Hip-Hop', 'R&B / Soul', 'Ambient', 'Classical', 'Lo-Fi', 'Jazz', 'Gospel', 'Latin', 'Reggae'];

const SOUND_BUCKET = 'https://uyhfdtrvlhdhrhniysvw.supabase.co/storage/v1/object/public/ecqo-sound-tracks';

const MODES = [
  { name: 'Workout',       body: 'Anchor identity while your body pushes limits.',                          preview: `${SOUND_BUCKET}/ambient-workout-v1-639Hz.mp3` },
  { name: 'Driving',       body: 'Use the space between home and work to rewire your default thinking.',    preview: `${SOUND_BUCKET}/ambient-driving-v1-639Hz.mp3` },
  { name: 'Sleep',         body: 'Low-volume, slow-cadence delivery that works while you rest.',           preview: `${SOUND_BUCKET}/ambient-sleep-v1-174Hz.mp3` },
  { name: 'Morning',       body: 'Set the tone before the world gets a vote.',                              preview: `${SOUND_BUCKET}/ambient-morning-v1-528Hz.mp3` },
  { name: 'Deep Work',     body: 'Ambient pacing that keeps your focus aligned while you create.',         preview: `${SOUND_BUCKET}/ambient-deepwork-v1-432Hz.mp3` },
  { name: 'Love + Family', body: 'Reprogram how you show up for the people who matter most.',              preview: `${SOUND_BUCKET}/ambient-lovefamily-v1-528Hz.mp3` },
  { name: 'Abundance',     body: 'Interrupt the scripts that limit what you believe you deserve.',         preview: `${SOUND_BUCKET}/ambient-abundance-v1-528Hz.mp3` },
  { name: 'Healing',       body: 'A regulated space to rewrite the stories that keep you stuck in pain.', preview: `${SOUND_BUCKET}/ambient-healing-v1-174Hz.mp3` },
];

const CITATIONS_VOICE = [
  {
    label: 'Jo HJ et al. (2024). Neural Effects of One\u2019s Own Voice on Self-Talk for Emotion Regulation. Brain Sciences, 14(7), 637.',
    href: 'https://www.mdpi.com/2076-3425/14/7/637',
  },
  {
    label: 'Morin A & Hamper B (2012). Self-Reflection and the Inner Voice. Open Neuroimaging Journal.',
    href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3462327/',
  },
  {
    label: 'Hosaka T et al. (2021). Neural representations of own-voice in the human auditory cortex.',
    href: 'https://www.nature.com/articles/s41598-020-80095-6',
  },
];

const CITATIONS_MUSIC = [
  {
    label: 'Effect of music intervention on heart rate variability: a systematic review and meta-analysis (Frontiers in Psychology, 2026).',
    href: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2026.1750786/full',
  },
  {
    label: 'Mojtabavi H et al. (2020). Can music influence cardiac autonomic system? A systematic review (ScienceDirect).',
    href: 'https://www.sciencedirect.com/science/article/abs/pii/S1744388119302889',
  },
];

export default function HomeEcqoSound() {
  return (
    <section className="home-section home-section--ink" id="ecqo-sound" aria-labelledby="ecqo-sound-heading">
      <div className="home-section__inner">
        <ScrollFadeIn>
          <p className="home-eyebrow home-eyebrow--cream">ECQO SOUND&trade;</p>
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
            <LayerCardReveal key={l.n} index={i}>
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
            </LayerCardReveal>
          ))}
        </div>

        <ScrollFadeIn delay={120}>
          <p className="genres-eyebrow">NINE GENRES</p>
          <ul className="genres-row" aria-label="Available genres">
            {GENRES.map((g, i) => (
              <li key={g} className="genres-row__item">
                {i > 0 && <span className="genres-row__dot" aria-hidden>&middot;</span>}
                <span>{g}</span>
              </li>
            ))}
          </ul>
          <p className="genres-note">
            Select up to 2 genres per week. Personalized and Elite members. New genres added by member request.
          </p>
        </ScrollFadeIn>

        <ScrollFadeIn delay={120}>
          <h3 className="modes-subhead">Listen to HERR during 8 activity modes</h3>
          <div className="modes-grid">
            {MODES.map((m) => (
              <div key={m.name} className="mode-card">
                <p className="mode-card__name">{m.name}</p>
                <p className="mode-card__body">{m.body}</p>
                <a
                  href={m.preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mode-card__preview"
                  aria-label={`Preview the ${m.name} sample track`}
                >
                  <span aria-hidden>&#9654;</span> Preview
                </a>
              </div>
            ))}
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={120}>
          <div className="ecqo-cta-row">
            <Link href="/ecqo-sound" className="home-link home-link--magenta">
              Explore ECQO Sound <span aria-hidden>&rarr;</span>
            </Link>
          </div>

          <details className="research-reveal">
            <summary className="research-reveal__summary">
              <span className="research-reveal__caret" aria-hidden>&rsaquo;</span>
              Read the research
            </summary>
            <div className="research-reveal__body">
              <p className="research-reveal__group">Voice and the brain:</p>
              <ol className="research-reveal__list">
                {CITATIONS_VOICE.map((c, i) => (
                  <li key={`v-${i}`}>
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="research-reveal__link"
                    >
                      {c.label} <span aria-hidden>&#8599;</span>
                    </a>
                  </li>
                ))}
              </ol>
              <p className="research-reveal__group">Music and nervous system regulation:</p>
              <ol className="research-reveal__list" start={4}>
                {CITATIONS_MUSIC.map((c, i) => (
                  <li key={`m-${i}`}>
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="research-reveal__link"
                    >
                      {c.label} <span aria-hidden>&#8599;</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </details>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
