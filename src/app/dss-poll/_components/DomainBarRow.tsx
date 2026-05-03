"use client";

import { useId, useState } from "react";
import {
  DOMAIN_COLORS,
  DOMAIN_EXPLANATIONS,
  DSS_THEME,
  FONT_STACK,
  type Domain,
} from "@/lib/dss-poll-shared";

/**
 * One domain bar row with an inline disclosure: a small "i" info
 * button to the right of the domain name expands a plain-language
 * panel beneath the bar with the rubric's rationale for that domain.
 *
 * Used by both /dss-poll/results (live values via API) and
 * /dss-poll/demo (hardcoded composite values). Animates the bar fill
 * width transition only when `animate` is true (false on /demo to
 * avoid the failsafe page looking like it's still updating).
 */
export default function DomainBarRow({
  domain,
  score,
  animate = true,
}: {
  domain: Domain;
  score: number;
  animate?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const color = DOMAIN_COLORS[domain];
  const width = Math.max(0, Math.min(100, score));

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(7rem, 9rem) 1fr 4rem",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            color: DSS_THEME.bodyText,
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {domain}
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={panelId}
            aria-label={`Show explanation for the ${domain} domain`}
            onClick={() => setExpanded((v) => !v)}
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              border: `1.5px solid ${DSS_THEME.headerSecondary}`,
              background: expanded
                ? DSS_THEME.headerSecondary
                : "transparent",
              color: expanded
                ? DSS_THEME.pageBg
                : DSS_THEME.headerSecondary,
              fontFamily: FONT_STACK,
              fontSize: 11,
              fontWeight: 700,
              fontStyle: "italic",
              lineHeight: 1,
              padding: 0,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            i
          </button>
        </span>

        <div
          role="progressbar"
          aria-valuenow={Math.round(width)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${domain} score`}
          style={{
            height: 16,
            background: DSS_THEME.cardBg,
            border: `1px solid ${DSS_THEME.cardBorder}`,
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${width}%`,
              background: color,
              transition: animate
                ? "width 700ms cubic-bezier(0.2, 0.7, 0.2, 1)"
                : "none",
            }}
          />
        </div>

        <span
          style={{
            color: DSS_THEME.bodyText,
            fontSize: 18,
            fontWeight: 700,
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {width.toFixed(1)}
        </span>
      </div>

      {expanded && (
        <div
          id={panelId}
          role="region"
          aria-label={`${domain} explanation`}
          style={{
            marginTop: 10,
            background: DSS_THEME.cardBg,
            border: `1px solid ${DSS_THEME.cardBorder}`,
            borderLeft: `4px solid ${DSS_THEME.headerSecondary}`,
            borderRadius: 8,
            padding: "16px 18px",
          }}
        >
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.55,
              color: DSS_THEME.bodyText,
              margin: 0,
            }}
          >
            {DOMAIN_EXPLANATIONS[domain]}
          </p>
        </div>
      )}
    </div>
  );
}
