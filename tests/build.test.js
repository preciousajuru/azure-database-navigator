import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { validateLocalLinks } from '../scripts/links.mjs';
import { verificationIssue, resultIssues, evidenceLinkIssues, isHubSource } from '../scripts/validation.mjs';
import { evaluate } from '../src/logic/recommendations.js';
import { scenarios } from '../src/data/scenarios.js';
import { serviceById } from '../src/data/services.js';
import { sourceById } from '../src/data/sources.js';
import { ruleById } from '../src/data/rules.js';
import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { privateDocs, publicDocs } from '../scripts/publication.mjs';
import { sourceRegisterTable } from '../scripts/source-register.mjs';

test('capability hubs and unregistered article evidence are rejected', () => {
  assert.equal(isHubSource({ url: 'https://learn.microsoft.com/en-us/azure/search/' }), true);
  assert.equal(isHubSource({ url: 'https://learn.microsoft.com/en-us/azure/search/vector-search-overview' }), false);
  assert.deepEqual(evidenceLinkIssues('[Evidence](https://learn.microsoft.com/test)', [{ url: 'https://learn.microsoft.com/test' }]), []);
  assert.equal(evidenceLinkIssues('[Evidence](https://learn.microsoft.com/missing)', []).length, 1);
  assert.deepEqual(evidenceLinkIssues('[Companion](https://github.com/preciousajuru/azure-compute-navigator)', []), []);
});

test('production build contains published docs but never internal drafts, and uses the canonical source register', async () => {
  execFileSync(process.execPath, ['scripts/build.mjs'], { stdio: 'pipe' });
  const pages = await readdir(new URL('../dist/docs/', import.meta.url));
  for (const name of privateDocs) assert.ok(!pages.includes(name.replace('.md', '.html')));
  for (const name of publicDocs) assert.ok(pages.includes(name.replace('.md', '.html')));
  assert.equal(pages.length, publicDocs.length);
  assert.match(await readFile(new URL('../dist/docs/sources.html', import.meta.url), 'utf8'), /postgres-replicas/);
  assert.ok(!sourceRegisterTable().includes('https://learn.microsoft.com/en-us/azure/search/)'));
});

test('canonical article is publication length and the eight captures are genuine PNG files', async () => {
  const article = await readFile(new URL('../docs/article.md', import.meta.url), 'utf8');
  const words = article.split(/\s+/).length;
  assert.ok(words >= 1200 && words <= 1700, `${words} words`);
  assert.match(article, /## Introducing Azure Database Navigator/);
  assert.match(article, /## A practical example: WordPress using MariaDB/);
  const images = (await readdir(new URL('../screenshots/', import.meta.url))).filter((name) => name.endsWith('.png'));
  assert.equal(images.length, 8);
  for (const name of images) {
    const bytes = await readFile(new URL(`../screenshots/${name}`, import.meta.url));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', name);
    assert.ok(bytes.readUInt32BE(16) >= 300 && bytes.readUInt32BE(20) > 600, name);
  }
});

test('link validation resolves project-relative pages, assets and generated anchors', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'navigator-links-'));
  try {
    await mkdir(path.join(root, 'docs'));
    await writeFile(path.join(root, 'index.html'), '<main id="main"><a href="#main">Skip</a><a href="./docs/page.html#evidence">Evidence</a></main>');
    await writeFile(path.join(root, 'docs', 'page.html'), '<h1 id="evidence">Evidence</h1><a href="../">Home</a>');
    assert.equal(await validateLocalLinks(root), 2);
    await writeFile(path.join(root, 'index.html'), '<a href="./docs/page.html#missing">Broken anchor</a>');
    await assert.rejects(validateLocalLinks(root), /missing anchor/);
    await writeFile(path.join(root, 'index.html'), '<img src="./missing.png" alt="Missing">');
    await assert.rejects(validateLocalLinks(root), /missing local src/);
    await writeFile(path.join(root, 'index.html'), '<h1 id="duplicate">One</h1><p id="duplicate">Two</p>');
    await assert.rejects(validateLocalLinks(root), /duplicate anchors/);
    await writeFile(path.join(root, 'docs', 'raw.md'), '# Raw');
    await writeFile(path.join(root, 'index.html'), '<a href="./docs/raw.md">Raw</a>');
    await assert.rejects(validateLocalLinks(root), /raw Markdown/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('verification policy rejects stale, missing, impossible and future review dates', () => {
  const asOf = new Date('2026-11-01T12:00:00Z');
  assert.equal(verificationIssue('2026-11-01', asOf), null);
  assert.match(verificationIssue('2025-01-01', asOf), /180 days/);
  assert.match(verificationIssue('2026-12-01', asOf), /future/);
  assert.match(verificationIssue('2026-02-31', asOf), /Invalid/);
  assert.match(verificationIssue(undefined, asOf), /Missing/);
});

test('every fixture has complete results and hard exclusions carry actual source references', () => {
  for (const scenario of scenarios) assert.deepEqual(resultIssues(evaluate(scenario.answers), serviceById, sourceById, ruleById), [], scenario.id);
  const broken = evaluate(scenarios[1].answers);
  broken.exclusions[0].sourceIds = [];
  assert.ok(resultIssues(broken, serviceById, sourceById, ruleById).some((issue) => /hard exclusion/.test(issue)));
});
