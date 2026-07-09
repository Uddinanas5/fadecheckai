// Interactive end-to-end driver for FadeCheck (web build).
//
// Drives the REAL app through clicks — every tab, button, filter chip, gallery,
// toggle and back-nav — capturing console/page errors per interaction and
// asserting expected content. Produces a JSON report + screenshots.
//
// Prereqs: `npx expo export --platform web` (creates dist/), and a Chromium for
// playwright-core (auto-detected under /opt/pw-browsers, or set PLAYWRIGHT_CHROMIUM).
//
// Run: node e2e/drive.mjs   (exits non-zero if any hard check fails)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { startServer } from './server.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'artifacts');
const PORT = Number(process.env.PORT) || 8899;
const BASE = `http://localhost:${PORT}`;

function findChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM && fs.existsSync(process.env.PLAYWRIGHT_CHROMIUM)) {
    return process.env.PLAYWRIGHT_CHROMIUM;
  }
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try {
    const dirs = fs.readdirSync(base).filter((d) => d.startsWith('chromium-') && !d.includes('headless'));
    for (const d of dirs.sort().reverse()) {
      const p = path.join(base, d, 'chrome-linux', 'chrome');
      if (fs.existsSync(p)) return p;
    }
  } catch {}
  return undefined; // let playwright-core try its default
}

const seed = () => {
  localStorage.setItem('fadecheck_onboarding_completed', 'true');
  localStorage.setItem('fadecheck_first_scan_completed', 'true');
  localStorage.setItem('fadecheck_ai_consent', 'true');
  localStorage.setItem('fadecheck_ai_consent_shown', 'true');
};

// 1x1 png data url used as a stand-in "user photo".
const PHOTO =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const report = { checks: [], issues: [], startedAt: Date.now() };
let page, ctx, browser, server;
let stepErrors = [];

function record(name, ok, detail = '') {
  report.checks.push({ name, ok, detail });
  const tag = ok ? 'PASS' : 'FAIL';
  if (!ok) report.issues.push({ name, detail });
  console.log(`  [${tag}] ${name}${detail ? ' — ' + detail : ''}`);
}

async function shot(name) {
  try {
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  } catch {}
}

async function hasText(t) {
  return (await page.getByText(t, { exact: false }).count()) > 0;
}

// Return srcs of <img> elements that failed to load (broken require paths etc.).
async function brokenImages() {
  return page.evaluate(() =>
    [...document.querySelectorAll('img')]
      .filter((i) => i.complete && i.naturalWidth === 0)
      .map((i) => i.currentSrc || i.src)
      .slice(0, 5),
  );
}

// Detect horizontal overflow (layout blowout) on the current screen.
async function horizontalOverflow() {
  return page.evaluate(() => {
    const sw = document.documentElement.scrollWidth;
    const iw = window.innerWidth;
    return sw > iw + 2 ? { scrollWidth: sw, innerWidth: iw } : null;
  });
}

const ALL_STYLE_IDS = [
  'low-taper-fade', 'mid-taper-fade', 'high-taper-fade', 'low-skin-fade',
  'mid-skin-fade', 'high-skin-fade', 'burst-fade', 'drop-fade',
  'textured-crop', 'french-crop', 'buzz-cut', 'crew-cut',
  'classic-side-part', 'modern-quiff', 'pompadour', 'textured-fringe',
  'curly-top-fade', 'mid-length-flow',
];

async function clickText(t, { which = 'first' } = {}) {
  const loc = page.getByText(t, { exact: false });
  const n = await loc.count();
  if (n === 0) throw new Error(`no element with text "${t}"`);
  const target = which === 'last' ? loc.last() : loc.first();
  await target.scrollIntoViewIfNeeded().catch(() => {});
  await target.click({ timeout: 5000 });
}

// Wrap a step: reset per-step error buffer, run, attribute console errors.
async function step(name, fn) {
  stepErrors = [];
  try {
    await fn();
  } catch (e) {
    record(name, false, `threw: ${e.message}`);
    await shot('ERR_' + name.replace(/[^a-z0-9]+/gi, '_'));
    return;
  }
  const appErrs = stepErrors.filter(isAppError);
  if (appErrs.length) {
    record(name, false, `console/page errors: ${appErrs.slice(0, 2).join(' | ')}`);
  } else {
    record(name, true);
  }
}

// Filter out known-benign web-only noise (native SDKs / camera CDN worker).
function isAppError(msg) {
  return !/singleton|configure Purchases|rev\.cat|jsQR|jsdelivr|ERR_CONNECTION_RESET|Failed to load resource|importScripts|net::ERR/i.test(
    msg,
  );
}

