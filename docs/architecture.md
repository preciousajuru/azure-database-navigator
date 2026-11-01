# Architecture and build

Architecture data describes roles independently from candidates. A transactional record node can carry SQL Database OR PostgreSQL (or a narrower engine-constrained list), but represents ONE store. Retained stores are visible with no selected platform or inferred migration. Document roles reuse document assessment rules; unknown roles are unresolved. Links use role IDs and carry design/failure notes, not a fabricated synchronisation implementation.

Azure Database Navigator is a client-only static application. It does not call Azure, an AI model, a backend, telemetry, a database or a runtime third-party service. Assessment state is in page memory and is never added to URLs. Only the theme preference is stored in local storage.

## Independent modules

| Concern | Source |
|---|---|
| Service/API/engine catalogue and capability states | `src/data/services.js` |
| Service-specific profiles / comparison dimensions | `src/data/profiles.js`, `src/data/comparison.js` |
| Family taxonomy / contrast-tested theme tokens | `src/data/families.js` |
| Performance concept / relevant result guidance | `src/data/performance.js` |
| Dated evidence register | `src/data/sources.js` |
| Assessment questions and applicability predicates | `src/data/questions.js` |
| Stable decision rules, evidence boundaries and tests | `src/data/rules.js` |
| Worked acceptance scenarios | `src/data/scenarios.js` |
| Deterministic recommendation policy | `src/logic/recommendations.js` |
| Rendering, events, keyboard focus and in-memory state | `src/app.js` |
| Responsive layout, themes and reduced motion | `styles.css` |

The policy consumes categorical requirements and returns a bounded outcome, candidates, caveats, exclusions, unknowns, changes and source/rule references. It uses no numerical ranking or confidence score. The UI renders the same data used by tests and removes answers to hidden branches when requirements change.

## Authoritative and derived data

Search and cache are additional roles only when confirmed. Original files and application records remain authoritative. A derived index or cache needs update propagation, lag tolerance, invalidation, retry, rebuild and independent failure/recovery design. No distributed transaction across independent services is assumed.

Unknown source-file or application-state requirements do not create new stores by default. An existing engine candidate is reused when it can own application state. Keeping an existing database is an explicit assessment option.

## Build pipeline

The inline SVG/CSS architecture diagram groups original/retained data above derived copies and labels each directional connection. Solid, dashed, double and dotted borders convey roles without colour alone. The connection list is its accessible text equivalent, with synchronisation and independent failure notes. Mobile layouts stack without page overflow.

Six families distinguish relational, document/distributed, caching, object/file, search/retrieval and analytics/telemetry. Table Storage belongs to document/distributed because it stores key/attribute records. OneLake belongs to object/file because it is storage, not a query engine; Warehouse, Lakehouse and Eventhouse are analytics experiences. ADLS is a Blob capability set, not another independent engine. Contrast tests check family text on theme surfaces and diagram lines; every colour accompanies a text label.

`npm ci` installs pinned build/test tools. `npm run build` cleans only the generated `dist/` directory, copies runtime assets and actual screenshots, renders original Markdown documentation using `marked`, and creates portable article copies.

The authoritative article is [article.md](article.md). Its generated site version is `dist/docs/article.html`. `dist/publication/article.md` retains relative screenshot references for an export bundle; `dist/publication/article.html` embeds images and CSS so it can be moved independently.

Build-time link validation checks local HTML references and anchors, including image files. Missing targets, duplicate anchors, unexpected URL schemes and published raw-Markdown links fail the build. External links are not fetched automatically at build time; that would make builds network-dependent and would not establish technical accuracy.

## Validation

Node tests cover difficult scenarios, pure rules, evidence invariants, result completeness, questionnaire applicability, link-validator failures and source-review age. `npm run check` audits catalogue/rule/source references and fixture values. Reviews older than 180 days fail and require a real source recheck.

Playwright tests serve the full build under a GitHub Pages-style subpath. The matrix covers 375/768/1024/1440 px and light/dark themes, with reduced motion and automated WCAG A/AA checks using axe-core. Runtime errors and failed same-origin resource requests fail browser tests.

## Deployment boundary

`dist/`, dependencies and temporary test reports are gitignored. CI runs the build and checks without publishing. The Pages workflow has only a manual trigger and requires affirmative deployment confirmation. Neither local verification nor a prepared workflow demonstrates a public deployment.
