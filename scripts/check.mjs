import { services } from '../src/data/services.js';
import { sources, sourceById } from '../src/data/sources.js';
import { questions } from '../src/data/questions.js';
import { scenarios } from '../src/data/scenarios.js';
import { rules } from '../src/data/rules.js';
import { readFile } from 'node:fs/promises';

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
const recommendationTests = await readFile(new URL('../tests/recommendations.test.js', import.meta.url), 'utf8');
const scenarioFixtures = await readFile(new URL('../src/data/scenarios.js', import.meta.url), 'utf8');
const testReferences = recommendationTests + scenarioFixtures;

for (const source of sources) {
  if (!source.url.startsWith('https://')) errors.push(`Source ${source.id} does not use HTTPS.`);
  if (!source.verifiedOn || !source.published) errors.push(`Source ${source.id} is missing verification/publication metadata.`);
}
for (const service of services) {
  if (!service.summary || !service.model || !service.api || !service.role) errors.push(`Service ${service.id} has incomplete profile fields.`);
  if (!service.sourceIds.length) errors.push(`Service ${service.id} has no evidence source.`);
  for (const id of service.sourceIds) if (!sourceById[id]) errors.push(`Service ${service.id} references missing source ${id}.`);
  for (const [capability, value] of Object.entries(service.capabilities)) {
    if (!['supported', 'unsupported', 'conditional', 'unknown', 'not-applicable'].includes(value.status)) {
      errors.push(`Service ${service.id} capability ${capability} has invalid status ${value.status}.`);
    }
    if (value.status !== 'unknown' && value.sourceIds.length === 0) errors.push(`Service ${service.id} capability ${capability} needs evidence.`);
    for (const id of value.sourceIds) if (!sourceById[id]) errors.push(`Capability ${service.id}.${capability} references missing source ${id}.`);
  }
  for (const rule of rules) {
    if (!rule.conditions || !rule.configuration || !rule.limitations || !rule.test) errors.push(`Rule ${rule.id} is missing decision metadata.`);
    if (!rule.verifiedOn) errors.push(`Rule ${rule.id} has no verification date.`);
    if (!testReferences.includes(rule.test)) errors.push(`Rule ${rule.id} has no matching test reference: ${rule.test}`);
    for (const id of rule.serviceIds) if (!services.some((service) => service.id === id)) errors.push(`Rule ${rule.id} references missing service ${id}.`);
    for (const id of rule.sourceIds) if (!sourceById[id]) errors.push(`Rule ${rule.id} references missing source ${id}.`);
  }
  if (service.lifecycle === 'retired-service' && service.capabilities.newDeployment?.status !== 'unsupported') {
    errors.push(`Retired service ${service.id} is not explicitly excluded for new deployments.`);
  }
}

const questionValues = new Set(questions.map((question) => question.id));
for (const scenario of scenarios) {
  for (const id of scenario.expected) if (!services.some((service) => service.id === id)) errors.push(`Scenario ${scenario.id} expects unknown service ${id}.`);
  for (const id of Object.keys(scenario.answers)) if (!questionValues.has(id) && !['constraints', 'durable'].includes(id)) errors.push(`Scenario ${scenario.id} has unknown answer ${id}.`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Catalogue integrity passed: ${services.length} service profiles, ${sources.length} sources, ${scenarios.length} scenarios.`);
}
