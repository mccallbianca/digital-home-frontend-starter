'use client';

/**
 * StepDebrief — WS2 Phase 1 Results Screen
 * Shows the ECQO Risk Index, domain scores, and tier assignment
 * after the conversational baseline profile is complete.
 */

interface Assessment {
  ecqo_risk_index: number;
  risk_tier: string;
  domain_scores: Record<string, number>;
  ecq_mean?: number;
  pesas_mean?: number;
  maps_inverse_mean?: number;
}

const TIER_DISPLAY: Record<string, { label: string; color: string; description: string }> = {
  LOW_CONCERN: {
    label: 'Low Concern',
    color: 'var(--herr-cobalt)',
    description: 'Your responses suggest a grounded relationship with existential themes. HERR will meet you with growth-oriented, aspirational reprogramming across all your selected activity modes.',
  },
  MODERATE_UNEASE: {
    label: 'Moderate Unease',
    color: 'var(--herr-pink)',
    description: 'Your responses suggest some areas where you\'re navigating real tension. HERR will start with grounding-focused affirmations before building toward aspirational content, stability before growth.',
  },
  ELEVATED_DISRUPTION: {
    label: 'Elevated Disruption',
    color: '#EF4444',
    description: 'Your responses indicate areas of significant concern. Before building your program, we want to make sure you have the right support. A member of our team will reach out to you personally.',
  },
};

const DOMAIN_LABELS: Record<string, { label: string; description: string }> = {
  meaning:       { label: 'Meaning & Purpose',        description: 'Your sense of what gives your life direction' },
  isolation:     { label: 'Connection & Belonging',    description: 'How deeply known you feel by the people in your life' },
  death:         { label: 'Mortality & Peace',         description: 'Your relationship with uncertainty about the future' },
  freedom:       { label: 'Freedom & Responsibility',  description: 'How much you feel in the driver\'s seat of your life' },
  identity:      { label: 'Identity & Authenticity',   description: 'How clearly you know who you are at your core' },
  perturbation:  { label: 'Vitality & Presence',       description: 'Your current sense of inner peace and stability' },
};

export default function StepDebrief({
  assessment,
  onContinue,
}: {
  assessment: Assessment;
  onContinue: () => void;
}) {
  const tier = TIER_DISPLAY[assessment.risk_tier] || TIER_DISPLAY.LOW_CONCERN;

  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--herr-white)] mb-3">
        Your Existential Profile.
      </h2>
      <p className="text-[var(--herr-muted)] mb-8 leading-relaxed">
        Here&apos;s what your responses tell us about your current relationship with core existential themes.
        This is not a diagnosis, it&apos;s the foundation for how HERR personalizes your experience.
      </p>

      {/* Overall tier card */}
      <div className="border p-6 mb-8" style={{ borderColor: tier.color }}>
        <p className="herr-label mb-2" style={{ color: tier.color }}>
          Overall Assessment
        </p>
        <p className="font-display text-2xl text-[var(--herr-white)] mb-1">
          {tier.label}
        </p>
        <p className="text-[var(--herr-faint)] text-xs mb-3 font-mono">
          ECQO Risk Index: {assessment.ecqo_risk_index.toFixed(2)}
        </p>
        <p className="text-[var(--herr-muted)] text-sm leading-relaxed">
          {tier.description}
        </p>
      </div>

      {/* Domain breakdown */}
      <div className="space-y-5 mb-10">
        {Object.entries(assessment.domain_scores).map(([key, score]) => {
          const domain = DOMAIN_LABELS[key];
          if (!domain) return null;

          // For display: normalize score to 0-100% (scores are 1-5)
          // Lower risk score = better, so we invert for the visual bar
          const displayScore = key === 'perturbation'
            ? (score / 10) * 100     // Q6 is 1-10 scale
            : (score / 5) * 100;     // Others are 1-5 scale

          const barColor = displayScore >= 70
            ? 'var(--herr-cobalt)'
            : displayScore >= 40
              ? 'var(--herr-pink)'
              : '#EF4444';

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <p className="text-sm text-[var(--herr-white)]">{domain.label}</p>
                  <p className="text-[0.72rem] text-[var(--herr-faint)]">{domain.description}</p>
                </div>
                <p className="text-sm text-[var(--herr-white)] font-mono ml-4 shrink-0">
                  {score.toFixed(1)}
                </p>
              </div>
              <div className="w-full h-2 bg-[var(--herr-surface)] overflow-hidden">
                <div
                  className="h-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.max(5, displayScore)}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Instrument breakdown (subtle) */}
      {(assessment.ecq_mean || assessment.pesas_mean || assessment.maps_inverse_mean) && (
        <div className="border border-[var(--herr-border)] p-4 mb-8">
          <p className="herr-label text-[var(--herr-faint)] mb-3">Instrument Composite</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[0.68rem] text-[var(--herr-faint)]">ECQ</p>
              <p className="text-sm text-[var(--herr-white)] font-mono">{assessment.ecq_mean?.toFixed(2) ?? '—'}</p>
            </div>
            <div>
              <p className="text-[0.68rem] text-[var(--herr-faint)]">PeSAS</p>
              <p className="text-sm text-[var(--herr-white)] font-mono">{assessment.pesas_mean?.toFixed(2) ?? '—'}</p>
            </div>
            <div>
              <p className="text-[0.68rem] text-[var(--herr-faint)]">MAPS (inv)</p>
              <p className="text-sm text-[var(--herr-white)] font-mono">{assessment.maps_inverse_mean?.toFixed(2) ?? '—'}</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-[0.78rem] text-[var(--herr-muted)] leading-relaxed mb-6">
        Your domain scores shape the tone, depth, and sequencing of your personalized affirmation scripts.
        Lower scores in a domain mean HERR will prioritize grounding and safety in that area before building toward growth.
      </p>

      {/* Continue button */}
      <div className="flex justify-end">
        <button onClick={onContinue} className="btn-herr-primary">
          Continue
        </button>
      </div>

      <p className="mt-8 text-[0.68rem] text-[var(--herr-faint)] leading-relaxed">
        This assessment is a wellness screening tool and does not constitute a clinical diagnosis.
        Results are used exclusively to personalize your HERR affirmation protocol.
      </p>
    </div>
  );
}
