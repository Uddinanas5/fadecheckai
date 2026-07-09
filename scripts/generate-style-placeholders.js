/**
 * Generates branded placeholder images for the haircut catalog.
 *
 * For every style it writes:
 *   assets/styles/<id>/thumb.png   (catalog card, 3:4)
 *   assets/styles/<id>/ref_1..4.png (reference gallery, 3:4)
 *
 * These are on-brand placeholders (dark gradient + electric blue + style name)
 * so the UI is fully populated and screenshot-ready. Drop real licensed/approved
 * photos into the same paths later — no code change needed. See assets/styles/README.md.
 *
 * Run: node scripts/generate-style-placeholders.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Canonical catalog id/name/category — MUST stay in sync with constants/haircuts.ts.
const STYLES = [
  { id: 'low-taper-fade', name: 'Low Taper Fade', category: 'Taper' },
  { id: 'mid-taper-fade', name: 'Mid Taper Fade', category: 'Taper' },
  { id: 'high-taper-fade', name: 'High Taper Fade', category: 'Taper' },
  { id: 'low-skin-fade', name: 'Low Skin Fade', category: 'Fade' },
  { id: 'mid-skin-fade', name: 'Mid Skin Fade', category: 'Fade' },
  { id: 'high-skin-fade', name: 'High Skin Fade', category: 'Fade' },
  { id: 'burst-fade', name: 'Burst Fade', category: 'Fade' },
  { id: 'drop-fade', name: 'Drop Fade', category: 'Fade' },
  { id: 'textured-crop', name: 'Textured Crop', category: 'Crop' },
  { id: 'french-crop', name: 'French Crop', category: 'Crop' },
  { id: 'buzz-cut', name: 'Buzz Cut', category: 'Buzz' },
  { id: 'crew-cut', name: 'Crew Cut', category: 'Buzz' },
  { id: 'classic-side-part', name: 'Classic Side Part', category: 'Classic' },
  { id: 'modern-quiff', name: 'Modern Quiff', category: 'Quiff' },
  { id: 'pompadour', name: 'Pompadour', category: 'Pompadour' },
  { id: 'textured-fringe', name: 'Textured Fringe', category: 'Fringe' },
  { id: 'curly-top-fade', name: 'Curly Top + Fade', category: 'Curly' },
  { id: 'mid-length-flow', name: 'Mid-Length Flow', category: 'Long' },
];

const W = 600;
const H = 800;
const BG_TOP = '#12121A';
const BG_BOT = '#050508';
const BLUE = '#0145F2';
const CYAN = '#38BDF8';

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

// A simple head/hair silhouette so placeholders read as "a person with a haircut".
function silhouette(variant) {
  // slight variation per reference so the gallery doesn't look identical
  const topY = 250 - variant * 8;
  return `
    <g opacity="0.28" fill="url(#hair)">
      <ellipse cx="300" cy="${topY + 60}" rx="150" ry="${150 + variant * 6}" />
    </g>
    <g opacity="0.35" fill="#1A1A24">
      <ellipse cx="300" cy="${topY + 130}" rx="118" ry="140" />
    </g>
    <g opacity="0.30" fill="url(#hair)">
      <path d="M182 ${topY + 120} Q300 ${topY - 30} 418 ${topY + 120} L418 ${topY + 70} Q300 ${topY - 70} 182 ${topY + 70} Z" />
    </g>
  `;
}

function svgFor(name, category, label, variant) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BG_TOP}"/>
      <stop offset="100%" stop-color="${BG_BOT}"/>
    </linearGradient>
    <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BLUE}"/>
      <stop offset="100%" stop-color="${CYAN}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.32" r="0.6">
      <stop offset="0%" stop-color="${BLUE}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${BLUE}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${silhouette(variant)}
  <rect x="40" y="${H - 190}" width="${W - 80}" height="150" rx="24" fill="#1A1A24" fill-opacity="0.7" stroke="#FFFFFF" stroke-opacity="0.08"/>
  <text x="64" y="${H - 138}" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="700" fill="${CYAN}" letter-spacing="2">${escapeXml(category.toUpperCase())}</text>
  <text x="64" y="${H - 96}" font-family="Helvetica, Arial, sans-serif" font-size="38" font-weight="800" fill="#EDF1F5">${escapeXml(name)}</text>
  <text x="64" y="${H - 60}" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="500" fill="#9CA3AF">${escapeXml(label)}</text>
</svg>`;
}

async function main() {
  const root = path.join(__dirname, '..', 'assets', 'styles');
  fs.mkdirSync(root, { recursive: true });
  let count = 0;
  for (const s of STYLES) {
    const dir = path.join(root, s.id);
    fs.mkdirSync(dir, { recursive: true });

    // thumbnail
    await sharp(Buffer.from(svgFor(s.name, s.category, 'Reference preview', 0)))
      .png()
      .toFile(path.join(dir, 'thumb.png'));
    count++;

    // 4 reference images with slight variation
    for (let i = 1; i <= 4; i++) {
      await sharp(Buffer.from(svgFor(s.name, s.category, `Reference ${i} of 4`, i)))
        .png()
        .toFile(path.join(dir, `ref_${i}.png`));
      count++;
    }
    console.log(`  ✓ ${s.id}`);
  }
  console.log(`\nGenerated ${count} placeholder images for ${STYLES.length} styles.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
