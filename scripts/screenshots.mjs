import { chromium } from '@playwright/test';
import { execFileSync, spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, ['scripts/build.mjs', '--preview'], { cwd: root, stdio: 'inherit' });
const server = spawn(process.execPath, ['scripts/serve.mjs'], { cwd: root, env: { ...process.env, PORT: '4187' }, stdio: 'pipe' });
server.stderr.on('data', (data) => process.stderr.write(data));
const base = 'http://127.0.0.1:4187/azure-database-navigator/';
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    if (server.exitCode !== null) throw new Error(`Screenshot server exited: ${server.exitCode}`);
    try {
      ready = (await fetch(base)).ok;
    } catch (error) {
      if (!['ECONNREFUSED', 'UND_ERR_SOCKET'].includes(error.cause?.code)) throw error;
    }
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error('Screenshot server did not become ready.');
  await mkdir(path.join(root, 'screenshots'), { recursive: true });
  browser = await chromium.launch();
  for (const width of [375, 768, 1024, 1440]) {
    for (const theme of ['light', 'dark']) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      await page.addInitScript((value) => localStorage.setItem('azure-database-navigator-theme', value), theme);
      await page.goto(base);
      await page.locator('#question-title').waitFor();
      await page.waitForFunction((expected) => getComputedStyle(document.querySelector('.answer-copy strong')).color === expected, theme === 'dark' ? 'rgb(232, 238, 245)' : 'rgb(23, 40, 62)');
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.screenshot({ path: path.join(root, 'screenshots', `assessment-${theme}-${width}.png`), fullPage: true });
      if (width === 1440) {
        await page.locator('#scenario-select').selectOption('rag');
        await page.locator('.architecture-flow').waitFor();
        await page.locator('[aria-label="Architecture responsibilities"]').screenshot({ path: path.join(root, 'screenshots', `rag-architecture-${theme}-${width}.png`) });
        await page.getByRole('button', { name: 'Compare Services', exact: true }).click();
        await page.screenshot({ path: path.join(root, 'screenshots', `comparison-${theme}-${width}.png`), fullPage: true });
      }
      await page.close();
    }
  }
  console.log('Captured 12 genuine Chromium screenshots of the subpath build in light/dark themes.');
} finally {
  if (browser) await browser.close();
  server.kill();
}
