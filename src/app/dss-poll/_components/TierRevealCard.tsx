"use client";

import { useId, useState } from "react";
import {
  DSS_THEME,
  FONT_STACK,
  TIER_COLORS,
  TIER_EXPLANATIONS,
  type Tier,
} from "@/lib/dss-poll-shared";

/**
 * Severity tier reveal card with an expandable "What does this mean?"
 * disclosure. When expanded, shows up to three subsections drawn
 * from TIER_EXPLANATIONS in dss-poll-shared.ts:
 *
 *   - WHAT IT MEANS         (always present)
 *   - WHAT THIS ROOM IS CARRYING  (omitted for engagement_gap)
 *   - WHAT TO DO NEXT       (always present)
 *
 * Each subsection header is rendered in 13px uppercase ECQO Dark
 * Purple, its body in 16px near-black on a light-gray panel.
 */
export default function TierRevealCard({
  tier,
  label,
  interpretation,
}: {
  tier: Tier;
  label: string;
  interpretation: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const accent = TIER_COLORS[tier];
  const explanation = TIER_EXPLANATIONS[tier];

  return (
    <section
      aria-label="Severity tier"
      style={{
        background: DSS_THEME.cardBg,
        border: `1px solid ${DSS_THEME.cardBorder}`,
        borderLeft: `8px solid ${accent}`,
        borderRadius: 12,
        padding: 28,
      }}
    >
      <p
        style={{
          color: accent,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          margin: 0,
          marginBottom: 8,
        }}
      >
        Severity tier
      </p>
      <h2
        style={{
          fontSize: "clamp(22px, 4.5vw, 28px)",
          fontWeight: 800,
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
          color: DSS_THEME.bodyText,
          margin: 0,
          marginBottom: 10,
        }}
      >
        {label}
      </h2>
      <p
        style={{
          fontSize: 18,
          lineHeight: 1.55,
          color: DSS_THEME.bodyText,
          margin: 0,
          marginBottom: 18,
        }}
      >
        {interpretation}
      </p>

      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((v) => !v)}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          color: DSS_THEME.ctaPrimaryBg,
          fontFamily: FONT_STACK,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "0.03em",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>What does this mean?</span>
        <Chevron expanded={expanded} />
      </button>

      {expanded && (
        <div
          id={panelId}
          role="region"
          aria-label={`${label} detailed explanation`}
          style={{
            marginTop: 16,
            background: DSS_THEME.pageBg,
            border: `1px solid ${DSS_THEME.cardBorder}`,
            borderRadius: 10,
            padding: 24,
            display: "grid",
            gap: 18,
          }}
        >
          <ExplanationSection
            label="What it means"
            body={explanation.whatItMeans}
          />
          {explanation.whatThisRoomIsCarrying && (
            <ExplanationSection
              label="What this room is carrying"
              body={explanation.whatThisRoomIsCarrying}
            />
          )}
          <ExplanationSection
            label="What to do next"
            body={explanation.whatToDoNext}
          />
        </div>
      )}

      {tier === "human_review" && <SafetyFooter />}
    </section>
  );
}

/**
 * 988 safety footer shown only on the Human Review Required tier.
 * Visually de-emphasized: 14px text in muted gray, separated from
 * the tier card body by a subtle horizontal divider, with the
 * 988 logo at 28px height aligned with the text. Phrased as a
 * resource, not a referral; nothing in this footer suggests the
 * viewer is being assessed as in crisis.
 */
function SafetyFooter() {
  return (
    <div
      role="note"
      aria-label="988 Suicide and Crisis Lifeline resource"
      style={{
        marginTop: 24,
        paddingTop: 18,
        borderTop: `1px solid ${DSS_THEME.cardBorder}`,
        display: "flex",
        gap: 14,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/988-lifeline-logo.png"
        alt="988 Suicide and Crisis Lifeline"
        style={{
          height: 28,
          width: "auto",
          flexShrink: 0,
          display: "block",
        }}
      />
      <p
        style={{
          fontSize: 14,
          color: DSS_THEME.textMuted,
          margin: 0,
          lineHeight: 1.5,
          flex: "1 1 280px",
        }}
      >
        If something on this screen is bringing up something urgent,
        the{" "}
        <a
          href="tel:988"
          style={{
            color: DSS_THEME.headerSecondary,
            fontWeight: 700,
          }}
        >
          988 Suicide &amp; Crisis Lifeline
        </a>{" "}
        is available 24 hours. Call or text 988. Free and confidential.
      </p>
    </div>
  );
}

function ExplanationSection({
  label,
  body,
}: {
  label: string;
  body: string;
}) {
  // Split body on blank lines to support multi-paragraph copy
  // (currently only the human_review "What to do next" uses this).
  // Single-paragraph copy yields a one-element array and renders
  // identically to the prior single-paragraph layout.
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <div>
      <p
        style={{
          color: DSS_THEME.headerPrimary,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          margin: 0,
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      {paragraphs.map((para, i) => (
        <p
          key={i}
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: DSS_THEME.bodyText,
            margin: 0,
            marginTop: i === 0 ? 0 : 12,
          }}
        >
          {para}
        </p>
      ))}
    </div>
  );
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform 200ms ease",
        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <path d="M3 5l4 4 4-4" />
    </svg>
  );
}
