'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export type AdminReport = {
  id: string;
  member_id: string;
  member_name: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  url: string | null;
  screenshot_url: string | null;
  status: string;
  admin_response: string | null;
  created_at: string;
};

const STATUSES = ['open', 'investigating', 'resolved', 'wontfix', 'duplicate'];
const SEVERITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function csvCell(s: string | null | undefined): string {
  if (s == null) return '';
  const needsQuote = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}

export default function AdminBetaTestersClient({ reports }: { reports: AdminReport[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [draftStatus, setDraftStatus] = useState<Record<string, string>>({});
  const [draftResponse, setDraftResponse] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = filterStatus === 'all' ? reports : reports.filter((r) => r.status === filterStatus);
    return [...list].sort((a, b) => {
      const s = (SEVERITY_RANK[a.severity] ?? 99) - (SEVERITY_RANK[b.severity] ?? 99);
      if (s !== 0) return s;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [reports, filterStatus]);

  function exportCsv() {
    const header = ['id', 'created_at', 'member', 'category', 'severity', 'status', 'title', 'description', 'url', 'screenshot_url', 'admin_response'];
    const rows = filtered.map((r) => [
      r.id,
      r.created_at,
      r.member_name,
      r.category,
      r.severity,
      r.status,
      r.title,
      r.description,
      r.url ?? '',
      r.screenshot_url ?? '',
      r.admin_response ?? '',
    ].map(csvCell).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beta-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function save(report: AdminReport) {
    setSavingId(report.id);
    try {
      const payload: Record<string, string> = {};
      if (draftStatus[report.id] && draftStatus[report.id] !== report.status) {
        payload.status = draftStatus[report.id];
      }
      if ((draftResponse[report.id] ?? '') !== (report.admin_response ?? '')) {
        payload.admin_response = draftResponse[report.id] ?? '';
      }
      if (Object.keys(payload).length === 0) return;
      const res = await fetch(`/api/admin/beta-testers/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) router.refresh();
    } finally {
      setSavingId(null);
    }
  }

  function fmt(s: string) {
    return new Date(s).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  }

  return (
    <main className="px-6 py-10 max-w-[1100px]">
      <p className="herr-label mb-2" style={{ color: 'var(--herr-magenta)' }}>Beta Reports</p>
      <h1 className="font-display text-3xl font-light mb-2" style={{ color: 'var(--herr-ink)' }}>
        Beta Tester Reports
      </h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(26,15,26,0.7)' }}>
        {reports.length} total report{reports.length === 1 ? '' : 's'}
      </p>

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {['all', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 text-xs rounded-md"
              style={{
                background: filterStatus === s ? 'var(--herr-magenta-soft)' : 'transparent',
                color: filterStatus === s ? 'var(--herr-ink)' : 'rgba(26,15,26,0.6)',
                border: '1px solid var(--herr-line)',
                textTransform: 'capitalize',
                cursor: 'pointer',
              }}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button
          onClick={exportCsv}
          className="px-3 py-1.5 text-xs rounded-md"
          style={{ background: 'transparent', border: '1px solid var(--herr-line)', cursor: 'pointer' }}
        >
          Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm" style={{ color: 'rgba(26,15,26,0.5)' }}>No reports.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((r) => {
            const open = openId === r.id;
            return (
              <li key={r.id} className="rounded-lg" style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)' }}>
                <button
                  onClick={() => {
                    setOpenId(open ? null : r.id);
                    if (!open) {
                      setDraftStatus((d) => ({ ...d, [r.id]: r.status }));
                      setDraftResponse((d) => ({ ...d, [r.id]: r.admin_response ?? '' }));
                    }
                  }}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="font-medium text-sm">{r.title}</p>
                    <p className="text-xs" style={{ color: 'rgba(26,15,26,0.55)' }}>
                      {r.member_name} &middot; {r.category.replace('_', ' ')} &middot; severity {r.severity} &middot; {fmt(r.created_at)}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{
                    background: 'rgba(26,15,26,0.06)',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}>
                    {r.status.replace('_', ' ')}
                  </span>
                </button>
                {open && (
                  <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--herr-line)' }}>
                    <div className="mt-4 mb-4">
                      <p className="herr-label mb-1">Description</p>
                      <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{r.description}</p>
                    </div>
                    {r.url && (
                      <div className="mb-3 text-xs">
                        <strong>URL:</strong> <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--herr-magenta)' }}>{r.url}</a>
                      </div>
                    )}
                    {r.screenshot_url && (
                      <div className="mb-4">
                        <p className="herr-label mb-2">Screenshot</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.screenshot_url} alt="Screenshot" style={{ maxWidth: 480, maxHeight: 360, borderRadius: 6, border: '1px solid var(--herr-line)' }} />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3 mt-4">
                      <label className="flex flex-col gap-1">
                        <span className="herr-label">Status</span>
                        <select
                          value={draftStatus[r.id] ?? r.status}
                          onChange={(e) => setDraftStatus((d) => ({ ...d, [r.id]: e.target.value }))}
                          style={{ height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid var(--herr-line)', background: '#FFFFFF' }}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="herr-label">Admin response</span>
                        <textarea
                          value={draftResponse[r.id] ?? r.admin_response ?? ''}
                          onChange={(e) => setDraftResponse((d) => ({ ...d, [r.id]: e.target.value }))}
                          rows={3}
                          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--herr-line)', background: '#FFFFFF', resize: 'vertical' }}
                        />
                      </label>
                    </div>

                    <button
                      onClick={() => save(r)}
                      disabled={savingId === r.id}
                      className="mt-4 px-4 py-2 text-sm rounded-md"
                      style={{
                        background: 'var(--herr-magenta)',
                        color: '#FFFFFF',
                        opacity: savingId === r.id ? 0.6 : 1,
                        cursor: savingId === r.id ? 'not-allowed' : 'pointer',
                        border: 'none',
                      }}
                    >
                      {savingId === r.id ? 'Saving\u2026' : 'Save'}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
