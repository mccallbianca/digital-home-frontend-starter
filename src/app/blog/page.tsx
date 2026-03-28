import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog — [YOUR BRAND]',
  description:
    '[Your blog description — what topics you cover and who it is for.]',
};

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

export default async function BlogPage() {
  let allArticles: Array<{
    slug: string;
    title: string;
    excerpt: string;
    semantic_tags: string[];
    content_type: string;
    published_at: string;
    reading_time: number;
    image: string;
  }> = [];

  try {
    const supabase = createAdminClient();
    const { data: articles, error } = await supabase
      .from('content_objects')
      .select('id, slug, title, content_type, excerpt, semantic_tags, published_at, featured_image_url, body')
      .eq('status', 'published')
      .in('content_type', ['article', 'guide'])
      .order('published_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Supabase query error:', error.message);
    }

    allArticles = (articles || []).map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt || '',
      semantic_tags: a.semantic_tags || [],
      content_type: a.content_type,
      published_at: a.published_at || a.slug,
      reading_time: estimateReadingTime(a.body),
      image: a.featured_image_url || '',
    }));
  } catch (err) {
    console.error('Blog page error:', err);
  }

  // Empty state
  if (allArticles.length === 0) {
    return (
      <main>
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Blog</h1>
            <p className="text-neutral-400">
              Articles are on the way. Set up your content pipeline in the Backend to start publishing.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const featured = allArticles[0];
  const rest = allArticles.slice(1);

  return (
    <main>
      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4">
            Blog
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            [Your Blog Headline]
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl">
            [What your blog is about and who it is for.]
          </p>
        </div>
      </section>

      {/* ── Featured Article ── */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <Link href={`/blog/${featured.slug}`} className="block border border-neutral-800 overflow-hidden hover:border-neutral-600 transition-colors">
            {featured.image && (
              <Image
                src={featured.image}
                alt={featured.title}
                width={1792}
                height={1024}
                className="w-full h-64 object-cover"
                priority
              />
            )}
            <div className="p-8">
              <span className="font-mono text-xs uppercase tracking-wider text-neutral-500">Featured</span>
              <h2 className="text-2xl font-bold text-white mt-2 mb-3">{featured.title}</h2>
              <p className="text-neutral-400 mb-4">{featured.excerpt}</p>
              <div className="flex gap-4 text-xs text-neutral-500">
                <span>{formatDate(featured.published_at)}</span>
                <span>{featured.reading_time} min read</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── All Articles ── */}
      {rest.length > 0 && (
        <section className="px-6 pb-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-8">
              All Articles ({allArticles.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {rest.map((article) => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="block border border-neutral-800 overflow-hidden hover:border-neutral-600 transition-colors"
                >
                  {article.image && (
                    <Image
                      src={article.image}
                      alt={article.title}
                      width={896}
                      height={512}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{article.title}</h3>
                    <p className="text-sm text-neutral-400 mb-3">{article.excerpt}</p>
                    <div className="flex gap-3 text-xs text-neutral-500">
                      <span>{formatDate(article.published_at)}</span>
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
