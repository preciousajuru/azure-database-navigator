const notSure = { value: 'unknown', label: 'Not sure yet' };

export const questions = [
  {
    id: 'workload',
    title: 'What are you trying to build or change?',
    help: 'Start with the workload. You do not need to choose a database engine.',
    options: [
      { value: 'new-app', label: 'A new application or service' },
      { value: 'migration', label: 'Move or modernise an existing database' },
      { value: 'files', label: 'Store and serve files or objects' },
      { value: 'telemetry', label: 'Collect and analyse events or telemetry' },
      { value: 'search', label: 'Search documents or retrieve AI context' },
      { value: 'cache', label: 'Add a cache or short-lived state store' },
      { value: 'mixed', label: 'More than one of these workloads' },
      notSure
    ]
  },
  {
    id: 'persistence',
    title: 'Does this workload need persistent storage?',
    help: 'Persistent storage can be a database, files, or both. A cache alone is often transient.',
    options: [
      { value: 'durable', label: 'Yes, durable records or files must be kept' },
      { value: 'transient', label: 'Only short-lived cache or session state is needed' },
      { value: 'no', label: 'No persistent data store is needed' },
      { value: 'external', label: 'Only read from an external service; no new stored state' },
      { value: 'processing', label: 'Process data without retaining it' },
      notSure
    ]
  },
  {
    id: 'dataShape',
    title: 'What data and access patterns matter most?',
    help: 'Choose the main patterns; several stores can have different roles in one architecture.',
    options: [
      { value: 'relational', label: 'Related records, joins, constraints or business transactions' },
      { value: 'documents', label: 'Flexible JSON documents or key-value lookups' },
      { value: 'graph', label: 'Deep relationship traversal or graph queries' },
      { value: 'telemetry', label: 'Timestamped events, metrics or time-window analytics' },
      { value: 'files', label: 'Files, media, backups or large objects' },
      { value: 'search', label: 'Full-text, relevance or vector retrieval' },
      { value: 'cache', label: 'Frequently read transient data' },
      { value: 'mixed', label: 'Several patterns with separate responsibilities' },
      notSure
    ]
  },
  {
    id: 'dataKinds',
    title: 'Which data roles are actually present?',
    help: 'Select only roles this application needs. Mixed workloads do not automatically require separate services.',
    when: (a) => a.dataShape === 'mixed',
    multiple: true,
    options: [
      { value: 'records', label: 'Business records — customers, orders or application state' },
      { value: 'documents', label: 'Documents — nested JSON aggregates' },
      { value: 'files', label: 'Files — images, PDFs or object archives' },
      { value: 'events', label: 'Events — time-stamped telemetry for analysis' },
      { value: 'search', label: 'Index — text or similarity retrieval over source data' },
      { value: 'cache', label: 'Cache — regenerable copies or short-lived state' },
      notSure
    ]
  },
  {
    id: 'relationships',
    title: 'How are the records related?',
    help: 'A join combines related records; a foreign key protects a relationship. Graph traversal follows chains of relationships.',
    when: (a) => ['relational', 'documents', 'graph', 'mixed'].includes(a.dataShape),
    options: [
      { value: 'keys', label: 'Mostly independent records read by a known key' },
      { value: 'joins', label: 'Foreign keys, joins and related business records' },
      { value: 'aggregate', label: 'Nested documents kept together as an aggregate' },
      { value: 'graph', label: 'Deep or variable relationship traversal' },
      { value: 'mixed', label: 'Several relationship patterns' },
      notSure
    ]
  },
  {
    id: 'consistency',
    title: 'What must stay consistent when data changes?',
    help: 'ACID means changes happen together or not at all, preserve rules, handle concurrent work safely and survive a committed write. Confirm the scope, not just the label.',
    when: (a) => ['relational', 'documents', 'mixed'].includes(a.dataShape),
    options: [
      { value: 'business-atomic', label: 'Atomic updates spanning related financial, stock or business records' },
      { value: 'aggregate-atomic', label: 'Atomic updates within one document or partition-bound aggregate' },
      { value: 'concurrent', label: 'Concurrent writers need conflict detection or prevention' },
      { value: 'eventual', label: 'Some lag between writes and reads is acceptable' },
      { value: 'global-conflicts', label: 'Multiple write regions with explicit conflict-handling requirements' },
      notSure
    ]
  },
  {
    id: 'accessPattern',
    title: 'How does the application read and change that data?',
    help: 'The query shape, not the file format, helps distinguish storage models.',
    options: [
      { value: 'relational-queries', label: 'Joins, constraints or changes spanning related records' },
      { value: 'document-aggregate', label: 'Read or write a whole document or aggregate together' },
      { value: 'partition-key-lookup', label: 'Known-key lookups designed around a partition or tenant key' },
      { value: 'graph-traversal', label: 'Traverse many relationships in graph-shaped queries' },
      { value: 'time-window-scan', label: 'Scan and aggregate events by time window' },
      { value: 'full-text', label: 'Find content by keyword or full-text relevance' },
      { value: 'vector-similarity', label: 'Find semantically similar content using vector embeddings' },
      { value: 'object-delivery', label: 'Store, retrieve or serve whole files and objects' },
      notSure
    ]
  },
  {
    id: 'migrationIntent',
    title: 'Does the existing database need to move?',
    help: 'An existing database is not itself a reason to migrate. Keeping it can be the simpler design.',
    when: (a) => a.workload === 'migration',
    options: [
      { value: 'assess', label: 'Assess an Azure migration or modernisation target' },
      { value: 'keep', label: 'Keep the existing database; no new store is required' },
      notSure
    ]
  },
  {
    id: 'engine',
    title: 'Is there an existing engine or client contract to preserve?',
    help: 'A framework or programming language alone does not determine the database engine.',
    when: (a) => ['migration', 'mixed'].includes(a.workload) && a.recordModel !== 'existing',
    options: [
      { value: 'sqlserver', label: 'SQL Server' },
      { value: 'postgres', label: 'PostgreSQL' },
      { value: 'mysql', label: 'MySQL' },
      { value: 'mariadb', label: 'MariaDB' },
      { value: 'mongodb', label: 'MongoDB drivers or protocol' },
      { value: 'cassandra', label: 'Apache Cassandra' },
      { value: 'other', label: 'Another engine or custom client' },
      notSure
    ]
  },
  {
    id: 'migrationDetails',
    title: 'Which existing-engine dependencies must be preserved?',
    help: 'Optional inventory for compatibility testing; a version or feature name is not automatically treated as supported.',
    when: (a) => ['migration', 'mixed'].includes(a.workload) && a.engine && a.engine !== 'unknown',
    freeText: true,
    placeholder: 'Source version, drivers/dialect, procedures/functions/triggers, extensions/jobs, cross-database dependencies, admin privileges, vendor support and permissible downtime'
  },
  {
    id: 'constraints',
    title: 'Which compatibility constraints are known?',
    help: 'Pick every requirement you have already verified. Leave unknown items open.',
    when: (a) => ['migration', 'mixed'].includes(a.workload) || a.dataShape === 'relational' || a.dataShape === 'documents',
    multiple: true,
    options: [
      { value: 'sql-instance-features', label: 'SQL Agent, CLR, linked servers, cross-database queries or transactional replication' },
      { value: 'os-control', label: 'OS/file-system access or a specific SQL Server version' },
      { value: 'postgres-extension', label: 'A named PostgreSQL extension or server feature' },
      { value: 'mongo-features', label: 'Specific MongoDB commands, aggregations or driver behaviour' },
      { value: 'mariadb-app', label: 'A MariaDB application such as WordPress' },
      { value: 'relationships', label: 'Joins, referential integrity or multi-record atomicity' },
      { value: 'global-latency', label: 'Measured user-to-data latency across regions' },
      { value: 'hard-consistency', label: 'A documented consistency guarantee or transaction boundary' },
      { value: 'tenant-isolation', label: 'Tenant isolation, shared/separate databases or per-tenant controls' },
      { value: 'unknown', label: 'Not sure yet' }
    ]
  },
  {
    id: 'operations',
    title: 'What do you already know about scale and operations?',
    help: 'Avoid guessing capacity. Unknown volume, growth and responsibility are useful design inputs.',
    options: [
      { value: 'predictable', label: 'Traffic and data growth are measured and predictable' },
      { value: 'bursty', label: 'Traffic is variable, seasonal or bursty' },
      { value: 'high-ingest', label: 'Sustained high-volume event ingestion is central' },
      { value: 'small', label: 'A small workload with modest operational needs' },
      { value: 'control', label: 'We need substantial engine or operating-system control' },
      notSure
    ]
  },
  {
    id: 'scale',
    title: 'How well are the data volume and traffic understood?',
    help: 'There is no sizing recommendation here. A measured baseline is more useful than a guessed number.',
    options: [
      { value: 'measured', label: 'Current size, growth, concurrency and request pattern are measured' },
      { value: 'growing', label: 'Growth or peaks are expected, but not measured yet' },
      { value: 'small', label: 'Small and steady workload is a reasonable working assumption' },
      notSure
    ]
  },
  {
    id: 'scaleNotes',
    title: 'What measured scale details should the review keep in view?',
    help: 'Optional: note current size, growth, request rate, concurrency or peak patterns. This is not used to size a service.',
    when: (a) => ['measured', 'growing'].includes(a.scale),
    freeText: true,
    placeholder: 'For example: current data size, expected growth, peak concurrency'
  },
  {
    id: 'volume',
    title: 'What is the approximate data volume?',
    help: 'A range records an assumption, not a capacity recommendation. Include growth in the optional scale notes.',
    options: [
      { value: 'small', label: 'Less than roughly 10 GB' },
      { value: 'medium', label: 'Roughly 10 GB to 1 TB' },
      { value: 'large', label: 'Roughly 1 TB to 100 TB' },
      { value: 'very-large', label: 'More than roughly 100 TB' },
      notSure
    ]
  },
  {
    id: 'activity',
    title: 'How busy is the application?',
    help: 'Broad ranges are enough here. You do not need IOPS, RU/s, DTU or vCore figures.',
    options: [
      { value: 'occasional', label: 'Occasional requests or a small user group' },
      { value: 'steady', label: 'Steady concurrent use' },
      { value: 'bursty', label: 'Large peaks, seasonal traffic or uncertain bursts' },
      { value: 'continuous', label: 'Continuous high-volume activity' },
      notSure
    ]
  },
  {
    id: 'priorities',
    title: 'Which operational priorities need balancing?',
    help: 'Low administration, low cost, engine control and high availability can conflict. No priority guarantees a price or service-level outcome.',
    multiple: true,
    options: [
      { value: 'low-admin', label: 'Minimise routine platform administration' },
      { value: 'engine-control', label: 'Keep engine or operating-system control' },
      { value: 'cost', label: 'Understand cost drivers and avoid unnecessary stores' },
      { value: 'availability', label: 'Validate availability, restore and incident response' },
      { value: 'portability', label: 'Preserve engine compatibility or portability' },
      notSure
    ]
  },
  {
    id: 'geography',
    title: 'What geographic and network needs are confirmed?',
    help: 'Global users do not automatically require multi-region writes. Confirm latency, residency and private-network needs.',
    options: [
      { value: 'single-region', label: 'One Azure region is expected to be sufficient' },
      { value: 'multi-region-read', label: 'Users need low-latency reads in more than one region' },
      { value: 'multi-region-write', label: 'Writes from multiple regions are a verified requirement' },
      { value: 'residency', label: 'Data must remain in specified locations or jurisdictions' },
      { value: 'private-network', label: 'Private network connectivity is required' },
      { value: 'hybrid', label: 'Hybrid/on-premises connectivity must be preserved' },
      notSure
    ]
  },
  {
    id: 'security',
    title: 'Are there security or governance controls you need to verify?',
    help: 'Record requirements, but do not assume any service or tier guarantees compliance.',
    multiple: true,
    options: [
      { value: 'encryption', label: 'Encryption at rest and in transit requirements' },
      { value: 'managed-keys', label: 'Customer-managed or externally controlled keys' },
      { value: 'private-network', label: 'Private network or restricted public access' },
      { value: 'residency', label: 'Data residency, sovereignty or location restrictions' },
      { value: 'compliance', label: 'A named regulatory or organisational control to verify' },
      { value: 'identity', label: 'Verify Entra/native authentication, managed identity, RBAC and least privilege' },
      { value: 'audit', label: 'Verify auditing, secret handling and incident-response controls' },
      notSure
    ]
  },
  {
    id: 'recovery',
    title: 'How precise are the availability and recovery requirements?',
    help: 'RPO is how much recent data you can afford to lose. RTO is how long you can be without the service.',
    options: [
      { value: 'defined', label: 'RPO and RTO targets are documented and testable' },
      { value: 'important', label: 'High availability and point-in-time recovery matter, exact targets TBD' },
      { value: 'basic', label: 'Recovery needs are modest or still being discussed' },
      notSure
    ]
  },
  {
    id: 'recoveryNotes',
    title: 'What are the documented recovery targets?',
    help: 'Optional: record actual RPO/RTO targets, backup retention and recovery-region needs for later verification.',
    when: (a) => a.recovery === 'defined',
    freeText: true,
    placeholder: 'For example: RPO, RTO, backup retention and recovery-region expectations'
  },
  {
    id: 'requirementsNotes',
    title: 'Do you need to record a specific version, extension or feature?',
    help: 'Optional: note exact names for later validation. This stays in memory in this browser session and is not submitted.',
    when: (a) => ['migration', 'mixed'].includes(a.workload) || (a.constraints || []).some((value) => ['postgres-extension', 'mongo-features', 'sql-instance-features'].includes(value)),
    freeText: true,
    placeholder: 'For example: engine version, PostgreSQL extension, SQL Server job/CLR, driver or migration constraint'
  },
  {
    id: 'recoveryControls',
    title: 'Which recovery mechanisms need verification?',
    help: 'High availability, backups and disaster recovery solve different failures. Replicas do not replace restore testing.',
    when: (a) => ['defined', 'important'].includes(a.recovery),
    multiple: true,
    options: [
      { value: 'ha', label: 'High availability or zone redundancy for local failures' },
      { value: 'pitr', label: 'Backups, retention and point-in-time restore after mistakes' },
      { value: 'dr', label: 'Disaster recovery, geo-replication and application failover' },
      { value: 'replicas', label: 'Read replicas, with an independently tested recovery strategy' },
      notSure
    ]
  },
  {
    id: 'retrievalType',
    title: 'What retrieval does the application actually need?',
    help: 'Keyword search matches text; vector similarity compares embeddings; hybrid combines the two. AI or RAG does not itself establish a vector requirement.',
    when: (a) => a.workload === 'search' || a.dataShape === 'search' || a.dataKinds?.includes('search') || a.accessPattern === 'vector-similarity',
    options: [
      { value: 'keyword', label: 'Keyword / full-text relevance' },
      { value: 'vector', label: 'Semantic / vector similarity' },
      { value: 'hybrid', label: 'Hybrid keyword and vector retrieval' },
      notSure
    ]
  },
  {
    id: 'existingService',
    title: 'Which store already holds the searchable records?',
    help: 'Check whether this store supports the required retrieval before adding another one. This answer does not select or migrate it.',
    when: (a) => ['vector', 'hybrid'].includes(a.retrievalType),
    options: [
      { value: 'azure-sql-db', label: 'Azure SQL Database' },
      { value: 'postgres-flex', label: 'PostgreSQL Flexible Server' },
      { value: 'cosmos-nosql', label: 'Cosmos DB for NoSQL' },
      { value: 'azure-documentdb', label: 'Azure DocumentDB' },
      { value: 'managed-redis', label: 'Azure Managed Redis' },
      { value: 'other', label: 'Another store or no existing store' },
      notSure
    ]
  },
  {
    id: 'separateIndex',
    title: 'Is a separate managed search index justified?',
    help: 'For example, indexing several content sources or search-specific ranking/facets. First check whether the record store already meets the need.',
    when: (a) => ['keyword', 'vector', 'hybrid'].includes(a.retrievalType),
    options: [
      { value: 'yes', label: 'Yes, multiple sources or managed search features justify it' },
      { value: 'no', label: 'No, first use or assess retrieval in the source store' },
      notSure
    ]
  },
  {
    id: 'searchFreshness',
    title: 'How soon must source changes be searchable?',
    help: 'A derived index can lag behind its source. A service feature does not prove that the application meets its freshness target.',
    when: (a) => ['keyword', 'vector', 'hybrid'].includes(a.retrievalType),
    options: [
      { value: 'real-time', label: 'Real-time or near-real-time source changes are essential' },
      { value: 'lag-ok', label: 'Indexing lag is acceptable and can be managed' },
      notSure
    ]
  },
  {
    id: 'sourceFiles',
    title: 'Does the search workload own original files?',
    help: 'An index can derive from files, existing records or an external source. Do not add object storage just because retrieval is needed.',
    when: (a) => ['search', 'mixed'].includes(a.workload) || ['search', 'mixed'].includes(a.dataShape),
    options: [
      { value: 'yes', label: 'Yes, this application keeps original documents or files' },
      { value: 'no', label: 'No, source data already lives elsewhere' },
      notSure
    ]
  },
  {
    id: 'durable',
    title: 'Does the workload need a durable system of record?',
    help: 'A cache or index can support an application without replacing its source of truth.',
    when: (a) => ['cache', 'search', 'mixed'].includes(a.workload) || ['cache', 'search', 'mixed'].includes(a.dataShape),
    options: [
      { value: 'yes', label: 'Yes, this data must be authoritative and recoverable' },
      { value: 'no', label: 'No, the data can be regenerated or is short-lived' },
      notSure
    ]
  },
  {
    id: 'recordModel',
    title: 'What model does the authoritative application state need?',
    help: 'Needing durable state does not automatically mean SQL. Preserve an existing store where appropriate.',
    when: (a) => a.durable === 'yes' && (['cache', 'search', 'mixed'].includes(a.workload) || ['cache', 'search', 'mixed'].includes(a.dataShape)),
    options: [
      { value: 'relational', label: 'Related application records with joins and business transactions' },
      { value: 'documents', label: 'Document aggregates or nonrelational authoritative state' },
      { value: 'existing', label: 'Keep an existing authoritative store' },
      notSure
    ]
  }
];

export function getQuestions(answers = {}) {
  if (['no', 'external', 'processing'].includes(answers.persistence) || answers.migrationIntent === 'keep') {
    const ids = answers.migrationIntent === 'keep' ? ['workload', 'persistence', 'dataShape', 'migrationIntent'] : ['workload', 'persistence'];
    return questions.filter((question) => ids.includes(question.id));
  }
  return questions.filter((question) => !question.when || question.when(answers));
}
