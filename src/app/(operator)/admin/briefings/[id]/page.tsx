export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type Briefing = {
  id: string;
  briefing_date: string;
  briefing_time: string;
  briefing_text: string;
  source_counts: Record<string, number> | null;
  created_at: string;
};

function renderMarkdownLite(text: string): string {
  const lines = text.split('\n');
  const html: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('# ')) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;font-weight:300;margin:18px 0 8px;">${escape(line.slice(2))}</h1>`);
    } else if (line.startsWith('## ')) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;font-weight:300;margin:16px 0 6px;">${escape(line.slice(3))}</h2>`);
    } else if (/^[-*] /.test(line)) {
      if (!inList) { html.push('<ul style="padding-left:20px;margin:4px 0 8px;">'); inList = true; }
      html.push(`<li style="font-size:14px;line-height:1.5;">${escape(line.slice(2))}</li>`);
    } else if (/^\d+\.\s/.test(line)) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<p style="font-size:14px;line-height:1.5;margin:2px 0;">${escape(line)}</p>`);
    } else if (line === '') {
      if (inList) { html.push('</ul>'); inList = false; }
    } else {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<p style="font-size:14px;line-height:1.5;margin:4px 0;">${escape(line)}</p>`);
    }
  }
  if (inList) html.push('</ul>');
  return html.join('');
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default async function BriefingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  let briefing: Briefing | null = null;
  try {
    const { data } = await db
      .from('daily_briefings')
      .select('id, briefing_date, briefing_time, briefing_text, source_counts, created_at')
      .eq('id', id)
      .maybeSingle();
    briefing = (data ?? null) as Briefing | null;
  } catch {
    // pre-migration
  }
  if (!briefing) notFound();

  return (
    <main className="px-6 py-10 max-w-[820px]">
      <p className="herr-label mb-2" style={{ color: 'var(--herr-magenta)' }}>Briefing</p>
      <h1 className="font-display text-3xl font-light mb-1" style={{ color: 'var(--herr-ink)' }}>
        {briefing.briefing_date}
      </h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(26,15,26,0.55)', textTransform: 'capitalize' }}>
        {briefing.briefing_time} briefing &middot; generated {new Date(briefing.created_at).toLocaleString()}
      </p>

      <article
        className="p-6 rounded-lg"
        style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)' }}
        dangerouslySetInnerHTML={{ __html: renderMarkdownLite(briefing.briefing_text) }}
      />
    </main>
  );
}
