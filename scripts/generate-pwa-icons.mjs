#!/usr/bin/env node
/**
 * Generates HERR PWA icons via sharp. Run once:
 *
 *   node scripts/generate-pwa-icons.mjs
 *
 * Produces /public/icons/icon-{192,256,384,512}.png. Each size has both
 * a "maskable" (safe-zone padded) and an "any" (edge-to-edge) variant
 * built from the same SVG so the manifest can declare both purposes
 * pointing at one file each (we use the maskable-safe version which
 * also reads well as `any` — most browsers treat any purpose as
 * suitable when no explicit any is provided).
 *
 * Design: HERR Ink background, HERR Magenta circle, white "H" centered.
 * Brand swap later by editing the SVG below.
 */

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../public/icons');

const SIZES = [192, 256, 384, 512];

// SVG with a magenta disc on ECQO ink, white "H" centered. The disc
// sits inside the 80% safe-zone so the icon also reads correctly when
// the OS applies maskable cropping.
function buildSvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.40; // 80% safe zone -> radius 40% of size
  const fontSize = size * 0.45;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0A0A0F"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#C42D8E"/>
  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, 'Cormorant Garamond', serif"
        font-weight="600" font-size="${fontSize}" fill="#FFFFFF" letter-spacing="0">H</text>
</svg>`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const size of SIZES) {
    const svg = Buffer.from(buildSvg(size));
    const out = resolve(OUT_DIR, `icon-${size}.png`);
    await sharp(svg).png({ compressionLevel: 9 }).toFile(out);
    console.log(`  wrote ${out}`);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
