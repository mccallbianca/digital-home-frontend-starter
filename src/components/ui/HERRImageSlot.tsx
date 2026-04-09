/**
 * HERRImageSlot
 *
 * Dual-mode image component:
 * - When `src` is provided: renders the real image with full SEO/performance attributes
 * - When `src` is omitted: renders a branded CSS gradient placeholder
 *
 * To swap in a real image, add the file to /public/images/ and pass the src prop.
 * All SEO requirements (alt, loading, dimensions) are enforced at the component level.
 */

import Image from 'next/image';

interface HERRImageSlotProps {
  /** File path relative to /public — e.g. "/images/hero-im-herr-portrait.webp" */
  src?: string;
  /** Required alt text — must be descriptive for accessibility and SEO */
  alt: string;
  /** CSS gradient string used as placeholder when src is absent */
  gradient: string;
  /** Width in pixels — used for aspect ratio and layout shift prevention */
  width: number;
  /** Height in pixels */
  height: number;
  /** Additional className for the wrapper */
  className?: string;
  /** True for above-fold hero images — disables lazy loading */
  priority?: boolean;
  /** Optional film grain overlay intensity (0–1). Default 0.04 */
  grain?: number;
}

export default function HERRImageSlot({
  src,
  alt,
  gradient,
  width,
  height,
  className = '',
  priority = false,
  grain = 0.04,
}: HERRImageSlotProps) {
  const aspectRatio = height / width;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ paddingBottom: `${aspectRatio * 100}%` }}
    >
      {/* Image or gradient placeholder */}
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1200px"
          className="object-cover"
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: gradient }}
          role="img"
          aria-label={alt}
        />
      )}

      {/* Film grain overlay — always present for cinematic texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: grain,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}

/* ─── Named gradient presets ────────────────────────────────────────────────
   Import these in page files for consistent placeholder visuals.
   Each gradient is designed to suggest the final image composition.
   ──────────────────────────────────────────────────────────────────────── */

export const HERR_GRADIENTS = {

  // Home — Hero: cobalt-lit figure, pink halo at frame edge
  heroPortrait: `
    radial-gradient(ellipse 35% 65% at 50% 55%, rgba(37,99,235,0.55) 0%, rgba(124,58,237,0.25) 45%, rgba(10,10,15,1) 75%),
    radial-gradient(ellipse 60% 30% at 50% 15%, rgba(217,70,239,0.12) 0%, transparent 70%),
    #0A0A0F
  `,

  // Home — Regulate: violet open palm
  regulateHand: `
    radial-gradient(ellipse 55% 55% at 50% 65%, rgba(124,58,237,0.5) 0%, rgba(37,99,235,0.2) 50%, rgba(10,10,15,1) 75%),
    #0A0A0F
  `,

  // Home — Reprogram: pink fist
  reprogramFist: `
    radial-gradient(ellipse 55% 55% at 50% 65%, rgba(217,70,239,0.55) 0%, rgba(124,58,237,0.25) 50%, rgba(10,10,15,1) 75%),
    #0A0A0F
  `,

  // Home — Existential: tiny figure, vast void, cobalt from above
  existential: `
    radial-gradient(ellipse 15% 50% at 50% 85%, rgba(37,99,235,0.5) 0%, transparent 60%),
    linear-gradient(to bottom, rgba(10,10,15,1) 0%, rgba(37,99,235,0.08) 60%, rgba(10,10,15,1) 100%),
    #0A0A0F
  `,

  // Home — Emotional: violet closed eye, relief
  emotional: `
    radial-gradient(ellipse 50% 50% at 50% 50%, rgba(124,58,237,0.5) 0%, rgba(80,20,160,0.2) 50%, rgba(10,10,15,1) 75%),
    #0A0A0F
  `,

  // Home — Executive: cobalt + gold, decisive hand
  executive: `
    radial-gradient(ellipse 60% 50% at 40% 65%, rgba(37,99,235,0.4) 0%, rgba(180,140,60,0.2) 55%, rgba(10,10,15,1) 78%),
    #0A0A0F
  `,

  // Home — Campaign portrait slots (cycling through palette)
  campaignPink: `
    radial-gradient(ellipse 50% 70% at 50% 50%, rgba(217,70,239,0.5) 0%, rgba(124,58,237,0.2) 55%, rgba(10,10,15,1) 80%),
    #0A0A0F
  `,
  campaignCobalt: `
    radial-gradient(ellipse 50% 70% at 50% 50%, rgba(37,99,235,0.55) 0%, rgba(10,10,15,1) 70%),
    #0A0A0F
  `,
  campaignViolet: `
    radial-gradient(ellipse 50% 70% at 50% 50%, rgba(100,40,200,0.5) 0%, rgba(10,10,15,1) 70%),
    #0A0A0F
  `,
  campaignGold: `
    radial-gradient(ellipse 50% 70% at 50% 50%, rgba(180,140,60,0.45) 0%, rgba(37,99,235,0.1) 55%, rgba(10,10,15,1) 80%),
    #0A0A0F
  `,

  // Home — Founder: pink rim light silhouette
  founder: `
    radial-gradient(ellipse 20% 70% at 50% 50%, rgba(37,99,235,0.35) 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 50% 50%, rgba(217,70,239,0.08) 0%, transparent 70%),
    linear-gradient(to bottom, rgba(10,10,15,1) 0%, rgba(37,99,235,0.06) 50%, rgba(10,10,15,1) 100%),
    #0A0A0F
  `,

  // Home — CTA threshold: gold-to-pink tunnel
  threshold: `
    radial-gradient(ellipse 18% 55% at 50% 100%, rgba(217,70,239,0.65) 0%, rgba(180,140,60,0.4) 30%, rgba(37,99,235,0.1) 60%, rgba(10,10,15,1) 85%),
    #0A0A0F
  `,

  // About — Hero: voice frequency, cobalt/pink light trails
  voiceFrequency: `
    repeating-linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.04) 1px, transparent 2px),
    repeating-linear-gradient(0deg, transparent 0%, rgba(37,99,235,0.04) 1px, transparent 2px),
    radial-gradient(ellipse 80% 40% at 30% 50%, rgba(37,99,235,0.35) 0%, transparent 60%),
    radial-gradient(ellipse 60% 30% at 70% 50%, rgba(217,70,239,0.25) 0%, transparent 55%),
    radial-gradient(ellipse 40% 20% at 50% 50%, rgba(124,58,237,0.15) 0%, transparent 60%),
    #0A0A0F
  `,

  // About — Arena: empty court receding into darkness
  arena: `
    linear-gradient(to bottom, rgba(10,10,15,1) 0%, rgba(37,99,235,0.15) 40%, rgba(10,10,15,1) 80%),
    radial-gradient(ellipse 40% 20% at 50% 50%, rgba(37,99,235,0.2) 0%, transparent 70%),
    #0A0A0F
  `,

  // How It Works — Hero: double exposure, cobalt + pink blend
  doubleExposure: `
    radial-gradient(ellipse 45% 75% at 38% 50%, rgba(37,99,235,0.45) 0%, transparent 60%),
    radial-gradient(ellipse 45% 75% at 62% 50%, rgba(217,70,239,0.35) 0%, transparent 60%),
    #0A0A0F
  `,

  // Step 01 — Assess: violet contemplation
  stepAssess: `
    radial-gradient(ellipse 55% 60% at 50% 45%, rgba(124,58,237,0.45) 0%, rgba(10,10,15,1) 72%),
    #0A0A0F
  `,

  // Step 02 — Regulate: cobalt breath
  stepRegulate: `
    radial-gradient(ellipse 40% 70% at 28% 50%, rgba(37,99,235,0.5) 0%, rgba(10,10,15,1) 70%),
    #0A0A0F
  `,

  // Step 03 — Clone: pink microphone
  stepClone: `
    radial-gradient(ellipse 30% 60% at 50% 60%, rgba(217,70,239,0.5) 0%, rgba(124,58,237,0.15) 50%, rgba(10,10,15,1) 72%),
    #0A0A0F
  `,

  // Step 04 — Reprogram: violet + pink headphones
  stepReprogram: `
    radial-gradient(ellipse 55% 55% at 50% 45%, rgba(124,58,237,0.45) 0%, rgba(217,70,239,0.2) 45%, rgba(10,10,15,1) 72%),
    #0A0A0F
  `,
};
