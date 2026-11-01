import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { services, serviceById } from '../src/data/services.js';
import { sourceById } from '../src/data/sources.js';
import { families, familyFor } from '../src/data/families.js';
import { profileFor, profileLabels } from '../src/data/profiles.js';
import { comparisonSections, capabilityFor, capabilityKeys } from '../src/data/capabilities.js';
import { guidanceFor } from '../src/data/performance.js';
import { evaluate } from '../src/logic/recommendations.js';

function luminance(hex) {
  const values = hex.slice(1).match(/../g).map((value) => parseInt(value, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);

test('family tokens are implemented and meet text and diagram line contrast in both themes', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  for (const family of families) {
    for (const theme of ['light', 'dark']) {
      assert.ok(css.includes(`--family-${family.id}: ${family[theme]}`));
      for (const surface of theme === 'light' ? ['#ffffff', '#f3f5f8', '#f7f9fc'] : ['#18222e', '#111821', '#1d2a37', '#263547']) {
        assert.ok(contrast(family[theme], surface) >= 4.5, `${family.id} ${theme} ${surface}`);
      }
    }
  }
  assert.ok(contrast('#58687b', '#ffffff') >= 3);
  assert.ok(contrast('#b0bdca', '#18222e') >= 3);
  assert.ok(services.every((service) => familyFor(service)));
  assert.ok(services.every((service) => capabilityKeys.every((key) => capabilityFor(service.id, key).status !== 'missing')));
  assert.equal(familyFor(serviceById['table-storage']).id, 'distributed');
  assert.equal(familyFor(serviceById.onelake).id, 'objects');
});

test('all profiles have common fields and registered evidence with no generic core boilerplate', () => {
  for (const service of services) {
    const profile = profileFor(service);
    assert.ok(Object.keys(profile).every((key) => profileLabels[key]));
    assert.ok(['whatItIs', 'model', 'engineApi', 'role', 'differsFrom', 'lifecycle'].every((key) => profile[key]), service.id);
    for (const entry of Object.values(profile)) {
      assert.ok(entry.text && !entry.status);
      assert.ok(entry.sourceIds.length && entry.sourceIds.every((id) => sourceById[id]), service.id);
    }
  }
  assert.match(profileFor(serviceById['azure-sql-mi']).differsFrom.text, /SQL Agent/);
  assert.match(capabilityFor('postgres-flex', 'readReplicas').summary, /asynchronous/i);
});

test('comparison distinguishes the documented states and engine identities without Unknown', () => {
  const rows = comparisonSections(services).flatMap((section) => section.rows);
  const states = new Set(rows.flatMap((row) => row.cells.map((cell) => cell.status)));
  for (const state of ['conditional', 'not-applicable', 'supported', 'unsupported']) assert.ok(states.has(state), state);
  assert.ok(!states.has('unknown') && !states.has('missing'));
  const engine = comparisonSections([serviceById['azure-sql-db'], serviceById['postgres-flex']]).find((section) => section.id === 'engine').rows.find((row) => row.key === 'sqlServerEngine');
  assert.deepEqual(engine.cells.map((cell) => cell.status), ['supported', 'not-applicable']);
});

test('global JSON preserves primary distribution candidate and explicit relational assessment alternatives', () => {
  const result = evaluate({ workload: 'new-app', persistence: 'durable', dataShape: 'documents', geography: 'multi-region-read' });
  assert.deepEqual(result.candidates.map((item) => item.serviceId), ['cosmos-nosql']);
  assert.deepEqual(result.alsoAssess.map((item) => item.serviceId), ['azure-sql-db', 'postgres-flex']);
  assert.ok(result.alsoAssess.every((item) => item.sourceIds.every((id) => sourceById[id])));
  assert.equal(evaluate({ workload: 'new-app', dataShape: 'documents', accessPattern: 'document-aggregate' }).alsoAssess.length, 2);
});

test('performance guidance is role-specific, sourced and never a benchmark', () => {
  assert.ok(guidanceFor(['cosmos-nosql']).some((item) => /hot partitions/.test(item.text)));
  assert.ok(guidanceFor(['postgres-flex']).some((item) => /replicas/.test(item.text)));
  assert.ok(!guidanceFor(['blob-storage']).some((item) => /return idle connections/i.test(item.text)));
  assert.ok(guidanceFor(services.map((service) => service.id)).every((item) => item.sourceIds.every((id) => sourceById[id])));
});
