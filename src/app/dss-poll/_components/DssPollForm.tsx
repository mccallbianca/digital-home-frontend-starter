"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DSS_THEME,
  FONT_STACK,
  LIKERT_LABELS,
  POLL_QUESTIONS,
  type LikertValue,
} from "@/lib/dss-poll-shared";
import EmailOptInCard from "./EmailOptInCard";

type Answers = Record<1 | 2 | 3 | 4 | 5, LikertValue | null>;

const INITIAL: Answers = { 1: null, 2: null, 3: null, 4: null, 5: null };

export default function DssPollForm() {
  const [answers, setAnswers] = useState<Answers>(INITIAL);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "already" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);

  const allAnswered = useMemo(
    () => POLL_QUESTIONS.every((q) => answers[q.id] !== null),
    [answers]
  );

  function setAnswer(qid: 1 | 2 | 3 | 4 | 5, v: LikertValue) {
    setAnswers((prev) => ({ ...prev, [qid]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAnswered || status === "submitting") return;
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/dss-poll/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q1_value: answers[1],
          q2_value: answers[2],
          q3_value: answers[3],
          q4_value: answers[4],
          q5_value: answers[5],
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        already_voted?: boolean;
        response_id?: string;
        error?: string;
      };
      if (!res.ok || !json.success) {
        setStatus("error");
        setErrorMessage(
          json.error ??
            "Submission failed. Please try again or check your connection."
        );
        return;
      }
      if (json.response_id) setResponseId(json.response_id);
      setStatus(json.already_voted ? "already" : "success");
    } catch (err) {
      console.error("[DssPollForm] submit error:", err);
      setStatus("error");
      setErrorMessage(
        "We could not reach the server. Please check your connection and try again."
      );
    }
  }

  if (status === "success" || status === "already") {
    return (
      <div>
        <section
          aria-live="polite"
          style={{
            background: DSS_THEME.cardBg,
            border: `1px solid ${DSS_THEME.cardBorder}`,
            borderRadius: 12,
            padding: 28,
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
              marginBottom: 8,
            }}
          >
            Thank you
          </p>
          <h2
            style={{
              fontSize: "clamp(22px, 4vw, 28px)",
              fontWeight: 800,
              lineHeight: 1.2,
              color: DSS_THEME.bodyText,
              marginBottom: 12,
              margin: 0,
            }}
          >
            Your response is in.
          </h2>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.55,
              color: DSS_THEME.bodyText,
              marginTop: 12,
              marginBottom: 24,
            }}
          >
            {status === "already"
              ? "It looks like you already voted from this device. Your earlier response is counted."
              : "Your anonymous response is in. The room is being scored in real time."}
          </p>
          <Link
            href="/dss-poll/results"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: DSS_THEME.ctaPrimaryBg,
              color: DSS_THEME.ctaPrimaryText,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              padding: "14px 24px",
              borderRadius: 999,
              textDecoration: "none",
            }}
          >
            See the live dashboard
            <span aria-hidden>→</span>
          </Link>
        </section>

        {/* Email opt-in card. Shown only on the fresh-success path */}
        {/* (we have a response_id). Already-voted users do not see   */}
        {/* this since the email feature is for first-time submitters.*/}
        {status === "success" && responseId && (
          <EmailOptInCard responseId={responseId} />
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ fontFamily: FONT_STACK, display: "grid", gap: 24 }}
    >
      {POLL_QUESTIONS.map((q) => {
        const groupId = `dss-q-${q.id}`;
        return (
          <fieldset
            key={q.id}
            style={{
              background: DSS_THEME.cardBg,
              border: `1px solid ${DSS_THEME.cardBorder}`,
              borderRadius: 12,
              padding: 22,
              margin: 0,
            }}
          >
            <legend
              style={{
                padding: 0,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  color: DSS_THEME.ctaPrimaryBg,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginRight: 10,
                }}
              >
                Q{q.id}
              </span>
            </legend>
            <h3
              style={{
                fontSize: "clamp(18px, 3.5vw, 22px)",
                fontWeight: 700,
                lineHeight: 1.3,
                color: DSS_THEME.cardBodyText,
                margin: 0,
                marginBottom: 8,
              }}
            >
              {q.title}
            </h3>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.5,
                color: DSS_THEME.cardMuted,
                fontStyle: "italic",
                margin: 0,
                marginBottom: 16,
              }}
            >
              {q.examples}
            </p>
            <div
              role="radiogroup"
              aria-labelledby={groupId}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                gap: 8,
              }}
            >
              {LIKERT_LABELS.map((label, idx) => {
                const value = idx as LikertValue;
                const selected = answers[q.id] === value;
                return (
                  <button
                    key={label}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setAnswer(q.id, value)}
                    style={{
                      minHeight: 52,
                      padding: "10px 6px",
                      borderRadius: 10,
                      background: selected
                        ? DSS_THEME.chipBgSelected
                        : DSS_THEME.chipBgUnselected,
                      color: selected
                        ? DSS_THEME.chipTextSelected
                        : DSS_THEME.chipTextUnselected,
                      border: `1px solid ${
                        selected
                          ? DSS_THEME.chipBgSelected
                          : DSS_THEME.chipBorderUnselected
                      }`,
                      fontFamily: FONT_STACK,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {status === "error" && errorMessage && (
        <div
          role="alert"
          style={{
            background: DSS_THEME.errorBg,
            border: `1px solid ${DSS_THEME.errorBorder}`,
            borderRadius: 10,
            padding: 14,
            fontSize: 16,
            color: DSS_THEME.errorText,
          }}
        >
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!allAnswered || status === "submitting"}
        style={{
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
          opacity: !allAnswered || status === "submitting" ? 0.45 : 1,
          cursor:
            !allAnswered || status === "submitting" ? "not-allowed" : "pointer",
        }}
      >
        {status === "submitting" ? "Submitting..." : "Submit"}
      </button>
      {!allAnswered && (
        <p
          style={{
            textAlign: "center",
            fontSize: 14,
            color: DSS_THEME.textMuted,
            margin: 0,
          }}
        >
          Answer all five questions to submit.
        </p>
      )}
    </form>
  );
}
