import type { Metadata } from "next";
import DssPollForm from "./_components/DssPollForm";
import { DSS_THEME, FONT_STACK } from "@/lib/dss-poll-shared";

export const metadata: Metadata = {
  title: "DSS 2026 Live Poll",
  description:
    "Anonymous live audience poll for the DSS Annual Conference 2026 keynote. How are you using AI?",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function DssPollPage() {
  return (
    <div
      style={{
        background: DSS_THEME.pageBg,
        color: DSS_THEME.bodyText,
        fontFamily: FONT_STACK,
        minHeight: "100vh",
      }}
    >
      {/* Top header band (the only dark surface on this page) */}
      <header
        style={{
          background: DSS_THEME.bandBg,
          color: DSS_THEME.bandText,
        }}
      >
        <div className="mx-auto max-w-2xl px-5 sm:px-6 py-8 sm:py-10">
          <p
            style={{
              color: DSS_THEME.bandEyebrow,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            DSS 2026 Live Poll
          </p>
          <h1
            style={{
              fontSize: "clamp(28px, 6vw, 36px)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            How are you using AI?
          </h1>
          <p
            style={{
              color: "rgba(244, 241, 235, 0.78)",
              fontSize: 16,
              lineHeight: 1.55,
              marginTop: 14,
              marginBottom: 0,
              maxWidth: 560,
            }}
          >
            Five quick questions. Your answers are anonymous. We do not
            store your name, email, IP address, or device information.
          </p>
        </div>
      </header>

      {/* Main content surface (white) */}
      <main className="mx-auto max-w-2xl px-5 sm:px-6 py-10 sm:py-14">
        <DssPollForm />
      </main>

      {/* Bottom dark band */}
      <footer
        style={{
          background: DSS_THEME.bandBg,
          color: DSS_THEME.bandText,
        }}
      >
        <div className="mx-auto max-w-2xl px-5 sm:px-6 py-6">
          <p
            style={{
              fontSize: 13,
              opacity: 0.7,
              margin: 0,
            }}
          >
            HERR by ECQO Holdings &middot; h3rr.com
          </p>
        </div>
      </footer>
    </div>
  );
}
