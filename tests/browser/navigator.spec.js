import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { scenarios } from '../../src/data/scenarios.js';
import { evaluate } from '../../src/logic/recommendations.js';
import { serviceById } from '../../src/data/services.js';

const heading = (page) => page.locator('#question-title');
const next = (page) => page.locator('[data-action="continue"]');

async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

test.beforeEach(async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.url().startsWith('http://127.0.0.1:4187/') && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.addInitScript((theme) => localStorage.setItem('azure-database-navigator-theme', theme), testInfo.project.metadata.theme);
  await page.goto('./');
  await expect(heading(page)).toBeVisible();
  page.browserErrors = errors;
});

test.afterEach(async ({ page }) => {
  expect(page.browserErrors).toEqual([]);
  await noOverflow(page);
});

test('default, keyboard focus, theme, reduced motion and rendered documentation', async ({ page }, testInfo) => {
  await expect(page.locator('#app h1')).toHaveText('Which Azure database fits your application?');
  for (const label of ['Find My Database Options', 'Explore Azure Databases', 'Compare Services', 'Learn the Concepts']) {
    await expect(page.getByRole('button', { name: label, exact: true }).first()).toBeVisible();
  }
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await expect(page.locator('html')).toHaveAttribute('data-theme', testInfo.project.metadata.theme);
  expect(await page.locator('.answer-copy strong').first().evaluate((element) => ({ answer: getComputedStyle(element).color, body: getComputedStyle(document.body).color }))).toEqual(testInfo.project.metadata.theme === 'dark' ? { answer: 'rgb(232, 238, 245)', body: 'rgb(232, 238, 245)' } : { answer: 'rgb(23, 40, 62)', body: 'rgb(23, 40, 62)' });
  await page.getByRole('button', { name: `Switch to ${testInfo.project.metadata.theme === 'dark' ? 'light' : 'dark'} theme` }).click();
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['azure-database-navigator-theme']);
  expect(await page.locator('.progress-track span').evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThanOrEqual(0.00001);
  await page.getByRole('link', { name: 'Sources & method' }).click();
  await expect(page).toHaveURL(/\/azure-database-navigator\/docs\/sources\.html$/);
  await expect(page.getByRole('heading', { name: 'Source register', exact: true })).toBeVisible();
});

test('adaptive assessment, back, edit, restart and removal of hidden answers', async ({ page }) => {
  await page.getByRole('radio', { name: 'Move or modernise an existing database' }).check();
  await next(page).click();
  await expect(heading(page)).toBeFocused();
  await page.getByRole('radio', { name: 'Yes, durable records or files must be kept' }).check();
  await next(page).click();
  await page.getByRole('radio', { name: 'Related records, joins, constraints or business transactions', exact: true }).check();
  await next(page).click();
  for (let step = 0; step < 10 && !(await page.locator('input[name="accessPattern"]').count()); step++) await next(page).click();
  await page.getByRole('radio', { name: 'Joins, constraints or changes spanning related records' }).check();
  await next(page).click();
  // Optional workload follow-ups may precede the migration engine inventory.
  for (let step = 0; step < 25 && !(await page.locator('input[name="engine"]').count()); step++) await next(page).click();
  await page.getByRole('radio', { name: 'PostgreSQL', exact: true }).check();
  await next(page).click();
  for (let step = 0; step < 25 && !(await page.locator('input[name="constraints"]').count()); step++) await next(page).click();
  await page.getByRole('checkbox', { name: 'A named PostgreSQL extension or server feature' }).check();
  await page.locator('[data-action="back"]').click();
  for (let step = 0; step < 10 && !(await page.locator('input[name="engine"]').count()); step++) await page.locator('[data-action="back"]').click();
  await expect(page.getByRole('radio', { name: 'PostgreSQL', exact: true })).toBeChecked();
  await next(page).click();
  for (let step = 0; step < 10 && !(await page.locator('input[name="constraints"]').count()); step++) await next(page).click();
  await expect(page.getByRole('checkbox', { name: 'A named PostgreSQL extension or server feature' })).toBeChecked();
  for (let step = 0; step < 30 && await next(page).count(); step++) await next(page).click();
  await expect(page.locator('.result-card h3')).toContainText(['Azure Database for PostgreSQL Flexible Server']);
  await page.locator('[data-action="edit"]').click();
  await expect(heading(page)).toHaveText('What are you trying to build or change?');
  await page.getByRole('radio', { name: 'A new application or service' }).check();
  for (let step = 0; step < 30 && await next(page).count(); step++) await next(page).click();
  await expect(page.locator('.result-card h3')).toContainText(['Azure SQL Database', 'Azure Database for PostgreSQL Flexible Server']);
  await page.locator('[data-action="restart"]').click();
  await expect(heading(page)).toBeFocused();
  await expect(page.getByRole('radio', { name: 'Not sure yet', exact: true })).toBeChecked();
  expect(new URL(page.url()).search).toBe('');
});

