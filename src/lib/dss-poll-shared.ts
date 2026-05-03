/**
 * DSS 2026 Live Poll — client-safe shared constants.
 *
 * This file contains constants that are safe to import from BOTH client
 * and server components. It deliberately does NOT contain:
 *   - Domain weighting (kept in dss-poll-rubric.ts, server-only)
 *   - Tier thresholds or scoring logic
 *   - Admin email allowlist
 *
 * The poll page renders question text from POLL_QUESTIONS. The results
 * dashboard reads tier color tokens and the seven-domain palette from
 * here. Severity tier label and interpretation strings are returned by
 * /api/dss-poll/score so they only ever travel from server to client
 * after the reveal flag is set.
 */

export const SESSION_ID = "dss_2026_main";

export const LIKERT_LABELS = [
  "Never",
  "Rarely",
  "Sometimes",
  "Often",
  "Constantly",
] as const;

export type LikertValue = 0 | 1 | 2 | 3 | 4;

export interface PollQuestion {
  id: 1 | 2 | 3 | 4 | 5;
  title: string;
  examples: string;
}

export const POLL_QUESTIONS: readonly PollQuestion[] = [
  {
    id: 1,
    title: "Document or message refinement.",
    examples:
      "Resumes, reports, business plans, emails, books, and so on.",
  },
  {
    id: 2,
    title: "Mild to moderate problem solving.",
    examples:
      "A frustrating coworker, a budgeting question, a difficult conversation to plan, a logistics knot, a homework help request for your kid.",
  },
  {
    id: 3,
    title: "Moderate to severe problem solving.",
    examples:
      "A custody concern, a workplace HR situation, a major financial decision under stress, a parenting crisis, a health scare you were trying to make sense of.",
  },
  {
    id: 4,
    title: "Counseling, therapy, or significant decision making.",
    examples:
      "A relationship at a breaking point, a career change, processing grief, deciding whether to leave a job, a mental health struggle you didn't take to a clinician.",
  },
  {
    id: 5,
    title: "Existential concerns.",
    examples:
      "The meaning of your life, the fear of dying, the search for purpose, the experience of freedom or its absence, questions about who you are becoming.",
  },
];

export type Domain =
  | "Identity"
  | "Purpose"
  | "Connection"
  | "Freedom"
  | "Isolation"
  | "Meaning"
  | "Mortality";

export const DOMAINS: readonly Domain[] = [
  "Identity",
  "Purpose",
  "Connection",
  "Freedom",
  "Isolation",
  "Meaning",
  "Mortality",
] as const;

/**
 * Seven-domain color palette built from the four ECQO base colors plus
 * three interpolated shades, in the order the dashboard renders bars.
 *
 * Base colors:
 *   #7B3F9E Purple
 *   #5C3478 Dark Purple
 *   #2B4FA0 Royal Blue
 *   #3A6FBF Medium Blue
 */
export const DOMAIN_COLORS: Readonly<Record<Domain, string>> = {
  Identity: "#7B3F9E",
  Purpose: "#6B3B8B",
  Connection: "#5C3478",
  Freedom: "#43418C",
  Isolation: "#2B4FA0",
  Meaning: "#335FB0",
  Mortality: "#3A6FBF",
};

export type Tier = "stable" | "monitoring" | "human_review" | "engagement_gap";

export const TIER_COLORS: Record<Tier, string> = {
  stable: "#10B981",
  monitoring: "#F59E0B",
  human_review: "#EF4444",
  engagement_gap: "#6B7280",
};

/**
 * Auto-reveal threshold.
 *
 * When responseCount reaches this number, /api/dss-poll/score returns
 * the tier even if reveal_triggered is still false. This lets the
 * dashboard auto-reveal as soon as the data is statistically
 * meaningful, regardless of admin action.
 *
 * Set to 10 to align with MIN_RESPONSES_FOR_TIER in dss-poll-rubric.ts:
 * the rubric requires at least 10 responses before it computes domain
 * math at all, so 10 is also the lowest count at which a tier other
 * than engagement_gap is even possible. Below 10 the tier is forced
 * to engagement_gap with all bars at 0; revealing earlier than that
 * shows the engagement-gap state, which is intentional but not very
 * useful pedagogically.
 *
 * 10 was chosen over higher numbers (50, 100) because the keynote
 * window is short. By the time a higher fraction of a 100-person
 * room has voted, the moment is gone. Auto-reveal at the statistical
 * minimum gives the speaker a usable read inside the first minute or
 * two of polling.
 */
export const AUTO_REVEAL_THRESHOLD = 10;

/**
 * High-contrast hybrid theme for /dss-poll, /dss-poll/results,
 * /dss-poll/demo (and eventually /dss-poll/admin).
 *
 * White content surfaces with near-black body text. Dark accent
 * bands ONLY at the top header strip and the bottom footer strip.
 *
 * All foreground/background pairs below pass WCAG AA contrast at
 * normal text sizes (4.5:1 minimum). Pairs at large display sizes
 * (>=18px bold or >=24px) only need 3:1; flagged inline where they
 * sit closer to the floor.
 */
