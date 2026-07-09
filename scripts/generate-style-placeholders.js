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

// Per-category accent pair (start, end) — a cohesive cool palette that gives the
// catalog visual variety while staying on-brand.
const CATEGORY_COLORS = {
  Fade: ['#0145F2', '#38BDF8'],
  Taper: ['#0EA5E9', '#22D3EE'],
  Crop: ['#14B8A6', '#2DD4BF'],
  Buzz: ['#64748B', '#94A3B8'],
  Quiff: ['#6366F1', '#818CF8'],
  Pompadour: ['#8B5CF6', '#A78BFA'],
  Fringe: ['#0284C7', '#38BDF8'],
  Curly: ['#2563EB', '#60A5FA'],
  Classic: ['#475569', '#7DD3FC'],
  Long: ['#4F46E5', '#93C5FD'],
};

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

// A clearer, brighter head/hair silhouette so cards read as "a haircut" even at
// small thumbnail sizes. `variant` nudges the shape so gallery refs differ.
function silhouette(variant) {
  const cx = 300;
  const headTop = 235 - variant * 6;
  const headCy = headTop + 150;
  const hairR = 172 + variant * 5;
  return `
    <!-- hair mass -->
    <path d="M${cx - hairR} ${headCy}
             a${hairR} ${hairR} 0 0 1 ${hairR * 2} 0
             q0 40 -30 60 q-${hairR - 30} -70 -${(hairR - 30) * 2} 0 q-30 -20 -30 -60 Z"
          fill="url(#hair)" opacity="0.9"/>
    <!-- face -->
    <ellipse cx="${cx}" cy="${headCy + 40}" rx="118" ry="150" fill="#0B0B12" opacity="0.92"/>
    <!-- fade shading on the sides -->
    <path d="M${cx - 150} ${headCy + 40} q30 -110 150 -120 q120 10 150 120 l0 40 q-150 -90 -300 0 Z"
          fill="url(#hair)" opacity="0.55"/>
    <!-- neck -->
    <rect x="${cx - 55}" y="${headCy + 150}" width="110" height="120" rx="30" fill="#0B0B12" opacity="0.9"/>
  `;
}

function svgFor(name, category, label, variant) {
  const [c1, c2] = CATEGORY_COLORS[category] || ['#0145F2', '#38BDF8'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#171722"/>
      <stop offset="100%" stop-color="#070710"/>
    </linearGradient>
    <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.34" r="0.65">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${silhouette(variant)}
  <rect x="0" y="${H - 210}" width="${W}" height="210" fill="#05050A" fill-opacity="0.55"/>
  <rect x="36" y="${H - 176}" width="${W - 72}" height="140" rx="24" fill="#12121A" fill-opacity="0.82" stroke="#FFFFFF" stroke-opacity="0.10"/>
  <text x="60" y="${H - 128}" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="700" fill="${c2}" letter-spacing="3">${escapeXml(category.toUpperCase())}</text>
  <text x="60" y="${H - 86}" font-family="Helvetica, Arial, sans-serif" font-size="40" font-weight="800" fill="#EDF1F5">${escapeXml(name)}</text>
  <text x="60" y="${H - 52}" font-family="Helvetica, Arial, sans-serif" font-size="19" font-weight="500" fill="#9CA3AF">${escapeXml(label)}</text>
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
