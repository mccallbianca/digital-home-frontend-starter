'use client';

/**
 * ProgressChart — Simple bar chart comparing current vs previous month scores
 */

interface ProgressChartProps {
  current: Record<string, number>;
  previous: Record<string, number> | null;
  growthSummary: string | null;
}

const DOMAIN_LABELS: Record<number, string> = {
  0: 'Meaning',
  1: 'Connection',
  2: 'Uncertainty',
  3: 'Inner Voice',
  4: 'Isolation',
  5: 'Identity',
  6: 'Mortality',
  7: 'Aliveness',
};

export default function ProgressChart({ current, previous, growthSummary }: ProgressChartProps) {
  const questions = Object.keys(current).map(Number).sort((a, b) => a - b);

  return (
    <div>
      {/* Bar chart */}
      <div className="space-y-4 mb-10">
        {questions.map(q => {
          const curr = current[q] || 0;
          const prev = previous?.[String(q)] ? Number(previous[String(q)]) : null;
          const pctCurr = (curr / 5) * 100;
          const pctPrev = prev !== null ? (prev / 5) * 100 : 0;
          const change = prev !== null ? curr - prev : null;

          return (
            <div key={q}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[0.82rem] text-[var(--herr-ink)]">
                  {DOMAIN_LABELS[q] || `Q${q + 1}`}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-[0.75rem] text-[rgba(26,15,26,0.6)]">{curr}/5</span>
                  {change !== null && change !== 0 && (
                    <span className={`text-[0.7rem] font-medium ${
                      change > 0 ? 'text-[#22C55E]' : 'text-[var(--herr-magenta)]'
                    }`}>
                      {change > 0 ? '+' : ''}{change}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-3 bg-[var(--herr-cream)] overflow-hidden">
                {/* Previous month (faint) */}
                {prev !== null && (
                  <div
                    className="absolute h-full bg-[var(--herr-magenta)] opacity-25 transition-all duration-700"
                    style={{ width: `${pctPrev}%` }}
                  />
                )}
                {/* Current month */}
                <div
                  className="absolute h-full bg-[var(--herr-magenta)] transition-all duration-700"
                  style={{ width: `${pctCurr}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[var(--herr-magenta)]" />
          <span className="text-[0.72rem] text-[rgba(26,15,26,0.6)]">Current Month</span>
        </div>
        {previous && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[var(--herr-magenta)] opacity-40" />
            <span className="text-[0.72rem] text-[rgba(26,15,26,0.6)]">Previous Month</span>
          </div>
        )}
      </div>

      {/* Growth summary */}
      {growthSummary && (
        <div className="border border-[rgba(26,15,26,0.08)] p-6">
          <p className="herr-label text-[var(--herr-magenta)] mb-3">Growth Summary</p>
          <div className="text-[0.88rem] text-[rgba(26,15,26,0.6)] leading-relaxed whitespace-pre-wrap">
            {growthSummary}
          </div>
        </div>
      )}
    </div>
  );
}
