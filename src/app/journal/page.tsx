{/*
  TODO - BACKEND PIPELINE (requires separate session):
  - Fix automation to generate journal articles every Tuesday and Thursday
  - Articles must flow to: https://herr-backend.mccall-bianca.workers.dev/content
  - Backend content management needs: Planned → Approved → Writing → Draft → Published → Archived workflow
  - Current articles do not appear in the backend admin where Bianca can edit/archive them
  - This requires backend + Cloudflare Workers investigation, not frontend changes
*/}

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ScrollFadeIn from '@/components/home/ScrollFadeIn';
import CrisisResource from '@/components/ui/CrisisResource';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The HERR Journal | Clinical Insights for the Inner Voice',
  description:
    'Clinical insight, existential psychology, and the science of the inner voice. Thought leadership from Bianca D. McCall, LMFT, Founder of HERR and ECQO Holdings.',
};

/* ── Static articles (must match Home page JOURNAL_PREVIEW) ──────────── */

const STATIC_ARTICLES = [
  {
    slug: 'understanding-your-inner-conductor',
    image: '/images/dim-existential-figure-void.jpg',
    category: 'Performance',
    title: 'Understanding Your Inner Conductor',
    excerpt: 'The conductor of your life is not your talent, your training, or your discipline. It is the voice only you can hear.',
    readTime: '5 min read',
    author: 'Bianca D. McCall, LMFT',
  },
  {
    slug: 'science-of-voice-based-reprogramming',
    image: '/images/dim-emotional-eye-release.jpg',
    category: 'Clinical',
    title: 'The Science of Voice-Based Reprogramming',
    excerpt: 'Why every attempt to install new beliefs fails without first calming the nervous system.',
    readTime: '4 min read',
    author: 'Bianca D. McCall, LMFT',
  },
  {
    slug: 'why-your-voice-is-your-most-powerful-tool',
    image: '/images/dim-executive-hand-decides.jpg',
    category: 'Mindset',
    title: 'Why Your Voice Is Your Most Powerful Tool',
    excerpt: 'Self-referential processing is not a theory. It is the mechanism that makes HERR different.',
    readTime: '6 min read',
    author: 'Bianca D. McCall, LMFT',
  },
];

