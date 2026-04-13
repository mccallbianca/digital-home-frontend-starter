/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — HERR™',
  description:
    'Terms of Service for HERR™ by ECQO Holdings™. Read the terms governing your use of the HERR clinical wellness platform, subscription services, and voice cloning features.',
};

const EFFECTIVE_DATE = 'April 2, 2026';
const COMPANY = 'ECQO Holdings™';
const BRAND = 'HERR™';
const SITE = 'h3rr.com';
const CONTACT_EMAIL = 'legal@h3rr.com';

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-[var(--herr-muted)] text-lg leading-relaxed max-w-2xl">
            These Terms of Service govern your access to and use of {BRAND}, operated by {COMPANY}. Please read them carefully before subscribing or using the Service.
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
          <div className="flex flex-col gap-12">

            {/* Quick Nav */}
            <div className="bg-[var(--herr-surface)] border border-[var(--herr-border)] p-6">
              <p className="herr-label text-[var(--herr-muted)] mb-4">Contents</p>
              <ol className="flex flex-col gap-2 text-[0.85rem]">
                {[
                  ['1', 'Acceptance of Terms'],
                  ['2', 'The Service'],
                  ['3', 'Eligibility'],
                  ['4', 'Account Registration'],
                  ['5', 'Subscription Plans and Billing'],
                  ['6', 'Cancellation and Refunds'],
                  ['7', 'Voice Cloning — Terms and Consent'],
                  ['8', 'Clinical Disclaimer'],
                  ['9', 'Acceptable Use'],
                  ['10', 'Intellectual Property'],
                  ['11', 'User Content'],
                  ['12', 'Disclaimer of Warranties'],
                  ['13', 'Limitation of Liability'],
                  ['14', 'Indemnification'],
                  ['15', 'Dispute Resolution and Arbitration'],
                  ['16', 'Governing Law'],
                  ['17', 'Changes to These Terms'],
                  ['18', 'Contact'],
                ].map(([num, label]) => (
                  <li key={num} className="text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors">
                    <a href={`#t-section-${num}`} className="no-underline">
                      <span className="text-[var(--herr-pink)] mr-2">{num}.</span>{label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            {/* 1. Acceptance */}
            <div id="t-section-1" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">1. Acceptance of Terms</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                By accessing or using {BRAND} at {SITE}, creating an account, or subscribing to any {BRAND} plan, you agree to be bound by these Terms of Service ("Terms") and our <Link href="/privacy" className="text-[var(--herr-pink)] hover:underline">Privacy Policy</Link>, which is incorporated by reference. If you do not agree to these Terms, do not use the Service.
              </p>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                These Terms constitute a legally binding agreement between you and {COMPANY} ("Company," "we," "us," or "our"). {BRAND} was founded by Bianca D. McCall, LMFT, a Licensed Marriage and Family Therapist.
              </p>
            </div>

            {/* 2. The Service */}
            <div id="t-section-2" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">2. The Service</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                {BRAND} (Human Existential Response and Reprogramming™) is a clinical wellness platform that provides:
              </p>
              <ul className="flex flex-col gap-2 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Existential wellness assessment and personalization</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Personalized I AM declarations and voice affirmations delivered in your own cloned voice or in the voice of Bianca D. McCall, LMFT</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Nervous system regulation audio content</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Eight activity-mode delivery formats (Workout, Driving, Sleep, Morning, Deep Work, Love & Family, Abundance, Healing)</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Live group sessions with Bianca D. McCall, LMFT (HERR Elite tier only)</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Journal content and clinical educational resources</span></li>
              </ul>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice. We will make reasonable efforts to notify subscribers of material changes.
              </p>
            </div>

            {/* 3. Eligibility */}
            <div id="t-section-3" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">3. Eligibility</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                You must be at least 18 years of age to use {BRAND}. By using the Service, you represent and warrant that you are 18 or older, that you have the legal capacity to enter into a binding agreement, and that your use of the Service will comply with these Terms and all applicable laws.
              </p>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                {BRAND} is intended for general wellness use by adults. It is not designed for use by individuals currently experiencing acute psychiatric crises, active suicidal ideation, or psychosis. If you are in crisis, please contact the 988 Suicide and Crisis Lifeline by calling or texting 988.
              </p>
            </div>

            {/* 4. Account Registration */}
            <div id="t-section-4" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">4. Account Registration</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                To access the Service, you must create an account with accurate and complete information. You are responsible for:
              </p>
              <ul className="flex flex-col gap-2 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Maintaining the confidentiality of your account credentials</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>All activity that occurs under your account</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Notifying us immediately of any unauthorized account access at <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--herr-pink)]">{CONTACT_EMAIL}</a></span></li>
              </ul>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                Accounts are non-transferable. You may not share your account with others or allow others to access the Service through your credentials.
              </p>
            </div>

            {/* 5. Billing */}
            <div id="t-section-5" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">5. Subscription Plans and Billing</h2>

              <h3 className="text-[var(--herr-white)] font-medium text-[0.95rem]">5.1 Subscription Tiers</h3>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                {BRAND} offers three subscription tiers billed monthly:
              </p>
              <ul className="flex flex-col gap-2 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">HERR™ Collective — $9/month:</strong> Affirmation library delivered in Bianca D. McCall, LMFT's cloned voice.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">HERR™ Personalized — $19/month:</strong> Personalized affirmations delivered in your own cloned voice, with clinical assessment.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">HERR™ Elite — $29/month:</strong> Full clinical protocol with monthly live group sessions with Bianca D. McCall, LMFT.</span></li>
              </ul>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">Pricing is subject to change. We will provide at least 30 days' notice before any price increase takes effect for existing subscribers.</p>

              <h3 className="text-[var(--herr-white)] font-medium text-[0.95rem] mt-2">5.2 Automatic Renewal</h3>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                Subscriptions renew automatically each month on your billing anniversary date. By subscribing, you authorize {COMPANY} to charge your payment method on a recurring monthly basis until you cancel. You can cancel at any time through your member dashboard.
              </p>

              <h3 className="text-[var(--herr-white)] font-medium text-[0.95rem] mt-2">5.3 Payment Processing</h3>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                Payments are processed by Stripe. By providing payment information, you agree to Stripe's terms of service. If a payment fails, we will attempt to collect payment up to three times before suspending your account. You are responsible for keeping your payment information current.
              </p>
            </div>

            {/* 6. Cancellation and Refunds */}
            <div id="t-section-6" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">6. Cancellation and Refunds</h2>
              <ul className="flex flex-col gap-2 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Cancellation:</strong> You may cancel your subscription at any time through your member dashboard. Cancellation takes effect at the end of your current billing period. You will retain access to the Service through the end of the period for which you have paid.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Refunds:</strong> Subscription fees are generally non-refundable. We will consider refund requests within 7 days of the initial charge for new subscribers who have not yet accessed personalized content. Contact <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--herr-pink)]">{CONTACT_EMAIL}</a>.</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Voice Cloning Data on Cancellation:</strong> Upon cancellation, your voice data will be deleted within 30 days. Your generated affirmation library will no longer be accessible after your billing period ends.</span></li>
              </ul>
            </div>

            {/* 7. Voice Cloning */}
            <div id="t-section-7" className="flex flex-col gap-4">
              <div className="border border-[var(--herr-pink)] border-opacity-30 bg-[var(--herr-surface)] p-6">
                <h2 className="font-display text-2xl font-light text-[var(--herr-white)] mb-4">7. Voice Cloning — Terms and Consent</h2>
                <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed mb-4">
                  The voice cloning feature (available on HERR™ Personalized and HERR™ Elite tiers) is subject to the following terms, which you explicitly agree to when providing voice samples:
                </p>
                <ul className="flex flex-col gap-3 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Voluntary Consent:</strong> You voluntarily provide voice recordings and consent to the creation of a digital voice model ("Voice Clone") for the sole purpose of generating your personal affirmations.</span></li>
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">License Grant:</strong> You grant {COMPANY} a limited, non-exclusive, non-transferable license to process your voice recordings and Voice Clone solely for the purpose of providing the Service to you.</span></li>
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">No Third-Party Use:</strong> Your Voice Clone will never be used for any purpose other than generating your personal affirmations. It will not be shared, sold, or used to train AI models.</span></li>
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Your Ownership:</strong> You retain full ownership of your voice and your Voice Clone. The limited license granted above terminates upon cancellation of your subscription or written request for deletion.</span></li>
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Accuracy:</strong> Voice cloning technology is sophisticated but not perfect. {COMPANY} makes no warranty that your Voice Clone will be a perfect replica of your voice.</span></li>
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span><strong className="text-[var(--herr-white)]">Revocation:</strong> You may revoke your consent and request deletion of your Voice Clone at any time by contacting <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--herr-pink)]">{CONTACT_EMAIL}</a>. Revocation will result in loss of personalized voice affirmation features.</span></li>
                </ul>
              </div>
            </div>

            {/* 8. Clinical Disclaimer */}
            <div id="t-section-8" className="flex flex-col gap-4">
              <div className="border border-[var(--herr-border)] bg-[var(--herr-surface)] p-6">
                <h2 className="font-display text-2xl font-light text-[var(--herr-white)] mb-4">8. Clinical Disclaimer</h2>
                <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed mb-3">
                  <strong className="text-[var(--herr-white)]">{BRAND} is a wellness tool. It is not a medical device, clinical treatment, or mental health service under any applicable licensing law.</strong>
                </p>
                <ul className="flex flex-col gap-3 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>{BRAND} does not diagnose, treat, cure, or prevent any mental health condition, medical condition, or psychiatric disorder.</span></li>
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>{BRAND} is not a substitute for professional mental health treatment, psychotherapy, psychiatric care, or medical advice.</span></li>
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>The existential assessments provided through {BRAND} are wellness screeners, not clinical diagnostic instruments.</span></li>
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Live sessions with Bianca D. McCall, LMFT, offered through HERR™ Elite, are group wellness sessions and do not constitute individual psychotherapy or the establishment of a therapist-client relationship.</span></li>
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Data shared through {BRAND} is not protected health information (PHI) under HIPAA. {COMPANY} is not a HIPAA covered entity.</span></li>
                  <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>If you are experiencing a mental health emergency, please call 911 or the 988 Suicide and Crisis Lifeline (call or text 988).</span></li>
                </ul>
              </div>
            </div>

            {/* 9. Acceptable Use */}
            <div id="t-section-9" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">9. Acceptable Use</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">You agree not to:</p>
              <ul className="flex flex-col gap-2 text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Use the Service for any unlawful purpose or in violation of any applicable law</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Reproduce, distribute, or create derivative works from any {BRAND} content without written permission</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Reverse engineer, decompile, or otherwise attempt to extract the source code of the Service</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Share your account credentials or allow others to access the Service through your account</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Provide voice recordings of any person other than yourself</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Use the Service to harass, harm, or impersonate any person</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Attempt to gain unauthorized access to any portion of the Service or its related systems</span></li>
                <li className="flex gap-3"><span className="text-[var(--herr-pink)] shrink-0">+</span><span>Use automated tools, scrapers, or bots to access or extract data from the Service</span></li>
              </ul>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                Violation of these provisions may result in immediate termination of your account without refund.
              </p>
            </div>

            {/* 10. Intellectual Property */}
            <div id="t-section-10" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">10. Intellectual Property</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                All content, features, and functionality of the Service — including but not limited to text, audio, images, the {BRAND} clinical framework, the Progressive Reprogramming System (Patent Pending), software, and design — are owned by {COMPANY} and protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                {BRAND}™ and Human Existential Response and Reprogramming™ are trademarks of {COMPANY}. Unauthorized use of our trademarks is prohibited. Nothing in these Terms grants you any right to use our trademarks, logos, or brand elements without prior written consent.
              </p>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                Your subscription grants you a limited, personal, non-exclusive, non-transferable license to access and use the Service for your own personal, non-commercial wellness purposes.
              </p>
            </div>

            {/* 11. User Content */}
            <div id="t-section-11" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">11. User Content</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                "User Content" means any content you submit to the Service, including voice recordings, assessment responses, and communications. You retain ownership of your User Content. By submitting User Content, you grant {COMPANY} a limited license to use, store, and process your User Content solely as necessary to provide the Service to you, as described in our <Link href="/privacy" className="text-[var(--herr-pink)] hover:underline">Privacy Policy</Link>.
              </p>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                You represent and warrant that your User Content does not infringe any third-party rights and that you have the right to grant the license above. You may not submit voice recordings of any person other than yourself.
              </p>
            </div>

            {/* 12. Disclaimer of Warranties */}
            <div id="t-section-12" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">12. Disclaimer of Warranties</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed uppercase tracking-wide text-[0.82rem]">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. {COMPANY.toUpperCase()} DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR PRODUCE ANY PARTICULAR WELLNESS OUTCOME. INDIVIDUAL RESULTS MAY VARY.
              </p>
            </div>

            {/* 13. Limitation of Liability */}
            <div id="t-section-13" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">13. Limitation of Liability</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed uppercase tracking-wide text-[0.82rem]">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, {COMPANY.toUpperCase()} AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE THREE (3) MONTHS PRECEDING THE CLAIM.
              </p>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                Some jurisdictions do not allow the exclusion or limitation of certain damages, so the above limitation may not apply to you.
              </p>
            </div>

            {/* 14. Indemnification */}
            <div id="t-section-14" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">14. Indemnification</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                You agree to indemnify, defend, and hold harmless {COMPANY} and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising out of or related to your use of the Service, your User Content, or your violation of these Terms.
              </p>
            </div>

            {/* 15. Dispute Resolution */}
            <div id="t-section-15" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">15. Dispute Resolution and Arbitration</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <strong className="text-[var(--herr-white)]">Informal Resolution First.</strong> Before filing any formal dispute, you agree to contact us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--herr-pink)]">{CONTACT_EMAIL}</a> and give us 30 days to attempt informal resolution.
              </p>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <strong className="text-[var(--herr-white)]">Binding Arbitration.</strong> If informal resolution fails, any dispute arising out of or relating to these Terms or the Service shall be resolved by binding arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules. Arbitration will take place in the State of Delaware or by video conference. The arbitrator's award shall be final and binding.
              </p>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <strong className="text-[var(--herr-white)]">Class Action Waiver.</strong> You waive any right to participate in a class action lawsuit or class-wide arbitration. All disputes must be brought in your individual capacity.
              </p>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                <strong className="text-[var(--herr-white)]">Exceptions.</strong> Either party may seek emergency injunctive or other equitable relief in a court of competent jurisdiction to prevent harm. Small claims court matters within applicable limits are also exempt.
              </p>
            </div>

            {/* 16. Governing Law */}
            <div id="t-section-16" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">16. Governing Law</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions. For matters not subject to arbitration, you consent to the exclusive jurisdiction of the state and federal courts located in Delaware.
              </p>
            </div>

            {/* 17. Changes */}
            <div id="t-section-17" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">17. Changes to These Terms</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                We may revise these Terms at any time. For material changes, we will notify you by email at least 14 days before the changes take effect. Your continued use of the Service after the effective date constitutes acceptance of the revised Terms. If you do not agree to the revised Terms, you must cancel your subscription before the effective date.
              </p>
            </div>

            {/* 18. Contact */}
            <div id="t-section-18" className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">18. Contact</h2>
              <p className="text-[0.9rem] text-[var(--herr-muted)] leading-relaxed">
                For questions about these Terms, contact us at:
              </p>
              <div className="bg-[var(--herr-surface)] border border-[var(--herr-border)] p-6 flex flex-col gap-2 text-[0.9rem] text-[var(--herr-muted)]">
                <p><span className="text-[var(--herr-white)]">{COMPANY}</span></p>
                <p>Attn: Legal</p>
                <p><a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--herr-pink)] hover:underline">{CONTACT_EMAIL}</a></p>
                <p>{SITE}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--herr-border)] pt-8 flex flex-col gap-4">
              <p className="text-[0.78rem] text-[var(--herr-faint)] leading-relaxed">
                {BRAND} is a wellness tool and is not a substitute for professional mental health treatment. Always consult a licensed clinician for clinical concerns. If you are in mental health crisis, contact the 988 Suicide and Crisis Lifeline by calling or texting 988.
              </p>
              <p className="text-[0.72rem] text-[var(--herr-faint)]">
                © {new Date().getFullYear()} {COMPANY}. All rights reserved. {BRAND} and Human Existential Response and Reprogramming™ are trademarks of {COMPANY}. The {BRAND} Progressive Reprogramming System — Patent Pending.
              </p>
              <div className="flex flex-wrap gap-6 text-[0.78rem]">
                <Link href="/privacy" className="text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors">Privacy Policy</Link>
                <Link href="/contact" className="text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors">Contact</Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