async function goHome() {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  server = await startServer(PORT);
  const executablePath = findChromium();
  browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
  ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') stepErrors.push(m.text()); });
  page.on('pageerror', (e) => stepErrors.push('PAGEERROR: ' + e.message));
  const dialogs = [];
  page.on('dialog', async (d) => { dialogs.push(d.message()); await d.dismiss().catch(() => {}); });

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.addInitScript(seed);
  await goHome();

  console.log('\n== Suite A: tab navigation ==');
  await step('Home (Create) renders', async () => {
    if (!(await hasText('See it before'))) throw new Error('missing hero');
    await shot('A_create');
  });
  await step('Tab -> Styles', async () => {
    await clickText('Styles', { which: 'last' });
    await page.waitForTimeout(900);
    if (!(await hasText('Low Taper Fade'))) throw new Error('catalog not shown');
    await shot('A_styles');
  });
  await step('Tab -> Rate', async () => {
    await clickText('Rate', { which: 'last' });
    await page.waitForTimeout(900);
    await shot('A_rate');
  });
  await step('Tab -> Profile', async () => {
    await clickText('Profile', { which: 'last' });
    await page.waitForTimeout(900);
    if (!(await hasText('YOUR LOOKS'))) throw new Error('profile not shown');
    await shot('A_profile');
  });
  await step('Tab -> Create', async () => {
    await clickText('Create', { which: 'last' });
    await page.waitForTimeout(900);
    if (!(await hasText('See it before'))) throw new Error('back to create failed');
  });

  console.log('\n== Suite B: Styles filters + card open ==');
  await page.goto(BASE + '/styles', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  for (const chip of ['Fades', 'Tapers', 'Crops', 'Buzz Cuts', 'Curly', 'All']) {
    await step(`Filter chip: ${chip}`, async () => {
      await clickText(chip);
      await page.waitForTimeout(500);
      const cards = await page.locator('img').count();
      if (cards === 0) throw new Error('no cards after filter');
    });
  }
  await step('Open style card from catalog', async () => {
    await clickText('Mid Taper Fade');
    await page.waitForTimeout(1000);
    if (!(await hasText('Ask your barber'))) throw new Error('detail did not open');
    await shot('B_detail');
  });

  console.log('\n== Suite C: Style detail interactions ==');
  await page.goto(BASE + '/style/mid-taper-fade', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await step('Detail without photo: CTA becomes "Add your photo" -> Create', async () => {
    // No imageUri param, so the CTA should relabel to "Add your photo".
    if (!(await hasText('Add your photo'))) throw new Error('CTA did not relabel without a photo');
    await clickText('Add your photo');
    await page.waitForTimeout(900);
    if (!(await hasText('See it before'))) throw new Error('did not route to Create to add a photo');
  });
  await step('Detail: back button returns', async () => {
    await page.goBack();
    await page.waitForTimeout(800);
  });

  console.log('\n== Suite D: Try-on (demo) ==');
  const tryonUrl = `${BASE}/tryon?id=mid-taper-fade&imageUri=${encodeURIComponent(PHOTO)}`;
  await page.goto(tryonUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4500);
  await step('Try-on completes (demo)', async () => {
    if (!(await hasText('Try another style')) && !(await hasText('AFTER'))) {
      throw new Error('try-on did not reach done state');
    }
    await shot('D_tryon');
  });
  await step('Try-on: hold-to-compare toggle', async () => {
    const toggle = page.getByText('Hold to compare', { exact: false }).first();
    await toggle.dispatchEvent('pointerdown').catch(() => {});
    await page.waitForTimeout(300);
    await toggle.dispatchEvent('pointerup').catch(() => {});
  });
  await step('Try-on: Save button', async () => {
    await clickText('Save');
    await page.waitForTimeout(600);
  });
  await step('Try-on: Share button', async () => {
    await clickText('Share');
    await page.waitForTimeout(600);
  });
  await step('Try-on: Try another style -> Styles', async () => {
    await clickText('Try another style');
    await page.waitForTimeout(1000);
    if (!(await hasText('Low Taper Fade'))) throw new Error('did not land on Styles');
  });

  console.log('\n== Suite E: Recommendations ==');
  await page.goto(BASE + '/recommendations', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await step('Recommendations render + open a rec', async () => {
    if (!(await hasText('Recommended for you'))) throw new Error('no recommendations header');
    await clickText('Low Taper Fade');
    await page.waitForTimeout(1000);
    if (!(await hasText('Ask your barber'))) throw new Error('rec card did not open detail');
  });
  await step('Recommendations: Browse all styles link', async () => {
    await page.goto(BASE + '/recommendations', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await clickText('Browse all styles');
    await page.waitForTimeout(1000);
    if (!(await hasText('Low Taper Fade'))) throw new Error('browse-all did not reach Styles');
  });

  console.log('\n== Suite F: Profile menu + secondary screens ==');
  await page.goto(BASE + '/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const menu = [
    { label: 'Your looks', expect: 'Your looks' },
    { label: 'Settings', expect: 'Settings' },
    { label: 'Help & Support', expect: 'Support' },
    { label: 'About FadeCheck', expect: 'About' },
    { label: 'Privacy Policy', expect: 'Privacy' },
    { label: 'Terms of Service', expect: 'Terms' },
  ];
  for (const m of menu) {
    await step(`Profile menu -> ${m.label}`, async () => {
      await page.goto(BASE + '/profile', { waitUntil: 'networkidle' });
      await page.waitForTimeout(700);
      await clickText(m.label, { which: 'last' });
      await page.waitForTimeout(900);
      if (!(await hasText(m.expect))) throw new Error(`screen for ${m.label} did not render`);
    });
  }

  console.log('\n== Suite G: History ==');
  await page.goto(BASE + '/history', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await step('History renders (has saved try-on)', async () => {
    const populated = await hasText('Mid Taper Fade');
    const empty = await hasText('Nothing saved yet');
    if (!populated && !empty) throw new Error('history neither populated nor empty-state');
    await shot('G_history');
  });

  console.log('\n== Suite H0: tab bar labels fully visible ==');
  await step('Tab labels not clipped by viewport bottom', async () => {
    await goHome();
    const vh = 896;
    for (const label of ['Create', 'Styles', 'Rate', 'Profile']) {
      const box = await page.getByText(label, { exact: true }).last().boundingBox();
      if (box && box.y + box.height > vh + 1) {
        throw new Error(`"${label}" label extends ${Math.round(box.y + box.height - vh)}px below viewport`);
      }
    }
  });

  console.log('\n== Suite H: image integrity + layout overflow ==');
  const screens = [
    { url: '/', name: 'Create' },
    { url: '/styles', name: 'Styles' },
    { url: '/style/mid-taper-fade', name: 'Style detail' },
    { url: '/profile', name: 'Profile' },
    { url: '/recommendations', name: 'Recommendations' },
  ];
  for (const s of screens) {
    await step(`No broken images: ${s.name}`, async () => {
      await page.goto(BASE + s.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);
      const broken = await brokenImages();
      if (broken.length) throw new Error(`broken images: ${broken.join(', ')}`);
    });
    await step(`No horizontal overflow: ${s.name}`, async () => {
      const ov = await horizontalOverflow();
      if (ov) throw new Error(`overflow ${ov.scrollWidth}px > ${ov.innerWidth}px viewport`);
    });
  }

  console.log('\n== Suite I: every catalog style opens with a loaded gallery ==');
  for (const id of ALL_STYLE_IDS) {
    await step(`Style opens: ${id}`, async () => {
      await page.goto(`${BASE}/style/${id}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(700);
      if (!(await hasText('Ask your barber'))) throw new Error('detail did not render');
      const broken = await brokenImages();
      if (broken.length) throw new Error(`gallery image failed to load`);
    });
  }

  console.log('\n== Suite J: real "Choose from library" upload -> recommendations ==');
  await step('Create: pick from library routes to recommendations', async () => {
    // Write a temp PNG for the file chooser.
    const upload = path.join(OUT, 'upload.png');
    fs.writeFileSync(upload, Buffer.from(PHOTO.split(',')[1], 'base64'));
    await goHome();
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 8000 }),
      clickText('Choose from library'),
    ]);
    await chooser.setFiles(upload);
    // analyze (no API key -> error result) then proceed to recommendations.
    await page.waitForFunction(
      () => location.pathname.includes('recommendations') ||
            document.body.innerText.includes('Recommended for you'),
      { timeout: 15000 },
    );
    await shot('J_after_upload');
    if (!(await hasText('Recommended for you'))) throw new Error('did not reach recommendations');
  });

  report.dialogs = dialogs;
  report.finishedAt = Date.now();
  const passed = report.checks.filter((c) => c.ok).length;
  const failed = report.checks.length - passed;
  console.log(`\n==== ${passed}/${report.checks.length} checks passed, ${failed} failed ====`);
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));

  await browser.close();
  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error('DRIVER FATAL', e);
  try { await browser?.close(); } catch {}
  try { server?.close(); } catch {}
  process.exit(2);
});
