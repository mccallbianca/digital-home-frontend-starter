/**
 * /admin/audit/daily-delivery
 *
 * B5.4 audit dashboard for user_daily_deliveries.
 *
 * Server component, 25 rows / page, URL query filters. Re-signs final-mix
 * URLs per render so admin always gets a working play link even if the
 * stored signed URL has expired.
 */

export const dynamic = 'force-dynamic';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import AuditFilters from './AuditFilters';

type DeliveryRow = {
  id: string;
  user_id: string;
  delivery_date: string;
  activity_mode: string;
  template_id: string;
  music_track_id: string | null;
  solfeggio_hz: number[];
  week_of_month: number;
  frequency_tier: string;
  existential_domain_targeted: string;
  risk_tier: string;
  cultural_routing: string;
  voice_source: string;
  final_mix_storage_path: string | null;
  status: string;
  delivered_at: string | null;
  user_listen_duration_seconds: number | null;
  created_at: string;
  error_message: string | null;
};

const STATUS_PILL: Record<string, { bg: string; fg: string; label: string }> = {
  queued:     { bg: '#eef0f4', fg: '#4a5160', label: 'queued' },
  mixing:     { bg: '#eef0f4', fg: '#4a5160', label: 'mixing' },
  ready:      { bg: '#dff2e1', fg: '#1b6b2c', label: 'ready' },
  delivered:  { bg: '#cfe4ff', fg: '#1a4789', label: 'delivered' },
  failed:     { bg: '#fbdada', fg: '#8a1c1c', label: 'failed' },
  text_only:  { bg: '#fff1cc', fg: '#7a5800', label: 'text only' },
};

const RISK_PILL: Record<string, { bg: string; fg: string }> = {
  low_concern:          { bg: '#dff2e1', fg: '#1b6b2c' },
  moderate_unease:      { bg: '#fff1cc', fg: '#7a5800' },
  elevated_disruption:  { bg: '#fbdada', fg: '#8a1c1c' },
};

const VOICE_PILL: Record<string, { bg: string; fg: string }> = {
  bianca:     { bg: '#efeaff', fg: '#3b2e8a' },
  user_clone: { bg: '#ffe6f1', fg: '#892e63' },
  text_only:  { bg: '#fff1cc', fg: '#7a5800' },
};

const PAGE_SIZE = 25;

function maskEmail(email: string | null | undefined): string {
  if (!email) return '—';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const head = local.slice(0, 3);
  return `${head}***@${domain}`;
}

function parseMulti(v: string | string[] | undefined): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.flatMap((x) => x.split(','));
  return v.split(',').filter(Boolean);
}

