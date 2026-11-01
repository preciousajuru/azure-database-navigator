import { capabilityMatrix } from './capability-matrix.js';

export const capabilityStates = {
  supported: { label: 'Supported', meaning: 'Explicitly documented for this service.' },
  conditional: { label: 'Conditional', meaning: 'Documented, but only under the stated tier, version, deployment model, API, region or preview conditions.' },
  unsupported: { label: 'Not supported', meaning: 'Official documentation states that the capability is unavailable.' },
  'not-applicable': { label: 'Not applicable', meaning: 'The capability does not meaningfully apply to this service’s architecture, engine or role.' },
  'needs-verification': { label: 'Needs verification', meaning: 'Current documentation does not settle the answer; the cell states exactly what to verify and where.' }
};

export const capabilitySections = [
  {
    id: 'engine', label: 'Database engine and data model',
    intro: 'Which engine or API the service runs, and how it stores data. Speaking SQL or storing JSON does not make two services the same engine.',
    capabilities: [
      ['relationalEngine', 'Relational database engine'],
      ['sqlServerEngine', 'Native SQL Server engine compatibility'],
      ['jsonQuerying', 'JSON storage and querying'],
      ['documentModel', 'Native document-oriented data model'],
      ['protocolCompatibility', 'Wire protocol or API compatibility']
    ]
  },
  {
    id: 'transactions', label: 'Transactions and consistency',
    intro: 'ACID guarantees, how far a transaction reaches, and what readers see. SQL isolation levels and distributed consistency models answer different questions.',
    capabilities: [
      ['acidTransactions', 'ACID transaction support'],
      ['transactionScope', 'Transaction scope', true],
      ['readConsistency', 'Read consistency and replication semantics'],
      ['configurableConsistency', 'Configurable distributed consistency models']
    ]
  },
  {
    id: 'queries', label: 'Queries and indexing',
    intro: 'Querying across databases, federating to other sources and native vector retrieval.',
    capabilities: [
      ['crossDatabaseQuery', 'Native cross-database querying'],
      ['federatedQuery', 'Elastic or federated querying'],
      ['vectorSearch', 'Vector similarity retrieval']
    ]
  },
  {
    id: 'scaling', label: 'Scaling and performance',
    intro: 'Scale-out, read offloading and multi-region writes. None of these is a performance guarantee for a particular workload.',
    capabilities: [
      ['horizontalScaling', 'Partitioning and horizontal scaling'],
      ['readReplicas', 'Read replicas'],
      ['multiRegionWrites', 'Multi-region writes'],
      ['tierRegionConditions', 'Region-specific and tier-specific conditions', true]
    ]
  },
  {
    id: 'availability', label: 'Availability and recovery',
    intro: 'High availability, point-in-time restore and backups are separate mechanisms. None of them replaces a tested recovery plan.',
    capabilities: [
      ['highAvailability', 'High availability'],
      ['pointInTimeRestore', 'Point-in-time restore'],
      ['nativeBackupRestore', 'Native backup and restore functionality']
    ]
  },
  {
    id: 'security', label: 'Security and networking',
    intro: 'Network isolation and identity options. Availability in your configuration still needs checking; no compliance outcome is implied.',
    capabilities: [
      ['privateNetworking', 'Private networking'],
      ['identityAuth', 'Identity and authentication options']
    ]
  },
  {
    id: 'migration', label: 'Migration and compatibility',
    intro: 'SQL Server instance features, operating-system control and whether the service is available for new deployments.',
    capabilities: [
      ['sqlAgent', 'SQL Server Agent support'],
      ['clrSupport', 'CLR support'],
      ['osControl', 'Operating-system control'],
      ['newDeployment', 'Lifecycle for new deployments']
    ]
  },
  {
    id: 'operations', label: 'Operational responsibilities',
    intro: 'Who patches the engine and operating system, and what remains your responsibility.',
    capabilities: [
      ['managedPatching', 'Platform-managed engine and OS patching']
    ]
  },
  {
    id: 'cost', label: 'Cost considerations',
    intro: 'The billing dimensions to model. No price, tier or capacity is recommended.',
    capabilities: [
      ['billingModel', 'Billing model', true]
    ]
  }
].map((section) => ({
  ...section,
  capabilities: section.capabilities.map(([key, label, descriptive = false]) => ({ key, label, descriptive }))
}));

export const capabilityDefinitions = Object.fromEntries(capabilitySections.flatMap((section) => section.capabilities.map((capability) => [capability.key, { ...capability, section: section.id }])));
export const capabilityKeys = Object.keys(capabilityDefinitions);

/**
 * Returns the reviewed cell, or a `missing` marker. A missing cell is a catalogue data-quality
 * defect (rejected by `npm run check`), never a statement about the Azure service.
 */
export function capabilityFor(serviceId, key) {
  return capabilityMatrix[serviceId]?.[key] || { status: 'missing', summary: '', condition: '', sourceIds: [] };
}

export function catalogueGaps(serviceIds) {
  const gaps = [];
  for (const serviceId of serviceIds) {
    for (const key of capabilityKeys) {
      const cell = capabilityMatrix[serviceId]?.[key];
      const descriptive = capabilityDefinitions[key].descriptive;
      if (!cell) gaps.push(`${serviceId}.${key}: missing catalogue entry`);
      else if (descriptive ? cell.status !== 'description' : !capabilityStates[cell.status]) gaps.push(`${serviceId}.${key}: invalid state ${cell.status}`);
      else if (!cell.summary) gaps.push(`${serviceId}.${key}: missing explanation`);
      else if (cell.status !== 'not-applicable' && !cell.sourceIds?.length) gaps.push(`${serviceId}.${key}: missing source`);
      else if (cell.status === 'conditional' && !cell.condition) gaps.push(`${serviceId}.${key}: conditional without a stated condition`);
      else if (cell.status === 'needs-verification' && !cell.condition) gaps.push(`${serviceId}.${key}: needs verification without stating what to verify`);
    }
    for (const key of Object.keys(capabilityMatrix[serviceId] || {})) if (!capabilityDefinitions[key]) gaps.push(`${serviceId}.${key}: key outside the taxonomy`);
  }
  return gaps;
}

/** Sections and rows for two or three selected services; rows that apply to none of them are collapsed into a note. */
export function comparisonSections(selected) {
  return capabilitySections.map((section) => {
    const rows = section.capabilities.map((capability) => ({
      ...capability,
      cells: selected.map((service) => ({ serviceId: service.id, ...capabilityFor(service.id, capability.key) }))
    }));
    const applicable = rows.filter((row) => row.cells.some((cell) => cell.status !== 'not-applicable'));
    return { ...section, rows: applicable, hiddenRows: rows.filter((row) => !applicable.includes(row)).map((row) => row.label) };
  });
}

/** True only when every capability relied upon is explicitly documented without conditions. */
export function evidenceIsDefinitive(serviceId, keys = []) {
  return keys.every((key) => capabilityFor(serviceId, key).status === 'supported');
}
