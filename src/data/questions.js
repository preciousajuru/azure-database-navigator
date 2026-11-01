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
    id: 'accessPattern',
    title: 'How does the application read and change that data?',
    help: 'The query shape, not the file format, helps distinguish storage models.',
    options: [
      { value: 'relational-queries', label: 'Joins, constraints or changes spanning related records' },
      { value: 'document-aggregate', label: 'Read or write a whole document or aggregate together' },
      { value: 'partition-key-lookup', label: 'Known-key lookups designed around a partition or tenant key' },
      { value: 'graph-traversal', label: 'Traverse many relationships in graph-shaped queries' },
      { value: 'time-window-scan', label: 'Scan and aggregate events by time window' },
      { value: 'full-text', label: 'Find content by text relevance or similarity' },
      { value: 'object-delivery', label: 'Store, retrieve or serve whole files and objects' },
      notSure
    ]
  },
  {
    id: 'engine',
    title: 'Is there an existing engine or client contract to preserve?',
    help: 'A framework or programming language alone does not determine the database engine.',
    when: (a) => ['migration', 'mixed'].includes(a.workload),
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
    id: 'geography',
    title: 'What geographic and network needs are confirmed?',
    help: 'Global users do not automatically require multi-region writes. Confirm latency, residency and private-network needs.',
    options: [
      { value: 'single-region', label: 'One Azure region is expected to be sufficient' },
      { value: 'multi-region-read', label: 'Users need low-latency reads in more than one region' },
      { value: 'multi-region-write', label: 'Writes from multiple regions are a verified requirement' },
      { value: 'residency', label: 'Data must remain in specified locations or jurisdictions' },
      { value: 'private-network', label: 'Private network connectivity is required' },
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
    id: 'durable',
    title: 'Does the workload need a durable system of record?',
    help: 'A cache or index can support an application without replacing its source of truth.',
    when: (a) => ['cache', 'search', 'mixed'].includes(a.workload) || ['cache', 'search', 'mixed'].includes(a.dataShape),
    options: [
      { value: 'yes', label: 'Yes, this data must be authoritative and recoverable' },
      { value: 'no', label: 'No, the data can be regenerated or is short-lived' },
      notSure
    ]
  }
];

export function getQuestions(answers = {}) {
  return questions.filter((question) => !question.when || question.when(answers));
}
