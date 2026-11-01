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
  if (result.kind === 'multi-store' && (!result.architecture?.length || !result.architectureLinks?.length)) errors.push('Combined architecture lacks roles or failure boundaries');
  return errors;
}
