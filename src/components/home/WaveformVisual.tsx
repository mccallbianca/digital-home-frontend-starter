'use client';

/**
 * WaveformVisual — CSS-only animated waveform bars
 * Used in the Voice Clone Moment section and reusable on other pages.
 */
export default function WaveformVisual() {
  return (
    <div
      style={{
        background: '#16161F',
        borderRadius: 16,
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Bars */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          height: 80,
        }}
      >
        {[40, 65, 80, 55, 70].map((h, i) => (
          <div
            key={i}
            style={{
              width: 8,
              borderRadius: 4,
              background: 'linear-gradient(to top, #C42D8E, #E8388A)',
              animation: `waveformPulse 1.2s ease-in-out ${i * 0.15}s infinite alternate`,
              height: `${h}%`,
            }}
          />
        ))}
      </div>

      {/* Now playing label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Play button */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1.5px solid #C42D8E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <path d="M1 1L11 7L1 13V1Z" fill="#FFFFFF" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 14, color: '#FFFFFF', margin: 0, lineHeight: 1.4 }}>
            Morning Affirmation
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.4 }}>
            Your Voice
          </p>
        </div>
      </div>

      <style>{`
        @keyframes waveformPulse {
          0%   { transform: scaleY(0.6); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
