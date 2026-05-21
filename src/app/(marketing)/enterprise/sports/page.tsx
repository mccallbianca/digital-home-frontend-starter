/**
 * /enterprise/sports — 5-slide pitch deck for Jay Vickers (UNLV Sports
 * Innovation Institute, SEICon co-founder). 2026-05-21 12:30 PM PST.
 *
 *  Color system (different from /enterprise — sports-skinned):
 *    Background    ECQO Ink         #0A0A0F
 *    Primary       Raiders Silver   #A5ACAF
 *    Warm / CTA    UNLV Burgundy    #B10202
 *    Clinical      HERR Magenta     #C42D8E
 *    Body type     ECQO Cream       #F4F1EB
 *
 *  Oracle number weaving:
 *    19 = "19 months in clinical development" (Slide 3 stat callout)
 *    77 = "77 trauma-informed safeguards" (Slide 3 stat callout)
 *    22 = "22-year clinical authority anchor" (Slide 1 caption)
 *    3  = 3-column / 3-card / 3-ask pattern echoing SEICon's 3-day rhythm
 *
 *  Scroll-snap on desktop, free scroll on mobile. Keyboard nav handled
 *  by the small SportsDeckNav client component (counter pill).
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import SportsDeckNav from './SportsDeckNav';

export const metadata: Metadata = {
  title: 'Sports Vertical — Enterprise AI Infrastructure | HERR by ECQO Holdings',
  description: 'AI Companions Are A Liability You Don\'t See Coming. Licensed clinical AI built by a federal SAMHSA advisor + retired professional athlete. WS1-WS6 safety architecture.',
};

// Palette
const INK         = '#0A0A0F';
const SILVER      = '#A5ACAF';
const SILVER_DIM  = 'rgba(165,172,175,0.55)';
const BURGUNDY    = '#B10202';
const MAGENTA     = '#C42D8E';
const CREAM       = '#F4F1EB';
const CREAM_MUTED = 'rgba(244,241,235,0.72)';
const HAIRLINE    = 'rgba(244,241,235,0.10)';

// Each slide takes at minimum a viewport, with scroll-snap on desktop.
const SLIDE_STYLE: React.CSSProperties = {
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '80px 24px',
  scrollSnapAlign: 'start',
  position: 'relative',
  borderBottom: `1px solid ${HAIRLINE}`,
};

const SLIDE_INNER: React.CSSProperties = {
  width: '100%',
  maxWidth: 1080,
  margin: '0 auto',
};

export default function SportsDeckPage() {
  return (
    <>
      <SportsDeckNav />
      {/* Scroll-snap container. `scroll-snap-type: y proximity` keeps mobile
          natural scroll usable while still landing on slides on desktop. */}
      <main style={{
        background: INK,
        color: CREAM,
        scrollSnapType: 'y proximity',
        overflowY: 'auto',
        height: '100vh',
      }}>

        {/* ═════════════ SLIDE 1 — HOOK ═════════════ */}
        <section id="slide-1" data-slide="1" style={SLIDE_STYLE}>
          <div style={SLIDE_INNER}>
            <p style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: SILVER, fontWeight: 700, margin: '0 0 28px' }}>
              For Sports Organizations
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(38px, 7vw, 78px)',
              fontWeight: 500,
              lineHeight: 1.02,
              letterSpacing: '-0.015em',
              margin: '0 0 18px',
              color: CREAM,
            }}>
              AI Companions Are A Liability You Don&apos;t See Coming.
            </h1>
            {/* Subliminal Raiders silver gradient drop-line under headline */}
            <div style={{
              height: 1.5,
              width: 220,
              background: `linear-gradient(90deg, ${SILVER}, rgba(165,172,175,0))`,
              margin: '0 0 28px',
            }} />
            <p style={{
              fontSize: 'clamp(17px, 2.4vw, 22px)',
              lineHeight: 1.5,
              color: SILVER,
              maxWidth: 820,
              margin: 0,
            }}>
              Athletes are using AI mental health tools without clinical governance. Your legal team is exposed. Your organization is one wellness app scandal away from a New York Times story.
            </p>

            {/* Founder credibility strip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              marginTop: 56, paddingTop: 22,
              borderTop: `1px solid ${HAIRLINE}`,
              flexWrap: 'wrap',
            }}>
              <div aria-hidden style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, rgba(165,172,175,0.35), rgba(165,172,175,0.05))',
                border: `1px solid ${SILVER_DIM}`,
                flexShrink: 0,
              }} />
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: CREAM }}>
                  Built by Bianca D. McCall, M.A., LMFT
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: SILVER_DIM, letterSpacing: '0.06em', lineHeight: 1.55 }}>
                  Federal SAMHSA Advisor · Retired Professional Athlete · 22-year clinical authority anchor · 30 years clinical practice
                </p>
              </div>
            </div>

            <a
              href="#slide-2"
              style={{ position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)', color: SILVER_DIM, fontSize: 11, letterSpacing: '0.2em', textDecoration: 'none', textTransform: 'uppercase' }}
            >
              ↓ Continue
            </a>
          </div>
        </section>

        {/* ═════════════ SLIDE 2 — LIABILITY PROBLEM ═════════════ */}
        <section id="slide-2" data-slide="2" style={SLIDE_STYLE}>
          <div style={SLIDE_INNER}>
            <p style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: BURGUNDY, fontWeight: 700, margin: '0 0 18px' }}>
              The Liability Surface
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(30px, 5.5vw, 54px)',
              fontWeight: 500,
              lineHeight: 1.05,
              margin: '0 0 38px',
              color: CREAM,
            }}>
              What Your Athletes Are Using Right Now.
            </h2>

            <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              <LiabilityColumn
                title="Generic ChatGPT Wrappers"
                items={[
                  'No clinical guardrails',
                  'Hallucinated mental health advice',
                  'Conversation data unprotected',
                  'HIPAA violations on entry',
                ]}
              />
              <LiabilityColumn
                title="Wellness Chatbots"
                items={[
                  'No licensed clinical sign-off',
                  'Crisis detection inconsistent',
                  'No audit trail for legal review',
                  'Marketing claims outpace clinical evidence',
                ]}
              />
              <LiabilityColumn
                title="Generic Therapy Apps"
                items={[
                  'Not trained on athlete identity transitions',
                  'No protocol for performance anxiety + clinical comorbidity',
                  'No safety overlay for high-profile users',
                  'One scandal away from organizational exposure',
                ]}
              />
            </div>

            <div style={{
              marginTop: 38,
              background: BURGUNDY,
              color: CREAM,
              padding: '20px 26px',
              borderRadius: 12,
              fontSize: 'clamp(15px, 2vw, 18px)',
              lineHeight: 1.55,
              fontWeight: 500,
            }}>
              Sports organizations are deploying these tools to their athletes today <strong>without compliance review</strong>. Every week without governance is exposure stacking.
            </div>
          </div>
        </section>

        {/* ═════════════ SLIDE 3 — ECQO'S WEDGE ═════════════ */}
        <section id="slide-3" data-slide="3" style={SLIDE_STYLE}>
          <div style={SLIDE_INNER}>
            <p style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: MAGENTA, fontWeight: 700, margin: '0 0 18px' }}>
              The Wedge
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(30px, 5vw, 52px)',
              fontWeight: 500,
              lineHeight: 1.05,
              margin: '0 0 36px',
              color: CREAM,
            }}>
              Why ECQO is the Only Clinical AI Your Legal Team Will Sign Off On.
            </h2>

            {/* Two-column compare. Stat callouts in the right column. */}
            <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {/* LEFT — muted, smaller */}
              <div style={{
                border: `1px solid ${HAIRLINE}`,
                borderRadius: 14,
                padding: 22,
                opacity: 0.78,
              }}>
                <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: SILVER, fontWeight: 600 }}>
                  Generic AI mental health tools
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'grid', gap: 10, color: SILVER, fontSize: 14, lineHeight: 1.55 }}>
                  <li>✗ No licensed clinician in the loop</li>
                  <li>✗ No safety architecture</li>
                  <li>✗ No audit log for litigation</li>
                  <li>✗ Generic content</li>
                  <li>✗ Trained on broad internet data</li>
                  <li>✗ No athlete identity protocol</li>
                </ul>
              </div>

              {/* RIGHT — magenta-accented, primary */}
              <div style={{
                border: `1px solid ${MAGENTA}`,
                borderRadius: 14,
                padding: 22,
                background: 'rgba(196,45,142,0.07)',
              }}>
                <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: MAGENTA, fontWeight: 700 }}>
                  ECQO Conversational AI Companion
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 22px', display: 'grid', gap: 10, color: CREAM, fontSize: 15, lineHeight: 1.55, fontWeight: 500 }}>
                  <li><span style={{ color: MAGENTA, fontWeight: 700 }}>✓</span> WS1–WS6 proprietary clinical architecture</li>
                  <li>
                    <span style={{ color: MAGENTA, fontWeight: 700 }}>✓</span>{' '}
                    <strong style={{ color: MAGENTA }}>77</strong> trauma-informed safeguards in the WS3 safety layer
                  </li>
                  <li><span style={{ color: MAGENTA, fontWeight: 700 }}>✓</span> Full agent_logs audit trail (HIPAA-aligned)</li>
                  <li><span style={{ color: MAGENTA, fontWeight: 700 }}>✓</span> ARAI therapeutic arc (Acknowledge / Reflect / Anchor / Invite)</li>
                  <li><span style={{ color: MAGENTA, fontWeight: 700 }}>✓</span> Bianca D. McCall, LMFT as named clinical lead</li>
                  <li>
                    <span style={{ color: MAGENTA, fontWeight: 700 }}>✓</span>{' '}
                    <strong style={{ color: MAGENTA }}>19</strong> months in clinical development
                  </li>
                  <li><span style={{ color: MAGENTA, fontWeight: 700 }}>✓</span> Built-in escalation to licensed clinicians</li>
                </ul>
              </div>
            </div>

            <p style={{ marginTop: 28, fontSize: 13, color: SILVER_DIM, lineHeight: 1.6, maxWidth: 760 }}>
              <em>ECQO Holdings Academic Press</em> is the publishing imprint behind the clinical IP. Trade-secret protected. Provisional patent in process.
            </p>
          </div>
        </section>

        {/* ═════════════ SLIDE 4 — ATHLETE USE CASES ═════════════ */}
        <section id="slide-4" data-slide="4" style={SLIDE_STYLE}>
          <div style={SLIDE_INNER}>
            <p style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: SILVER, fontWeight: 700, margin: '0 0 18px' }}>
              Inside The Product
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(30px, 5vw, 52px)',
              fontWeight: 500,
              lineHeight: 1.05,
              margin: '0 0 32px',
              color: CREAM,
            }}>
              What Athletes Hear From HERR.
            </h2>

            <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {/*
                SCREENSHOT SWAP INSTRUCTIONS — Bianca, Thursday AM:
                  Drop each PNG into /public/enterprise/sports/ with the
                  filename below. Each placeholder div renders an iPhone
                  14 aspect ratio (9:19.5) gray box; replace with <img>
                  pointing at /enterprise/sports/<filename>.
              */}
              {/* CARD 1 — Pre-Game / Workout (screenshot: screenshot-1-workout.png) */}
              <UseCaseCard
                title="Pre-Game / Workout Mode"
                body="Embodied power. Specific to this athlete's identity. Drawing on their core values. No generic motivational filler."
                screenshotFile="screenshot-1-workout.png"
              />
              {/* CARD 2 — Retirement (PROMINENT) (screenshot: screenshot-2-journey.png) */}
              <UseCaseCard
                title="Identity After Retirement"
                body="The hardest transition in sport. ECQO is built by someone who lived it. Bianca retired from professional basketball before her clinical career. This conversation is in the IP."
                screenshotFile="screenshot-2-journey.png"
                prominent
              />
              {/* CARD 3 — Recovery (screenshot: screenshot-3-healing.png) */}
              <UseCaseCard
                title="Recovery / Injury"
                body="Trauma-informed support during physical recovery. Existential framing of identity-when-the-body-fails."
                screenshotFile="screenshot-3-healing.png"
              />
              {/* CARD 4 — Performance Anxiety (screenshot: screenshot-4-companion.png) */}
              <UseCaseCard
                title="Performance Anxiety"
                body="Clinical-grade conversational support without pop-psychology language. ARAI arc grounds the athlete in their own anchors."
                screenshotFile="screenshot-4-companion.png"
              />
            </div>

            {/* Live demo CTA */}
            <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <a
                href="https://h3rr.com/dashboard/companion"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 12,
                  padding: '18px 36px', background: MAGENTA, color: '#FFFFFF',
                  borderRadius: 999, fontSize: 15, fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none',
                  boxShadow: '0 10px 32px rgba(196,45,142,0.32)',
                }}
              >
                Open Live Demo →
              </a>
              <p style={{ fontSize: 12, color: SILVER_DIM, margin: 0, letterSpacing: '0.08em' }}>
                Press to see the live product. Bianca will demo during the meeting.
              </p>
            </div>
          </div>
        </section>

        {/* ═════════════ SLIDE 5 — THREE WAYS TO PARTNER ═════════════ */}
        <section id="slide-5" data-slide="5" style={SLIDE_STYLE}>
          <div style={SLIDE_INNER}>
            <p style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: BURGUNDY, fontWeight: 700, margin: '0 0 18px' }}>
              The Ask
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(30px, 5vw, 52px)',
              fontWeight: 500,
              lineHeight: 1.05,
              margin: '0 0 36px',
              color: CREAM,
            }}>
              Three Concrete Ways You Can Shape ECQO&apos;s Sports Vertical.
            </h2>

            <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              <AskCard
                lead
                eyebrow="01 · The Stage"
                title="Innovation Hub or Session Lead at SEICon III"
                body="Mental health is already in your established 2026 track. ECQO is the only governed clinical AI built by a retired pro athlete who is also a federal SAMHSA advisor. Let me bring that to your stage at Bellagio, July 7-9."
              />
              <AskCard
                eyebrow="02 · The Pilot"
                title="Open a Door for a Pilot Conversation"
                body="Aces, Raiders, Knights, UFC, UNLV Athletics. One warm introduction. We bring the clinical infrastructure. They bring the athlete relationships."
              />
              <AskCard
                eyebrow="03 · The Credibility"
                title="Advisory / Endorsement"
                body="Advisory role with Sports Innovation Institute. Endorsement that adds Nevada-institutional credibility as ECQO scales nationally."
              />
            </div>

            {/* Sign-off + CTA */}
            <div style={{
              marginTop: 56,
              padding: '28px 24px',
              borderTop: `1px solid ${HAIRLINE}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              textAlign: 'center',
            }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: CREAM }}>
                Bianca D. McCall, M.A., LMFT
              </p>
              <p style={{ margin: 0, fontSize: 13, color: CREAM_MUTED, lineHeight: 1.7 }}>
                <a href="mailto:mccall.bianca@gmail.com?subject=Re%3A%20ECQO%20%2B%20Sports%20Vertical%20Conversation" style={{ color: CREAM_MUTED, textDecoration: 'none' }}>mccall.bianca@gmail.com</a>
                {' · '}
                888-982-9423
              </p>
              <p style={{ margin: 0, fontSize: 12, color: SILVER_DIM, letterSpacing: '0.08em' }}>
                ECQO Holdings · <Link href="/" style={{ color: SILVER_DIM, textDecoration: 'none' }}>h3rr.com</Link>
              </p>

              <a
                href="mailto:mccall.bianca@gmail.com?subject=Re%3A%20ECQO%20%2B%20Sports%20Vertical%20Conversation"
                style={{
                  marginTop: 12,
                  display: 'inline-flex', alignItems: 'center',
                  padding: '16px 36px', background: BURGUNDY, color: '#FFFFFF',
                  borderRadius: 999, fontSize: 14, fontWeight: 700,
                  letterSpacing: '0.16em', textTransform: 'uppercase', textDecoration: 'none',
                  boxShadow: '0 10px 28px rgba(177,2,2,0.30)',
                }}
              >
                Send Bianca A Message
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

// ────────────────────────────────────────────────────────────────

function LiabilityColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div style={{
      borderTop: `2px solid ${BURGUNDY}`,
      paddingTop: 18,
    }}>
      <p style={{ margin: 0, fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', color: CREAM, fontWeight: 700 }}>
        {title}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'grid', gap: 8, color: CREAM_MUTED, fontSize: 14, lineHeight: 1.55 }}>
        {items.map((i) => <li key={i}>· {i}</li>)}
      </ul>
    </div>
  );
}

function UseCaseCard({
  title, body, screenshotFile, prominent = false,
}: {
  title: string;
  body: string;
  screenshotFile: string;
  prominent?: boolean;
}) {
  return (
    <article style={{
      border: `1px solid ${prominent ? MAGENTA : HAIRLINE}`,
      background: prominent ? 'rgba(196,45,142,0.06)' : 'rgba(244,241,235,0.02)',
      borderRadius: 16,
      padding: 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      <p style={{ margin: 0, fontSize: prominent ? 18 : 16, fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, color: prominent ? MAGENTA : CREAM, lineHeight: 1.2 }}>
        {title}
      </p>
      <p style={{ margin: 0, fontSize: 13, color: CREAM_MUTED, lineHeight: 1.55 }}>
        {body}
      </p>
      {/*
        SCREENSHOT PLACEHOLDER — iPhone 14 aspect (9 / 19.5). When the
        PNG drops at /public/enterprise/sports/<file>, replace this div
        with: <img src={`/enterprise/sports/${screenshotFile}`} ... />
      */}
      <div
        aria-label={`Screenshot placeholder: ${screenshotFile}`}
        style={{
          width: '100%',
          aspectRatio: '9 / 19.5',
          background: '#1a1a20',
          border: `1px solid ${SILVER}`,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: SILVER_DIM,
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          textAlign: 'center',
          padding: 12,
          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        }}
      >
        [{screenshotFile}]
      </div>
    </article>
  );
}

function AskCard({
  eyebrow, title, body, lead = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  lead?: boolean;
}) {
  return (
    <article style={{
      borderTop: `3px solid ${lead ? BURGUNDY : HAIRLINE}`,
      background: lead ? 'rgba(177,2,2,0.06)' : 'rgba(244,241,235,0.02)',
      border: `1px solid ${lead ? 'rgba(177,2,2,0.45)' : HAIRLINE}`,
      borderRadius: 16,
      padding: '22px 20px',
      transform: lead ? 'translateY(-6px)' : 'none',
      boxShadow: lead ? '0 18px 40px rgba(177,2,2,0.18)' : 'none',
    }}>
      <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: lead ? BURGUNDY : SILVER, fontWeight: 700 }}>
        {eyebrow}
      </p>
      <h3 style={{
        margin: '10px 0 12px',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 22,
        fontWeight: 500,
        color: CREAM,
        lineHeight: 1.2,
      }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: 14, color: CREAM_MUTED, lineHeight: 1.6 }}>
        {body}
      </p>
    </article>
  );
}
