import { profileFor, profileLabels } from './profiles.js';

export const capabilityLabels = {
  relational: 'Relational records',
  sqlServerDatabaseEngine: 'SQL Server database engine',
  instanceFeatures: 'Instance-scoped features',
  crossDatabaseQueries: 'Cross-database query options',
  sqlServerInstanceFeatures: 'SQL Server instance features',
  operatingSystemControl: 'Operating-system control',
  sqlServerEngine: 'SQL Server engine',
  customerOperations: 'Customer operational ownership',
  postgresEngine: 'PostgreSQL engine',
  requiredExtensions: 'Required extensions',
  mysqlEngine: 'MySQL engine',
  mariadbCompatibility: 'MariaDB application compatibility',
  fabricIntegration: 'Fabric integration',
  document: 'Document records',
  configurableConsistency: 'Configurable consistency',
  transactionalBoundary: 'Transaction scope',
  globalWrites: 'Multi-region writes',
  mongoWireProtocol: 'MongoDB wire protocol',
  apiChoice: 'API-specific behaviour',
  compatibility: 'Compatibility assessment',
  wideColumn: 'Wide-column records',
  cassandraCompatibility: 'Apache Cassandra compatibility',
  cache: 'Regenerable cache',
  durableSystemOfRecord: 'Durable system of record',
  clientCompatibility: 'Client compatibility',
  objectStorage: 'Object storage',
  relationalDatabase: 'Relational database role',
  keyValue: 'Key / attribute records',
  analyticsStore: 'Analytical storage',
  searchIndex: 'Derived search index',
  timeSeriesAnalytics: 'Time-window analytics',
  transactionalSystemOfRecord: 'Transactional system of record',
  analytical: 'Analytical queries',
  analyticalStorage: 'Analytical storage foundation',
  postgresDistributed: 'Distributed PostgreSQL',
  newRecommendation: 'New-design lifecycle',
  nativeThreePartNameQueries: 'Native SQL Server three-part queries',
  vectorSearch: 'Vector similarity retrieval',
  graphTraversal: 'Property-graph traversal',
  featureCompatibility: 'Source-engine feature compatibility',
  newDeployment: 'New deployment lifecycle'
};
const specificKeys = ['nativeThreePartNameQueries', 'vectorSearch', 'graphTraversal', 'featureCompatibility', 'newDeployment'];

export function comparisonRows(selected) {
  const common = Object.keys(profileLabels).map((key) => ({
    label: profileLabels[key], cells: selected.map((service) => profileFor(service)[key])
  }));
  const specific = Object.entries(capabilityLabels).filter(([key]) => specificKeys.includes(key) && selected.some((service) => service.capabilities[key])).map(([key, label]) => ({
    label,
    cells: selected.map((service) => service.capabilities[key] || (
      key === 'nativeThreePartNameQueries' && !service.api.includes('SQL Server') ||
      key === 'graphTraversal' && service.id !== 'cosmos-other-apis'
        ? { status: 'not-applicable', condition: 'Not this engine / API contract.', sourceIds: [] }
        : { status: 'unknown', condition: 'Unknown — verification required for this service and configuration.', sourceIds: [] }
    ))
  }));
  return common.concat(specific);
}
