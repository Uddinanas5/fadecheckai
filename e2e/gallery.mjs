// Full-app screenshot gallery — captures every screen and state so a human
// (or model) can visually review the whole product in one pass.
//
// Also runs cheap automated heuristics per screen (console errors, horizontal
// overflow, broken images) and writes them to artifacts/gallery/findings.json.
//
// Run: node e2e/gallery.mjs   (requires dist/ from `npx expo export --platform web`)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { startServer } from './server.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'artifacts', 'gallery');
const PORT = Number(process.env.PORT) || 8897;
const BASE = `http://localhost:${PORT}`;

function findChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try {
    const dirs = fs.readdirSync(base).filter((d) => d.startsWith('chromium-') && !d.includes('headless'));
    for (const d of dirs.sort().reverse()) {
      const p = path.join(base, d, 'chrome-linux', 'chrome');
      if (fs.existsSync(p)) return p;
    }
  } catch {}
  return undefined;
}

const PHOTO =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// A realistic rating for the results screen.
const MOCK_RESULT = {
  overall_level: 'SHARP',
  scores: { lineup: 'strong', fade: 'solid', blend: 'strong', shape: 'solid', freshness: 'strong' },
  areas_to_improve: ['Ask for a touch more blending at the temples', 'Keep the neckline natural'],
  breakdown:
    'Clean, confident work. Your lineup is crisp and the blend flows nicely into the top — a couple of temple details away from elite.',
  verdict: 'Fresh cut — keep this barber.',
  hair_profile: {
    hair_type: '2B',
    hair_type_name: 'Type 2B - Defined Waves',
    hair_type_description: 'Medium-textured S-waves with good body.',
    density: 'medium',
    density_description: 'Balanced fullness across the head.',
  },
  face_analysis: {
    face_shape: 'oval',
    face_shape_description: 'Balanced proportions — most styles work for you.',
    style_recommendation: 'Textured crops and mid fades suit you especially well.',
  },
  fade_details: { fade_type: 'mid', fade_type_name: 'Mid Skin Fade', fade_description: 'Balanced contrast starting at the temples.' },
  maintenance: { days_until_touchup: '10-14 days', maintenance_schedule: 'Every 2 weeks', maintenance_tip: 'Book ahead — skin fades grow out fast.' },
  product_recommendations: [{ product_type: 'Clay', why: 'Matte finish that keeps your waves defined without weight.' }],
};

const HISTORY_ENTRIES = [
  { kind: 'tryon', id: 't1', timestamp: 2, tryOn: { id: 't1', styleId: 'buzz-cut', styleName: 'Buzz Cut', sourceImageUri: PHOTO, generatedImageUri: PHOTO, createdAt: 2 } },
  { kind: 'rating', id: 'r1', timestamp: 1, imageUri: PHOTO, result: MOCK_RESULT },
];

const seedAll = () => {
  localStorage.setItem('fadecheck_onboarding_completed', 'true');
  localStorage.setItem('fadecheck_first_scan_completed', 'true');
  localStorage.setItem('fadecheck_ai_consent', 'true');
  localStorage.setItem('fadecheck_ai_consent_shown', 'true');
};

const findings = [];
let browser, server;

function isAppError(msg) {
  return !/singleton|configure Purchases|rev\.cat|jsQR|jsdelivr|ERR_CONNECTION_RESET|Failed to load resource|importScripts|net::ERR/i.test(msg);
}

async function newPage(ctx) {
  const page = await ctx.newPage();
  page.errors = [];
  page.on('console', (m) => { if (m.type() === 'error') page.errors.push(m.text()); });
  page.on('pageerror', (e) => page.errors.push('PAGEERROR: ' + e.message));
  page.on('dialog', async (d) => { await d.dismiss().catch(() => {}); });
  return page;
}

async function heuristics(page, name) {
  const overflow = await page.evaluate(() => {
    const sw = document.documentElement.scrollWidth;
    const iw = window.innerWidth;
    return sw > iw + 2 ? `${sw}px content in ${iw}px viewport` : null;
  });
  const broken = await page.evaluate(() =>
    [...document.querySelectorAll('img')]
      .filter((i) => i.complete && i.naturalWidth === 0)
      .map((i) => (i.currentSrc || i.src).slice(-60))
      .slice(0, 3),
  );
  const errs = page.errors.filter(isAppError);
  if (overflow) findings.push({ screen: name, type: 'overflow', detail: overflow });
  if (broken.length) findings.push({ screen: name, type: 'broken-images', detail: broken.join(', ') });
  if (errs.length) findings.push({ screen: name, type: 'console', detail: errs.slice(0, 2).join(' | ') });
  page.errors = [];
}

