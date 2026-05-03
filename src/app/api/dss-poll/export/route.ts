/**
 * GET /api/dss-poll/export
 *
 * Admin-only CSV download of every response for the active session.
 *
 * Auth model: same as /api/dss-poll/admin. Caller must have a Supabase
 * Auth session whose email is in DSS_POLL_ADMIN_EMAILS.
 *
 * Output: text/csv with attachment Content-Disposition. Columns:
 *   id, session_id, q1_value, q2_value, q3_value, q4_value, q5_value, created_at
 *
 * Per-row PII surface area is zero. The export is a faithful dump of
 * what the poll stored, which is by design only Likert values, an
 * anonymous row id, the session id, and the server-generated timestamp.
 */

import { NextResponse } from "next/server";
import { getDssPollAdmin, getDssPollSsr } from "@/lib/dss-poll-db";
import { isDssPollAdmin } from "@/lib/dss-poll-admin";
import {
  SESSION_ID,
  type LikertValue,
} from "@/lib/dss-poll-shared";

export const dynamic = "force-dynamic";

interface CsvRow {
  id: string;
  session_id: string;
  q1_value: LikertValue;
  q2_value: LikertValue;
  q3_value: LikertValue;
  q4_value: LikertValue;
  q5_value: LikertValue;
  created_at: string;
}

function csvEscape(v: string | number): string {
  const s = String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  try {
    // Auth
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

    // Read responses (service_role bypasses RLS)
    const admin = getDssPollAdmin();
    const { data: rows, error } = await admin
      .from("dss_poll_responses")
      .select(
        "id, session_id, q1_value, q2_value, q3_value, q4_value, q5_value, created_at"
      )
      .eq("session_id", SESSION_ID)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[dss-poll/export] read error:", error);
      return NextResponse.json(
        { error: "Failed to read responses." },
        { status: 500 }
      );
    }

    const records = (rows ?? []) as CsvRow[];
    const header = [
      "id",
      "session_id",
      "q1_value",
      "q2_value",
      "q3_value",
      "q4_value",
      "q5_value",
      "created_at",
    ].join(",");

    const lines = records.map((r) =>
      [
        csvEscape(r.id),
        csvEscape(r.session_id),
        csvEscape(r.q1_value),
        csvEscape(r.q2_value),
        csvEscape(r.q3_value),
        csvEscape(r.q4_value),
        csvEscape(r.q5_value),
        csvEscape(r.created_at),
      ].join(",")
    );

    const csv = [header, ...lines].join("\r\n") + "\r\n";

    const stamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const filename = `${SESSION_ID}_responses_${stamp}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("[dss-poll/export] unexpected:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
