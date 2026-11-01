import { capabilityFor } from './capabilities.js';

// Narrative profile only. Capability states (compatibility, scaling, recovery, networking, operations, cost)
// live in the reviewed capability matrix so the explorer, comparison and engine share one evidence base.
export const profileLabels = {
  whatItIs: 'What it is', model: 'Data model', engineApi: 'Engine / API', role: 'Data role',
  differsFrom: 'How it differs', typicalWorkloads: 'Typical workloads', migrationFit: 'Migration fit', lifecycle: 'Lifecycle'
};

const description = (text, sourceIds) => ({ text, sourceIds });
const details = {
  'azure-sql-db': {
    source: 'sql-db-overview',
    differsFrom: 'Database-scoped PaaS rather than a Managed Instance or an OS-controlled VM.',
    typicalWorkloads: 'Application records, relational joins and business transactions; JSON can coexist with relational columns.',
    migrationFit: 'Assess database-scoped SQL Server workloads; required instance or OS features can favour MI or VM.',
    extraSources: ['azure-sql-features', 'azure-sql-decision', 'sql-development', 'sql-json']
  },
  'azure-sql-mi': {
    source: 'sql-mi-overview',
    differsFrom: 'An instance-scoped SQL Server PaaS service with native VNet integration; unlike SQL Database it exposes instance features such as SQL Agent.',
    typicalWorkloads: 'SQL Server applications with jobs, linked servers or cross-database dependencies that pass feature assessment.',
    migrationFit: 'Favour assessment when SQL Server instance dependencies exceed database-scoped options; OS/file-path dependencies still need testing.',
    extraSources: ['azure-sql-features', 'azure-sql-decision', 'azure-sql-family', 'sql-development']
  },
  'sql-server-vm': {
    source: 'sql-vm-overview',
    differsFrom: 'IaaS exposes OS/file-system and engine-version control absent from managed SQL PaaS.',
    typicalWorkloads: 'SQL Server workloads requiring a specific supported version/edition or OS-dependent features.',
    migrationFit: 'Consider when verified control/feature constraints require IaaS; an existing VM is not sufficient justification.',
    extraSources: ['azure-sql-family', 'azure-sql-decision']
  },
  'postgres-flex': {
    source: 'postgres-overview',
    differsFrom: 'Managed PostgreSQL rather than SQL Server; extensions and PostgreSQL semantics are part of the engine contract.',
    typicalWorkloads: 'Relational applications, PostgreSQL-compatible migrations and mixed relational/JSON records.',
    migrationFit: 'Preserve PostgreSQL contracts where supported; validate extensions, source version, privileges, drivers and downtime.',
    extraSources: ['postgres-extensions', 'postgres-vector', 'postgres-json', 'postgres-replicas']
  },
  'mysql-flex': {
    source: 'mysql-overview',
    differsFrom: 'Managed MySQL Community Edition, not PostgreSQL or the retired Azure MariaDB service.',
    typicalWorkloads: 'Applications with a tested MySQL engine contract; MariaDB-based applications require compatibility validation.',
    migrationFit: 'Inventory MySQL/MariaDB dialect, SQL modes, collations, plugins, drivers and vendor support; test representative application workflows before moving.',
    extraSources: ['mariadb-retirement']
  },
  'cosmos-nosql': {
    source: 'cosmos-overview',
    differsFrom: 'Native document/NoSQL API; SQL-like queries are not the SQL Server engine or the MongoDB API.',
    typicalWorkloads: 'Partition-aware document aggregates and explicitly justified distributed reads/writes; vectors can remain with source documents.',
    migrationFit: 'Requires data/access-pattern redesign when the source uses another engine; do not infer SQL or MongoDB compatibility.',
    extraSources: ['cosmos-partitioning', 'cosmos-consistency', 'cosmos-transactions', 'cosmos-vector']
  },
  'cosmos-mongo-ru': {
    source: 'cosmos-mongo-overview',
    differsFrom: 'MongoDB wire-protocol API on Cosmos DB’s RU model, not MongoDB server or DocumentDB’s operating model.',
    typicalWorkloads: 'Document workloads using drivers whose exact commands and API version fit the RU offering.',
    migrationFit: 'Compare with DocumentDB when migrating MongoDB clients; test operators, aggregations, transactions and drivers against the chosen API matrix.',
    extraSources: ['cosmos-mongodb-features']
  },
  'azure-documentdb': {
    source: 'documentdb-overview',
    differsFrom: 'Current name of the former MongoDB vCore offering; built on DocumentDB, not MongoDB server or RU-based Cosmos MongoDB.',
    typicalWorkloads: 'Document applications requiring tested MongoDB client behaviour and colocated vector/document retrieval.',
    migrationFit: 'Evaluate MongoDB migrations using commands/operators/aggregation and driver tests, not an overall compatibility percentage.',
    extraSources: ['documentdb-release-notes', 'documentdb-mql-compat', 'documentdb-vector']
  },
  'managed-redis': {
    source: 'managed-redis-overview',
    differsFrom: 'Redis Enterprise-based managed in-memory store; a cache role does not make it the authoritative relational/document database.',
    typicalWorkloads: 'Cache-aside, content/session caching and confirmed vector retrieval where the configured module fits.',
    migrationFit: 'Assess migration from retiring Azure Cache for Redis tiers, checking client clustering, modules and persistence behaviour.',
    extraSources: ['redis-retirement', 'redis-vector', 'cache-aside']
  },
  'blob-storage': {
    source: 'blob-overview',
    differsFrom: 'Object storage for complete files; ADLS adds hierarchical namespace semantics, not a relational engine.',
    typicalWorkloads: 'Documents/media delivery, archives, exports, backups and analytical inputs.',
    migrationFit: 'Assess object naming, API access, metadata, namespace and retention rather than SQL engine migration.',
    extraSources: ['adls-overview']
  },
  'ai-search': {
    source: 'ai-search-overview',
    differsFrom: 'Managed derived retrieval/index service rather than the original transactional store; source databases can also support vectors.',
    typicalWorkloads: 'Explicitly justified multi-source full-text/vector/hybrid retrieval, relevance, facets and autocomplete.',
    migrationFit: 'Rebuild a derived index from originals; validate schema, filters, ranking, source integration and update/deletion propagation.',
    extraSources: ['search-vector', 'vector-selection']
  },
  'data-explorer': {
    source: 'data-explorer-overview',
    differsFrom: 'Typed-table KQL analytics for high-velocity data, not an inferred OLTP transaction engine. Eventhouse is the Fabric analytics alternative.',
    typicalWorkloads: 'Interactive logs, telemetry, time-window aggregation and exploratory analytics.',
    migrationFit: 'Assess ingestion formats/mappings, retention and KQL query redesign rather than transactional engine parity.',
    extraSources: ['fabric-eventhouse']
  }
};