test('all worked scenarios render the correct candidates and multi-store boundaries', async ({ page }) => {
  for (const scenario of scenarios) {
    await page.locator('#scenario-select').selectOption(scenario.id);
    const result = evaluate(scenario.answers);
    await expect(page.locator('#app h1')).toHaveText(result.title);
    await expect(page.locator('.result-card h3')).toHaveText(result.candidates.map((item) => serviceById[item.serviceId].name));
    await expect(page.locator('#app h1')).toBeFocused();
    if (result.kind === 'multi-store') {
      await expect(page.getByRole('heading', { name: 'Architecture responsibilities' })).toBeVisible();
      await expect(page.locator('.architecture-node')).toHaveCount(result.architecture.length);
      await expect(page.locator('.architecture-diagram')).toBeVisible();
      await expect(page.locator('.diagram-edge svg')).toHaveCount(result.architectureLinks.length);
      await expect(page.locator('.architecture-flow')).toBeVisible();
      await expect(page.locator('.architecture-flow')).toContainText(/failure|outage|rebuild/i);
    }
    await noOverflow(page);
    await page.locator('[data-action="restart"]').click();
  }
});

test('explorer filtering, aliases, two-to-three service comparison and concepts', async ({ page }) => {
  await page.getByRole('button', { name: 'Explore Azure Databases', exact: true }).first().click();
  await expect(page.locator('#app h1')).toBeFocused();
  await expect(page.locator('.service-card')).toHaveCount(24);
  await page.getByRole('searchbox').pressSequentially('vCore');
  await expect(page.locator('.service-card h3')).toHaveText(['Azure DocumentDB']);
  await expect(page.getByRole('searchbox')).toBeFocused();
  await page.getByRole('searchbox').fill('');
  await expect(page.locator('.family-section')).toHaveCount(6);
  await page.locator('#family-filter').selectOption('Caching');
  await expect(page.locator('.service-card')).toHaveCount(2);
  await expect(page.locator('#family-filter')).toBeFocused();
  await page.getByRole('button', { name: 'Compare Services', exact: true }).click();
  await expect(page.locator('.comparison-table')).toBeVisible();
  await page.locator('.compare-picker input[data-service="azure-sql-mi"]').check();
  await expect(page.locator('.compare-picker input:checked')).toHaveCount(3);
  await expect(page.locator('.compare-picker input[data-service="mysql-flex"]')).toBeDisabled();
  await page.locator('.compare-picker input[data-service="azure-sql-mi"]').uncheck();
  await page.locator('.compare-picker input[data-service="postgres-flex"]').uncheck();
  await expect(page.getByRole('heading', { name: 'Select two or three services to compare' })).toBeVisible();
  await page.locator('.compare-picker input[data-service="mysql-flex"]').check();
  await page.locator('.table-wrap').focus();
  await expect(page.locator('.table-wrap')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await page.getByRole('button', { name: 'Learn the Concepts', exact: true }).click();
  await expect(page.locator('.concept-card')).toHaveCount(7);
  await page.getByRole('link', { name: 'Read the article' }).click();
  await expect(page).toHaveURL(/\/azure-database-navigator\/docs\/article\.html$/);
  await expect(page.locator('article img')).toHaveCount(2);
  expect(await page.locator('article img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
});

test('WCAG AA automated checks on assessment, explorer, comparison, concepts and multi-store result', async ({ page }) => {
  const audit = async () => {
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) }))).toEqual([]);
  };
  await audit();
  await page.locator('#scenario-select').selectOption('rag');
  await audit();
  for (const view of ['explore', 'compare', 'concepts']) {
    await page.locator(`.primary-nav [data-view="${view}"]`).click();
    await audit();
  }
});

test('search branching reaches authoritative-state model and does not infer roles from unknown', async ({ page }) => {
  await page.getByRole('radio', { name: 'Search documents or retrieve AI context', exact: true }).check();
  await next(page).click();
  await page.getByRole('radio', { name: 'Yes, durable records or files must be kept', exact: true }).check();
  await next(page).click();
  await page.getByRole('radio', { name: 'Full-text, relevance or vector retrieval', exact: true }).check();
  for (let step = 0; step < 30 && !(await page.locator('input[name="sourceFiles"]').count()); step++) await next(page).click();
  await page.getByRole('radio', { name: 'No, source data already lives elsewhere', exact: true }).check();
  await next(page).click();
  await page.getByRole('radio', { name: 'Yes, this data must be authoritative and recoverable', exact: true }).check();
  await next(page).click();
  await expect(heading(page)).toHaveText('What model does the authoritative application state need?');
  await page.getByRole('radio', { name: 'Keep an existing authoritative store', exact: true }).check();
  await next(page).click();
  await expect(page.locator('.result-card h3')).toHaveCount(0);
  await expect(page.locator('#app')).toContainText('retained; not selected or migrated by this tool');
});

test('an engine-free assessment and restart are fully keyboard operable', async ({ page }) => {
  const tabTo = async (selector) => {
    for (let step = 0; step < 100; step++) {
      await page.keyboard.press('Tab');
      if (await page.locator(`${selector}:focus`).count()) return;
    }
    throw new Error(`Keyboard could not reach ${selector}`);
  };
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  for (const name of ['workload', 'persistence', 'dataShape']) {
    await tabTo(`input[name="${name}"]`);
    await page.keyboard.press('ArrowDown');
    await tabTo('[data-action="continue"]');
    await page.keyboard.press('Enter');
    await expect(heading(page)).toBeFocused();
  }
  for (let step = 0; step < 35 && await next(page).count(); step++) {
    await tabTo('[data-action="continue"]');
    await page.keyboard.press('Enter');
  }
  await expect(page.locator('#app h1')).toBeFocused();
  await expect(page.locator('.result-card h3')).toHaveText(['Azure SQL Database', 'Azure Database for PostgreSQL Flexible Server']);
  await tabTo('[data-action="restart"]');
  await page.keyboard.press('Enter');
  await expect(heading(page)).toBeFocused();
});
