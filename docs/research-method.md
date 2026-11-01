# Research and evidence method

## Scope

This project is an independent educational guide to data-store models and Azure services. Evidence should favour Microsoft Learn, the Azure Architecture Center, official lifecycle pages and first-party engine/product documentation. Vendor product pages can establish product framing, but technical compatibility requires feature-level documentation. Marketing claims are not treated as compatibility tests.

## What counts as evidence

Each source in `src/data/sources.js` has a stable local ID, title, publisher, canonical URL, source publication/update date (or a clear “continuously maintained” label), verification date, evidence summary and limitation. Service profiles and capability records reference those IDs.

`supported` is used only when the cited source documents the capability in scope. `unsupported` requires explicit evidence. `conditional` captures dependencies such as service tier, API, version, region, configuration or a separate compatibility test. `unknown` is the correct state when the source set does not prove either support or non-support.

An official overview may describe a wire protocol or compatibility at a high level. This project still requires users to validate exact commands, driver versions, transaction behaviour and migration steps. Feature matrices and configuration documentation take precedence over a broad summary.

## Verification snapshot

Descriptive profile fields are not feature-support claims and display no status chip. Capability and condition fields retain the evidence vocabulary. Result guidance cites the actual engines and roles being assessed: vector selection only in retrieval scope and replica conditions only for matching SQL, PostgreSQL or MySQL candidates.

The initial evidence snapshot was checked on **1 November 2026**. Microsoft Learn pages can change without notice; the app does not perform live checks. Review the current source, date and relevant feature/version/region conditions before relying on any result.

## How to update a claim

1. Open the source and verify the exact service, API, version, tier and configuration.
2. Record the canonical URL, source date and date checked in `src/data/sources.js`.
3. Update the smallest relevant service capability and its condition. Do not broaden a claim beyond the cited evidence.
4. Add or revise a deterministic scenario test covering the decision and its negative boundary.
5. Run `npm test`, `npm run check` and `npm run build`.
6. Submit a correction with the source URL if verification is ambiguous; use `unknown` until resolved.

## Research sources

Specific service overviews support model/operating-model summaries; feature pages support vector, graph, JSON and replica conditions. Hub-only capability citations fail integrity checks. Profile fields preserve conditions and source IDs, while unverified configuration-specific claims remain unknown. Performance guidance is tied to official query/index, application development, replica, partition and cache-aside pages. A product maximum never substitutes for measured workload behaviour.

See the app's [source register](sources.md) for all IDs and limitations. The evidence base includes Azure data model guidance, the Azure SQL decision tree, PostgreSQL extension allow-list documentation, Cosmos DB consistency and partitioning guidance, Azure Database for MySQL and PostgreSQL overviews, DocumentDB/Cosmos API documentation, lifecycle/retirement notices and object/search/analytics service references.
