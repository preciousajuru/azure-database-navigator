import test from 'node:test';
import assert from 'node:assert/strict';
import { services, serviceById } from '../src/data/services.js';
import { sourceById } from '../src/data/sources.js';
import { capabilityFor, capabilityKeys, capabilityStates, capabilitySections, catalogueGaps, comparisonSections, capabilityDefinitions } from '../src/data/capabilities.js';
import { capabilityMatrix } from '../src/data/capability-matrix.js';
import { evaluate } from '../src/logic/recommendations.js';
import { scenarios } from '../src/data/scenarios.js';

const ids = services.map((service) => service.id);
const cell = capabilityFor;

test('every service has a reviewed entry for every capability in the taxonomy', () => {
  assert.equal(capabilityKeys.length, 27);
  assert.deepEqual(catalogueGaps(ids), []);
  assert.deepEqual(Object.keys(capabilityMatrix).sort(), [...ids].sort());
});

test('a missing catalogue entry is detected as a data-quality error, not displayed as a state', () => {
  assert.equal(cell('not-a-service', 'acidTransactions').status, 'missing');
  assert.equal(capabilityStates.missing, undefined);
  const original = capabilityMatrix['azure-sql-db'].acidTransactions;
  delete capabilityMatrix['azure-sql-db'].acidTransactions;
  try {
    assert.deepEqual(catalogueGaps(['azure-sql-db']), ['azure-sql-db.acidTransactions: missing catalogue entry']);
  } finally {
    capabilityMatrix['azure-sql-db'].acidTransactions = original;
  }
});

test('catalogue validation rejects unsourced, unexplained and invented states', () => {
  const original = capabilityMatrix['postgres-flex'].readReplicas;
  for (const [broken, pattern] of [
    [{ ...original, sourceIds: [] }, /missing source/],
    [{ ...original, status: 'conditional', condition: '' }, /without a stated condition/],
    [{ ...original, status: 'needs-verification', condition: '' }, /without stating what to verify/],
    [{ ...original, status: 'unknown' }, /invalid state/]
  ]) {
    capabilityMatrix['postgres-flex'].readReplicas = broken;
    try { assert.match(catalogueGaps(['postgres-flex']).join('\n'), pattern); } finally { capabilityMatrix['postgres-flex'].readReplicas = original; }
  }
});

test('the vocabulary has exactly five states and no Unknown', () => {
  assert.deepEqual(Object.keys(capabilityStates), ['supported', 'conditional', 'unsupported', 'not-applicable', 'needs-verification']);
  assert.deepEqual(Object.values(capabilityStates).map((state) => state.label), ['Supported', 'Conditional', 'Not supported', 'Not applicable', 'Needs verification']);
  for (const id of ids) for (const key of capabilityKeys) {
    const { summary, condition } = cell(id, key);
    assert.doesNotMatch(`${summary} ${condition}`, /\bunknown\b/i, `${id}.${key}`);
  }
});

