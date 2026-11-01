import { getQuestions, questions } from './data/questions.js';
import { scenarios } from './data/scenarios.js';
import { services, serviceById } from './data/services.js';
import { sourceById } from './data/sources.js';
import { ruleById } from './data/rules.js';
import { evaluate } from './logic/recommendations.js';

const root = document.querySelector('#app');
const nav = document.querySelector('.primary-nav');
const themeToggle = document.querySelector('#theme-toggle');
const state = {
  view: 'assessment',
  answers: {},
  questionIndex: 0,
  compare: new Set(['azure-sql-db', 'postgres-flex']),
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
  const label = {
    supported: 'Supported',
    unsupported: 'Not supported',
    conditional: 'Conditional',
    unknown: 'Unknown',
    'not-applicable': 'Not applicable'
  }[status] || 'Unknown';
  return `<span class="capability-chip status-${status}">${label}</span>`;
}

function sourceLinks(ids = []) {
  const entries = [...new Set(ids)].map((id) => sourceById[id]).filter(Boolean);
  return entries.map((source) => `<a href="${escapeHTML(source.url)}" target="_blank" rel="noreferrer">${escapeHTML(source.title)} ↗</a>`).join('');
}

function reviewDetails(service) {
  return `<details><summary>Versions, operations, recovery, networking and cost review</summary><dl class="profile-review">${Object.entries(service.reviewDimensions).map(([name, entry]) => `<div><dt>${escapeHTML(name.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`))} ${capabilityStatus(entry.status)}</dt><dd>${escapeHTML(entry.condition)} ${sourceLinks(entry.sourceIds)}</dd></div>`).join('')}</dl><p>Customer tasks to plan: schema changes, index/query tuning, version upgrades, capacity monitoring, least privilege, secret handling, auditing, restore/failover testing and incident response. Verify which engine/OS patching tasks Microsoft manages for this specific service.</p><p>Review snapshot: ${escapeHTML(service.verifiedOn)}. ${escapeHTML(service.lifecycle ? 'Consult the documented retirement notice.' : 'No retirement notice is recorded here; recheck current lifecycle guidance before deployment.')}</p></details>`;
}

function renderResults(result) {
  const candidates = result.candidates.map((item, index) => {
    const service = serviceById[item.serviceId];
    const capEntries = Object.entries(service.capabilities);
    return `<article class="result-card ${index === 0 && result.kind !== 'multi-store' ? 'result-card-primary' : ''}">
      <div class="result-card-top"><div><p class="eyebrow">${escapeHTML(service.family)} · ${escapeHTML(service.kind)}</p><h3>${escapeHTML(service.name)}</h3></div>${result.kind === 'multi-store' ? `<span class="candidate-tag">${escapeHTML(service.role)}</span>` : index === 0 ? '<span class="candidate-tag">Candidate</span>' : '<span class="candidate-tag candidate-alt">Alternative</span>'}</div>
      <p class="result-reason">${escapeHTML(item.reason)}</p>
      <dl class="service-facts"><div><dt>Data model</dt><dd>${escapeHTML(service.model)}</dd></div><div><dt>API / protocol</dt><dd>${escapeHTML(service.api)}</dd></div><div><dt>Role</dt><dd>${escapeHTML(service.role)}</dd></div></dl>
      ${item.caveat ? `<p class="caveat"><strong>Validation gate</strong> ${escapeHTML(item.caveat)}</p>` : ''}
      ${service.configurationConsiderations?.length ? `<details><summary>Configuration questions</summary><ul>${service.configurationConsiderations.map((text) => `<li>${escapeHTML(text)}</li>`).join('')}</ul></details>` : ''}
      ${service.caveats.length ? `<details><summary>Trade-offs and remaining work</summary><ul>${service.caveats.map((text) => `<li>${escapeHTML(text)}</li>`).join('')}</ul></details>` : ''}
      ${reviewDetails(service)}
      <div class="capability-list">${capEntries.map(([name, value]) => `<div class="capability-row"><span>${escapeHTML(name.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`))}</span>${capabilityStatus(value.status)}</div>`).join('')}</div>
      <div class="card-actions"><button class="button button-small" data-action="compare-add" data-service="${escapeHTML(service.id)}">Add to compare</button></div>
    </article>`;
  }).join('');
  const architecture = result.architecture?.length ? `<section class="result-section" aria-label="Architecture responsibilities"><h2>Architecture responsibilities</h2><p>Authoritative stores own the records or original files. Cached and indexed copies are derived roles, not additional sources of truth.</p><div class="architecture-grid">${result.architecture.map((item) => `<article class="architecture-node"><p class="eyebrow">${escapeHTML(item.role)}</p><h3>${escapeHTML(serviceById[item.serviceId]?.name || item.serviceId)}</h3><p>${escapeHTML(item.boundary)}</p></article>`).join('')}</div>${result.architectureLinks?.length ? `<ol class="architecture-flow" aria-label="Synchronisation and failure boundaries">${result.architectureLinks.map((link) => `<li><strong>${escapeHTML(serviceById[link.from].name)} <span aria-hidden="true">→</span><span class="sr-only"> to </span> ${escapeHTML(serviceById[link.to].name)}</strong><p>${escapeHTML(link.purpose)}</p><p>${escapeHTML(link.boundary)}</p></li>`).join('')}</ol>` : ''}<p class="small-note">This is a responsibility map, not an automatic integration. Independent stores are not automatically transactionally consistent.</p></section>` : '';
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
    ${candidates.length ? `<section class="result-grid" aria-label="Service candidates">${candidates}</section>` : result.kind === 'no-database-needed' ? `<section class="empty-state"><h2>No new store selected</h2><p>${state.answers.migrationIntent === 'keep' ? 'The existing database remains the source of truth; no migration or new store is inferred.' : 'Your stated requirement does not need persistent storage. Reassess if durable records or files become necessary.'}</p></section>` : '<section class="empty-state"><h2>No service selected yet</h2><p>Resolve the open questions below before treating a service as a fit.</p></section>'}
    ${result.decisions.length ? `<section class="result-section"><h2>Decision boundaries</h2><ul class="plain-list">${result.decisions.map((decision) => `<li>${escapeHTML(decision.outcome)}</li>`).join('')}</ul></section>` : ''}
    ${architecture}${exclusions}${unknowns}${changes}
    <section class="result-section"><h2>Cost, operations and recovery</h2><p>Level 1 is the platform shortlist; Level 2 is its configuration and design review. There is no numeric score, price estimate or capacity recommendation. Compare current regional compute, storage, throughput, backup, networking, transfer and operating costs using the <a href="https://azure.microsoft.com/en-us/pricing/calculator/" target="_blank" rel="noreferrer">Azure Pricing Calculator</a> and each service’s current price page.</p><p>HA is not backup or disaster recovery, and read replicas are not a complete recovery strategy. Verify retention, restore and application failover against written RPO/RTO targets. Authentication, managed identity, encryption/keys, RBAC, private access and auditing are service/configuration-specific; no common compliance guarantee is implied.</p></section>
    ${requirementsNotes}
    ${['scaleNotes', 'recoveryNotes', 'migrationDetails'].filter((id) => state.answers[id]?.trim()).map((id) => `<section class="result-section"><h2>${escapeHTML({ scaleNotes: 'Scale', recoveryNotes: 'Recovery', migrationDetails: 'Migration inventory' }[id])} note you recorded</h2><p>${escapeHTML(state.answers[id].trim())}</p><p class="small-note">Recorded for your review, not used to infer capacity, compatibility or recovery guarantees.</p></section>`).join('')}
    ${appliedRules}
    <section class="result-section"><h2>Evidence used</h2><div class="source-list">${references || '<span>More source verification is needed before a service claim can be made.</span>'}</div><p class="small-note">Sources were checked on 1 November 2026. A documented source does not establish that a feature is available in every region, tier, version or API.</p></section>`;
}

function serviceCard(service, compact = false) {
  const selected = state.compare.has(service.id);
  return `<article class="service-card">
    <div class="service-card-heading"><div><p class="eyebrow">${escapeHTML(service.family)} · ${escapeHTML(service.kind)}</p><h3>${escapeHTML(service.name)}</h3></div><span class="role-badge">${escapeHTML(service.role)}</span></div>
    ${service.aliases?.length ? `<p class="small-note">Also known as: ${service.aliases.map(escapeHTML).join(', ')}</p>` : ''}
    <p>${escapeHTML(service.summary)}</p>
    <dl class="service-facts"><div><dt>Model</dt><dd>${escapeHTML(service.model)}</dd></div><div><dt>API / protocol</dt><dd>${escapeHTML(service.api)}</dd></div></dl>
    ${service.lifecycle ? `<p class="lifecycle-note">${escapeHTML(service.lifecycle === 'retired-service' ? 'Retired service' : 'Retirement path')} · not recommended for new deployments</p>` : ''}
    ${!compact ? `<details><summary>Capabilities and caveats</summary><div class="capability-list">${Object.entries(service.capabilities).map(([name, value]) => `<div class="capability-row"><span>${escapeHTML(name.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`))}<small>${value.condition ? escapeHTML(value.condition) : ''}</small></span>${capabilityStatus(value.status)}</div>`).join('')}</div><ul>${service.caveats.map((text) => `<li>${escapeHTML(text)}</li>`).join('')}</ul><div class="source-list">${sourceLinks(service.sourceIds)}</div></details>` : ''}
    ${!compact ? reviewDetails(service) : ''}
    <label class="compare-toggle"><input type="checkbox" data-action="compare-toggle" data-service="${escapeHTML(service.id)}" ${selected ? 'checked' : ''} ${!selected && state.compare.size >= 3 ? 'disabled' : ''}><span>${selected ? 'In comparison' : state.compare.size >= 3 ? 'Comparison full — remove a service first' : 'Add to compare'}</span></label>
  </article>`;
}

