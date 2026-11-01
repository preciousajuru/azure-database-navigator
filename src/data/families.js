export const families = [
  { id: 'relational', label: 'Relational', light: '#174c85', dark: '#a9ceff' },
  { id: 'distributed', label: 'Document & distributed', light: '#62419b', dark: '#d0b8ff' },
  { id: 'cache', label: 'Caching', light: '#805016', dark: '#f3cb83' },
  { id: 'objects', label: 'Object & file storage', light: '#176452', dark: '#99dfc5' },
  { id: 'search', label: 'Search & retrieval', light: '#853959', dark: '#ffb7d2' },
  { id: 'analytics', label: 'Analytics & telemetry', light: '#235f72', dark: '#9bd8ed' }
];

const membership = {
  'managed-redis': 'cache', 'azure-cache-redis-legacy': 'cache',
  'blob-storage': 'objects', 'adls-gen2': 'objects', onelake: 'objects',
  'table-storage': 'distributed', 'ai-search': 'search',
  'data-explorer': 'analytics', 'fabric-warehouse': 'analytics', 'fabric-lakehouse': 'analytics', 'fabric-eventhouse': 'analytics'
};

export function familyFor(service) {
  const id = membership[service.id] || (service.family === 'Relational' ? 'relational' : 'distributed');
  return families.find((family) => family.id === id);
}
