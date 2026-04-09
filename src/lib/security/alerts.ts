/**
 * ECQO Security Layer — Monitoring & Alerting (PART 7)
 *
 * Sends security alerts to ECQO_MODERATOR_EMAIL via Resend.
 * Alert types: failed logins, admin role changes, NLP crisis flags,
 * elevated disruption content, API errors, cron failures.
 */

import { sendEmail } from '@/lib/email/resend';

const MODERATOR_EMAIL = process.env.ECQO_MODERATOR_EMAIL || 'moderator@h3rr.com';

export type AlertType =
  | 'failed_logins'
  | 'admin_role_change'
  | 'service_role_usage'
  | 'nlp_crisis_flag'
  | 'elevated_disruption'
  | 'api_errors'
  | 'cron_failure'
  | 'lockout';

interface AlertPayload {
  type: AlertType;
  subject: string;
  detail: string;
  memberId?: string;
  memberEmail?: string;
  metadata?: Record<string, string>;
}

/**
 * Send a security alert email to the moderator.
 */
export async function sendSecurityAlert(payload: AlertPayload): Promise<void> {
  const tierLabel = ['nlp_crisis_flag', 'elevated_disruption'].includes(payload.type)
    ? '<span style="color:#E8388A;font-weight:bold;">TIER 1 — IMMEDIATE</span>'
    : '<span style="color:#1A3A8F;font-weight:bold;">TIER 2 — REVIEW</span>';

  const metaRows = payload.metadata
    ? Object.entries(payload.metadata)
        .map(([k, v]) => `<tr><td style="color:#6b6b8a;padding:4px 12px 4px 0;">${k}</td><td style="color:#ffffff;">${v}</td></tr>`)
        .join('')
    : '';

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="background:#0a0a0f;margin:0;padding:0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0a0a0f;border:1px solid #1e1e2e;">
        <tr><td style="padding:32px 40px 0;">
          <p style="font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#E8388A;margin:0;">ECQO SECURITY ALERT</p>
        </td></tr>
        <tr><td style="padding:16px 40px 0;"><div style="height:1px;background:#1e1e2e;"></div></td></tr>
        <tr><td style="padding:24px 40px;">
          <p style="margin:0 0 8px;">${tierLabel}</p>
          <h2 style="font-family:Georgia,serif;font-size:24px;font-weight:300;color:#ffffff;margin:0 0 16px;">${payload.subject}</h2>
          <p style="font-size:14px;line-height:1.7;color:#8888aa;margin:0 0 20px;">${payload.detail}</p>
          ${payload.memberId ? `<p style="font-size:13px;color:#6b6b8a;">Member ID: ${payload.memberId}</p>` : ''}
          ${payload.memberEmail ? `<p style="font-size:13px;color:#6b6b8a;">Member Email: ${payload.memberEmail}</p>` : ''}
          ${metaRows ? `<table style="margin-top:16px;font-size:13px;">${metaRows}</table>` : ''}
          <p style="font-size:12px;color:#4a4a6a;margin:24px 0 0;">Timestamp: ${new Date().toISOString()}</p>
        </td></tr>
        <tr><td style="padding:0 40px 32px;border-top:1px solid #1e1e2e;">
          <p style="font-size:11px;color:#4a4a6a;margin:16px 0 0;">ECQO Security Layer — HERR by ECQO Holdings™</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  try {
    await sendEmail({
      to: MODERATOR_EMAIL,
      subject: `[ECQO Security] ${payload.subject}`,
      html,
      text: `${payload.subject}\n\n${payload.detail}\n\nTimestamp: ${new Date().toISOString()}`,
    });
  } catch (err) {
    console.error('[security-alert] Failed to send alert:', err);
  }
}
