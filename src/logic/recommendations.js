import { serviceById } from '../data/services.js';
import { ruleById } from '../data/rules.js';
import { capabilityFor } from '../data/capabilities.js';

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

function documentAlternatives(answers, candidates) {
  if (answers.dataShape !== 'documents' || !candidates.length || ['sqlserver', 'postgres', 'mysql', 'mariadb', 'mongodb', 'cassandra'].includes(answers.engine)) return [];
  const distribution = answers.geography?.startsWith('multi-region')
    ? ' Validate measured regional latency, write geography and recovery separately; JSON support does not establish equivalent global writes.'
    : ' Check query patterns and transaction boundaries rather than assuming JSON requires a distributed document store.';
  return [
    { serviceId: 'azure-sql-db', reason: `SQL Database supports JSON alongside relational records. Also assess it when joins, business transactions or a SQL Server contract matter; verify the exact JSON feature and version.${distribution}`, sourceIds: ['sql-json'] },
    { serviceId: 'postgres-flex', reason: `PostgreSQL supports json/jsonb and JSON indexing. Also assess it for mixed relational/document records; validate the Azure engine version, extensions and any existing engine contract.${distribution}`, sourceIds: ['postgres-json', 'postgres-overview'] }
  ].filter((item) => !candidates.some((candidate) => candidate.serviceId === item.serviceId));
}

