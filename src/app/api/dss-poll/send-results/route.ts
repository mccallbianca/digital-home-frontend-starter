/**
 * POST /api/dss-poll/send-results
 *
 * Receives a voter's email opt-in from the /dss-poll Thank You screen,
 * computes their personal seven-domain breakdown using the same ECQO
 * rubric as the live dashboard, writes the opt-in row, and sends the
 * results email via Resend.
 *
 * Request body:
 *   {
 *     response_id:    string  (UUID of the voter's row in dss_poll_responses)
 *     email:          string  (the voter's email address)
 *     engaged_list:   boolean (true if they checked the ongoing-updates box)
 *   }
 *
 * Privacy:
 *   The route writes ONLY: response_id, email, the two consent flags,
 *   and a server-generated consent_timestamp. ip_country is left null
 *   in this build (no IP geolocation wired). The opt-in row's UUID is
 *   the unsubscribe token; not cryptographically signed but unguessable
 *   (122 bits of entropy from gen_random_uuid).
 */

import { NextRequest, NextResponse } from "next/server";
import { getDssPollAdmin } from "@/lib/dss-poll-db";
import {
  scoreSingleResponse,
  type DssPollResponseRow,
} from "@/lib/dss-poll-rubric";
import {
  DOMAINS,
  DOMAIN_COLORS,
  TIER_COLORS,
  TIER_EXPLANATIONS_PERSONAL,
  type Domain,
  type Tier,
} from "@/lib/dss-poll-shared";
import { sendEmail } from "@/lib/email/resend";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.h3rr.com";
// 3ME logo URL: production absolute path (email clients fetch from
// the open internet, not from the dev server).
const LOGO_URL = "https://h3rr.com/logo.png";

const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS ||
  "Bianca D. McCall <noreply@h3rr.com>";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface OptInBody {
  response_id: string;
  email: string;
  engaged_list: boolean;
}

