import Image from 'next/image';
import ScrollFadeIn from './ScrollFadeIn';

const ARCHETYPES = [
  {
    slug: 'the-athlete',
    title: 'THE ATHLETE',
    body: "You're battling the noise of critics and the isolation of a game that no longer feels like home.",
  },
  {
    slug: 'the-executive',
    title: 'THE EXECUTIVE',
    body: "You're struggling to balance the business and the life, and it's lonely at the top.",
  },
  {
    slug: 'the-first-responder',
    title: 'THE FIRST RESPONDER',
    body: 'The shift ended hours ago, but your body is still on the scene, unable to find the off switch, and your family often receives the blowback.',
  },
  {
    slug: 'the-performer',
    title: 'THE PERFORMER',
    body: 'You give everything to the craft, to the audience, to the life, leaving you a ghost of yourself, hollow and unable to be truly present once the curtain falls.',
  },
  {
    slug: 'the-healer',
    title: 'THE HEALER',
    body: "You are the sanctuary for everyone else's trauma, but you've been running on empty for so long that your own spirit is struggling.",
  },
  {
    slug: 'the-leader',
    title: 'THE LEADER',
    body: 'You carry the livelihoods of a team on your shoulders, and the gravity of that responsibility keeps you wide awake at 3 AM, every single night.',
  },
];

export default function HomeWhoFor() {
  return (
    <section className="home-section home-section--cream" id="who-its-for" aria-labelledby="who-its-for-heading">
      <div className="home-section__inner">
        <ScrollFadeIn>
          <p className="home-eyebrow home-eyebrow--ink">WHO IT&rsquo;S FOR</p>
          <h2 id="who-its-for-heading" className="home-h2 home-h2--ink">
            You know which one you are.
          </h2>
        </ScrollFadeIn>

        <div className="archetype-grid">
          {ARCHETYPES.map((a, i) => (
            <ScrollFadeIn key={a.slug} delay={100 + (i % 3) * 90}>
              <article className="archetype-card">
                <div className="archetype-card__accent" aria-hidden />
                <div className="archetype-card__media">
                  <Image
                    src={`/images/archetypes/${a.slug}.png`}
                    alt={`${a.title} archetype portrait`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="archetype-card__img"
                  />
                  <div className="archetype-card__scrim" aria-hidden />
                </div>
                <div className="archetype-card__body">
                  <h3 className="archetype-card__title">{a.title}</h3>
                  <p className="archetype-card__text">{a.body}</p>
                </div>
              </article>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
