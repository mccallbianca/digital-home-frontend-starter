'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

/* ─── Question Bank: 5 domains × 3 questions = 15 ──────────── */
const QUESTIONS = [
  // Meaning (0–2)
  { text: 'I often wonder if my life has real meaning or purpose.', domain: 'meaning' },
  { text: 'I struggle to find significance in my day-to-day activities.', domain: 'meaning' },
  { text: 'I question whether I am contributing anything of lasting value.', domain: 'meaning' },
  // Identity (3–5)
  { text: 'I feel uncertain about who I truly am beneath the roles I play.', domain: 'identity' },
  { text: 'I rely on the opinions of others to define my sense of self.', domain: 'identity' },
  { text: 'I have difficulty separating my identity from my achievements.', domain: 'identity' },
  // Freedom (6–8)
  { text: 'I feel overwhelmed by the number of choices available to me.', domain: 'freedom' },
  { text: 'I avoid making important decisions out of fear of choosing wrong.', domain: 'freedom' },
  { text: 'I struggle with the responsibility that comes with personal freedom.', domain: 'freedom' },
  // Isolation (9–11)
  { text: 'I often feel deeply alone, even when surrounded by others.', domain: 'isolation' },
  { text: 'I find it difficult to feel truly understood by the people in my life.', domain: 'isolation' },
  { text: 'I crave a deeper sense of belonging but cannot find it.', domain: 'isolation' },
  // Mortality (12–14)
  { text: 'I am preoccupied with thoughts about death or dying.', domain: 'mortality' },
  { text: 'I worry about what I will leave behind when I am gone.', domain: 'mortality' },
  { text: 'I find it difficult to accept the limited time I have in life.', domain: 'mortality' },
];

const LIKERT = [
  { value: 1, label: 'Not at all' },
  { value: 2, label: 'A little' },
  { value: 3, label: 'Moderately' },
  { value: 4, label: 'Quite a bit' },
  { value: 5, label: 'Very much' },
];

interface ScreenerClientProps {
  userId: string;
  plan: string | null;
  fromOnboarding: boolean;
}

