/**
 * POST /api/dss-poll/admin
 *
 * Admin actions on the active session.
 *
 * Auth model:
 *   Caller must have a Supabase Auth session whose email is in
 *   DSS_POLL_ADMIN_EMAILS (see src/lib/dss-poll-admin.ts). The
 *   session is read from cookies via the SSR client; the admin
 *   email check is the actual policy enforcement. The mutation
 *   itself uses the service_role client to bypass RLS.
 *
 * Body:
 *   { action: "reveal" | "close" | "open" | "reset", confirm?: boolean }
 *
 * Actions:
 *   reveal : set reveal_triggered = true
 *   close  : set voting_open = false
 *   open   : set voting_open = true
 *   reset  : DESTRUCTIVE. Requires { confirm: true }. Deletes every
 *            response for the active session and resets the session
 *            flags to the open, not-revealed defaults.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDssPollAdmin, getDssPollSsr } from "@/lib/dss-poll-db";
import { isDssPollAdmin } from "@/lib/dss-poll-admin";
import { SESSION_ID } from "@/lib/dss-poll-shared";

type AdminAction = "reveal" | "close" | "open" | "reset";

function isAdminAction(s: unknown): s is AdminAction {
  return s === "reveal" || s === "close" || s === "open" || s === "reset";
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth.
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

    // 2. Body.
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
        { error: "Body required." },
        { status: 400 }
      );
    }
    const b = body as Record<string, unknown>;
    if (!isAdminAction(b.action)) {
      return NextResponse.json(
        {
          error:
            'action must be one of "reveal", "close", "open", or "reset".',
        },
        { status: 400 }
      );
    }

    const admin = getDssPollAdmin();
    const action = b.action;

    // 3. Reset is destructive; require explicit confirm flag.
    if (action === "reset") {
      if (b.confirm !== true) {
        return NextResponse.json(
          {
            error:
              'Reset is destructive. Resend with { action: "reset", confirm: true } to proceed.',
          },
          { status: 400 }
        );
      }

      const { error: delErr } = await admin
        .from("dss_poll_responses")
        .delete()
        .eq("session_id", SESSION_ID);
      if (delErr) {
        console.error("[dss-poll/admin] reset delete error:", delErr);
        return NextResponse.json(
          { error: "Failed to reset responses." },
          { status: 500 }
        );
      }
      const { error: stateErr } = await admin
        .from("dss_poll_session_state")
        .update({ voting_open: true, reveal_triggered: false })
        .eq("session_id", SESSION_ID);
      if (stateErr) {
        console.error("[dss-poll/admin] reset state error:", stateErr);
        return NextResponse.json(
          { error: "Failed to reset session state." },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        action,
        voting_open: true,
        reveal_triggered: false,
        responses_deleted: true,
      });
    }

    // 4. Non-destructive flag flips.
    const update: Record<string, boolean> = {};
    if (action === "reveal") update.reveal_triggered = true;
    if (action === "close") update.voting_open = false;
    if (action === "open") update.voting_open = true;

    const { data: updated, error: upErr } = await admin
      .from("dss_poll_session_state")
      .update(update)
      .eq("session_id", SESSION_ID)
      .select("voting_open, reveal_triggered")
      .single();
    if (upErr || !updated) {
      console.error("[dss-poll/admin] update error:", upErr);
      return NextResponse.json(
        { error: "Failed to update session state." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      action,
      voting_open: updated.voting_open,
      reveal_triggered: updated.reveal_triggered,
    });
  } catch (err) {
    console.error("[dss-poll/admin] unexpected:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
