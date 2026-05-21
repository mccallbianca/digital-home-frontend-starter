/**
 * /enterprise — corporate B2B / B2G landing page.
 *
 * Server component. Mobile-first. Inline styles only.
 * Palette is brand-pure: ECQO Ink background, ECQO Cream type, HERR
 * Magenta accents. The sports-skinned variant lives at
 * /enterprise/sports.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import EnterpriseInquiryForm from './EnterpriseInquiryForm';

export const metadata: Metadata = {
  title: 'Enterprise AI Infrastructure for Behavioral Health | HERR by ECQO Holdings',
  description: 'Licensed clinical AI built by a federal SAMHSA advisor. Auditable. Defensible. Production-ready. Safe Source Code licensing PMPM, workforce certifications, white-glove deployment.',
};

const INK     = '#0A0A0F';
const CREAM   = '#F4F1EB';
const MAGENTA = '#C42D8E';
const MUTED   = 'rgba(244,241,235,0.65)';
const FAINT   = 'rgba(244,241,235,0.45)';
const HAIRLINE = 'rgba(244,241,235,0.12)';

export default function EnterprisePage() {
  return (
    <main style={{ background: INK, color: CREAM, minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ───────── Hero ───────── */}
      <section style={{ padding: '88px 24px 64px', maxWidth: 980, margin: '0 auto' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: MAGENTA, fontWeight: 700, margin: '0 0 18px' }}>
          For Healthcare, Government &amp; Workforce
        </p>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 500,
          fontSize: 'clamp(34px, 6vw, 60px)',
          lineHeight: 1.05,
          letterSpacing: '-0.01em',
          margin: '0 0 22px',
          color: CREAM,
        }}>
          Enterprise AI Infrastructure for Behavioral Health.
        </h1>
        <p style={{
          fontSize: 'clamp(17px, 2.4vw, 22px)',
          lineHeight: 1.55,
          color: MUTED,
          margin: '0 0 36px',
          maxWidth: 760,
        }}>
          Licensed clinical AI built by a federal SAMHSA advisor. Auditable. Defensible. Production-ready.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <a href="#inquire" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '14px 28px', background: MAGENTA, color: '#FFFFFF',
            borderRadius: 999, fontSize: 13, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Talk to us →
          </a>
          <Link href="/dashboard/companion" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '14px 28px', background: 'transparent', color: CREAM,
            border: `1px solid ${HAIRLINE}`, borderRadius: 999, fontSize: 13, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none',
          }}>
            See the live product →
          </Link>
        </div>
      </section>

      {/* ───────── PILLAR 1 — Safe Source Code Licensing PMPM ───────── */}
      <section style={{ padding: '64px 24px', borderTop: `1px solid ${HAIRLINE}`, maxWidth: 1080, margin: '0 auto' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: MAGENTA, fontWeight: 700, margin: '0 0 14px' }}>
          Pillar 01 · PMPM Licensing
        </p>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(28px, 4.5vw, 44px)',
          fontWeight: 500,
          lineHeight: 1.1,
          margin: '0 0 18px',
          color: CREAM,
        }}>
          Safe Source AI Infrastructure.
        </h2>
        <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', lineHeight: 1.6, color: MUTED, margin: '0 0 32px', maxWidth: 720 }}>
          License the only clinical AI infrastructure built with named clinician sign-off, WS1–WS6 safety architecture, and full audit logs. Compliance-ready from day one.
        </p>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <PriceCard
            tag="B2B Healthcare &amp; Behavioral Health"
            price="$5 – $20"
            unit="PMPM"
            blurb="Per member per month. Scales with covered-lives volume."
          />
          <PriceCard
            tag="B2G"
            price="$5"
            unit="PMPM"
            blurb="Minimum 7,500 lives. Below that → pilot, grant-funded."
          />
          <PriceCard
            tag="Enterprise (Custom)"
            price="Contact"
            unit=""
            blurb="Multi-entity, multi-region, or bundled with workforce certifications."
          />
        </div>
      </section>

      {/* ───────── PILLAR 2 — Workforce Certifications ───────── */}
      <section style={{ padding: '64px 24px', borderTop: `1px solid ${HAIRLINE}`, maxWidth: 1080, margin: '0 auto' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: MAGENTA, fontWeight: 700, margin: '0 0 14px' }}>
          Pillar 02 · Certifications
        </p>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(28px, 4.5vw, 44px)',
          fontWeight: 500,
          lineHeight: 1.1,
          margin: '0 0 18px',
          color: CREAM,
        }}>
          ECQO Holdings Academic Press Certifications.
        </h2>
        <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', lineHeight: 1.6, color: MUTED, margin: '0 0 32px', maxWidth: 720 }}>
          Four 16-hour certification curricula. Delivered to universities, workforce development programs, and enterprise HR. Recertification creates recurring revenue.
        </p>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <CertCard short="BFRW" full="Building a Financially Resilient Workforce" sub="8 modules · Workforce HR" />
          <CertCard short="ECQO-ARM" full="AI Risk Mitigator Certification" sub="Compliance + risk leadership" />
          <CertCard short="ECQO-AM" full="AI Moderator Certification" sub="Frontline content + crisis moderation" />
          <CertCard short="ECQO-ANSBH" full="AI Navigator Specialist in Behavioral Health" sub="Clinician-adjacent AI deployment" />
        </div>
      </section>

      {/* ───────── PILLAR 3 — Implementation Team ───────── */}
      <section style={{ padding: '64px 24px', borderTop: `1px solid ${HAIRLINE}`, maxWidth: 1080, margin: '0 auto' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: MAGENTA, fontWeight: 700, margin: '0 0 14px' }}>
          Pillar 03 · Deployment
        </p>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(28px, 4.5vw, 44px)',
          fontWeight: 500,
          lineHeight: 1.1,
          margin: '0 0 18px',
          color: CREAM,
        }}>
          White-Glove Clinical Deployment.
        </h2>
        <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', lineHeight: 1.6, color: MUTED, margin: '0 0 28px', maxWidth: 720 }}>
          Configuration, compliance setup, organizational integration. Bianca D. McCall, M.A., LMFT as clinical lead. Sagar Raich, Esq. for legal architecture. Custom pricing based on scope.
        </p>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <PersonCard name="Bianca D. McCall" credential="M.A., LMFT" role="Clinical Lead · Federal SAMHSA Advisor" />
          <PersonCard name="Sagar Raich" credential="Esq." role="Legal Architecture · Compliance" />
          <PersonCard name="Morris Jackson II" credential="" role="ECQO Strategic Advisor · GTM" />
        </div>
      </section>

      {/* ───────── Inquiry form ───────── */}
      <section id="inquire" style={{ padding: '72px 24px 96px', borderTop: `1px solid ${HAIRLINE}`, maxWidth: 880, margin: '0 auto' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: MAGENTA, fontWeight: 700, margin: '0 0 14px' }}>
          Start a conversation
        </p>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(28px, 4.5vw, 44px)',
          fontWeight: 500,
          lineHeight: 1.1,
          margin: '0 0 18px',
          color: CREAM,
        }}>
          Let&apos;s see if ECQO fits your stack.
        </h2>
        <p style={{ fontSize: 16, color: MUTED, margin: '0 0 28px', lineHeight: 1.6 }}>
          Tell us about your organization and what you&apos;re trying to solve. Bianca responds personally within 48 hours.
        </p>
        <EnterpriseInquiryForm source="enterprise_page" accentColor={MAGENTA} />
      </section>

      {/* ───────── Footer ───────── */}
      <footer style={{ padding: '32px 24px 48px', borderTop: `1px solid ${HAIRLINE}`, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: FAINT, margin: 0, lineHeight: 1.7 }}>
          ECQO Holdings · h3rr.com · <a href="mailto:mccall.bianca@gmail.com" style={{ color: MUTED, textDecoration: 'none' }}>mccall.bianca@gmail.com</a> · 888-982-9423
        </p>
        <p style={{ fontSize: 11, color: FAINT, margin: '12px 0 0', lineHeight: 1.7 }}>
          HERR™ is a wellness tool and is not a substitute for professional mental health treatment.
        </p>
      </footer>
    </main>
  );
}

