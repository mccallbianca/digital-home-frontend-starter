'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Member {
  id: string;
  email: string;
  name: string | null;
  tier: string;
  status: string;
  subscribed_at: string | null;
  period_end: string | null;
  onboarded: boolean | null;
  stripe_customer_id: string;
}

interface JournalPost {
  id: string;
  title: string;
  status: string;
  published_at: string | null;
}

interface Stats {
  totalMembers: number;
  activeMembers: number;
  pastDue: number;
  cancelled: number;
  byTier: { collective: number; personalized: number; elite: number };
  mrr: number;
  journalPosts: number;
  totalVisitors: number;
}

const STATUS_COLORS: Record<string, string> = {
  active:    'text-[var(--herr-cobalt)]',
  past_due:  'text-yellow-400',
  cancelled: 'text-[var(--herr-muted)]',
  trialing:  'text-[var(--herr-pink)]',
};

const TIER_COLORS: Record<string, string> = {
  collective:   'text-[var(--herr-muted)]',
  personalized: 'text-[var(--herr-cobalt)]',
  elite:        'text-[var(--herr-pink)]',
};

export default function AdminDashboard({
  stats,
  members,
  journal,
}: {
  stats: Stats;
  members: Member[];
  journal: JournalPost[];
}) {
  const [tab, setTab] = useState<'overview' | 'members' | 'journal'>('overview');

  return (
    <main className="min-h-screen">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="px-6 pt-8 pb-6 border-b border-[var(--herr-border)] flex items-center justify-between">
        <div>
          <Link href="/" className="font-display text-xl tracking-[0.2em] text-[var(--herr-white)]">
            HERR™
          </Link>
          <span className="ml-3 herr-label text-[var(--herr-pink)]">Admin</span>
        </div>
        <Link href="/dashboard" className="herr-label text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors text-xs">
          Member Dashboard →
        </Link>
      </div>

      {/* ── Tab nav ─────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 flex gap-6 border-b border-[var(--herr-border)]">
        {(['overview', 'members', 'journal'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`herr-label pb-4 border-b-2 transition-colors capitalize ${
              tab === t
                ? 'border-[var(--herr-white)] text-[var(--herr-white)]'
                : 'border-transparent text-[var(--herr-muted)] hover:text-[var(--herr-white)]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-6 py-10 max-w-[1200px]">

        {/* ── Overview ──────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-10">

            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--herr-border)]">
              {[
                { label: 'Active Members',  value: stats.activeMembers,             color: 'text-[var(--herr-white)]' },
                { label: 'MRR',             value: `$${stats.mrr.toLocaleString()}`, color: 'text-[var(--herr-cobalt)]' },
                { label: 'Past Due',        value: stats.pastDue,                   color: 'text-yellow-400' },
                { label: 'Journal Posts',   value: stats.journalPosts,              color: 'text-[var(--herr-muted)]' },
              ].map(card => (
                <div key={card.label} className="bg-[var(--herr-black)] p-6">
                  <p className="herr-label text-[var(--herr-muted)] mb-2">{card.label}</p>
                  <p className={`font-display text-4xl font-light ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Tier breakdown */}
            <div>
              <p className="herr-label text-[var(--herr-muted)] mb-4">Active Members by Tier</p>
              <div className="grid md:grid-cols-3 gap-px bg-[var(--herr-border)]">
                {[
                  { tier: 'Collective',   count: stats.byTier.collective,   price: '$9/mo',  color: 'text-[var(--herr-muted)]' },
                  { tier: 'Personalized', count: stats.byTier.personalized, price: '$19/mo', color: 'text-[var(--herr-cobalt)]' },
                  { tier: 'Elite',        count: stats.byTier.elite,        price: '$29/mo', color: 'text-[var(--herr-pink)]' },
                ].map(row => (
                  <div key={row.tier} className="bg-[var(--herr-surface)] p-6">
                    <p className={`herr-label mb-1 ${row.color}`}>{row.tier} — {row.price}</p>
                    <p className="font-display text-3xl font-light text-[var(--herr-white)]">{row.count}</p>
                    <p className="text-xs text-[var(--herr-muted)] mt-1">
                      ${(row.count * parseInt(row.price)).toLocaleString()}/mo
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo code info */}
            <div className="border border-[var(--herr-border)] p-6">
              <p className="herr-label text-[var(--herr-cobalt)] mb-3">Founder Test Access</p>
              <p className="text-[var(--herr-white)] font-mono text-lg mb-2">HERRFOUNDER</p>
              <p className="text-xs text-[var(--herr-muted)]">
                100% off — first month — max 5 uses. Use this code at checkout on any tier to test the full onboarding flow.
              </p>
            </div>

          </div>
        )}

        {/* ── Members ───────────────────────────────────────────────── */}
        {tab === 'members' && (
          <div>
            <p className="herr-label text-[var(--herr-muted)] mb-6">
              {stats.totalMembers} total · {stats.activeMembers} active · {stats.cancelled} cancelled
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--herr-border)]">
                    {['Name / Email', 'Tier', 'Status', 'Onboarded', 'Subscribed'].map(h => (
                      <th key={h} className="herr-label text-[var(--herr-muted)] text-left py-3 pr-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.id} className="border-b border-[var(--herr-border)] hover:bg-[var(--herr-surface)] transition-colors">
                      <td className="py-3 pr-6">
                        <p className="text-[var(--herr-white)]">{m.name || '—'}</p>
                        <p className="text-xs text-[var(--herr-muted)]">{m.email}</p>
                      </td>
                      <td className={`py-3 pr-6 herr-label capitalize ${TIER_COLORS[m.tier] ?? ''}`}>
                        {m.tier}
                      </td>
                      <td className={`py-3 pr-6 herr-label capitalize ${STATUS_COLORS[m.status] ?? ''}`}>
                        {m.status.replace('_', ' ')}
                      </td>
                      <td className="py-3 pr-6">
                        <span className={m.onboarded ? 'text-[var(--herr-cobalt)]' : 'text-[var(--herr-muted)]'}>
                          {m.onboarded ? 'Yes' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 pr-6 text-[var(--herr-muted)]">
                        {m.subscribed_at ? new Date(m.subscribed_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-[var(--herr-muted)]">
                        No members yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Journal ───────────────────────────────────────────────── */}
        {tab === 'journal' && (
          <div>
            <p className="herr-label text-[var(--herr-muted)] mb-6">
              {stats.journalPosts} posts · Auto-generates Tuesdays & Thursdays at 9AM
            </p>
            <div className="space-y-px">
              {journal.map(post => (
                <div key={post.id} className="bg-[var(--herr-surface)] flex items-center justify-between px-6 py-4">
                  <p className="text-[var(--herr-white)] text-sm flex-1 pr-6">{post.title}</p>
                  <div className="flex items-center gap-6 shrink-0">
                    <span className={`herr-label text-xs ${post.status === 'published' ? 'text-[var(--herr-cobalt)]' : 'text-[var(--herr-muted)]'}`}>
                      {post.status}
                    </span>
                    <span className="text-xs text-[var(--herr-muted)]">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              ))}
              {journal.length === 0 && (
                <p className="py-10 text-center text-[var(--herr-muted)]">No journal posts yet.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