export const DSS_THEME = {
  // Page surfaces
  pageBg: "#FFFFFF",
  bodyText: "#0A0A0F",         // 20.4:1 on white, AAA
  textMuted: "#4A4A55",        // 8.9:1 on white, AAA
  divider: "#E5E5EA",

  // Header / footer accent bands (only at top + bottom strips)
  bandBg: "#0A0A0F",
  bandText: "#F4F1EB",         // 18.5:1 on bandBg, AAA
  bandEyebrow: "#C42D8E",      // 4.7:1 on bandBg, AA for >=18px

  // Section headers
  headerPrimary: "#5C3478",    // 9.6:1 on white, AAA — ECQO Dark Purple
  headerSecondary: "#2B4FA0",  // 8.7:1 on white, AAA — ECQO Royal Blue

  // CTAs
  ctaPrimaryBg: "#C42D8E",     // HERR Magenta
  ctaPrimaryText: "#FFFFFF",   // 4.7:1, AA at 18px+ bold
  ctaSecondaryBg: "#7B3F9E",   // ECQO Purple
  ctaSecondaryText: "#FFFFFF", // 7.0:1, AAA
  ctaTertiaryText: "#5C3478",  // for outline/ghost style

  // Cards
  cardBg: "#F8F8FA",
  cardBorder: "#E5E5EA",
  cardBodyText: "#0A0A0F",     // 19.6:1 on cardBg, AAA
  cardMuted: "#4A4A55",        // 8.4:1 on cardBg, AAA

  // Inputs / radio chips
  chipBgUnselected: "#FFFFFF",
  chipBorderUnselected: "#D1D1D6",
  chipTextUnselected: "#4A4A55",
  chipBgSelected: "#C42D8E",
  chipTextSelected: "#FFFFFF",

  // Banner / alert tones (used by /dss-poll/demo failsafe banner
  // and any inline error state).
  warningBg: "#FEF3C7",
  warningBorder: "#F59E0B",
  warningText: "#7C2D12",      // 9.6:1 on warningBg, AAA
  errorBg: "#FEE2E2",
  errorBorder: "#EF4444",
  errorText: "#991B1B",        // 9.0:1 on errorBg, AAA
  successBg: "#D1FAE5",
  successBorder: "#10B981",
  successText: "#065F46",
} as const;

/**
 * Typography stack for DSS poll surfaces. Matches the existing
 * h3rr.com / 3ME system fonts and avoids the cost of loading
 * custom webfonts for a single-event microsite.
 */
export const FONT_STACK =
  "'Helvetica Neue', Arial, Helvetica, sans-serif";

/**
 * Plain-language explanation shown when a viewer expands the info
 * disclosure on a domain bar. These are the public-facing rationales
 * for the seven existential domains the rubric scores.
 */
export const DOMAIN_EXPLANATIONS: Readonly<Record<Domain, string>> = {
  Identity:
    "Who you are. The story you tell yourself about yourself. When AI starts shaping your sense of self, the score on this domain rises.",
  Purpose:
    "Why you're here. The work, the role, the reason. When AI starts answering your purpose questions, the score on this domain rises.",
  Connection:
    "How you relate to others. The people who matter, the ones you're losing, the ones you're trying to keep. When AI fills in for human relationships, the score on this domain rises.",
  Freedom:
    "What you're allowed to do. The choices you're making, the choices that feel taken from you. When AI is helping you navigate constraint or decision, the score on this domain rises.",
  Isolation:
    "How alone you feel. Whether you're processing your hardest moments with another human, or with a machine. When AI is the place you go when no one else is there, the score on this domain rises.",
  Meaning:
    "What your life adds up to. The big questions you carry. When AI is engaging your search for meaning, the score on this domain rises.",
  Mortality:
    "Death, loss, finitude. Yours, the people you love, the ones you've already lost. When AI is touching mortality questions, the score on this domain rises.",
};

/**
 * Three-part deeper explanation revealed by the "What does this mean?"
 * disclosure under the tier reveal card. The engagement_gap tier
 * intentionally has no "What this room is carrying" subsection
 * because there is no scoring signal yet.
 */
export interface TierExplanation {
  whatItMeans: string;
  whatThisRoomIsCarrying?: string;
  whatToDoNext: string;
}

