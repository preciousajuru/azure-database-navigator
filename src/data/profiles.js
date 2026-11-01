export const profileLabels = {
  whatItIs: 'What it is', model: 'Data model', engineApi: 'Engine / API', role: 'Data role',
  differsFrom: 'How it differs', typicalWorkloads: 'Typical workloads', migrationFit: 'Migration fit',
  compatibility: 'Versions and compatibility', operations: 'Microsoft and customer responsibilities',
  scaling: 'Scaling options', recovery: 'Availability and recovery', networking: 'Networking and security',
  costs: 'Cost drivers', limits: 'Documented limits and conditions', lifecycle: 'Lifecycle'
};

const entry = (text, sourceIds, status = 'conditional') => ({ text, condition: text, sourceIds, status });
const details = {
  'azure-sql-db': {
    source: 'sql-db-overview',
    differsFrom: 'Database-scoped PaaS rather than a Managed Instance or an OS-controlled VM.',
    typicalWorkloads: 'Application records, relational joins and business transactions; JSON can coexist with relational columns.',
    migrationFit: 'Assess database-scoped SQL Server workloads; required instance or OS features can favour MI or VM.',
    compatibility: 'Check T-SQL features and compatibility level; native three-part cross-database queries are unsupported, while elastic query is separate.',
    operations: 'Microsoft patches SQL/OS and manages platform backups. Customers own schema, permissions, query/index tuning, monitoring and restore/application failover tests.',
    scaling: 'Single databases or pools; provisioned/serverless compute and GP/BC/Hyperscale are configuration choices, not engines.',
    recovery: 'Built-in HA and backups; zone redundancy and replica options depend on configuration/region. Verify retention, PITR and DR independently.',
    networking: 'SQL and Entra authentication are documented; validate firewalls, private connectivity, managed identities, key management and auditing for the chosen configuration.',
    costs: 'vCore or DTU purchasing; compute, storage, backups, replicas and licensing eligibility depend on configuration. No tier or price is selected.',
    extraSources: ['azure-sql-features', 'azure-sql-decision', 'sql-development', 'sql-json']
  },
  'azure-sql-mi': {
    source: 'sql-mi-overview',
    differsFrom: 'An instance-scoped SQL Server PaaS service with native VNet integration; unlike SQL Database it exposes instance features such as SQL Agent.',
    typicalWorkloads: 'SQL Server applications with jobs, linked servers or cross-database dependencies that pass feature assessment.',
    migrationFit: 'Favour assessment when SQL Server instance dependencies exceed database-scoped options; OS/file-path dependencies still need testing.',
    compatibility: 'Near-complete compatibility is not parity. Check update policy, T-SQL differences and each CLR/job/linked-server dependency.',
    operations: 'Microsoft handles engine/OS patching and automatic backups. Customers administer databases, access, jobs, query tuning and test migration, restore and application failover.',
    scaling: 'Instance compute/storage and service-tier options; verify supported configuration and region instead of sizing from an application label.',
    recovery: 'Built-in HA, automated backups and PITR are documented. Zone redundancy and failover strategy remain target-specific validation.',
    networking: 'Native VNet implementation; SQL/Entra authentication, TDE and auditing are documented. Validate routing, endpoint choices, permissions and customer-managed keys.',
    costs: 'Instance compute/storage, tier, backup retention and licence/Hybrid Benefit eligibility are cost inputs; verify actual regional prices.',
    extraSources: ['azure-sql-features', 'azure-sql-decision', 'azure-sql-family', 'sql-development']
  },
  'sql-server-vm': {
    source: 'sql-vm-overview',
    differsFrom: 'IaaS exposes OS/file-system and engine-version control absent from managed SQL PaaS.',
    typicalWorkloads: 'SQL Server workloads requiring a specific supported version/edition or OS-dependent features.',
    migrationFit: 'Consider when verified control/feature constraints require IaaS; an existing VM is not sufficient justification.',
    compatibility: 'Match SQL Server version/edition, OS and feature inventory; a full engine does not prove migration compatibility.',
    operations: 'Microsoft hosts Azure infrastructure. Customers own VM/OS and SQL operations; IaaS Agent backup/patching features require configuration and do not remove ownership.',
    scaling: 'VM size and disk I/O/storage are separate limits. Test workload behaviour; no VM size is selected.',
    recovery: 'Design and test SQL/VM backups, HA and cross-region recovery. Automated backup is an optional configured extension capability, not a complete DR strategy.',
    networking: 'Configure VM network and SQL access. Entra and Key Vault integration have extension/setup conditions; validate firewall, encryption, least privilege and secrets.',
    costs: 'VM compute, disks, SQL licence model, backups and operational effort; check pay-as-you-go versus eligible existing licences.',
    extraSources: ['azure-sql-family', 'azure-sql-decision']
  },
  'postgres-flex': {
    source: 'postgres-overview',
    differsFrom: 'Managed PostgreSQL rather than SQL Server; extensions and PostgreSQL semantics are part of the engine contract.',
    typicalWorkloads: 'Relational applications, PostgreSQL-compatible migrations and mixed relational/JSON records.',
    migrationFit: 'Preserve PostgreSQL contracts where supported; validate extensions, source version, privileges, drivers and downtime.',
    compatibility: 'Supported major versions and extension allow-list require checks. pgvector is allow-listed as vector and created per database.',
    operations: 'Microsoft patches hardware/OS/engine, including minor updates, using maintenance windows. Customers plan major upgrades, schema, permissions, tuning, capacity and recovery tests.',
    scaling: 'Burstable/GP/Memory Optimized compute; storage and read replicas are separate decisions. Built-in PgBouncer can be enabled. Verify any elastic-cluster scale-out configuration.',
    recovery: 'Automatic backups/PITR and optional same-zone/zone-redundant HA; current region restrictions apply. Asynchronous read replicas are not immediate read-after-write guarantees.',
    networking: 'TLS and encrypted storage; VNet private access is documented. Verify actual identity, CMK, private-endpoint and auditing options rather than assuming SQL feature equivalence.',
    costs: 'Compute, storage, backup retention and separately provisioned read replicas. Stopping compute does not remove all stored-data costs.',
    extraSources: ['postgres-extensions', 'postgres-vector', 'postgres-json', 'postgres-replicas']
  },
  'mysql-flex': {
    source: 'mysql-overview',
    differsFrom: 'Managed MySQL Community Edition, not PostgreSQL or the retired Azure MariaDB service.',
    typicalWorkloads: 'Applications with a tested MySQL engine contract; MariaDB-based applications require compatibility validation.',
    migrationFit: 'Inventory MySQL/MariaDB dialect, SQL modes, collations, plugins, drivers and vendor support; test representative application workflows before moving.',
    compatibility: 'The overview documents MySQL 5.7/8.0/8.4; verify target support/lifecycle and feature differences, not a drop-in MariaDB assumption.',
    operations: 'Microsoft patches infrastructure/OS/engine minor versions and manages backups. Customers choose maintenance, upgrades, schema, query/index tuning, access and restore testing.',
    scaling: 'Burstable/GP/Memory Optimized compute, storage autogrow and separately configured IOPS/read replicas; replicas offload reads, not writes.',
    recovery: 'Automatic backups/PITR and local/zone-redundant HA have configuration/region conditions. Read replicas use asynchronous binlog replication and can lag.',
    networking: 'VNet private access or public allowed-IP connectivity are documented; validate exact authentication, TLS/key and audit setup.',
    costs: 'Compute/storage/IOPS, HA primary and standby, replicas and backup retention; no price or capacity is inferred.',
    extraSources: ['mariadb-retirement']
  },
  'cosmos-nosql': {
    source: 'cosmos-overview',
    differsFrom: 'Native document/NoSQL API; SQL-like queries are not the SQL Server engine or the MongoDB API.',
    typicalWorkloads: 'Partition-aware document aggregates and explicitly justified distributed reads/writes; vectors can remain with source documents.',
    migrationFit: 'Requires data/access-pattern redesign when the source uses another engine; do not infer SQL or MongoDB compatibility.',
    compatibility: 'SDK/query API, partition-key design and transaction scope must match. Multi-item ACID is within a container logical partition.',
    operations: 'Microsoft manages infrastructure and patching. Customers own data model, partition key, indexing, throughput, consistency, region strategy and recovery/access configuration.',
    scaling: 'Partitioning and throughput mode are central; hot partition keys and cross-partition queries can dominate behaviour. No RU/s is recommended.',
    recovery: 'Consistency and region/failover choices are configuration decisions. Verify backup mode, retention, restore and write-conflict handling independently.',
    networking: 'Check account-specific access, private connectivity, Entra/RBAC, encryption/key and audit requirements; no universal compliance promise.',
    costs: 'Throughput/request units, storage and regional replication are workload inputs; query/index design affects request consumption.',
    extraSources: ['cosmos-partitioning', 'cosmos-consistency', 'cosmos-transactions', 'cosmos-vector']
  },
  'cosmos-mongo-ru': {
    source: 'cosmos-mongo-overview',
    differsFrom: 'MongoDB wire-protocol API on Cosmos DB’s RU model, not MongoDB server or DocumentDB’s operating model.',
    typicalWorkloads: 'Document workloads using drivers whose exact commands and API version fit the RU offering.',
    migrationFit: 'Compare with DocumentDB when migrating MongoDB clients; test operators, aggregations, transactions and drivers against the chosen API matrix.',
    compatibility: 'The registered 4.2 matrix is version-specific. Protocol connectivity does not establish command/transaction parity.',
    operations: 'Microsoft manages the service; customers own API compatibility tests, partition/query design, throughput, access and recovery validation.',
    scaling: 'RU/partition-based distribution differs from DocumentDB compute-based clusters; verify the exact API limits.',
    recovery: 'Do not transfer NoSQL transaction/backup/consistency claims to this API. Verify region, backup/restore and transaction boundaries for the target API.',
    networking: 'Verify MongoDB API authentication, access controls, private connectivity and auditing; driver support does not prove native MongoDB security behaviour.',
    costs: 'Request-unit model and storage/regions require workload measurements; compare separately from DocumentDB cluster costs.',
    extraSources: ['cosmos-mongodb-features']
  },
  'azure-documentdb': {
    source: 'documentdb-overview',
    differsFrom: 'Current name of the former MongoDB vCore offering; built on DocumentDB, not MongoDB server or RU-based Cosmos MongoDB.',
    typicalWorkloads: 'Document applications requiring tested MongoDB client behaviour and colocated vector/document retrieval.',
    migrationFit: 'Evaluate MongoDB migrations using commands/operators/aggregation and driver tests, not an overall compatibility percentage.',
    compatibility: 'MQL support is documented by service version; verify every required feature. Vector index limits differ by algorithm and compression.',
    operations: 'Microsoft provides the managed service. Customers still own document/schema design, indexing, application permissions, monitoring, migration tests and recovery validation.',
    scaling: 'The overview describes vertical/horizontal cluster scaling; verify shard strategy, compute/storage limits and workload behaviour.',
    recovery: 'Unknown — verify actual cluster backup/PITR, HA, retention and cross-region recovery. The overview’s broad claims are not an application RPO/RTO guarantee.',
    networking: 'Unknown — verify cluster authentication, public/private connectivity, keys and auditing; MongoDB wire compatibility does not establish security parity.',
    costs: 'Assess compute-based cluster configuration, storage and recovery/replication charges separately from the RU model; exact regional price dimensions require review.',
    extraSources: ['documentdb-release-notes', 'documentdb-mql-compat', 'documentdb-vector']
  },
  'managed-redis': {
    source: 'managed-redis-overview',
    differsFrom: 'Redis Enterprise-based managed in-memory store; a cache role does not make it the authoritative relational/document database.',
    typicalWorkloads: 'Cache-aside, content/session caching and confirmed vector retrieval where the configured module fits.',
    migrationFit: 'Assess migration from retiring Azure Cache for Redis tiers, checking client clustering, modules and persistence behaviour.',
    compatibility: 'The overview documents Redis 7.4.x. RediSearch must be enabled at creation; Flash Optimized does not support it.',
    operations: 'Microsoft operates the service/module versions. Customers own eviction, expiry, invalidation, memory/index capacity, clients, permissions and outage/reload tests.',
    scaling: 'Memory/Balanced/Compute/Flash tiers have different limits; scaling down and module/clustering choices need checks. Larger bandwidth is not proof of better workload latency.',
    recovery: 'HA-enabled instances distribute primary/replica shards; zone behaviour is regional. Persistence differs from Flash tier storage; verify reload/failover and backup needs.',
    networking: 'Private Link and Entra authentication are documented; verify supported clients/TLS, permissions and diagnostic audit settings.',
    costs: 'Tier/instance size, memory/index overhead, HA, persistence and geo-replication requirements affect cost; some large SKUs are preview.',
    extraSources: ['redis-retirement', 'redis-vector', 'cache-aside']
  },
  'blob-storage': {
    source: 'blob-overview',
    differsFrom: 'Object storage for complete files; ADLS adds hierarchical namespace semantics, not a relational engine.',
    typicalWorkloads: 'Documents/media delivery, archives, exports, backups and analytical inputs.',
    migrationFit: 'Assess object naming, API access, metadata, namespace and retention rather than SQL engine migration.',
    compatibility: 'Block/append/page blobs and HTTP/Storage APIs are documented; SFTP/NFS require specific configuration.',
    operations: 'Microsoft operates storage infrastructure. Customers own objects, access/retention policy, lifecycle configuration, integrity checks and restore procedures.',
    scaling: 'Account/blob type and access patterns matter; validate throughput, object size and namespace restrictions for the actual workload.',
    recovery: 'Unknown — select and verify redundancy, versioning, deletion protection and recovery requirements; storing a backup file is not a tested restore strategy.',
    networking: 'Authenticated access and Storage APIs; verify account-specific private access, Entra/RBAC, encryption and key settings.',
    costs: 'Validate access tier, stored volume, operations, retrieval/transfer and redundancy using current storage prices.',
    extraSources: ['adls-overview']
  },
  'ai-search': {
    source: 'ai-search-overview',
    differsFrom: 'Managed derived retrieval/index service rather than the original transactional store; source databases can also support vectors.',
    typicalWorkloads: 'Explicitly justified multi-source full-text/vector/hybrid retrieval, relevance, facets and autocomplete.',
    migrationFit: 'Rebuild a derived index from originals; validate schema, filters, ranking, source integration and update/deletion propagation.',
    compatibility: 'REST/SDK query APIs differ from database engines. Vector quotas/service age and semantic or agentic feature status need checks.',
    operations: 'Microsoft hosts search. Customers own index schema, ingestion, ranking, access control, quotas, failure retries and independent rebuilds.',
    scaling: 'Choose replicas/partitions and service configuration from measured query/index load; vector indexing consumes capacity.',
    recovery: 'Index freshness and rebuilds are distinct from source backup. Verify search availability/replicas and test independent index recovery.',
    networking: 'Entra ID, Private Link and role-based access are documented. Validate document-level permissions and region/feature conditions.',
    costs: 'Verify search configuration and capacity prices; enrichment and embedding generation can have separate costs. No tier or cost total is selected.',
    extraSources: ['search-vector', 'vector-selection']
  },
  'data-explorer': {
    source: 'data-explorer-overview',
    differsFrom: 'Typed-table KQL analytics for high-velocity data, not an inferred OLTP transaction engine. Eventhouse is the Fabric analytics alternative.',
    typicalWorkloads: 'Interactive logs, telemetry, time-window aggregation and exploratory analytics.',
    migrationFit: 'Assess ingestion formats/mappings, retention and KQL query redesign rather than transactional engine parity.',
    compatibility: 'KQL is the primary query language; T-SQL support is not full SQL Server compatibility.',
    operations: 'Microsoft provides the managed platform. Customers own ingestion pipelines, schema/mappings, retention, permissions, query tuning and monitoring.',
    scaling: 'Cluster compute, ingestion and retention/query patterns need measurement; ingestion-time indexing does not guarantee every query target.',
    recovery: 'Unknown — verify cluster HA, retained data, ingestion replay, regional recovery and application recovery tests.',
    networking: 'Unknown — verify cluster authentication/RBAC, private connectivity, encryption and auditing against current configuration docs.',
    costs: 'Verify cluster compute, storage, retention, ingestion and transfer pricing; no workload estimate is fabricated.',
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
  const profile = {
    whatItIs: entry(service.summary, sourceIds, 'supported'),
    model: entry(service.model, sourceIds, 'supported'),
    engineApi: entry(service.api, sourceIds, 'supported'),
    role: entry(service.role, sourceIds, 'supported'),
    differsFrom: entry(detail?.differsFrom || neighbour[service.id], sourceIds),
    lifecycle: entry(service.lifecycle ? service.summary : 'No retirement notice is recorded in this snapshot; verify current lifecycle before deployment.', sourceIds, service.lifecycle ? 'conditional' : 'unknown'),
    limits: entry(service.caveats.join(' '), sourceIds)
  };
  for (const key of ['typicalWorkloads', 'migrationFit', 'compatibility', 'operations', 'scaling', 'recovery', 'networking', 'costs']) {
    const text = detail?.[key];
    const fieldSources = detail && key === 'compatibility' ? [...new Set([...sourceIds, ...detail.extraSources])] : sourceIds;
    profile[key] = text ? entry(text, fieldSources, text.startsWith('Unknown') ? 'unknown' : 'conditional') : entry(`Unknown — verification required for ${service.name}: ${profileLabels[key].toLowerCase()}. The model/role overview does not establish configuration-specific behaviour.`, sourceIds, 'unknown');
  }
  return profile;
}
