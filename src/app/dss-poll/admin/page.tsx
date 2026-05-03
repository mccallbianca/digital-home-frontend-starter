import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isDssPollAdmin } from "@/lib/dss-poll-admin";
import AdminConsole from "../_components/AdminConsole";
import { DSS_THEME, FONT_STACK } from "@/lib/dss-poll-shared";

export const metadata: Metadata = {
  title: "DSS 2026 Live Poll Admin",
  description: "Operator controls for the DSS 2026 live poll.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DssPollAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Use /login (not /signup) because the project's /login page
    // honors the `redirect` query param and routes the user back
    // here after authentication. /signup hardcodes /onboarding.
    redirect(`/login?redirect=${encodeURIComponent("/dss-poll/admin")}`);
  }

  // Common page chrome for both not-authorized and admin paths.
  const pageWrapStyle: React.CSSProperties = {
    background: DSS_THEME.pageBg,
    color: DSS_THEME.bodyText,
    fontFamily: FONT_STACK,
    minHeight: "100vh",
  };
  const bandStyle: React.CSSProperties = {
    background: DSS_THEME.bandBg,
    color: DSS_THEME.bandText,
  };
  const eyebrowStyle: React.CSSProperties = {
    color: DSS_THEME.bandEyebrow,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    marginBottom: 12,
  };
  const h1Style: React.CSSProperties = {
    fontSize: "clamp(28px, 6vw, 36px)",
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: "-0.01em",
    margin: 0,
  };
  const sublineStyle: React.CSSProperties = {
    color: "rgba(244, 241, 235, 0.78)",
    fontSize: 16,
    lineHeight: 1.55,
    marginTop: 14,
    marginBottom: 0,
    maxWidth: 720,
  };
  const footerBand = (
    <footer style={bandStyle}>
      <div className="mx-auto max-w-3xl px-5 sm:px-6 py-6">
        <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>
          HERR by ECQO Holdings &middot; h3rr.com
        </p>
      </div>
    </footer>
  );

  if (!isDssPollAdmin(user.email)) {
    return (
      <div style={pageWrapStyle}>
        <header style={bandStyle}>
          <div className="mx-auto max-w-3xl px-5 sm:px-6 py-8 sm:py-10">
            <p style={eyebrowStyle}>DSS 2026 Live Poll Admin</p>
            <h1 style={h1Style}>Not authorized.</h1>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-5 sm:px-6 py-10 sm:py-14">
          <section
            style={{
              background: DSS_THEME.cardBg,
              border: `1px solid ${DSS_THEME.cardBorder}`,
              borderRadius: 12,
              padding: 28,
            }}
          >
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.55,
                color: DSS_THEME.bodyText,
                margin: 0,
                marginBottom: 16,
              }}
            >
              The account <strong>{user.email}</strong> is not on the DSS
              2026 admin allowlist. If you believe this is a mistake,
              contact Bianca.
            </p>
            <Link
              href="/dss-poll/results"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: DSS_THEME.ctaSecondaryBg,
                color: DSS_THEME.ctaSecondaryText,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                padding: "14px 24px",
                borderRadius: 999,
                textDecoration: "none",
              }}
            >
              Go to public dashboard
              <span aria-hidden>→</span>
            </Link>
          </section>
        </main>
        {footerBand}
      </div>
    );
  }

  return (
    <div style={pageWrapStyle}>
      <header style={bandStyle}>
        <div className="mx-auto max-w-3xl px-5 sm:px-6 py-8 sm:py-10">
          <p style={eyebrowStyle}>DSS 2026 Live Poll Admin</p>
          <h1 style={h1Style}>Operator controls.</h1>
          <p style={sublineStyle}>
            Signed in as {user.email}. All actions take effect immediately
            on the public dashboard via Supabase Realtime.
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 sm:px-6 py-10 sm:py-14">
        <AdminConsole />
      </main>
      {footerBand}
    </div>
  );
}