function renderExplorer() {
  const families = ['All', ...new Set(services.map((service) => service.family))];
  const query = state.explorerQuery.toLocaleLowerCase();
  const visible = services.filter((service) =>
    (state.explorerFilter === 'All' || service.family === state.explorerFilter) &&
    `${service.name} ${service.family} ${service.model} ${service.role} ${service.api} ${(service.aliases || []).join(' ')} ${service.summary}`.toLocaleLowerCase().includes(query)
  );
  root.innerHTML = `<section class="view-heading"><div><p class="eyebrow">SERVICE EXPLORER · ROLES, NOT A FLAT RANKING</p><h1>Explore Azure Databases</h1><p class="lede">Browse engines, APIs, service models, caches, object stores, search indexes and analytics platforms as distinct roles.</p></div></section>
    <div class="explorer-tools"><label class="search-field">Search the catalogue<input id="service-search" type="search" value="${escapeHTML(state.explorerQuery)}" placeholder="Search name, model or role"></label><label>Service family<select id="family-filter">${families.map((family) => `<option ${state.explorerFilter === family ? 'selected' : ''}>${escapeHTML(family)}</option>`).join('')}</select></label><span class="small-note">${visible.length} services listed · select up to three to compare</span></div>
    <section class="service-grid">${visible.length ? visible.map((service) => serviceCard(service)).join('') : '<p class="empty-state">No services match these filters.</p>'}</section>`;
}

