/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — HERR™',
  description:
    'Privacy Policy for HERR™ by ECQO Holdings™. Learn how we collect, use, and protect your personal data, including voice recordings used for personalized affirmation delivery.',
};

const EFFECTIVE_DATE = 'April 2, 2026';
const COMPANY = 'ECQO Holdings™';
const BRAND = 'HERR™';
const SITE = 'h3rr.com';
const CONTACT_EMAIL = 'privacy@h3rr.com';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">

      {/* ── Attorney Review Banner ────────────────────────────────── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '96px 24px 0' }}>
        <div style={{ background: '#16161F', borderRadius: 12, border: '1px solid #C42D8E', padding: 16, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            This document is a template and has not been reviewed by legal counsel. Professional legal review is required before launch.
          </p>
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="px-6 pt-8 pb-16 border-b border-[var(--herr-border)]">
        <div className="max-w-[860px] mx-auto">
          <p className="herr-label text-[var(--herr-muted)] mb-4">Legal</p>
          <h1 className="font-display text-5xl md:text-6xl font-light text-[var(--herr-white)] mb-6 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-[var(--herr-muted)] text-lg leading-relaxed max-w-2xl">
            {COMPANY}, operating {BRAND} at {SITE}, is committed to protecting your privacy. This policy explains how we collect, use, store, and protect your personal information.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 text-[0.78rem] text-[var(--herr-faint)]">
            <span>Effective Date: {EFFECTIVE_DATE}</span>
            <span>Last Updated: {EFFECTIVE_DATE}</span>
          </div>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="max-w-[860px] mx-auto">
          <div className="prose-herr flex flex-col gap-12">

            {/* Quick Nav */}
            <div className="bg-[var(--herr-surface)] border border-[var(--herr-border)] p-6 rounded-none">
              <p className="herr-label text-[var(--herr-muted)] mb-4">Contents</p>
              <ol className="flex flex-col gap-2 text-[0.85rem]">
                {[
                  ['1', 'Who We Are'],
                  ['2', 'Information We Collect'],
                  ['3', 'How We Use Your Information'],
                  ['4', 'Voice Data — Special Provisions'],
                  ['5', 'How We Share Your Information'],
                  ['6', 'Data Retention'],
                  ['7', 'Your Rights'],
                  ['8', 'California Privacy Rights (CCPA)'],
                  ['9', 'International Users (GDPR)'],
                  ['10', 'Children\'s Privacy'],
                  ['11', 'Security'],
                  ['12', 'Third-Party Services'],
                  ['13', 'Changes to This Policy'],
                  ['14', 'Contact Us'],
                ].map(([num, label]) => (
                  <li key={num} className="text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors">
                    <a href={`#section-${num}`} className="no-underline">
                      <span className="text-[var(--herr-pink)] mr-2">{num}.</span>{label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            {/* 1. Who We Are */}
            <div id="section-1" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">1. Who We Are</h2>
              <p className="text-[var(--herr-muted)] leading-relaxed text-[0.95rem]">
                {BRAND} is a clinical wellness platform operated by {COMPANY}, a Delaware corporation. {BRAND} ("we," "us," or "our") provides personalized voice affirmation and identity reprogramming services through the website {SITE} and any related applications or services (collectively, the "Service").
              </p>
              <p className="text-[var(--herr-muted)] leading-relaxed text-[0.95rem]">
                {BRAND} was founded by Bianca D. McCall, LMFT, a Licensed Marriage and Family Therapist and clinical wellness expert. Questions about this policy may be directed to <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--herr-pink)] hover:underline">{CONTACT_EMAIL}</a>.
              </p>
            </div>

            {/* 2. Information We Collect */}
            <div id="section-2" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">2. Information We Collect</h2>

              <h3 className="text-[var(--herr-white)] font-medium text-[0.95rem]">2.1 Information You Provide Directly</h3>
              <ul className="flex flex-col gap-2 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Account Information:</strong> Name, email address, and password when you create an account.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Payment Information:</strong> Billing details processed securely through Stripe. We do not store full credit card numbers.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Clinical Assessment Data:</strong> Responses to our existential screener and wellness assessment, used to personalize your affirmation protocol.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Voice Recordings:</strong> Audio samples you voluntarily provide for voice cloning (HERR Personalized and HERR Elite tiers only). See Section 4 for full voice data provisions.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Communications:</strong> Messages you send to us via email or contact forms.</span></li>
              </ul>

              <h3 className="text-[var(--herr-white)] font-medium text-[0.95rem] mt-2">2.2 Information Collected Automatically</h3>
              <ul className="flex flex-col gap-2 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Usage Data:</strong> Pages visited, features used, session duration, and interaction patterns.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Device Information:</strong> Browser type, operating system, device identifiers, and IP address.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Cookies and Tracking:</strong> Session cookies for authentication and preference cookies for personalization. See our cookie settings for controls.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Referral Data:</strong> UTM parameters and referral sources to understand how users discover {BRAND}.</span></li>
              </ul>
            </div>

            {/* 3. How We Use Your Information */}
            <div id="section-3" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">3. How We Use Your Information</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">We use your information to:</p>
              <ul className="flex flex-col gap-2 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Provide and personalize the {BRAND} Service, including generating your personalized affirmation library</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Process subscription payments and manage your account</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Deliver your personalized I AM declarations in your chosen activity modes</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Send service communications including receipts, updates, and support responses</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Improve and develop the platform through usage analysis</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Ensure the security and integrity of the Service</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Comply with legal obligations</span></li>
              </ul>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                We do <strong className="text-[var(--herr-white)]">not</strong> sell your personal information. We do not use your clinical assessment data or voice recordings for advertising targeting.
              </p>
            </div>

            {/* 4. Voice Data */}
            <div id="section-4" className="flex flex-col gap-4">
              <div className="border border-[var(--herr-pink)] border-opacity-30 bg-[var(--herr-surface)] p-6">
                <h2 className="font-display text-2xl font-light text-[var(--herr-white)] mb-4">4. Voice Data — Special Provisions</h2>
                <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed mb-4">
                  Voice recordings are among the most sensitive personal data we collect. The following provisions apply specifically to members who provide voice samples for cloning (HERR Personalized and HERR Elite tiers).
                </p>
                <ul className="flex flex-col gap-3 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Consent:</strong> Voice cloning is entirely voluntary. You explicitly consent at the time of recording. You may withdraw consent at any time by contacting us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--herr-pink)]">{CONTACT_EMAIL}</a>.</span></li>
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Purpose Limitation:</strong> Your voice recordings and cloned voice model are used exclusively to generate your personal affirmations. They are never used for any other purpose.</span></li>
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">No Third-Party Use:</strong> We do not share, sell, license, or transfer your voice data or cloned voice model to any third party, except to our voice cloning technology provider (ElevenLabs) solely for the purpose of generating your affirmations under a strict data processing agreement.</span></li>
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Encryption:</strong> All voice recordings are encrypted in transit and at rest.</span></li>
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Deletion:</strong> Upon account cancellation or written request, your voice recordings and cloned voice model will be permanently deleted within 30 days from our systems and from our processing partners.</span></li>
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Biometric Data Compliance:</strong> In jurisdictions where voice data constitutes biometric information (including Illinois BIPA, Texas CUBI, and Washington MBIPA), we comply with all applicable collection, storage, use, and deletion requirements.</span></li>
                </ul>
              </div>
            </div>

            {/* 5. How We Share */}
            <div id="section-5" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">5. How We Share Your Information</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">We do not sell personal information. We share data only in the following limited circumstances:</p>
              <ul className="flex flex-col gap-2 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Service Providers:</strong> Trusted vendors who assist in operating the Service (payment processing via Stripe, voice technology via ElevenLabs, cloud infrastructure via Supabase and Cloudflare). All vendors are bound by data processing agreements and may not use your data for their own purposes.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Legal Requirements:</strong> When required by law, court order, or governmental authority.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred. We will notify you before any such transfer and provide opt-out options where required by law.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Protection of Rights:</strong> When necessary to protect the rights, property, or safety of {COMPANY}, our users, or the public.</span></li>
              </ul>
            </div>

            {/* 6. Data Retention */}
            <div id="section-6" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">6. Data Retention</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">We retain your personal information for as long as your account is active or as needed to provide the Service. Specifically:</p>
              <ul className="flex flex-col gap-2 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Account Data:</strong> Retained for the duration of your subscription plus 90 days following cancellation, then deleted or anonymized.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Voice Data:</strong> Deleted within 30 days of account cancellation or written deletion request.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Payment Records:</strong> Retained for 7 years as required by financial regulations.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Assessment Data:</strong> Retained for the life of your account, then deleted. You may request deletion at any time.</span></li>
              </ul>
            </div>

            {/* 7. Your Rights */}
            <div id="section-7" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">7. Your Rights</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">Depending on your jurisdiction, you may have the right to:</p>
              <ul className="flex flex-col gap-2 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Access:</strong> Request a copy of the personal data we hold about you.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Correction:</strong> Request correction of inaccurate or incomplete data.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Deletion:</strong> Request deletion of your personal data, subject to legal retention requirements.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Portability:</strong> Request your data in a structured, machine-readable format.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Objection:</strong> Object to certain processing activities.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Withdrawal of Consent:</strong> Withdraw consent at any time for processing based on consent (including voice cloning).</span></li>
              </ul>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                To exercise any of these rights, contact us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--herr-pink)] hover:underline">{CONTACT_EMAIL}</a>. We will respond within 30 days.
              </p>
            </div>

            {/* 8. CCPA */}
            <div id="section-8" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">8. California Privacy Rights (CCPA / CPRA)</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                California residents have additional rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
              </p>
              <ul className="flex flex-col gap-2 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Do Not Sell or Share:</strong> We do not sell or share personal information for cross-context behavioral advertising. You may still submit a Do Not Sell/Share request at <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--herr-pink)]">{CONTACT_EMAIL}</a>.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Sensitive Personal Information:</strong> Voice data, wellness assessment data, and payment card information are considered sensitive under CPRA. We collect this data only with your explicit consent and use it only to provide the Service.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Authorized Agent:</strong> You may designate an authorized agent to submit requests on your behalf. We will verify the agent's authority before fulfilling requests.</span></li>
              </ul>
            </div>

            {/* 9. GDPR */}
            <div id="section-9" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">9. International Users (GDPR)</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                For users in the European Economic Area (EEA), United Kingdom, or Switzerland, our lawful bases for processing personal data include:
              </p>
              <ul className="flex flex-col gap-2 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Contract:</strong> Processing necessary to provide the Service you have subscribed to.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Legitimate Interests:</strong> Analytics and security measures necessary to operate the platform safely.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Consent:</strong> Voice cloning and any optional marketing communications.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Legal Obligation:</strong> Financial record-keeping and regulatory compliance.</span></li>
              </ul>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                EEA/UK users have the right to lodge a complaint with their local supervisory authority. Data may be transferred to and processed in the United States. Where required, we implement Standard Contractual Clauses to ensure adequate protection.
              </p>
            </div>

            {/* 10. Children */}
            <div id="section-10" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">10. Children&apos;s Privacy</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                {BRAND} is not directed to individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you believe a minor has provided us with personal information, please contact us immediately at <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--herr-pink)] hover:underline">{CONTACT_EMAIL}</a> and we will delete it promptly.
              </p>
            </div>

            {/* 11. Security */}
            <div id="section-11" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">11. Security</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                We implement industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest for sensitive data, access controls limiting data access to authorized personnel only, and regular security reviews. However, no system is completely secure. We encourage you to use a strong, unique password and to contact us immediately if you suspect unauthorized access to your account.
              </p>
            </div>

            {/* 12. Third-Party Services */}
            <div id="section-12" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">12. Third-Party Services</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                {BRAND} integrates with the following third-party services. Each has its own privacy policy governing their data practices:
              </p>
              <ul className="flex flex-col gap-2 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Stripe</strong> — Payment processing. Stripe Privacy Policy: stripe.com/privacy</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">ElevenLabs</strong> — Voice cloning technology. ElevenLabs Privacy Policy: elevenlabs.io/privacy</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Supabase</strong> — Database and file storage infrastructure. Supabase Privacy Policy: supabase.com/privacy</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Cloudflare</strong> — Content delivery and web security. Cloudflare Privacy Policy: cloudflare.com/privacypolicy</span></li>
              </ul>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                {BRAND} is not responsible for the privacy practices of these third parties. We encourage you to review their policies.
              </p>
            </div>

            {/* 13. Changes */}
            <div id="section-13" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">13. Changes to This Policy</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                We may update this Privacy Policy from time to time. When we do, we will revise the "Last Updated" date at the top of this page and, for material changes, notify you by email or by displaying a prominent notice on the Service before the change takes effect. Your continued use of the Service after the effective date of any changes constitutes your acceptance of the updated policy.
              </p>
            </div>

            {/* 14. Contact */}
            <div id="section-14" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">14. Contact Us</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                For privacy-related questions, requests, or concerns, contact us at:
              </p>
              <div className="bg-[var(--herr-surface)] border border-[var(--herr-border)] p-6 flex flex-col gap-2 text-[0.9rem] text-[var(--herr-muted)]">
                <p><span className="text-[var(--herr-white)]">{COMPANY}</span></p>
                <p>Attn: Privacy</p>
                <p><a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--herr-pink)] hover:underline">{CONTACT_EMAIL}</a></p>
                <p>{SITE}</p>
              </div>
            </div>

            {/* Footer note */}
            <div className="border-t border-[var(--herr-border)] pt-8 flex flex-col gap-4">
              <p className="text-[0.78rem] text-[var(--herr-faint)] leading-relaxed">
                {BRAND} is a wellness tool and is not a substitute for professional mental health treatment. Clinical assessment data collected through {BRAND} is not protected health information (PHI) under HIPAA, as {BRAND} is not a covered entity or business associate under HIPAA. Always consult a licensed clinician for clinical concerns.
              </p>
              <p className="text-[0.72rem] text-[var(--herr-faint)]">
                © {new Date().getFullYear()} {COMPANY}. All rights reserved. {BRAND} and Human Existential Response and Reprogramming™ are trademarks of {COMPANY}. The {BRAND} Progressive Reprogramming System — Patent Pending.
              </p>
              <div className="flex flex-wrap gap-6 text-[0.78rem]">
                <Link href="/terms" className="text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors">Terms of Service</Link>
                <Link href="/contact" className="text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors">Contact</Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
