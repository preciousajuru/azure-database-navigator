import { profileFor, profileLabels } from './profiles.js';

export const capabilityLabels = {
  nativeThreePartNameQueries: 'Native SQL Server three-part queries',
  vectorSearch: 'Vector similarity retrieval',
  graphTraversal: 'Property-graph traversal',
  featureCompatibility: 'Source-engine feature compatibility',
  newDeployment: 'New deployment lifecycle'
};

export function comparisonRows(selected) {
  const common = Object.keys(profileLabels).map((key) => ({
    label: profileLabels[key], cells: selected.map((service) => profileFor(service)[key])
  }));
  const specific = Object.entries(capabilityLabels).filter(([key]) => selected.some((service) => service.capabilities[key])).map(([key, label]) => ({
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