async function snap(page, name, { wait = 1400, full = false } = {}) {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: full });
  await heuristics(page, name);
  console.log(`  📸 ${name}`);
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  server = await startServer(PORT);
  browser = await chromium.launch({ executablePath: findChromium(), args: ['--no-sandbox'] });

  // ---- Main context: fully seeded, phone viewport -------------------------
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await newPage(ctx);
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.addInitScript(seedAll);

  const go = (url) => page.goto(BASE + url, { waitUntil: 'networkidle' });

  await go('/');            await snap(page, '01-create');
  await go('/');            await snap(page, '01-create-full', { full: true });
  await go('/styles');      await snap(page, '02-styles');
  await go('/styles');      await snap(page, '02-styles-full', { full: true });
  await go('/rate');        await snap(page, '03-rate');
  await go('/profile');     await snap(page, '04-profile');
  await go('/profile');     await snap(page, '04-profile-full', { full: true });

  await go('/recommendations'); await snap(page, '05-recs-popular');
  const result = encodeURIComponent(JSON.stringify(MOCK_RESULT));
  await go(`/recommendations?imageUri=${encodeURIComponent(PHOTO)}&result=${result}`);
  await snap(page, '05-recs-tailored');

  await go('/style/mid-taper-fade');  await snap(page, '06-detail-nophoto');
  await go('/style/mid-taper-fade');  await snap(page, '06-detail-full', { full: true });
  await go(`/style/buzz-cut?imageUri=${encodeURIComponent(PHOTO)}`);
  await snap(page, '06-detail-withphoto');

  await go(`/tryon?id=mid-taper-fade&imageUri=${encodeURIComponent(PHOTO)}`);
  await snap(page, '07-tryon-loading', { wait: 500 });
  await snap(page, '07-tryon-done', { wait: 3500 });

  await go('/history');     await snap(page, '08-history-empty');
  await page.evaluate((e) => localStorage.setItem('fadecheck_history', JSON.stringify(e)), HISTORY_ENTRIES);
  await go('/history');     await snap(page, '08-history-populated');
  await go('/profile');     await snap(page, '04-profile-withlooks');
  await page.evaluate(() => localStorage.removeItem('fadecheck_history'));

  await go(`/results?imageUri=${encodeURIComponent(PHOTO)}&result=${result}`);
  await snap(page, '09-results');
  await go(`/results?imageUri=${encodeURIComponent(PHOTO)}&result=${result}`);
  await snap(page, '09-results-full', { full: true });

  await go('/settings');          await snap(page, '10-settings');
  await go('/support');           await snap(page, '11-support');
  await go('/about');             await snap(page, '12-about');
  await go('/privacy-policy');    await snap(page, '13-privacy');
  await go('/terms-of-service');  await snap(page, '14-terms');
  await ctx.close();

  // ---- Fresh contexts: first-run states ------------------------------------
  {
    const c = await browser.newContext({ viewport: { width: 414, height: 896 } });
    const p = await newPage(c);
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await snap(p, '15-onboarding-1');
    await c.close();
  }
  {
    const c = await browser.newContext({ viewport: { width: 414, height: 896 } });
    const p = await newPage(c);
    await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await p.addInitScript(() => localStorage.setItem('fadecheck_onboarding_completed', 'true'));
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1600);
    await p.screenshot({ path: path.join(OUT, '16-beginscan.png') });
    await heuristics(p, '16-beginscan');
    console.log('  📸 16-beginscan');
    await c.close();
  }
  {
    const c = await browser.newContext({ viewport: { width: 414, height: 896 } });
    const p = await newPage(c);
    await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await p.addInitScript(() => {
      localStorage.setItem('fadecheck_onboarding_completed', 'true');
      localStorage.setItem('fadecheck_first_scan_completed', 'true');
    });
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1800);
    await p.screenshot({ path: path.join(OUT, '17-consent-modal.png') });
    await heuristics(p, '17-consent-modal');
    console.log('  📸 17-consent-modal');
    await c.close();
  }

  // ---- Wide viewport (tablet-ish) overflow sanity ---------------------------
  {
    const c = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const p = await newPage(c);
    await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await p.addInitScript(seedAll);
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1400);
    await p.screenshot({ path: path.join(OUT, '18-wide-create.png') });
    await heuristics(p, '18-wide-create');
    console.log('  📸 18-wide-create');
    await p.goto(BASE + '/styles', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1400);
    await p.screenshot({ path: path.join(OUT, '18-wide-styles.png') });
    await heuristics(p, '18-wide-styles');
    console.log('  📸 18-wide-styles');
    await c.close();
  }

  fs.writeFileSync(path.join(OUT, 'findings.json'), JSON.stringify(findings, null, 2));
  console.log(`\nGallery complete. Automated findings: ${findings.length}`);
  findings.forEach((f) => console.log(`  ⚠ [${f.screen}] ${f.type}: ${f.detail}`));

  await browser.close();
  server.close();
  process.exit(0);
}

main().catch(async (e) => {
  console.error('GALLERY FATAL', e);
  try { await browser?.close(); } catch {}
  try { server?.close(); } catch {}
  process.exit(2);
});
