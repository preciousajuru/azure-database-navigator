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

## Local checks

Requirements: Node.js 24 or later. No runtime or build dependency is required.

```sh
npm test
npm run check
npm run build
```

The site is static and client-only. Assessment answers remain in browser memory. Do not add telemetry, a backend, credentials, an external API or runtime CDN without an explicit product decision and documentation.

## Content and attribution

Original article and documentation content are licensed under CC BY 4.0; source code is MIT. Azure product names and Microsoft documentation are referenced, not republished. The Compute Navigator is linked as design inspiration only; no source code is copied into this repository.

## Pull requests

Describe the user impact, sources checked, rule IDs changed, tests run and any remaining uncertainty. Use the correction issue template for evidence disputes. Do not enable or invoke the manual Pages deployment workflow without explicit publication authorization.
