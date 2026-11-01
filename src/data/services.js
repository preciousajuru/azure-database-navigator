import { REVIEWED_ON } from './sources.js';
import { familyFor } from './families.js';


export const services = [
  {
    id: 'azure-sql-db', name: 'Azure SQL Database', family: 'Relational', kind: 'Managed relational database',
    model: 'SQL Server relational engine', api: 'T-SQL / SQL Server engine', role: 'System of record',
    summary: 'Database-scoped managed SQL Server option for application databases.',
    configurationConsiderations: ['Choose database service first, then validate serverless or provisioned compute, elastic pools and service tier against measured workload needs.'],
    caveats: ['Choose database service first; serverless, provisioned, pools, and service tiers are separate configuration choices.', 'Do not infer a purchasing tier, capacity, or price from this assessment.'],
    sourceIds: ['azure-sql-family', 'azure-sql-decision', 'azure-sql-features', 'arch-data-models']
  },
  {
    id: 'azure-sql-mi', name: 'Azure SQL Managed Instance', family: 'Relational', kind: 'Managed SQL Server instance',
    model: 'SQL Server relational engine', api: 'T-SQL / SQL Server engine', role: 'System of record',
    summary: 'Managed SQL Server instance model for workloads whose verified feature needs exceed database-scoped options.',
    configurationConsiderations: ['Verify required instance features, networking, migration and regional availability before deciding on the target configuration.'],
    caveats: ['“Near-complete” SQL Server feature parity is not identical to universal compatibility.', 'Provisioning, networking, migration, and recovery still require design.'],
    sourceIds: ['azure-sql-family', 'azure-sql-decision']
  },
  {
    id: 'sql-server-vm', name: 'SQL Server on Azure VMs', family: 'Relational', kind: 'Self-managed SQL Server on IaaS',
    model: 'SQL Server relational engine', api: 'SQL Server / T-SQL', role: 'System of record',
    summary: 'SQL Server hosted on an Azure virtual machine where OS or file-system control or a specific engine version is a requirement.',
    configurationConsiderations: ['Plan VM/SQL version, operating-system administration, patching, backups, high availability, monitoring and recovery ownership.'],
    caveats: ['More control entails more operational responsibility; specify patching, backups, HA and DR ownership.', 'A legacy VM by itself does not establish a need for a VM target.'],
    sourceIds: ['azure-sql-family', 'azure-sql-decision']
  },
  {
    id: 'postgres-flex', name: 'Azure Database for PostgreSQL Flexible Server', family: 'Relational', kind: 'Managed relational database',
    model: 'PostgreSQL relational engine', api: 'PostgreSQL wire protocol', role: 'System of record',
    summary: 'Managed PostgreSQL with configurable server settings and deployment options.',
    configurationConsiderations: ['Validate PostgreSQL version, required extensions, compute, HA, replicas, storage, backup retention and region.'],
    caveats: ['A named extension is a validation gate, not a promise of availability.', 'Check PostgreSQL version, extension allow-list, region, HA and backup settings.'],
    sourceIds: ['postgres-overview', 'postgres-extensions']
  },
  {
    id: 'mysql-flex', name: 'Azure Database for MySQL Flexible Server', family: 'Relational', kind: 'Managed relational database',
    model: 'MySQL Community Edition relational engine', api: 'MySQL protocol', role: 'System of record',
    summary: 'Managed MySQL service for applications requiring the MySQL engine and ecosystem.',
    configurationConsiderations: ['Validate MySQL version, compute tier, HA, backup retention, network and migration compatibility.'],
    caveats: ['MySQL is not a drop-in promise for every MariaDB deployment.', 'The Azure Database for MariaDB service retirement does not mean the MariaDB engine itself is retired.'],
    sourceIds: ['mysql-overview', 'mariadb-retirement']
  },
  {
    id: 'sql-fabric', name: 'SQL database in Microsoft Fabric', family: 'Relational', kind: 'Fabric-integrated transactional database',
    model: 'SQL relational engine', api: 'SQL', role: 'System of record',
    summary: 'Transactional SQL option associated with the Microsoft Fabric ecosystem.',
    caveats: ['Not interchangeable with Azure SQL Database by name alone.', 'Current product availability and platform constraints need confirmation.'],
    sourceIds: ['fabric-sql']
  },
  {
    id: 'cosmos-nosql', name: 'Azure Cosmos DB for NoSQL', family: 'Document & distributed', kind: 'Distributed NoSQL database',
    model: 'JSON documents', api: 'Native NoSQL API and SQL-like query language', role: 'System of record',
    summary: 'Document-oriented NoSQL API with account-level consistency choices and partition-aware data modelling.',
    configurationConsiderations: ['Design partition key, throughput mode, indexing, consistency, regions and transaction boundaries together.'],
    caveats: ['JSON alone is not a reason to choose Cosmos DB.', 'Partition key, throughput mode, consistency, regions, request costs and transaction scope require explicit design.'],
    sourceIds: ['cosmos-overview', 'cosmos-consistency', 'cosmos-partitioning', 'cosmos-transactions']
  },
  {
    id: 'cosmos-mongo-ru', name: 'Azure Cosmos DB for MongoDB (RU-based)', family: 'Document & distributed', kind: 'MongoDB-compatible API offering',
    model: 'Document', api: 'MongoDB wire protocol; RU-based offering', role: 'System of record',
    summary: 'Cosmos DB API for MongoDB using the request-unit model; distinct from Azure DocumentDB.',
    caveats: ['Azure DocumentDB is the current name for the vCore-based offering, not an additional third option.', 'Do not treat MongoDB driver support as full MongoDB server compatibility.'],
    sourceIds: ['cosmos-mongo-overview', 'cosmos-mongodb-features']
  },
  {
    id: 'azure-documentdb', name: 'Azure DocumentDB', family: 'Document & distributed', kind: 'Managed MongoDB-compatible document database',
    model: 'Document', api: 'MongoDB wire protocol', role: 'System of record',
    aliases: ['Cosmos DB for MongoDB (vCore)'],
    summary: 'Current name for the vCore-based Cosmos DB for MongoDB offering; managed document database with MongoDB wire-protocol compatibility.',
    caveats: ['Protocol compatibility is not feature parity.', 'Check the current compatibility matrix, region, migration path and operational constraints.'],
    sourceIds: ['documentdb-overview', 'documentdb-release-notes', 'documentdb-mql-compat']
  },
  {
    id: 'cosmos-other-apis', name: 'Azure Cosmos DB APIs (Cassandra, Gremlin, Table)', family: 'Document & distributed', kind: 'API-specific NoSQL offerings',
    model: 'Wide-column, graph or key-value depending on API', api: 'Cassandra / Gremlin / Table APIs', role: 'System of record',
    summary: 'Separate API choices for workloads tied to a particular data model or protocol.',
    caveats: ['Different Cosmos APIs are not one interchangeable engine.', 'Evaluate migration and client compatibility per API.'],
    sourceIds: ['cosmos-cassandra-api', 'gremlin-overview', 'table-overview']
  },
  {
    id: 'managed-cassandra', name: 'Azure Managed Instance for Apache Cassandra', family: 'Document & distributed', kind: 'Managed native Cassandra service',
    model: 'Wide-column', api: 'Apache Cassandra/CQL', role: 'System of record',
    summary: 'Managed native Apache Cassandra deployment in Azure; the current overview documents support through Cassandra 5.0.',
    caveats: ['A legacy Cassandra deployment does not prove this target is compatible.', 'Confirm region availability, service status and migration path before deployment.'],
    sourceIds: ['arch-data-models', 'cassandra-managed-overview']
  },
  {
    id: 'managed-redis', name: 'Azure Managed Redis', family: 'Cache', kind: 'Managed in-memory cache',
    model: 'Key-value / in-memory data structures', api: 'Redis-compatible client protocol', role: 'Cache or transient data',
    summary: 'Managed Redis service to evaluate for cache and in-memory data needs.',
    caveats: ['Use with an explicit source-of-truth and cache invalidation/failure strategy when data must be durable.', 'Azure Cache for Redis tiers have retirement dates that vary by tier.'],
    sourceIds: ['arch-data-models', 'managed-redis-overview', 'redis-retirement']
  },
  {
    id: 'blob-storage', name: 'Azure Blob Storage', family: 'Specialised storage & analytics', kind: 'Object storage',
    model: 'Objects / blobs', api: 'Azure Storage APIs', role: 'File and object store',
    summary: 'Object storage for documents, media, backups, exports and other files.',
    caveats: ['Blob Storage is not a database or automatically a transactional record store.', 'Check access patterns, namespace, identity, network, retention and lifecycle policy.'],
    sourceIds: ['blob-overview', 'arch-data-models']
  },
  {
    id: 'table-storage', name: 'Azure Table Storage', family: 'Specialised storage & analytics', kind: 'Key-value / NoSQL storage',
    model: 'Key-value and schemaless entities', api: 'Azure Tables API', role: 'Special-purpose store',
    summary: 'Simple key-oriented entity storage; distinguish it from a relational database and Cosmos DB Table API.',
    caveats: ['Do not assume Azure Table Storage and Cosmos DB Table API have the same capabilities or operating model.'],
    sourceIds: ['table-overview']
  },
  {
    id: 'adls-gen2', name: 'Azure Data Lake Storage Gen2', family: 'Specialised storage & analytics', kind: 'Data lake / object storage',
    model: 'Files and objects for analytics', api: 'Azure Storage APIs with hierarchical namespace options', role: 'Data lake',
    summary: 'File/object storage for analytical data and data-lake patterns.',
    caveats: ['A data lake is not an OLTP database or search index.'],
    sourceIds: ['adls-overview']
  },
  {
    id: 'ai-search', name: 'Azure AI Search', family: 'Specialised storage & analytics', kind: 'Search and indexing service',
    model: 'Search index; optional vector search', api: 'Search APIs', role: 'Derived index / retrieval',
    summary: 'Search and indexing service for full-text and relevance-oriented retrieval patterns.',
    caveats: ['A search index is usually derived from source records; define indexing lag, reindexing and source-of-truth behaviour.', 'AI or RAG does not itself require a vector database.'],
    sourceIds: ['arch-data-models', 'ai-search-overview']
  },
  {
    id: 'data-explorer', name: 'Azure Data Explorer', family: 'Specialised storage & analytics', kind: 'Time-series and analytics service',
    model: 'Time-series / analytical event data', api: 'Kusto Query Language', role: 'Analytics store',
    summary: 'Analytics-oriented option to evaluate for high-ingest telemetry and event queries.',
    caveats: ['Not selected solely because data contains timestamps; query and retention patterns matter.'],
    sourceIds: ['arch-data-models', 'data-explorer-overview']
  },
  {
    id: 'fabric-warehouse', name: 'Fabric Warehouse', family: 'Specialised storage & analytics', kind: 'Analytical warehouse',
    model: 'Relational analytical warehouse', api: 'Fabric SQL analytics', role: 'Analytics store',
    summary: 'Analytical warehouse option within Microsoft Fabric.',
    caveats: ['OLAP is distinct from application OLTP; check Fabric capacity and governance fit.'],
    sourceIds: ['fabric-warehouse']
  },
  {
    id: 'fabric-lakehouse', name: 'Fabric Lakehouse', family: 'Specialised storage & analytics', kind: 'Lakehouse analytics',
    model: 'Files and analytical tables', api: 'Fabric data engineering and analytics', role: 'Analytics store',
    summary: 'Lakehouse option within Microsoft Fabric for analytical data engineering patterns.',
    caveats: ['A lakehouse is not automatically the operational system of record.'],
    sourceIds: ['fabric-lakehouse']
  },
  {
    id: 'fabric-eventhouse', name: 'Fabric Eventhouse', family: 'Specialised storage & analytics', kind: 'Real-time analytics',
    model: 'Time-series / event analytics', api: 'Fabric Real-Time Intelligence', role: 'Analytics store',
    summary: 'Fabric analytics option to evaluate for time-oriented and event workloads.',
    caveats: ['Do not infer operational-database suitability from event analytics features.'],
    sourceIds: ['fabric-eventhouse']
  },
  {
    id: 'onelake', name: 'OneLake', family: 'Specialised storage & analytics', kind: 'Fabric data lake',
    model: 'Files and analytical data', api: 'Fabric data platform', role: 'Shared analytics storage',
    summary: 'Fabric-wide logical data lake concept, distinct from a transactional database engine.',
    caveats: ['OneLake is not a database engine or a replacement for every operational store.'],
    sourceIds: ['fabric-overview']
  },
  {
    id: 'cosmos-pg', name: 'Azure Cosmos DB for PostgreSQL', family: 'Relational', kind: 'Distributed PostgreSQL service',
    model: 'PostgreSQL with distributed tables', api: 'PostgreSQL wire protocol with Citus extensions', role: 'System of record',
    lifecycle: 'retirement-path',
    summary: 'Retirement-path service; not recommended for new projects.',
    caveats: ['Do not recommend for a new deployment; for existing deployments consult current retirement and migration guidance.'],
    sourceIds: ['cosmos-pg-retirement']
  },
  {
    id: 'azure-mariadb-service', name: 'Azure Database for MariaDB', family: 'Relational', kind: 'Retired managed database service',
    model: 'MariaDB relational engine', api: 'MariaDB protocol', role: 'Legacy system only',
    lifecycle: 'retired-service',
    summary: 'Azure managed service retirement record. MariaDB as a database engine is not retired by this service retirement.',
    caveats: ['The service retirement date was 19 September 2025; this does not mean MariaDB software in general is retired.'],
    sourceIds: ['mariadb-retirement']
  },
  {
    id: 'azure-cache-redis-legacy', name: 'Azure Cache for Redis (legacy tiers)', family: 'Cache', kind: 'Retiring managed cache',
    model: 'In-memory key-value', api: 'Redis-compatible clients', role: 'Cache only',
    lifecycle: 'retirement-path',
    summary: 'Retirement-path product; retirement dates vary by tier.',
    caveats: ['Basic/Standard/Premium and Enterprise tiers do not share one retirement date.'],
    sourceIds: ['redis-retirement']
  }
].map((service) => ({
  ...service,
  family: familyFor(service).label,
  verifiedOn: REVIEWED_ON
}));

export const serviceById = Object.fromEntries(services.map((service) => [service.id, service]));
