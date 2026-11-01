import test from 'node:test';
import assert from 'node:assert/strict';
import { reachableAnswers } from './reachable-answers.js';
import { evaluate } from '../src/logic/recommendations.js';
import { guidanceFor } from '../src/data/performance.js';
import { profileFor } from '../src/data/profiles.js';
import { services } from '../src/data/services.js';
import { resultIssues } from '../scripts/validation.mjs';
import { serviceById } from '../src/data/services.js';
import { sourceById } from '../src/data/sources.js';
import { ruleById } from '../src/data/rules.js';

test('UI-reachable sweep always names missing information and preserves document alternatives', (t) => {
  const sweeps = [
    { workload: null, dataShape: null, relationships: null, accessPattern: null, geography: null },
    { workload: ['search', 'cache', 'mixed', 'new-app'], dataShape: ['search', 'cache', 'mixed', 'documents', 'relational'], relationships: null, accessPattern: null, retrievalType: null, existingService: null, separateIndex: null, searchFreshness: null, sourceFiles: null, durable: null, recordModel: null }
  ];
  let checked = 0;
  let insufficient = 0;
  let documents = 0;
  for (const domains of sweeps) {
    for (const answers of reachableAnswers(domains, { persistence: 'durable', recovery: 'important' })) {
      const result = evaluate(answers);
      checked++;
      if (result.kind === 'insufficient-information') {
        insufficient++;
        assert.ok(result.unknowns.length > 0, JSON.stringify(answers));
      }
      assert.deepEqual(resultIssues(result, serviceById, sourceById, ruleById), [], JSON.stringify(answers));
      if (answers.dataShape === 'documents' && ['shortlist', 'primary-candidate'].includes(result.kind) && !result.architecture) {
        documents++;
        for (const id of ['azure-sql-db', 'postgres-flex']) {
          assert.ok(result.candidates.some((item) => item.serviceId === id) || result.alsoAssess.some((item) => item.serviceId === id), JSON.stringify(answers));
        }
      }
    }
  }
  assert.ok(checked > 100000 && insufficient > 0 && documents > 0, `${checked} checked, ${insufficient} insufficient, ${documents} document shortlists`);
  t.diagnostic(`Pruned UI-answer sweep: ${checked} results; ${insufficient} insufficient outcomes have named unknowns; ${documents} document shortlists preserve relational alternatives.`);
});

test('retained vector assessment is conclusive, while index and source gaps are named', () => {
  const input = { workload: 'search', dataShape: 'search', accessPattern: 'vector-similarity', retrievalType: 'vector', existingService: 'postgres-flex', separateIndex: 'no', durable: 'yes', recordModel: 'existing', recovery: 'important' };
  const retained = evaluate(input);
  assert.equal(retained.kind, 'no-database-needed');
  assert.match(retained.title, /existing store/);
  assert.equal(retained.candidates.length, 0);
  assert.equal(retained.architecture.filter((node) => node.kind === 'retained').length, 1);
  assert.equal(retained.unknowns.length, 0);
  const freshness = evaluate({ ...input, separateIndex: 'yes', searchFreshness: 'unknown' });
  assert.equal(freshness.kind, 'insufficient-information');
  assert.ok(freshness.unknowns.some((text) => /freshness is unknown/.test(text)));
  assert.ok(evaluate({ ...input, separateIndex: 'unknown' }).unknowns.some((text) => /separate managed index is required is unknown/.test(text)));
  const source = evaluate({ ...input, durable: 'no', existingService: 'unknown' });
  assert.ok(source.unknowns.some((text) => /authoritative content source/.test(text)));
});

test('result guidance cites retrieval and replica evidence only in the matching scope', () => {
  for (const service of services) {
    const ordinary = guidanceFor([service.id]);
    assert.ok(ordinary.every((entry) => !entry.sourceIds.includes('vector-selection')));
    for (const [source, ids] of [
      ['postgres-replicas', ['postgres-flex']],
      ['mysql-overview', ['mysql-flex']],
      ['sql-read-replicas', ['azure-sql-db', 'azure-sql-mi']]
    ]) {
      assert.equal(ordinary.some((entry) => entry.sourceIds.includes(source)), ids.includes(service.id), service.id);
    }
  }
  assert.ok(guidanceFor(['postgres-flex'], { retrieval: true }).some((entry) => entry.sourceIds.includes('vector-selection')));
  const migration = guidanceFor(['azure-sql-mi', 'sql-server-vm']);
  assert.ok(migration.every((entry) => !entry.sourceIds.some((id) => ['postgres-replicas', 'mysql-overview', 'vector-selection'].includes(id))));
});

test('descriptive profile fields carry evidence but never a support status', () => {
  for (const service of services) {
    const profile = profileFor(service);
    for (const key of ['whatItIs', 'model', 'engineApi', 'role']) {
      assert.ok(profile[key].text && profile[key].sourceIds.length);
      assert.equal(profile[key].status, undefined);
    }
    assert.ok(profile.limits.status);
    assert.ok(profile.compatibility.status);
  }
});
