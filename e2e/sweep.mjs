// Responsive sweep — captures key screens at multiple viewport widths and
// flags horizontal overflow / oversized elements per size. The fixed-width
// gallery misses breakage that only appears on small phones or desktop.
//
// Run: node e2e/sweep.mjs   (requires dist/)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { startServer } from './server.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'artifacts', 'sweep');
const PORT = 8896;
const BASE = `http://localhost:${PORT}`;

function findChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  const dirs = fs.readdirSync(base).filter((d) => d.startsWith('chromium-') && !d.includes('headless'));
  return path.join(base, dirs.sort().reverse()[0], 'chrome-linux', 'chrome');
}

const PHOTO =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const VIEWPORTS = [
  { name: 'se', width: 320, height: 568 },
  { name: 'mid', width: 375, height: 667 },
  { name: 'big', width: 414, height: 896 },
  { name: 'desktop', width: 1280, height: 800 },
];

const SCREENS = [
  { name: 'create', url: '/' },
  { name: 'styles', url: '/styles' },
  { name: 'detail', url: '/style/mid-taper-fade' },
  { name: 'recs', url: '/recommendations' },
  { name: 'profile', url: '/profile' },
  { name: 'tryon', url: `/tryon?id=buzz-cut&imageUri=${encodeURIComponent(PHOTO)}`, wait: 4200 },
];

const seed = () => {
  localStorage.setItem('fadecheck_onboarding_completed', 'true');
  localStorage.setItem('fadecheck_first_scan_completed', 'true');
  localStorage.setItem('fadecheck_ai_consent', 'true');
  localStorage.setItem('fadecheck_ai_consent_shown', 'true');
};

const findings = [];
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const server = await startServer(PORT);
const browser = await chromium.launch({ executablePath: findChromium(), args: ['--no-sandbox'] });

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.addInitScript(seed);
  for (const sc of SCREENS) {
    await page.goto(BASE + sc.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(sc.wait ?? 1400);
    const name = `${vp.name}-${sc.name}`;
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    const issue = await page.evaluate(() => {
      const sw = document.documentElement.scrollWidth;
      const iw = window.innerWidth;
      const wide = [...document.querySelectorAll('*')]
        .filter((e) => e.getBoundingClientRect().width > iw + 4)
        .slice(0, 3)
        .map((e) => `${e.tagName}.${String(e.className).slice(0, 30)} ${Math.round(e.getBoundingClientRect().width)}px`);
      return sw > iw + 2 ? { overflow: `${sw}>${iw}`, wide } : null;
    });
    if (issue) findings.push({ screen: name, ...issue });
    console.log(`  📸 ${name}${issue ? '  ⚠ overflow ' + issue.overflow : ''}`);
  }
  await ctx.close();
}

fs.writeFileSync(path.join(OUT, 'findings.json'), JSON.stringify(findings, null, 2));
console.log(`\nSweep complete. Findings: ${findings.length}`);
findings.forEach((f) => console.log(`  ⚠ [${f.screen}] ${f.overflow} ${f.wide?.join(' | ') ?? ''}`));

await browser.close();
server.close();
process.exit(0);
