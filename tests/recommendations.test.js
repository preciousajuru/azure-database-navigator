import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate } from '../src/logic/recommendations.js';
import { scenarios } from '../src/data/scenarios.js';
import { serviceById } from '../src/data/services.js';

const ids = (result) => result.candidates.map((candidate) => candidate.serviceId);

for (const scenario of scenarios) {
  test(`scenario: ${scenario.title}`, () => {
    const result = evaluate(scenario.answers);
    for (const id of scenario.expected) assert.ok(ids(result).includes(id), `${id} missing from ${result.kind}`);
    for (const id of ids(result)) {
      assert.notEqual(serviceById[id].lifecycle, 'retired-service', `${id} is retired`);
      assert.notEqual(serviceById[id].lifecycle, 'retirement-path', `${id} is on a retirement path`);
    }
    assert.ok(result.kind);
    assert.ok(Array.isArray(result.sourceIds));
  });
}

test('relational business records shortlist SQL Server and PostgreSQL independently of language', () => {
  const base = { workload: 'new-app', dataShape: 'relational', accessPattern: 'relational-queries', constraints: ['relationships'], geography: 'single-region', recovery: 'important' };
  const first = evaluate({ ...base, language: 'C#' });
  const second = evaluate({ ...base, language: 'Python' });
  assert.deepEqual(ids(first), ['azure-sql-db', 'postgres-flex']);
  assert.deepEqual(ids(second), ids(first));
  assert.equal(first.kind, 'shortlist');
  assert.ok(!ids(first).includes('cosmos-nosql'));
});

test('JSON syntax without a defined document access pattern is insufficient information', () => {
  const result = evaluate({ workload: 'new-app', dataShape: 'documents', accessPattern: 'unknown', geography: 'single-region', recovery: 'important' });
  assert.equal(result.kind, 'insufficient-information');
  assert.deepEqual(ids(result), []);
  assert.match(result.unknowns.join(' '), /JSON syntax alone/);
});

test('SQL Server instance features distinguish Managed Instance and VM from SQL Database', () => {
  const result = evaluate({ workload: 'migration', dataShape: 'relational', engine: 'sqlserver', constraints: ['sql-instance-features'], geography: 'single-region', recovery: 'defined' });
  assert.deepEqual(ids(result), ['azure-sql-mi', 'sql-server-vm']);
  assert.ok(result.exclusions.some((item) => item.serviceId === 'azure-sql-db' && item.sourceIds.includes('azure-sql-decision')));
});

test('OS-level control is an explicit reason to consider SQL Server on a VM', () => {
  const result = evaluate({ workload: 'migration', dataShape: 'relational', engine: 'sqlserver', constraints: ['os-control'], geography: 'single-region', recovery: 'important' });
  assert.deepEqual(ids(result), ['sql-server-vm']);
});

test('an existing SQL Server engine does not automatically imply a VM', () => {
  const result = evaluate({ workload: 'migration', dataShape: 'relational', engine: 'sqlserver', constraints: [], geography: 'single-region', recovery: 'important' });
  assert.deepEqual(ids(result), ['azure-sql-db', 'azure-sql-mi']);
  assert.ok(!ids(result).includes('sql-server-vm'));
});

test('MariaDB application mapping to MySQL remains conditional and is not engine retirement advice', () => {
  const result = evaluate({ workload: 'migration', dataShape: 'relational', engine: 'mariadb', constraints: ['mariadb-app'], geography: 'single-region', recovery: 'important' });
  assert.deepEqual(ids(result), ['mysql-flex']);
  assert.match(result.candidates[0].caveat, /not assumed/);
  assert.match(serviceById['azure-mariadb-service'].summary, /MariaDB as a database engine is not retired/);
});

test('PostgreSQL extension requirements remain a validation gate', () => {
  const result = evaluate({ workload: 'migration', dataShape: 'relational', engine: 'postgres', constraints: ['postgres-extension'], geography: 'single-region', recovery: 'important', requirementsNotes: 'extension example' });
  assert.deepEqual(ids(result), ['postgres-flex']);
  assert.match(result.candidates[0].caveat, /allow-list/);
  assert.ok(result.unknowns.some((item) => /exact PostgreSQL extension/.test(item)));
});

test('global latency can make Cosmos DB a candidate without requiring multi-region writes', () => {
  const result = evaluate({ workload: 'new-app', dataShape: 'documents', accessPattern: 'partition-key-lookup', constraints: ['global-latency'], geography: 'multi-region-read', recovery: 'important' });
  assert.ok(ids(result).includes('cosmos-nosql'));
  assert.ok(result.candidates.find((item) => item.serviceId === 'cosmos-nosql').caveat.includes('A relational system can remain appropriate'));
  assert.ok(!result.unknowns.some((item) => /multi-region write/.test(item)));
});

test('MongoDB options remain distinct with feature-level validation caveats', () => {
  const result = evaluate({ workload: 'migration', dataShape: 'documents', engine: 'mongodb', constraints: ['mongo-features'], geography: 'single-region', recovery: 'important' });
  assert.deepEqual(ids(result), ['azure-documentdb', 'cosmos-mongo-ru']);
  assert.ok(result.candidates.every((item) => /feature|commands|aggregations/i.test(item.caveat)));
  assert.notEqual(serviceById['azure-documentdb'].id, serviceById['cosmos-mongo-ru'].id);
  assert.ok(serviceById['azure-documentdb'].aliases.includes('Cosmos DB for MongoDB (vCore)'));
});

