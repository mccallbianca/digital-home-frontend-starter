/**
 * GET /api/dss-poll/unsubscribe?token=<opt_in_row_id>
 *
 * One-click unsubscribe target linked from the footer of every
 * DSS 2026 results email. Token is the opt-in row's UUID
 * (gen_random_uuid produces 122 bits of entropy, sufficient for
 * unguessable single-event tokens). The route verifies the row
 * exists, sets unsubscribed_at = NOW() via the service_role key,
 * and renders a small HTML confirmation page.
 *
 * If a future build needs cryptographic guarantees (e.g. signed
 * tokens to prevent enumeration through valid UUID brute force), wrap
 * the row id with an HMAC before emailing and verify on receipt.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDssPollAdmin } from "@/lib/dss-poll-db";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";

function htmlPage(title: string, body: string, status: number) {
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
  body { margin:0; padding:0; background:#F4F1EB; color:#0A0A0F; font-family:'Helvetica Neue',Arial,Helvetica,sans-serif; }
  main { max-width:520px; margin:80px auto; background:#FFFFFF; border:1px solid #E5E5EA; border-radius:12px; padding:32px; }
  h1 { font-size:24px; font-weight:800; margin:0 0 12px; line-height:1.2; }
  p { font-size:16px; line-height:1.55; margin:0 0 12px; color:#0A0A0F; }
  a { color:#C42D8E; font-weight:700; text-decoration:none; }
  .eyebrow { font-size:13px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#5C3478; margin:0 0 8px; }
</style>
</head>
<body>
  <main>${body}</main>
</body>
</html>`,
    {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token") ?? "";
    if (!UUID_REGEX.test(token)) {
      return htmlPage(
        "Unsubscribe link invalid",
        `<p class="eyebrow">Unsubscribe</p>
         <h1>This link is not valid.</h1>
         <p>The unsubscribe link in your email may be malformed. If you want to be removed from our list, email <a href="mailto:hello@h3rr.com">hello@h3rr.com</a>.</p>`,
        400
      );
    }

    const supabase = getDssPollAdmin();
    const { data, error } = await supabase
      .from("dss_poll_email_opt_ins")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("id", token)
      .select("id, unsubscribed_at")
      .single();

    if (error || !data) {
      console.error("[dss-poll/unsubscribe] update error:", error);
      return htmlPage(
        "Unsubscribe could not be processed",
        `<p class="eyebrow">Unsubscribe</p>
         <h1>We could not process this unsubscribe.</h1>
         <p>Please email <a href="mailto:hello@h3rr.com">hello@h3rr.com</a> and we will remove you manually.</p>`,
        500
      );
    }

    return htmlPage(
      "Unsubscribed",
      `<p class="eyebrow">Unsubscribed</p>
       <h1>You&rsquo;re unsubscribed.</h1>
       <p>You will not receive further emails from the DSS 2026 results list. The transactional email you already received will not be re-sent.</p>
       <p>If this was a mistake, email <a href="mailto:hello@h3rr.com">hello@h3rr.com</a> and we will reverse it.</p>`,
      200
    );
  } catch (err) {
    console.error("[dss-poll/unsubscribe] unexpected:", err);
    return htmlPage(
      "Unsubscribe error",
      `<p class="eyebrow">Unsubscribe</p>
       <h1>Something went wrong.</h1>
       <p>Please email <a href="mailto:hello@h3rr.com">hello@h3rr.com</a> and we will remove you manually.</p>`,
      500
    );
  }
}
