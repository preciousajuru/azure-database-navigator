import { services } from '../src/data/services.js';
import { sources, sourceById } from '../src/data/sources.js';
import { questions } from '../src/data/questions.js';
import { scenarios } from '../src/data/scenarios.js';
import { rules } from '../src/data/rules.js';
import { ruleById } from '../src/data/rules.js';
import { serviceById } from '../src/data/services.js';
import { evaluate } from '../src/logic/recommendations.js';
import { verificationIssue, resultIssues, evidenceLinkIssues, isHubSource } from './validation.mjs';
import { readFile, readdir } from 'node:fs/promises';
import { profileFor, profileLabels } from '../src/data/profiles.js';
import { familyFor } from '../src/data/families.js';
import { performanceGuidance } from '../src/data/performance.js';
import { capabilityFor, capabilityKeys, catalogueGaps } from '../src/data/capabilities.js';
import { capabilityMatrix } from '../src/data/capability-matrix.js';

const errors = [];
const unique = (items, label) => {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item)) errors.push(`Duplicate ${label}: ${item}`);
    seen.add(item);
  }
};

unique(services.map((service) => service.id), 'service ID');
unique(sources.map((source) => source.id), 'source ID');
unique(questions.map((question) => question.id), 'question ID');
unique(scenarios.map((scenario) => scenario.id), 'scenario ID');
unique(rules.map((rule) => rule.id), 'rule ID');
for (const question of questions) {
  if (!question.title || !question.help) errors.push(`Question ${question.id} lacks explanatory copy.`);
  if (question.options) unique(question.options.map((option) => option.value), `option value in ${question.id}`);
}
const recommendationTests = await readFile(new URL('../tests/recommendations.test.js', import.meta.url), 'utf8');
const scenarioFixtures = await readFile(new URL('../src/data/scenarios.js', import.meta.url), 'utf8');
const testReferences = recommendationTests + scenarioFixtures + await readFile(new URL('../tests/experience.test.js', import.meta.url), 'utf8') + await readFile(new URL('../tests/reachable-results.test.js', import.meta.url), 'utf8');

for (const source of sources) {
  if (!source.url.startsWith('https://')) errors.push(`Source ${source.id} does not use HTTPS.`);
  if (!source.verifiedOn || !source.published) errors.push(`Source ${source.id} is missing verification/publication metadata.`);
  const issue = verificationIssue(source.verifiedOn);
  if (issue) errors.push(`Source ${source.id}: ${issue}`);
}
for (const service of services) {
  if (!familyFor(service)) errors.push(`Missing family: ${service.id}`);
  for (const [key, entry] of Object.entries(profileFor(service))) {
    if (!profileLabels[key] || !entry.text) errors.push(`Incomplete structured profile: ${service.id}.${key}`);
    for (const id of entry.sourceIds) if (!sourceById[id]) errors.push(`Profile ${service.id}.${key} missing source: ${id}`);
  }
  if (!service.summary || !service.model || !service.api || !service.role) errors.push(`Service ${service.id} has incomplete profile fields.`);
  if (!service.sourceIds.length) errors.push(`Service ${service.id} has no evidence source.`);
  for (const id of service.sourceIds) if (!sourceById[id]) errors.push(`Service ${service.id} references missing source ${id}.`);
  if (service.lifecycle === 'retired-service' && capabilityFor(service.id, 'newDeployment').status !== 'unsupported') {
    errors.push(`Retired service ${service.id} is not documented as unavailable for new deployments.`);
  }
  if (service.lifecycle === 'retirement-path' && !['unsupported', 'conditional'].includes(capabilityFor(service.id, 'newDeployment').status)) {
    errors.push(`Retirement-path service ${service.id} must state its new-deployment condition.`);
  }
  for (const rule of rules) {
    if (!rule.conditions || !rule.configuration || !rule.limitations || !rule.test || !rule.sourceIds.length) errors.push(`Rule ${rule.id} is missing decision metadata/evidence.`);
    const issue = verificationIssue(rule.verifiedOn);
    if (issue) errors.push(`Rule ${rule.id}: ${issue}`);
    if (!testReferences.includes(rule.test)) errors.push(`Rule ${rule.id} has no matching test reference: ${rule.test}`);
    for (const id of rule.serviceIds) if (!serviceById[id]) errors.push(`Rule ${rule.id} references missing service ${id}.`);
    for (const id of rule.sourceIds) if (!sourceById[id]) errors.push(`Rule ${rule.id} references missing source ${id}.`);
  }
}

