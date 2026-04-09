'use client';

/**
 * NavigatingHERR — First-Load Onboarding Tutorial
 * =================================================
 * A step-by-step overlay that introduces each Dashboard
 * section on the user's first visit. Skippable and
 * re-accessible from My Profile.
 *
 * Stores completion in localStorage + Supabase profile.
 */

import { useState, useEffect } from 'react';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Inbox & Affirmations',
    description:
      'This is your daily delivery hub. Every morning, a new personalized affirmation — recorded in your own cloned voice — will appear here. Download, listen, and reprogram.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
      </svg>
    ),
    accent: 'var(--herr-pink)',
  },
  {
    title: 'My Progress',
    description:
      'Track your existential wellness over time. Retake the ECQO screener weekly or monthly to see your growth and recalibrate your affirmation content.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    accent: 'var(--herr-cobalt)',
  },
  {
    title: 'Live Events',
    description:
      'Monthly live group sessions with Bianca D. McCall, LMFT. Available exclusively for HERR Elite members. Upgrade anytime from your profile.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    accent: 'var(--herr-violet)',
  },
  {
    title: 'Community',
    description:
      'HERR Nation — your community of people committed to reprogramming their inner voice. Share wins, ask questions, and grow alongside each other.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    accent: 'var(--herr-pink)',
  },
  {
    title: 'My Profile',
    description:
      'Update your preferences, manage your subscription, change your voice settings, and access this tutorial again anytime.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    accent: 'var(--herr-cobalt)',
  },
];

interface NavigatingHERRProps {
  userId: string;
  onComplete: () => void;
}

export default function NavigatingHERR({ userId, onComplete }: NavigatingHERRProps) {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  function handleNext() {
    if (isLast) {
      handleDismiss();
    } else {
      setStep(prev => prev + 1);
    }
  }

  function handleDismiss() {
    setIsVisible(false);
    // Store completion
    localStorage.setItem(`herr_tutorial_complete_${userId}`, 'true');
    // Small delay for fade-out animation
    setTimeout(onComplete, 300);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[rgba(10,10,15,0.92)] backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-6 animate-fade-up">
        {/* Step indicator dots */}
        <div className="flex justify-center gap-2 mb-6">
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-8 bg-[var(--herr-pink)]'
                  : i < step
                    ? 'w-1.5 bg-[var(--herr-pink)] opacity-40'
                    : 'w-1.5 bg-[var(--herr-faint)]'
              }`}
            />
          ))}
        </div>

        {/* Content card */}
        <div className="bg-[var(--herr-surface)] border border-[var(--herr-border)] p-10">
          {/* Welcome header (only on first step) */}
          {step === 0 && (
            <div className="mb-8">
              <p className="herr-label text-[var(--herr-pink)] mb-3">Navigating HERR</p>
              <h2 className="font-display text-3xl font-light text-[var(--herr-white)] mb-2">
                Welcome to your Dashboard.
              </h2>
              <p className="text-[var(--herr-muted)] text-sm leading-relaxed">
                Let us show you around. This will only take a moment.
              </p>
              <div className="herr-divider mt-6" />
            </div>
          )}

          {/* Current step */}
          <div className="flex items-start gap-5">
            <div
              className="w-14 h-14 shrink-0 border flex items-center justify-center"
              style={{
                borderColor: `${current.accent}33`,
                color: current.accent,
              }}
            >
              {current.icon}
            </div>
            <div>
              <h3 className="font-display text-xl font-light text-[var(--herr-white)] mb-2">
                {current.title}
              </h3>
              <p className="text-[0.88rem] text-[var(--herr-muted)] leading-relaxed">
                {current.description}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={handleDismiss}
              className="text-[0.75rem] text-[var(--herr-faint)] hover:text-[var(--herr-muted)] transition-colors uppercase tracking-widest"
            >
              Skip Tour
            </button>

            <div className="flex items-center gap-4">
              {step > 0 && (
                <button
                  onClick={() => setStep(prev => prev - 1)}
                  className="text-[0.75rem] text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors uppercase tracking-widest"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="btn-herr-primary !py-2.5 !px-6 !text-[0.72rem]"
              >
                {isLast ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>

        {/* Step count */}
        <p className="text-center mt-4 text-[0.68rem] text-[var(--herr-faint)]">
          {step + 1} of {TUTORIAL_STEPS.length}
        </p>
      </div>
    </div>
  );
}
