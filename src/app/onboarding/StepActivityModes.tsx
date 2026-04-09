'use client';

const MODES = [
  { id: 'workout',     label: 'Workout',         description: 'Push harder. Declare your strength.' },
  { id: 'driving',     label: 'Driving',          description: 'Move with intention. Own your direction.' },
  { id: 'sleep',       label: 'Sleep',            description: 'Rest and reprogram. Let your subconscious receive.' },
  { id: 'morning',     label: 'Morning',          description: 'Start from power. Set the tone for your day.' },
  { id: 'deep-work',   label: 'Deep Work',        description: 'Focus is a declaration. Protect your output.' },
  { id: 'love-family', label: 'Love + Family',    description: 'Anchor your heart. Speak love into your people.' },
  { id: 'abundance',   label: 'Abundance',        description: 'Wealth is a mindset. Claim it daily.' },
  { id: 'healing',     label: 'Healing',          description: 'Meet yourself with grace. You are becoming.' },
];

const ICONS: Record<string, string> = {
  workout:     '💪',
  driving:     '🚗',
  sleep:       '🌙',
  morning:     '☀️',
  'deep-work': '🎯',
  'love-family': '❤️',
  abundance:   '✨',
  healing:     '🕊️',
};

export default function StepActivityModes({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (modes: string[]) => void;
}) {
  function toggleMode(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter(m => m !== id));
    } else if (selected.length < 3) {
      onChange([...selected, id]);
    }
  }

  return (
    <div>
      <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--herr-white)] mb-3">
        Choose your activity modes.
      </h2>
      <p className="text-[var(--herr-muted)] mb-2 leading-relaxed">
        Select up to 3 activity modes for your daily affirmations. You can change these anytime.
      </p>
      <p className="herr-label text-[var(--herr-pink)] mb-10">
        {selected.length}/3 selected
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        {MODES.map(mode => {
          const isSelected = selected.includes(mode.id);
          const isDisabled = !isSelected && selected.length >= 3;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => toggleMode(mode.id)}
              disabled={isDisabled}
              className={`flex items-start gap-4 p-5 border text-left transition-all duration-200 ${
                isSelected
                  ? 'bg-[var(--herr-surface)] border-[var(--herr-pink)]'
                  : isDisabled
                    ? 'bg-[var(--herr-black)] border-[var(--herr-border)] opacity-40 cursor-not-allowed'
                    : 'bg-[var(--herr-black)] border-[var(--herr-border)] hover:border-[var(--herr-border-mid)] hover:bg-[var(--herr-surface)]'
              }`}
            >
              <span className="text-2xl shrink-0 mt-0.5">{ICONS[mode.id]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-medium text-sm ${isSelected ? 'text-[var(--herr-white)]' : 'text-[var(--herr-muted)]'}`}>
                    {mode.label}
                  </p>
                  {isSelected && (
                    <span className="w-4 h-4 bg-[var(--herr-pink)] rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-[var(--herr-black)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="text-[0.78rem] text-[var(--herr-faint)] mt-1 leading-relaxed">
                  {mode.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