/* Title to exclude: contradicts core philosophy */
const EXCLUDED_TITLES = ['The Inner Voice Is Not Yours'];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function estimateReadingTime(body: string | null): number {
  if (!body) return 5;
  const words = body.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function JournalPage() {
  const supabase = await createClient();

  const { data: articles, error } = await supabase
    .from('content_objects')
    .select('slug, title, excerpt, content_type, semantic_tags, published_at, featured_image_url, body, author_name')
    .eq('status', 'published')
    .eq('content_type', 'article')
    .order('published_at', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('[journal] Query error:', error.message);
  }

  /* Filter out excluded titles, then normalize shape */
  const dbArticles = (articles || [])
    .filter((a) => !EXCLUDED_TITLES.includes(a.title))
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt || '',
      category: (a.semantic_tags as string[] | null)?.[0] || '',
      published_at: a.published_at || '',
      readTime: `${estimateReadingTime(a.body)} min read`,
      image: a.featured_image_url || '',
      author: a.author_name || 'Bianca D. McCall, LMFT',
    }));

  /* Merge: DB articles first, then static articles not already present */
  const dbSlugs = new Set(dbArticles.map((a) => a.slug));
  const staticFill = STATIC_ARTICLES.filter((a) => !dbSlugs.has(a.slug)).map((a) => ({
    ...a,
    published_at: '',
  }));
  const allArticles = [...dbArticles, ...staticFill];

  /* ── Empty state ─────────────────────────────────────────────────── */
  if (allArticles.length === 0) {
    return (
      <main style={{ minHeight: '100vh', background: '#0A0A0F' }}>
        <section
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '120px 24px 80px',
          }}
        >
          <div style={{ maxWidth: 640, textAlign: 'center' }}>
            <p
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '2.5px',
                color: '#C42D8E',
                marginBottom: 16,
              }}
            >
              THE HERR JOURNAL
            </p>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 600,
                color: '#FFFFFF',
                marginBottom: 16,
                lineHeight: 1.15,
              }}
            >
              Clinical insights for the inner voice.
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.6)', marginBottom: 32, lineHeight: 1.6 }}>
              The HERR Journal publishes thought leadership on existential psychology, the inner voice,
              elite performance, and behavioral wellness. Written by Bianca D. McCall, LMFT. Articles coming soon.
            </p>
            <Link
              href="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 48,
                padding: '0 32px',
                background: '#C42D8E',
                color: '#FFFFFF',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textDecoration: 'none',
              }}
            >
              Begin Your Reprogramming
            </Link>
          </div>
        </section>
        <CrisisResource variant="light" />
      </main>
    );
  }

  const featured = allArticles[0];
  const rest = allArticles.slice(1);

  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0F' }}>

      {/* ── Hero (dark) ─────────────────────────────────────────────── */}
      <section
        style={{
          background: '#0A0A0F',
          padding: 'clamp(80px, 12vw, 120px) 24px clamp(24px, 4vw, 40px)',
          textAlign: 'center',
        }}
      >
        <ScrollFadeIn>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 600,
              color: '#FFFFFF',
              marginBottom: 12,
              lineHeight: 1.15,
            }}
          >
            The HERR Journal
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.6)' }}>
            Clinical insights for the inner voice.
          </p>
        </ScrollFadeIn>
      </section>

      {/* ── Featured Article (warm) ─────────────────────────────────── */}
      <section style={{ background: '#FAF8F5', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <ScrollFadeIn>
            <Link href={`/journal/${featured.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div
                className="featured-article"
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                }}
              >
                <div className="featured-layout">
                  {featured.image && (
                    <div className="featured-image" style={{ position: 'relative', aspectRatio: '16/9' }}>
                      <Image
                        src={featured.image}
                        alt={featured.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  )}
                  <div style={{ padding: 40 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        background: '#C42D8E',
                        color: '#FFFFFF',
                        fontSize: 10,
                        textTransform: 'uppercase',
                        borderRadius: 12,
                        padding: '4px 10px',
                        marginBottom: 12,
                      }}
                    >
                      Featured
                    </span>
                    <h2
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: 'clamp(22px, 3vw, 28px)',
                        fontWeight: 600,
                        color: '#1A1A2E',
                        marginBottom: 12,
                        lineHeight: 1.3,
                      }}
                    >
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p
                        style={{
                          fontSize: '1.125rem',
                          color: '#1A1A2E',
                          lineHeight: 1.6,
                          marginBottom: 16,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {featured.excerpt}
                      </p>
                    )}
                    <p style={{ fontSize: 13, color: '#6B6B7B' }}>
                      {featured.author}{featured.published_at ? ` · ${formatDate(featured.published_at)}` : ''} · {featured.readTime}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Article Grid (dark) ─────────────────────────────────────── */}
      {rest.length > 0 && (
        <section style={{ background: '#0A0A0F', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="article-grid">
              {rest.map((article, i) => (
                <ScrollFadeIn key={article.slug} delay={i * 100}>
                  <Link
                    href={`/journal/${article.slug}`}
                    style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                  >
                    <div
                      className="journal-card"
                      style={{
                        background: '#16161F',
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.08)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {article.image && (
                        <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                          <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover journal-card-img"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
                        {article.category && (
                          <span
                            style={{
                              display: 'inline-block',
                              background: '#C42D8E',
                              color: '#FFFFFF',
                              fontSize: 10,
                              textTransform: 'uppercase',
                              borderRadius: 12,
                              padding: '3px 10px',
                              width: 'fit-content',
                              marginBottom: 12,
                            }}
                          >
                            {article.category}
                          </span>
                        )}
                        <h3
                          style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: 20,
                            fontWeight: 600,
                            color: '#FFFFFF',
                            marginBottom: 8,
                            lineHeight: 1.3,
                          }}
                        >
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p
                            style={{
                              fontSize: '1.125rem',
                              color: 'rgba(255,255,255,0.6)',
                              lineHeight: 1.5,
                              flex: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {article.excerpt}
                          </p>
                        )}
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>
                          {article.readTime}
                        </p>
                      </div>
                    </div>
                  </Link>
                </ScrollFadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA (warm) ─────────────────────────────────────────────── */}
      <section
        style={{
          background: '#FAF8F5',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <ScrollFadeIn>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 600,
              color: '#1A1A2E',
              fontStyle: 'italic',
              maxWidth: 600,
              margin: '0 auto 32px',
              lineHeight: 1.3,
            }}
          >
            &ldquo;The inner voice is the conductor of every performance.&rdquo;
          </p>
          <Link
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 48,
              padding: '0 40px',
              background: '#C42D8E',
              color: '#FFFFFF',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textDecoration: 'none',
            }}
          >
            Begin Your Reprogramming
          </Link>
        </ScrollFadeIn>
      </section>

      {/* ── Responsive Styles ──────────────────────────────────────── */}
      <style>{`
        .featured-layout {
          display: grid;
          grid-template-columns: 50% 50%;
        }
        .article-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .journal-card-img {
          transition: transform 300ms ease;
        }
        .journal-card:hover .journal-card-img {
          transform: scale(1.03);
        }
        @media (max-width: 1024px) {
          .article-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .featured-layout { grid-template-columns: 1fr; }
          .article-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <CrisisResource variant="light" />
    </main>
  );
}
