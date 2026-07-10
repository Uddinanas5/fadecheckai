/**
 * Generates the app's cartoon art set with OpenAI gpt-image-2.
 *
 *   OPENAI_API_KEY=... node scripts/gen-art.mjs            # generate missing only
 *   OPENAI_API_KEY=... node scripts/gen-art.mjs --force    # regenerate everything
 *   OPENAI_API_KEY=... node scripts/gen-art.mjs buzz-cut   # only jobs matching a filter
 *
 * The key is read from the environment and never written to disk. Requests go
 * through curl so they use the sandbox HTTPS proxy. Output PNGs are committed;
 * the key is not.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const KEY = process.env.OPENAI_API_KEY;
const FORCE = process.argv.includes('--force');
const FILTER = process.argv.slice(2).find((a) => !a.startsWith('--'));
const MODEL = 'gpt-image-2';

if (!KEY) {
  console.error('Missing OPENAI_API_KEY in environment.');
  process.exit(1);
}

// Shared style so every image feels like one set.
const STYLE =
  'Modern 3D rendered stylized-realistic cartoon character, Pixar / Disney animation style, ' +
  'soft realistic shading and skin, believable detailed hair, expressive friendly face, ' +
  'lifelike proportions with cartoonish charm, clean high detail, crisp studio lighting, ' +
  'no text, no watermark, no logo';

// The 18 catalog styles: precise haircut description + background pop color.
const STYLES = [
  { id: 'low-taper-fade', cut: 'a clean low taper fade, subtle fade just above the ears with length kept on top', bg: '#B4EC2E' },
  { id: 'mid-taper-fade', cut: 'a mid taper fade starting at the temples, textured length on top', bg: '#FF4D9D' },
  { id: 'high-taper-fade', cut: 'a bold high taper fade with strong contrast and volume on top', bg: '#FFD12E' },
  { id: 'low-skin-fade', cut: 'a low skin fade blended down to bare skin near the ears, neat top', bg: '#7A5CFF' },
  { id: 'mid-skin-fade', cut: 'a crisp mid skin fade with high contrast and styled length on top', bg: '#14C7A8' },
  { id: 'high-skin-fade', cut: 'a dramatic high skin fade taken high up the sides, full volume on top', bg: '#FF6A3D' },
  { id: 'burst-fade', cut: 'a burst fade curving around the ears with textured length at the back', bg: '#3B6BFF' },
  { id: 'drop-fade', cut: 'a drop fade that arcs lower behind the ears following the head shape', bg: '#FF4D9D' },
  { id: 'textured-crop', cut: 'a textured crop, short choppy hair on top styled forward with a small fringe and faded sides', bg: '#B4EC2E' },
  { id: 'french-crop', cut: 'a french crop with a short blunt fringe across the forehead and faded sides', bg: '#FFD12E' },
  { id: 'buzz-cut', cut: 'a very short uniform buzz cut, clean and even all over', bg: '#7A5CFF' },
  { id: 'crew-cut', cut: 'a neat crew cut, slightly longer at the front tapering shorter at the back and sides', bg: '#14C7A8' },
  { id: 'classic-side-part', cut: 'a classic side part combed neatly to one side with a defined part line and tapered sides', bg: '#FF6A3D' },
  { id: 'modern-quiff', cut: 'a modern quiff styled up and back with volume at the front and faded sides', bg: '#3B6BFF' },
  { id: 'pompadour', cut: 'a bold pompadour with high volume swept up and back off the forehead, faded sides', bg: '#FF4D9D' },
  { id: 'textured-fringe', cut: 'a textured fringe styled forward across the forehead with faded sides', bg: '#B4EC2E' },
  { id: 'curly-top-fade', cut: 'natural curly hair with volume on top and clean faded sides', bg: '#FFD12E' },
  { id: 'mid-length-flow', cut: 'a mid-length flow hairstyle, longer hair swept back behind the ears with natural movement', bg: '#14C7A8' },
];

// Rotating personas so the catalog looks like a diverse set of real people.
const PERSONAS = [
  'a young man', 'a man in his twenties', 'a teenage boy', 'a young Black man',
  'a young Asian man', 'a young Latino man', 'a man with light stubble', 'a young man',
];

const ANGLES = [
  'front-facing head and shoulders portrait, looking at camera',
  'three-quarter left profile view clearly showing the haircut from the side',
  'three-quarter right/back view clearly showing the haircut shape at the back and sides',
];

// Build the job list.
const jobs = [];

// Per-style: 3 angle shots. thumb = the front shot (ref_1).
STYLES.forEach((s, i) => {
  ANGLES.forEach((angle, a) => {
    const persona = PERSONAS[(i + a) % PERSONAS.length];
    jobs.push({
      id: `${s.id}/ref_${a + 1}`,
      out: path.join(ROOT, 'assets', 'styles', s.id, `ref_${a + 1}.png`),
      size: '1024x1536',
      target: { w: 600, h: 800 },
      prompt: `${STYLE}. A ${angle} of ${persona} with ${s.cut}. Solid vibrant ${s.bg} background. Fun, friendly, colourful.`,
    });
  });
  // thumbnail is a copy of ref_1 (front shot) — handled after generation.
  jobs.push({ copyFrom: path.join(ROOT, 'assets', 'styles', s.id, 'ref_1.png'), out: path.join(ROOT, 'assets', 'styles', s.id, 'thumb.png') });
});

// Hero + mascot + onboarding art.
const ART = [
  { id: 'hero-create', cut: 'a cool confident young man with a fresh clean mid-fade haircut and a warm friendly smile, wearing a colourful casual jacket', bg: '#FBF3E4', size: '1024x1024', target: { w: 1000, h: 1000 } },
  { id: 'mascot-barber', cut: 'a friendly cartoon barber mascot holding clippers and a comb, wearing an apron, big welcoming smile', bg: '#7A5CFF', size: '1024x1024', target: { w: 800, h: 800 } },
  { id: 'onboarding-1', cut: 'a happy young woman with a stylish modern haircut taking a selfie with her phone', bg: '#FF4D9D', size: '1024x1536', target: { w: 800, h: 1000 } },
  { id: 'onboarding-2', cut: 'a group of three diverse friends with cool different haircuts smiling together', bg: '#14C7A8', size: '1024x1536', target: { w: 800, h: 1000 } },
];
ART.forEach((a) => {
  jobs.push({
    id: a.id,
    out: path.join(ROOT, 'assets', 'art', `${a.id}.png`),
    size: a.size,
    target: a.target,
    prompt: `${STYLE}. ${a.cut}. Solid ${a.bg} background. Centered, playful, high quality.`,
  });
});

function genImage(prompt, size, outPath, target) {
  const body = JSON.stringify({ model: MODEL, prompt, size, n: 1 });
  const tmp = path.join(os.tmpdir(), `art-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(tmp, body);
  let raw;
  try {
    raw = execFileSync(
      'curl',
      ['-sS', '--max-time', '240', 'https://api.openai.com/v1/images/generations',
        '-H', `Authorization: Bearer ${KEY}`, '-H', 'Content-Type: application/json',
        '-d', `@${tmp}`],
      { maxBuffer: 64 * 1024 * 1024, encoding: 'utf8' },
    );
  } finally {
    fs.rmSync(tmp, { force: true });
  }
  const data = JSON.parse(raw);
  if (data.error) throw new Error(data.error.message || 'image error');
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error('no image returned');
  return Buffer.from(b64, 'base64');
}

async function run() {
  let done = 0, skipped = 0, failed = 0;
  const total = jobs.filter((j) => !j.copyFrom).length;
  for (const job of jobs) {
    if (FILTER && !job.out.includes(FILTER)) continue;

    // Copy jobs (thumb = ref_1) run after their source exists.
    if (job.copyFrom) {
      if (fs.existsSync(job.copyFrom)) {
        fs.mkdirSync(path.dirname(job.out), { recursive: true });
        fs.copyFileSync(job.copyFrom, job.out);
      }
      continue;
    }

    if (!FORCE && fs.existsSync(job.out)) { skipped++; continue; }
    fs.mkdirSync(path.dirname(job.out), { recursive: true });
    process.stdout.write(`[${done + skipped + failed + 1}/${total}] ${job.id} … `);
    try {
      const png = genImage(job.prompt, job.size, job.out, job.target);
      await sharp(png)
        .resize(job.target.w, job.target.h, { fit: 'cover', position: 'top' })
        .png()
        .toFile(job.out);
      done++;
      console.log('ok');
    } catch (e) {
      failed++;
      console.log('FAILED: ' + e.message);
    }
  }
  // Second pass: resolve copy jobs now that refs exist.
  for (const job of jobs) {
    if (job.copyFrom && fs.existsSync(job.copyFrom)) {
      fs.mkdirSync(path.dirname(job.out), { recursive: true });
      fs.copyFileSync(job.copyFrom, job.out);
    }
  }
  console.log(`\nDone: ${done} generated, ${skipped} skipped, ${failed} failed.`);
  if (failed > 0) process.exitCode = 1;
}

run();
