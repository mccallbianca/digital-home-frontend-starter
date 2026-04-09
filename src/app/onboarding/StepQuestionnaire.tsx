'use client';

import { useState } from 'react';

// Domain mapping for debrief summary
// Domains: Meaning & Purpose (Q1,Q2), Death & Mortality (Q3), Freedom & Responsibility (Q4),
// Isolation & Connection (Q5), Identity & Authenticity (Q6), Perturbation & Vitality (Q7,Q8)
const DOMAINS = [
  { name: 'Meaning & Purpose', questions: [0, 1] },
  { name: 'Mortality & Peace', questions: [2] },
  { name: 'Freedom & Responsibility', questions: [3] },
  { name: 'Connection & Belonging', questions: [4] },
  { name: 'Identity & Authenticity', questions: [5] },
  { name: 'Vitality & Presence', questions: [6, 7] },
];

const QUESTIONS = [
  'How often do you reflect on the meaning or purpose of your life?',
  'How often do you feel connected to something larger than yourself — whether spiritual, communal, or philosophical?',
  'How often do you feel at peace when thinking about the uncertainty of your future?',
  'How often do you feel like you are actively driving the direction of your life rather than life happening to you?',
  'How often do feelings of isolation or disconnection affect your daily experience?',
  'How often do you feel a clear sense of who you are outside of your roles and responsibilities?',
  'How often do you feel at ease with the reality of your own mortality?',
  'How frequently do you experience a sense of aliveness, vitality, or deep presence?',
];

// Q5 is reverse-scored (isolation = higher frequency means more concern, not less)
const REVERSE_SCORED = [4];

const LIKERT = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Always' },
];

const TIER_LABELS: Record<string, { label: string; color: string; description: string }> = {
  low: {
    label: 'Low Concern',
    color: 'var(--herr-cobalt)',
    description: 'Your responses suggest a grounded relationship with existential themes. HERR will meet you with growth-oriented, aspirational reprogramming across all your selected activity modes.',
  },
  moderate: {
    label: 'Moderate Unease',
    color: 'var(--herr-pink)',
    description: 'Your responses suggest some areas where you\'re navigating real tension. HERR will start with grounding-focused affirmations before building toward aspirational content — stability before growth.',
  },
  elevated: {
    label: 'Elevated Disruption',
    color: '#EF4444',
    description: 'Your responses indicate areas of significant concern. Before building your program, we want to make sure you have the right support. A member of our team may reach out to you personally.',
  },
};

