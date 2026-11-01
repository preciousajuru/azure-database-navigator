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
const testReferences = recommendationTests + scenarioFixtures + await readFile(new URL('../tests/experience.test.js', import.meta.url), 'utf8');

for (const source of sources) {
  if (!source.url.startsWith('https://')) errors.push(`Source ${source.id} does not use HTTPS.`);
  if (!source.verifiedOn || !source.published) errors.push(`Source ${source.id} is missing verification/publication metadata.`);
  const issue = verificationIssue(source.verifiedOn);
  if (issue) errors.push(`Source ${source.id}: ${issue}`);
}
for (const service of services) {
  if (!familyFor(service)) errors.push(`Missing family: ${service.id}`);
  for (const [key, entry] of Object.entries(profileFor(service))) {
    if (!profileLabels[key] || !entry.text || !entry.condition) errors.push(`Incomplete structured profile: ${service.id}.${key}`);
    for (const id of entry.sourceIds) if (!sourceById[id]) errors.push(`Profile ${service.id}.${key} missing source: ${id}`);
  }
  if (!service.summary || !service.model || !service.api || !service.role) errors.push(`Service ${service.id} has incomplete profile fields.`);
  if (!service.sourceIds.length) errors.push(`Service ${service.id} has no evidence source.`);
  for (const id of service.sourceIds) if (!sourceById[id]) errors.push(`Service ${service.id} references missing source ${id}.`);
  for (const [capability, value] of Object.entries(service.capabilities)) {
    if (!['supported', 'unsupported', 'conditional', 'unknown', 'not-applicable'].includes(value.status)) {
      errors.push(`Service ${service.id} capability ${capability} has invalid status ${value.status}.`);
    }
    if (value.status !== 'unknown' && value.sourceIds.length === 0) errors.push(`Service ${service.id} capability ${capability} needs evidence.`);
    if (value.status === 'conditional' && !value.condition) errors.push(`Conditional capability ${service.id}.${capability} lacks configuration boundaries.`);
    for (const id of value.sourceIds) if (!sourceById[id]) errors.push(`Capability ${service.id}.${capability} references missing source ${id}.`);
    if (['supported', 'unsupported', 'conditional'].includes(value.status) && value.sourceIds.length && value.sourceIds.every((id) => sourceById[id] && isHubSource(sourceById[id]))) errors.push(`Hub-only capability evidence: ${service.id}.${capability}`);
  }
  if (service.lifecycle === 'retired-service' && service.capabilities.newDeployment?.status !== 'unsupported') {
    errors.push(`Retired service ${service.id} is not explicitly excluded for new deployments.`);
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
  errors.push(...resultIssues(result, serviceById, sourceById, ruleById));
  if (result.architecture.filter((node) => node.id === 'records').length !== (recordModel === 'unknown' ? 0 : 1)) errors.push(`Invalid record role: ${recordModel}`);
}
for (const id of ['azure-sql-db', 'postgres-flex', 'cosmos-nosql', 'azure-documentdb', 'managed-redis', 'ai-search']) {
  if (!serviceById[id].capabilities.vectorSearch?.sourceIds.length) errors.push(`Missing vector evidence: ${id}`);
}
if (!serviceById['cosmos-other-apis'].capabilities.graphTraversal?.sourceIds.includes('gremlin-overview')) errors.push('Missing graph evidence');

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
  for (const issue of resultIssues(evaluate(scenario.answers), serviceById, sourceById, ruleById)) errors.push(`Scenario ${scenario.id}: ${issue}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Catalogue integrity passed: ${services.length} service profiles, ${sources.length} sources, ${scenarios.length} scenarios.`);
}