function validateBody(b: unknown): OptInBody | null {
  if (typeof b !== "object" || b === null) return null;
  const r = b as Record<string, unknown>;
  if (typeof r.response_id !== "string" || !UUID_REGEX.test(r.response_id))
    return null;
  if (typeof r.email !== "string" || !EMAIL_REGEX.test(r.email.trim()))
    return null;
  return {
    response_id: r.response_id,
    email: r.email.trim(),
    engaged_list: r.engaged_list === true,
  };
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }
    const input = validateBody(body);
    if (!input) {
      return NextResponse.json(
        {
          error:
            "Body must include response_id (UUID), email, and engaged_list (boolean).",
        },
        { status: 400 }
      );
    }

    const supabase = getDssPollAdmin();

    // 1. Fetch the voter's response row.
    const { data: row, error: fetchErr } = await supabase
      .from("dss_poll_responses")
      .select(
        "id, session_id, q1_value, q2_value, q3_value, q4_value, q5_value, created_at"
      )
      .eq("id", input.response_id)
      .single();
    if (fetchErr || !row) {
      console.error("[dss-poll/send-results] response lookup failed:", fetchErr);
      return NextResponse.json(
        { error: "We could not find your response. Please vote again." },
        { status: 404 }
      );
    }
    const response = row as DssPollResponseRow;

    // 2. Score the single response using the rubric.
    const personal = scoreSingleResponse(response);

    // 3. Insert the opt-in row.
    const { data: optInRow, error: insertErr } = await supabase
      .from("dss_poll_email_opt_ins")
      .insert({
        response_id: input.response_id,
        email: input.email,
        segment_results_only: true,
        segment_engaged_list: input.engaged_list,
      })
      .select("id")
      .single();
    if (insertErr || !optInRow) {
      console.error("[dss-poll/send-results] opt-in insert failed:", insertErr);
      return NextResponse.json(
        {
          error:
            "We could not record your email. Please try again, or email hello@h3rr.com.",
        },
        { status: 500 }
      );
    }

    // 4. Build email content.
    const unsubscribeUrl = `${SITE_URL}/api/dss-poll/unsubscribe?token=${optInRow.id}`;
    const html = renderEmailHtml({
      domainScores: personal.domainScores,
      tier: personal.tier,
      tierLabel: personal.tierLabel,
      tierInterpretation: personal.tierInterpretation,
      unsubscribeUrl,
    });
    const text = renderEmailText({
      domainScores: personal.domainScores,
      tier: personal.tier,
      tierLabel: personal.tierLabel,
      tierInterpretation: personal.tierInterpretation,
      unsubscribeUrl,
    });

    // 5. Send.
    const sendResult = await sendEmail({
      to: input.email,
      from: FROM_ADDRESS,
      subject: "Your DSS 2026 personal results",
      html,
      text,
      tags: [
        { name: "campaign", value: "dss_2026_results" },
        {
          name: "engaged_list",
          value: input.engaged_list ? "true" : "false",
        },
      ],
    });
    if ("error" in sendResult) {
      console.error("[dss-poll/send-results] resend error:", sendResult.error);
      return NextResponse.json(
        {
          error:
            "Your email was recorded, but the send failed. We will retry. If you do not receive your results, email hello@h3rr.com.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[dss-poll/send-results] unexpected:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------
// Email renderers
// ---------------------------------------------------------------------

interface EmailContext {
  domainScores: { domain: Domain; score: number }[];
  tier: Tier;
  tierLabel: string;
  tierInterpretation: string;
  unsubscribeUrl: string;
}

function renderDomainBarsHtml(
  domainScores: { domain: Domain; score: number }[]
): string {
  return domainScores
    .map((d) => {
      const color = DOMAIN_COLORS[d.domain];
      const width = Math.max(0, Math.min(100, d.score)).toFixed(1);
      return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:8px;">
  <tr>
    <td style="width:120px;font-size:16px;font-weight:700;color:#0A0A0F;padding:6px 8px 6px 0;">${escapeHtml(d.domain)}</td>
    <td style="padding:6px 8px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#F8F8FA;border:1px solid #E5E5EA;border-radius:8px;">
        <tr>
          <td style="height:14px;background:#F8F8FA;border-radius:8px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:${width}%;">
              <tr>
                <td style="height:14px;background:${color};border-radius:8px;line-height:14px;font-size:0;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
    <td style="width:50px;font-size:16px;font-weight:700;color:#0A0A0F;text-align:right;padding:6px 0 6px 8px;font-variant-numeric:tabular-nums;">${width}</td>
  </tr>
</table>`;
    })
    .join("");
}

function renderTierCardHtml(
  tier: Tier,
  label: string,
  interpretation: string
): string {
  const accent = TIER_COLORS[tier];
  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#F8F8FA;border:1px solid #E5E5EA;border-left:8px solid ${accent};border-radius:12px;margin-top:24px;">
  <tr>
    <td style="padding:24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${accent};">Severity tier</p>
      <h2 style="margin:0 0 10px;font-size:24px;font-weight:800;color:#0A0A0F;line-height:1.2;">${escapeHtml(label)}</h2>
      <p style="margin:0;font-size:16px;line-height:1.55;color:#0A0A0F;">${escapeHtml(interpretation)}</p>
    </td>
  </tr>
</table>`;
}

function renderExplanationHtml(tier: Tier): string {
  const exp = TIER_EXPLANATIONS_PERSONAL[tier];
  const sections: { label: string; body: string }[] = [
    { label: "What it means", body: exp.whatItMeans },
  ];
  if (exp.whatThisRoomIsCarrying) {
    sections.push({
      label: "What you are carrying",
      body: exp.whatThisRoomIsCarrying,
    });
  }
  sections.push({
    label: "What to do next",
    body: exp.whatToDoNext,
  });

  const inner = sections
    .map(
      (s) => `
<tr>
  <td style="padding-bottom:18px;">
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#5C3478;">${escapeHtml(s.label)}</p>
    ${s.body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map(
        (p, i) =>
          `<p style="margin:${i === 0 ? 0 : "12px"} 0 0;font-size:16px;line-height:1.6;color:#0A0A0F;">${escapeHtml(p)}</p>`
      )
      .join("")}
  </td>
</tr>`
    )
    .join("");

  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:24px;background:#FFFFFF;border:1px solid #E5E5EA;border-radius:10px;">
  <tr><td style="padding:24px 24px 6px 24px;">${inner}</td></tr>
</table>`;
}

function renderSafetyFooterHtml(): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:18px;border-top:1px solid #E5E5EA;">
  <tr>
    <td style="padding-top:18px;font-size:14px;line-height:1.5;color:#4A4A55;">
      If something in this email is bringing up something urgent, the
      <a href="tel:988" style="color:#2B4FA0;font-weight:700;">988 Suicide &amp; Crisis Lifeline</a>
      is available 24 hours. Call or text 988. Free and confidential.
    </td>
  </tr>
</table>`;
}

function renderEmailHtml(ctx: EmailContext): string {
  const { tier, tierLabel, tierInterpretation, domainScores, unsubscribeUrl } =
    ctx;
  const safety =
    tier === "human_review" ? renderSafetyFooterHtml() : "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your DSS 2026 personal results</title>
</head>
<body style="margin:0;padding:0;background:#F4F1EB;font-family:'Helvetica Neue',Arial,Helvetica,sans-serif;color:#0A0A0F;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#F4F1EB;">
  <tr>
    <td align="center" style="padding:24px 12px 8px 12px;">
      <img src="${LOGO_URL}" alt="3ME" height="40" style="display:block;border:0;outline:none;text-decoration:none;height:40px;">
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:0 12px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:32px 32px 8px 32px;">
            <h1 style="margin:0 0 14px;font-size:28px;font-weight:800;color:#0A0A0F;line-height:1.2;letter-spacing:-0.01em;">Thanks for being part of the room today.</h1>
            <p style="margin:0 0 20px;font-size:16px;line-height:1.55;color:#0A0A0F;">You voted in the live audience poll during Bianca D. McCall&rsquo;s keynote at the 2026 DSS Annual Conference. Below is your personal seven-domain breakdown from the ECQO existential rubric.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 8px 32px;">
            <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#4A4A55;">Your seven domain scores</p>
            ${renderDomainBarsHtml(domainScores)}
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px;">
            ${renderTierCardHtml(tier, tierLabel, tierInterpretation)}
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 24px 32px;">
            ${renderExplanationHtml(tier)}
            ${safety}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;border-top:1px solid #E5E5EA;">
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0A0A0F;line-height:1.25;">Experience HERR.</h2>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#4A4A55;">The platform Bianca built. Hear your own voice come back to you as the conductor of your own performance.</p>
            <a href="https://h3rr.com" style="display:inline-block;background:#C42D8E;color:#FFFFFF;padding:14px 24px;border-radius:999px;font-size:16px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;">Visit h3rr.com</a>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 8px 32px;font-size:13px;color:#4A4A55;line-height:1.6;">
            Bianca D. McCall, M.A., LMFT<br>
            Three M&rsquo;s Enterprises (3ME) | ECQO Holdings<br>
            <a href="mailto:hello@go3me.com" style="color:#5C3478;">hello@go3me.com</a> &middot;
            <a href="https://biancadmccall.com" style="color:#5C3478;">biancadmccall.com</a>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 32px 32px 32px;font-size:12px;color:#4A4A55;line-height:1.5;border-top:1px solid #E5E5EA;">
            You&rsquo;re receiving this because you requested your DSS 2026 personal results.
            <a href="${escapeHtml(unsubscribeUrl)}" style="color:#5C3478;">Unsubscribe</a>.
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr><td style="padding:24px;">&nbsp;</td></tr>
</table>
</body>
</html>`;
}

function renderEmailText(ctx: EmailContext): string {
  const { tier, tierLabel, tierInterpretation, domainScores, unsubscribeUrl } =
    ctx;
  const exp = TIER_EXPLANATIONS_PERSONAL[tier];

  const bars = domainScores
    .map((d) => `${d.domain.padEnd(12, " ")}${d.score.toFixed(1)}`)
    .join("\n");

  const sections: string[] = [
    `WHAT IT MEANS\n${exp.whatItMeans}`,
  ];
  if (exp.whatThisRoomIsCarrying) {
    sections.push(`WHAT YOU ARE CARRYING\n${exp.whatThisRoomIsCarrying}`);
  }
  sections.push(`WHAT TO DO NEXT\n${exp.whatToDoNext}`);

  const safety =
    tier === "human_review"
      ? `\n\nIf something in this email is bringing up something urgent, the 988 Suicide & Crisis Lifeline is available 24 hours. Call or text 988. Free and confidential.`
      : "";

  return `Thanks for being part of the room today.

You voted in the live audience poll during Bianca D. McCall's keynote at the 2026 DSS Annual Conference. Below is your personal seven-domain breakdown from the ECQO existential rubric.

YOUR SEVEN DOMAIN SCORES
${bars}

SEVERITY TIER: ${tierLabel}
${tierInterpretation}

${sections.join("\n\n")}${safety}

EXPERIENCE HERR
The platform Bianca built. Hear your own voice come back to you as the conductor of your own performance.
Visit https://h3rr.com

Bianca D. McCall, M.A., LMFT
Three M's Enterprises (3ME) | ECQO Holdings
hello@go3me.com | biancadmccall.com

You're receiving this because you requested your DSS 2026 personal results.
Unsubscribe: ${unsubscribeUrl}
`;
}
