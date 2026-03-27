/**
 * Resend Email Client
 * Handles transactional and sequence emails via Resend API.
 * Direct HTTP calls — no SDK needed, keeps bundle small.
 */

const RESEND_API_URL = "https://api.resend.com";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

interface ResendResponse {
  id: string;
}

interface ResendError {
  statusCode: number;
  message: string;
  name: string;
}

/**
 * Send a single email via Resend.
 */
export async function sendEmail(params: SendEmailParams): Promise<{ id: string } | { error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY not configured");
    return { error: "Email not configured" };
  }

  const fromAddress = params.from || process.env.RESEND_FROM_ADDRESS || "hello@yourdomain.com";

  try {
    const response = await fetch(`${RESEND_API_URL}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
        reply_to: params.replyTo || process.env.RESEND_REPLY_TO || "hello@yourdomain.com",
        tags: params.tags,
      }),
    });

    if (!response.ok) {
      const err = (await response.json()) as ResendError;
      console.error("[email] Send failed:", err.message);
      return { error: err.message };
    }

    const data = (await response.json()) as ResendResponse;
    return { id: data.id };
  } catch (err) {
    console.error("[email] Send error:", err);
    return { error: "Failed to send email" };
  }
}

/**
 * Send a batch of emails via Resend.
 */
export async function sendBatch(
  emails: SendEmailParams[]
): Promise<{ ids: string[]; errors: string[] }> {
  const results = await Promise.allSettled(emails.map(sendEmail));

  const ids: string[] = [];
  const errors: string[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      if ("id" in result.value) ids.push(result.value.id);
      else errors.push(result.value.error);
    } else {
      errors.push(result.reason?.message || "Unknown error");
    }
  }

  return { ids, errors };
}
