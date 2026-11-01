# Contributing

Thank you for helping improve Azure Database Navigator. The project is an independent educational guide; corrections to evidence and distinctions are especially valuable.

## Before changing a recommendation

- Read [the decision model](docs/decision-model.md) and [research method](docs/research-method.md).
- Use official Microsoft Learn, Azure Architecture Center, lifecycle and first-party engine documentation for product claims.
- Record a canonical source URL, title, publisher, source date, verification date, evidence summary and limitation.
- Keep the distinction between supported, unsupported, conditional, unknown and not applicable. Never turn missing information into an unsupported claim.
- Keep product APIs, engines, service tiers, operating models, caches, object stores, search indexes and analytics services distinct.
- Do not add prices, performance promises, compliance claims or feature parity without direct, current evidence.
- Add a deterministic test for each new rule, including the boundary that must not trigger it.
- Keep the common profile/comparison dimensions and their five evidence states in sync. Use specific service/feature sources, not hub-only capability citations; test family text/line contrast and retain non-colour role labels.
- Multi-store nodes carry role/kind/label/platform alternatives/boundary; retain exactly one record node for known durable models. Existing stores are retained, not selected. Vector retrieval checks the source store before adding an index; graph and JSON alternatives need explicit sources.

## Local checks

Requirements: Node.js 24 or later. Dependencies are build/test-only and pinned in `package-lock.json`; the published app has no runtime packages.

```sh
npm ci
npm test
npm run check
npm run build
npx playwright install chromium
npm run test:browser
```

`npm run check` rejects missing evidence, invalid fixture answers, incomplete results, unjustified hard exclusions and evidence reviews older than 180 days. A stale date must trigger re-verification, not an automatic date bump. The build rejects missing pages, image files and anchors, duplicate anchors, and raw Markdown links in published pages.

Edit the authoritative article in `docs/article.md`. All published documentation and portable article copies are generated. Regenerate screenshots with `npm run screenshots`, inspect the real captures, and rebuild afterwards. Do not replace screenshots with illustrative mocks.

The site is static and client-only. Assessment answers remain in browser memory. Do not add telemetry, a backend, credentials, an external API or runtime CDN without an explicit product decision and documentation.

## Content and attribution

Original article and documentation content are licensed under CC BY 4.0; source code is MIT. Azure product names and Microsoft documentation are referenced, not republished. The [Compute Navigator repository](https://github.com/preciousajuru/azure-compute-navigator) and [application](https://preciousajuru.github.io/azure-compute-navigator/) are design inspiration only; no source code is copied into this repository.

## Pull requests

Describe the user impact, sources checked, rule IDs changed, tests run and any remaining uncertainty. Use the correction issue template for evidence disputes. Do not enable or invoke the manual Pages deployment workflow without explicit publication authorization.
