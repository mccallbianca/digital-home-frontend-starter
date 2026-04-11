#!/usr/bin/env node
/**
 * HERR — Founder Photo Post-Processing
 * Applies cinematic filters to match the site's dark editorial aesthetic.
 *
 * Input:  public/images/founder-bianca-mccall-lmft.jpg
 * Output: public/images/founder-bianca-mccall-processed.jpg
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT = path.resolve(__dirname, '..', 'public/images/founder-bianca-mccall-lmft.jpg');
const OUTPUT = path.resolve(__dirname, '..', 'public/images/founder-bianca-mccall-processed.jpg');

async function processPhoto() {
  console.log('Reading original photo...');
  const metadata = await sharp(INPUT).metadata();
  const { width, height } = metadata;
  console.log(`  Dimensions: ${width}x${height}`);

  // ── 1. Create a subtle film grain overlay ──────────────────────────────────
  // Generate noise as a raw buffer, then convert to PNG for compositing
  const grainSize = width * height;
  const grainBuffer = Buffer.alloc(grainSize);
  for (let i = 0; i < grainSize; i++) {
    // Random value 0-255, but we'll use it at low opacity
    grainBuffer[i] = Math.floor(Math.random() * 256);
  }
  const grainImage = await sharp(grainBuffer, {
    raw: { width, height, channels: 1 },
  })
    .png()
    .toBuffer();

  // ── 2. Create vignette overlay (dark edges) ────────────────────────────────
  // SVG radial gradient: transparent center → dark edges
  const vignetteSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <radialGradient id="v" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="black" stop-opacity="0"/>
        <stop offset="70%" stop-color="black" stop-opacity="0"/>
        <stop offset="100%" stop-color="black" stop-opacity="0.45"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#v)"/>
  </svg>`;

  // ── 3. Create blue-teal color grade overlay ────────────────────────────────
  // A very subtle blue-teal wash composited at low opacity
  const tintSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="#0a2a3a" opacity="1"/>
  </svg>`;

  // ── 4. Apply all processing ────────────────────────────────────────────────
  console.log('Applying cinematic processing...');
  console.log('  - Darkening exposure ~18%');
  console.log('  - Reducing saturation to 85%');
  console.log('  - Boosting contrast');
  console.log('  - Blue-teal color grade');
  console.log('  - Film grain overlay');
  console.log('  - Vignette (dark edges)');

  await sharp(INPUT)
    // Darken ~18%, desaturate to 85%
    .modulate({
      brightness: 0.82,
      saturation: 0.85,
    })
    // Slight contrast boost via linear transform: contrast * pixel + offset
    .linear(1.12, -15)
    // Composite layers
    .composite([
      // Blue-teal color grade (soft-light blend at low opacity)
      {
        input: Buffer.from(tintSvg),
        blend: 'soft-light',
        top: 0,
        left: 0,
      },
      // Film grain (overlay blend at low opacity)
      {
        input: await sharp(grainImage)
          .ensureAlpha(0.06) // Very subtle grain
          .toBuffer(),
        blend: 'overlay',
        top: 0,
        left: 0,
      },
      // Vignette
      {
        input: Buffer.from(vignetteSvg),
        blend: 'multiply',
        top: 0,
        left: 0,
      },
    ])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(OUTPUT);

  console.log(`\nSaved: ${OUTPUT}`);
  console.log('Done — original file untouched.');
}

processPhoto().catch((err) => {
  console.error('Processing failed:', err);
  process.exit(1);
});
