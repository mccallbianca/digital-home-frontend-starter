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
  const articleTags = (article.semantic_tags || []).slice(0, 4);
  const authorName = article.author_name || 'Bianca D. McCall, LMFT';

  return (
    <main className="min-h-screen">
      {/* Article Header */}
      <section className="pt-32 pb-10 px-6">
        <div className="max-w-[900px] mx-auto">
          <Link
            href="/journal"
            className="herr-label text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors mb-8 inline-block"
          >
            &larr; Back to Journal
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-[0.75rem] text-[var(--herr-faint)] mb-6">
            <span className="herr-label border border-[var(--herr-border)] px-3 py-1 capitalize">
              {article.content_type}
            </span>
            <span>{formatDate(publishedAt)}</span>
            <span>&middot;</span>
            <span>{readingTime} min read</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-light text-[var(--herr-white)] leading-[0.95] mb-6">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="font-display text-xl text-[var(--herr-muted)] italic mb-6">
              {article.subtitle}
            </p>
          )}

          {article.excerpt && (
            <p className="text-lg text-[var(--herr-muted)] max-w-2xl leading-relaxed mb-8">
              {article.excerpt}
            </p>
          )}

          <p className="herr-label text-[var(--herr-pink)]">{authorName}</p>
        </div>
      </section>

      {/* Featured Image */}
      {article.featured_image_url && (
        <section className="px-6 pb-10">
          <div className="max-w-[900px] mx-auto">
            <div className="border border-[var(--herr-border)] overflow-hidden">
              <Image
                src={article.featured_image_url}
                alt={article.title}
                width={1792}
                height={1024}
                className="w-full aspect-[21/9] object-cover"
                priority
              />
            </div>
          </div>
        </section>
      )}

      {/* Article Body */}
      <section className="px-6 pb-16">
        <div className="max-w-[900px] mx-auto grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
          <article className="border border-[var(--herr-border)] bg-[var(--herr-surface)] px-6 py-8 md:px-10 md:py-10">
            {article.body && (
              <div
                className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:font-light prose-headings:text-[var(--herr-white)] prose-p:text-[var(--herr-muted)] prose-p:leading-8 prose-strong:text-[var(--herr-white)] prose-a:text-[var(--herr-pink)] prose-li:text-[var(--herr-muted)] prose-ul:text-[var(--herr-muted)]"
                dangerouslySetInnerHTML={{ __html: article.body }}
              />
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="border border-[var(--herr-border)] bg-[var(--herr-surface)] p-6">
              <p className="herr-label text-[var(--herr-muted)] mb-4">Details</p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-[var(--herr-border)] pb-3">
                  <span className="text-[var(--herr-faint)]">Published</span>
                  <span className="text-[var(--herr-muted)]">{formatDate(publishedAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-[var(--herr-border)] pb-3">
                  <span className="text-[var(--herr-faint)]">Reading time</span>
                  <span className="text-[var(--herr-muted)]">{readingTime} min</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--herr-faint)]">Author</span>
                  <span className="text-[var(--herr-muted)] text-right text-[0.8rem]">{authorName}</span>
                </div>
              </div>
            </div>

            {articleTags.length > 0 && (
              <div className="border border-[var(--herr-border)] bg-[var(--herr-surface)] p-6">
                <p className="herr-label text-[var(--herr-muted)] mb-4">Topics</p>
                <div className="flex flex-wrap gap-2">
                  {articleTags.map((tag: string) => (
                    <span
                      key={tag}
                      className="herr-label text-[var(--herr-faint)] border border-[var(--herr-border)] px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 border-t border-[var(--herr-border)] text-center">
        <div className="max-w-[800px] mx-auto">
          <p className="herr-label text-[var(--herr-muted)] mb-6">Continue the journey</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-8 leading-tight">
            The inner voice can be<br />
            <span className="text-[var(--herr-pink)]">reprogrammed.</span>
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/journal" className="btn-herr-ghost">
              More Articles
            </Link>
            <Link href="/subscribe" className="btn-herr-primary">
              Begin Your Reprogramming
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
