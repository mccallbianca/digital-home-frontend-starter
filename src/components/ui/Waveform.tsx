'use client';

/**
 * Pure CSS animated waveform — communicates "audio" and "life"
 * without requiring actual audio playback.
 */
export default function Waveform({ barCount = 5 }: { barCount?: number }) {
  const bars = Array.from({ length: barCount }, (_, i) => {
    const duration = 0.8 + Math.random() * 0.6; // 0.8–1.4s
    const delay = i * 0.1;
    const maxHeight = 12 + Math.random() * 20; // 12–32px
    return { duration, delay, maxHeight };
  });

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        height: 36,
        padding: '0 12px',
        background: 'rgba(196, 45, 142, 0.08)',
        borderRadius: 8,
        border: '1px solid rgba(196, 45, 142, 0.15)',
      }}
    >
      {bars.map((bar, i) => (
        <span
          key={i}
          style={{
            display: 'block',
            width: 4,
            borderRadius: 2,
            background: 'linear-gradient(180deg, #E8388A, #C42D8E)',
            animation: `herrWaveBar ${bar.duration}s ease-in-out ${bar.delay}s infinite alternate`,
            height: bar.maxHeight,
          }}
        />
      ))}
      <style>{`
        @keyframes herrWaveBar {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
