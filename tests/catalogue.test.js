import test from 'node:test';
import assert from 'node:assert/strict';
import { services, serviceById } from '../src/data/services.js';
import { sources, sourceById } from '../src/data/sources.js';
import { getQuestions } from '../src/data/questions.js';
import { rules, ruleById } from '../src/data/rules.js';

test('service and source identifiers are unique and all material references resolve', () => {
  assert.equal(new Set(services.map((service) => service.id)).size, services.length);
  assert.equal(new Set(sources.map((source) => source.id)).size, sources.length);
  for (const service of services) {
    assert.ok(service.name && service.kind && service.model && service.api && service.role);
    assert.ok(service.sourceIds.length);
    for (const id of service.sourceIds) assert.ok(sourceById[id], `${service.id} missing source ${id}`);
    for (const [name, capability] of Object.entries(service.capabilities)) {
      assert.ok(['supported', 'unsupported', 'conditional', 'unknown', 'not-applicable'].includes(capability.status), `${service.id}.${name}`);
      if (capability.status !== 'unknown') assert.ok(capability.sourceIds.length, `${service.id}.${name} has no evidence`);
      for (const id of capability.sourceIds) assert.ok(sourceById[id], `${service.id}.${name} missing source ${id}`);
    }
  }
});

test('all references have HTTPS URLs, dates and explicit limitations', () => {
  for (const source of sources) {
    assert.ok(source.url.startsWith('https://'), source.id);
    assert.ok(source.published, source.id);
    assert.ok(source.verifiedOn, source.id);
    assert.ok(source.evidence, source.id);
    assert.ok(source.limitation, source.id);
  }
});

test('unknown capability remains different from unsupported', () => {
  assert.equal(serviceById['azure-documentdb'].capabilities.featureCompatibility.status, 'conditional');
  assert.equal(serviceById['cosmos-mongo-ru'].capabilities.featureCompatibility.status, 'conditional');
  assert.ok(serviceById['azure-documentdb'].aliases.includes('Cosmos DB for MongoDB (vCore)'));
  assert.notEqual(serviceById['cosmos-mongo-ru'].id, serviceById['azure-documentdb'].id);
});

test('migration-specific questions are skipped for a fresh relational application', () => {
  const questionIds = getQuestions({ workload: 'new-app', dataShape: 'relational' }).map((question) => question.id);
  assert.ok(!questionIds.includes('engine'));
  assert.ok(questionIds.includes('accessPattern'));
  assert.ok(questionIds.includes('recovery'));
});

test('migration and cache flows reveal only applicable extra questions', () => {
  const migration = getQuestions({ workload: 'migration', dataShape: 'relational', constraints: ['postgres-extension'] }).map((question) => question.id);
  const cache = getQuestions({ workload: 'cache', dataShape: 'cache' }).map((question) => question.id);
  assert.ok(migration.includes('engine'));
  assert.ok(migration.includes('requirementsNotes'));
  assert.ok(cache.includes('durable'));
  assert.ok(!cache.includes('engine'));
});

test('every profile retains a model, protocol, role and bounded evidence state', () => {
  assert.ok(services.length >= 20);
  assert.ok(services.some((service) => service.id === 'blob-storage' && service.role === 'File and object store'));
  assert.ok(services.some((service) => service.id === 'ai-search' && service.role === 'Derived index / retrieval'));
  assert.ok(services.some((service) => service.id === 'managed-redis' && service.role === 'Cache or transient data'));
  assert.ok(services.some((service) => service.id === 'cosmos-nosql' && service.api.includes('NoSQL API')));
});

test('every stable rule identifies services/configuration, limitations, sources, date and test', () => {
  assert.equal(new Set(rules.map((rule) => rule.id)).size, rules.length);
  for (const rule of rules) {
    assert.ok(ruleById[rule.id]);
    assert.ok(rule.conditions);
    assert.ok(rule.configuration);
    assert.ok(rule.limitations);
    assert.ok(rule.test);
    assert.equal(rule.verifiedOn, '2026-11-01');
    assert.ok(rule.sourceIds.every((id) => sourceById[id]));
  }
});
