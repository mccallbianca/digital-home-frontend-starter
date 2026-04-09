'use client';

/**
 * AI Transparency Label (ECQO Security Layer — PART 6)
 *
 * EU AI Act + America's AI Action Plan compliance.
 * Displayed on all AI-generated content to ensure transparency.
 */

export default function AITransparencyLabel({
  mode,
  className = '',
}: {
  mode: 'affirmation' | 'progress_report' | 'onboarding';
  className?: string;
}) {
  const labels: Record<string, string> = {
    affirmation: 'AI-Generated Affirmation Script',
    progress_report: 'AI-Generated Progress Report',
    onboarding: 'AI-Assisted Onboarding',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 text-[0.65rem] tracking-[0.12em] uppercase text-[#6b6b8a] border border-[#1e1e2e] ${className}`}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-60">
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1"/>
        <text x="6" y="8.5" textAnchor="middle" fontSize="7" fill="currentColor">i</text>
      </svg>
      {labels[mode] || 'AI-Generated Content'} · HERR by ECQO Holdings
    </div>
  );
}
