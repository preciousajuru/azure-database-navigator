import { REVIEWED_ON } from './sources.js';

const cap = (status, sourceIds = [], condition = '') => ({ status, sourceIds, condition });

export const services = [
  {
    id: 'azure-sql-db', name: 'Azure SQL Database', family: 'Relational', kind: 'Managed relational database',
    model: 'SQL Server relational engine', api: 'T-SQL / SQL Server engine', role: 'System of record',
    summary: 'Database-scoped managed SQL Server option for application databases.',
    configurationConsiderations: ['Choose database service first, then validate serverless or provisioned compute, elastic pools and service tier against measured workload needs.'],
    capabilities: {
      relational: cap('supported', ['arch-data-models', 'azure-sql-family']),
      sqlServerDatabaseEngine: cap('supported', ['azure-sql-family']),
      instanceFeatures: cap('conditional', ['azure-sql-decision'], 'Verify each required instance-level feature; several are decision points for Managed Instance or VM.'),
      crossDatabaseQueries: cap('conditional', ['azure-sql-features'], 'Native three-part name queries are not supported in SQL Database; elastic query is a separate, limited feature, not equivalent native cross-database behaviour.'),
      nativeThreePartNameQueries: cap('unsupported', ['azure-sql-features'], 'The official feature matrix marks native cross-database/three-part name queries as unsupported; evaluate elastic query separately.')
    },
    caveats: ['Choose database service first; serverless, provisioned, pools, and service tiers are separate configuration choices.', 'Do not infer a purchasing tier, capacity, or price from this assessment.'],
    sourceIds: ['azure-sql-family', 'azure-sql-decision', 'azure-sql-features', 'arch-data-models']
  },
  {
    id: 'azure-sql-mi', name: 'Azure SQL Managed Instance', family: 'Relational', kind: 'Managed SQL Server instance',
    model: 'SQL Server relational engine', api: 'T-SQL / SQL Server engine', role: 'System of record',
    summary: 'Managed SQL Server instance model for workloads whose verified feature needs exceed database-scoped options.',
    configurationConsiderations: ['Verify required instance features, networking, migration and regional availability before deciding on the target configuration.'],
    capabilities: {
      relational: cap('supported', ['azure-sql-family']),
      sqlServerInstanceFeatures: cap('conditional', ['azure-sql-decision', 'azure-sql-family'], 'Feature availability is feature-by-feature; confirm exact compatibility against the current matrix.'),
      operatingSystemControl: cap('unsupported', ['azure-sql-decision'])
    },
    caveats: ['“Near-complete” SQL Server feature parity is not identical to universal compatibility.', 'Provisioning, networking, migration, and recovery still require design.'],
    sourceIds: ['azure-sql-family', 'azure-sql-decision']
  },
  {
    id: 'sql-server-vm', name: 'SQL Server on Azure VMs', family: 'Relational', kind: 'Self-managed SQL Server on IaaS',
    model: 'SQL Server relational engine', api: 'SQL Server / T-SQL', role: 'System of record',
    summary: 'SQL Server hosted on an Azure virtual machine where OS or file-system control or a specific engine version is a requirement.',
    configurationConsiderations: ['Plan VM/SQL version, operating-system administration, patching, backups, high availability, monitoring and recovery ownership.'],
    capabilities: {
      relational: cap('supported', ['azure-sql-family']),
      sqlServerEngine: cap('supported', ['azure-sql-family']),
      operatingSystemControl: cap('supported', ['azure-sql-decision']),
      customerOperations: cap('conditional', ['azure-sql-family'], 'Operating-system and database administration responsibilities depend on the chosen VM and management setup.')
    },
    caveats: ['More control entails more operational responsibility; specify patching, backups, HA and DR ownership.', 'A legacy VM by itself does not establish a need for a VM target.'],
    sourceIds: ['azure-sql-family', 'azure-sql-decision']
  },
  {
    id: 'postgres-flex', name: 'Azure Database for PostgreSQL Flexible Server', family: 'Relational', kind: 'Managed relational database',
    model: 'PostgreSQL relational engine', api: 'PostgreSQL wire protocol', role: 'System of record',
    summary: 'Managed PostgreSQL with configurable server settings and deployment options.',
    configurationConsiderations: ['Validate PostgreSQL version, required extensions, compute, HA, replicas, storage, backup retention and region.'],
    capabilities: {
      relational: cap('supported', ['postgres-overview']),
      postgresEngine: cap('supported', ['postgres-overview']),
      requiredExtensions: cap('conditional', ['postgres-extensions'], 'Confirm the exact extension, server version, allow-list, parameters and region before selecting.')
    },
    caveats: ['A named extension is a validation gate, not a promise of availability.', 'Check PostgreSQL version, extension allow-list, region, HA and backup settings.'],
    sourceIds: ['postgres-overview', 'postgres-extensions']
  },
  {
    id: 'mysql-flex', name: 'Azure Database for MySQL Flexible Server', family: 'Relational', kind: 'Managed relational database',
    model: 'MySQL Community Edition relational engine', api: 'MySQL protocol', role: 'System of record',
    summary: 'Managed MySQL service for applications requiring the MySQL engine and ecosystem.',
    configurationConsiderations: ['Validate MySQL version, compute tier, HA, backup retention, network and migration compatibility.'],
    capabilities: {
      relational: cap('supported', ['mysql-overview']),
      mysqlEngine: cap('supported', ['mysql-overview']),
      mariadbCompatibility: cap('unknown', ['mysql-overview', 'mariadb-retirement'], 'A MariaDB workload needs engine, SQL-mode, collation, plugin, driver and application-level migration validation.')
    },
    caveats: ['MySQL is not a drop-in promise for every MariaDB deployment.', 'The Azure Database for MariaDB service retirement does not mean the MariaDB engine itself is retired.'],
    sourceIds: ['mysql-overview', 'mariadb-retirement']
  },
  {
    id: 'sql-fabric', name: 'SQL database in Microsoft Fabric', family: 'Relational', kind: 'Fabric-integrated transactional database',
    model: 'SQL relational engine', api: 'SQL', role: 'System of record',
    summary: 'Transactional SQL option associated with the Microsoft Fabric ecosystem.',
    capabilities: {
      relational: cap('supported', ['arch-data-models', 'fabric-overview']),
      fabricIntegration: cap('conditional', ['fabric-overview'], 'Confirm current availability, feature set, capacity, region, and production suitability.')
    },
    caveats: ['Not interchangeable with Azure SQL Database by name alone.', 'Current product availability and platform constraints need confirmation.'],
    sourceIds: ['arch-data-models', 'fabric-overview']
  },
  {
    id: 'cosmos-nosql', name: 'Azure Cosmos DB for NoSQL', family: 'Document & distributed', kind: 'Distributed NoSQL database',
    model: 'JSON documents', api: 'Native NoSQL API and SQL-like query language', role: 'System of record',
    summary: 'Document-oriented NoSQL API with account-level consistency choices and partition-aware data modelling.',
    configurationConsiderations: ['Design partition key, throughput mode, indexing, consistency, regions and transaction boundaries together.'],
    capabilities: {
      document: cap('supported', ['cosmos-overview', 'arch-data-models']),
      configurableConsistency: cap('supported', ['cosmos-consistency']),
      transactionalBoundary: cap('conditional', ['cosmos-transactions'], 'NoSQL multi-item ACID transactions are scoped to a container logical partition; cross-partition and cross-service changes need separate coordination.'),
      globalWrites: cap('conditional', ['cosmos-overview'], 'Global distribution and write-region behaviour depend on account configuration and requirements.')
    },
    caveats: ['JSON alone is not a reason to choose Cosmos DB.', 'Partition key, throughput mode, consistency, regions, request costs and transaction scope require explicit design.'],
    sourceIds: ['cosmos-overview', 'cosmos-consistency', 'cosmos-partitioning', 'cosmos-transactions']
  },
  {
    id: 'cosmos-mongo-ru', name: 'Azure Cosmos DB for MongoDB (RU-based)', family: 'Document & distributed', kind: 'MongoDB-compatible API offering',
    model: 'Document', api: 'MongoDB wire protocol; RU-based offering', role: 'System of record',
    summary: 'Cosmos DB API for MongoDB using the request-unit model; distinct from Azure DocumentDB.',
    capabilities: {
      mongoWireProtocol: cap('conditional', ['cosmos-overview'], 'Protocol/API choice does not establish complete MongoDB feature parity.'),
      featureCompatibility: cap('conditional', ['cosmos-mongodb-features'], 'The linked feature matrix covers the MongoDB 4.2 API; validate required features against the exact target API version.')
    },
    caveats: ['Azure DocumentDB is the current name for the vCore-based offering, not an additional third option.', 'Do not treat MongoDB driver support as full MongoDB server compatibility.'],
    sourceIds: ['cosmos-overview', 'cosmos-mongodb-features']
  },
  {
    id: 'azure-documentdb', name: 'Azure DocumentDB', family: 'Document & distributed', kind: 'Managed MongoDB-compatible document database',
    model: 'Document', api: 'MongoDB wire protocol', role: 'System of record',
    aliases: ['Cosmos DB for MongoDB (vCore)'],
    summary: 'Current name for the vCore-based Cosmos DB for MongoDB offering; managed document database with MongoDB wire-protocol compatibility.',
    capabilities: {
      document: cap('supported', ['documentdb-overview', 'documentdb-release-notes']),
      mongoWireProtocol: cap('supported', ['documentdb-mql-compat']),
      featureCompatibility: cap('conditional', ['documentdb-mql-compat'], 'The feature reference lists support by DocumentDB version; verify every required feature, command and driver for the target version.')
    },
    caveats: ['Protocol compatibility is not feature parity.', 'Check the current compatibility matrix, region, migration path and operational constraints.'],
    sourceIds: ['documentdb-overview', 'documentdb-release-notes', 'documentdb-mql-compat']
  },
  {
    id: 'cosmos-other-apis', name: 'Azure Cosmos DB APIs (Cassandra, Gremlin, Table)', family: 'Document & distributed', kind: 'API-specific NoSQL offerings',
    model: 'Wide-column, graph or key-value depending on API', api: 'Cassandra / Gremlin / Table APIs', role: 'System of record',
    summary: 'Separate API choices for workloads tied to a particular data model or protocol.',
    capabilities: {
      apiChoice: cap('supported', ['cosmos-overview']),
      compatibility: cap('unknown', ['cosmos-overview'], 'Validate protocol version, operations, data model and feature-specific compatibility for the chosen API.')
    },
    caveats: ['Different Cosmos APIs are not one interchangeable engine.', 'Evaluate migration and client compatibility per API.'],
    sourceIds: ['cosmos-overview']
  },
  {
    id: 'cosmos-cassandra', name: 'Azure Managed Instance for Apache Cassandra', family: 'Document & distributed', kind: 'Managed Cassandra-compatible service',
    model: 'Wide-column', api: 'Apache Cassandra/CQL', role: 'System of record',
    summary: 'Managed native Apache Cassandra deployment in Azure; the current overview documents support through Cassandra 5.0.',
    capabilities: {
      wideColumn: cap('supported', ['arch-data-models']),
      cassandraCompatibility: cap('conditional', ['cassandra-managed-overview'], 'The current overview documents support through Cassandra 5.0; verify target version, topology, migration path and region.')
    },
    caveats: ['A legacy Cassandra deployment does not prove this target is compatible.', 'Confirm region availability, service status and migration path before deployment.'],
    sourceIds: ['arch-data-models', 'cassandra-managed-overview']
  },
  {
    id: 'managed-redis', name: 'Azure Managed Redis', family: 'Cache', kind: 'Managed in-memory cache',
    model: 'Key-value / in-memory data structures', api: 'Redis-compatible client protocol', role: 'Cache or transient data',
    summary: 'Managed Redis service to evaluate for cache and in-memory data needs.',
    capabilities: {
      cache: cap('supported', ['arch-data-models', 'managed-redis-overview']),
      durableSystemOfRecord: cap('conditional', ['managed-redis-overview'], 'The cache architecture does not make Redis the source of truth. Assess any intended authoritative-state use against the service’s actual persistence, recovery and failure behaviour.'),
      clientCompatibility: cap('conditional', ['redis-retirement'], 'Check clustering and client-library requirements for the configured instance.')
    },
    caveats: ['Use with an explicit source-of-truth and cache invalidation/failure strategy when data must be durable.', 'Azure Cache for Redis tiers have retirement dates that vary by tier.'],
    sourceIds: ['arch-data-models', 'managed-redis-overview', 'redis-retirement']
  },
  {
    id: 'blob-storage', name: 'Azure Blob Storage', family: 'Specialised storage & analytics', kind: 'Object storage',
    model: 'Objects / blobs', api: 'Azure Storage APIs', role: 'File and object store',
    summary: 'Object storage for documents, media, backups, exports and other files.',
    capabilities: {
      objectStorage: cap('supported', ['blob-overview']),
      relationalDatabase: cap('unsupported', ['arch-data-models'], 'Object storage is not a relational database.')
    },
    caveats: ['Blob Storage is not a database or automatically a transactional record store.', 'Check access patterns, namespace, identity, network, retention and lifecycle policy.'],
    sourceIds: ['blob-overview', 'arch-data-models']
  },
  {
    id: 'table-storage', name: 'Azure Table Storage', family: 'Specialised storage & analytics', kind: 'Key-value / NoSQL storage',
    model: 'Key-value and schemaless entities', api: 'Azure Tables API', role: 'Special-purpose store',
    summary: 'Simple key-oriented entity storage; distinguish it from a relational database and Cosmos DB Table API.',
    capabilities: {
      keyValue: cap('supported', ['arch-data-models']),
      relationalDatabase: cap('unsupported', ['arch-data-models'])
    },
    caveats: ['Do not assume Azure Table Storage and Cosmos DB Table API have the same capabilities or operating model.'],
    sourceIds: ['arch-data-models', 'cosmos-overview']
  },
  {
    id: 'adls-gen2', name: 'Azure Data Lake Storage Gen2', family: 'Specialised storage & analytics', kind: 'Data lake / object storage',
    model: 'Files and objects for analytics', api: 'Azure Storage APIs with hierarchical namespace options', role: 'Data lake',
    summary: 'File/object storage for analytical data and data-lake patterns.',
    capabilities: {
      objectStorage: cap('supported', ['arch-data-models']),
      analyticsStore: cap('conditional', ['arch-data-models'], 'Suitability depends on workload shape, governance, processing and integration.')
    },
    caveats: ['A data lake is not an OLTP database or search index.'],
    sourceIds: ['arch-data-models']
  },
  {
    id: 'ai-search', name: 'Azure AI Search', family: 'Specialised storage & analytics', kind: 'Search and indexing service',
    model: 'Search index; optional vector search', api: 'Search APIs', role: 'Derived index / retrieval',
    summary: 'Search and indexing service for full-text and relevance-oriented retrieval patterns.',
    capabilities: {
      searchIndex: cap('supported', ['arch-data-models', 'ai-search-overview']),
      vectorSearch: cap('conditional', ['ai-search-overview'], 'Check selected feature, vector configuration, service tier, region and limits.')
    },
    caveats: ['A search index is usually derived from source records; define indexing lag, reindexing and source-of-truth behaviour.', 'AI or RAG does not itself require a vector database.'],
    sourceIds: ['arch-data-models', 'ai-search-overview']
  },
  {
    id: 'data-explorer', name: 'Azure Data Explorer', family: 'Specialised storage & analytics', kind: 'Time-series and analytics service',
    model: 'Time-series / analytical event data', api: 'Kusto Query Language', role: 'Analytics store',
    summary: 'Analytics-oriented option to evaluate for high-ingest telemetry and event queries.',
    capabilities: {
      timeSeriesAnalytics: cap('supported', ['arch-data-models', 'data-explorer-overview']),
      transactionalSystemOfRecord: cap('unknown', ['data-explorer-overview'], 'Do not infer transactional suitability; verify current product documentation and workload requirements.')
    },
    caveats: ['Not selected solely because data contains timestamps; query and retention patterns matter.'],
    sourceIds: ['arch-data-models', 'data-explorer-overview']
  },
  {
    id: 'fabric-warehouse', name: 'Fabric Warehouse', family: 'Specialised storage & analytics', kind: 'Analytical warehouse',
    model: 'Relational analytical warehouse', api: 'Fabric SQL analytics', role: 'Analytics store',
    summary: 'Analytical warehouse option within Microsoft Fabric.',
    capabilities: {
      analytical: cap('conditional', ['arch-data-models', 'fabric-overview'], 'Confirm current service capabilities, region, capacity and workload requirements.')
    },
    caveats: ['OLAP is distinct from application OLTP; check Fabric capacity and governance fit.'],
    sourceIds: ['arch-data-models', 'fabric-overview']
  },
  {
    id: 'fabric-lakehouse', name: 'Fabric Lakehouse', family: 'Specialised storage & analytics', kind: 'Lakehouse analytics',
    model: 'Files and analytical tables', api: 'Fabric data engineering and analytics', role: 'Analytics store',
    summary: 'Lakehouse option within Microsoft Fabric for analytical data engineering patterns.',
    capabilities: {
      analytical: cap('conditional', ['arch-data-models', 'fabric-overview'], 'Confirm workload, format, region, capacity and governance constraints.')
    },
    caveats: ['A lakehouse is not automatically the operational system of record.'],
    sourceIds: ['arch-data-models', 'fabric-overview']
  },
  {
    id: 'fabric-eventhouse', name: 'Fabric Eventhouse', family: 'Specialised storage & analytics', kind: 'Real-time analytics',
    model: 'Time-series / event analytics', api: 'Fabric Real-Time Intelligence', role: 'Analytics store',
    summary: 'Fabric analytics option to evaluate for time-oriented and event workloads.',
    capabilities: {
      timeSeriesAnalytics: cap('conditional', ['arch-data-models', 'fabric-overview'], 'Confirm current Eventhouse features, capacity, region and ingestion/query needs.')
    },
    caveats: ['Do not infer operational-database suitability from event analytics features.'],
    sourceIds: ['arch-data-models', 'fabric-overview']
  },
  {
    id: 'onelake', name: 'OneLake', family: 'Specialised storage & analytics', kind: 'Fabric data lake',
    model: 'Files and analytical data', api: 'Fabric data platform', role: 'Shared analytics storage',
    summary: 'Fabric-wide logical data lake concept, distinct from a transactional database engine.',
    capabilities: {
      analyticalStorage: cap('conditional', ['fabric-overview'], 'Check supported workload, capacity, access and governance details.')
    },
    caveats: ['OneLake is not a database engine or a replacement for every operational store.'],
    sourceIds: ['fabric-overview']
  },
  {
    id: 'cosmos-pg', name: 'Azure Cosmos DB for PostgreSQL', family: 'Relational', kind: 'Distributed PostgreSQL service',
    model: 'PostgreSQL with distributed tables', api: 'PostgreSQL wire protocol with Citus extensions', role: 'System of record',
    lifecycle: 'retirement-path',
    summary: 'Retirement-path service; not recommended for new projects.',
    capabilities: {
      postgresDistributed: cap('supported', ['cosmos-pg-retirement']),
      newDeployment: cap('unsupported', ['cosmos-pg-retirement'], 'Microsoft states it is on a retirement path and not recommended for new projects.')
    },
    caveats: ['Do not recommend for a new deployment; for existing deployments consult current retirement and migration guidance.'],
    sourceIds: ['cosmos-pg-retirement']
  },
  {
    id: 'azure-mariadb-service', name: 'Azure Database for MariaDB', family: 'Relational', kind: 'Retired managed database service',
    model: 'MariaDB relational engine', api: 'MariaDB protocol', role: 'Legacy system only',
    lifecycle: 'retired-service',
    summary: 'Azure managed service retirement record. MariaDB as a database engine is not retired by this service retirement.',
    capabilities: {
      newDeployment: cap('unsupported', ['mariadb-retirement'], 'Do not recommend for new deployments; verify the retirement notice and migration guidance.')
    },
    caveats: ['The service retirement date was 19 September 2025; this does not mean MariaDB software in general is retired.'],
    sourceIds: ['mariadb-retirement']
  },
  {
    id: 'azure-cache-redis-legacy', name: 'Azure Cache for Redis (legacy tiers)', family: 'Cache', kind: 'Retiring managed cache',
    model: 'In-memory key-value', api: 'Redis-compatible clients', role: 'Cache only',
    lifecycle: 'retirement-path',
    summary: 'Retirement-path product; retirement dates vary by tier.',
    capabilities: {
      cache: cap('supported', ['redis-retirement']),
      newRecommendation: cap('unsupported', ['redis-retirement'], 'For new design, evaluate Azure Managed Redis and check the current retirement guidance.')
    },
    caveats: ['Basic/Standard/Premium and Enterprise tiers do not share one retirement date.'],
    sourceIds: ['redis-retirement']
  }
].map((service) => ({
  ...service,
  verifiedOn: REVIEWED_ON,
  reviewDimensions: {
    versionsAndCompatibility: service.capabilities.featureCompatibility || service.capabilities.requiredExtensions || cap('unknown', service.sourceIds, 'Exact supported versions, driver/dialect behaviour and feature restrictions require the current service-specific matrix.'),
    transactionsAndConsistency: service.capabilities.transactionalBoundary || cap('unknown', service.sourceIds, 'Confirm actual atomicity, isolation, consistency and concurrency boundaries for the engine/API; a data-model label is not a transaction guarantee.'),
    scaling: cap('unknown', service.sourceIds, 'Verify compute, storage, throughput, replicas and any scale-out restrictions. No tier, capacity, vCore or RU/s quantity is selected.'),
    availabilityAndRecovery: cap('unknown', service.sourceIds, 'Check tier/region-specific HA, zone redundancy, backups, retention, PITR and DR; test restore and application failover against RPO/RTO.'),
    securityAndNetworking: cap('unknown', service.sourceIds, 'Verify Entra versus native authentication, managed identity, keys/encryption, private/hybrid access, RBAC and auditing for this exact service.'),
    pricingDimensions: cap('unknown', service.sourceIds, 'Review the applicable compute, storage, throughput, backup, transfer, licence and operational charges using current regional prices.'),
    managementResponsibilities: cap('conditional', service.sourceIds, service.id === 'sql-server-vm' ? 'Microsoft provides Azure infrastructure; the customer plans VM/OS and SQL Server patching, backups, upgrades, HA/DR and database operations.' : 'Verify the service’s managed-platform responsibilities; the customer still owns data/schema, application access, query/index tuning, configuration, monitoring, recovery testing and incident response.')
  }
}));

export const serviceById = Object.fromEntries(services.map((service) => [service.id, service]));
