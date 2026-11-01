export function verificationIssue(date, asOf = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return 'Missing or invalid verification date';
  const verified = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(verified.getTime()) || verified.toISOString().slice(0, 10) !== date) return 'Invalid verification date';
  if (verified > asOf) return 'Verification date is in the future';
  if ((asOf - verified) / 86_400_000 > 180) return 'Evidence review is more than 180 days old; reverify before release';
  return null;
}

export function resultIssues(result, serviceById, sourceById, ruleById) {
  const errors = [];
  if (!['primary-candidate', 'shortlist', 'multi-store', 'no-database-needed', 'insufficient-information', 'no-verified-match'].includes(result.kind)) errors.push('Invalid outcome');
  if (!result.title) errors.push('Missing result title');
  for (const key of ['candidates', 'exclusions', 'decisions', 'unknowns', 'changes', 'sourceIds', 'ruleIds']) {
    if (!Array.isArray(result[key])) errors.push(`Missing result array: ${key}`);
  }
  if (errors.length) return errors;
  for (const item of result.candidates) {
    const service = serviceById[item.serviceId];
    if (!service || !item.reason || !item.caveat) errors.push(`Incomplete candidate: ${item.serviceId}`);
    if (service?.lifecycle) errors.push(`Retired/retirement-path candidate: ${item.serviceId}`);
  }
  for (const exclusion of result.exclusions) {
    if (!exclusion.reason || !exclusion.sourceIds?.length || exclusion.sourceIds.some((id) => !sourceById[id])) errors.push(`Unexplained hard exclusion: ${exclusion.serviceId}`);
  }
  for (const id of result.sourceIds) if (!sourceById[id]) errors.push(`Missing source: ${id}`);
  for (const id of result.ruleIds) if (!ruleById[id]) errors.push(`Missing rule: ${id}`);
  if (!result.changes.length) errors.push('Missing result-change explanation');
  if (result.kind === 'multi-store' && !result.architecture?.length) errors.push('Combined architecture lacks roles or failure boundaries');
  const nodes = result.architecture || [];
  if (nodes.filter((node) => node.id === 'records').length > 1) errors.push('Multiple authoritative record nodes');
  for (const node of nodes) {
    if (!node.id || !node.label || !node.boundary || !['authoritative', 'derived', 'cache', 'retained', 'unresolved'].includes(node.kind) || !Array.isArray(node.serviceIds)) errors.push('Incomplete architecture node');
    if (node.kind === 'retained' && node.serviceIds.length) errors.push('Retained store is selected by tool');
  }
  for (const link of result.architectureLinks || []) {
    if (!nodes.some((node) => node.id === link.from) || !nodes.some((node) => node.id === link.to) || !link.boundary) errors.push('Invalid architecture link');
  }
  return errors;
}

export function evidenceLinkIssues(text, sources) {
  const registered = new Set(sources.map((source) => source.url.replace(/&amp;/g, '&')));
  const allowed = /^(https:\/\/(github\.com\/preciousajuru\/|preciousajuru\.github\.io\/azure-compute-navigator\/|creativecommons\.org\/licenses\/by\/4\.0\/|azure\.microsoft\.com\/en-us\/pricing\/calculator\/))/;
  return [...new Set(text.match(/https:\/\/[^\s)"<>]+/g) || [])].filter((url) => !registered.has(url) && !allowed.test(url)).map((url) => `Unregistered evidence link: ${url}`);
}

export function isHubSource(source) {
  return /\/(azure\/cosmos-db|fabric|azure\/storage\/blobs|azure\/search|azure\/data-explorer)\/?$/.test(new URL(source.url).pathname);
}
