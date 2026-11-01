# Azure Database Navigator

An independent, evidence-led educational guide to choosing data stores and database services on Microsoft Azure. The assessment starts with workload and access patterns, keeps uncertainty explicit and explains why each candidate appears. It does not estimate price, size capacity, promise compatibility or replace engineering review.

**Status:** publication-ready foundation; GitHub Pages has not been enabled or deployed. No live URL or screenshot is claimed. Technical information was reviewed on **1 November 2026**.

## What it helps distinguish

- Relational engines and service models: Azure SQL Database, Managed Instance, SQL Server on Azure VMs, PostgreSQL Flexible Server, MySQL Flexible Server and SQL database in Fabric.
- Document, distributed and API offerings: Cosmos DB for NoSQL, Cosmos DB for MongoDB RU-based, Azure DocumentDB (the current name for the vCore-based offering), other Cosmos APIs and Apache Cassandra options.
- Cache, file/object, search and analytics roles: Azure Managed Redis, Blob Storage, Table Storage, Data Lake Storage Gen2, Azure AI Search, Azure Data Explorer, Fabric Warehouse/Lakehouse/Eventhouse and OneLake.
- Multi-store designs, migration compatibility, service lifecycles, RPO/RTO, residency, network and operational questions.

The service catalogue deliberately records “unknown” when evidence does not establish support. A wire protocol is not feature parity; JSON is not a Cosmos DB shortcut; global users do not automatically require multi-region writes; caches and indexes do not silently become systems of record.

## Run locally

Requirements: Node.js 24 or later. The project has no runtime or build dependencies.

```sh
npm test
npm run check
npm run build
npm run dev
```

Open `http://127.0.0.1:4173/`. The development server serves the generated `dist/` folder. No Azure credentials, account, backend, runtime CDN, paid API, analytics or telemetry are used.

Assessment answers and optional notes remain in page memory. The only persisted preference is the light/dark theme in local storage.

## Decision method and evidence

- [Decision model](docs/decision-model.md)
- [Research method](docs/research-method.md)
- [Source register](docs/sources.md)
- [Publication checklist](docs/publication-checklist.md)

The result is a primary candidate, qualified shortlist, evidence-justified multi-store design, no-database-needed outcome, insufficient-information result or no verified match. There are no hidden scores or confidence percentages. Prices, regions, feature matrices, service limits, compliance controls and recovery guarantees must be checked against the exact current service, tier, version, API, region and configuration.

## Companion publication material

- [Article: Azure SQL, PostgreSQL, MySQL or Cosmos DB: How Do You Choose the Right Database on Azure?](docs/article.html) — the single authoritative article source.
- [Unpublished LinkedIn announcement draft](docs/linkedin-announcement.md).
- [Community impact template](docs/community-impact-template.md).

The announcement is intentionally unpublished and makes no live-site or impact claim. Only genuine screenshots from a visual browser review should be added after capture.

## Project boundaries

Azure Database Navigator is independent and is not affiliated with or endorsed by Microsoft. Azure product names and Microsoft Learn sources belong to their respective owners. The Azure Compute Navigator is linked as design inspiration only; no code was copied. This project has its own catalogue, rules and tests.

Source code is MIT-licensed. Original article and documentation text is licensed under CC BY 4.0; see [content licensing](docs/CONTENT-LICENSE.md).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) and open an [evidence correction](.github/ISSUE_TEMPLATE/correction.yml) when a source or claim is unclear. The deployment workflow is manual-only and requires explicit confirmation. Do not run it or enable Pages without publication authorization.