test('Cassandra engine and Cassandra API remain separate options with a version gate', () => {
  const result = evaluate({ workload: 'migration', dataShape: 'mixed', engine: 'cassandra', geography: 'single-region', recovery: 'important' });
  assert.deepEqual(ids(result), ['cosmos-other-apis', 'cosmos-cassandra']);
  assert.equal(serviceById['cosmos-cassandra'].capabilities.cassandraCompatibility.status, 'conditional');
  assert.ok(serviceById['cosmos-cassandra'].sourceIds.includes('cassandra-managed-overview'));
  assert.match(result.candidates.find((item) => item.serviceId === 'cosmos-cassandra').caveat, /version 5\.0/);
});

test('RAG separates object source, search index and optional durable application state', () => {
  const result = evaluate({ workload: 'search', dataShape: 'search', accessPattern: 'full-text', durable: 'yes', geography: 'single-region', recovery: 'important' });
  assert.equal(result.kind, 'multi-store');
  assert.deepEqual(ids(result), ['blob-storage', 'ai-search', 'azure-sql-db']);
  assert.ok(result.architecture.some((item) => item.serviceId === 'ai-search' && /indexing lag/.test(item.boundary)));
  assert.ok(result.architecture.some((item) => item.serviceId === 'blob-storage'));
});

test('cache is never represented as the durable record store', () => {
  const result = evaluate({ workload: 'cache', dataShape: 'cache', durable: 'yes', geography: 'single-region', recovery: 'basic' });
  assert.equal(result.kind, 'multi-store');
  assert.deepEqual(ids(result), ['managed-redis', 'azure-sql-db']);
  assert.equal(result.architecture.find((item) => item.serviceId === 'managed-redis').role, 'Cache');
});

test('files-only is a no-database-needed outcome', () => {
  const result = evaluate({ workload: 'files', dataShape: 'files', accessPattern: 'object-delivery', geography: 'single-region', recovery: 'important' });
  assert.equal(result.kind, 'no-database-needed');
  assert.deepEqual(ids(result), ['blob-storage']);
});

test('explicitly no persistent storage produces no database candidate', () => {
  const result = evaluate({ workload: 'new-app', persistence: 'no', dataShape: 'unknown', geography: 'unknown', recovery: 'unknown' });
  assert.equal(result.kind, 'no-database-needed');
  assert.deepEqual(ids(result), []);
  assert.ok(result.ruleIds.includes('no-persistent-store'));
});

test('file storage and an explicit no-persistence answer remain unresolved', () => {
  const result = evaluate({ workload: 'files', persistence: 'no', dataShape: 'files', geography: 'single-region', recovery: 'basic' });
  assert.equal(result.kind, 'insufficient-information');
  assert.deepEqual(ids(result), []);
  assert.ok(result.unknowns.some((item) => /File\/object storage keeps data persistently/.test(item)));
});

test('unknown persistence stays explicit and does not become a negative requirement', () => {
  const result = evaluate({ workload: 'new-app', persistence: 'unknown', dataShape: 'relational', constraints: ['relationships'], geography: 'single-region', recovery: 'important' });
  assert.equal(result.kind, 'shortlist');
  assert.deepEqual(ids(result), ['azure-sql-db', 'postgres-flex']);
  assert.ok(result.unknowns.some((item) => /Whether the workload needs a persistent data store/.test(item)));
});

test('tenant shape remains an explicit architecture decision', () => {
  const result = evaluate({ workload: 'new-app', dataShape: 'relational', constraints: ['relationships', 'tenant-isolation'], geography: 'single-region', recovery: 'important' });
  assert.ok(result.decisions.some((decision) => /Shared versus separate tenant/.test(decision.outcome)));
  assert.ok(result.unknowns.some((item) => /tenant databases/.test(item)));
});

test('strict recovery and security do not imply a verified region, compliance or guarantee', () => {
  const result = evaluate({ workload: 'new-app', dataShape: 'relational', constraints: ['relationships', 'hard-consistency'], security: ['encryption', 'private-network', 'residency', 'compliance'], geography: 'residency', recovery: 'defined' });
  assert.ok(result.unknowns.some((item) => /region-specific service availability/.test(item)));
  assert.ok(result.unknowns.some((item) => /RPO\/RTO targets/.test(item)));
  assert.ok(result.unknowns.some((item) => /no compliance guarantee/.test(item)));
  assert.ok(!JSON.stringify(result).includes('compliant'));
});

test('retirement-path and retired services never appear as new candidates', () => {
  const results = [
    evaluate({ workload: 'new-app', dataShape: 'relational', engine: 'postgres', geography: 'single-region', recovery: 'important' }),
    evaluate({ workload: 'cache', dataShape: 'cache', durable: 'no', geography: 'single-region', recovery: 'basic' })
  ];
  assert.ok(results.flatMap(ids).every((id) => !['cosmos-pg', 'azure-mariadb-service', 'azure-cache-redis-legacy'].includes(id)));
});

test('recommendations have no numeric score and explain their source trail', () => {
  const result = evaluate({ workload: 'new-app', dataShape: 'relational', constraints: ['relationships'], geography: 'single-region', recovery: 'important' });
  assert.equal(Object.hasOwn(result, 'score'), false);
  assert.ok(result.candidates.every((item) => item.reason.length > 10));
  assert.ok(result.sourceIds.every((id) => typeof id === 'string'));
  assert.ok(result.ruleIds.includes('relational-integrity'));
});
