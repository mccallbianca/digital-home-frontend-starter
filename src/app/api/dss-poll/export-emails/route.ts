/**
 * GET /api/dss-poll/export-emails
 *
 * Admin-only CSV download of every email opt-in for the active session,
 * joined to the originating response and scored using the rubric.
 *
 * Auth model: Supabase Auth session whose email is in
 * DSS_POLL_ADMIN_EMAILS. Same gate as /api/dss-poll/admin and /export.
 *
 * Output columns:
 *   email
 *   segment_results_only
 *   segment_engaged_list
 *   consent_timestamp
 *   unsubscribed_at
 *   severity_tier
 *   identity_score, purpose_score, connection_score, freedom_score,
 *   isolation_score, meaning_score, mortality_score
 *
 * Scoring is done in-memory after fetching responses and opt-ins
 * separately (one round trip each), so the export is a single pass
 * regardless of opt-in volume.
 */

import { NextResponse } from "next/server";
import { getDssPollAdmin, getDssPollSsr } from "@/lib/dss-poll-db";
import { isDssPollAdmin } from "@/lib/dss-poll-admin";
import {
  scoreSingleResponse,
  type DssPollResponseRow,
} from "@/lib/dss-poll-rubric";
import {
  DOMAINS,
  SESSION_ID,
  type Domain,
} from "@/lib/dss-poll-shared";

export const dynamic = "force-dynamic";

interface OptInRow {
  id: string;
  response_id: string;
  email: string;
  segment_results_only: boolean;
  segment_engaged_list: boolean;
  consent_timestamp: string;
  unsubscribed_at: string | null;
  created_at: string;
}

function csvEscape(v: string | number | boolean | null): string {
  if (v === null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  try {
    const ssr = await getDssPollSsr();
    const {
      data: { user },
      error: authErr,
    } = await ssr.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }
    if (!isDssPollAdmin(user.email)) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 403 }
      );
    }

    const admin = getDssPollAdmin();

    // Fetch all opt-ins.
    const { data: optIns, error: optInsErr } = await admin
      .from("dss_poll_email_opt_ins")
      .select(
        "id, response_id, email, segment_results_only, segment_engaged_list, consent_timestamp, unsubscribed_at, created_at"
      )
      .order("created_at", { ascending: true });
    if (optInsErr) {
      console.error("[dss-poll/export-emails] opt-ins read error:", optInsErr);
      return NextResponse.json(
        { error: "Failed to read opt-ins." },
        { status: 500 }
      );
    }

    // Fetch all responses for this session in one round trip and index
    // them by id so each opt-in row can be scored in O(1) after the
    // initial fetch.
    const { data: rawResponses, error: respsErr } = await admin
      .from("dss_poll_responses")
      .select(
        "id, session_id, q1_value, q2_value, q3_value, q4_value, q5_value, created_at"
      )
      .eq("session_id", SESSION_ID);
    if (respsErr) {
      console.error("[dss-poll/export-emails] responses read error:", respsErr);
      return NextResponse.json(
        { error: "Failed to read responses." },
        { status: 500 }
      );
    }
    const responsesById = new Map<string, DssPollResponseRow>();
    for (const r of (rawResponses ?? []) as DssPollResponseRow[]) {
      responsesById.set(r.id, r);
    }

    // Build CSV.
    const domainColumns: Domain[] = [...DOMAINS];
    const header = [
      "email",
      "segment_results_only",
      "segment_engaged_list",
      "consent_timestamp",
      "unsubscribed_at",
      "severity_tier",
      ...domainColumns.map((d) => `${d.toLowerCase()}_score`),
    ].join(",");

    const lines = ((optIns ?? []) as OptInRow[]).map((o) => {
      const resp = responsesById.get(o.response_id);
      const scored = resp
        ? scoreSingleResponse(resp)
        : null;
      const domainCells = domainColumns.map((d) => {
        if (!scored) return "";
        const ds = scored.domainScores.find((s) => s.domain === d);
        return ds ? ds.score.toFixed(1) : "";
      });
      return [
        csvEscape(o.email),
        csvEscape(o.segment_results_only),
        csvEscape(o.segment_engaged_list),
        csvEscape(o.consent_timestamp),
        csvEscape(o.unsubscribed_at),
        csvEscape(scored ? scored.tier : ""),
        ...domainCells.map((c) => csvEscape(c)),
      ].join(",");
    });

    const csv = [header, ...lines].join("\r\n") + "\r\n";

    const stamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const filename = `${SESSION_ID}_email_opt_ins_${stamp}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("[dss-poll/export-emails] unexpected:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
