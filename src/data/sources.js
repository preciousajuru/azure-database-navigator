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
    published: 'Updated 2026-08-25',
    verifiedOn: REVIEWED_ON,
    evidence: 'Frames data-store choice around data shape, access patterns, consistency, scale, governance and operational needs.',
    limitation: 'Architecture guidance; validate implementation details against the service documentation.'
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
    title: 'Azure Cosmos DB documentation and APIs',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/',
    published: '2026-06-18',
    verifiedOn: REVIEWED_ON,
    evidence: 'Lists distinct APIs for NoSQL, MongoDB, Cassandra, Gremlin, Table and PostgreSQL, as well as vector-oriented documentation.',
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
    published: 'Continuously maintained',
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
    title: 'Azure Blob Storage documentation',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/storage/blobs/',
    published: 'Continuously maintained',
    verifiedOn: REVIEWED_ON,
    evidence: 'Service reference for object storage and blob capabilities.',
    limitation: 'Confirm access tier, namespace, region, security and lifecycle requirements for the actual solution.'
  },
  {
    id: 'ai-search-overview',
    title: 'Azure AI Search documentation',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/search/',
    published: 'Continuously maintained',
    verifiedOn: REVIEWED_ON,
    evidence: 'Service reference for search and indexing capabilities, including vector-search documentation.',
    limitation: 'A search index is not automatically a transactional system of record; check supported features and tier/region limits.'
  },
  {
    id: 'data-explorer-overview',
    title: 'Azure Data Explorer documentation',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/azure/data-explorer/',
    published: 'Continuously maintained',
    verifiedOn: REVIEWED_ON,
    evidence: 'Service reference for Azure Data Explorer and its analytics-oriented workload.',
    limitation: 'Validate ingestion, query, retention, region and integration requirements for the workload.'
  },
  {
    id: 'fabric-overview',
    title: 'Microsoft Fabric documentation',
    publisher: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/fabric/',
    published: 'Continuously maintained',
    verifiedOn: REVIEWED_ON,
    evidence: 'Service documentation for Fabric data workloads, including Warehouse, Lakehouse, Eventhouse and OneLake concepts.',
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
  }
];

export const sourceById = Object.fromEntries(sources.map((source) => [source.id, source]));