test('every stated capability cites registered official sources; not-applicable is explained', () => {
  for (const id of ids) for (const key of capabilityKeys) {
    const entry = cell(id, key);
    assert.ok(entry.summary.length > 10, `${id}.${key} summary`);
    for (const sourceId of entry.sourceIds) assert.ok(sourceById[sourceId], `${id}.${key} -> ${sourceId}`);
    if (entry.status !== 'not-applicable') assert.ok(entry.sourceIds.length, `${id}.${key} unsourced`);
    for (const sourceId of entry.sourceIds) assert.match(sourceById[sourceId].url, /^https:\/\//);
  }
});

test('needs-verification cells say what to verify and link an official page', () => {
  const open = ids.flatMap((id) => capabilityKeys.map((key) => ({ id, key, ...cell(id, key) }))).filter((entry) => entry.status === 'needs-verification');
  for (const entry of open) {
    assert.ok(entry.condition.length > 15, `${entry.id}.${entry.key}`);
    assert.ok(entry.sourceIds.length, `${entry.id}.${entry.key}`);
  }
});

test('descriptive rows carry no state chip; stateful rows never use description', () => {
  for (const id of ids) for (const key of capabilityKeys) {
    assert.equal(cell(id, key).status === 'description', capabilityDefinitions[key].descriptive, `${id}.${key}`);
  }
});

test('documented facts from the brief are represented precisely', () => {
  assert.notEqual(cell('cosmos-nosql', 'sqlServerEngine').status, 'supported', 'Cosmos DB for NoSQL is not the SQL Server engine');
  assert.notEqual(cell('cosmos-nosql', 'relationalEngine').status, 'supported');
  assert.equal(cell('azure-sql-db', 'sqlServerEngine').status, 'supported');
  assert.equal(cell('azure-sql-db', 'jsonQuerying').status, 'supported', 'SQL Database supports JSON');
  assert.notEqual(cell('azure-sql-db', 'documentModel').status, 'supported', 'JSON support is not a native document model');
  assert.equal(cell('cosmos-nosql', 'documentModel').status, 'supported');
  assert.equal(cell('azure-sql-db', 'crossDatabaseQuery').status, 'unsupported', 'no native three-part-name cross-database queries');
  assert.equal(cell('azure-sql-db', 'federatedQuery').status, 'conditional');
  assert.match(cell('azure-sql-db', 'federatedQuery').condition, /preview/i, 'Elastic Query is preview with limitations');
  assert.equal(cell('azure-sql-db', 'acidTransactions').status, 'supported');
  assert.ok(['supported', 'conditional'].includes(cell('cosmos-nosql', 'acidTransactions').status), 'Cosmos DB documents ACID transactions');
  assert.match(`${cell('cosmos-nosql', 'transactionScope').summary} ${cell('cosmos-nosql', 'acidTransactions').condition}`, /logical partition/i);
  assert.equal(cell('cosmos-nosql', 'configurableConsistency').status, 'supported', 'five consistency levels');
  assert.equal(cell('azure-sql-db', 'configurableConsistency').status, 'not-applicable', 'SQL isolation levels are not distributed consistency levels');
  assert.match(cell('azure-sql-db', 'readConsistency').summary, /isolation/i);
  assert.equal(cell('azure-sql-mi', 'sqlAgent').status, 'supported');
  assert.equal(cell('azure-sql-db', 'sqlAgent').status, 'unsupported');
  assert.equal(cell('azure-sql-db', 'clrSupport').status, 'unsupported');
  assert.equal(cell('sql-server-vm', 'osControl').status, 'supported');
  assert.equal(cell('azure-sql-db', 'osControl').status, 'unsupported');
});

test('unsupported and not-applicable are distinct and both appear', () => {
  const statuses = ids.flatMap((id) => capabilityKeys.map((key) => cell(id, key).status));
  assert.ok(statuses.includes('unsupported'));
  assert.ok(statuses.includes('not-applicable'));
  assert.equal(capabilityStates.unsupported.label, 'Not supported');
  assert.notEqual(capabilityStates.unsupported.label, capabilityStates['not-applicable'].label);
  // Non-database stores do not have SQL instance features: not applicable rather than a defect.
  for (const id of ['blob-storage', 'managed-redis', 'ai-search']) assert.equal(cell(id, 'sqlAgent').status, 'not-applicable', id);
});

test('lifecycle cells agree with the catalogue', () => {
  for (const service of services) {
    const status = cell(service.id, 'newDeployment').status;
    if (service.lifecycle === 'retired-service') assert.equal(status, 'unsupported', service.id);
    else if (service.lifecycle === 'retirement-path') assert.ok(['unsupported', 'conditional'].includes(status), service.id);
    else assert.notEqual(status, 'unsupported', service.id);
  }
});

test('comparison sections are driven by the same matrix for any 2–3 selection', () => {
  const selections = [
    ['azure-sql-db', 'cosmos-nosql'],
    ['azure-sql-db', 'azure-sql-mi', 'sql-server-vm'],
    ['postgres-flex', 'mysql-flex', 'azure-documentdb'],
    ['managed-redis', 'blob-storage', 'ai-search'],
    ['fabric-warehouse', 'fabric-lakehouse', 'data-explorer']
  ];
  for (const selection of selections) {
    const selected = selection.map((id) => serviceById[id]);
    const sections = comparisonSections(selected);
    assert.deepEqual(sections.map((section) => section.id), capabilitySections.map((section) => section.id));
    for (const section of sections) {
      assert.equal(section.rows.length + section.hiddenRows.length, capabilitySections.find((item) => item.id === section.id).capabilities.length);
      for (const row of section.rows) {
        assert.equal(row.cells.length, selection.length);
        row.cells.forEach((entry, index) => assert.deepEqual({ status: entry.status, summary: entry.summary }, { status: cell(selection[index], row.key).status, summary: cell(selection[index], row.key).summary }));
        assert.ok(row.cells.some((entry) => entry.status !== 'not-applicable'));
      }
    }
  }
});

test('engine consistency: hard exclusions trace to documented unsupported capabilities', () => {
  for (const scenario of scenarios) {
    for (const exclusion of evaluate(scenario.answers).exclusions) {
      assert.ok(exclusion.capabilityKeys?.length, `${scenario.id}: ${exclusion.serviceId}`);
      assert.ok(exclusion.capabilityKeys.some((key) => cell(exclusion.serviceId, key).status === 'unsupported'), `${scenario.id}: ${exclusion.serviceId}`);
    }
  }
  const os = evaluate({ workload: 'migration', dataShape: 'relational', engine: 'sqlserver', migrationIntent: 'assess', constraints: ['os-control'] });
  assert.deepEqual(os.exclusions.map((item) => item.capabilityKeys), [['osControl']]);
});

test('engine consistency: vector options come only from supported or conditional matrix cells', () => {
  for (const service of services) {
    const result = evaluate({ workload: 'search', dataShape: 'search', accessPattern: 'vector-similarity', retrievalType: 'vector', existingService: service.id, separateIndex: 'no', durable: 'yes', recordModel: 'existing' });
    const decision = result.decisions.find((item) => item.id === 'vector-existing-first' && item.outcome.startsWith('First test vector retrieval'));
    const status = cell(service.id, 'vectorSearch').status;
    if (decision) assert.ok(['supported', 'conditional'].includes(status), `${service.id} offered with ${status}`);
    else if (['supported', 'conditional'].includes(status) && !service.lifecycle) assert.fail(`${service.id} documented vector support was ignored`);
  }
});

test('engine consistency: no retired service is recommended and no needs-verification cell excludes a service', () => {
  for (const scenario of scenarios) {
    const result = evaluate(scenario.answers);
    for (const item of result.candidates) assert.notEqual(cell(item.serviceId, 'newDeployment').status, 'unsupported', `${scenario.id}: ${item.serviceId}`);
    for (const exclusion of result.exclusions) for (const key of exclusion.capabilityKeys) assert.notEqual(cell(exclusion.serviceId, key).status, 'needs-verification');
  }
});
