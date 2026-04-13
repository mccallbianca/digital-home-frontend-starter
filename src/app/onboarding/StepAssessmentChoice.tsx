'use client';

/**
 * StepAssessmentChoice — Pre-Assessment Path Selection
 * =====================================================
 * Lets the user choose between:
 *   - "Guide me through it" → AI conversational assessment (WS2)
 *   - "Take me straight through" → Click-through Likert form (fallback)
 *
 * Both paths collect identical clinical data and produce
 * the same ECQO Risk Index.
 */

interface StepAssessmentChoiceProps {
  userName: string;
  onChoose: (path: 'conversational' | 'clickthrough') => void;
}

export default function StepAssessmentChoice({ userName, onChoose }: StepAssessmentChoiceProps) {
  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--herr-white)] mb-3">
        How would you like to begin, {userName}?
      </h2>
      <p className="text-[var(--herr-muted)] mb-12 leading-relaxed max-w-lg">
        Your HERR assessment builds a personalized profile from 6 core questions.
        Choose the experience that feels right for you.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Conversational AI Path */}
        <button
          onClick={() => onChoose('conversational')}
          className="group text-left border border-[var(--herr-border)] bg-[var(--herr-surface)] p-8 transition-all duration-300 hover:border-[var(--herr-pink)] hover:bg-[rgba(217,70,239,0.04)]"
        >
          {/* Icon */}
          <div className="w-12 h-12 mb-6 border border-[var(--herr-border-mid)] flex items-center justify-center group-hover:border-[var(--herr-pink)] transition-colors">
            <svg className="w-6 h-6 text-[var(--herr-pink)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>

          <p className="herr-label text-[var(--herr-pink)] mb-2">Recommended</p>
          <h3 className="font-display text-2xl font-light text-[var(--herr-white)] mb-3 group-hover:text-[var(--herr-pink)] transition-colors">
            Guide me through it.
          </h3>
          <p className="text-[0.88rem] text-[var(--herr-muted)] leading-relaxed mb-4">
            Have a brief conversation with HERR. The AI will walk you through each question naturally,
            adapting to your responses in real time.
          </p>
          <p className="text-[0.75rem] text-[var(--herr-faint)]">
            ~5-8 minutes &middot; Conversational &middot; Adaptive
          </p>
        </button>

        {/* Click-through Form Path */}
        <button
          onClick={() => onChoose('clickthrough')}
          className="group text-left border border-[var(--herr-border)] bg-[var(--herr-surface)] p-8 transition-all duration-300 hover:border-[var(--herr-cobalt)] hover:bg-[rgba(37,99,235,0.04)]"
        >
          {/* Icon */}
          <div className="w-12 h-12 mb-6 border border-[var(--herr-border-mid)] flex items-center justify-center group-hover:border-[var(--herr-cobalt)] transition-colors">
            <svg className="w-6 h-6 text-[var(--herr-cobalt)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>

          <p className="herr-label text-[var(--herr-cobalt)] mb-2">Quick</p>
          <h3 className="font-display text-2xl font-light text-[var(--herr-white)] mb-3 group-hover:text-[var(--herr-cobalt)] transition-colors">
            Take me straight through.
          </h3>
          <p className="text-[0.88rem] text-[var(--herr-muted)] leading-relaxed mb-4">
            Answer each question on a simple scale. Same questions, same clinical accuracy,
            just faster.
          </p>
          <p className="text-[0.75rem] text-[var(--herr-faint)]">
            ~2-3 minutes &middot; Click-through &middot; Direct
          </p>
        </button>
      </div>
    </div>
  );
}
