export const performanceGuidance = [
  { serviceIds: [], text: 'Profile real access patterns, query plans, indexes, concurrency and throughput. Measure app-to-database proximity, network latency and round trips; maximum advertised scale is not evidence that a workload performs better.', sourceIds: ['performance-design', 'sql-performance', 'vector-selection'] },
  { serviceIds: ['azure-sql-db', 'azure-sql-mi', 'sql-server-vm', 'postgres-flex', 'mysql-flex'], text: 'Review relational query/index design and connection pooling before adding compute. For Azure SQL, return idle connections promptly, keep transactions short and implement deliberate transient-failure handling.', sourceIds: ['performance-design', 'sql-performance', 'sql-development', 'postgres-overview'] },
  { serviceIds: ['cosmos-nosql'], text: 'Design partition keys around actual access and distribution. Check hot partitions, cross-partition queries, transaction scope, indexing and request-unit consumption with representative traffic.', sourceIds: ['cosmos-partitioning', 'partition-design', 'cosmos-transactions'] },
  { serviceIds: ['postgres-flex', 'mysql-flex', 'azure-sql-db', 'azure-sql-mi'], text: 'Read replicas offload eligible reads, not every write. PostgreSQL/MySQL replication is asynchronous; SQL read-scale replicas can also lag relative to committed primary writes. Test read-after-write requirements on the primary and monitor lag; replica availability is configuration-specific.', sourceIds: ['postgres-replicas', 'mysql-overview', 'sql-read-replicas'] },
  { serviceIds: ['managed-redis'], text: 'Define cache-miss reloads, expiry, eviction and invalidation. Test stale data and outage behaviour independently of the authoritative store; cache-aside does not guarantee consistency.', sourceIds: ['cache-aside', 'managed-redis-overview'] },
  { serviceIds: ['ai-search'], text: 'Measure ingestion freshness, indexing/query load and independent rebuild time. Test source-database vector retrieval first; copied indexes do not make every write immediately searchable.', sourceIds: ['vector-selection', 'search-vector'] }
];

export function guidanceFor(ids) {
  return performanceGuidance.filter((item) => !item.serviceIds.length || item.serviceIds.some((id) => ids.includes(id)));
}
