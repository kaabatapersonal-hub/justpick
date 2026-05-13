/**
 * Generates PWA icons for all required sizes.
 * Run with: node scripts/generateIcons.js
 *
 * Design: orange (#FF8C42) background, white rounded square, "JP" in navy (#1E293B)
 */

import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];

function makeSvg(size) {
  const r = Math.round(size * 0.18);         // corner radius for bg
  const sqX = Math.round(size * 0.18);       // inner white square offset
  const sqSize = size - sqX * 2;
  const sqR = Math.round(size * 0.12);       // inner square corner radius
  const fontSize = Math.round(size * 0.28);
  const textY = Math.round(size * 0.645);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#FF8C42"/>
  <rect x="${sqX}" y="${sqX}" width="${sqSize}" height="${sqSize}" rx="${sqR}" fill="white"/>
  <text x="${size / 2}" y="${textY}" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="${fontSize}" fill="#1E293B" text-anchor="middle" dominant-baseline="auto">JP</text>
</svg>`;
}

async function generate() {
  for (const size of SIZES) {
    const svg = makeSvg(size);
    const outFile = join(outDir, `icon-${size}.png`);
    await sharp(Buffer.from(svg)).png().toFile(outFile);
    console.log(`✓ ${size}x${size} → ${outFile}`);
  }

  // favicon 32x32
  const faviconSvg = makeSvg(32);
  await sharp(Buffer.from(faviconSvg)).png().toFile(join(__dirname, '..', 'public', 'favicon.png'));
  console.log('✓ 32x32 favicon.png');

  // apple-touch-icon at 180x180 (already in SIZES, just copy it)
  const touchSvg = makeSvg(180);
  await sharp(Buffer.from(touchSvg)).png().toFile(join(__dirname, '..', 'public', 'apple-touch-icon.png'));
  console.log('✓ 180x180 apple-touch-icon.png');

  // Also write icon-192 and icon-512 at their canonical names for backwards compat
  const svg192 = makeSvg(192);
  await sharp(Buffer.from(svg192)).png().toFile(join(outDir, 'icon-192.png'));
  const svg512 = makeSvg(512);
  await sharp(Buffer.from(svg512)).png().toFile(join(outDir, 'icon-512.png'));

  console.log('\nAll icons generated successfully!');
}

generate().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
