import { getQuestions, questions } from './data/questions.js';
import { scenarios } from './data/scenarios.js';
import { services, serviceById } from './data/services.js';
import { sourceById, REVIEWED_LABEL } from './data/sources.js';
import { ruleById } from './data/rules.js';
import { evaluate } from './logic/recommendations.js';
import { families, familyFor } from './data/families.js';
import { profileFor, profileLabels } from './data/profiles.js';
import { capabilityFor, capabilitySections, capabilityStates, comparisonSections } from './data/capabilities.js';
import { guidanceFor, performanceGuidance } from './data/performance.js';

const root = document.querySelector('#app');
const nav = document.querySelector('.primary-nav');
const themeToggle = document.querySelector('#theme-toggle');
const state = {
  view: 'assessment',
  answers: {},
  questionIndex: 0,
  compare: new Set(['azure-sql-db', 'postgres-flex']),
  compareDifferences: false,
  explorerFilter: 'All',
  explorerQuery: '',
  result: null
};

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  try {
    localStorage.setItem('azure-database-navigator-theme', theme);
  } catch {
    // Theme persistence is optional; the application remains usable without storage.
  }
}

function initialTheme() {
  try {
    return localStorage.getItem('azure-database-navigator-theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function switchView(view) {
  state.view = view;
  for (const button of nav.querySelectorAll('[data-view]')) {
    const active = button.dataset.view === view;
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
  render();
  focusHeading();
}

function focusHeading() {
  const heading = root.querySelector('#question-title') || root.querySelector('h1');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }
}

function render() {
  if (state.view === 'assessment') return renderAssessment();
  if (state.view === 'explore') return renderExplorer();
  if (state.view === 'compare') return renderCompare();
  renderConcepts();
}

function renderAssessment() {
  const list = getQuestions(state.answers);
  if (state.result) {
    root.innerHTML = renderResults(state.result);
    return;
  }
  const question = list[Math.min(state.questionIndex, list.length - 1)];
  if (!question) {
    state.result = evaluate(state.answers);
    render();
    return;
  }
  const selected = question.multiple
    ? new Set(state.answers[question.id] || [])
    : new Set([state.answers[question.id] ?? 'unknown']);
  const progress = Math.round(((state.questionIndex + 1) / list.length) * 100);
  const scenarioOptions = scenarios.map((scenario) => `<option value="${escapeHTML(scenario.id)}">${escapeHTML(scenario.title)}</option>`).join('');
  const answersMarkup = question.freeText
    ? `<label class="free-text-answer" for="answer-${escapeHTML(question.id)}">${escapeHTML(question.placeholder || 'Optional notes')}<textarea id="answer-${escapeHTML(question.id)}" data-answer-text="${escapeHTML(question.id)}" rows="3" placeholder="${escapeHTML(question.placeholder || '')}">${escapeHTML(state.answers[question.id] || '')}</textarea></label>`
    : `<div class="answer-grid ${question.multiple ? 'answer-grid-multiple' : ''}" role="${question.multiple ? 'group' : 'radiogroup'}" aria-labelledby="question-title">
        ${question.options.map((option) => {
          const checked = selected.has(option.value) ? 'checked' : '';
          const type = question.multiple ? 'checkbox' : 'radio';
          return `<label class="answer-option"><input type="${type}" name="${escapeHTML(question.id)}" value="${escapeHTML(option.value)}" ${checked}><span class="answer-copy"><strong>${escapeHTML(option.label)}</strong></span></label>`;
        }).join('')}
      </div>`;
  root.innerHTML = `
    <section class="view-heading">
      <div class="heading-copy"><p class="eyebrow">Find My Database Options · REQUIREMENTS FIRST</p><h1>Which Azure database fits your application?</h1>
      <p class="lede">Tell us about your application and how it uses data. We'll help you explore suitable Azure database options and understand the trade-offs.</p></div>
      <label class="scenario-loader">Try a worked scenario
        <select id="scenario-select"><option value="">Choose an example…</option>${scenarioOptions}</select>
      </label>
    </section>
    <section class="assessment-panel" aria-labelledby="question-title">
      <div class="progress-row"><span>Question ${state.questionIndex + 1} of ${list.length}</span><span>${progress}%</span></div>
      <div class="progress-track" role="progressbar" aria-label="Assessment progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
      <div class="question-header"><p class="eyebrow">YOUR WORKLOAD</p><h2 id="question-title">${escapeHTML(question.title)}</h2><p>${escapeHTML(question.help)}</p></div>
      ${answersMarkup}
      <div class="assessment-controls">
        <button class="button button-quiet" data-action="back" ${state.questionIndex === 0 ? 'disabled' : ''}>← Back</button>
        <span class="step-hint">${question.multiple ? 'Select all that apply' : 'Choose one, or keep “Not sure yet”'}</span>
        <button class="button button-primary" data-action="continue">${state.questionIndex === list.length - 1 ? 'Show options' : 'Continue'} →</button>
      </div>
      <p class="privacy-note"><span aria-hidden="true">⌑</span> Your answers stay in this browser session; this site has no account, backend or analytics.</p>
    </section>
    <p class="small-note">Need a broader catalogue first? <button class="text-button" data-action="explore">Explore Azure Databases</button></p>`;
}

function capabilityStatus(status) {
  const label = capabilityStates[status]?.label;
  if (!label) throw new Error(`Capability state ${status} is not in the reviewed vocabulary`);
  return `<span class="capability-chip status-${status}">${label}</span>`;
}

const highlightKeys = ['relationalEngine', 'sqlServerEngine', 'documentModel', 'acidTransactions', 'horizontalScaling', 'multiRegionWrites', 'vectorSearch', 'pointInTimeRestore'];

function capabilityRows(service, keys) {
  return keys.map((key) => {
    const label = capabilitySections.flatMap((section) => section.capabilities).find((item) => item.key === key).label;
    const cell = capabilityFor(service.id, key);
    return `<div class="capability-row"><span>${escapeHTML(label)}<small>${escapeHTML(cell.summary)}</small></span>${capabilityStatus(cell.status)}</div>`;
  }).join('');
}

function capabilityProfile(service) {
  return capabilitySections.map((section) => {
    const rows = section.capabilities.map((capability) => {
      const cell = capabilityFor(service.id, capability.key);
      return `<div class="capability-row"><span>${escapeHTML(capability.label)}<small>${escapeHTML(cell.summary)}${cell.condition && cell.condition !== cell.summary ? ` ${escapeHTML(cell.status === 'needs-verification' ? `Verify: ${cell.condition}` : cell.condition)}` : ''}</small>${cell.sourceIds.length ? `<small class="profile-sources">${sourceLinks(cell.sourceIds)}</small>` : ''}</span>${capability.descriptive ? '' : capabilityStatus(cell.status)}</div>`;
    }).join('');
    return `<h4 class="capability-section-title">${escapeHTML(section.label)}</h4><div class="capability-list">${rows}</div>`;
  }).join('');
}

function sourceLinks(ids = []) {
  const entries = [...new Set(ids)].map((id) => sourceById[id]).filter(Boolean);
  return entries.map((source) => `<a href="${escapeHTML(source.url)}" target="_blank" rel="noreferrer">${escapeHTML(source.title)} ↗</a>`).join(' <span aria-hidden="true"> · </span> ');
}

function reviewDetails(service) {
  return `<details><summary>Service profile: what it is and how it differs</summary><dl class="profile-review">${Object.entries(profileFor(service)).map(([name, entry]) => `<div><dt>${escapeHTML(profileLabels[name])}</dt><dd>${escapeHTML(entry.text)} <span class="profile-sources">${sourceLinks(entry.sourceIds)}</span></dd></div>`).join('')}</dl><p>Reviewed ${escapeHTML(REVIEWED_LABEL)}. Capability states, conditions and sources are in “Capabilities by section” and Compare Services.</p></details>`;
}

function familyAttributes(service) {
  return `data-family="${familyFor(service).id}"`;
}

function renderArchitecture(result) {
  if (!result.architecture?.length) return '';
  const nodes = (items) => items.map((item) => `<article class="architecture-node node-${item.kind}" ${item.serviceIds.length ? familyAttributes(serviceById[item.serviceIds[0]]) : ''}>
    <p class="eyebrow">${escapeHTML(item.role)} · ${escapeHTML(item.kind)}${item.serviceIds.length ? ` · ${escapeHTML(familyFor(serviceById[item.serviceIds[0]]).label)}` : ''}</p>
    <h3>${escapeHTML(item.label)}</h3><p>${item.serviceIds.map((id) => escapeHTML(serviceById[id].name)).join(' OR ') || 'No new service selected'}</p>
    <p>${escapeHTML(item.boundary)}</p></article>`).join('');
  const label = (id) => result.architecture.find((node) => node.id === id)?.label || id;
  const sourceNodes = result.architecture.filter((node) => !['derived', 'cache'].includes(node.kind));
  const copies = result.architecture.filter((node) => ['derived', 'cache'].includes(node.kind));
  return `<section class="result-section" aria-label="Architecture responsibilities"><h2>Architecture responsibilities</h2>
    <figure class="architecture-diagram"><figcaption>One platform per authoritative role. Solid: original data; dashed: regenerable copies; double: retained store; dotted: unresolved. Links are design responsibilities, not implemented integration.</figcaption>
    <div class="diagram-lane">${nodes(sourceNodes)}</div>
    ${result.architectureLinks?.length ? `<div class="diagram-links" aria-hidden="true">${result.architectureLinks.map((link, index) => `<div class="diagram-edge"><span>${escapeHTML(label(link.from))}</span><svg viewBox="0 0 80 90" width="80" height="90" focusable="false"><defs><marker id="arrow-${index}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"/></marker></defs><path d="M 40 4 L 40 80" marker-end="url(#arrow-${index})"/></svg><strong>${escapeHTML(link.purpose)}</strong><span>${escapeHTML(label(link.to))}</span></div>`).join('')}</div>` : ''}
    <div class="diagram-lane">${nodes(copies)}</div></figure>
    ${result.architectureLinks?.length ? `<ol class="architecture-flow" aria-label="Accessible connections, synchronisation and failure boundaries">${result.architectureLinks.map((link) => `<li><strong>${escapeHTML(label(link.from))} → ${escapeHTML(label(link.to))}</strong><p>${escapeHTML(link.purpose)}</p><p>${escapeHTML(link.boundary)}</p></li>`).join('')}</ol>` : ''}
    <p>Independent stores are not automatically transactionally consistent. ${sourceLinks(['cache-aside', 'vector-selection'])}</p></section>`;
}

function renderResults(result) {
  const candidates = result.candidates.map((item, index) => {
    const service = serviceById[item.serviceId];
    return `<article ${familyAttributes(service)} class="result-card ${index === 0 && result.kind !== 'multi-store' ? 'result-card-primary' : ''}">
      <div class="result-card-top"><div><p class="eyebrow">${escapeHTML(familyFor(service).label)} · ${escapeHTML(service.kind)}</p><h3>${escapeHTML(service.name)}</h3></div>${result.kind === 'multi-store' ? `<span class="candidate-tag">${escapeHTML(service.role)}</span>` : index === 0 ? '<span class="candidate-tag tag-word">Candidate</span>' : '<span class="candidate-tag tag-word candidate-alt">Alternative</span>'}</div>
      <p class="result-reason">${escapeHTML(item.reason)}</p>
      <dl class="service-facts"><div><dt>Data model</dt><dd>${escapeHTML(service.model)}</dd></div><div><dt>API / protocol</dt><dd>${escapeHTML(service.api)}</dd></div><div><dt>Role</dt><dd>${escapeHTML(service.role)}</dd></div></dl>
      ${item.caveat ? `<p class="caveat"><strong>Validation gate</strong> ${escapeHTML(item.caveat)}</p>` : ''}
      ${service.configurationConsiderations?.length ? `<details><summary>Configuration questions</summary><ul>${service.configurationConsiderations.map((text) => `<li>${escapeHTML(text)}</li>`).join('')}</ul></details>` : ''}
      ${service.caveats.length ? `<details><summary>Trade-offs and remaining work</summary><ul>${service.caveats.map((text) => `<li>${escapeHTML(text)}</li>`).join('')}</ul></details>` : ''}
      ${reviewDetails(service)}
      <div class="capability-list" aria-label="Key capability states for ${escapeHTML(service.name)}">${capabilityRows(service, highlightKeys)}</div>
      <div class="card-actions"><button class="button button-small" data-action="compare-add" data-service="${escapeHTML(service.id)}">Add to compare</button></div>
    </article>`;
  }).join('');
  const architecture = renderArchitecture(result);
  const alsoAssess = result.alsoAssess?.length ? `<section class="result-section"><h2>Also assess — JSON does not exclude relational engines</h2>${result.alsoAssess.map((item) => `<p><strong>${escapeHTML(serviceById[item.serviceId].name)}</strong> ${escapeHTML(item.reason)} ${sourceLinks(item.sourceIds)}</p>`).join('')}</section>` : '';
  const retrieval = result.ruleIds.includes('vector-existing-first') || result.ruleIds.includes('search-separated-role');
  const guidanceIds = [...result.candidates.map((item) => item.serviceId), ...(retrieval && state.answers.existingService && result.architecture?.some((node) => node.kind === 'retained') ? [state.answers.existingService] : [])];
  const performance = `<section class="result-section"><h2>Performance review</h2><ul class="plain-list">${guidanceFor(guidanceIds, { retrieval }).map((item) => `<li>${escapeHTML(item.text)} ${sourceLinks(item.sourceIds)}</li>`).join('')}</ul></section>`;
  const exclusions = result.exclusions.length ? `<section class="result-section"><h2>Documented constraint</h2>${result.exclusions.map((item) => `<p class="exclusion"><strong>${escapeHTML(serviceById[item.serviceId]?.name || item.serviceId)} not shortlisted:</strong> ${escapeHTML(item.reason)} ${sourceLinks(item.sourceIds)}</p>`).join('')}</section>` : '';
  const unknowns = result.unknowns.length ? `<section class="result-section"><h2>Open questions</h2><ul class="plain-list">${result.unknowns.map((text) => `<li>${escapeHTML(text)}</li>`).join('')}</ul></section>` : '';
  const changes = result.changes.length ? `<section class="result-section"><h2>What would change this result?</h2><ul class="plain-list">${result.changes.map((text) => `<li>${escapeHTML(text)}</li>`).join('')}</ul></section>` : '';
  const references = sourceLinks(result.sourceIds);
  const appliedRules = result.ruleIds?.length ? `<details class="result-section"><summary>Decision rules applied (${result.ruleIds.length})</summary><ul class="plain-list">${result.ruleIds.map((id) => { const rule = ruleById[id]; return rule ? `<li><strong>${escapeHTML(rule.id)}</strong> — ${escapeHTML(rule.conditions)} Configuration: ${escapeHTML(rule.configuration)} ${sourceLinks(rule.sourceIds)}</li>` : ''; }).join('')}</ul></details>` : '';
  const requirementsNotes = state.answers.requirementsNotes?.trim() ? `<section class="result-section"><h2>Compatibility note you recorded</h2><p>${escapeHTML(state.answers.requirementsNotes.trim())}</p><p class="small-note">This note is only used in this browser session; it is not transmitted or saved.</p></section>` : '';
  const requirements = Object.entries(state.answers).filter(([id]) => !questions.find((question) => question.id === id)?.freeText).map(([id, values]) => {
    const question = questions.find((item) => item.id === id);
    if (!question) return '';
    const labels = (Array.isArray(values) ? values : [values]).map((value) => question.options.find((option) => option.value === value)?.label || value);
    return `<div><dt>${escapeHTML(question.title)}</dt><dd>${labels.map(escapeHTML).join('; ')}</dd></div>`;
  }).join('');
  return `<section class="view-heading results-heading"><div><p class="eyebrow">ASSESSMENT RESULT · ${escapeHTML(result.kind.replaceAll('-', ' ').toUpperCase())}</p><h1>${escapeHTML(result.title)}</h1><p class="lede">These are candidates based on the answers you gave. Confirm documented requirements and the current service configuration before making a production decision.</p></div></section>
    <div class="results-actions"><button class="button button-quiet" data-action="edit">← Edit answers</button><button class="button button-quiet" data-action="restart">Start again</button></div>
    <details class="requirements-summary"><summary>Requirements used and recorded</summary><p>Workload, data model/access pattern, compatibility, confirmed source roles and transaction requirements influence the shortlist. Scale, priorities, geography, security and recovery remain configuration-review inputs, not sizing or compliance claims.</p><dl class="profile-review">${requirements || '<div><dt>Requirements</dt><dd>No answers supplied.</dd></div>'}</dl></details>
    ${candidates.length ? `<section class="result-grid" aria-label="Service candidates">${candidates}</section>` : result.kind === 'no-database-needed' ? `<section class="empty-state"><h2>No new store selected</h2><p>${state.answers.migrationIntent === 'keep' || result.architecture?.some((node) => node.kind === 'retained') ? 'The existing database remains the source of truth; no migration or new store is inferred. Test the required retrieval in that store.' : 'Your stated requirement does not need persistent storage. Reassess if durable records or files become necessary.'}</p></section>` : '<section class="empty-state"><h2>No service selected yet</h2><p>Resolve the open questions below before treating a service as a fit.</p></section>'}
    ${result.decisions.length ? `<section class="result-section"><h2>Decision boundaries</h2><ul class="plain-list">${result.decisions.map((decision) => `<li>${escapeHTML(decision.outcome)}</li>`).join('')}</ul></section>` : ''}
    ${architecture}${alsoAssess}${exclusions}${unknowns}${changes}${performance}
    <section class="result-section"><h2>Cost, operations and recovery</h2><p>Level 1 is the platform shortlist; Level 2 is its configuration and design review. There is no numeric score, price estimate or capacity recommendation. Compare current regional compute, storage, throughput, backup, networking, transfer and operating costs using the <a href="https://azure.microsoft.com/en-us/pricing/calculator/" target="_blank" rel="noreferrer">Azure Pricing Calculator</a> and each service’s current price page.</p><p>HA is not backup or disaster recovery, and read replicas are not a complete recovery strategy. Verify retention, restore and application failover against written RPO/RTO targets. Authentication, managed identity, encryption/keys, RBAC, private access and auditing are service/configuration-specific; no common compliance guarantee is implied.</p></section>
    ${requirementsNotes}
    ${['scaleNotes', 'recoveryNotes', 'migrationDetails'].filter((id) => state.answers[id]?.trim()).map((id) => `<section class="result-section"><h2>${escapeHTML({ scaleNotes: 'Scale', recoveryNotes: 'Recovery', migrationDetails: 'Migration inventory' }[id])} note you recorded</h2><p>${escapeHTML(state.answers[id].trim())}</p><p class="small-note">Recorded for your review, not used to infer capacity, compatibility or recovery guarantees.</p></section>`).join('')}
    ${appliedRules}
    <section class="result-section"><h2>Evidence used</h2><div class="source-list">${references || '<span>More source verification is needed before a service claim can be made.</span>'}</div><p class="small-note">Sources were checked on 1 November 2026. A documented source does not establish that a feature is available in every region, tier, version or API.</p></section>`;
}

function serviceCard(service, compact = false) {
  const selected = state.compare.has(service.id);
  return `<article class="service-card" ${familyAttributes(service)}>
    <div class="service-card-heading"><div><p class="eyebrow">${escapeHTML(familyFor(service).label)} · ${escapeHTML(service.kind)}</p><h3>${escapeHTML(service.name)}</h3></div><span class="role-badge">${escapeHTML(service.role)}</span></div>
    ${service.aliases?.length ? `<p class="small-note">Also known as: ${service.aliases.map(escapeHTML).join(', ')}</p>` : ''}
    <p>${escapeHTML(service.summary)}</p>
    <dl class="service-facts"><div><dt>Model</dt><dd>${escapeHTML(service.model)}</dd></div><div><dt>API / protocol</dt><dd>${escapeHTML(service.api)}</dd></div></dl>
    ${service.lifecycle ? `<p class="lifecycle-note">${escapeHTML(service.lifecycle === 'retired-service' ? 'Retired service' : 'Retirement path')} · not recommended for new deployments</p>` : ''}
    ${!compact ? `<details><summary>Capabilities by section</summary>${capabilityProfile(service)}</details><details><summary>Trade-offs and caveats</summary><ul>${service.caveats.map((text) => `<li>${escapeHTML(text)}</li>`).join('')}</ul><div class="source-list">${sourceLinks(service.sourceIds)}</div></details>` : ''}
    ${!compact ? reviewDetails(service) : ''}
    <label class="compare-toggle"><input type="checkbox" data-action="compare-toggle" data-service="${escapeHTML(service.id)}" ${selected ? 'checked' : ''} ${!selected && state.compare.size >= 3 ? 'disabled' : ''}><span>${selected ? 'In comparison' : state.compare.size >= 3 ? 'Comparison full — remove a service first' : 'Add to compare'}</span></label>
  </article>`;
}

function renderExplorer() {
  const familyOptions = ['All', ...families.map((family) => family.label)];
  const query = state.explorerQuery.toLocaleLowerCase();
  const visible = services.filter((service) =>
    (state.explorerFilter === 'All' || familyFor(service).label === state.explorerFilter) &&
    `${service.name} ${service.family} ${service.model} ${service.role} ${service.api} ${(service.aliases || []).join(' ')} ${service.summary}`.toLocaleLowerCase().includes(query)
  );
  root.innerHTML = `<section class="view-heading"><div><p class="eyebrow">SERVICE EXPLORER · ROLES, NOT A FLAT RANKING</p><h1>Explore Azure Databases</h1><p class="lede">Browse engines, APIs, service models, caches, object stores, search indexes and analytics platforms as distinct roles.</p></div></section>
    <div class="explorer-tools"><label class="search-field">Search the catalogue<input id="service-search" type="search" value="${escapeHTML(state.explorerQuery)}" placeholder="Search name, model or role"></label><label>Service family<select id="family-filter">${familyOptions.map((family) => `<option ${state.explorerFilter === family ? 'selected' : ''}>${escapeHTML(family)}</option>`).join('')}</select></label><span class="small-note">${visible.length} services listed · select up to three to compare</span></div>
    ${visible.length ? families.map((family) => { const members = visible.filter((service) => familyFor(service).id === family.id); return members.length ? `<section class="family-section" data-family="${family.id}"><h2>${escapeHTML(family.label)}</h2><div class="service-grid">${members.map((service) => serviceCard(service)).join('')}</div></section>` : ''; }).join('') : '<p class="empty-state">No services match these filters.</p>'}`;
}

function comparisonCell(cell, service, descriptive) {
  const detail = [cell.condition && cell.condition !== cell.summary ? `<p>${escapeHTML(cell.status === 'needs-verification' ? `Verify: ${cell.condition}` : cell.condition)}</p>` : '', cell.sourceIds.length ? `<p class="cell-sources">${sourceLinks(cell.sourceIds)}</p>` : ''].join('');
  return `<td role="cell" data-service="${escapeHTML(service.name)}" class="cell-${escapeHTML(cell.status)}">${descriptive ? '' : capabilityStatus(cell.status)}<p class="cell-summary">${escapeHTML(cell.summary)}</p>${detail ? `<details class="cell-detail"><summary>${cell.status === 'needs-verification' ? 'What to verify' : cell.condition && cell.condition !== cell.summary ? 'Conditions and sources' : 'Sources'}<span class="sr-only"> for ${escapeHTML(service.name)}</span></summary>${detail}</details>` : ''}</td>`;
}

function comparisonMarkup(selected) {
  const sameRow = (row) => row.cells.every((cell) => row.descriptive ? cell.summary === row.cells[0].summary : cell.status === row.cells[0].status);
  return comparisonSections(selected).map((section) => {
    const rows = state.compareDifferences ? section.rows.filter((row) => !sameRow(row)) : section.rows;
    const hidden = section.hiddenRows.length ? `<p class="small-note compare-hidden">Not applicable to any selected service: ${section.hiddenRows.map(escapeHTML).join(', ')}.</p>` : '';
    if (!rows.length) return `<section class="compare-section" aria-labelledby="compare-${section.id}"><h2 id="compare-${section.id}">${escapeHTML(section.label)}</h2><p class="small-note">${state.compareDifferences && section.rows.length ? 'No differences between the selected services in this section.' : 'No capability in this section applies to the selected services.'}</p>${hidden}</section>`;
    return `<section class="compare-section" aria-labelledby="compare-${section.id}"><h2 id="compare-${section.id}">${escapeHTML(section.label)}</h2><p class="compare-intro">${escapeHTML(section.intro)}</p>
      <div class="table-wrap" tabindex="0" role="region" aria-label="${escapeHTML(section.label)} comparison; scroll horizontally if needed"><table role="table" class="comparison-table compare-cols-${selected.length}"><caption class="sr-only">${escapeHTML(section.label)}: ${selected.map((service) => escapeHTML(service.name)).join(' versus ')}</caption>
      <thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col">Capability</th>${selected.map((service) => `<th role="columnheader" scope="col" ${familyAttributes(service)}>${escapeHTML(service.name)}<small>${escapeHTML(familyFor(service).label)}</small></th>`).join('')}</tr></thead>
      <tbody role="rowgroup">${rows.map((row) => `<tr role="row"><th role="rowheader" scope="row">${escapeHTML(row.label)}</th>${row.cells.map((cell, index) => comparisonCell(cell, selected[index], row.descriptive)).join('')}</tr>`).join('')}</tbody></table></div>${hidden}</section>`;
  }).join('');
}

function renderCompare() {
  const selected = services.filter((service) => state.compare.has(service.id));
  const body = selected.length >= 2 ? comparisonMarkup(selected) : '<div class="empty-state"><h2>Select two or three services to compare</h2><p>Choose services below, in Explore, or from a recommendation.</p></div>';
  const picker = families.map((family) => {
    const members = services.filter((service) => familyFor(service).id === family.id);
    return members.length ? `<fieldset ${`data-family="${family.id}"`}><legend>${escapeHTML(family.label)}</legend>${members.map((service) => `<label><input type="checkbox" data-action="compare-toggle" data-service="${escapeHTML(service.id)}" ${state.compare.has(service.id) ? 'checked' : ''} ${!state.compare.has(service.id) && state.compare.size >= 3 ? 'disabled' : ''}>${escapeHTML(service.name)}</label>`).join('')}</fieldset>` : '';
  }).join('');
  root.innerHTML = `<section class="view-heading"><div><p class="eyebrow">SIDE-BY-SIDE · DOCUMENTED STATES, NOT SCORES</p><h1>Compare Services</h1><p class="lede">Compare two or three services capability by capability. Each cell gives a documented state, a short explanation and its official source.</p></div></section>
    <details class="compare-picker-wrap" ${selected.length < 2 || state.comparePickerOpen ? 'open' : ''}><summary>Choose services (${selected.length} of 3 selected${selected.length ? `: ${selected.map((service) => escapeHTML(service.name)).join(', ')}` : ''})</summary><div class="compare-picker">${picker}</div></details>
    <dl class="comparison-legend" aria-label="Capability states">${Object.entries(capabilityStates).map(([status, item]) => `<div><dt>${capabilityStatus(status)}</dt><dd>${escapeHTML(item.meaning)}</dd></div>`).join('')}</dl>
    ${selected.length >= 2 ? `<label class="compare-filter"><input type="checkbox" data-action="compare-differences" ${state.compareDifferences ? 'checked' : ''}> Show only rows where the documented states differ</label>` : ''}
    ${body}
    <p class="small-note">Reviewed ${escapeHTML(REVIEWED_LABEL)}. A documented capability still needs checking against your target region, tier, engine version and configuration. Billing rows describe what to model, not prices.</p>`;
}

function renderConcepts() {
  root.innerHTML = `<section class="view-heading"><div><p class="eyebrow">LEARN THE CONCEPTS</p><h1>Learn the Concepts</h1><p class="lede">Choose the data role before the service. Start with what the application must do with data. Service names are not interchangeable architectures.</p></div></section>
    <section class="concept-grid">
      <article class="concept-card"><p class="eyebrow">01 · TRANSACTIONS</p><h2>Relational data</h2><p>Related records, joins, constraints and atomic changes often point to a relational model. SQL Server and PostgreSQL are different engines, even when both speak SQL.</p><p>Azure SQL Database, Managed Instance and SQL Server on VMs differ in service scope and operating responsibility. Pick based on validated features, not programming language.</p></article>
      <article class="concept-card"><p class="eyebrow">02 · DOCUMENTS &amp; DISTRIBUTION</p><h2>Flexible does not mean requirement-free</h2><p>JSON can live in relational engines too. A distributed document database needs deliberate partitioning, transaction boundaries, consistency choices, region design and cost review.</p><p>Cosmos DB APIs and Azure DocumentDB are distinct products and interfaces. A driver or wire protocol is not a complete feature-parity guarantee.</p></article>
      <article class="concept-card"><p class="eyebrow">03 · MIGRATION</p><h2>Compatibility is an inventory</h2><p>Record engine version, drivers, extensions, jobs, instance features, collations, SQL modes, plugins, scheduled tasks and operational dependencies. Then test them against the exact target.</p><p>For PostgreSQL, check the extension allow-list. A MariaDB app moving to MySQL needs validation; service retirement does not retire the MariaDB engine.</p></article>
      <article class="concept-card"><p class="eyebrow">04 · MULTI-STORE</p><h2>Separate source from derived data</h2><p>Files, search indexes, caches, transactions and analytics can have different owners. Make sync lag, invalidation, rebuild, failure and recovery boundaries explicit.</p><p>AI and RAG do not automatically require a vector database. Use vector search only when similarity retrieval is a demonstrated requirement.</p></article>
      <article class="concept-card"><p class="eyebrow">05 · RECOVERY</p><h2>Write down RPO and RTO</h2><p>Recovery Point Objective (RPO) is the amount of recent data the business can afford to lose. Recovery Time Objective (RTO) is how long the service may be unavailable.</p><p>Translate each target into backup retention, restore tests, high availability, cross-region recovery, network and application failover. Check tier and region-specific capabilities; no service name guarantees a target.</p></article>
      <article class="concept-card"><p class="eyebrow">06 · COST &amp; OPERATIONS</p><h2>Compare drivers, not imaginary totals</h2><p>Cost can depend on compute, storage, throughput, backup, replicas, data transfer, licensing and operational effort. Gather real usage and use current regional prices.</p><p>This navigator does not guess capacity, quote prices, or promise compliance. More control usually shifts more maintenance and recovery work to your team.</p></article>
      <article class="concept-card"><p class="eyebrow">07 · PERFORMANCE</p><h2>Measure the workload, not the service maximum</h2>${performanceGuidance.map((item) => `<p>${escapeHTML(item.text)} ${sourceLinks(item.sourceIds)}</p>`).join('')}</article>
    </section>
    <section class="result-section article-link-card"><p class="eyebrow">COMPANION ARTICLE</p><h2>Azure SQL, PostgreSQL, MySQL or Cosmos DB: How Do You Choose the Right Database on Azure?</h2><p>A practical, data-first guide to the engine and platform distinctions in this navigator.</p><a class="button button-small" href="./docs/article.html">Read the article →</a></section>`;
}

function complete() {
  state.result = evaluate(state.answers);
  render();
  focusHeading();
}

root.addEventListener('toggle', (event) => {
  if (event.target.matches?.('.compare-picker-wrap')) state.comparePickerOpen = event.target.open;
}, true);

root.addEventListener('change', (event) => {
  const target = event.target;
  if (target.matches('[data-action="compare-differences"]')) {
    state.compareDifferences = target.checked;
    renderCompare();
    root.querySelector('[data-action="compare-differences"]')?.focus();
    return;
  }
  if (target.matches('[data-action="compare-toggle"]')) {
    const id = target.dataset.service;
    if (target.checked && state.compare.size < 3) state.compare.add(id);
    else if (!target.checked) state.compare.delete(id);
    else target.checked = false;
    if (state.view === 'compare') state.comparePickerOpen = true;
    if (state.view === 'explore' || state.view === 'compare') {
      render();
      root.querySelector(`[data-action="compare-toggle"][data-service="${id}"]`)?.focus();
    }
    return;
  }
  if (target.matches('input[name]')) {
    const question = getQuestions(state.answers).find((item) => item.id === target.name);
    if (question?.multiple) {
      const current = new Set(state.answers[question.id] || []);
      if (target.checked && target.value === 'unknown') current.clear();
      if (target.checked && target.value !== 'unknown') current.delete('unknown');
      if (target.checked) current.add(target.value);
      else current.delete(target.value);
      state.answers[question.id] = [...current];
      for (const input of root.querySelectorAll(`input[name="${question.id}"]`)) input.checked = current.has(input.value);
    } else state.answers[target.name] = target.value;
    const visibleIds = new Set(getQuestions(state.answers).map((item) => item.id));
    for (const id of Object.keys(state.answers)) {
      if (!visibleIds.has(id)) delete state.answers[id];
    }
  } else if (target.id === 'scenario-select' && target.value) {
    const scenario = scenarios.find((item) => item.id === target.value);
    if (scenario) {
      state.answers = structuredClone(scenario.answers);
      state.questionIndex = 0;
      state.result = evaluate(state.answers);
      renderAssessment();
      focusHeading();
    }
  } else if (target.id === 'family-filter') {
    state.explorerFilter = target.value;
    renderExplorer();
    root.querySelector('#family-filter').focus();
  }
});

root.addEventListener('input', (event) => {
  if (event.target.id === 'service-search') {
    state.explorerQuery = event.target.value;
    renderExplorer();
    const search = root.querySelector('#service-search');
    search.focus();
    search.setSelectionRange(search.value.length, search.value.length);
  } else if (event.target.matches('[data-answer-text]')) {
    state.answers[event.target.dataset.answerText] = event.target.value;
  }
});

root.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'back') {
    state.questionIndex = Math.max(0, state.questionIndex - 1);
    renderAssessment();
    focusHeading();
  } else if (action === 'continue') {
    const list = getQuestions(state.answers);
    if (state.questionIndex < list.length - 1) {
      state.questionIndex += 1;
      renderAssessment();
      focusHeading();
    } else complete();
  } else if (action === 'restart') {
    state.answers = {};
    state.questionIndex = 0;
    state.result = null;
    renderAssessment();
    focusHeading();
  } else if (action === 'edit') {
    state.result = null;
    state.questionIndex = 0;
    renderAssessment();
    focusHeading();
  } else if (action === 'compare-add') {
    const id = button.dataset.service;
    if (state.compare.size < 3 || state.compare.has(id)) state.compare.add(id);
    switchView('compare');
  } else if (action === 'explore') switchView('explore');
});

nav.addEventListener('click', (event) => {
  const button = event.target.closest('[data-view]');
  if (button) switchView(button.dataset.view);
});

themeToggle.addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

setTheme(initialTheme());
render();
