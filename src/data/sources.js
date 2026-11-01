export const REVIEWED_ON = '2026-11-01';

export const sources = [
  {
    id: 'arch-data-models',
    title: 'Understand data models',
    publisher: 'Microsoft Learn — Azure Architecture Center',
    url: 'https://learn.microsoft.com/en-us/azure/architecture/data-guide/technology-choices/understand-data-store-models',
    published: '2025-08-21',
    verifiedOn: REVIEWED_ON,
    evidence: 'Classifies relational, document, column-family, time-series, object/file, search, vector and analytical models; describes polyglot persistence and selection by access pattern.',
    limitation: 'Model-level guidance, not a feature guarantee for every SKU, region, API or configuration.'
  },
  {
    id: 'arch-data-considerations',
    title: 'Data store considerations',
    publisher: 'Microsoft Learn — Azure Architecture Center',
    url: 'https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/data-stores-getting-started',
    published: '2025-09-02; updated 2026-10-20',
    verifiedOn: REVIEWED_ON,
    evidence: 'Frames data-store choice around data shape, access patterns, consistency, scale, governance and operational needs.',
    limitation: 'Architecture guidance; validate implementation details against the service documentation.'
  },
  {
    id: 'azure-sql-features',
    title: 'Compare SQL Database and Managed Instance engine features',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/azure-sql/database/features-comparison?view=azuresql',
    published: '2026-09-30; updated 2026-10-19',
    verifiedOn: REVIEWED_ON,
    evidence: 'Separates native three-part name/cross-database queries from elastic query, and documents feature-specific limitations for SQL Database and Managed Instance.',
    limitation: 'Some features are conditional or preview; verify the linked details for the target configuration.'
  },
  {
    id: 'cosmos-transactions',
    title: 'Database transactions and optimistic concurrency control',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/database-transactions-optimistic-concurrency',
    published: '2025-07-07; updated 2026-04-27',
    verifiedOn: REVIEWED_ON,
    evidence: 'Documents Cosmos DB for NoSQL ACID multi-item transactions with snapshot isolation within a container logical partition.',
    limitation: 'Do not generalise this scope to another API, cross-partition transactions or cross-service atomic writes.'
  },
  {
    id: 'azure-sql-family',
    title: 'What is Azure SQL?',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/azure-sql/azure-sql-iaas-vs-paas-what-is-overview?view=azuresql',
    published: '2026-03-11',
    verifiedOn: REVIEWED_ON,
    evidence: 'Distinguishes Azure SQL Database, Azure SQL Managed Instance and SQL Server on Azure VMs as different platform and operating models.',
    limitation: 'Microsoft describes high-level service characteristics; individual feature availability still depends on service and configuration.'
  },
  {
    id: 'azure-sql-decision',
    title: 'Azure SQL decision tree',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/azure-sql/azure-sql-decision-tree?view=azuresql',
    published: '2026-03-12',
    verifiedOn: REVIEWED_ON,
    evidence: 'Identifies OS/file-system control and specific SQL Server version as VM decision factors, and SQL Agent, CLR, cross-database queries, linked servers and transactional replication as Managed Instance factors.',
    limitation: 'Decision guide, not a substitute for feature-level compatibility assessment or sizing.'
  },
  {
    id: 'postgres-overview',
    title: 'Azure Database for PostgreSQL overview',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/postgresql/overview',
    published: '2026-01-09',
    verifiedOn: REVIEWED_ON,
    evidence: 'Describes Flexible Server as a managed PostgreSQL service, configurable compute, backups, high availability and regional availability.',
    limitation: 'Versions, extensions, regions, options and service limits must be checked for the target deployment.'
  },
  {
    id: 'postgres-extensions',
    title: 'Allow extensions in Azure Database for PostgreSQL Flexible Server',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/postgresql/extensions/how-to-allow-extensions',
    published: '2026-07-10',
    verifiedOn: REVIEWED_ON,
    evidence: 'Extensions must be selected from the service allow-list using the azure.extensions parameter before use.',
    limitation: 'Does not establish that any particular extension is available for every server version or region.'
  },
  {
    id: 'mysql-overview',
    title: 'Azure Database for MySQL Flexible Server overview',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/mysql/flexible-server/overview',
    published: '2026-06-26',
    verifiedOn: REVIEWED_ON,
    evidence: 'Describes Flexible Server as a managed relational MySQL Community Edition service with configurable compute tiers, backups and high availability.',
    limitation: 'Validate engine version, feature and migration compatibility against the specific application and target configuration.'
  },
  {
    id: 'cosmos-overview',
    title: 'Azure Cosmos DB for NoSQL overview',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/overview',
    published: '2026-06-18',
    verifiedOn: REVIEWED_ON,
    evidence: 'Describes the managed NoSQL service, document storage, SDKs and configurable global distribution. API-specific compatibility is documented separately.',
    limitation: 'API names do not prove complete compatibility with another product or API. Check the exact API feature matrix.'
  },
  {
    id: 'cosmos-consistency',
    title: 'Consistency level choices',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/consistency-levels',
    published: '2025-09-03',
    verifiedOn: REVIEWED_ON,
    evidence: 'Documents five consistency levels and explains trade-offs; the documented read consistency scope is a single read operation within a logical partition.',
    limitation: 'Consistency behaviour and options must be checked for the selected API and account configuration.'
  },
  {
    id: 'cosmos-partitioning',
    title: 'Partitioning and horizontal scaling in Azure Cosmos DB',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/partitioning',
    published: 'Continuously maintained',
    verifiedOn: REVIEWED_ON,
    evidence: 'Explains logical and physical partitioning and the relationship between partition-key design and distribution.',
    limitation: 'A workload-specific partition key and throughput design cannot be inferred from this navigator.'
  },
  {
    id: 'documentdb-overview',
    title: 'Azure DocumentDB overview',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/documentdb/overview',
    published: '2026-06-08',
    verifiedOn: REVIEWED_ON,
    evidence: 'Describes Azure DocumentDB as a managed document database with MongoDB wire-protocol compatibility.',
    limitation: 'The service overview makes broad compatibility claims; verify every required command, aggregation, driver and migration path in the compatibility reference.'
  },
  {
    id: 'documentdb-release-notes',
    title: 'Azure DocumentDB service release notes',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/documentdb/release-notes',
    published: 'Rename announced 2025-11-18; updated 2026-06-02',
    verifiedOn: REVIEWED_ON,
    evidence: 'Microsoft states Azure Cosmos DB for MongoDB (vCore) is now Azure DocumentDB (with MongoDB compatibility).',
    limitation: 'The rename does not establish feature equivalence with RU-based Cosmos DB for MongoDB.'
  },
  {
    id: 'documentdb-mql-compat',
    title: 'MongoDB Query Language compatibility',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/documentdb/compatibility-query-language',
    published: '2025-11-05; updated 2026-06-13',
    verifiedOn: REVIEWED_ON,
    evidence: 'Lists MongoDB query operators, commands and support across DocumentDB versions 5.0–8.0, including wire protocol compatibility.',
    limitation: 'Overall compatibility percentages and protocol support do not guarantee that an application-specific workload is compatible; inspect required features.'
  },
  {
    id: 'cosmos-mongodb-features',
    title: 'Azure Cosmos DB for MongoDB 4.2 supported features and syntax',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/feature-support-42',
    published: '2025-08-20',
    verifiedOn: REVIEWED_ON,
    evidence: 'Documents supported commands, aggregation operators and limitations for the MongoDB 4.2 API; explicitly notes multi-document transaction boundaries.',
    limitation: 'This feature matrix is specific to the documented API version; do not generalise it to Azure DocumentDB, other Cosmos Mongo versions or MongoDB server.'
  },
  {
    id: 'cassandra-managed-overview',
    title: 'Azure Managed Instance for Apache Cassandra overview',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/managed-instance-apache-cassandra/introduction',
    published: 'Updated 2026-08-25',
    verifiedOn: REVIEWED_ON,
    evidence: 'Describes a managed native Apache Cassandra deployment and documents support through Cassandra 5.0.',
    limitation: 'Verify current supported versions, regional availability and service status before considering a new deployment.'
  },
  {
    id: 'cosmos-pg-retirement',
    title: 'Azure Cosmos DB for PostgreSQL introduction',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/postgresql/introduction',
    published: '2025-06-11',
    verifiedOn: REVIEWED_ON,
    evidence: 'Explicitly says Azure Cosmos DB for PostgreSQL is on a retirement path and is not recommended for new projects; points PostgreSQL workloads to Flexible Server Elastic Clusters.',
    limitation: 'Check the linked retirement and migration guidance for dates and options applicable to existing clusters.'
  },
  {
    id: 'redis-retirement',
    title: 'Azure Cache for Redis retirement FAQ',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/retirement-faq',
    published: '2025-10-02',
    verifiedOn: REVIEWED_ON,
    evidence: 'States Basic, Standard and Premium Azure Cache for Redis instances retire on 30 September 2028 and recommends Azure Managed Redis migration; distinguishes tier retirement details.',
    limitation: 'Retirement schedule differs by tier. Verify the current FAQ and migration guide before an implementation decision.'
  },
  {
    id: 'managed-redis-overview',
    title: 'What is Azure Managed Redis?',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/redis/overview',
    published: '2026-05-28',
    verifiedOn: REVIEWED_ON,
    evidence: 'Describes Azure Managed Redis as an in-memory data store and documents common cache-aside and session-store architecture patterns.',
    limitation: 'Use depends on data role, persistence requirements, client compatibility, service tier and configuration.'
  },
  {
    id: 'blob-overview',
    title: 'Introduction to Blob Storage',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction',
    published: 'Continuously maintained',
    verifiedOn: REVIEWED_ON,
    evidence: 'Defines object storage for unstructured text/binary data, file delivery, archives and analytics inputs; distinguishes block, append and page blobs.',
    limitation: 'Confirm access tier, namespace, region, security and lifecycle requirements for the actual solution.'
  },
  {
    id: 'ai-search-overview',
    title: 'Introduction to Azure AI Search',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/search/search-what-is-azure-search',
    published: 'Continuously maintained',
    verifiedOn: REVIEWED_ON,
    evidence: 'Defines a managed search service; classic search loads source content into an index and supports full-text, vector and hybrid queries. Separates classic and agentic retrieval.',
    limitation: 'A search index is not automatically a transactional system of record; check supported features and tier/region limits.'
  },
  {
    id: 'data-explorer-overview',
    title: 'What is Azure Data Explorer?',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/data-explorer/data-explorer-overview',
    published: 'Continuously maintained',
    verifiedOn: REVIEWED_ON,
    evidence: 'Defines a managed analytics platform for logs, telemetry and interactive time-series analysis, using typed tables, KQL and ingestion-time indexing.',
    limitation: 'Validate ingestion, query, retention, region and integration requirements for the workload.'
  },
  {
    id: 'fabric-overview',
    title: 'OneLake overview',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview',
    published: 'Continuously maintained',
    verifiedOn: REVIEWED_ON,
    evidence: 'Defines OneLake as the Fabric tenant-wide analytics data lake built on ADLS, with workspace/data-item governance. Does not establish capabilities of every Fabric workload.',
    limitation: 'Fabric workload capabilities, licensing, capacity, region and deployment constraints require current product-specific verification.'
  },
  {
    id: 'mariadb-retirement',
    title: 'Azure Products Retiring in September 2025',
    publisher: 'Microsoft Lifecycle',
    url: 'https://learn.microsoft.com/en-us/lifecycle/announcements/azure-products-retirement-september-2025',
    published: '2025-05-15',
    verifiedOn: REVIEWED_ON,
    evidence: 'Lists Azure Database for MariaDB with an end date of 19 September 2025 and links to migration guidance.',
    limitation: 'This retirement concerns the Azure-hosted service, not the MariaDB database engine as a whole; check the current notice and migration guidance.'
  },
  ...[
    ['vector-selection', 'Choose an Azure service for vector search', 'https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/vector-search', '2026-09-17', 'Recommends checking existing databases before adding a vector store; separate managed indexes suit multiple sources without real-time freshness requirements. Compares index types and service-specific limits.', 'A comparison snapshot is not a sizing or latency guarantee; service-specific pages take precedence.'],
    ['sql-vector', 'SQL vector data type', 'https://learn.microsoft.com/en-us/sql/t-sql/data-types/vector-data-type?view=azuresqldb-current', '2026-10-13', 'Documents float32 vectors up to 1,998 dimensions and float16 up to 3,996; half precision is GA in Azure SQL Database. Managed Instance availability depends on update policy.', 'Data type support does not establish ANN index availability; the vector selection guide marks SQL DiskANN indexing preview.'],
    ['postgres-vector', 'Use pgvector in Flexible Server', 'https://learn.microsoft.com/en-us/azure/postgresql/extensions/how-to-use-pgvector', '2026-07-10', 'The vector extension enables similarity search; allow-list vector and create it in each database.', 'Verify installed extension/version and index limits; the selection guide lists HNSW/IVFFlat indexing up to 2,000 dimensions.'],
    ['cosmos-vector', 'Cosmos DB integrated vector store', 'https://learn.microsoft.com/en-us/azure/cosmos-db/vector-search', '2025-09-25; updated 2026-09-29', 'Documents account enablement, container vector policy, flat (505 dimensions), quantizedFlat and DiskANN (4,096); fewer than 1,000 vectors use a full scan for the latter indexes.', 'Check container restrictions, partitioning, current region/configuration and preview features separately.'],
    ['documentdb-vector', 'DocumentDB integrated vector store', 'https://learn.microsoft.com/en-us/azure/documentdb/vector-search', '2025-11-05', 'Stores embeddings with documents and documents IVF, HNSW and DiskANN indexing.', 'Index type, compression, dimensions, tier and version need validation; no performance promise.'],
    ['redis-vector', 'Managed Redis vector similarity', 'https://learn.microsoft.com/en-us/azure/redis/overview-vector-similarity', '2026-06-22', 'RediSearch supports FLAT/HNSW; provision the module at creation with Enterprise clustering and NoEviction. Memory/Balanced/Compute tiers support it, Flash Optimized does not.', 'Existing instances cannot add modules afterwards; verify region, memory/index overhead and client configuration.'],
    ['search-vector', 'AI Search vector overview', 'https://learn.microsoft.com/en-us/azure/search/vector-search-overview', '2026-08-05', 'Supports vector and hybrid queries; vector search is available on all regions/tiers but old service instances and vector quotas require checks; embedding generation can cost separately.', 'This does not establish all semantic ranking or agentic features are available in all regions.'],
    ['gremlin-overview', 'Cosmos DB for Apache Gremlin overview', 'https://learn.microsoft.com/en-us/azure/cosmos-db/gremlin/overview', '2025-07-22', 'Documents property graphs and Gremlin traversal; points high-scale evaluation to NoSQL and OLAP/Gremlin migrations to Graph in Fabric.', 'TinkerPop compatibility is not parity; read support limits and current lifecycle guidance before selecting.'],
    ['fabric-graph', 'Graph in Microsoft Fabric overview', 'https://learn.microsoft.com/en-us/fabric/graph/overview', '2026-05-20', 'Documents OneLake-based graph analytics using GQL, capacity-based operation and a named region availability list; graph-powered Data Agent reasoning is preview.', 'Graph analytics is not automatically an OLTP graph replacement; target region and feature status need verification.'],
    ['cosmos-cassandra-api', 'Cosmos DB Cassandra API overview', 'https://learn.microsoft.com/en-us/azure/cosmos-db/cassandra/overview', '2025-07-22', 'Documents wide-column model and Cassandra/CQL API; recommends native managed Cassandra for Cassandra migration assessment.', 'API behaviour can differ from native Cassandra.'],
    ['cosmos-mongo-overview', 'Cosmos DB MongoDB API overview', 'https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/overview', '2025-07-22', 'Documents document model and MongoDB wire protocol; states Microsoft does not run MongoDB databases for this API.', 'Use the specific version compatibility matrix, not protocol support, for migration claims.'],
    ['sql-mi-overview', 'Managed Instance overview', 'https://learn.microsoft.com/en-us/azure/azure-sql/managed-instance/sql-managed-instance-paas-overview', '2026-02-19', 'Documents managed SQL/OS patching, native VNet, SQL Agent, linked servers and cross-database features, backups and update-policy differences.', 'Near-complete compatibility is not universal parity; configuration, feature differences and region need checking.'],
    ['fabric-sql', 'SQL database in Fabric overview', 'https://learn.microsoft.com/en-us/fabric/database/sql/overview', '2026-10-02', 'Defines an OLTP database using the Azure SQL Database engine and near-real-time replication to OneLake.', 'Fabric configuration and feature surface are not identical to Azure SQL Database.'],
    ['fabric-warehouse', 'Fabric Warehouse overview', 'https://learn.microsoft.com/en-us/fabric/data-warehouse/data-warehousing', '2025-09-09', 'Defines a T-SQL analytical warehouse over Delta tables with multi-table ACID transactions for curated marts and BI.', 'Analytics transactions do not establish suitability for application OLTP.'],
    ['fabric-lakehouse', 'Fabric Lakehouse overview', 'https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-overview', '2026-05-07', 'Defines Spark/SQL analytics on files and Delta tables; distinguishes lakehouse from warehouse and their multi-table transaction behaviour.', 'Workload, governance, capacity and region need assessment.'],
    ['fabric-eventhouse', 'Fabric Eventhouse overview', 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/eventhouse', '2026-06-15', 'Defines a container of databases for streaming time-based events, KQL analysis and shared capacity/monitoring.', 'No ingestion or query performance guarantee for a particular workload.'],
    ['table-overview', 'Azure Table Storage overview', 'https://learn.microsoft.com/en-us/azure/storage/tables/table-storage-overview', '2021-05-27', 'Defines key/attribute schemaless entity storage, partition/row keys, authenticated access and contrasts Cosmos DB Table API.', 'Do not generalise Cosmos Table indexing or distribution capabilities to Table Storage.'],
    ['adls-overview', 'Azure Data Lake Storage overview', 'https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction', '2026-07-02', 'Defines analytical capabilities on Blob Storage enabled by hierarchical namespace, file-system semantics and ABFS access.', 'It is a capability set on Blob Storage, not an independent transactional engine.'],
    ['sql-json', 'JSON in SQL Database Engine', 'https://learn.microsoft.com/en-us/sql/relational-databases/json/json-data-sql-server?view=azuresqldb-current', '2026-10-14', 'Documents JSON functions alongside relational columns; JSON support requires compatibility level 130 or higher.', 'Validate exact version, native JSON/index availability and query behaviour separately.'],
    ['postgres-json', 'PostgreSQL JSON types', 'https://www.postgresql.org/docs/current/datatype-json.html', 'Current engine documentation', 'Documents json, jsonb and jsonpath; jsonb supports indexing and has semantics different from textual json.', 'Engine documentation does not establish the target Azure server version or configuration.'],
    ['partition-design', 'Data partitioning recommendations', 'https://learn.microsoft.com/en-us/azure/well-architected/design-guides/partition-data', '2023-11-15; updated 2026-10-09', 'Explains access-pattern-driven partitioning, hot partitions, contention and cross-partition complexity.', 'General engineering guidance; not proof of service-specific performance.'],
    ['sql-db-overview', 'SQL Database overview', 'https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview?view=azuresql', '2026-10-13', 'Documents database-scoped PaaS, managed patching/backups, single/pool and provisioned/serverless configurations, vCore/DTU purchasing and service tiers.', 'No tier, capacity or availability recommendation follows without workload and region validation.'],
    ['sql-vm-overview', 'SQL Server on Windows VMs overview', 'https://learn.microsoft.com/en-us/azure/azure-sql/virtual-machines/windows/sql-server-on-azure-vm-iaas-what-is-overview?view=azuresql', '2026-04-02', 'Documents full SQL Server editions/versions on VMs, IaaS Agent configuration benefits including backup/patching and licensing models.', 'Windows overview; verify OS, version, edition, extension and maintenance setup.'],
    ['sql-development', 'Azure SQL application development', 'https://learn.microsoft.com/en-us/azure/azure-sql/database/develop-overview?view=azuresql', '2026-05-26', 'Documents SQL/Entra authentication, closing pooled connections promptly, avoiding long-running transactions and backoff for transient errors.', 'Validate the actual driver and network architecture; do not silently retry non-idempotent writes.'],
    ['sql-performance', 'SQL Database performance guidance', 'https://learn.microsoft.com/en-us/azure/azure-sql/database/performance-guidance?view=azuresql', '2025-01-06', 'Discusses query/index/statistics tuning, chatty network round trips and concurrency; larger compute alone may not correct poor access design.', 'Guidance for SQL Database/Fabric SQL, not a benchmark or universal SKU recommendation.'],
    ['sql-read-replicas', 'Azure SQL read scale-out', 'https://learn.microsoft.com/en-us/azure/azure-sql/database/read-scale-out?view=azuresql', '2026-01-27', 'Read-scale availability depends on tier; reads are asynchronous relative to the primary and may not immediately show committed changes. No fixed upper bound on propagation lag.', 'Use primary reads where immediate read-after-write consistency is required; HA replicas and read scaling are not backup.'],
    ['postgres-replicas', 'PostgreSQL read replicas', 'https://learn.microsoft.com/en-us/azure/postgresql/read-replica/concepts-read-replicas', '2026-07-13', 'Read-only replicas use asynchronous physical replication, offload reads not writes, incur compute/storage charges and require lag monitoring; GP/Memory Optimized tiers supported, not Burstable.', 'No synchronous read consistency or recovery-time guarantee; validate peak workload, tier and region.'],
    ['performance-design', 'Optimise data performance', 'https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/optimize-data-performance', '2026-05-13', 'Recommends profiling access patterns, query plans, indexes, partitioning, configuration and measured monitoring/tuning.', 'General workload guidance, not comparative service performance evidence.'],
    ['cache-aside', 'Cache-aside pattern', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside', '2025-09-11', 'Describes source reads on cache misses, invalidation after writes, expiry, eviction and possible staleness; cache-aside does not guarantee consistency.', 'Select and test a concrete application strategy; arrows in the navigator do not automatically implement this pattern.']
  ].map(([id, title, url, published, evidence, limitation]) => ({
    id, title, url, published, evidence, limitation, verifiedOn: REVIEWED_ON,
    publisher: id === 'postgres-json' ? 'PostgreSQL Global Development Group' : 'Microsoft Learn'
  }))
];

export const sourceById = Object.fromEntries(sources.map((source) => [source.id, source]));
