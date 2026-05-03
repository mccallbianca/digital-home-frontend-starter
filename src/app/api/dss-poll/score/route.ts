/**
 * GET /api/dss-poll/score
 *
 * Aggregate the rubric over every response for the active session and
 * return the seven domain scores plus the severity tier metadata.
 *
 * Reveal control:
 *   The tier and its label and interpretation are returned only when
 *   the effective_reveal flag is true. effective_reveal is the union
 *   of the admin-controlled reveal_triggered flag in the session state
 *   table AND the auto-reveal threshold of AUTO_REVEAL_THRESHOLD
 *   responses. Until either condition fires, the tier metadata is
 *   omitted from the response so the client cannot leak it early.
 *
 * Caching:
 *   force-dynamic. The route is hit on every dashboard tick and on
 *   every Realtime change event. Cloudflare and OpenNext should not
 *   cache this output.
 */

import { NextResponse } from "next/server";
import { getDssPollAdmin } from "@/lib/dss-poll-db";
import {
  scoreResponses,
  type DssPollResponseRow,
  type ScoreResult,
} from "@/lib/dss-poll-rubric";
import {
  AUTO_REVEAL_THRESHOLD,
  SESSION_ID,
  type Tier,
} from "@/lib/dss-poll-shared";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ScoreApiResponse {
  responseCount: number;
  voting_open: boolean;
  reveal_triggered: boolean;
  effective_reveal: boolean;
  domainScores: ScoreResult["domainScores"];
  tier?: Tier;
  tierLabel?: string;
  tierInterpretation?: string;
}

export async function GET() {
  try {
    const supabase = getDssPollAdmin();

    // Session state
    const { data: state, error: stateErr } = await supabase
      .from("dss_poll_session_state")
      .select("voting_open, reveal_triggered")
      .eq("session_id", SESSION_ID)
      .single();
    if (stateErr || !state) {
      console.error("[dss-poll/score] state read error:", stateErr);
      return NextResponse.json(
        {
          error: "Session state unavailable.",
          // TEMP DIAGNOSTIC: surface the underlying error + env presence
          // so we can distinguish missing-secret from RLS from network.
          // Remove in the next commit once root cause is identified.
          debug: {
            stateErr_message: stateErr?.message ?? null,
            stateErr_code: stateErr?.code ?? null,
            stateErr_hint: stateErr?.hint ?? null,
            stateErr_details: stateErr?.details ?? null,
            env_has_SUPABASE_URL: !!process.env.SUPABASE_URL,
            env_has_NEXT_PUBLIC_SUPABASE_URL:
              !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            env_has_SERVICE_ROLE_KEY:
              !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            env_SERVICE_ROLE_KEY_len:
              process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
          },
        },
        { status: 500 }
      );
    }

    // Responses (service_role bypasses RLS)
    const { data: rows, error: rowsErr } = await supabase
      .from("dss_poll_responses")
      .select(
        "id, session_id, q1_value, q2_value, q3_value, q4_value, q5_value, created_at"
      )
      .eq("session_id", SESSION_ID);
    if (rowsErr) {
      console.error("[dss-poll/score] rows read error:", rowsErr);
      return NextResponse.json(
        { error: "Failed to read responses." },
        { status: 500 }
      );
    }

    const responses = (rows ?? []) as DssPollResponseRow[];
    const result = scoreResponses(responses);

    const effectiveReveal =
      state.reveal_triggered === true ||
      result.responseCount >= AUTO_REVEAL_THRESHOLD;

    const payload: ScoreApiResponse = {
      responseCount: result.responseCount,
      voting_open: state.voting_open === true,
      reveal_triggered: state.reveal_triggered === true,
      effective_reveal: effectiveReveal,
      domainScores: result.domainScores,
    };

    if (effectiveReveal) {
      payload.tier = result.tier;
      payload.tierLabel = result.tierLabel;
      payload.tierInterpretation = result.tierInterpretation;
    }

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("[dss-poll/score] unexpected:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
