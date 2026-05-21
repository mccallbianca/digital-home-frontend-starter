/**
 * GenreSVGCard
 *
 * Inline-SVG fallback for genres whose source JPGs returned 404 during
 * PR3-PR6. Renders a square card with a per-genre gradient, a single
 * decorative motif tied to that genre's mood, and the name set in
 * Cormorant Garamond / Inter Tight matching the rest of the marketing
 * site.
 *
 * Drop-in for the marketing /ecqo-sound and dashboard surfaces wherever
 * a genre card was previously `<div className="genre-card__placeholder">`.
 * Sizes to its parent container; 1:1 aspect-ratio enforced via the
 * embedded SVG viewBox so it slots into `.genre-card`'s existing layout
 * without further CSS.
 */

const PALETTE: Record<string, { from: string; to: string; accent: string; ink: string }> = {
  'Hip-Hop':      { from: '#2D1B3D', to: '#8E1A66', accent: '#FF5BAA', ink: '#FFFFFF' },
  'R&B / Soul':   { from: '#2D1B3D', to: '#4A1942', accent: '#E94560', ink: '#FFFFFF' },
  'Ambient':      { from: '#1A1A2E', to: '#16213E', accent: '#7BC0FF', ink: '#FFFFFF' },
  'Classical':    { from: '#1B2838', to: '#0D1B2A', accent: '#D7CFA6', ink: '#FFFFFF' },
  'Lo-Fi':        { from: '#2B2D42', to: '#3D405B', accent: '#C9A2D6', ink: '#FFFFFF' },
  'Jazz':         { from: '#3C2415', to: '#5C3D2E', accent: '#E8B85A', ink: '#FFF5DC' },
  'Gospel':       { from: '#1A1A2E', to: '#4A1942', accent: '#E8C56A', ink: '#FFFFFF' },
  'Latin':        { from: '#3C2415', to: '#E94560', accent: '#FFB36B', ink: '#FFF1E5' },
  'Reggae':       { from: '#1B3A1F', to: '#D4A017', accent: '#FF5B3A', ink: '#FFF5DC' },
  'Reggae / Island': { from: '#1B3A1F', to: '#D4A017', accent: '#FF5B3A', ink: '#FFF5DC' },
};

const DEFAULT_PALETTE = { from: '#2D1B3D', to: '#8E1A66', accent: '#FF5BAA', ink: '#FFFFFF' };

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * One decorative motif per genre. Drawn inside the SVG viewBox (0..400)
 * with the accent color so the card has identity beyond the gradient.
 */