export default function ScreenerClient({ userId, fromOnboarding }: ScreenerClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);
  const [crisisShown, setCrisisShown] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);

  const total = QUESTIONS.length;
  const question = QUESTIONS[current];
  const selected = responses[current] ?? null;

  const handleSelect = useCallback((value: number) => {
    setResponses(prev => ({ ...prev, [current]: value }));

    // Crisis detection: mortality domain, score 5
    if (question.domain === 'mortality' && value === 5 && !crisisShown) {
      setShowCrisis(true);
      setCrisisShown(true);
      // Log crisis flag (table may not exist yet — non-blocking)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from('crisis_flags').insert({
        user_id: userId,
        question_index: current,
        score: value,
        domain: 'mortality',
      }).then(() => { /* non-blocking */ });
    }
  }, [current, question.domain, crisisShown, userId, supabase]);

  const handleNext = useCallback(async () => {
    if (current < total - 1) {
      setCurrent(prev => prev + 1);
      return;
    }

    // Final question — save and redirect
    setSaving(true);
    try {
      // Delete old responses
      await supabase.from('existential_responses').delete().eq('user_id', userId);

      // Insert new responses
      const rows = Object.entries(responses).map(([idx, val]) => ({
        user_id: userId,
        question_index: parseInt(idx),
        response: val,
      }));
      await supabase.from('existential_responses').insert(rows);

      if (fromOnboarding) {
        router.push('/onboarding?fromScreener=1');
      } else {
        router.push('/dashboard/screener/results');
      }
    } catch {
      setSaving(false);
    }
  }, [current, total, responses, userId, fromOnboarding, router, supabase]);

  const handleBack = useCallback(() => {
    if (current > 0) setCurrent(prev => prev - 1);
  }, [current]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '80px 24px 60px',
      }}
    >
      {/* Crisis modal */}
      {showCrisis && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              background: '#16161F',
              borderRadius: 16,
              padding: 32,
              border: '2px solid #C42D8E',
              maxWidth: 480,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 24,
                color: '#FFFFFF',
                marginBottom: 12,
              }}
            >
              We noticed your response may indicate distress.
            </p>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
              You are not alone.
            </p>
            <p style={{ fontSize: 15, color: '#E8388A', fontWeight: 600, marginBottom: 4 }}>
              If you are in crisis, please call or text 988
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
              Suicide &amp; Crisis Lifeline
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
              You can also text HOME to 741741 (Crisis Text Line)
            </p>
            <button
              onClick={() => setShowCrisis(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 48,
                padding: '0 32px',
                background: 'transparent',
                color: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.3)',
                fontSize: 14,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
              }}
            >
              Continue Assessment
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ maxWidth: 640, width: '100%', textAlign: 'center', marginBottom: 32 }}>
        <p
          style={{
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#C42D8E',
            marginBottom: 8,
          }}
        >
          ECQO ASSESSMENT
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 28,
            fontWeight: 600,
            color: '#FFFFFF',
            marginBottom: 8,
          }}
        >
          Existential Concerns Questionnaire
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
          Question {current + 1} of {total}
        </p>

        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: 4,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: '#C42D8E',
              width: `${((current + 1) / total) * 100}%`,
              transition: 'width 400ms ease',
              borderRadius: 2,
            }}
          />
        </div>

        {current === 0 && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 16, fontStyle: 'italic' }}>
            Your responses are confidential and used solely to personalize your HERR experience.
          </p>
        )}
      </div>

      {/* Question card */}
      <div
        style={{
          maxWidth: 640,
          width: '100%',
          background: '#16161F',
          borderRadius: 16,
          padding: 'clamp(24px, 5vw, 40px) clamp(20px, 4vw, 32px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <p
          style={{
            fontSize: 18,
            color: '#FFFFFF',
            lineHeight: 1.6,
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          {question.text}
        </p>

        {/* Likert scale */}
        <div className="likert-row" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
          {LIKERT.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`likert-btn${selected === opt.value ? ' likert-selected' : ''}`}
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                border: selected === opt.value ? '2px solid #C42D8E' : '1px solid rgba(255,255,255,0.15)',
                background: selected === opt.value ? '#C42D8E' : '#111118',
                color: selected === opt.value ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                fontSize: 20,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 200ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {opt.value}
            </button>
          ))}
        </div>

        {/* Likert labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Not at all</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Very much</span>
        </div>
      </div>

      {/* Navigation */}
      <div
        style={{
          maxWidth: 640,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 24,
        }}
      >
        <button
          onClick={handleBack}
          disabled={current === 0}
          style={{
            height: 48,
            padding: '0 32px',
            background: 'transparent',
            color: current === 0 ? 'rgba(255,255,255,0.2)' : '#FFFFFF',
            borderRadius: 12,
            border: '1px solid',
            borderColor: current === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
            fontSize: 14,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: current === 0 ? 'default' : 'pointer',
          }}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={selected === null || saving}
          style={{
            height: 48,
            padding: '0 32px',
            background: selected === null ? 'rgba(196,45,142,0.3)' : '#C42D8E',
            color: '#FFFFFF',
            borderRadius: 12,
            border: 'none',
            fontSize: 14,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: selected === null ? 'default' : 'pointer',
            opacity: selected === null ? 0.5 : 1,
            transition: 'opacity 200ms ease',
          }}
        >
          {saving ? 'Saving...' : current === total - 1 ? 'Complete Assessment' : 'Next'}
        </button>
      </div>

      <style>{`
        .likert-selected {
          animation: ratingPop 200ms ease;
        }
        @keyframes ratingPop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @media (max-width: 480px) {
          .likert-btn {
            width: 48px !important;
            height: 48px !important;
            font-size: 16px !important;
          }
          .likert-row {
            gap: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