export const TIER_EXPLANATIONS: Record<Tier, TierExplanation> = {
  stable: {
    whatItMeans:
      "This room is using AI as a tool. Resumes, emails, problem solving at the practical level. The relationship is functional. Existential domains are not significantly engaged.",
    whatThisRoomIsCarrying:
      "A workforce that has kept the boundary between productivity tools and personal processing intact. AI is in the toolbox, not in the chest cavity.",
    whatToDoNext:
      "Maintain clinical literacy on AI use among your colleagues and clients. The boundary you're holding is not the cultural default. Keep teaching it.",
  },
  monitoring: {
    whatItMeans:
      "This room is starting to use AI for things that touch existential ground. Some practical, some personal. The boundary is getting thin in places.",
    whatThisRoomIsCarrying:
      "A workforce in transition. AI is becoming a confidant for some of you, a sounding board, a quiet place to ask questions you don't ask anywhere else. Not yet a crisis. Worth attention.",
    whatToDoNext:
      "Notice your own use first. When you turn to AI for something personal, ask: am I avoiding a human conversation that would actually help? Bring AI use into your supervision, your peer groups, your own therapy if you have one. Talk about it the way you talk about any other coping mechanism.",
  },
  human_review: {
    whatItMeans:
      "This room is processing significant existential material through AI. Identity questions. Purpose questions. Mortality. The kinds of conversations that benefit from being held with another human.",
    whatThisRoomIsCarrying:
      "A workforce under load. The economic pressure, the burnout, the caseload impossibility, the grief and the personal questions your job does not give you space to process. AI is filling a gap that human infrastructure was supposed to fill. That gap is on the system, not on you.",
    whatToDoNext:
      "This score is not a verdict on you. It is information about a room.\n\nIf the description fits your own experience, the invitation is simple: bring one of these conversations back into human contact. That can look like a coffee with a colleague who gets it. A check-in with your supervisor. A session with your own therapist if you have one. A call to a friend you trust.\n\nYou do not need to wait for a crisis to do this. Most of the most useful human conversations happen long before anything reaches that point.",
  },
  engagement_gap: {
    whatItMeans:
      "Not enough voices have been recorded yet to score this room. Either voting is still in progress, or participation was lower than the threshold for meaningful interpretation.",
    whatToDoNext:
      "Increase participation. The minimum for clinical interpretation is 10 voices.",
  },
};

/**
 * Personal-voice variants of TIER_EXPLANATIONS for use in the
 * /api/dss-poll/send-results email. The dashboard copy speaks to the
 * room as a collective ("This room is..." / "A workforce..."); the
 * email speaks to the recipient as an individual ("You are..."). The
 * recommendation copy is largely unchanged because it already speaks
 * directly to the reader.
 *
 * scoreSingleResponse never returns engagement_gap, so the
 * engagement_gap entry below is a defensive fallback only and would
 * not normally render in any email.
 */
export const TIER_EXPLANATIONS_PERSONAL: Record<Tier, TierExplanation> = {
  stable: {
    whatItMeans:
      "You are using AI as a tool. Resumes, emails, problem solving at the practical level. The relationship is functional. Existential domains are not significantly engaged.",
    whatThisRoomIsCarrying:
      "You have kept the boundary between productivity tools and personal processing intact. AI is in the toolbox, not in the chest cavity.",
    whatToDoNext:
      "Maintain clinical literacy on AI use among your colleagues and clients. The boundary you're holding is not the cultural default. Keep teaching it.",
  },
  monitoring: {
    whatItMeans:
      "You are starting to use AI for things that touch existential ground. Some practical, some personal. The boundary is getting thin in places.",
    whatThisRoomIsCarrying:
      "You are in transition. AI is becoming a confidant, a sounding board, a quiet place to ask questions you don't ask anywhere else. Not yet a crisis. Worth attention.",
    whatToDoNext:
      "Notice your own use first. When you turn to AI for something personal, ask: am I avoiding a human conversation that would actually help? Bring AI use into your supervision, your peer groups, your own therapy if you have one. Talk about it the way you talk about any other coping mechanism.",
  },
  human_review: {
    whatItMeans:
      "You are processing significant existential material through AI. Identity questions. Purpose questions. Mortality. The kinds of conversations that benefit from being held with another human.",
    whatThisRoomIsCarrying:
      "You are under load. The economic pressure, the burnout, the caseload impossibility, the grief and the personal questions your job does not give you space to process. AI is filling a gap that human infrastructure was supposed to fill. That gap is on the system, not on you.",
    whatToDoNext:
      "This score is not a verdict on you. It is information about your individual response.\n\nIf the description fits your experience, the invitation is simple: bring one of these conversations back into human contact. That can look like a coffee with a colleague who gets it. A check-in with your supervisor. A session with your own therapist if you have one. A call to a friend you trust.\n\nYou do not need to wait for a crisis to do this. Most of the most useful human conversations happen long before anything reaches that point.",
  },
  engagement_gap: {
    whatItMeans:
      "Your response did not register fully. If you received this email, please reply and we will look into it.",
    whatToDoNext:
      "Email hello@h3rr.com if you'd like us to investigate.",
  },
};
