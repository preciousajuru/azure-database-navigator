import { serviceById } from '../data/services.js';
import { ruleById } from '../data/rules.js';

const candidate = (id, reason, caveat = '') => ({ serviceId: id, reason, caveat });

function uniqueCandidates(candidates) {
  const seen = new Set();
  return candidates.filter((item) => {
    if (seen.has(item.serviceId)) return false;
    seen.add(item.serviceId);
    return true;
  }).filter((item) => serviceById[item.serviceId]?.lifecycle !== 'retired-service')
    .filter((item) => serviceById[item.serviceId]?.lifecycle !== 'retirement-path');
}

function getUnknowns(answers) {
  const unknowns = [];
  if (!answers.workload || answers.workload === 'unknown') unknowns.push('The workload and whether it needs persistent storage are not yet clear.');
  if (!answers.dataShape || answers.dataShape === 'unknown') unknowns.push('The data model and important access patterns are not yet known.');
  if (answers.geography === 'residency') unknowns.push('Target Azure regions and current region-specific service availability need verification.');
  if ((answers.security || []).some((value) => ['encryption', 'managed-keys', 'private-network', 'residency', 'compliance'].includes(value))) {
    unknowns.push('Security, encryption, key management, network and governance capabilities must be checked for the exact service, tier and region; no compliance guarantee is implied.');
  }
  if (answers.recovery === 'defined') unknowns.push('Exact RPO/RTO targets, backup retention and failover behaviour need tier- and region-specific verification.');
  if (answers.recovery === 'unknown' || !answers.recovery) unknowns.push('Recovery objectives are not known; do not infer availability or recovery guarantees.');
  if (answers.engine === 'postgres' && (answers.constraints || []).includes('postgres-extension')) unknowns.push('The exact PostgreSQL extension, server version and region must be checked against the current allow-list.');
  if (answers.engine === 'mongodb' && (answers.constraints || []).includes('mongo-features')) unknowns.push('Required MongoDB commands, aggregations and drivers need compatibility-matrix testing.');
  if (answers.constraints?.includes('tenant-isolation')) unknowns.push('Shared versus separate tenant databases, isolation controls and per-tenant costs need workload-specific design.');
  if (answers.geography === 'multi-region-write') unknowns.push('Write-region, consistency and conflict-handling requirements need explicit design and service/API verification.');
  if (answers.workload === 'migration' && answers.migrationIntent !== 'assess' && answers.migrationIntent !== 'keep') unknowns.push('The need to migrate is unconfirmed; retaining the current store remains an option.');
  if (answers.engine && answers.engine !== 'unknown') unknowns.push('Source version, drivers, dialect, procedures, triggers, privileges, vendor support and permissible downtime need an actual compatibility inventory and migration test.');
  if (answers.priorities?.includes('low-admin') && answers.priorities?.includes('engine-control')) unknowns.push('Minimal administration conflicts with engine/OS control; explicitly assign platform maintenance responsibilities.');
  if (answers.geography === 'private-network' || answers.geography === 'hybrid') unknowns.push('Private or hybrid connectivity, identity and routing must be verified for the exact service and region.');
  if (answers.consistency === 'concurrent' || answers.consistency === 'global-conflicts') unknowns.push('Concurrency, transaction scope and conflict-handling semantics need service/API-specific validation.');
  if (answers.recoveryControls?.length) unknowns.push('HA, backups, point-in-time restore, replicas and disaster recovery are different mechanisms; verify each selected requirement with restore and failover tests.');
  if (answers.dataShape === 'mixed') unknowns.push('Several data roles are reported; first test whether one store can satisfy them before adding specialised components.');
  return unknowns;
}

