import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Journal — HERR',
  description:
    'Clinical insight, existential psychology, and the science of the inner voice. Thought leadership from Bianca D. McCall, LMFT — Founder of HERR and ECQO Holdings.',
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

  // Empty state — only shown when zero published articles exist
  if (allArticles.length === 0) {
    return (
      <main className="min-h-screen">
        <section className="flex items-center justify-center px-6 pt-32 pb-24">
          <div className="max-w-2xl border border-[var(--herr-border)] bg-[var(--herr-surface)] p-12 text-center">
            <p className="herr-label text-[var(--herr-muted)] mb-6">The Journal</p>
            <h1 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-6 leading-tight">
              Clinical insight. Existential depth. Coming soon.
            </h1>
            <p className="text-[var(--herr-muted)] leading-relaxed mb-8">
              The HERR journal publishes thought leadership on existential psychology, the inner voice, elite performance, and behavioral wellness. Written by Bianca D. McCall, LMFT.
            </p>
            <Link href="/subscribe" className="btn-herr-primary inline-flex">
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
    <main className="min-h-screen">
      {/* Header */}
      <section className="pt-32 pb-14 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between gap-6 pb-6 mb-8 border-b border-[var(--herr-border)]">
            <span className="herr-label text-[var(--herr-faint)]">HERR Journal</span>
            <span className="herr-label text-[var(--herr-faint)]">{allArticles.length} article{allArticles.length === 1 ? '' : 's'}</span>
          </div>

          <p className="herr-label text-[var(--herr-muted)] mb-6">
            Bianca D. McCall, LMFT — Founder of HERR and ECQO Holdings
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-light text-[var(--herr-white)] leading-[0.9] mb-6">
            The Journal
          </h1>
          <p className="text-lg text-[var(--herr-muted)] max-w-2xl leading-relaxed">
            Clinical insight on existential psychology, the inner voice, identity transition, and elite performance.
          </p>
        </div>
      </section>

      {/* Featured Article */}
      <section className="px-6 pb-16">
        <div className="max-w-[1200px] mx-auto">
          <Link
            href={`/journal/${featured.slug}`}
            className="block border border-[var(--herr-border)] bg-[var(--herr-surface)] hover:border-[var(--herr-pink)] transition-colors overflow-hidden"
          >
            {featured.image && (
              <div className="relative w-full aspect-[21/9]">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
            <div className="p-8 md:p-12">
              <p className="herr-label text-[var(--herr-pink)] mb-4">Featured</p>
              <h2 className="font-display text-3xl md:text-5xl font-light text-[var(--herr-white)] mb-6 leading-tight">
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="text-lg text-[var(--herr-muted)] max-w-2xl leading-relaxed mb-6">
                  {featured.excerpt}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-[0.78rem] text-[var(--herr-faint)]">{featured.author}</span>
                <span className="text-[var(--herr-faint)]">&middot;</span>
                <span className="text-[0.78rem] text-[var(--herr-faint)]">{formatDate(featured.published_at)}</span>
                <span className="text-[var(--herr-faint)]">&middot;</span>
                <span className="text-[0.78rem] text-[var(--herr-faint)]">{featured.reading_time} min read</span>
              </div>
              {featured.semantic_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {featured.semantic_tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="herr-label text-[var(--herr-faint)] border border-[var(--herr-border)] px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        </div>
      </section>

      {/* Remaining Articles */}
      {rest.length > 0 && (
        <section className="px-6 pb-24">
          <div className="max-w-[1200px] mx-auto">
            <p className="herr-label text-[var(--herr-muted)] mb-8">More from the archive</p>
            <div className="grid gap-px bg-[var(--herr-border)] md:grid-cols-2 lg:grid-cols-3">
              {rest.map((article) => (
                <Link
                  key={article.slug}
                  href={`/journal/${article.slug}`}
                  className="block bg-[var(--herr-black)] hover:bg-[var(--herr-surface)] transition-colors overflow-hidden"
                >
                  {article.image && (
                    <div className="relative w-full aspect-[16/9]">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-8">
                  <h3 className="font-display text-xl font-light text-[var(--herr-white)] mb-3 leading-snug">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-[0.85rem] text-[var(--herr-muted)] leading-relaxed mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-[0.75rem] text-[var(--herr-faint)]">
                    <span>{article.author}</span>
                    <span>&middot;</span>
                    <span>{formatDate(article.published_at)}</span>
                    <span>&middot;</span>
                    <span>{article.reading_time} min read</span>
                  </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