function evaluateRoles(answers) {
  const wantsSearch = answers.workload === 'search' || answers.dataShape === 'search' || answers.dataKinds?.includes('search') || answers.accessPattern === 'vector-similarity';
  const wantsCache = answers.workload === 'cache' || answers.dataShape === 'cache' || answers.dataKinds?.includes('cache');
  const wantsFiles = answers.sourceFiles === 'yes' || answers.dataKinds?.includes('files');
  const candidates = [];
  const alsoAssess = [];
  const architecture = [];
  const architectureLinks = [];
  const unknowns = getUnknowns(answers);
  const decisions = [];
  const exclusions = [];
  const ruleIds = new Set(['exclude-retired-new', 'authoritative-role']);
  const sourceIds = new Set(['arch-data-models', 'arch-data-considerations']);
  let retainedRetrieval = false;
  const add = (id, reason, caveat) => candidates.push(candidate(id, reason, caveat));
  const absorb = (result) => {
    candidates.push(...result.candidates);
    alsoAssess.push(...(result.alsoAssess || []));
    exclusions.push(...result.exclusions);
    unknowns.push(...result.unknowns);
    result.ruleIds.forEach((id) => ruleIds.add(id));
    result.sourceIds.forEach((id) => sourceIds.add(id));
  };
  let record;
  if (answers.durable === 'yes' && answers.recordModel === 'existing') {
    record = {
      id: 'records', role: 'System of record', kind: 'retained',
      label: 'Your existing authoritative store (retained; not selected or migrated by this tool)',
      serviceIds: [],
      boundary: `${serviceById[answers.existingService] ? `Reported existing platform: ${serviceById[answers.existingService].name}. ` : ''}Retain its current record ownership. Verify its actual engine, version, recovery, access controls and retrieval capabilities; no migration is inferred.`
    };
  } else if (answers.durable === 'yes' && ['relational', 'documents'].includes(answers.recordModel)) {
    const result = evaluate({
      ...answers, workload: 'new-app', dataShape: answers.recordModel, dataKinds: [],
      recordModel: undefined, durable: undefined, sourceFiles: undefined,
      retrievalType: undefined, existingService: undefined
    });
    absorb(result);
    record = {
      id: 'records', role: 'System of record', kind: 'authoritative',
      label: answers.recordModel === 'relational' ? 'Transactional system of record' : 'Document system of record',
      serviceIds: result.candidates.map((item) => item.serviceId),
      boundary: result.candidates.length ? 'Choose ONE of these platform alternatives, using the same engine and compatibility rules as a single-store assessment. Own authoritative writes, access controls and recovery.' : 'Document-store selection remains unresolved: define aggregate/query/transaction boundaries before choosing ONE authoritative store.'
    };
  } else if (answers.durable !== 'no') {
    unknowns.push('The authoritative record model is unresolved; no new record database is selected.');
    architecture.push({ id: 'record-gap', role: 'Unresolved requirement', kind: 'unresolved', label: 'Authoritative record requirements unresolved', serviceIds: [], boundary: 'Confirm whether authoritative records are needed and their model or retained engine before selecting a store.' });
  }
  if (record) architecture.push(record);
  if (wantsFiles) {
    add('blob-storage', 'Original files are explicitly required; retain them independently of derived indexes.', 'Define retention, access controls and recoverable backups.');
    architecture.push({ id: 'files', role: 'Authoritative source files', kind: 'authoritative', label: 'Original files', serviceIds: ['blob-storage'], boundary: 'Owns original files, not application records. Index/cache failure must not delete these originals.' });
  }
  if (wantsSearch) {
    ruleIds.add('vector-existing-first');
    sourceIds.add('vector-selection');
    const retrievalKnown = ['keyword', 'vector', 'hybrid'].includes(answers.retrievalType);
    const existing = serviceById[answers.existingService];
    const localOptions = existing ? [existing] : (record?.serviceIds || []).map((id) => serviceById[id]);
    // Only reviewed supported/conditional cells qualify; needs-verification never establishes a vector option.
    const vectorOptions = localOptions.filter((service) => ['supported', 'conditional'].includes(capabilityFor(service.id, 'vectorSearch').status));
    if (!record && !wantsFiles) {
      unknowns.push('Identify and confirm the authoritative content source for retrieval. A derived index still needs originals even when this application does not own durable records.');
      architecture.push({ id: 'search-source-gap', role: 'Unresolved source', kind: 'unresolved', label: 'Authoritative retrieval source unresolved', serviceIds: [], boundary: 'Identify the retained external source or original files, its access controls and update/deletion ownership; a search index is not the source of truth.' });
    }
    if (!retrievalKnown) {
      unknowns.push('Retrieval type is unknown; no vector database or separate search index is added.');
    } else {
      if (answers.retrievalType !== 'keyword' && vectorOptions.length) {
        decisions.push({ id: 'vector-existing-first', outcome: `First test vector retrieval in ${vectorOptions.map((service) => service.name).join(' or ')}. These are alternatives, not extra required stores. Check dimensions, index type/status, filtering, freshness and measured latency.` });
        vectorOptions.forEach((service) => capabilityFor(service.id, 'vectorSearch').sourceIds.forEach((id) => sourceIds.add(id)));
      } else if (answers.retrievalType !== 'keyword') {
        unknowns.push('The existing or planned store’s vector capability has not been established; identify its exact service/version and test retrieval before adding a store.');
      }
      if (answers.separateIndex === 'yes' && answers.searchFreshness === 'lag-ok') {
        ruleIds.add('search-separated-role');
        add('ai-search', 'A separate managed index across source content is explicitly required and indexing lag is acceptable.', 'Validate hybrid/semantic ranking, filters, index quotas, source integration and region/tier availability.');
        architecture.push({ id: 'search', role: 'Derived search / retrieval index', kind: 'derived', label: 'Managed search index', serviceIds: ['ai-search'], boundary: 'Derived content; define ingestion, lag, retries, deletion propagation and rebuilds. No atomic cross-store writes are assumed.' });
        for (const source of architecture.filter((node) => ['files', 'records'].includes(node.id))) {
          architectureLinks.push({ from: source.id, to: 'search', purpose: 'Derived from — indexing design required', boundary: 'Select and verify a propagation mechanism. Allow lag, retry failures, reconcile deletions and rebuild independently from originals.' });
        }
      } else {
        decisions.push({ id: 'vector-existing-first', outcome: 'No separate index is selected. First assess source-store retrieval; a separate managed index needs justified features, multiple-source integration and acceptable freshness boundaries.' });
        if (!['yes', 'no'].includes(answers.separateIndex)) unknowns.push('Whether a separate managed index is required is unknown; confirm the retrieval features or multi-source integration that justify it.');
        if (answers.separateIndex === 'yes' && !['lag-ok', 'real-time'].includes(answers.searchFreshness)) unknowns.push('A separate index is requested but acceptable source-to-index freshness is unknown; define indexing lag before selecting a copied index.');
        if (answers.searchFreshness === 'real-time') unknowns.push('Near-real-time retrieval favours testing the source database first; a copied index is not assumed to make every write immediately searchable.');
      }
    }
    if (!candidates.length && record?.kind === 'retained' && retrievalKnown && answers.separateIndex === 'no' && (answers.retrievalType === 'keyword' || vectorOptions.length)) {
      retainedRetrieval = true;
      decisions.push({ id: 'vector-existing-first', outcome: 'Retain the authoritative store and test retrieval there; this assessment selects no new store or migration.' });
    }
  }
  if (wantsCache) {
    ruleIds.add('cache-not-record');
    add('managed-redis', 'A regenerable cache role is explicit; it does not select or replace the authoritative engine.', 'Define expiry, invalidation, memory, cache misses and failure behaviour.');
    architecture.push({ id: 'cache', role: 'Cache — regenerable copy', kind: 'cache', label: 'Application cache', serviceIds: ['managed-redis'], boundary: 'Not the source of truth. Specify expiry, invalidation, bypass/degradation and reload behaviour.' });
    if (record) architectureLinks.push({ from: 'records', to: 'cache', purpose: 'Invalidate / refresh — design required', boundary: 'Define expiry, cache-miss reloads and invalidation. Test outage independently of authoritative writes; no atomic cross-store update is implied.' });
  }
  candidates.forEach((item) => serviceById[item.serviceId].sourceIds.forEach((id) => sourceIds.add(id)));
  const kind = architecture.some((node) => ['derived', 'cache'].includes(node.kind)) && architecture.some((node) => ['authoritative', 'retained'].includes(node.kind)) ? 'multi-store' : candidates.length ? 'shortlist' : retainedRetrieval ? 'no-database-needed' : 'insufficient-information';
  if (kind === 'insufficient-information' && !unknowns.length) unknowns.push('No new store is selected: clarify the required data roles and source-store retrieval capabilities before establishing a match.');
  return {
    kind,
    title: kind === 'no-database-needed' ? 'Test retrieval in your existing store; no new database selected' : 'Assess roles without adding unnecessary stores',
    candidates: uniqueCandidates(candidates), alsoAssess: alsoAssess.filter((item) => !candidates.some((candidate) => candidate.serviceId === item.serviceId)), architecture, architectureLinks, decisions, exclusions,
    unknowns: [...new Set(unknowns)],
    changes: ['First test whether the authoritative store can meet retrieval requirements. Separate stores only for documented roles.', 'Select one authoritative platform alternative; independent stores are not automatically transactionally consistent.'],
    sourceIds: [...sourceIds], ruleIds: [...ruleIds]
  };
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

  if (['cache', 'search'].includes(answers.workload) || ['cache', 'search'].includes(answers.dataShape) || answers.dataKinds?.length || answers.workload === 'mixed' && answers.durable || answers.accessPattern === 'vector-similarity') {
    return evaluateRoles(answers);
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
        exclusions.push({ serviceId: 'azure-sql-db', reason: 'The documented decision tree directs OS/file-system control or a specific SQL Server version requirement to SQL Server on Azure VMs.', sourceIds: ['azure-sql-decision'], capabilityKeys: ['osControl'] });
      } else if (constraints.has('sql-instance-features')) {
        recordRule('sql-instance-features');
        candidateList.push(candidate('azure-sql-mi', 'The stated SQL Server workload requires one or more instance features identified by Microsoft as Managed Instance decision factors.', 'Verify each required feature, engine version, migration path, networking and target-region availability.'));
        candidateList.push(candidate('sql-server-vm', 'Keep SQL Server on Azure VMs in the shortlist if feature testing finds a requirement beyond Managed Instance.', 'A VM increases operating-system and database administration responsibilities.'));
        exclusions.push({ serviceId: 'azure-sql-db', reason: 'The workload explicitly requires SQL Server instance features identified by the Microsoft decision tree; verify exact feature availability before final selection.', sourceIds: ['azure-sql-decision'], capabilityKeys: ['sqlAgent', 'clrSupport', 'crossDatabaseQuery'] });
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
      candidateList.push(candidate('managed-cassandra', 'Azure Managed Instance for Apache Cassandra is an official managed native Cassandra option to assess when its version, topology and migration model fit.', 'The current overview documents Cassandra through version 5.0; verify target version, region and migration path.'));
    }

    if (answers.dataShape === 'relational' || constraints.has('relationships')) {
      if (answers.engine !== 'sqlserver' && answers.engine !== 'postgres' && !['mysql', 'mariadb'].includes(answers.engine)) {
        recordRule('relational-integrity');
        candidateList.push(candidate('azure-sql-db', 'Relational constraints, joins or atomic business transactions make a relational system a relevant candidate.', 'The SQL Server engine is a platform choice; compare it with PostgreSQL when open-source engine compatibility matters.'));
        candidateList.push(candidate('postgres-flex', 'PostgreSQL is a relational alternative for workloads needing relational constraints and transactions.', 'Validate required extensions, versions, regions and operations.'));
      }
    }

    if (answers.dataShape === 'documents' && answers.geography?.startsWith('multi-region') && !['mongodb', 'cassandra'].includes(answers.engine)) {
      recordRule('document-access-pattern');
      candidateList.push(candidate('cosmos-nosql', 'A document data model with confirmed multi-region latency needs makes Cosmos DB for NoSQL worth evaluating.', 'This is not an automatic choice: design partition key, consistency, transaction boundaries, region strategy and cost. A relational system can remain appropriate.'));
    } else if (answers.dataShape === 'documents' && ['document-aggregate', 'partition-key-lookup'].includes(answers.accessPattern) && !['mongodb', 'cassandra'].includes(answers.engine)) {
      recordRule('document-access-pattern');
      candidateList.push(candidate('cosmos-nosql', 'A document-oriented model makes Cosmos DB for NoSQL a candidate to compare with relational choices.', 'JSON alone is not a decision rule. Check join, transaction, consistency and access-pattern requirements.'));
    }

    if (answers.dataShape === 'graph' || answers.relationships === 'graph' || answers.accessPattern === 'graph-traversal') {
      recordRule('graph-traversal');
      candidateList.push(candidate('cosmos-other-apis', 'Assess the Apache Gremlin API for property-graph traversal, not the Cassandra or Table API in this grouped profile.', 'Verify traversal depth, graph size, partitioning, latency and TinkerPop support. The overview directs high-scale review to NoSQL and OLAP/Gremlin migrations to Graph in Fabric; do not infer parity or lifecycle guarantees.'));
      unknowns.push('Traversal depth, graph size, partition boundaries and latency targets are unverified. Relational modelling can remain appropriate for limited-depth relationships; graph analytics in Fabric is not automatically an OLTP replacement.');
    }

    if (answers.workload === 'telemetry' || answers.dataShape === 'telemetry' || answers.accessPattern === 'time-window-scan') {
      recordRule('analytics-time-series');
      candidateList.push(candidate('data-explorer', 'High-volume timestamped events and time-window analysis are a fit to evaluate against the analytical time-series model.', 'Validate ingestion, query, retention, availability, region and operational requirements.'));
      candidateList.push(candidate('fabric-eventhouse', 'Fabric Eventhouse is an additional analytics-oriented option to assess for event workloads.', 'Confirm capacity, region, availability and current product capabilities.'));
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

  if (!candidates.length) {
    return {
      kind: 'no-verified-match',
      title: 'No verified match in this catalogue',
      candidates: [],
      exclusions,
      decisions,
      unknowns: [...new Set(unknowns)],
      changes: [`This catalogue does not establish a match for the reported model (${answers.dataShape}), access pattern (${answers.accessPattern || 'unknown'}) and engine contract (${answers.engine || 'unconfirmed'}). Clarify these requirements and consult current service documentation.`],
      sourceIds: [],
      ruleIds: [...appliedRuleIds]
    };
  }

  const qualificationNeeded = unknowns.length > 0 || candidates.some((item) => item.caveat);
  const kind = candidates.length === 1 && !qualificationNeeded ? 'primary-candidate' : 'shortlist';
  const alsoAssess = documentAlternatives(answers, candidates);
  if (alsoAssess.length) recordRule('json-also-assess');
  return {
    kind,
    title: kind === 'primary-candidate' ? 'A primary candidate to validate' : 'A qualified shortlist',
    candidates,
    alsoAssess,
    exclusions,
    decisions,
    unknowns: [...new Set(unknowns)],
    changes: [
      'Confirm target regions, service tier, version, configuration, security, availability and recovery requirements.',
      'Review current pricing for the actual workload; this navigator does not estimate or rank cost.'
    ],
    sourceIds: [...new Set(candidates.flatMap((item) => serviceById[item.serviceId].sourceIds).concat(exclusions.flatMap((item) => item.sourceIds), alsoAssess.flatMap((item) => item.sourceIds)))],
    ruleIds: [...appliedRuleIds]
  };
}
