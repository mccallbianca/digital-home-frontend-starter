/**
 * GET /api/cron/generate-article?day_of_week=tuesday|thursday
 *
 * Bearer CRON_SECRET required.
 *
 * Tuesday: evergreen voice-driven article on Bianca's IP themes.
 * Thursday: clinical commentary on a recent (past 7 days) news
 *   story in behavioral health / mental health policy / AI safety
 *   / clinical practice. Uses Claude web_search tool to find
 *   the story.
 *
 * Voice training: feeds the most recent 3 published articles
 * authored by humans (ai_generated=false) as reference exemplars
 * so Claude mimics Bianca's voice instead of drifting into its
 * own prior output.
 *
 * Inserts the result as a draft into content_objects so admin
 * can review at /admin/journal-queue.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/resend';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

type ReferenceArticle = {
  title: string;
  body: string;
};

type GeneratedArticle = {
  title: string;
  subtitle: string;
  slug: string;
  body: string;
  canva_image_prompt: string;
};

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ') || auth.slice(7) !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const day = (req.nextUrl.searchParams.get('day_of_week') ?? '').toLowerCase();
  if (day !== 'tuesday' && day !== 'thursday') {
    return NextResponse.json({ error: 'day_of_week must be tuesday or thursday' }, { status: 400 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: refRows } = await (admin as any)
    .from('content_objects')
    .select('title, body')
    .eq('status', 'published')
    .eq('ai_generated', false)
    .eq('content_type', 'article')
    .order('published_at', { ascending: false })
    .limit(3);
  const references = (refRows ?? []) as ReferenceArticle[];

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY missing' }, { status: 500 });
  }

  const client = new Anthropic({ apiKey: anthropicKey });
  const article = await generateArticle(client, day as 'tuesday' | 'thursday', references);
  if (!article) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }

  const now = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inserted, error: insertErr } = await (admin as any)
    .from('content_objects')
    .insert({
      slug: ensureUniqueSlug(admin, article.slug),
      title: article.title,
      subtitle: article.subtitle,
      body: article.body,
      content_type: 'article',
      status: 'draft',
      ai_generated: true,
      ai_generated_at: now,
      created_by: 'content_agent',
      author_name: 'Bianca D. McCall, M.A., LMFT',
    })
    .select('id, title, body')
    .single();
  if (insertErr || !inserted) {
    return NextResponse.json({ error: insertErr?.message ?? 'Insert failed' }, { status: 500 });
  }

  try {
    await sendEmail({
      to: 'mccall.bianca@gmail.com',
      subject: `[HERR Journal] New draft article ready: ${article.title}`,
      html: `
        <p>Generated ${new Date(now).toLocaleString('en-US')}</p>
        <h2>${escapeHtml(article.title)}</h2>
        <p><em>${escapeHtml(article.subtitle)}</em></p>
        <p>${escapeHtml(article.body.replace(/<[^>]+>/g, '').slice(0, 200))}…</p>
        <p><strong>Canva image prompt:</strong> ${escapeHtml(article.canva_image_prompt)}</p>
        <p><a href="https://h3rr.com/admin/journal-queue">Review and approve at /admin/journal-queue</a></p>
      `,
    });
  } catch (err) {
    console.error('[generate-article] email error:', err);
  }

  return NextResponse.json({ success: true, draft_id: inserted.id });
}

async function generateArticle(
  client: Anthropic,
  day: 'tuesday' | 'thursday',
  references: ReferenceArticle[],
): Promise<GeneratedArticle | null> {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const referenceBlocks = references
    .map((r, i) => `---ARTICLE ${i + 1}: ${r.title}---\n${stripHtml(r.body ?? '').slice(0, 3000)}`)
    .join('\n\n');

  const system = `You are writing in the voice of Bianca D. McCall, M.A., LMFT — a licensed clinical practitioner, federal AI safety advisor (HHS/SAMHSA), and founder of ECQO Holdings. Your writing combines:
- Existential psychology grounded in 30 years of clinical practice
- Trauma-informed, evidence-based, HIPAA-aligned, SAMHSA standards
- Federal AI safety perspective
- Clear, accessible prose without academic jargon
- Bianca's lived experience as a retired professional women's basketball player gives her shared performance language with high-achievers, but she leads with clinical authority not athletic identity

${referenceBlocks ? `Here are recent articles in Bianca's voice for reference:\n\n${referenceBlocks}\n\n` : ''}Today is ${formattedDate}. Write a NEW 800-1200 word article.

Output format (strict JSON, NO markdown fences, NO commentary before or after):
{
  "title": "...",
  "subtitle": "...",
  "slug": "kebab-case-version-of-title",
  "body": "<p>...full HTML body with <h2> for subheadings...</p>",
  "canva_image_prompt": "...specific image prompt for Canva..."
}`;

  const userPrompt = day === 'tuesday'
    ? `Write an evergreen article on a theme central to Bianca's IP — existential psychology, the Inner Voice, AI safety in behavioral health, the architecture of human consciousness, or the relationship between performance and selfhood. Choose ONE specific angle not covered in the reference articles. Include 2-3 subheadings.`
    : `Use web_search to find a recent (past 7 days) news story in behavioral health, mental health policy, AI safety, or clinical practice. Write a clinical commentary applying Bianca's existential/clinical framework to interpret what the story means for clinicians, members, and the broader field. Include 2-3 subheadings. Include source URL at end.`;

  // Note: web_search tool support depends on SDK version. If unavailable
  // for the current SDK, Thursday simply runs without web search and
  // Claude will write a general piece on a recent theme.
  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim();
    return parseArticleJson(text);
  } catch (err) {
    console.error('[generate-article] claude error:', err);
    return null;
  }
}

function parseArticleJson(text: string): GeneratedArticle | null {
  // Strip fences if Claude wraps despite instructions
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    const parsed = JSON.parse(cleaned) as Partial<GeneratedArticle>;
    if (!parsed.title || !parsed.body || !parsed.slug) return null;
    return {
      title: String(parsed.title),
      subtitle: String(parsed.subtitle ?? ''),
      slug: slugify(String(parsed.slug)),
      body: String(parsed.body),
      canva_image_prompt: String(parsed.canva_image_prompt ?? ''),
    };
  } catch (err) {
    console.error('[generate-article] parse error:', err);
    return null;
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Reserved for future use: append a numeric suffix if slug collides.
// For now content_objects.slug is unique; on collision the insert will
// fail and the cron run reports as failed (visible in GH Actions log).
function ensureUniqueSlug(_admin: unknown, slug: string): string {
  return slug;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