export default async function DailyDeliveryAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // (operator)/layout.tsx already gated this; we just need the email for log lines.
  const adminEmail = user?.email ?? '';

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  // ── Filters ────────────────────────────────────────────────────
  const startDate = typeof sp.start === 'string' ? sp.start : '';
  const endDate   = typeof sp.end === 'string' ? sp.end : '';
  const modes     = parseMulti(sp.mode);
  const domains   = parseMulti(sp.domain);
  const tiers     = parseMulti(sp.tier);
  const statuses  = parseMulti(sp.status);
  const voices    = parseMulti(sp.voice);
  const page = Math.max(1, parseInt(typeof sp.page === 'string' ? sp.page : '1', 10) || 1);

  // ── Summary cards (last 7 days) ────────────────────────────────
  const sevenDaysAgoIso = new Date(Date.now() - 7 * 86400000).toISOString();
  const oneDayAgoIso = new Date(Date.now() - 86400000).toISOString();

  const { count: total7 } = await db
    .from('user_daily_deliveries')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgoIso);
  const { count: delivered7 } = await db
    .from('user_daily_deliveries')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgoIso)
    .eq('status', 'delivered');
  const { count: failed24 } = await db
    .from('user_daily_deliveries')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', oneDayAgoIso)
    .eq('status', 'failed');
  const { data: listenSample } = await db
    .from('user_daily_deliveries')
    .select('user_listen_duration_seconds')
    .gte('created_at', sevenDaysAgoIso)
    .not('user_listen_duration_seconds', 'is', null)
    .limit(500);
  const listens = (listenSample ?? []) as Array<{ user_listen_duration_seconds: number }>;
  const avgListen = listens.length === 0
    ? null
    : Math.round(listens.reduce((a, b) => a + (b.user_listen_duration_seconds || 0), 0) / listens.length);
  const successRate = total7 && total7 > 0
    ? Math.round(((delivered7 ?? 0) / total7) * 100)
    : null;

  // ── Main query ─────────────────────────────────────────────────
  let q = db
    .from('user_daily_deliveries')
    .select('id, user_id, delivery_date, activity_mode, template_id, music_track_id, solfeggio_hz, week_of_month, frequency_tier, existential_domain_targeted, risk_tier, cultural_routing, voice_source, final_mix_storage_path, status, delivered_at, user_listen_duration_seconds, created_at, error_message', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (startDate) q = q.gte('delivery_date', startDate);
  if (endDate) q = q.lte('delivery_date', endDate);
  if (modes.length > 0) q = q.in('activity_mode', modes);
  if (domains.length > 0) q = q.in('existential_domain_targeted', domains);
  if (tiers.length > 0) q = q.in('risk_tier', tiers);
  if (statuses.length > 0) q = q.in('status', statuses);
  if (voices.length > 0) q = q.in('voice_source', voices);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  q = q.range(from, to);

  const { data, count, error } = await q;
  const rows = (data ?? []) as DeliveryRow[];
  const totalRows = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));

  // ── Resolve emails + sign URLs in parallel ─────────────────────
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const { data: profiles } = userIds.length > 0
    ? await db.from('profiles').select('id, email').in('id', userIds)
    : { data: [] as Array<{ id: string; email: string }> };
  const emailById = new Map<string, string>(
    (profiles ?? []).map((p: { id: string; email: string }) => [p.id, p.email]),
  );

  const signed = await Promise.all(
    rows.map(async (r) => {
      if (!r.final_mix_storage_path) return null;
      const { data: s } = await db.storage
        .from('affirmations-daily-mixes')
        .createSignedUrl(r.final_mix_storage_path, 86400);
      return s?.signedUrl ?? null;
    }),
  );

  const cardStyle: React.CSSProperties = {
    background: 'var(--herr-white)',
    border: '1px solid var(--herr-border, #e5e2da)',
    padding: '18px 20px',
    borderRadius: 6,
  };

  return (
    <main className="px-6 py-10 max-w-[1400px]">
      <p className="herr-label text-[var(--herr-cobalt)] mb-2">Audit</p>
      <h1 className="font-display text-3xl font-light text-[var(--herr-ink)] mb-2">
        Daily Delivery Audit
      </h1>
      <p className="text-[var(--herr-ink-soft,#5a5a5a)] text-sm mb-8">
        Every 3-layer mix the system produces, in one place. Signed URLs refresh on every page load.
        Logged in as <span style={{ fontFamily: 'ui-monospace, monospace' }}>{adminEmail}</span>.
      </p>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)' }}>Total / 7d</div>
          <div style={{ fontSize: 32, fontWeight: 300, marginTop: 4, fontFamily: 'var(--font-display,Georgia)' }}>{totalRows}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)' }}>Success rate</div>
          <div style={{ fontSize: 32, fontWeight: 300, marginTop: 4, fontFamily: 'var(--font-display,Georgia)' }}>{successRate === null ? '—' : `${successRate}%`}</div>
          <div style={{ fontSize: 11, color: 'var(--herr-ink-soft,#5a5a5a)', marginTop: 2 }}>delivered / total (7d)</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)' }}>Avg listen</div>
          <div style={{ fontSize: 32, fontWeight: 300, marginTop: 4, fontFamily: 'var(--font-display,Georgia)' }}>
            {avgListen === null ? '—' : `${Math.floor(avgListen / 60)}m ${avgListen % 60}s`}
          </div>
        </div>
        <a
          href="?status=failed"
          style={{ ...cardStyle, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
        >
          <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)' }}>Failed / 24h</div>
          <div style={{ fontSize: 32, fontWeight: 300, marginTop: 4, fontFamily: 'var(--font-display,Georgia)', color: (failed24 ?? 0) > 0 ? '#8a1c1c' : 'inherit' }}>{failed24 ?? 0}</div>
          <div style={{ fontSize: 11, color: 'var(--herr-ink-soft,#5a5a5a)', marginTop: 2 }}>click to filter →</div>
        </a>
      </div>

      <AuditFilters
        initial={{ startDate, endDate, modes, domains, tiers, statuses, voices }}
      />

      {error && (
        <div style={{ background: '#fbdada', color: '#8a1c1c', padding: 12, borderRadius: 4, marginBottom: 16, fontSize: 13 }}>
          Query error: {error.message}
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'var(--herr-white)', border: '1px solid var(--herr-border,#e5e2da)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#faf8f3', textAlign: 'left', borderBottom: '1px solid var(--herr-border,#e5e2da)' }}>
                <th style={{ padding: '10px 12px', fontWeight: 500, letterSpacing: 0.4 }}>User</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Date · Mode</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Domain</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Risk</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Week · Hz</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Voice</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Mix</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Listen</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: 40, textAlign: 'center', color: 'var(--herr-ink-soft,#5a5a5a)' }}>
                    No deliveries match the current filters.
                  </td>
                </tr>
              )}
              {rows.map((r, i) => {
                const rowBg =
                  r.status === 'failed' ? '#fff5f5' :
                  r.status === 'text_only' ? '#fffaeb' :
                  (r.status === 'delivered' && (r.user_listen_duration_seconds ?? 0) < 30) ? '#fffaeb' :
                  'transparent';
                const sp = STATUS_PILL[r.status] ?? STATUS_PILL.queued;
                const rp = RISK_PILL[r.risk_tier] ?? { bg: '#eef0f4', fg: '#4a5160' };
                const vp = VOICE_PILL[r.voice_source] ?? VOICE_PILL.bianca;
                const url = signed[i];
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f0ede4', background: rowBg, verticalAlign: 'top' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
                      {maskEmail(emailById.get(r.user_id))}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div>{r.delivery_date}</div>
                      <div style={{ color: 'var(--herr-ink-soft,#5a5a5a)', fontSize: 12 }}>{r.activity_mode}</div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{r.existential_domain_targeted}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: rp.bg, color: rp.fg, padding: '3px 8px', borderRadius: 3, fontSize: 11, fontWeight: 500, letterSpacing: 0.3 }}>
                        {r.risk_tier.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>
                      <div>wk {r.week_of_month} · {r.frequency_tier}</div>
                      <div style={{ color: 'var(--herr-ink-soft,#5a5a5a)' }}>{(r.solfeggio_hz ?? []).join(', ')} Hz</div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: vp.bg, color: vp.fg, padding: '3px 8px', borderRadius: 3, fontSize: 11, fontWeight: 500 }}>
                        {r.voice_source.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--herr-cobalt,#1a4789)', textDecoration: 'underline', fontSize: 12 }}>▶ play</a>
                      ) : (
                        <span style={{ color: 'var(--herr-ink-soft,#a0a0a0)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: sp.bg, color: sp.fg, padding: '3px 8px', borderRadius: 3, fontSize: 11, fontWeight: 500 }}>
                        {sp.label}
                      </span>
                      {r.error_message && (
                        <div title={r.error_message} style={{ fontSize: 11, color: '#8a1c1c', marginTop: 4, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.error_message.slice(0, 60)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>
                      {r.user_listen_duration_seconds == null
                        ? <span style={{ color: 'var(--herr-ink-soft,#a0a0a0)' }}>—</span>
                        : `${Math.floor(r.user_listen_duration_seconds / 60)}m ${r.user_listen_duration_seconds % 60}s`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} sp={sp} />
      )}
    </main>
  );
}

function Pagination({
  page,
  totalPages,
  sp,
}: {
  page: number;
  totalPages: number;
  sp: Record<string, string | string[] | undefined>;
}) {
  function buildHref(p: number): string {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === 'page' || v == null) continue;
      if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
      else params.set(k, v);
    }
    params.set('page', String(p));
    return `?${params.toString()}`;
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, fontSize: 13 }}>
      <div style={{ color: 'var(--herr-ink-soft,#5a5a5a)' }}>
        Page {page} of {totalPages}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <a
          href={page > 1 ? buildHref(page - 1) : '#'}
          aria-disabled={page <= 1}
          style={{
            padding: '6px 12px',
            border: '1px solid var(--herr-border,#e5e2da)',
            borderRadius: 3,
            color: page > 1 ? 'inherit' : 'var(--herr-ink-soft,#bdbdbd)',
            pointerEvents: page > 1 ? 'auto' : 'none',
            textDecoration: 'none',
          }}
        >
          ← prev
        </a>
        <a
          href={page < totalPages ? buildHref(page + 1) : '#'}
          aria-disabled={page >= totalPages}
          style={{
            padding: '6px 12px',
            border: '1px solid var(--herr-border,#e5e2da)',
            borderRadius: 3,
            color: page < totalPages ? 'inherit' : 'var(--herr-ink-soft,#bdbdbd)',
            pointerEvents: page < totalPages ? 'auto' : 'none',
            textDecoration: 'none',
          }}
        >
          next →
        </a>
      </div>
    </div>
  );
}