for (const name of await readdir(new URL('../docs/', import.meta.url))) {
  if (name.endsWith('.md')) errors.push(...evidenceLinkIssues(await readFile(new URL(`../docs/${name}`, import.meta.url), 'utf8'), sources).map((issue) => `${name}: ${issue}`));
}
for (const entry of performanceGuidance) for (const id of entry.sourceIds) if (!sourceById[id]) errors.push(`Missing performance source: ${id}`);
for (const recordModel of ['relational', 'documents', 'existing', 'unknown']) {
  const result = evaluate({ workload: 'mixed', dataShape: 'mixed', dataKinds: ['records', 'files', 'search', 'cache'], durable: 'yes', recordModel, retrievalType: 'hybrid', separateIndex: 'yes', searchFreshness: 'lag-ok' });
  errors.push(...resultIssues(result, serviceById, sourceById, ruleById, capabilityFor));
  if (result.architecture.filter((node) => node.id === 'records').length !== (recordModel === 'unknown' ? 0 : 1)) errors.push(`Invalid record role: ${recordModel}`);
}
errors.push(...catalogueGaps(services.map((service) => service.id)));
for (const serviceId of Object.keys(capabilityMatrix)) if (!serviceById[serviceId]) errors.push(`Capability matrix has unregistered service ${serviceId}`);
for (const service of services) {
  for (const key of capabilityKeys) {
    const cell = capabilityFor(service.id, key);
    for (const id of cell.sourceIds || []) if (!sourceById[id]) errors.push(`Capability ${service.id}.${key} references missing source ${id}.`);
    if (['supported', 'unsupported', 'conditional'].includes(cell.status) && cell.sourceIds?.length && cell.sourceIds.every((id) => sourceById[id] && isHubSource(sourceById[id]))) errors.push(`Hub-only capability evidence: ${service.id}.${key}`);
    if (/\bunknown\b/i.test(`${cell.summary} ${cell.condition || ''}`)) errors.push(`Capability ${service.id}.${key} uses "unknown" wording; state what to verify instead.`);
  }
}
for (const id of ['azure-sql-db', 'postgres-flex', 'cosmos-nosql', 'azure-documentdb', 'managed-redis', 'ai-search']) {
  if (!['supported', 'conditional'].includes(capabilityFor(id, 'vectorSearch').status)) errors.push(`Missing vector evidence: ${id}`);
}

const questionValues = new Set(questions.map((question) => question.id));
for (const scenario of scenarios) {
  for (const id of scenario.expected) if (!services.some((service) => service.id === id)) errors.push(`Scenario ${scenario.id} expects unknown service ${id}.`);
  for (const id of Object.keys(scenario.answers)) if (!questionValues.has(id) && !['constraints', 'durable'].includes(id)) errors.push(`Scenario ${scenario.id} has unknown answer ${id}.`);
  for (const [id, answer] of Object.entries(scenario.answers)) {
    const question = questions.find((item) => item.id === id);
    if (!question || question.freeText) continue;
    for (const value of Array.isArray(answer) ? answer : [answer]) {
      if (!question.options.some((option) => option.value === value)) errors.push(`Scenario ${scenario.id} has an invalid ${id} answer: ${value}`);
    }
  }
  for (const issue of resultIssues(evaluate(scenario.answers), serviceById, sourceById, ruleById, capabilityFor)) errors.push(`Scenario ${scenario.id}: ${issue}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Catalogue integrity passed: ${services.length} service profiles, ${sources.length} sources, ${scenarios.length} scenarios.`);
}