function renderCompare() {
  const selected = services.filter((service) => state.compare.has(service.id));
  const allCapabilities = [...new Set(selected.flatMap((service) => Object.keys(service.capabilities)))];
  const table = selected.length >= 2 ? `<div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable service comparison"><table class="comparison-table"><caption>Documented capability states; absence of a claim is not a negative claim.</caption><thead><tr><th scope="col">Capability</th>${selected.map((service) => `<th scope="col">${escapeHTML(service.name)}<small>${escapeHTML(service.model)}</small></th>`).join('')}</tr></thead><tbody>${allCapabilities.map((capability) => `<tr><th scope="row">${escapeHTML(capability.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`))}</th>${selected.map((service) => { const entry = service.capabilities[capability]; return `<td>${entry ? `${capabilityStatus(entry.status)}${entry.condition ? `<small>${escapeHTML(entry.condition)}</small>` : ''}` : capabilityStatus('unknown')}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>` : '<div class="empty-state"><h2>Select two or three services to compare</h2><p>Choose services in Explore or from a recommendation.</p></div>';
  root.innerHTML = `<section class="view-heading"><div><p class="eyebrow">SIDE-BY-SIDE · DOCUMENTED STATES, NOT SCORES</p><h1>Compare Services</h1><p class="lede">Conditional means a feature depends on a version, API, tier, region or configuration. Unknown is not the same as unsupported.</p></div></section>
    <div class="compare-picker">${services.map((service) => `<label><input type="checkbox" data-action="compare-toggle" data-service="${escapeHTML(service.id)}" ${state.compare.has(service.id) ? 'checked' : ''} ${!state.compare.has(service.id) && state.compare.size >= 3 ? 'disabled' : ''}>${escapeHTML(service.name)}</label>`).join('')}</div>
    ${table}
    <div class="small-note">For a production comparison, verify each candidate’s current feature matrix and the exact target region, engine version, tier, and configuration.</div>`;
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
    </section>
    <section class="result-section article-link-card"><p class="eyebrow">COMPANION ARTICLE</p><h2>Azure SQL, PostgreSQL, MySQL or Cosmos DB: How Do You Choose the Right Database on Azure?</h2><p>A practical, data-first guide to the engine and platform distinctions in this navigator.</p><a class="button button-small" href="./docs/article.html">Read the article →</a></section>`;
}

function complete() {
  state.result = evaluate(state.answers);
  render();
  focusHeading();
}

root.addEventListener('change', (event) => {
  const target = event.target;
  if (target.matches('[data-action="compare-toggle"]')) {
    const id = target.dataset.service;
    if (target.checked && state.compare.size < 3) state.compare.add(id);
    else if (!target.checked) state.compare.delete(id);
    else target.checked = false;
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
