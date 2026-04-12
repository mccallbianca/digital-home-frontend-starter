import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('content_objects')
    .select('title, excerpt, seo_meta(title, description, og_image_url)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!data) return { title: 'Article Not Found — HERR' };

  const seo = Array.isArray(data.seo_meta) ? data.seo_meta[0] : data.seo_meta;

  return {
    title: seo?.title || `${data.title} — HERR Journal`,
    description: seo?.description || data.excerpt || '',
    openGraph: seo?.og_image_url ? { images: [seo.og_image_url] } : undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from('content_objects')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!article) notFound();

  const readingTime = estimateReadingTime(article.body);
  const publishedAt = article.published_at || article.created_at;
  const authorName = article.author_name || 'Bianca D. McCall, LMFT';

  // Fetch related articles
  const { data: related } = await supabase
    .from('content_objects')
    .select('slug, title, featured_image_url, semantic_tags, body')
    .eq('status', 'published')
    .eq('content_type', 'article')
    .neq('slug', slug)
    .order('published_at', { ascending: false })
    .limit(3);

  const relatedArticles = (related || []).map((a) => ({
    slug: a.slug,
    title: a.title,
    image: a.featured_image_url || '',
    tag: (a.semantic_tags || [])[0] || '',
    readTime: estimateReadingTime(a.body),
  }));

  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0F' }}>

      {/* ── Back link ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '100px 24px 0' }}>
        <Link
          href="/journal"
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: 32,
          }}
        >
          &larr; Back to Journal
        </Link>
      </div>

      {/* ── Hero Image ──────────────────────────────────────────────── */}
      {article.featured_image_url && (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 40px' }}>
          <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', aspectRatio: '16/9' }}>
            <Image
              src={article.featured_image_url}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* ── Title + Author ──────────────────────────────────────────── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 40px' }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 600,
            color: '#FFFFFF',
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          {article.title}
        </h1>

        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          {/* Avatar placeholder */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#16161F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            BM
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
            {authorName} · {formatDate(publishedAt)} · {readingTime} min read
          </p>
        </div>
      </div>

      {/* ── Article Body ────────────────────────────────────────────── */}
      <article style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 64px' }}>
        {article.body && (
          <div
            className="herr-prose"
            style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.8,
            }}
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        )}
      </article>

      {/* ── Article-End CTA ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 64px' }}>
        <div
          style={{
            background: '#16161F',
            borderRadius: 16,
            padding: 40,
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 24,
              fontWeight: 600,
              color: '#FFFFFF',
              marginBottom: 20,
            }}
          >
            Begin your HERR journey
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
            Start Free
          </Link>
        </div>
      </div>

      {/* ── Related Articles ────────────────────────────────────────── */}
      {relatedArticles.length > 0 && (
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '2.5px',
                color: '#C42D8E',
                marginBottom: 24,
              }}
            >
              MORE FROM THE JOURNAL
            </p>
            <div className="related-grid">
              {relatedArticles.map((r) => (
                <Link
                  key={r.slug}
                  href={`/journal/${r.slug}`}
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
                    }}
                  >
                    {r.image && (
                      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                        <Image
                          src={r.image}
                          alt={r.title}
                          fill
                          className="object-cover journal-card-img"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div style={{ padding: 24 }}>
                      {r.tag && (
                        <span
                          style={{
                            display: 'inline-block',
                            background: '#C42D8E',
                            color: '#FFFFFF',
                            fontSize: 10,
                            textTransform: 'uppercase',
                            borderRadius: 12,
                            padding: '3px 10px',
                            marginBottom: 12,
                          }}
                        >
                          {r.tag}
                        </span>
                      )}
                      <h3
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: 20,
                          fontWeight: 600,
                          color: '#FFFFFF',
                          lineHeight: 1.3,
                          marginBottom: 8,
                        }}
                      >
                        {r.title}
                      </h3>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        {r.readTime} min read
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Disclaimer ──────────────────────────────────────────────── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 48px' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
          This article is for informational purposes only and does not constitute clinical advice.
        </p>
      </div>

      {/* ── Responsive Styles ───────────────────────────────────────── */}
      <style>{`
        .related-grid {
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
        @media (max-width: 768px) {
          .related-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
