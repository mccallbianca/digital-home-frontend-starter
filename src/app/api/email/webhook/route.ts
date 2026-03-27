/**
 * POST /api/email/webhook — Resend webhook receiver
 *
 * Handles email events: delivered, opened, clicked, bounced, complained, unsubscribed.
 * Configure in Resend dashboard to point to: https://yourdomain.com/api/email/webhook
 */

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { jsonResponse, errorResponse } from "@/lib/api/response";

// Resend webhook event types we care about
const VALID_EVENTS = ["email.delivered", "email.opened", "email.clicked", "email.bounced", "email.complained"] as const;

// Map Resend event types to our enum
const EVENT_MAP: Record<string, "delivered" | "opened" | "clicked" | "bounced" | "complained" | "unsubscribed"> = {
  "email.delivered": "delivered",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.complained": "complained",
};

export async function POST(request: NextRequest) {
  // Verify webhook signature (Resend uses svix)
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (webhookSecret) {
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return errorResponse("Missing webhook signature headers", 401);
    }

    // TODO: Implement full svix signature verification
    // For now, we accept all webhooks if the secret is configured
    // In production, use the @svix/webhooks package
  }

  const body = await request.json();
  const eventType = body.type;

  if (!eventType || !(eventType in EVENT_MAP)) {
    // Acknowledge but ignore unknown events
    return jsonResponse({ ok: true, ignored: true });
  }

  const resendId = body.data?.email_id;
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
    event_data: body.data || {},
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
