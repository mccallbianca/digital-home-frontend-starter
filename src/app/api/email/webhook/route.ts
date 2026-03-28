/**
 * POST /api/email/webhook — Resend webhook receiver
 *
 * Handles email events: delivered, opened, clicked, bounced, complained, unsubscribed.
 * Configure in Resend dashboard to point to: https://yourdomain.com/api/email/webhook
 */

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { jsonResponse, errorResponse } from "@/lib/api/response";
import { verifyResendWebhookSignature } from "@/lib/email/verify-resend-webhook";
import type { Json } from "@/types/database";

// Map Resend event types to our enum
const EVENT_MAP: Record<string, "delivered" | "opened" | "clicked" | "bounced" | "complained" | "unsubscribed"> = {
  "email.delivered": "delivered",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.complained": "complained",
};

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (process.env.NODE_ENV === "production" && !webhookSecret) {
    return errorResponse("Webhook secret not configured", 500);
  }

  const rawBody = await request.text();
  if (webhookSecret) {
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return errorResponse("Missing webhook signature headers", 401);
    }

    const valid = await verifyResendWebhookSignature({
      secret: webhookSecret,
      body: rawBody,
      id: svixId,
      timestamp: svixTimestamp,
      signatureHeader: svixSignature,
    });

    if (!valid) {
      return errorResponse("Invalid webhook signature", 401);
    }
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return errorResponse("Invalid JSON payload", 400);
  }

  const eventType = typeof body.type === "string" ? body.type : null;

  if (!eventType || !(eventType in EVENT_MAP)) {
    // Acknowledge but ignore unknown events
    return jsonResponse({ ok: true, ignored: true });
  }

  const resendId = typeof body.data === "object" && body.data !== null
    ? (body.data as { email_id?: string }).email_id
    : undefined;
  if (!resendId) return errorResponse("Missing email_id in webhook data");

  const supabase = createAdminClient();

  // Find the send record by resend_id
  const { data: send } = await supabase
    .from("email_sends")
    .select("id, lead_id")
    .eq("resend_id", resendId)
    .single();

  if (!send) {
    // Email not in our system — might be from another service
    return jsonResponse({ ok: true, ignored: true });
  }

  // Record the event
  await supabase.from("email_events").insert({
    send_id: send.id,
    lead_id: send.lead_id,
    event_type: EVENT_MAP[eventType],
    event_data:
      (typeof body.data === "object" && body.data !== null ? body.data : {}) as Json,
  });

  // Update send status for bounces
  if (eventType === "email.bounced") {
    await supabase
      .from("email_sends")
      .update({ status: "bounced" })
      .eq("id", send.id);
  }

  return jsonResponse({ ok: true });
}
