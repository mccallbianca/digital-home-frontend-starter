/**
 * POST /api/email/send — Send an email (auth required)
 *
 * Body:
 * {
 *   lead_id: string,
 *   subject: string,
 *   html: string,
 *   text?: string,
 *   sequence_id?: string,
 *   step_number?: number
 * }
 */

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api/auth";
import { jsonResponse, errorResponse } from "@/lib/api/response";
import { sendEmail } from "@/lib/email/resend";

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  const body = await request.json();

  if (!body.lead_id || !body.subject || !body.html) {
    return errorResponse("lead_id, subject, and html are required");
  }

  const supabase = createAdminClient();

  // Get lead email
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("email, first_name")
    .eq("id", body.lead_id)
    .single();

  if (leadError || !lead) return errorResponse("Lead not found", 404);

  // Record the send attempt
  const { data: send, error: sendError } = await supabase
    .from("email_sends")
    .insert({
      lead_id: body.lead_id,
      email_address: lead.email,
      subject: body.subject,
      sequence_id: body.sequence_id || null,
      step_number: body.step_number || null,
      status: "pending",
    })
    .select()
    .single();

  if (sendError) return errorResponse(sendError.message, 500);

  // Send via Resend
  const result = await sendEmail({
    to: lead.email,
    subject: body.subject,
    html: body.html,
    text: body.text,
  });

  if ("error" in result) {
    // Update send record as failed
    await supabase
      .from("email_sends")
      .update({ status: "failed", error_message: result.error })
      .eq("id", send.id);

    return errorResponse(result.error, 500);
  }

  // Update send record as sent
  await supabase
    .from("email_sends")
    .update({
      status: "sent",
      resend_id: result.id,
      sent_at: new Date().toISOString(),
    })
    .eq("id", send.id);

  return jsonResponse({ ok: true, send_id: send.id, resend_id: result.id }, 201);
}
