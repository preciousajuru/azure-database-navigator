import { chromium } from '@playwright/test';
import { execFileSync, spawn } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
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
  const captures = [
    { width: 1024, theme: 'light', view: 'assessment-midflow' },
    { width: 1440, theme: 'light', view: 'result' },
    { width: 375, theme: 'dark', view: 'result' },
    { width: 1440, theme: 'light', view: 'explorer' },
    { width: 1440, theme: 'light', view: 'comparison' },
    { width: 768, theme: 'dark', view: 'comparison' },
    { width: 1440, theme: 'light', view: 'architecture' },
    { width: 375, theme: 'dark', view: 'architecture' }
  ];
  for (const { width, theme, view } of captures) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      await page.addInitScript((value) => localStorage.setItem('azure-database-navigator-theme', value), theme);
      await page.goto(base);
      await page.locator('#question-title').waitFor();
      await page.waitForFunction((expected) => getComputedStyle(document.querySelector('.answer-copy strong')).color === expected, theme === 'dark' ? 'rgb(232, 238, 245)' : 'rgb(23, 40, 62)');
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      let target = page;
      if (view === 'assessment-midflow') {
        await page.locator('input[name="workload"][value="new-app"]').check();
        await page.locator('[data-action="continue"]').click();
        await page.locator('input[name="persistence"][value="durable"]').check();
        await page.locator('[data-action="continue"]').click();
        await page.locator('input[name="dataShape"][value="relational"]').check();
        for (let step = 0; step < 15 && !await page.locator('input[name="accessPattern"]').count(); step++) await page.locator('[data-action="continue"]').click();
        await page.getByRole('radio', { name: 'Joins, constraints or changes spanning related records' }).check();
      } else if (view === 'result') {
        await page.locator('#scenario-select').selectOption('sqlserver-migration');
        await page.locator('.result-card').first().waitFor();
        await page.getByRole('heading', { name: 'Open questions', exact: true }).waitFor();
      } else if (view === 'architecture') {
        await page.locator('#scenario-select').selectOption('rag');
        await page.locator('.architecture-flow').waitFor();
        target = page.locator('[aria-label="Architecture responsibilities"]');
      } else if (view === 'explorer') {
        await page.getByRole('button', { name: 'Explore Azure Databases', exact: true }).first().click();
        await page.locator('#family-filter').selectOption('Relational');
        const mi = page.locator('.service-card').filter({ has: page.getByRole('heading', { name: 'Azure SQL Managed Instance', exact: true }) });
        await mi.getByText('Service profile: what it is and how it differs', { exact: true }).click();
      } else if (view === 'comparison') {
        await page.getByRole('button', { name: 'Compare Services', exact: true }).click();
      }
      if (!await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)) throw new Error(`Overflow: ${view} ${theme} ${width}`);
      const file = path.join(root, 'screenshots', `${view}-${theme}-${width}.png`);
      await target.screenshot({ path: file, ...(target === page ? { fullPage: true } : { style: '.topbar, .sidebar { position: static !important; }' }) });
      console.log(`Captured ${view}-${theme}-${width}.png`);
      await page.close();
  }
  const oldFiles = [
    'assessment-light-375.png', 'assessment-dark-375.png', 'assessment-light-768.png', 'assessment-dark-768.png',
    'assessment-light-1024.png', 'assessment-dark-1024.png', 'assessment-light-1440.png', 'assessment-dark-1440.png',
    'rag-architecture-light-1440.png', 'rag-architecture-dark-1440.png', 'comparison-dark-1440.png'
  ];
  for (const name of oldFiles) await rm(path.join(root, 'screenshots', name), { force: true });
  console.log('Captured 8 genuine Chromium screenshots; removed only named superseded captures. Local build, not deployment evidence.');
} finally {
  if (browser) await browser.close();
  server.kill();
}
