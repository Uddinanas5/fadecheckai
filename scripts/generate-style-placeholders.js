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
const INK = '#17130F';

// Per-category vibrant "pop" background — matches the app's v3 funky palette.
const CATEGORY_COLORS = {
  Fade: '#7A5CFF',
  Taper: '#FF4D9D',
  Crop: '#B4EC2E',
  Buzz: '#3B6BFF',
  Quiff: '#14C7A8',
  Pompadour: '#FF6A3D',
  Fringe: '#FFD12E',
  Curly: '#FF4D9D',
  Classic: '#7A5CFF',
  Long: '#14C7A8',
};

// Readable ink for a given background (dark ink on light pops, cream on dark).
function inkOn(bg) {
  const light = ['#B4EC2E', '#FFD12E', '#14C7A8'];
  return light.includes(bg) ? INK : '#FFFFFF';
}

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

// A friendly cartoon head silhouette (placeholder until AI art lands).
function silhouette(variant, fg) {
  const cx = 300;
  const headTop = 250 - variant * 6;
  const headCy = headTop + 150;
  const hairR = 168 + variant * 5;
  return `
    <g opacity="0.9">
      <!-- hair mass -->
      <path d="M${cx - hairR} ${headCy}
               a${hairR} ${hairR} 0 0 1 ${hairR * 2} 0
               q0 44 -34 64 q-${hairR - 34} -72 -${(hairR - 34) * 2} 0 q-34 -20 -34 -64 Z"
            fill="${fg}"/>
      <!-- face -->
      <ellipse cx="${cx}" cy="${headCy + 46}" rx="112" ry="142" fill="${fg}" opacity="0.55"/>
      <!-- neck/shoulders -->
      <path d="M${cx - 120} ${headCy + 230} q120 -70 240 0 l0 60 l-240 0 Z" fill="${fg}" opacity="0.75"/>
    </g>
  `;
}

function svgFor(name, category, label, variant) {
  const bg = CATEGORY_COLORS[category] || '#7A5CFF';
  const ink = inkOn(bg);
  const fg = ink === '#FFFFFF' ? 'rgba(255,255,255,0.85)' : 'rgba(23,19,15,0.82)';
  const star = ink === '#FFFFFF' ? '#FFD12E' : '#7A5CFF';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <text x="70" y="120" font-family="Helvetica, Arial, sans-serif" font-size="44" fill="${star}">✦</text>
  <text x="500" y="220" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="${star}">✦</text>
  <text x="80" y="${H - 90}" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="${star}">✦</text>
  ${silhouette(variant, fg)}
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
