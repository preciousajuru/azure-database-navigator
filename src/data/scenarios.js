export const scenarios = [
  {
    id: 'relational-orders',
    title: 'New orders and payments application',
    answers: { workload: 'new-app', persistence: 'durable', dataShape: 'relational', accessPattern: 'relational-queries', constraints: ['relationships'], operations: 'predictable', geography: 'single-region', recovery: 'important' },
    expected: ['azure-sql-db', 'postgres-flex']
  },
  {
    id: 'sqlserver-migration',
    title: 'SQL Server migration with instance features',
    answers: { workload: 'migration', persistence: 'durable', dataShape: 'relational', accessPattern: 'relational-queries', engine: 'sqlserver', constraints: ['sql-instance-features'], operations: 'predictable', geography: 'single-region', recovery: 'defined' },
    expected: ['azure-sql-mi', 'sql-server-vm']
  },
  {
    id: 'wordpress-mariadb',
    title: 'WordPress currently using MariaDB',
    answers: { workload: 'migration', persistence: 'durable', dataShape: 'relational', accessPattern: 'relational-queries', engine: 'mariadb', constraints: ['mariadb-app'], operations: 'small', geography: 'single-region', recovery: 'important' },
    expected: ['mysql-flex']
  },
  {
    id: 'postgres-extension',
    title: 'PostgreSQL application requiring a specific extension',
    answers: { workload: 'migration', persistence: 'durable', dataShape: 'relational', accessPattern: 'relational-queries', engine: 'postgres', constraints: ['postgres-extension'], operations: 'predictable', geography: 'single-region', recovery: 'important' },
    expected: ['postgres-flex']
  },
  {
    id: 'distributed-json',
    title: 'Global JSON workload with measured regional latency',
    answers: { workload: 'new-app', persistence: 'durable', dataShape: 'documents', accessPattern: 'partition-key-lookup', constraints: ['global-latency'], operations: 'bursty', geography: 'multi-region-read', recovery: 'important' },
    expected: ['cosmos-nosql']
  },
  {
    id: 'mongodb-migration',
    title: 'MongoDB clients with application-specific aggregations',
    answers: { workload: 'migration', persistence: 'durable', dataShape: 'documents', accessPattern: 'document-aggregate', engine: 'mongodb', constraints: ['mongo-features'], operations: 'predictable', geography: 'single-region', recovery: 'important' },
    expected: ['azure-documentdb', 'cosmos-mongo-ru']
  },
  {
    id: 'rag',
    title: 'RAG application with source documents, state and search',
    answers: { workload: 'search', persistence: 'durable', dataShape: 'search', accessPattern: 'full-text', constraints: [], operations: 'bursty', geography: 'single-region', recovery: 'important', durable: 'yes' },
    expected: ['blob-storage', 'ai-search', 'azure-sql-db']
  },
  {
    id: 'telemetry',
    title: 'High-volume telemetry with time-window analysis',
    answers: { workload: 'telemetry', persistence: 'durable', dataShape: 'telemetry', accessPattern: 'time-window-scan', operations: 'high-ingest', geography: 'single-region', recovery: 'defined' },
    expected: ['data-explorer', 'fabric-eventhouse']
  },
  {
    id: 'cache',
    title: 'Redis cache alongside durable application data',
    answers: { workload: 'cache', persistence: 'transient', dataShape: 'cache', accessPattern: 'partition-key-lookup', operations: 'bursty', geography: 'single-region', recovery: 'basic', durable: 'yes' },
    expected: ['managed-redis', 'azure-sql-db']
  },
  {
    id: 'files-only',
    title: 'Files-only document archive',
    answers: { workload: 'files', persistence: 'durable', dataShape: 'files', accessPattern: 'object-delivery', operations: 'small', geography: 'single-region', recovery: 'important' },
    expected: ['blob-storage']
  },
  {
    id: 'multitenant',
    title: 'Multi-tenant SaaS with relational transactions',
    answers: { workload: 'new-app', persistence: 'durable', dataShape: 'relational', accessPattern: 'relational-queries', constraints: ['relationships', 'tenant-isolation'], operations: 'predictable', geography: 'single-region', recovery: 'important' },
    expected: ['azure-sql-db', 'postgres-flex']
  },
  {
    id: 'strict-recovery',
    title: 'Strict recovery, encryption, private network and residency',
    answers: { workload: 'new-app', persistence: 'durable', dataShape: 'relational', accessPattern: 'relational-queries', constraints: ['relationships', 'hard-consistency'], operations: 'control', geography: 'residency', recovery: 'defined' },
    expected: ['azure-sql-db', 'postgres-flex']
  }
];
