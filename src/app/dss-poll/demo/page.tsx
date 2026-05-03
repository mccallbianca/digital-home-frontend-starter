import type { Metadata } from "next";
import {
  DOMAINS,
  DSS_THEME,
  FONT_STACK,
  type Domain,
  type Tier,
} from "@/lib/dss-poll-shared";
import DomainBarRow from "../_components/DomainBarRow";
import TierRevealCard from "../_components/TierRevealCard";

export const metadata: Metadata = {
  title: "DSS 2026 Live Poll Dashboard (Demo)",
  description:
    "Failsafe composite render of the DSS 2026 live poll dashboard.",
  robots: { index: false, follow: false },
};

/**
 * /dss-poll/demo
 *
 * STATIC FAILSAFE. Hardcoded composite of seven domain scores plus a
 * revealed severity tier. The page the speaker can navigate to
 * directly if the live system is unavailable on stage.
 *
 * Visual reads identically to /dss-poll/results EXCEPT for the
 * amber failsafe banner at the top. The bar rows and tier reveal
 * are rendered through the same DomainBarRow and TierRevealCard
 * components used by /results, so the click-to-expand explanations
 * stay in sync across both pages without code duplication.
 *
 * Composite tuned to "Monitoring Recommended" because that is the
 * most pedagogically useful tier for the keynote (makes the case
 * for clinical literacy without alarming the room).
 */

const COMPOSITE_RESPONSE_COUNT = 184;

const COMPOSITE: ReadonlyArray<{ domain: Domain; score: number }> = [
  { domain: "Identity", score: 32.4 },
  { domain: "Purpose", score: 28.1 },
  { domain: "Connection", score: 38.7 },
  { domain: "Freedom", score: 42.3 },
  { domain: "Isolation", score: 30.5 },
  { domain: "Meaning", score: 26.8 },
  { domain: "Mortality", score: 18.2 },
];

const COMPOSITE_TIER: Tier = "monitoring";
const COMPOSITE_LABEL = "Monitoring Recommended";
const COMPOSITE_INTERPRETATION =
  "This room is touching some existential domains through AI. Worth paying attention to how AI is being used for personal matters.";

export default function DssPollDemoPage() {
  if (
    COMPOSITE.length !== DOMAINS.length ||
    COMPOSITE.some((c, i) => c.domain !== DOMAINS[i])
  ) {
    throw new Error(
      "DSS demo composite domain order drifted from DOMAINS. Fix the array."
    );
  }

  return (
    <div
      style={{
        background: DSS_THEME.pageBg,
        color: DSS_THEME.bodyText,
        fontFamily: FONT_STACK,
        minHeight: "100vh",
      }}
    >
      {/* FAILSAFE BANNER — present only on this page. */}
      <div
        role="status"
        aria-label="Failsafe demo notice"
        style={{
          background: DSS_THEME.warningBg,
          color: DSS_THEME.warningText,
          borderBottom: `2px solid ${DSS_THEME.warningBorder}`,
        }}
      >
        <div className="mx-auto max-w-5xl px-5 sm:px-6 py-4 sm:py-5">
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}
          >
            <span
              aria-hidden
              style={{
                flexShrink: 0,
                fontSize: 22,
                lineHeight: 1,
                marginTop: 2,
              }}
            >
              ⚠
            </span>
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  margin: 0,
                  marginBottom: 4,
                }}
              >
                Failsafe demo &middot; Not live data
              </p>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                This is a failsafe demo with simulated audience data. Use
                only if the live poll system fails during the keynote.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header band */}
      <header
        style={{
          background: DSS_THEME.bandBg,
          color: DSS_THEME.bandText,
        }}
      >
        <div className="mx-auto max-w-5xl px-5 sm:px-6 py-8 sm:py-10">
          <p
            style={{
              color: DSS_THEME.bandEyebrow,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            DSS 2026 Live Dashboard (Failsafe)
          </p>
          <h1
            style={{
              fontSize: "clamp(28px, 6vw, 36px)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            How is this room using AI?
          </h1>
          <p
            style={{
              color: "rgba(244, 241, 235, 0.78)",
              fontSize: 16,
              lineHeight: 1.55,
              marginTop: 14,
              marginBottom: 0,
              maxWidth: 720,
            }}
          >
            Seven existential domain scores from the ECQO rubric. This
            view is a composite of representative results. The live
            dashboard at /dss-poll/results is the canonical source.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 sm:px-6 py-10 sm:py-14">
        <div style={{ display: "grid", gap: 36 }}>
          {/* Response counter */}
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
                  letterSpacing: "-0.02em",
                  color: DSS_THEME.bodyText,
                  margin: 0,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {COMPOSITE_RESPONSE_COUNT}
              </p>
            </div>
            <p
              style={{
                color: DSS_THEME.ctaPrimaryBg,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Composite view
            </p>
          </div>

          {/* Domain bars (with click-to-expand explanations) */}
          <section
            aria-label="Domain scores"
            style={{ display: "grid", gap: 12 }}
          >
            {COMPOSITE.map(({ domain, score }) => (
              <DomainBarRow
                key={domain}
                domain={domain}
                score={score}
                animate={false}
              />
            ))}
          </section>

          {/* Tier reveal (with click-to-expand "What does this mean?") */}
          <TierRevealCard
            tier={COMPOSITE_TIER}
            label={COMPOSITE_LABEL}
            interpretation={COMPOSITE_INTERPRETATION}
          />
        </div>
      </main>

      <footer
        style={{
          background: DSS_THEME.bandBg,
          color: DSS_THEME.bandText,
        }}
      >
        <div className="mx-auto max-w-5xl px-5 sm:px-6 py-6">
          <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>
            HERR by ECQO Holdings &middot; h3rr.com
          </p>
        </div>
      </footer>
    </div>
  );
}
