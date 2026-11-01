import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { validateLocalLinks } from '../scripts/links.mjs';
import { verificationIssue, resultIssues } from '../scripts/validation.mjs';
import { evaluate } from '../src/logic/recommendations.js';
import { scenarios } from '../src/data/scenarios.js';
import { serviceById } from '../src/data/services.js';
import { sourceById } from '../src/data/sources.js';
import { ruleById } from '../src/data/rules.js';

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
