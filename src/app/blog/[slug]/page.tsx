import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
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
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('content_objects')
    .select('title, excerpt, seo_meta(title, description, og_image_url)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!data) return { title: 'Article Not Found' };

  const seo = Array.isArray(data.seo_meta) ? data.seo_meta[0] : data.seo_meta;

  return {
    title: seo?.title || data.title,
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
  const supabase = createAdminClient();
  const { data: article } = await supabase
    .from('content_objects')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!article) notFound();

  const readingTime = estimateReadingTime(article.body);

  return (
    <main>
      {/* ── Hero ── */}
      <section className="pt-32 pb-8 px-6">
        <div className="max-w-3xl mx-auto">
          <a href="/blog" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-8">
            ← Back to Articles
          </a>

          <div className="flex gap-4 text-xs text-neutral-500 mb-4">
            <span className="uppercase tracking-wider">{article.content_type}</span>
            <span>{formatDate(article.published_at || article.created_at)}</span>
            <span>{readingTime} min read</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{article.title}</h1>
          <p className="text-lg text-neutral-400">{article.excerpt}</p>
        </div>
      </section>

      {/* ── Featured Image ── */}
      {article.featured_image_url && (
        <section className="px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <Image
              src={article.featured_image_url}
              alt={article.title}
              width={1792}
              height={1024}
              className="w-full aspect-[21/9] object-cover"
              priority
            />
          </div>
        </section>
      )}

      {/* ── Article Body ── */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          {article.body && (
            <div
              className="prose prose-invert prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />
          )}

          <div className="border-t border-neutral-800 mt-12 pt-8">
            <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Topics</p>
            <div className="flex flex-wrap gap-2">
              {(article.semantic_tags || []).map((tag: string) => (
                <span key={tag} className="text-xs text-neutral-400 border border-neutral-700 px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">
            [Your CTA Headline]
          </h2>
          <a
            href="/contact"
            className="inline-block text-sm font-semibold uppercase tracking-wider bg-white text-black px-8 py-3 hover:bg-transparent hover:text-white border border-white transition-all"
          >
            [Your CTA]
          </a>
        </div>
      </section>
    </main>
  );
}