function Motif({ name, accent }: { name: string; accent: string }) {
  switch (name) {
    case 'Hip-Hop':
      // Boombox rhythm bars
      return (
        <g opacity={0.7}>
          {[60, 110, 160, 210, 260, 310].map((x, i) => (
            <rect
              key={x}
              x={x}
              y={170 + (i % 2 === 0 ? -20 : 10)}
              width={28}
              height={80 - (i % 2) * 20}
              rx={4}
              fill={accent}
            />
          ))}
        </g>
      );
    case 'R&B / Soul':
      return (
        <g opacity={0.7}>
          {/* Heart-curve waveform */}
          <path
            d="M40 200 Q 100 120 160 200 T 280 200 T 400 200"
            stroke={accent}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case 'Ambient':
      return (
        <g opacity={0.55}>
          {/* Concentric atmospheric rings */}
          <circle cx={200} cy={210} r={50}  stroke={accent} strokeWidth={2} fill="none" />
          <circle cx={200} cy={210} r={90}  stroke={accent} strokeWidth={2} fill="none" opacity={0.7} />
          <circle cx={200} cy={210} r={130} stroke={accent} strokeWidth={2} fill="none" opacity={0.45} />
          <circle cx={200} cy={210} r={170} stroke={accent} strokeWidth={2} fill="none" opacity={0.25} />
        </g>
      );
    case 'Classical':
      return (
        <g opacity={0.65}>
          {/* Column architecture */}
          <line x1={140} y1={140} x2={140} y2={280} stroke={accent} strokeWidth={4} />
          <line x1={200} y1={140} x2={200} y2={280} stroke={accent} strokeWidth={4} />
          <line x1={260} y1={140} x2={260} y2={280} stroke={accent} strokeWidth={4} />
          <line x1={120} y1={140} x2={280} y2={140} stroke={accent} strokeWidth={4} />
        </g>
      );
    case 'Lo-Fi':
      return (
        <g opacity={0.6}>
          {/* Vinyl crackle: nested circles + a needle */}
          <circle cx={200} cy={210} r={80} fill="none" stroke={accent} strokeWidth={2} />
          <circle cx={200} cy={210} r={60} fill="none" stroke={accent} strokeWidth={2} opacity={0.7} />
          <circle cx={200} cy={210} r={40} fill="none" stroke={accent} strokeWidth={2} opacity={0.5} />
          <circle cx={200} cy={210} r={10} fill={accent} />
          <line x1={280} y1={150} x2={210} y2={200} stroke={accent} strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case 'Jazz':
      return (
        <g opacity={0.75}>
          {/* Saxophone curve */}
          <path
            d="M150 130 Q 150 220 220 220 Q 280 220 270 280 Q 260 320 220 320"
            stroke={accent}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case 'Gospel':
      return (
        <g opacity={0.7}>
          {/* Sunrise/halo rays from a point */}
          {[-60, -40, -20, 0, 20, 40, 60].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={200}
                y1={290}
                x2={200 + Math.sin(rad) * 160}
                y2={290 - Math.cos(rad) * 160}
                stroke={accent}
                strokeWidth={3}
                opacity={0.5}
              />
            );
          })}
          <circle cx={200} cy={290} r={28} fill={accent} />
        </g>
      );
    case 'Latin':
      return (
        <g opacity={0.7}>
          {/* Rhythm dots — clave pattern */}
          {[80, 120, 200, 240, 300].map((x, i) => (
            <circle key={x} cx={x} cy={210 + (i % 2 ? 30 : -10)} r={i === 2 ? 16 : 12} fill={accent} />
          ))}
        </g>
      );
    case 'Reggae':
    case 'Reggae / Island': {
      return (
        <g opacity={0.75}>
          {/* Sun above horizon */}
          <circle cx={200} cy={200} r={48} fill={accent} />
          <line x1={40} y1={280} x2={360} y2={280} stroke={accent} strokeWidth={3} opacity={0.7} />
          {/* Palm fronds */}
          <path d="M80 280 Q 70 240 100 200" stroke={accent} strokeWidth={3} fill="none" />
          <path d="M320 280 Q 330 240 300 200" stroke={accent} strokeWidth={3} fill="none" />
        </g>
      );
    }
    default:
      return null;
  }
}

export interface GenreSVGCardProps {
  name: string;
  /** Optional override for the card label, defaults to `name`. */
  label?: string;
}

export default function GenreSVGCard({ name, label }: GenreSVGCardProps) {
  const palette = PALETTE[name] ?? DEFAULT_PALETTE;
  const gradId = `grad-${slug(name)}`;
  const text = label ?? name;

  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${text} genre card`}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor={palette.from} />
          <stop offset="100%" stopColor={palette.to} />
        </linearGradient>
        {/* Subtle paper-grain texture so the card doesn't read as flat */}
        <radialGradient id={`${gradId}-glow`} cx="20%" cy="15%" r="80%">
          <stop offset="0%"  stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* Base gradient */}
      <rect x={0} y={0} width={400} height={400} fill={`url(#${gradId})`} />
      {/* Light glow */}
      <rect x={0} y={0} width={400} height={400} fill={`url(#${gradId}-glow)`} />

      {/* Decorative motif */}
      <Motif name={name} accent={palette.accent} />

      {/* Bottom scrim for legibility */}
      <rect x={0} y={300} width={400} height={100} fill="rgba(0,0,0,0.32)" />

      {/* Genre label */}
      <text
        x={32}
        y={362}
        fill={palette.ink}
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize={36}
        fontWeight={600}
        letterSpacing={0.5}
      >
        {text}
      </text>
    </svg>
  );
}
