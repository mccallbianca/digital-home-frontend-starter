"use client";

import { useState } from "react";
import { DSS_THEME, FONT_STACK } from "@/lib/dss-poll-shared";

/**
 * Optional email opt-in card shown beneath the Thank You message on
 * the /dss-poll page. The voter can:
 *   - Skip silently (the "Skip — I don't want results emailed" link).
 *   - Submit only their email (results-only consent, default).
 *   - Additionally check the engaged-list checkbox to receive ongoing
 *     updates on Bianca's clinical AI work.
 *
 * The form posts to /api/dss-poll/send-results, which writes to the
 * dss_poll_email_opt_ins table and triggers the Resend transactional
 * email with the voter's personal seven-domain breakdown.
 */
export default function EmailOptInCard({
  responseId,
}: {
  responseId: string;
}) {
  const [email, setEmail] = useState("");
  const [engagedList, setEngagedList] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "sent" | "skipped" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail || status === "submitting") return;
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/dss-poll/send-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response_id: responseId,
          email: email.trim(),
          engaged_list: engagedList,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (!res.ok || !json.success) {
        setStatus("error");
        setErrorMessage(
          json.error ??
            "We could not send your results. Please try again, or check your connection."
        );
        return;
      }
      setStatus("sent");
    } catch (err) {
      console.error("[EmailOptInCard] submit error:", err);
      setStatus("error");
      setErrorMessage(
        "We could not reach the server. Please try again."
      );
    }
  }

  function handleSkip() {
    setStatus("skipped");
  }

  if (status === "sent") {
    return (
      <section
        aria-live="polite"
        style={{
          marginTop: 24,
          background: DSS_THEME.cardBg,
          border: `1px solid ${DSS_THEME.cardBorder}`,
          borderRadius: 12,
          padding: 24,
          fontFamily: FONT_STACK,
        }}
      >
        <p
          style={{
            color: DSS_THEME.headerPrimary,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            margin: 0,
            marginBottom: 8,
          }}
        >
          Sent
        </p>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.55,
            color: DSS_THEME.bodyText,
            margin: 0,
          }}
        >
          Your personal results are on the way to {email}. Check your
          inbox in the next minute or two.
        </p>
      </section>
    );
  }

  if (status === "skipped") {
    return null;
  }

  return (
    <section
      style={{
        marginTop: 24,
        background: DSS_THEME.cardBg,
        border: `1px solid ${DSS_THEME.cardBorder}`,
        borderRadius: 12,
        padding: 24,
        fontFamily: FONT_STACK,
      }}
    >
      <h2
        style={{
          fontSize: 22,
          fontWeight: 800,
          lineHeight: 1.2,
          color: DSS_THEME.bodyText,
          margin: 0,
          marginBottom: 8,
          letterSpacing: "-0.01em",
        }}
      >
        Want your personal results?
      </h2>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.55,
          color: DSS_THEME.bodyText,
          margin: 0,
          marginBottom: 18,
        }}
      >
        Drop your email and we&rsquo;ll send you a private breakdown of
        your seven-domain scores and what they mean for you.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <label
          htmlFor="dss-results-email"
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: DSS_THEME.textMuted,
            marginBottom: 6,
          }}
        >
          Email
        </label>
        <input
          id="dss-results-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={{
            width: "100%",
            padding: "12px 14px",
            fontFamily: FONT_STACK,
            fontSize: 18,
            color: DSS_THEME.bodyText,
            background: DSS_THEME.pageBg,
            border: `1px solid ${DSS_THEME.cardBorder}`,
            borderRadius: 10,
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            marginTop: 14,
            fontSize: 16,
            lineHeight: 1.5,
            color: DSS_THEME.bodyText,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={engagedList}
            onChange={(e) => setEngagedList(e.target.checked)}
            style={{
              marginTop: 4,
              width: 18,
              height: 18,
              accentColor: DSS_THEME.ctaPrimaryBg,
              flexShrink: 0,
            }}
          />
          <span>
            Also keep me in the loop on Bianca&rsquo;s work in clinical
            AI and behavioral health (occasional, no spam, unsubscribe
            anytime).
          </span>
        </label>

        {status === "error" && errorMessage && (
          <div
            role="alert"
            style={{
              marginTop: 14,
              background: DSS_THEME.errorBg,
              border: `1px solid ${DSS_THEME.errorBorder}`,
              borderRadius: 10,
              padding: 12,
              fontSize: 14,
              color: DSS_THEME.errorText,
            }}
          >
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!isValidEmail || status === "submitting"}
          style={{
            marginTop: 18,
            width: "100%",
            minHeight: 56,
            background: DSS_THEME.ctaPrimaryBg,
            color: DSS_THEME.ctaPrimaryText,
            border: `1px solid ${DSS_THEME.ctaPrimaryBg}`,
            borderRadius: 999,
            fontFamily: FONT_STACK,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            opacity:
              !isValidEmail || status === "submitting" ? 0.45 : 1,
            cursor:
              !isValidEmail || status === "submitting"
                ? "not-allowed"
                : "pointer",
          }}
        >
          {status === "submitting" ? "Sending..." : "Send my results"}
        </button>

        <div
          style={{
            marginTop: 14,
            textAlign: "center",
          }}
        >
          <button
            type="button"
            onClick={handleSkip}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              color: DSS_THEME.textMuted,
              fontFamily: FONT_STACK,
              fontSize: 14,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Skip &mdash; I don&rsquo;t want results emailed
          </button>
        </div>

        <p
          style={{
            marginTop: 16,
            fontSize: 12,
            lineHeight: 1.5,
            color: DSS_THEME.textMuted,
          }}
        >
          Your email is used only to send you the results above. If
          you opt in to ongoing updates, you can unsubscribe at any
          time. ECQO Holdings privacy policy applies.
        </p>
      </form>
    </section>
  );
}
