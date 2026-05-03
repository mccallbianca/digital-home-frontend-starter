/**
 * POST /api/dss-poll/submit
 *
 * Anonymous vote submission. Writes a single row to dss_poll_responses.
 *
 * Privacy:
 *   No PII, no IP address, and no user agent are persisted. The cookie
 *   set on success is purely a duplicate-detection token; it contains
 *   only an integer (the response count at the moment of submit) and
 *   is scoped to this site.
 *
 * Defenses against abuse:
 *   1. Reset-aware cookie-based duplicate detection. On first
 *      successful submit the cookie value is set to the post-insert
 *      DB row count for the active session. On subsequent submits the
 *      route compares that integer against the current count: if the
 *      current count is GREATER OR EQUAL, the user already voted in
 *      the same session (return idempotent success). If the current
 *      count is LESS, the admin has reset the session since the user
 *      last voted (rows were deleted), so the cookie is treated as
 *      stale and the new submit is allowed. This makes Reset Session
 *      automatically invalidate every cookie issued before the reset
 *      without requiring a schema change or a server-driven cookie
 *      revocation pass.
 *   2. voting_open guard. If the admin has closed voting via /admin,
 *      the route returns 403 and does not insert.
 *   3. Strict body validation. Each q*_value must be an integer in
 *      [0, 4]; anything else is 400.
 *
 * Per-IP rate limiting at the database layer was deliberately
 * deferred. Conference Wi-Fi typically NATs hundreds of attendees
 * behind a single public IP, so a low per-IP threshold would block
 * the legitimate audience. Cloudflare's edge DDoS protection covers
 * volumetric abuse, and the cookie + voting_open + voting window
 * (one event, single afternoon) controls expected misuse.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDssPollAdmin } from "@/lib/dss-poll-db";
import { SESSION_ID, type LikertValue } from "@/lib/dss-poll-shared";

const COOKIE_NAME = `dss_poll_voted_${SESSION_ID}`;
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 10; // 10 hours

function isLikert(n: unknown): n is LikertValue {
  return (
    typeof n === "number" &&
    Number.isInteger(n) &&
    n >= 0 &&
    n <= 4
  );
}

async function readResponseCount(
  supabase: ReturnType<typeof getDssPollAdmin>
): Promise<number> {
  const { count, error } = await supabase
    .from("dss_poll_responses")
    .select("*", { count: "exact", head: true })
    .eq("session_id", SESSION_ID);
  if (error || count === null) {
    // If we cannot get a count, return -1 so the caller can decide
    // whether to fail open or closed.
    return -1;
  }
  return count;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const existing = cookieStore.get(COOKIE_NAME);
    const cookieN = existing?.value
      ? Number.parseInt(existing.value, 10)
      : NaN;
    const haveValidCookie = Number.isFinite(cookieN) && cookieN >= 1;

    // 1. Body parse and validation.
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Body must be an object with q1_value..q5_value." },
        { status: 400 }
      );
    }
    const b = body as Record<string, unknown>;
    if (
      !isLikert(b.q1_value) ||
      !isLikert(b.q2_value) ||
      !isLikert(b.q3_value) ||
      !isLikert(b.q4_value) ||
      !isLikert(b.q5_value)
    ) {
      return NextResponse.json(
        {
          error:
            "Each of q1_value..q5_value must be an integer between 0 and 4.",
        },
        { status: 400 }
      );
    }

    const supabase = getDssPollAdmin();

    // 2. voting_open guard.
    const { data: state, error: stateErr } = await supabase
      .from("dss_poll_session_state")
      .select("voting_open")
      .eq("session_id", SESSION_ID)
      .single();
    if (stateErr || !state) {
      console.error("[dss-poll/submit] session state read error:", stateErr);
      return NextResponse.json(
        { error: "Session state unavailable." },
        { status: 500 }
      );
    }
    if (state.voting_open !== true) {
      return NextResponse.json(
        { error: "Voting is closed for this session." },
        { status: 403 }
      );
    }

    // 3. Reset-aware duplicate detection.
    //    If the cookie's recorded count is still <= current DB count,
    //    the user already voted and their row is still in the table
    //    (no reset). Treat as duplicate. Otherwise (current count is
    //    smaller than what the cookie remembers) a reset has cleared
    //    the prior rows, so the cookie is stale and we let this
    //    submit through.
    if (haveValidCookie) {
      const currentCount = await readResponseCount(supabase);
      if (currentCount >= cookieN) {
        return NextResponse.json({
          success: true,
          already_voted: true,
        });
      }
      // currentCount < cookieN: reset detected, fall through to insert.
    }

    // 4. Insert and capture the new row id so the client can pass it
    //    to /api/dss-poll/send-results for the optional email opt-in.
    const { data: inserted, error: insertErr } = await supabase
      .from("dss_poll_responses")
      .insert({
        session_id: SESSION_ID,
        q1_value: b.q1_value,
        q2_value: b.q2_value,
        q3_value: b.q3_value,
        q4_value: b.q4_value,
        q5_value: b.q5_value,
      })
      .select("id")
      .single();
    if (insertErr || !inserted) {
      console.error("[dss-poll/submit] insert error:", insertErr);
      return NextResponse.json(
        { error: "Failed to record response." },
        { status: 500 }
      );
    }

    // 5. Read post-insert count to set the cookie value.
    const newCount = await readResponseCount(supabase);
    const cookieValue =
      newCount >= 1 ? newCount.toString() : "1";

    cookieStore.set(COOKIE_NAME, cookieValue, {
      maxAge: COOKIE_MAX_AGE_SECONDS,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({
      success: true,
      already_voted: false,
      response_id: inserted.id,
    });
  } catch (err) {
    console.error("[dss-poll/submit] unexpected:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
