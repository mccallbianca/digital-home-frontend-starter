'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

const MODES = ['workout','driving','sleep','morning','deepwork','lovefamily','abundance','healing'];
const DOMAINS = ['mortality','meaning','connection','freedom','identity','guilt','spiritual'];
const TIERS = ['low_concern','moderate_unease','elevated_disruption'];
const STATUSES = ['queued','mixing','ready','delivered','failed','text_only'];
const VOICES = ['bianca','user_clone','text_only'];

export type FilterState = {
  startDate: string;
  endDate: string;
  modes: string[];
  domains: string[];
  tiers: string[];
  statuses: string[];
  voices: string[];
};

export default function AuditFilters({ initial }: { initial: FilterState }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [s, setS] = useState<FilterState>(initial);

  const hasAny = useMemo(() => {
    return (
      !!s.startDate || !!s.endDate ||
      s.modes.length > 0 || s.domains.length > 0 ||
      s.tiers.length > 0 || s.statuses.length > 0 ||
      s.voices.length > 0
    );
  }, [s]);

  function toggleIn(list: string[], v: string): string[] {
    return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  }

  function apply() {
    const params = new URLSearchParams();
    if (s.startDate) params.set('start', s.startDate);
    if (s.endDate) params.set('end', s.endDate);
    if (s.modes.length) params.set('mode', s.modes.join(','));
    if (s.domains.length) params.set('domain', s.domains.join(','));
    if (s.tiers.length) params.set('tier', s.tiers.join(','));
    if (s.statuses.length) params.set('status', s.statuses.join(','));
    if (s.voices.length) params.set('voice', s.voices.join(','));
    router.push(`?${params.toString()}`);
  }

  function reset() {
    setS({ startDate: '', endDate: '', modes: [], domains: [], tiers: [], statuses: [], voices: [] });
    router.push(window.location.pathname);
  }

  const groupStyle: React.CSSProperties = {
    marginBottom: 14,
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'var(--herr-ink-soft,#5a5a5a)',
    display: 'block',
    marginBottom: 6,
  };
  const chipBase: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 10px',
    border: '1px solid var(--herr-border,#e5e2da)',
    borderRadius: 999,
    fontSize: 12,
    cursor: 'pointer',
    marginRight: 6,
    marginBottom: 6,
    userSelect: 'none',
  };

  function chip(list: string[], v: string, onClick: () => void) {
    const on = list.includes(v);
    return (
      <span
        key={v}
        onClick={onClick}
        style={{
          ...chipBase,
          background: on ? 'var(--herr-ink,#1a1a1a)' : 'transparent',
          color: on ? 'var(--herr-cream,#faf8f3)' : 'inherit',
          borderColor: on ? 'var(--herr-ink,#1a1a1a)' : 'var(--herr-border,#e5e2da)',
        }}
      >
        {v.replace(/_/g, ' ')}
      </span>
    );
  }

  return (
    <details
      open={hasAny}
      style={{
        background: 'var(--herr-white)',
        border: '1px solid var(--herr-border,#e5e2da)',
        borderRadius: 6,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 500, letterSpacing: 0.4 }}>
        Filters {hasAny && <span style={{ color: 'var(--herr-cobalt,#1a4789)' }}>· active</span>}
      </summary>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div>
          <div style={groupStyle}>
            <label style={labelStyle}>Date range</label>
            <input type="date" value={s.startDate} onChange={(e) => setS((x) => ({ ...x, startDate: e.target.value }))}
              style={{ padding: '6px 10px', border: '1px solid var(--herr-border,#e5e2da)', borderRadius: 3, fontSize: 13, marginRight: 8 }} />
            <input type="date" value={s.endDate} onChange={(e) => setS((x) => ({ ...x, endDate: e.target.value }))}
              style={{ padding: '6px 10px', border: '1px solid var(--herr-border,#e5e2da)', borderRadius: 3, fontSize: 13 }} />
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>Activity mode</label>
            {MODES.map((m) => chip(s.modes, m, () => setS((x) => ({ ...x, modes: toggleIn(x.modes, m) }))))}
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>Existential domain</label>
            {DOMAINS.map((d) => chip(s.domains, d, () => setS((x) => ({ ...x, domains: toggleIn(x.domains, d) }))))}
          </div>
        </div>

        <div>
          <div style={groupStyle}>
            <label style={labelStyle}>Risk tier</label>
            {TIERS.map((t) => chip(s.tiers, t, () => setS((x) => ({ ...x, tiers: toggleIn(x.tiers, t) }))))}
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>Status</label>
            {STATUSES.map((st) => chip(s.statuses, st, () => setS((x) => ({ ...x, statuses: toggleIn(x.statuses, st) }))))}
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>Voice source</label>
            {VOICES.map((v) => chip(s.voices, v, () => setS((x) => ({ ...x, voices: toggleIn(x.voices, v) }))))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          onClick={apply}
          style={{
            padding: '8px 16px',
            background: 'var(--herr-ink,#1a1a1a)',
            color: 'var(--herr-cream,#faf8f3)',
            border: 'none',
            borderRadius: 3,
            fontSize: 13,
            cursor: 'pointer',
            letterSpacing: 0.4,
          }}
        >
          Apply filters
        </button>
        <button
          onClick={reset}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            color: 'inherit',
            border: '1px solid var(--herr-border,#e5e2da)',
            borderRadius: 3,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
        {sp.toString() && (
          <span style={{ alignSelf: 'center', fontSize: 12, color: 'var(--herr-ink-soft,#5a5a5a)' }}>
            URL: ?{sp.toString().slice(0, 80)}{sp.toString().length > 80 ? '…' : ''}
          </span>
        )}
      </div>
    </details>
  );
}
