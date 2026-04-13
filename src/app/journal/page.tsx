import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import CrisisResource from '@/components/ui/CrisisResource';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The HERR Journal | Clinical Insights for the Inner Voice',
  description:
    'Clinical insight, existential psychology, and the science of the inner voice. Thought leadership from Bianca D. McCall, LMFT, Founder of HERR and ECQO Holdings.',
};

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

  const allArticles = (articles || []).map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt || '',
    semantic_tags: a.semantic_tags || [],
    content_type: a.content_type,
    published_at: a.published_at || '',
    reading_time: estimateReadingTime(a.body),
    image: a.featured_image_url || '',
    author: a.author_name || 'Bianca D. McCall, LMFT',
  }));

  // Empty state
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
          <div
            style={{
              maxWidth: 640,
              textAlign: 'center',
            }}
          >
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
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 32, lineHeight: 1.6 }}>
              The HERR journal publishes thought leadership on existential psychology, the inner voice,
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
      </main>
    );
  }

  const featured = allArticles[0];
  const rest = allArticles.slice(1);

  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0F' }}>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        style={{
          background: '#0A0A0F',
          padding: 'clamp(80px, 12vw, 120px) 24px clamp(24px, 4vw, 40px)',
          textAlign: 'center',
        }}
      >
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
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>
          Clinical insights for the inner voice.
        </p>
      </section>

      {/* ── Featured Article ────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link href={`/journal/${featured.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
            <div
              className="featured-article"
              style={{
                background: '#16161F',
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="featured-layout">
                {/* Image */}
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

                {/* Content */}
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
                      color: '#FFFFFF',
                      marginBottom: 12,
                      lineHeight: 1.3,
                    }}
                  >
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p
                      style={{
                        fontSize: 16,
                        color: 'rgba(255,255,255,0.6)',
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
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                    {featured.author} · {formatDate(featured.published_at)} · {featured.reading_time} min read
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Article Grid ────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="article-grid">
              {rest.map((article) => (
                <Link
                  key={article.slug}
                  href={`/journal/${article.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
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
                      {article.semantic_tags?.[0] && (
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
                          {article.semantic_tags[0]}
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
                            fontSize: 14,
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
                        {article.reading_time} min read
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Responsive Styles ───────────────────────────────────────── */}
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
