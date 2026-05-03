"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import {
  AUTO_REVEAL_THRESHOLD,
  DSS_THEME,
  FONT_STACK,
  SESSION_ID,
} from "@/lib/dss-poll-shared";

interface ScoreApiResponse {
  responseCount: number;
  voting_open: boolean;
  reveal_triggered: boolean;
  effective_reveal: boolean;
}

const POLL_INTERVAL_MS = 1500;

export default function AdminConsole() {
  const [state, setState] = useState<ScoreApiResponse | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/dss-poll/score", { cache: "no-store" });
      const json = (await res.json()) as ScoreApiResponse & {
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? `Score endpoint returned ${res.status}.`);
        return;
      }
      setState(json);
      setError(null);
    } catch (e) {
      console.error("[AdminConsole] refresh error:", e);
      setError("Lost connection to the score endpoint.");
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`dss-poll-admin-${SESSION_ID}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dss_poll_responses",
          filter: `session_id=eq.${SESSION_ID}`,
        },
        () => refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "dss_poll_session_state",
          filter: `session_id=eq.${SESSION_ID}`,
        },
        () => refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  async function action(
    payload:
      | { action: "reveal" | "close" | "open" }
      | { action: "reset"; confirm: true }
  ) {
    setBusy(payload.action);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/dss-poll/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
      };
      if (!res.ok || !json.success) {
        setError(json.error ?? `Request failed with status ${res.status}.`);
      } else {
        setNotice(`Action "${payload.action}" applied.`);
        if (payload.action === "reset") setConfirmingReset(false);
        await refresh();
      }
    } catch (e) {
      console.error("[AdminConsole] action error:", e);
      setError("Action failed. Check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  function exportResponsesCsv() {
    window.location.href = "/api/dss-poll/export";
  }

  function exportEmailsCsv() {
    window.location.href = "/api/dss-poll/export-emails";
  }

  const responseCount = state?.responseCount ?? 0;
  const votingOpen = state?.voting_open ?? true;
  const revealTriggered = state?.reveal_triggered ?? false;
  const effectiveReveal = state?.effective_reveal ?? false;
  const autoRevealReady = responseCount >= AUTO_REVEAL_THRESHOLD;

  return (
    <div style={{ display: "grid", gap: 28, fontFamily: FONT_STACK }}>
      {/* Live state card */}
      <section
        style={{
          background: DSS_THEME.cardBg,
          border: `1px solid ${DSS_THEME.cardBorder}`,
          borderRadius: 12,
          padding: 24,
        }}
      >
        <p
          style={{
            color: DSS_THEME.textMuted,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            margin: 0,
            marginBottom: 16,
          }}
        >
          Live state
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 16,
          }}
        >
          <Stat label="Responses" value={responseCount.toString()} />
          <Stat
            label="Voting"
            value={votingOpen ? "Open" : "Closed"}
            tone={votingOpen ? "magenta" : "muted"}
          />
          <Stat
            label="Reveal"
            value={revealTriggered ? "Triggered" : "Hidden"}
            tone={revealTriggered ? "magenta" : "muted"}
          />
          <Stat
            label="Effective"
            value={effectiveReveal ? "Visible" : "Pending"}
            tone={effectiveReveal ? "magenta" : "muted"}
          />
        </div>
        <p
          style={{
            marginTop: 18,
            marginBottom: 0,
            fontSize: 14,
            color: DSS_THEME.textMuted,
            lineHeight: 1.5,
          }}
        >
          Auto-reveal triggers at {AUTO_REVEAL_THRESHOLD} responses
          (currently {responseCount}/{AUTO_REVEAL_THRESHOLD}
          {autoRevealReady ? ", reached" : ""}). Reveal-Tier below works
          before that threshold.
        </p>
      </section>

      {/* Action buttons */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <Button
          label={revealTriggered ? "Tier already revealed" : "Reveal tier"}
          onClick={() => action({ action: "reveal" })}
          disabled={busy !== null || revealTriggered}
          busy={busy === "reveal"}
          variant="primary"
        />
        <Button
          label={votingOpen ? "Close voting" : "Open voting"}
          onClick={() =>
            action({ action: votingOpen ? "close" : "open" })
          }
          disabled={busy !== null}
          busy={busy === "close" || busy === "open"}
          variant="secondary"
        />
        <Button
          label="Export anonymous responses CSV"
          onClick={exportResponsesCsv}
          disabled={busy !== null}
          busy={false}
          variant="secondary"
        />
        <Button
          label="Export email opt-ins CSV"
          onClick={exportEmailsCsv}
          disabled={busy !== null}
          busy={false}
          variant="secondary"
        />
        {!confirmingReset ? (
          <Button
            label="Reset session..."
            onClick={() => setConfirmingReset(true)}
            disabled={busy !== null}
            busy={false}
            variant="danger"
          />
        ) : (
          <div
            style={{
              gridColumn: "1 / -1",
              background: DSS_THEME.errorBg,
              border: `1px solid ${DSS_THEME.errorBorder}`,
              borderRadius: 12,
              padding: 18,
            }}
          >
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.5,
                color: DSS_THEME.errorText,
                margin: 0,
                marginBottom: 14,
              }}
            >
              Reset deletes every response and reopens voting. This
              cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button
                label="Confirm reset"
                onClick={() =>
                  action({ action: "reset", confirm: true })
                }
                disabled={busy !== null}
                busy={busy === "reset"}
                variant="danger"
              />
              <Button
                label="Cancel"
                onClick={() => setConfirmingReset(false)}
                disabled={busy !== null}
                busy={false}
                variant="secondary"
              />
            </div>
          </div>
        )}
      </section>

      {/* Notice / error banners */}
      {notice && (
        <div
          role="status"
          style={{
            background: DSS_THEME.successBg,
            border: `1px solid ${DSS_THEME.successBorder}`,
            borderRadius: 10,
            padding: 12,
            color: DSS_THEME.successText,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {notice}
        </div>
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
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

type StatTone = "default" | "magenta" | "muted";

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: StatTone;
}) {
  const valueColor =
    tone === "magenta"
      ? DSS_THEME.ctaPrimaryBg
      : tone === "muted"
        ? DSS_THEME.textMuted
        : DSS_THEME.bodyText;
  return (
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
        {label}
      </p>
      <p
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: valueColor,
          margin: 0,
          lineHeight: 1.2,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </p>
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "danger";

function Button({
  label,
  onClick,
  disabled,
  busy,
  variant,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  busy: boolean;
  variant: ButtonVariant;
}) {
  let bg: string = DSS_THEME.cardBg;
  let fg: string = DSS_THEME.bodyText;
  let border: string = DSS_THEME.cardBorder;
  if (variant === "primary") {
    bg = DSS_THEME.ctaPrimaryBg;
    fg = DSS_THEME.ctaPrimaryText;
    border = DSS_THEME.ctaPrimaryBg;
  } else if (variant === "secondary") {
    bg = DSS_THEME.ctaSecondaryBg;
    fg = DSS_THEME.ctaSecondaryText;
    border = DSS_THEME.ctaSecondaryBg;
  } else if (variant === "danger") {
    bg = DSS_THEME.pageBg;
    fg = DSS_THEME.errorText;
    border = DSS_THEME.errorBorder;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: bg,
        color: fg,
        border: `1px solid ${border}`,
        borderRadius: 999,
        padding: "14px 22px",
        fontFamily: FONT_STACK,
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        minHeight: 56,
      }}
    >
      {busy ? "Working..." : label}
    </button>
  );
}
