'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Tester = {
  id: string;
  email: string | null;
  first_name: string | null;
  preferred_name: string | null;
  created_at: string | null;
};

type InviteCode = {
  code: string;
  created_at: string;
  used_at: string | null;
};

export default function TestersClient({
  testers,
  unusedCodes,
}: {
  testers: Tester[];
  unusedCodes: InviteCode[];
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://h3rr.com';

  async function generateCodes() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/testers/generate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 5 }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Failed to generate codes');
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generate failed');
    } finally {
      setGenerating(false);
    }
  }

  async function copyLink(code: string) {
    const url = `${origin}/signup?invite=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // clipboard unavailable; show inline fallback
      prompt('Copy this invite link:', url);
    }
  }

  function fmtDate(s: string | null) {
    if (!s) return '—';
    return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function displayName(t: Tester) {
    return t.preferred_name || t.first_name || t.email || t.id.slice(0, 8);
  }

  return (
    <main className="px-6 py-10 max-w-[1100px]">
      <p className="herr-label text-[var(--herr-cobalt)] mb-2">Testers</p>
      <h1 className="font-display text-3xl font-light text-[var(--herr-ink)] mb-2">
        Beta Tester Management
      </h1>
      <p className="text-[var(--herr-muted)] text-sm mb-8">
        {testers.length} tester{testers.length === 1 ? '' : 's'} &middot; {unusedCodes.length} unused invite code{unusedCodes.length === 1 ? '' : 's'}
      </p>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-md text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#EF4444' }}>
          {error}
        </div>
      )}

      <section className="mb-12">
        <h2 className="font-display text-xl font-light mb-4">Active Testers</h2>
        {testers.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--herr-muted)' }}>No testers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--herr-line)' }}>
                  <th className="herr-label text-left py-3 pr-6">Name</th>
                  <th className="herr-label text-left py-3 pr-6">Email</th>
                  <th className="herr-label text-left py-3 pr-6">Signed Up</th>
                </tr>
              </thead>
              <tbody>
                {testers.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--herr-line)' }}>
                    <td className="py-3 pr-6">{displayName(t)}</td>
                    <td className="py-3 pr-6">{t.email ?? '—'}</td>
                    <td className="py-3 pr-6">{fmtDate(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-light">Unused Invite Codes</h2>
          <button
            onClick={generateCodes}
            disabled={generating}
            className="px-4 py-2 text-sm rounded-md transition"
            style={{
              background: 'var(--herr-magenta)',
              color: '#FFFFFF',
              opacity: generating ? 0.6 : 1,
              cursor: generating ? 'not-allowed' : 'pointer',
            }}
          >
            {generating ? 'Generating\u2026' : 'Generate 5 more codes'}
          </button>
        </div>

        {unusedCodes.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--herr-muted)' }}>No unused codes. Generate more above.</p>
        ) : (
          <ul className="space-y-2">
            {unusedCodes.map((c) => (
              <li
                key={c.code}
                className="flex items-center justify-between gap-4 px-4 py-3 rounded-md"
                style={{ background: 'rgba(26,15,26,0.04)', border: '1px solid var(--herr-line)' }}
              >
                <div className="flex flex-col gap-1">
                  <code className="font-mono text-sm" style={{ color: 'var(--herr-ink)' }}>{c.code}</code>
                  <span className="text-xs" style={{ color: 'var(--herr-muted)' }}>
                    {origin}/signup?invite={c.code}
                  </span>
                </div>
                <button
                  onClick={() => copyLink(c.code)}
                  className="px-3 py-1.5 text-xs rounded-md transition"
                  style={{
                    background: copiedCode === c.code ? 'var(--herr-cobalt)' : 'transparent',
                    color: copiedCode === c.code ? '#FFFFFF' : 'var(--herr-ink)',
                    border: '1px solid var(--herr-line)',
                  }}
                >
                  {copiedCode === c.code ? 'Copied!' : 'Copy link'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
