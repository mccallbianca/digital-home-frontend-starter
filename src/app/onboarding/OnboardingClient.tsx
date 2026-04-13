'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import Link from 'next/link';

interface OnboardingClientProps {
  userId: string;
  displayName: string;
  plan: 'personalized' | 'elite' | 'collective' | null;
  fromScreener: boolean;
}

const TOTAL_STEPS = 4;

export default function OnboardingClient({
  userId,
  displayName,
  plan,
  fromScreener,
}: OnboardingClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(fromScreener ? 4 : 1);
  const [completing, setCompleting] = useState(false);

  const hasVoice = plan === 'personalized' || plan === 'elite';

  // Mark onboarding complete and redirect
  async function completeOnboarding() {
    setCompleting(true);
    await supabase.from('profiles').update({
      onboarding_complete: true,
    }).eq('id', userId);
    router.push('/dashboard?welcome=1');
  }

  // Trigger confetti on Step 4
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        const el = document.getElementById('confetti-container');
        if (el) el.classList.add('confetti-active');
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'rgba(255,255,255,0.08)',
          zIndex: 50,
        }}
      >
        <div
          style={{
            height: '100%',
            background: '#C42D8E',
            width: `${(step / TOTAL_STEPS) * 100}%`,
            transition: 'width 500ms ease',
          }}
        />
      </div>

      {/* Step indicator */}
      <p
        style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
          marginTop: 80,
          marginBottom: 24,
        }}
      >
        Step {step} of {TOTAL_STEPS}
      </p>

      {/* Card */}
      <div
        style={{
          maxWidth: 640,
          width: '100%',
          padding: '0 24px',
          position: 'relative',
        }}
      >
        {/* ── Step 1: Welcome ──────────────────────── */}
        {step === 1 && (
          <div
            style={{
              background: '#16161F',
              borderRadius: 16,
              padding: '48px 40px',
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 32,
                fontWeight: 600,
                color: '#FFFFFF',
                marginBottom: 16,
                lineHeight: 1.2,
              }}
            >
              Welcome to HERR
            </h1>
            <p
              style={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              You&apos;ve taken the first step toward reprogramming your inner voice.
              Over the next few minutes, we&apos;ll set up your personalized experience.
              This includes an existential assessment, your activity preferences, and
              {hasVoice
                ? ', if you\u2019re on Personalized or Elite, your voice clone setup.'
                : ' your daily affirmation content.'}
            </p>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.4)',
                fontStyle: 'italic',
                marginBottom: 32,
                lineHeight: 1.6,
              }}
            >
              Everything you share is private, encrypted, and never shared.
              HERR is HIPAA-aligned.
            </p>
            <button
              onClick={() => setStep(2)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: 48,
                background: '#C42D8E',
                color: '#FFFFFF',
                borderRadius: 12,
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'background 200ms ease',
              }}
            >
              Let&apos;s Begin
            </button>
          </div>
        )}

        {/* ── Step 2: Existential Screener Intro ──── */}
        {step === 2 && (
          <div
            style={{
              background: '#16161F',
              borderRadius: 16,
              padding: '48px 40px',
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 32,
                fontWeight: 600,
                color: '#FFFFFF',
                marginBottom: 16,
                lineHeight: 1.2,
              }}
            >
              The ECQO Assessment
            </h1>
            <p
              style={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.7,
                marginBottom: 16,
              }}
            >
              This is a brief existential screening, designed to surface what the
              conscious mind often hides. There are no wrong answers. Rate each
              statement on a scale that feels true to you right now.
            </p>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 32,
              }}
            >
              Takes approximately 3–5 minutes. You can retake this monthly.
            </p>
            <button
              onClick={() => {
                router.push('/dashboard/screener?fromOnboarding=1');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: 48,
                background: '#C42D8E',
                color: '#FFFFFF',
                borderRadius: 12,
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'background 200ms ease',
                marginBottom: 24,
              }}
            >
              Begin Assessment
            </button>
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.35)',
                lineHeight: 1.6,
                maxWidth: 520,
                margin: '0 auto',
              }}
            >
              This assessment is a wellness tool, not a clinical diagnostic.
              If you are in crisis, please call or text{' '}
              <a
                href="tel:988"
                style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}
              >
                988
              </a>
              . Results are used to personalize your HERR experience and are never
              shared with third parties.
            </p>
          </div>
        )}

        {/* ── Step 3: Assessment Redirect (handled by navigation) */}
        {step === 3 && (
          <div
            style={{
              background: '#16161F',
              borderRadius: 16,
              padding: '48px 40px',
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                margin: '0 auto 24px',
                borderRadius: '50%',
                border: '2px solid #C42D8E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'spin 1.2s linear infinite',
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#C42D8E',
                }}
              />
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              Redirecting to assessment...
            </p>
          </div>
        )}

        {/* ── Step 4: Setup Complete ───────────────── */}
        {step === 4 && (
          <div
            style={{
              background: '#16161F',
              borderRadius: 16,
              padding: '48px 40px',
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Confetti container */}
            <div id="confetti-container" className="confetti-container">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="confetti-piece"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.8}s`,
                    background: i % 3 === 0 ? '#C42D8E' : i % 3 === 1 ? '#E8388A' : '#F4F1EB',
                  }}
                />
              ))}
            </div>

            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 32,
                fontWeight: 600,
                color: '#FFFFFF',
                marginBottom: 16,
                lineHeight: 1.2,
              }}
            >
              You&apos;re Ready
            </h1>
            <p
              style={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              Your HERR experience has been personalized based on your assessment.
              Your first affirmation is being prepared.
            </p>

            {hasVoice && (
              <div style={{ marginBottom: 16 }}>
                <p
                  style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: 12,
                  }}
                >
                  Set up your voice clone to receive affirmations in your own voice.
                </p>
                <Link
                  href="/dashboard/voice-setup"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: 48,
                    background: 'transparent',
                    color: '#FFFFFF',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontSize: 14,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'border-color 200ms ease',
                    marginBottom: 12,
                  }}
                >
                  Set Up Voice Clone
                </Link>
              </div>
            )}

            <button
              onClick={completeOnboarding}
              disabled={completing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: 48,
                background: '#C42D8E',
                color: '#FFFFFF',
                borderRadius: 12,
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: completing ? 'default' : 'pointer',
                opacity: completing ? 0.6 : 1,
                transition: 'background 200ms ease, opacity 200ms ease',
              }}
            >
              {completing ? 'Setting Up...' : 'Go to Dashboard'}
            </button>
          </div>
        )}
      </div>

      {/* Confetti + spinner styles */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .confetti-piece {
          position: absolute;
          top: -10px;
          width: 6px;
          height: 10px;
          border-radius: 2px;
          opacity: 0;
          transform: translateY(0);
        }
        .confetti-active .confetti-piece {
          animation: confettiFall 2s ease-out forwards;
        }
        @keyframes confettiFall {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(320px) rotate(720deg);
          }
        }
      `}</style>
    </main>
  );
}
