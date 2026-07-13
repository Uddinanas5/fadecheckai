/**
 * Generates the catalog's built-in illustrations: a distinct flat-cartoon
 * character for each of the 18 haircuts, on the style's pop background.
 *
 * Each style gets real hair GEOMETRY (fade height, fringe type, quiff, pomp,
 * curls, flow, part, burst) so a buzz cut looks different from a pompadour at
 * thumbnail size. The 4 gallery refs vary skin tone + accents for diversity.
 *
 * Writes assets/styles/<id>/{thumb,ref_1..4}.png. Drop real photos or AI art
 * into the same paths later — no code change needed.
 *
 * Run: node scripts/generate-style-placeholders.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const W = 600;
const H = 800;
const INK = '#17130F';
const HAIR = '#241A12';

// Style catalog — MUST stay in sync with constants/haircuts.ts ids.
// bg: pop background. Hair recipe fields:
//   cap: bottom Y of the solid hair cap (lower = longer sides)
//   band: [topY, bottomY, opacity] translucent stubble band under the cap (tapers)
//   extra: pomp | quiff | curls | flow | null
//   fringe: none | blunt | choppy | strands
//   part: draw a side-part line   burst: arc around the ear   buzz: stubble-opacity cap
const STYLES = [
  { id: 'low-taper-fade',    name: 'Low Taper Fade',    bg: '#FF4D9D', cap: 468, band: [468, 505, 0.35] },
  { id: 'mid-taper-fade',    name: 'Mid Taper Fade',    bg: '#FF4D9D', cap: 425, band: [425, 480, 0.35] },
  { id: 'high-taper-fade',   name: 'High Taper Fade',   bg: '#FF4D9D', cap: 378, band: [378, 450, 0.35] },
  { id: 'low-skin-fade',     name: 'Low Skin Fade',     bg: '#7A5CFF', cap: 458, band: [458, 480, 0.18] },
  { id: 'mid-skin-fade',     name: 'Mid Skin Fade',     bg: '#7A5CFF', cap: 412, band: null },
  { id: 'high-skin-fade',    name: 'High Skin Fade',    bg: '#7A5CFF', cap: 365, band: null },
  { id: 'burst-fade',        name: 'Burst Fade',        bg: '#7A5CFF', cap: 425, band: [425, 462, 0.3], burst: true },
  { id: 'drop-fade',         name: 'Drop Fade',         bg: '#7A5CFF', cap: 430, band: [430, 475, 0.3], drop: true },
  { id: 'textured-crop',     name: 'Textured Crop',     bg: '#B4EC2E', cap: 405, band: [405, 440, 0.25], fringe: 'choppy' },
  { id: 'french-crop',       name: 'French Crop',       bg: '#B4EC2E', cap: 405, band: [405, 440, 0.25], fringe: 'blunt' },
  { id: 'buzz-cut',          name: 'Buzz Cut',          bg: '#3B6BFF', cap: 435, buzz: true },
  { id: 'crew-cut',          name: 'Crew Cut',          bg: '#3B6BFF', cap: 425, band: [425, 455, 0.3] },
  { id: 'classic-side-part', name: 'Classic Side Part', bg: '#7A5CFF', cap: 435, part: true },
  { id: 'modern-quiff',      name: 'Modern Quiff',      bg: '#14C7A8', cap: 405, band: [405, 445, 0.3], extra: 'quiff' },
  { id: 'pompadour',         name: 'Pompadour',         bg: '#FF6A3D', cap: 415, band: [415, 450, 0.3], extra: 'pomp' },
  { id: 'textured-fringe',   name: 'Textured Fringe',   bg: '#FFD12E', cap: 412, band: [412, 448, 0.3], fringe: 'strands' },
  { id: 'curly-top-fade',    name: 'Curly Top + Fade',  bg: '#FF4D9D', cap: 385, band: null, extra: 'curls' },
  { id: 'mid-length-flow',   name: 'Mid-Length Flow',   bg: '#14C7A8', cap: 452, extra: 'flow' },
];

// Diverse skin tones — cycled across the 4 refs (thumb copies ref_1).
const SKINS = ['#E8B080', '#8D5524', '#F1C27D', '#C68642'];

// Head geometry (shared)
const CX = 300; // head center x
const HCY = 450; // head ellipse center y
const HRX = 118;
const HRY = 155;

function stars(color, v) {
  const spots = [
    [76, 128, 44], [512, 208, 30], [88, 636, 26], [500, 560, 34],
  ];
  // rotate star placement per variant so refs differ
  const pick = [spots[v % 4], spots[(v + 2) % 4]];
  return pick.map(([x, y, s]) => `<text x="${x}" y="${y}" font-family="Helvetica" font-size="${s}" fill="${color}">✦</text>`).join('');
}

function hairSvg(s) {
  const parts = [];
  const TOP = 400; // fixed hairline on the face (just above the brows)
  const capOp = s.buzz ? 0.55 : 1;
  const sideCap = Math.max(s.cap, 0);

  // Clip regions: top-of-head piece (same hairline for every style) and two
  // side pieces whose depth varies per style (this is the fade height).
  parts.push(`
    <clipPath id="hairTop"><rect x="0" y="0" width="${W}" height="${TOP}"/></clipPath>
    <clipPath id="hairSides">
      <rect x="0" y="0" width="232" height="${sideCap}"/>
      <rect x="368" y="0" width="${W - 368}" height="${sideCap}"/>
    </clipPath>
    <clipPath id="headClip"><ellipse cx="${CX}" cy="${HCY}" rx="${HRX}" ry="${HRY}"/></clipPath>
  `);

  if (s.buzz) {
    // Stubble hugs the skull exactly — clipped to the head, hairline at TOP on
    // the face, extending to s.cap only on the sides.
    parts.push(`
      <g clip-path="url(#headClip)">
        <rect x="0" y="0" width="${W}" height="${TOP}" fill="${HAIR}" opacity="${capOp}"/>
        <rect x="0" y="${TOP}" width="232" height="${s.cap - TOP}" fill="${HAIR}" opacity="${capOp}"/>
        <rect x="368" y="${TOP}" width="${W - 368}" height="${s.cap - TOP}" fill="${HAIR}" opacity="${capOp}"/>
      </g>`);
  } else {
    parts.push(`
      <ellipse cx="${CX}" cy="${HCY - 12}" rx="${HRX + 10}" ry="${HRY + 12}" fill="${HAIR}" clip-path="url(#hairTop)"/>
      <ellipse cx="${CX}" cy="${HCY - 12}" rx="${HRX + 10}" ry="${HRY + 12}" fill="${HAIR}" clip-path="url(#hairSides)"/>
    `);
  }

  // Taper/stubble band under the side hair — sides only, clipped to the head.
  if (s.band) {
    const [t, b, op] = s.band;
    parts.push(`
      <g clip-path="url(#headClip)">
        <rect x="150" y="${t}" width="82" height="${b - t}" fill="${HAIR}" opacity="${op}"/>
        <rect x="368" y="${t}" width="82" height="${b - t}" fill="${HAIR}" opacity="${op}"/>
      </g>
    `);
  }

  // Drop fade: band dips lower behind the (viewer's) right ear.
  if (s.drop) {
    parts.push(`<g clip-path="url(#headClip)"><path d="M370 ${s.cap} Q 415 ${s.cap + 55} 402 ${s.cap + 82} L 418 ${s.cap + 40} Z" fill="${HAIR}" opacity="0.3"/></g>`);
  }

  return parts.join('');
}

function extrasSvg(s, skin) {
  const parts = [];

  if (s.extra === 'pomp') {
    parts.push(`<ellipse cx="${CX}" cy="292" rx="96" ry="58" fill="${HAIR}"/>`);
  }
  if (s.extra === 'quiff') {
    parts.push(`<ellipse cx="${CX - 34}" cy="296" rx="80" ry="44" fill="${HAIR}" transform="rotate(-14 ${CX - 34} 296)"/>`);
  }
  if (s.extra === 'curls') {
    const r = 26;
    const xs = [200, 248, 300, 352, 400];
    parts.push(xs.map((x, i) => `<circle cx="${x}" cy="${318 - (i % 2) * 14}" r="${r}" fill="${HAIR}"/>`).join(''));
    parts.push(xs.slice(0, 4).map((x, i) => `<circle cx="${x + 26}" cy="${292 - ((i + 1) % 2) * 12}" r="${r - 4}" fill="${HAIR}"/>`).join(''));
  }
  if (s.extra === 'flow') {
    // hair hanging past the ears, swept back
    parts.push(`
      <path d="M182 400 Q 168 520 196 578 Q 216 540 214 452 Z" fill="${HAIR}"/>
      <path d="M418 400 Q 432 520 404 578 Q 384 540 386 452 Z" fill="${HAIR}"/>
    `);
  }
  if (s.fringe === 'blunt') {
    parts.push(`<rect x="228" y="392" width="144" height="46" rx="6" fill="${HAIR}"/>`);
  }
  if (s.fringe === 'choppy') {
    const y = 396;
    parts.push(`<path d="M226 ${y} l18 30 l16 -30 l18 30 l16 -30 l18 30 l16 -30 l18 30 l16 -30 l18 30 l16 -30 Z" fill="${HAIR}"/>`);
  }
  if (s.fringe === 'strands') {
    parts.push([0, 1, 2, 3].map((i) => `<path d="M${242 + i * 34} 396 q 10 34 2 46 q 18 -18 14 -46 Z" fill="${HAIR}"/>`).join(''));
  }
  if (s.part) {
    parts.push(`<path d="M258 428 Q 236 372 252 318" stroke="${s.bgLite || '#FFFFFF'}" stroke-width="7" fill="none" opacity="0.9"/>`);
  }
  if (s.burst) {
    parts.push(`<path d="M418 500 A 62 62 0 0 0 356 440" stroke="${HAIR}" stroke-width="10" fill="none" opacity="0.6" stroke-linecap="round"/>`);
  }
  return parts.join('');
}

function svgFor(s, variant) {
  const skin = SKINS[variant % SKINS.length];
  const cheek = 'rgba(23,19,15,0.10)';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${s.bg}"/>
  ${stars('rgba(255,255,255,0.75)', variant)}

  <!-- shoulders + neck -->
  <rect x="262" y="580" width="76" height="90" rx="24" fill="${skin}"/>
  <rect x="262" y="580" width="76" height="90" rx="24" fill="rgba(23,19,15,0.08)"/>
  <path d="M138 780 Q 150 652 300 652 Q 450 652 462 780 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="6"/>

  <!-- ears -->
  <circle cx="180" cy="462" r="26" fill="${skin}" stroke="${INK}" stroke-width="6"/>
  <circle cx="420" cy="462" r="26" fill="${skin}" stroke="${INK}" stroke-width="6"/>

  <!-- head -->
  <ellipse cx="${CX}" cy="${HCY}" rx="${HRX}" ry="${HRY}" fill="${skin}" stroke="${INK}" stroke-width="6"/>

  <!-- hair -->
  ${hairSvg(s)}
  ${extrasSvg(s, skin)}

  <!-- face -->
  <circle cx="256" cy="452" r="10" fill="${INK}"/>
  <circle cx="344" cy="452" r="10" fill="${INK}"/>
  <path d="M240 424 q 16 -12 34 -6" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M326 418 q 18 -6 34 6" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M270 520 Q 300 546 330 520" stroke="${INK}" stroke-width="8" fill="none" stroke-linecap="round"/>
  <ellipse cx="228" cy="496" rx="16" ry="10" fill="${cheek}"/>
  <ellipse cx="372" cy="496" rx="16" ry="10" fill="${cheek}"/>
</svg>`;
}

async function main() {
  const root = path.join(__dirname, '..', 'assets', 'styles');
  fs.mkdirSync(root, { recursive: true });
  let count = 0;
  for (const s of STYLES) {
    const dir = path.join(root, s.id);
    fs.mkdirSync(dir, { recursive: true });
    for (let v = 1; v <= 4; v++) {
      await sharp(Buffer.from(svgFor(s, v - 1))).png().toFile(path.join(dir, `ref_${v}.png`));
      count++;
    }
    fs.copyFileSync(path.join(dir, 'ref_1.png'), path.join(dir, 'thumb.png'));
    count++;
    console.log(`  ✓ ${s.id}`);
  }
  console.log(`\nGenerated ${count} illustrations for ${STYLES.length} styles.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