export function evaluate(input = {}) {
  const answers = { ...input, persistence: ['external', 'processing'].includes(input.persistence) ? 'no' : input.persistence, constraints: [...new Set([...(input.constraints || []), ...(input.relationships === 'joins' || input.consistency === 'business-atomic' ? ['relationships'] : [])])] };
  const candidateList = [];
  const exclusions = [];
  const decisions = [];
  const appliedRuleIds = new Set();
  const recordRule = (id) => {
    if (ruleById[id]) appliedRuleIds.add(id);
  };
  const constraints = new Set(answers.constraints || []);
  const unknowns = getUnknowns(answers);
  recordRule('exclude-retired-new');
  if (unknowns.some((item) => /recovery|region-specific|Security, encryption|RPO\/RTO/.test(item))) recordRule('unknown-recovery-security');
  if (!answers.persistence || answers.persistence === 'unknown') unknowns.push('Whether the workload needs a persistent data store is not yet clear.');

  if (answers.migrationIntent === 'keep') {
    recordRule('keep-existing-store');
    return {
      kind: 'no-database-needed',
      title: 'Keep the existing store; no new database is required',
      candidates: [],
      exclusions: [],
      decisions: [{ id: 'keep-existing-store', outcome: 'Retain the existing database and its current source-of-truth role; no Azure migration is inferred.' }],
      unknowns: ['Continue reviewing the current store’s security, recovery, lifecycle and operating responsibilities.'],
      changes: ['Reassess only if a documented compatibility, lifecycle, recovery or operational requirement justifies moving.'],
      sourceIds: ['arch-data-considerations'],
      ruleIds: [...appliedRuleIds]
    };
  }
  if (answers.persistence === 'no' && (answers.workload === 'files' || answers.dataShape === 'files')) {
    return {
      kind: 'insufficient-information',
      title: 'The file-storage requirement conflicts with the persistence answer',
      candidates: [],
      exclusions: [],
      decisions: [],
      unknowns: [...new Set(unknowns.concat('File/object storage keeps data persistently; confirm whether the files must be retained or the workload does not need persistent storage.'))],
      changes: ['Resolve the persistence requirement before assessing object storage or a database.'],
      sourceIds: [],
      ruleIds: [...appliedRuleIds]
    };
  }

  if (answers.persistence === 'no' && answers.workload !== 'files' && answers.dataShape !== 'files') {
    recordRule('no-persistent-store');
    return {
      kind: 'no-database-needed',
      title: 'No persistent data store is needed',
      candidates: [],
      exclusions: [],
      decisions: [{ id: 'no-persistence', outcome: 'The stated workload does not need persistent storage; no database or object store is selected.' }],
      unknowns: [...new Set(unknowns)],
      changes: ['Reopen the assessment if the application later needs durable records, files, search indexes or recoverable state.'],
      sourceIds: [],
      ruleIds: [...appliedRuleIds]
    };
  }

  if (answers.workload === 'files' || (answers.dataShape === 'files' && answers.workload !== 'mixed')) {
    recordRule('files-no-db');
    candidateList.push(candidate('blob-storage', 'The stated need is file/object storage, which is a storage model distinct from a database.', 'If application records, metadata queries or transactions are also needed, assess those as a separate role.'));
    decisions.push({ id: 'files-no-db', outcome: 'No database is implied by a files-only requirement.' });
  } else if (answers.workload === 'cache' && answers.durable === 'no') {
    recordRule('cache-not-record');
    candidateList.push(candidate('managed-redis', 'The stated need is transient cache or short-lived state.', 'Confirm whether this data is safely reconstructable and check client clustering requirements.'));
  } else {
    if (answers.engine === 'sqlserver') {
      if (constraints.has('os-control')) {
        recordRule('sql-os-version');
        candidateList.push(candidate('sql-server-vm', 'A verified OS/file-system control or specific SQL Server version requirement points to the VM operating model.', 'Confirm the exact requirement and plan for VM, SQL Server, patching, backups, high availability and recovery operations.'));
        exclusions.push({ serviceId: 'azure-sql-db', reason: 'The documented decision tree directs OS/file-system control or a specific SQL Server version requirement to SQL Server on Azure VMs.', sourceIds: ['azure-sql-decision'] });
      } else if (constraints.has('sql-instance-features')) {
        recordRule('sql-instance-features');
        candidateList.push(candidate('azure-sql-mi', 'The stated SQL Server workload requires one or more instance features identified by Microsoft as Managed Instance decision factors.', 'Verify each required feature, engine version, migration path, networking and target-region availability.'));
        candidateList.push(candidate('sql-server-vm', 'Keep SQL Server on Azure VMs in the shortlist if feature testing finds a requirement beyond Managed Instance.', 'A VM increases operating-system and database administration responsibilities.'));
        exclusions.push({ serviceId: 'azure-sql-db', reason: 'The workload explicitly requires SQL Server instance features identified by the Microsoft decision tree; verify exact feature availability before final selection.', sourceIds: ['azure-sql-decision'] });
      } else {
        recordRule('sql-existing-engine');
        candidateList.push(candidate('azure-sql-db', 'The existing SQL Server engine is relevant evidence, but no incompatible instance or OS feature has been reported.', 'Run a feature assessment; an existing engine does not by itself determine the target service.'));
        candidateList.push(candidate('azure-sql-mi', 'Managed Instance remains an option if compatibility assessment finds required instance-level features.', 'Confirm current feature parity and migration constraints.'));
      }
    } else if (answers.engine === 'postgres') {
      recordRule('postgres-existing-engine');
      if (constraints.has('postgres-extension')) recordRule('postgres-extension-gate');
      candidateList.push(candidate('postgres-flex', 'The existing PostgreSQL engine and client contract are relevant migration evidence.', constraints.has('postgres-extension') ? 'The required extension is a hard validation gate; check the exact allow-list, version, parameters and region.' : 'Validate version, extensions, drivers and migration path.'));
    } else if (answers.engine === 'mysql' || answers.engine === 'mariadb') {
      recordRule('mysql-existing-engine');
      if (answers.engine === 'mariadb' || constraints.has('mariadb-app')) recordRule('mariadb-to-mysql-validation');
      candidateList.push(candidate('mysql-flex', 'MySQL Flexible Server is the Azure managed MySQL service to assess for MySQL-compatible workloads.', answers.engine === 'mariadb' || constraints.has('mariadb-app') ? 'MariaDB-to-MySQL application compatibility is not assumed; validate SQL behaviour, schema, plugins, drivers and migration tooling.' : 'Validate engine version, feature and migration requirements.'));
    } else if (answers.engine === 'mongodb') {
      recordRule('mongo-feature-validation');
      candidateList.push(candidate('azure-documentdb', 'Azure DocumentDB (formerly the vCore-based Cosmos DB for MongoDB offering) is a MongoDB-wire-protocol-compatible managed option to evaluate.', 'Protocol support is not proof of feature parity. Validate exact commands, aggregations, drivers and version.'));
      candidateList.push(candidate('cosmos-mongo-ru', 'RU-based Cosmos DB for MongoDB is a separate API offering to compare on its own request-unit model and documented feature matrix.', 'Validate feature matrix, partitioning, transaction boundaries and cost model.'));
    } else if (answers.engine === 'cassandra') {
      recordRule('cassandra-feature-validation');
      candidateList.push(candidate('cosmos-other-apis', 'Cosmos DB exposes a Cassandra API that may be assessed against the existing workload.', 'Validate CQL features, protocol compatibility, migration and availability for the selected API.'));
      candidateList.push(candidate('cosmos-cassandra', 'Azure Managed Instance for Apache Cassandra is an official managed native Cassandra option to assess when its version, topology and migration model fit.', 'The current overview documents Cassandra through version 5.0; verify target version, region and migration path.'));
    }

    if (answers.dataShape === 'relational' || constraints.has('relationships')) {
      if (answers.engine !== 'sqlserver' && answers.engine !== 'postgres' && !['mysql', 'mariadb'].includes(answers.engine)) {
        recordRule('relational-integrity');
        candidateList.push(candidate('azure-sql-db', 'Relational constraints, joins or atomic business transactions make a relational system a relevant candidate.', 'The SQL Server engine is a platform choice; compare it with PostgreSQL when open-source engine compatibility matters.'));
        candidateList.push(candidate('postgres-flex', 'PostgreSQL is a relational alternative for workloads needing relational constraints and transactions.', 'Validate required extensions, versions, regions and operations.'));
      }
    }

    if (answers.dataShape === 'documents' && answers.geography?.startsWith('multi-region')) {
      recordRule('document-access-pattern');
      candidateList.push(candidate('cosmos-nosql', 'A document data model with confirmed multi-region latency needs makes Cosmos DB for NoSQL worth evaluating.', 'This is not an automatic choice: design partition key, consistency, transaction boundaries, region strategy and cost. A relational system can remain appropriate.'));
    } else if (answers.dataShape === 'documents' && ['document-aggregate', 'partition-key-lookup'].includes(answers.accessPattern) && !['mongodb', 'cassandra'].includes(answers.engine)) {
      recordRule('document-access-pattern');
      candidateList.push(candidate('cosmos-nosql', 'A document-oriented model makes Cosmos DB for NoSQL a candidate to compare with relational choices.', 'JSON alone is not a decision rule. Check join, transaction, consistency and access-pattern requirements.'));
    }

    if (answers.workload === 'telemetry' || answers.dataShape === 'telemetry' || answers.accessPattern === 'time-window-scan') {
      recordRule('analytics-time-series');
      candidateList.push(candidate('data-explorer', 'High-volume timestamped events and time-window analysis are a fit to evaluate against the analytical time-series model.', 'Validate ingestion, query, retention, availability, region and operational requirements.'));
      candidateList.push(candidate('fabric-eventhouse', 'Fabric Eventhouse is an additional analytics-oriented option to assess for event workloads.', 'Confirm capacity, region, availability and current product capabilities.'));
    }

    if (answers.workload === 'search' || answers.dataShape === 'search' || answers.dataKinds?.includes('search')) {
      recordRule('search-separated-role');
      if (answers.sourceFiles === 'yes') candidateList.push(candidate('blob-storage', 'The workload explicitly owns source files, so object storage can retain those originals separately from the derived index.', 'Define source-file retention, updates and index rebuilds.'));
      else if (answers.sourceFiles !== 'no') unknowns.push('Whether retrieval needs new source-file storage is unknown; do not add Blob Storage until that role is confirmed.');
      candidateList.push(candidate('ai-search', 'Search or retrieval requirements make a search index a candidate derived role.', 'A search index does not replace a transactional source of truth; decide whether vector search is actually needed.'));
      if (answers.durable === 'yes' && answers.recordModel === 'relational' && !candidateList.some((item) => serviceById[item.serviceId].role === 'System of record')) {
        candidateList.push(candidate('azure-sql-db', 'If the application needs durable transactional state, evaluate a relational system of record separately from retrieval.', 'The transaction model and current engine contract determine whether SQL Database is appropriate.'));
      }
      if (!answers.durable || answers.durable === 'unknown') unknowns.push('Whether search needs new authoritative application state is unresolved; keep the existing source or assess that role separately.');
      if (answers.durable === 'yes' && !candidateList.some((item) => serviceById[item.serviceId].role === 'System of record')) unknowns.push('The authoritative state model or existing-store contract needs separate assessment; durable state alone does not justify adding SQL Database.');
    }

    if (answers.workload === 'cache' || answers.dataShape === 'cache' || answers.dataKinds?.includes('cache')) {
      recordRule('cache-not-record');
      candidateList.push(candidate('managed-redis', 'The stated cache or transient-state role can be assessed with Azure Managed Redis.', 'The cache does not silently replace durable application data; define source of truth, expiry, invalidation and failure behaviour.'));
      if (answers.durable === 'yes' && answers.recordModel === 'relational' && !candidateList.some((item) => serviceById[item.serviceId].role === 'System of record')) {
        candidateList.push(candidate('azure-sql-db', 'If authoritative transactional data is also required, assess that as a separate role.', 'Select the system of record from its own data and compatibility requirements.'));
      }
      if (!answers.durable || answers.durable === 'unknown') unknowns.push('The durable source of truth for this cache is unknown; no new record database is assumed.');
      if (answers.durable === 'yes' && !candidateList.some((item) => serviceById[item.serviceId].role === 'System of record')) unknowns.push('Preserve or separately assess the authoritative state model; a durable-state requirement alone does not select a relational database.');
    }

    if (constraints.has('tenant-isolation') && (answers.dataShape === 'relational' || answers.dataShape === 'unknown')) {
      recordRule('tenant-shape-open');
      decisions.push({ id: 'tenant-shape-open', outcome: 'Shared versus separate tenant databases remains an architecture decision; do not infer a database-per-tenant, pool or partition strategy.' });
    }
    if (constraints.has('postgres-extension') && answers.engine !== 'postgres') {
      decisions.push({ id: 'extension-check', outcome: 'A required PostgreSQL extension needs name, version and region verification before PostgreSQL can be selected.' });
    }
    if (constraints.has('global-latency') && answers.geography === 'unknown') {
      unknowns.push('The regional latency target and client locations are unmeasured; global distribution is not yet a justified requirement.');
    }
  }

  let candidates = uniqueCandidates(candidateList);
  if (answers.dataShape === 'documents' && !candidates.length && !['mongodb', 'cassandra'].includes(answers.engine)) {
    return {
      kind: 'insufficient-information',
      title: 'Document access patterns still need definition',
      candidates,
      exclusions,
      decisions,
      unknowns: [...new Set(unknowns.concat('JSON syntax alone does not establish a need for a distributed document database; clarify transaction, query, scale and consistency needs.'))],
      changes: ['Describe the aggregate boundary, query patterns, write geography and consistency requirements before selecting a document store.'],
      sourceIds: [],
      ruleIds: [...appliedRuleIds]
    };
  }
  if (!answers.workload || answers.workload === 'unknown' || !answers.dataShape || answers.dataShape === 'unknown') {
    return {
      kind: candidates.length ? 'insufficient-information' : 'insufficient-information',
      title: 'A little more information is needed',
      candidates,
      exclusions,
      decisions,
      unknowns: [...new Set(unknowns)],
      changes: ['Describe the workload and the main data/access patterns before treating any service as a fit.'],
      sourceIds: [...new Set(candidates.flatMap((item) => serviceById[item.serviceId].sourceIds))],
      ruleIds: [...appliedRuleIds]
    };
  }

  if (answers.workload === 'files' || answers.dataShape === 'files' && candidates.some((item) => item.serviceId === 'blob-storage')) {
    candidates = candidates.filter((item) => item.serviceId === 'blob-storage');
    return {
      kind: 'no-database-needed',
      title: 'No database is implied by this requirement',
      candidates,
      exclusions,
      decisions,
      unknowns: [...new Set(unknowns)],
      changes: ['If you also need searchable metadata, relationships or transactions, assess that responsibility separately.'],
      sourceIds: candidates.flatMap((item) => serviceById[item.serviceId].sourceIds),
      ruleIds: [...appliedRuleIds]
    };
  }

  if (candidates.some((item) => item.serviceId === 'ai-search')) {
    const multiStore = candidates.length > 1;
    return {
      kind: multiStore ? 'multi-store' : 'shortlist',
      title: multiStore ? 'Separate the source, state and retrieval roles' : 'A search index is a candidate',
      candidates,
      architecture: [
        { role: 'Authoritative source files', serviceId: 'blob-storage', boundary: 'Original documents; define updates, access controls, retention and recoverable backups.' },
        ...candidates.filter((item) => serviceById[item.serviceId].role === 'System of record').map((item) => ({ role: 'System of record', serviceId: item.serviceId, boundary: 'Authoritative application records; own transaction, security and recovery guarantees separately from the index.' })),
        { role: 'Search / retrieval index', serviceId: 'ai-search', boundary: 'Derived index; account for indexing lag, reindexing and failure recovery.' },
        { role: 'Cache', serviceId: 'managed-redis', boundary: 'Regenerable data; define expiry, invalidation, reloads and outage behaviour.' }
      ].filter((role) => candidates.some((item) => item.serviceId === role.serviceId)),
      architectureLinks: [
        ...(answers.sourceFiles === 'yes' ? [{ from: 'blob-storage', to: 'ai-search', purpose: 'Source updates → index ingestion', boundary: 'Indexing is asynchronous: allow lag, retry failed updates and rebuild from the original files. Index failure must not delete authoritative files.' }] : []),
        ...candidates.filter((item) => serviceById[item.serviceId].role === 'System of record').map((item) => ({ from: item.serviceId, to: 'ai-search', purpose: 'Application references → retrieval', boundary: 'Join results in the application; no cross-store atomic commit is assumed. Define stale-reference handling and independent restore/rebuild procedures.' })),
        ...candidates.filter((item) => serviceById[item.serviceId].role === 'System of record' && candidates.some((entry) => entry.serviceId === 'managed-redis')).map((item) => ({ from: item.serviceId, to: 'managed-redis', purpose: 'Source reads → regenerable cache', boundary: 'Define invalidation and expiry. Handle cache outage independently of authoritative writes; no cross-store atomic commit is assumed.' }))
      ],
      exclusions,
      decisions,
      unknowns: [...new Set(unknowns)],
      changes: ['If there is no need for vector retrieval, a conventional search design may be more appropriate.', 'If no durable application state is needed, do not add a transactional database by default.'],
      sourceIds: [...new Set(candidates.flatMap((item) => serviceById[item.serviceId].sourceIds))],
      ruleIds: [...appliedRuleIds]
    };
  }

  if (candidates.some((item) => item.serviceId === 'managed-redis')) {
    const record = candidates.find((item) => serviceById[item.serviceId].role === 'System of record');
    const multiStore = answers.durable !== 'no' && Boolean(record);
    return {
      kind: multiStore ? 'multi-store' : 'shortlist',
      title: multiStore ? 'Keep the cache separate from the source of truth' : 'A cache is a candidate, not a database replacement',
      candidates,
      architecture: multiStore ? [
        { role: 'System of record', serviceId: record.serviceId, boundary: 'Owns authoritative, recoverable data.' },
        { role: 'Cache', serviceId: 'managed-redis', boundary: 'Derived or transient data; define expiry, invalidation and outage behaviour.' }
      ] : [],
      architectureLinks: record ? [{ from: record.serviceId, to: 'managed-redis', purpose: 'Source reads → regenerable cache', boundary: 'Define expiry, invalidation and cache-miss reloads. On cache outage, use a tested bypass or graceful degradation; no atomic cross-store update is implied.' }] : [],
      exclusions,
      decisions,
      unknowns: [...new Set(unknowns)],
      changes: ['If cache contents cannot be regenerated, reassess whether this is truly cache data and define durability requirements.'],
      sourceIds: [...new Set(candidates.flatMap((item) => serviceById[item.serviceId].sourceIds))],
      ruleIds: [...appliedRuleIds]
    };
  }

  if (!candidates.length) {
    return {
      kind: 'no-verified-match',
      title: 'No verified match in this catalogue',
      candidates: [],
      exclusions,
      decisions,
      unknowns: [...new Set(unknowns)],
      changes: ['Confirm the workload model and check current Azure documentation for a suitable service.'],
      sourceIds: [],
      ruleIds: [...appliedRuleIds]
    };
  }

  const qualificationNeeded = unknowns.length > 0 || candidates.some((item) => item.caveat);
  const kind = candidates.length === 1 && !qualificationNeeded ? 'primary-candidate' : 'shortlist';
  return {
    kind,
    title: kind === 'primary-candidate' ? 'A primary candidate to validate' : 'A qualified shortlist',
    candidates,
    exclusions,
    decisions,
    unknowns: [...new Set(unknowns)],
    changes: [
      'Confirm target regions, service tier, version, configuration, security, availability and recovery requirements.',
      'Review current pricing for the actual workload; this navigator does not estimate or rank cost.'
    ],
    sourceIds: [...new Set(candidates.flatMap((item) => serviceById[item.serviceId].sourceIds).concat(exclusions.flatMap((item) => item.sourceIds)))],
    ruleIds: [...appliedRuleIds]
  };
}