function getDomainAverage(responses: Record<number, number>, questionIndices: number[]): number {
  let sum = 0;
  let count = 0;
  for (const idx of questionIndices) {
    if (responses[idx] !== undefined) {
      // Reverse score isolation question
      const val = REVERSE_SCORED.includes(idx) ? (6 - responses[idx]) : responses[idx];
      sum += val;
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

function getOverallTier(responses: Record<number, number>): string {
  let total = 0;
  let count = 0;
  for (let i = 0; i < QUESTIONS.length; i++) {
    if (responses[i] !== undefined) {
      const val = REVERSE_SCORED.includes(i) ? (6 - responses[i]) : responses[i];
      total += val;
      count++;
    }
  }
  const avg = count > 0 ? total / count : 3;
  if (avg >= 3.5) return 'low';
  if (avg >= 2.2) return 'moderate';
  return 'elevated';
}

export default function StepQuestionnaire({
  responses,
  onChange,
}: {
  responses: Record<number, number>;
  onChange: (responses: Record<number, number>) => void;
}) {
  const [showDebrief, setShowDebrief] = useState(false);
  const allAnswered = Object.keys(responses).length === QUESTIONS.length;

  function handleSelect(questionIndex: number, value: number) {
    onChange({ ...responses, [questionIndex]: value });
  }

  function handleViewResults() {
    setShowDebrief(true);
  }

  // Debrief / results view
  if (showDebrief) {
    const tier = getOverallTier(responses);
    const tierInfo = TIER_LABELS[tier];

    return (
      <div>
        <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--herr-white)] mb-3">
          Your Existential Profile.
        </h2>
        <p className="text-[var(--herr-muted)] mb-8 leading-relaxed">
          Here&apos;s what your responses tell us about your current relationship with core existential themes.
          This is not a diagnosis — it&apos;s the foundation for how HERR personalizes your experience.
        </p>

        {/* Overall tier */}
        <div className="border p-6 mb-8" style={{ borderColor: tierInfo.color }}>
          <p className="herr-label mb-2" style={{ color: tierInfo.color }}>
            Overall Assessment
          </p>
          <p className="font-display text-2xl text-[var(--herr-white)] mb-3">
            {tierInfo.label}
          </p>
          <p className="text-[var(--herr-muted)] text-sm leading-relaxed">
            {tierInfo.description}
          </p>
        </div>

        {/* Domain breakdown */}
        <div className="space-y-4 mb-8">
          {DOMAINS.map(domain => {
            const avg = getDomainAverage(responses, domain.questions);
            const pct = (avg / 5) * 100;
            return (
              <div key={domain.name}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[var(--herr-muted)]">{domain.name}</p>
                  <p className="text-sm text-[var(--herr-white)]">{avg.toFixed(1)} / 5</p>
                </div>
                <div className="w-full h-2 bg-[var(--herr-surface)] overflow-hidden">
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: avg >= 3.5 ? 'var(--herr-cobalt)' : avg >= 2.2 ? 'var(--herr-pink)' : '#EF4444',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[0.78rem] text-[var(--herr-muted)] leading-relaxed mb-4">
          Your domain scores shape the tone, depth, and sequencing of your personalized affirmation scripts.
          Lower scores in a domain mean HERR will prioritize grounding and safety in that area before building toward growth.
        </p>

        <button
          onClick={() => setShowDebrief(false)}
          className="text-[0.78rem] text-[var(--herr-faint)] hover:text-[var(--herr-white)] transition-colors"
        >
          ← Review your answers
        </button>

        <p className="mt-8 text-[0.72rem] text-[var(--herr-faint)] leading-relaxed">
          This assessment is a wellness screening tool and does not constitute a clinical diagnosis.
          Results are used exclusively to personalize your HERR affirmation protocol.
        </p>
      </div>
    );
  }

  // Questionnaire view
  return (
    <div>
      <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--herr-white)] mb-3">
        Existential Concerns.
      </h2>
      <p className="text-[var(--herr-muted)] mb-10 leading-relaxed">
        These 8 questions help us understand your current relationship with core existential themes.
        There are no right or wrong answers.
      </p>

      <div className="space-y-10">
        {QUESTIONS.map((question, idx) => (
          <div key={idx}>
            <p className="text-[var(--herr-white)] mb-4 leading-relaxed">
              <span className="text-[var(--herr-pink)] font-display text-lg mr-2">{idx + 1}.</span>
              {question}
            </p>
            <div className="flex flex-wrap gap-2">
              {LIKERT.map(option => {
                const isSelected = responses[idx] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(idx, option.value)}
                    className={`px-4 py-2 text-sm border transition-all duration-200 ${
                      isSelected
                        ? 'bg-[var(--herr-pink)] border-[var(--herr-pink)] text-[var(--herr-black)] font-medium'
                        : 'bg-transparent border-[var(--herr-border-mid)] text-[var(--herr-muted)] hover:border-[var(--herr-white)] hover:text-[var(--herr-white)]'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {allAnswered && (
        <div className="mt-10 text-center">
          <button
            onClick={handleViewResults}
            className="btn-herr-ghost"
          >
            View Your Profile →
          </button>
        </div>
      )}

      <p className="mt-10 text-[0.72rem] text-[var(--herr-faint)] leading-relaxed">
        This assessment is a wellness screening tool and does not constitute a clinical diagnosis.
        Results are used exclusively to personalize your HERR affirmation protocol.
      </p>
    </div>
  );
}
