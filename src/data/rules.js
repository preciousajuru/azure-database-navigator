export const RULE_REVIEWED_ON = '2026-11-01';

export const rules = [
  {
    id: 'keep-existing-store',
    serviceIds: [],
    configuration: 'No new Azure platform or migration is selected.',
    conditions: 'The user explicitly chooses to retain the existing store.',
    sourceIds: ['arch-data-considerations'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'Keeping a store does not verify its lifecycle, compatibility, security or recovery.',
    test: 'retaining an existing store does not imply an Azure migration'
  },
  {
    id: 'postgres-existing-engine',
    serviceIds: ['postgres-flex'],
    configuration: 'Target version, extensions, HA, networking and migration remain verification gates.',
    conditions: 'The application has an existing PostgreSQL engine contract.',
    sourceIds: ['postgres-overview', 'postgres-extensions'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'An engine match is not proof of complete feature or migration compatibility.',
    test: 'PostgreSQL extension requirements remain a validation gate'
  },
  {
    id: 'mysql-existing-engine',
    serviceIds: ['mysql-flex'],
    configuration: 'Target version, SQL modes, plugins and migration are not assumed.',
    conditions: 'The workload uses MySQL or requires a MariaDB-to-MySQL compatibility assessment.',
    sourceIds: ['mysql-overview', 'mariadb-retirement'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'MariaDB and MySQL are different engines; compatibility requires testing.',
    test: 'MariaDB application mapping to MySQL remains conditional and is not engine retirement advice'
  },
  {
    id: 'cassandra-feature-validation',
    serviceIds: ['cosmos-other-apis', 'managed-cassandra'],
    configuration: 'Compare the API offering with native Cassandra; verify version, topology, operations and migration.',
    conditions: 'An existing workload has an Apache Cassandra engine/client contract.',
    sourceIds: ['cosmos-cassandra-api', 'cassandra-managed-overview'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'A Cassandra API is not the native Cassandra engine or a guarantee of feature parity.',
    test: 'Cassandra engine and Cassandra API remain separate options with a version gate'
  },
  {
    id: 'no-persistent-store',
    serviceIds: [],
    configuration: 'No database or object store is selected.',
    conditions: 'The user states that the workload does not need persistent storage.',
    sourceIds: ['arch-data-models'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'Reassess if the workload later needs durable records, files, search indexes or recoverable state.',
    test: 'explicitly no persistent storage produces no database candidate'
  },
  {
    id: 'files-no-db',
    serviceIds: ['blob-storage'],
    configuration: 'No database engine or tier is configured.',
    conditions: 'Files/object storage is the only stated data role; no record database requirement is assumed.',
    sourceIds: ['arch-data-models', 'blob-overview'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'Metadata queries, relationships, search and transactions can add separate roles.',
    test: 'files-only is a no-database-needed outcome'
  },
  {
    id: 'sql-os-version',
    serviceIds: ['sql-server-vm'],
    configuration: 'VM and SQL Server versions, licensing, backup, patching and HA are not sized or selected.',
    conditions: 'A migrated SQL Server workload explicitly requires OS/file-system control or a specific engine version.',
    sourceIds: ['azure-sql-decision'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'Operating responsibility and target version support still need verification.',
    test: 'OS-level control is an explicit reason to consider SQL Server on a VM'
  },
  {
    id: 'sql-instance-features',
    serviceIds: ['azure-sql-mi', 'sql-server-vm'],
    configuration: 'No tier, VM size or migration mode is inferred; validate each required instance feature first.',
    conditions: 'A SQL Server migration explicitly requires an instance feature named in the decision tree.',
    sourceIds: ['azure-sql-decision'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'Feature-by-feature compatibility is required; the VM remains a fallback only if the feature test requires it.',
    test: 'SQL Server instance features distinguish Managed Instance and VM from SQL Database'
  },
  {
    id: 'sql-existing-engine',
    serviceIds: ['azure-sql-db', 'azure-sql-mi'],
    configuration: 'Azure SQL Database configuration and Managed Instance target options remain to be validated.',
    conditions: 'The current engine is SQL Server and no verified feature constraint selects a different operating model.',
    sourceIds: ['azure-sql-family', 'azure-sql-decision'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'An existing VM does not establish a VM requirement.',
    test: 'an existing SQL Server engine does not automatically imply a VM'
  },
  {
    id: 'relational-integrity',
    serviceIds: ['azure-sql-db', 'postgres-flex'],
    configuration: 'No engine version, compute tier, availability option or capacity is selected.',
    conditions: 'The workload needs relational queries, referential integrity or transactional boundaries, without a narrower existing-engine constraint.',
    sourceIds: ['arch-data-models', 'azure-sql-family', 'postgres-overview'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'The engine and feature set still need to match application requirements.',
    test: 'relational business records shortlist SQL Server and PostgreSQL independently of language'
  },
  {
    id: 'postgres-extension-gate',
    serviceIds: ['postgres-flex'],
    configuration: 'Check the exact extension, PostgreSQL version, allow-list, server parameters and region.',
    conditions: 'The user reports a PostgreSQL extension requirement.',
    sourceIds: ['postgres-extensions'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'The exact extension, server version, parameters and region must be checked.',
    test: 'PostgreSQL extension requirements remain a validation gate'
  },
  {
    id: 'mariadb-to-mysql-validation',
    serviceIds: ['mysql-flex'],
    configuration: 'Check MySQL engine version, SQL behaviour, plugins, schema, drivers and migration path.',
    conditions: 'A MariaDB engine or application is being migrated to an Azure managed relational target.',
    sourceIds: ['mysql-overview', 'mariadb-retirement'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'MySQL migration compatibility is unknown until engine and application behaviour are tested; the retired Azure service is not the MariaDB engine.',
    test: 'MariaDB application mapping to MySQL remains conditional and is not engine retirement advice'
  },
  {
    id: 'document-access-pattern',
    serviceIds: ['cosmos-nosql'],
    configuration: 'Partition key, throughput mode, indexing, consistency and region strategy are not configured.',
    conditions: 'A document aggregate/partition-key access pattern or measured multi-region read-latency requirement is stated.',
    sourceIds: ['cosmos-overview', 'cosmos-consistency', 'cosmos-partitioning', 'cosmos-transactions'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'JSON alone is insufficient; partitioning, consistency, transactions, throughput and cost remain design work.',
    test: 'JSON syntax without a defined document access pattern is insufficient information'
  },
  {
    id: 'mongo-feature-validation',
    serviceIds: ['azure-documentdb', 'cosmos-mongo-ru'],
    configuration: 'Offering, API version, commands, drivers and migration plan require separate verification.',
    conditions: 'A workload uses MongoDB drivers/protocol and requires a documented feature-by-feature compatibility check.',
    sourceIds: ['documentdb-release-notes', 'documentdb-mql-compat', 'cosmos-overview', 'cosmos-mongodb-features'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'Wire protocol/client support is not feature parity; Azure DocumentDB is the current name for the vCore-based offering, not a third distinct service.',
    test: 'MongoDB options remain distinct with feature-level validation caveats'
  },
  {
    id: 'analytics-time-series',
    serviceIds: ['data-explorer', 'fabric-eventhouse'],
    configuration: 'Capacity, ingestion, retention, region and query settings are not selected.',
    conditions: 'High-ingest telemetry or time-window analytics is a stated primary workload.',
    sourceIds: ['data-explorer-overview', 'fabric-eventhouse'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'A time-series data shape alone does not establish ingestion, region, retention or product fit.',
    test: 'High-volume telemetry with time-window analysis'
  },
  {
    id: 'search-separated-role',
    serviceIds: ['blob-storage', 'ai-search'],
    configuration: 'Source, state and index are separate roles; sync, index lag, reindexing and recovery are not configured.',
    conditions: 'A separate managed index is explicitly justified and source-to-index lag is acceptable; source files are included only when present.',
    sourceIds: ['vector-selection', 'blob-overview', 'ai-search-overview'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'The search index is derived; do not assume vector search or a transactional database is necessary.',
    test: 'RAG separates object source, search index and optional durable application state'
  },
  {
    id: 'cache-not-record',
    serviceIds: ['managed-redis'],
    configuration: 'Cache topology, expiry, invalidation and durable record configuration are not selected.',
    conditions: 'Cache/transient-state role is explicit; a new durable record service is added only when explicitly required and an existing candidate does not already fill that role.',
    sourceIds: ['managed-redis-overview', 'arch-data-models'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'Define source of truth, expiry, invalidation, failure and recovery behaviour.',
    test: 'cache is never represented as the durable record store'
  },
  {
    id: 'unknown-recovery-security',
    serviceIds: [],
    configuration: 'Region, encryption, key, network, backup, HA and recovery options require explicit configuration review.',
    conditions: 'RPO/RTO, residency, encryption, key, network or governance constraints are stated or missing.',
    sourceIds: ['azure-sql-family', 'postgres-overview', 'mysql-overview', 'cosmos-overview'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'The navigator cannot promise compliance, region availability, recovery outcomes or a configured SLA.',
    test: 'strict recovery and security do not imply a verified region, compliance or guarantee'
  },
  {
    id: 'tenant-shape-open',
    serviceIds: ['azure-sql-db', 'postgres-flex'],
    configuration: 'No shared database, separate database, pool or partition strategy is chosen.',
    conditions: 'Tenant isolation is stated; service selection must not infer shared/separate database, pool or partition layout.',
    sourceIds: ['azure-sql-decision', 'postgres-overview'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'Tenant architecture requires workload-specific isolation, cost and operational analysis.',
    test: 'tenant shape remains an explicit architecture decision'
  },
  {
    id: 'exclude-retired-new',
    serviceIds: ['cosmos-pg', 'azure-mariadb-service', 'azure-cache-redis-legacy'],
    configuration: 'No retired or retirement-path option is selected for a new deployment.',
    conditions: 'A service profile has an explicit retired or retirement-path lifecycle state.',
    sourceIds: ['cosmos-pg-retirement', 'mariadb-retirement', 'redis-retirement'],
    verifiedOn: RULE_REVIEWED_ON,
    limitations: 'Recheck current lifecycle and dates; migration advice differs by tier and deployment.',
    test: 'retirement-path and retired services never appear as new candidates'
  },
  {
    id: 'authoritative-role', serviceIds: [], configuration: 'One record node carries platform alternatives; a retained store is not a candidate.',
    conditions: 'A composite workload states its record role/model; assess it by the same single-store rules without selecting one engine.',
    sourceIds: ['arch-data-models', 'arch-data-considerations'], verifiedOn: RULE_REVIEWED_ON,
    limitations: 'Unknown record requirements remain unresolved; copies are not automatically transactionally consistent.',
    test: 'record-role matrix preserves exactly one authoritative record node'
  },
  {
    id: 'vector-existing-first', serviceIds: ['azure-sql-db', 'postgres-flex', 'cosmos-nosql', 'azure-documentdb', 'managed-redis', 'ai-search'],
    configuration: 'Retrieve in the source store first where verified; dimension/index/tier/version/region remain validation gates.',
    conditions: 'Vector or hybrid retrieval is explicit; no store is added for unknown retrieval requirements.',
    sourceIds: ['vector-selection', 'sql-vector', 'postgres-vector', 'cosmos-vector', 'documentdb-vector', 'redis-vector', 'search-vector'],
    verifiedOn: RULE_REVIEWED_ON, limitations: 'Capabilities and preview index status do not prove workload performance or freshness.',
    test: 'vector retrieval checks existing stores before adding an index'
  },
  {
    id: 'graph-traversal', serviceIds: ['cosmos-other-apis'], configuration: 'Assess Apache Gremlin API only; do not confuse it with native engines or OLAP graph.',
    conditions: 'Graph model, relationship traversal or graph query requirements are explicit.',
    sourceIds: ['gremlin-overview', 'fabric-graph', 'arch-data-models'], verifiedOn: RULE_REVIEWED_ON,
    limitations: 'Size/depth/latency/TinkerPop/region/lifecycle need verification. Fabric graph is further assessment guidance, not a selected OLTP replacement.',
    test: 'graph traversal has qualified evidence and no universal graph promise'
  },
  {
    id: 'json-also-assess', serviceIds: ['azure-sql-db', 'postgres-flex', 'cosmos-nosql'],
    configuration: 'Relational JSON alternatives remain assessment prompts, not mandatory extra stores or equivalent global writes.',
    conditions: 'Document data and multi-region requirements surface a Cosmos candidate without excluding relational JSON support.',
    sourceIds: ['sql-json', 'postgres-json', 'postgres-overview', 'cosmos-consistency'], verifiedOn: RULE_REVIEWED_ON,
    limitations: 'Validate exact JSON feature/version, transaction and measured regional latency/write needs.',
    test: 'global JSON preserves primary distribution candidate and explicit relational assessment alternatives'
  }
];

export const ruleById = Object.fromEntries(rules.map((rule) => [rule.id, rule]));