const neighbour = {
  'sql-fabric': 'Fabric-integrated transactional SQL with OneLake copies; not an independent analytics warehouse.',
  'cosmos-other-apis': 'Cassandra, Gremlin and Table are API-specific offerings, not one engine; choose the relevant API and test its support matrix.',
  'managed-cassandra': 'Native managed Cassandra, unlike Cosmos DB’s Cassandra API.',
  'table-storage': 'Key/attribute entities in Azure Storage; distinguish Cosmos Table API’s indexing and distribution.',
  'adls-gen2': 'Hierarchical-namespace capabilities on Blob Storage for analytics, not another independent engine.',
  'fabric-warehouse': 'T-SQL analytical warehouse with multi-table transactions; unlike Spark-first lakehouse and operational SQL.',
  'fabric-lakehouse': 'Spark-first files/Delta analytics; unlike a T-SQL warehouse or transactional application database.',
  'fabric-eventhouse': 'Fabric KQL event analytics using capacity; distinguish standalone Azure Data Explorer.',
  onelake: 'Fabric-wide analytics storage foundation, not a query engine or another selected OLTP database.',
  'cosmos-pg': 'Retirement-path distributed PostgreSQL; do not confuse with Flexible Server.',
  'azure-mariadb-service': 'Retired Azure service, not retirement of the MariaDB engine.',
  'azure-cache-redis-legacy': 'Retiring cache tiers with different dates; assess Managed Redis rather than new legacy deployments.'
};

export function profileFor(service) {
  const detail = details[service.id];
  const sourceIds = detail ? [detail.source] : service.sourceIds;
  const lifecycle = capabilityFor(service.id, 'newDeployment');
  const profile = {
    whatItIs: description(service.summary, sourceIds),
    model: description(service.model, sourceIds),
    engineApi: description(service.api, sourceIds),
    role: description(service.role, sourceIds),
    differsFrom: description(detail?.differsFrom || neighbour[service.id], sourceIds)
  };
  if (detail?.typicalWorkloads) profile.typicalWorkloads = description(detail.typicalWorkloads, sourceIds);
  if (detail?.migrationFit) profile.migrationFit = description(detail.migrationFit, [...new Set([...sourceIds, ...(detail.extraSources || [])])]);
  profile.lifecycle = description([lifecycle.summary, lifecycle.condition].filter(Boolean).join(' '), lifecycle.sourceIds);
  return profile;
}
