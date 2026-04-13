'use client';

/**
 * Ambient floating particle background — pure CSS.
 * 20–30 small magenta circles float upward slowly.
 * Use in hero sections and dark full-bleed sections.
 */
export default function ParticleField({ count = 24 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => {
    const size = 2 + Math.random() * 2; // 2–4px
    const opacity = 0.03 + Math.random() * 0.05; // 3–8%
    const left = Math.random() * 100; // random x%
    const duration = 30 + Math.random() * 30; // 30–60s
    const delay = Math.random() * -60; // stagger start
    const drift = -20 + Math.random() * 40; // horizontal drift px
    return { size, opacity, left, duration, delay, drift, id: i };
  });

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            bottom: '-4px',
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: '#C42D8E',
            opacity: p.opacity,
            animation: `herrParticleFloat ${p.duration}s linear ${p.delay}s infinite`,
            // @ts-expect-error -- CSS custom properties for per-particle drift
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes herrParticleFloat {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(var(--drift, 0px));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
