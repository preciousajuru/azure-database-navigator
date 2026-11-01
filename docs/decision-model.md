# Decision model

Composite assessments use one `records` node, never one node per engine alternative. Each node has `id`, `role`, `kind` (authoritative, derived, cache, retained or unresolved), `label`, `serviceIds` and a failure boundary. New records invoke the same single-store engine rules; relational alternatives stay alternatives. Retained stores carry no selected service IDs. Unknown record models produce an explicit unresolved item, not SQL. Files are a distinct authoritative role.

Vector retrieval first checks the existing/planned store using its verified capability conditions. Unknown retrieval does not add a store. AI Search requires an explicit separate-index justification and acceptable indexing lag. Real-time freshness triggers source-store validation, not an implied synchronous copied index. The `vector-existing-first`, `authoritative-role` and `graph-traversal` rules expose these boundaries.

## Purpose and boundaries

The navigator is an educational first-pass filter for Azure data roles, not an automated architect. It records no confidence percentage, numeric rank, capacity estimate, price, compliance result or claim of current service availability. Candidate outcomes are explainable and keep unresolved requirements visible.

The app's assessment, service catalogue, evidence register and deterministic rules are separate modules. `src/logic/recommendations.js` is the policy boundary. It consumes categorical answers and returns one of: primary candidate, qualified shortlist, evidence-justified multi-store, no database needed, insufficient information or no verified match.

## Evidence vocabulary

Every capability record uses one of five states:

| State | Meaning |
|---|---|
| `supported` | The cited source documents the stated capability for the service/API/model in scope. |
| `unsupported` | A source explicitly rules the capability out or directs the workload elsewhere. |
| `conditional` | Availability depends on a version, API, tier, region, configuration or stated workload condition. |
| `unknown` | The current evidence set does not establish support or non-support. |
| `not-applicable` | The capability does not describe this service's role. |

Unknown is not unsupported. A result cannot turn missing feature evidence into an exclusion.

## Rule categories and stable rules

| Rule ID | Decision | Evidence boundary |
|---|---|---|
| `keep-existing-store` | Explicitly retaining the current database does not imply an Azure migration. | `arch-data-considerations`; lifecycle, recovery and security still need review. |
| `postgres-existing-engine` | PostgreSQL Flexible Server is a compatibility-gated target for an existing PostgreSQL contract. | `postgres-overview` and `postgres-extensions`; engine identity is not universal compatibility. |
| `mysql-existing-engine` | MySQL Flexible Server is considered for MySQL or a validated MariaDB migration. | `mysql-overview`; do not conflate MySQL and MariaDB. |
| `cassandra-feature-validation` | Compare the Cassandra API separately from native managed Apache Cassandra. | `cosmos-overview` and `cassandra-managed-overview`; version, features and topology are gates. |
| `files-no-db` | Files-only needs can produce Blob Storage with a no-database-needed outcome. | Object storage and database models are distinct in `arch-data-models`. Metadata, relationships or transactions reopen database assessment. |
| `no-persistent-store` | A user-confirmed lack of persistent storage returns no database candidate. | This is an explicit user requirement, not an inference from language or workload framework. |
| `sql-instance-features` | SQL Agent, CLR, linked servers, cross-database queries or transactional replication point to evaluating Managed Instance; SQL VM remains an alternative if feature testing fails. | `azure-sql-decision`; exact compatibility still needs feature validation. |
| `sql-os-version` | OS/file access or a specific SQL Server version points to SQL Server on Azure VMs. | `azure-sql-decision`; operational ownership must be planned. |
| `sql-existing-engine` | Existing SQL Server without known hard incompatibilities keeps Database and Managed Instance under consideration. | Existing engine alone is not a VM requirement. |
| `relational-integrity` | Joins, referential integrity and atomic business writes create a SQL Database/PostgreSQL shortlist when no existing-engine constraint narrows it. | `arch-data-models`; engine-specific needs remain open. |
| `postgres-extension-gate` | A required PostgreSQL extension adds an explicit compatibility gate. | `postgres-extensions`; check name, version and allow-list rather than claiming support. |
| `mariadb-to-mysql-validation` | A MariaDB app can assess MySQL Flexible Server, with migration compatibility explicitly unknown until tested. | MySQL overview plus Microsoft retirement notice for the Azure Database for MariaDB service. MariaDB software itself is not retired by that notice. |
| `document-access-pattern` | Cosmos DB for NoSQL is considered for document aggregate/partition-key patterns or confirmed multi-region latency; JSON alone does not select it. | `cosmos-overview`, `cosmos-consistency`, `cosmos-partitioning`; workload design and cost remain conditional. |
| `mongo-feature-validation` | Azure DocumentDB (the current name for Cosmos DB MongoDB vCore) and RU-based Cosmos Mongo remain distinct candidates; required commands/aggregations/drivers need feature-level checks. | `documentdb-release-notes`, `documentdb-mql-compat` and `cosmos-mongodb-features`; protocol is not parity. |
| `analytics-time-series` | High-ingest telemetry/time-window analysis surfaces analytical candidates, not an OLTP claim. | `arch-data-models`; region, retention, throughput and product requirements remain to verify. |
| `search-separated-role` | Search/RAG may separate source files, durable transactional state and derived search index, only when those roles are present. | `arch-data-models`, `ai-search-overview`; synchronization and failure boundaries remain design work. |
| `cache-not-record` | Managed Redis is a cache/transient-state role. A durable source is separately assessed when required. | `managed-redis-overview`; cache invalidation, source of truth and outage behaviour are not inferred. |
| `unknown-recovery-security` | RPO/RTO, residency, encryption, key and network constraints remain verification tasks. | Service/tier/region-specific proof is required; the navigator never promises compliance or a recovery target. |
| `tenant-shape-open` | Shared versus separate tenancy remains an architecture decision; no pool or partition strategy is assumed. | Requires isolation, workload and cost analysis beyond the service name. |
| `exclude-retired-new` | Retired or retirement-path services are excluded from new-deployment candidate lists. | Microsoft lifecycle sources in `src/data/sources.js`. |