// ────────────────────────────────────────────────────────────────

function PriceCard({ tag, price, unit, blurb }: { tag: string; price: string; unit: string; blurb: string }) {
  return (
    <div style={{
      border: `1px solid ${HAIRLINE}`,
      borderRadius: 14,
      padding: '20px 22px',
      background: 'rgba(244,241,235,0.025)',
    }}>
      <p
        style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: FAINT, fontWeight: 600, margin: '0 0 10px' }}
        dangerouslySetInnerHTML={{ __html: tag }}
      />
      <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 30, color: CREAM, fontWeight: 500 }}>
        {price}
        {unit && <span style={{ marginLeft: 8, fontSize: 14, color: MUTED, letterSpacing: '0.08em' }}>{unit}</span>}
      </p>
      <p style={{ fontSize: 13, color: MUTED, margin: '8px 0 0', lineHeight: 1.5 }}>{blurb}</p>
    </div>
  );
}

function CertCard({ short, full, sub }: { short: string; full: string; sub: string }) {
  return (
    <div style={{
      border: `1px solid ${HAIRLINE}`,
      borderRadius: 14,
      padding: '18px 20px',
      background: 'rgba(244,241,235,0.025)',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: MAGENTA, fontWeight: 700 }}>{short}</p>
      <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 19, color: CREAM, fontWeight: 500, lineHeight: 1.3 }}>{full}</p>
      <p style={{ margin: 0, fontSize: 12, color: MUTED }}>{sub}</p>
    </div>
  );
}

function PersonCard({ name, credential, role }: { name: string; credential: string; role: string }) {
  return (
    <div style={{
      border: `1px solid ${HAIRLINE}`,
      borderRadius: 14,
      padding: '18px 20px',
      background: 'rgba(244,241,235,0.025)',
    }}>
      <p style={{ margin: 0, fontSize: 18, color: CREAM, fontWeight: 600 }}>
        {name}{credential && <span style={{ color: MUTED, fontWeight: 400 }}>, {credential}</span>}
      </p>
      <p style={{ margin: '6px 0 0', fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{role}</p>
    </div>
  );
}
