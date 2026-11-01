export const performanceGuidance = [
  { serviceIds: [], text: 'Profile real access patterns, query plans, indexes, concurrency and throughput. Measure app-to-database proximity, network latency and round trips; maximum advertised scale is not evidence that a workload performs better.', sourceIds: ['performance-design'] },
  { serviceIds: ['azure-sql-db'], text: 'Review SQL Database queries, indexes and statistics before adding compute. Chatty round trips and concurrency problems can persist on larger configurations.', sourceIds: ['sql-performance'] },
  { serviceIds: ['azure-sql-db', 'azure-sql-mi'], text: 'For Azure SQL applications, return idle pooled connections promptly, keep transactions short and implement deliberate transient-failure handling.', sourceIds: ['sql-development'] },
  { serviceIds: ['postgres-flex'], text: 'Assess PostgreSQL connection behaviour and whether the optional built-in PgBouncer fits the workload; validate extension, query and configuration needs.', sourceIds: ['postgres-overview'] },
  { serviceIds: ['cosmos-nosql'], text: 'Design partition keys around actual access and distribution. Check hot partitions, cross-partition queries, transaction scope, indexing and request-unit consumption with representative traffic.', sourceIds: ['cosmos-partitioning', 'partition-design', 'cosmos-transactions'] },
  { serviceIds: ['postgres-flex'], text: 'PostgreSQL read replicas use asynchronous physical replication and offload reads, not writes. Monitor lag and use primary reads where immediate read-after-write consistency is needed; validate tier and region.', sourceIds: ['postgres-replicas'] },
  { serviceIds: ['mysql-flex'], text: 'MySQL read replicas use asynchronous binlog replication. Test replica lag and application read-after-write requirements; a read replica is not a complete recovery strategy.', sourceIds: ['mysql-overview'] },
  { serviceIds: ['azure-sql-db', 'azure-sql-mi'], text: 'SQL read-scale replicas can lag behind committed primary writes. Test immediate read-after-write requirements on the primary; read-scale availability depends on tier/configuration and is not a backup strategy.', sourceIds: ['sql-read-replicas'] },
  { serviceIds: ['managed-redis'], text: 'Define cache-miss reloads, expiry, eviction and invalidation. Test stale data and outage behaviour independently of the authoritative store; cache-aside does not guarantee consistency.', sourceIds: ['cache-aside', 'managed-redis-overview'] },
  { serviceIds: ['ai-search'], retrieval: true, text: 'Measure ingestion freshness, indexing/query load and independent rebuild time. A copied index does not make every source write immediately searchable.', sourceIds: ['ai-search-overview'] },
  { serviceIds: [], retrieval: true, text: 'Test source-database retrieval first. Verify vector dimensions, index type/status, filtering and measured latency when similarity retrieval is required; separate indexing needs an explicit role and freshness design.', sourceIds: ['vector-selection'] }
];

export function guidanceFor(ids, { retrieval = false } = {}) {
  return performanceGuidance.filter((item) => (!item.retrieval || retrieval) && (!item.serviceIds.length || item.serviceIds.some((id) => ids.includes(id))));
}