## Candidate explanation

Each result candidate includes a human-readable reason, optional validation caveat, service model, API/protocol, role, capability states and source links. Exclusions require a cited documented constraint. Remaining operations, cost drivers and recovery questions are shown separately from the service choice.

The stable rule register in `src/data/rules.js` records each rule's service IDs, conditions, configuration boundary, source IDs, verification date, limitations and a test reference. The result view surfaces the applied rule IDs and their configuration conditions.

Multi-store results describe responsibility boundaries, not automatic integration. The UI explicitly calls out source-of-truth, derived-index and cache roles plus lag/rebuild/invalidation considerations.

## Assessment inputs and branches

The question catalogue begins with workload and persistence, then data/access patterns. No-storage and keep-existing choices skip unnecessary configuration questions. Mixed-role selection, relationships and transaction scope adapt to the data model. Migration intent and an optional dependency inventory capture source versions, drivers/dialect, procedures, triggers, extensions, jobs, privileges, vendor support and downtime. Source-file and application-state questions avoid adding stores from an unknown answer.

Volume/activity ranges, operational priorities, security controls and recovery mechanisms are review inputs, not sizing rules. The results show recorded requirements and identify which fields influence policy. Free-text notes are retained for the user’s review, not interpreted as proof of feature support.

“Not sure yet” and omitted optional answers are unknown, not negatives. Choosing a concrete multi-select answer removes the mutually exclusive unknown choice. Hidden branch answers are removed before further evaluation.

The scenario fixtures in `src/data/scenarios.js` are acceptance examples for all 12 hard cases in the project brief. `tests/recommendations.test.js` runs them through the same deterministic rules as the application.

## Known limits

- The catalogue is a starting point, not a complete feature matrix for every API or SKU.
- The app does not fetch live Azure pricing, regions, retirement status or product availability.
- The source verification date is 1 November 2026. A later source update can make a claim stale; review source metadata before release.
- Automated integrity checks reject review dates older than 180 days; update them only after re-verifying the source.
- Common profile review dimensions explicitly mark missing version, transactions, scaling, recovery, networking and pricing evidence as unknown rather than guessing.
- The recommendation data does not decide schema, partition key, topology, capacity, backup policy, security architecture or migration execution.
- The assessment is browser-only. Answers and optional notes remain in memory; only the light/dark theme preference is stored locally.
