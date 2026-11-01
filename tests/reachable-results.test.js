import { capabilityFor } from '../src/data/capabilities.js';
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
import { scenarios } from '../src/data/scenarios.js';

const contracts = ['sqlserver', 'postgres', 'mysql', 'mariadb', 'mongodb', 'cassandra'];

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
      assert.deepEqual(resultIssues(result, serviceById, sourceById, ruleById, capabilityFor), [], JSON.stringify(answers));
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

test('document alternatives respect declared engine/client contracts in engine-inclusive reachable sweeps', (t) => {
  const engines = [...contracts, 'unknown', 'other', undefined];
  const sweeps = [
    { workload: ['migration', 'mixed'], dataShape: ['documents'], relationships: null, accessPattern: null, migrationIntent: null, engine: engines, geography: null },
    { workload: ['mixed'], dataShape: ['mixed'], relationships: ['aggregate', 'joins', 'unknown'], accessPattern: ['document-aggregate', 'partition-key-lookup', 'unknown'], engine: engines, geography: null, sourceFiles: null, durable: ['yes'], recordModel: ['documents'] }
  ];
  let checked = 0;
  for (const domains of sweeps) {
    for (const answers of reachableAnswers(domains, { persistence: 'durable', recovery: 'important' })) {
      const result = evaluate(answers);
      checked++;
      const ids = result.candidates.map((item) => item.serviceId);
      if (contracts.includes(answers.engine)) assert.deepEqual(result.alsoAssess || [], [], JSON.stringify(answers));
      if (['mongodb', 'cassandra'].includes(answers.engine)) assert.ok(!ids.includes('cosmos-nosql'), JSON.stringify(answers));
      if (!contracts.includes(answers.engine) && (answers.dataShape === 'documents' || answers.recordModel === 'documents') && ['shortlist', 'primary-candidate', 'multi-store'].includes(result.kind) && ids.some((id) => ['cosmos-nosql', 'azure-sql-db', 'postgres-flex'].includes(id))) {
        for (const id of ['azure-sql-db', 'postgres-flex']) {
          assert.ok(ids.includes(id) || result.alsoAssess?.some((item) => item.serviceId === id), JSON.stringify(answers));
        }
      }
    }
  }
  t.diagnostic(`Engine-inclusive pruned UI-answer sweep: ${checked} results across nine engine states, migration intent and document/composite paths.`);
});

test('document contracts preserve MongoDB and Cassandra choices without cross-engine JSON prompts', () => {
  const mongo = scenarios.find((scenario) => scenario.id === 'mongodb-migration').answers;
  for (const geography of ['single-region', 'multi-region-read', 'multi-region-write']) {
    const input = { ...mongo, geography };
    assert.deepEqual(evaluate(input).candidates.map((item) => item.serviceId), ['azure-documentdb', 'cosmos-mongo-ru']);
    assert.deepEqual(evaluate(input).alsoAssess, []);
    const cassandra = { ...input, engine: 'cassandra', constraints: [] };
    assert.deepEqual(evaluate(cassandra).candidates.map((item) => item.serviceId), ['cosmos-other-apis', 'managed-cassandra']);
    for (const requirement of [{ relationships: 'joins' }, { consistency: 'business-atomic' }]) {
      assert.deepEqual(evaluate({ ...cassandra, ...requirement }).candidates.map((item) => item.serviceId), ['cosmos-other-apis', 'managed-cassandra', 'azure-sql-db', 'postgres-flex']);
    }
    for (const engine of ['mysql', 'mariadb', 'postgres', 'sqlserver']) {
      assert.deepEqual(evaluate({ ...input, engine }).alsoAssess, []);
    }
    const composite = evaluate({ ...input, workload: 'mixed', dataShape: 'mixed', durable: 'yes', recordModel: 'documents', sourceFiles: 'yes' });
    assert.deepEqual(composite.alsoAssess, []);
    assert.deepEqual(composite.architecture.find((node) => node.id === 'records').serviceIds, ['azure-documentdb', 'cosmos-mongo-ru']);
  }
  for (const engine of [undefined, 'unknown', 'other']) {
    const result = evaluate({ ...scenarios.find((scenario) => scenario.id === 'distributed-json').answers, engine });
    assert.deepEqual(result.alsoAssess.map((item) => item.serviceId), ['azure-sql-db', 'postgres-flex']);
  }
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
  }
});
