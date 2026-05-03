"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import {
  DOMAINS,
  DSS_THEME,
  FONT_STACK,
  SESSION_ID,
  type Domain,
  type Tier,
} from "@/lib/dss-poll-shared";
import DomainBarRow from "./DomainBarRow";
import TierRevealCard from "./TierRevealCard";

interface DomainScore {
  domain: Domain;
  score: number;
}

interface ScoreApiResponse {
  responseCount: number;
  voting_open: boolean;
  reveal_triggered: boolean;
  effective_reveal: boolean;
  domainScores: DomainScore[];
  tier?: Tier;
  tierLabel?: string;
  tierInterpretation?: string;
}

const INITIAL_DOMAIN_SCORES: DomainScore[] = DOMAINS.map((d) => ({
  domain: d,
  score: 0,
}));

const INITIAL: ScoreApiResponse = {
  responseCount: 0,
  voting_open: true,
  reveal_triggered: false,
  effective_reveal: false,
  domainScores: INITIAL_DOMAIN_SCORES,
};

// 1.5 s polling fallback. The Realtime subscription is the primary
// fast path, but on browsers/networks where WebSocket fails (Safari
// over localhost, restrictive corporate proxies), polling alone keeps
// the dashboard live within ~1.5 seconds of any change.
const POLL_INTERVAL_MS = 1500;

export default function ResultsDashboard() {
  const [data, setData] = useState<ScoreApiResponse>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const lastFetchAt = useRef<number>(0);

  const fetchScore = useCallback(async () => {
    try {
      const res = await fetch("/api/dss-poll/score", { cache: "no-store" });
      if (!res.ok) {
        setError(`Score endpoint returned ${res.status}.`);
        return;
      }
      const json = (await res.json()) as ScoreApiResponse;
      setData(json);
      setError(null);
      lastFetchAt.current = Date.now();
    } catch (e) {
      console.error("[ResultsDashboard] fetch error:", e);
      setError("Lost connection to the score endpoint.");
    }
  }, []);

  // Initial load + periodic polling fallback. This runs unconditionally
  // and is the canonical update mechanism; Realtime is an optional
  // accelerator on top of it.
  useEffect(() => {
    fetchScore();
    const id = setInterval(fetchScore, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchScore]);

  // Realtime: refetch on any insert or session-state change.
  // Wrapped in try/catch so any synchronous WebSocket failure (notably
  // Safari over localhost without HTTPS) does not break the page.
  // Async subscription errors are caught via the subscribe callback.
  // The polling effect above continues to drive updates regardless.
  useEffect(() => {
    type SupabaseRT = ReturnType<typeof createClient>;
    type Channel = ReturnType<SupabaseRT["channel"]>;
    let supabase: SupabaseRT | null = null;
    let channel: Channel | null = null;

    try {
      supabase = createClient();
      channel = supabase
        .channel(`dss-poll-${SESSION_ID}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "dss_poll_responses",
            filter: `session_id=eq.${SESSION_ID}`,
          },
          () => {
            if (Date.now() - lastFetchAt.current > 400) fetchScore();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "dss_poll_session_state",
            filter: `session_id=eq.${SESSION_ID}`,
          },
          () => fetchScore()
        )
        .subscribe((status, err) => {
          if (err) {
            console.warn(
              "[ResultsDashboard] Realtime subscribe error, polling fallback only:",
              err
            );
          }
        });
    } catch (e) {
      console.warn(
        "[ResultsDashboard] Realtime setup failed, polling fallback only:",
        e
      );
    }

    return () => {
      if (supabase && channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          // No-op: cleanup must never throw.
        }
      }
    };
  }, [fetchScore]);

  const showEmptyStateMessage = data.responseCount < 10;

  return (
    <div style={{ display: "grid", gap: 36, fontFamily: FONT_STACK }}>
      <ResponseCounter count={data.responseCount} voting={data.voting_open} />
      {showEmptyStateMessage && (
        <p
          role="status"
          aria-live="polite"
          style={{
            color: DSS_THEME.textMuted,
            fontSize: 16,
            fontStyle: "italic",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Awaiting more responses. Domain scores activate at 10 voices.
        </p>
      )}
      <section aria-label="Domain scores" style={{ display: "grid", gap: 12 }}>
        {data.domainScores.map((s) => (
          <DomainBarRow key={s.domain} domain={s.domain} score={s.score} />
        ))}
      </section>
      {data.effective_reveal && data.tier && (
        <TierRevealCard
          tier={data.tier}
          label={data.tierLabel ?? ""}
          interpretation={data.tierInterpretation ?? ""}
        />
      )}
      {error && (
        <div
          role="alert"
          style={{
            background: DSS_THEME.errorBg,
            border: `1px solid ${DSS_THEME.errorBorder}`,
            borderRadius: 10,
            padding: 12,
            color: DSS_THEME.errorText,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

function ResponseCounter({
  count,
  voting,
}: {
  count: number;
  voting: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div>
        <p
          style={{
            color: DSS_THEME.textMuted,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            margin: 0,
            marginBottom: 6,
          }}
        >
          Voices in the room
        </p>
        <p
          style={{
            fontSize: "clamp(56px, 12vw, 80px)",
            fontWeight: 800,
            lineHeight: 1,
            color: DSS_THEME.bodyText,
            margin: 0,
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
          }}
          aria-live="polite"
        >
          {count}
        </p>
      </div>
      <p
        style={{
          color: voting ? DSS_THEME.ctaPrimaryBg : DSS_THEME.textMuted,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {voting ? "Voting open" : "Voting closed"}
      </p>
    </div>
  );
}
