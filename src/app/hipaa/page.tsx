/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HIPAA Notice — HERR',
  description: 'HERR HIPAA alignment approach, data encryption, and privacy practices.',
};

const COMPANY = 'ECQO Holdings\u2122';
const BRAND = 'HERR\u2122';

export default function HipaaPage() {
  const sectionStyle = { marginBottom: 48 };
  const h2Style = {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 16,
  };
  const pStyle = {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.8,
    marginBottom: 24,
  };

  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0F' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '120px 24px 80px' }}>

        {/* Attorney review banner */}
        <div style={{ background: '#16161F', borderRadius: 12, border: '1px solid #C42D8E', padding: 16, marginBottom: 32 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            This document is a template and has not been reviewed by legal counsel. Professional legal review is required before launch.
          </p>
        </div>

        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, color: '#FFFFFF', marginBottom: 8 }}>
          HIPAA Notice
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 48 }}>
          Last updated: April 12, 2026
        </p>

        {/* 1. Our Approach */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>1. HIPAA Alignment Approach</h2>
          <p style={pStyle}>
            {BRAND} (Human Existential Response and Reprogramming{'\u2122'}) by {COMPANY} is a <strong style={{ color: '#FFFFFF' }}>wellness platform, not a healthcare provider</strong>. As such, {COMPANY} is not a HIPAA covered entity and is not subject to the Health Insurance Portability and Accountability Act (HIPAA) as defined under 45 CFR Part 160.
          </p>
          <p style={pStyle}>
            However, because {BRAND} collects sensitive personal information — including existential wellness assessments, voice recordings, and behavioral data — we voluntarily align our data practices with HIPAA principles to provide our members with the highest standard of data protection.
          </p>
          <p style={pStyle}>
            This means we apply HIPAA-inspired safeguards even though we are not legally required to do so. We believe this is the responsible approach for a platform that sits at the intersection of technology and mental wellness.
          </p>
        </div>

        {/* 2. What Is and Isn't Covered */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>2. What Is and Isn't Covered</h2>
          <p style={pStyle}>
            <strong style={{ color: '#FFFFFF' }}>What our HIPAA alignment covers:</strong>
          </p>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
            {[
              'Existential wellness assessment responses',
              'Voice recordings and voice clone data',
              'Activity mode preferences and listening history',
              'Community posts and messages',
              'Crisis detection logs (maintained for clinical safety review)',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                <span style={{ color: '#C42D8E', flexShrink: 0 }}>+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p style={pStyle}>
            <strong style={{ color: '#FFFFFF' }}>What is NOT covered:</strong>
          </p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              'Data collected by {BRAND} is not Protected Health Information (PHI) under HIPAA',
              '{BRAND} does not establish a provider-patient relationship',
              'Live sessions with Bianca D. McCall, LMFT are group wellness sessions, not psychotherapy',
              '{BRAND} does not submit claims to insurance providers',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                <span style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>–</span>
                <span>{item.replace('{BRAND}', BRAND)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Data Encryption */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>3. Data Encryption</h2>
          <p style={pStyle}>
            All data transmitted between your device and {BRAND} servers is encrypted using TLS 1.2 or higher (encryption in transit). Data stored in our databases is encrypted at rest using AES-256 encryption, the same standard used by healthcare organizations and financial institutions.
          </p>
          <p style={pStyle}>
            Voice recordings are encrypted before storage in our cloud infrastructure (Supabase Storage) and are accessible only to the member who created them and authorized {BRAND} systems for affirmation generation.
          </p>
        </div>

        {/* 4. Access Controls */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>4. Access Controls</h2>
          <p style={pStyle}>
            Access to member data is restricted on a need-to-know basis:
          </p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              'Members can only access their own data through authenticated sessions',
              'Row-Level Security (RLS) policies enforce data isolation at the database level',
              'Administrative access is limited to Bianca D. McCall, LMFT (founder) and authorized technical personnel',
              'All administrative access is logged and auditable',
              'Third-party service providers (Stripe, ElevenLabs, Supabase) are selected for their own compliance standards',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                <span style={{ color: '#C42D8E', flexShrink: 0 }}>+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Breach Notification */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>5. Breach Notification</h2>
          <p style={pStyle}>
            In the event of a data breach that compromises member information, {COMPANY} will:
          </p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              'Notify affected members within 72 hours of discovering the breach',
              'Provide a clear description of what data was affected',
              'Describe the measures taken to address the breach and prevent future occurrences',
              'Offer guidance on steps members can take to protect themselves',
              'Report the breach to relevant regulatory authorities as required by applicable law',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                <span style={{ color: '#C42D8E', flexShrink: 0 }}>{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 6. User Rights */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>6. Your Rights</h2>
          <p style={pStyle}>
            Regardless of HIPAA's technical applicability, we extend the following rights to all {BRAND} members:
          </p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              'Right to access: You may request a copy of all data we hold about you',
              'Right to correction: You may request correction of inaccurate personal data',
              'Right to deletion: You may request deletion of your account and all associated data, including voice clone data',
              'Right to portability: You may request your data in a machine-readable format',
              'Right to revoke voice consent: You may revoke voice cloning consent at any time through Settings',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                <span style={{ color: '#C42D8E', flexShrink: 0 }}>+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p style={pStyle}>
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:privacy@h3rr.com" style={{ color: '#C42D8E', textDecoration: 'underline' }}>privacy@h3rr.com</a>.
          </p>
        </div>

        {/* 7. Contact */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>7. Contact</h2>
          <p style={pStyle}>
            For questions about this HIPAA Notice or our data protection practices, contact:
          </p>
          <div style={{ background: '#16161F', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize: 15, color: '#FFFFFF', marginBottom: 4 }}>{COMPANY}</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Attn: Privacy &amp; Data Protection</p>
            <p style={{ fontSize: 14 }}>
              <a href="mailto:privacy@h3rr.com" style={{ color: '#C42D8E', textDecoration: 'underline' }}>privacy@h3rr.com</a>
            </p>
          </div>
        </div>

        {/* Footer disclaimers */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 32 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, marginBottom: 16 }}>
            {BRAND} is a wellness platform, not a healthcare provider. If you are in crisis, call or text{' '}
            <a href="tel:988" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>988</a>.
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            &copy; {new Date().getFullYear()} {COMPANY}. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
