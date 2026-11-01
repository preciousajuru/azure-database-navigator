# Azure SQL, PostgreSQL, MySQL or Cosmos DB: How Do You Choose the Right Database on Azure?

By Precious Ajuru · 1 November 2026

Start with the data, not the service catalogue. What must the application read and change together? What has to stay compatible with an existing engine? Where do users need data, and how much recovery work can the team own? Those answers make a useful shortlist. A language, a JSON payload or an “AI” label does not.

Azure has a broad data platform, and the names can make unlike things sound interchangeable. A database engine, a managed service, a client API, a cache and a search index each solve different problems. One application can need more than one, but a simpler design is preferable when one store meets its requirements.

## For business transactions, begin with a relational model

Consider customers, orders and payments. The application needs related records, joins, constraints and changes that must succeed or fail together. That is a relational workload. The first question is which engine and operating model fit the application, not whether its team writes C#, JavaScript or Python.

[Microsoft’s data-model guidance](https://learn.microsoft.com/en-us/azure/architecture/data-guide/technology-choices/understand-data-store-models) describes relational stores as suited to transactional data, integrity constraints and rich SQL queries. Azure SQL Database and Azure Database for PostgreSQL Flexible Server are sensible starting candidates. Compare their engine features, drivers, team experience and integration requirements.

MySQL Flexible Server is also relational. It is particularly relevant when the application needs the MySQL engine and ecosystem. A relational recommendation does not mean every relational engine is compatible with every other one.

![The actual Azure Database Navigator assessment, showing workload-first questions and the four navigation views.](../screenshots/assessment-light-1440.png)

*Azure Database Navigator running locally: requirements first, without asking the user to choose a favourite engine.*

## Azure SQL Database, Managed Instance and SQL Server on VMs are not one choice

“Azure SQL” covers different deployment models. [Azure SQL Database](https://learn.microsoft.com/en-us/azure/azure-sql/azure-sql-iaas-vs-paas-what-is-overview?view=azuresql) is a managed, database-scoped option for application databases. Provisioned or serverless compute, single databases or elastic pools, and General Purpose, Business Critical or Hyperscale are configuration decisions, not unrelated engines. Their availability and suitability depend on the service configuration.

[Azure SQL Managed Instance](https://learn.microsoft.com/en-us/azure/azure-sql/managed-instance/sql-managed-instance-paas-overview) provides a managed SQL Server instance model. Assess it when a migration depends on documented instance features. Microsoft’s [Azure SQL decision tree](https://learn.microsoft.com/en-us/azure/azure-sql/azure-sql-decision-tree?view=azuresql) calls out SQL Agent, CLR, linked servers, cross-database queries and transactional replication as factors to investigate.

Need operating-system or file-system access, or a specific SQL Server version? The decision tree points to SQL Server on Azure VMs. That control brings a different operational burden. Decide who owns patching, backups, monitoring, high availability and disaster recovery. An existing SQL Server running on a VM does not itself require a VM target.

Before choosing a destination, ask whether the current database needs to move at all. Then inventory versions, jobs, procedures, functions, triggers, extensions, drivers, linked servers, administrative privileges and operational scripts. Include vendor support and permissible downtime. “Nearly compatible” is not a migration test.

## PostgreSQL and MySQL are engine decisions

Azure Database for PostgreSQL Flexible Server is managed PostgreSQL with configurable compute and server settings. If the application depends on an extension, check its exact name and version against the [current extension allow-list](https://learn.microsoft.com/en-us/azure/postgresql/extensions/how-to-allow-extensions). A description mentioning extensions is not proof that yours is available in the selected version or configuration.

MySQL Flexible Server is managed MySQL, not a guaranteed drop-in replacement for MariaDB. The [Azure Database for MariaDB managed service retired on 19 September 2025](https://learn.microsoft.com/en-us/lifecycle/announcements/azure-products-retirement-september-2025). That does not mean MariaDB software retired.

A WordPress site using MariaDB should be tested against MySQL Flexible Server. Check plugins, schema, SQL behaviour, character sets, drivers, backups and migration tooling. The application label helps identify a compatibility exercise; it does not prove the destination will work.

## Choose Cosmos DB for its access pattern, not because data is JSON

JSON can live in relational databases as well as document databases. Azure Cosmos DB for NoSQL is a document-oriented distributed database with explicit partitioning and consistency choices. Its [consistency options](https://learn.microsoft.com/en-us/azure/cosmos-db/consistency-levels) trade among consistency, availability and latency. Its [partitioning model](https://learn.microsoft.com/en-us/azure/cosmos-db/partitioning) makes data distribution and query shape important design work.

Global users do not automatically require writes in multiple regions. Measure client locations and latency targets, then decide whether reads, writes or both need to be local. Design partition keys, transaction boundaries, indexing, consistency, region placement and throughput together. Cross-record business transactions can still justify a relational design.

MongoDB applications need a separate compatibility exercise. Microsoft’s [release notes](https://learn.microsoft.com/en-us/azure/documentdb/release-notes) identify Azure DocumentDB as the renamed vCore-based Cosmos DB for MongoDB offering. RU-based Cosmos DB for MongoDB remains separate.

A familiar driver or wire protocol is not complete feature parity. Check the [DocumentDB version-specific compatibility reference](https://learn.microsoft.com/en-us/azure/documentdb/compatibility-query-language) and the [RU-based MongoDB 4.2 feature matrix](https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/feature-support-42) for required commands, aggregations and transaction restrictions. Do not apply one API version’s matrix to every offering.

## Some data belongs in a different kind of store

A file archive may need Blob Storage and no database at all. A cache such as Azure Managed Redis can reduce pressure on a durable store, but needs an explicit source of truth, expiry and invalidation strategy. [Azure Cache for Redis retirement dates differ by tier](https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/retirement-faq); check the notice rather than selecting a legacy tier by habit.

For telemetry, compare time-window analytical queries with Azure Data Explorer or Fabric Eventhouse. A timestamp in an otherwise transactional record is not a reason to introduce an analytics platform.

For document retrieval, Azure AI Search may provide a derived index. A retrieval-augmented generation (RAG) application might use object storage for original files, a database for transactional application state and an index for retrieval, but only where each role is required. “AI” alone does not require vector search.

![The actual Navigator architecture view separating authoritative files and transactional state from the derived search index, with synchronisation and recovery boundaries.](../screenshots/rag-architecture-light-1440.png)

*An illustrative multi-store result from the working application. Separate stores do not become transactionally consistent merely because the application uses them together.*

Define how source updates reach the index, how long results can lag, how failures are retried and how an index is rebuilt. For a cache, define what happens when entries expire or Redis is unavailable. Keep authoritative records outside derived-state failure boundaries.

## A practical comparison

| Start here when… | Candidate to assess | Do not assume… |
|---|---|---|
| A new application needs relational transactions | Azure SQL Database; PostgreSQL Flexible Server | A programming language selects an engine |
| SQL Server instance dependencies must be preserved | Managed Instance; SQL Server on VMs if OS or version control is required | Every SQL Server feature behaves identically across services |
| The application needs PostgreSQL or MySQL | PostgreSQL Flexible Server or MySQL Flexible Server | Extensions, plugins or SQL behaviour are universal |
| Document access patterns have confirmed distribution needs | Cosmos DB for NoSQL or a validated MongoDB-compatible option | JSON, global users or a compatible driver settles the choice |
| The need is files, search, cache or analytics | Blob Storage, AI Search, Managed Redis or analytical services | Each is an OLTP database or system of record |

## Write down what “reliable” means

Recovery Point Objective (RPO) is how much recent data the business can afford to lose. Recovery Time Objective (RTO) is how long it can be without the service. Put both in writing, then verify backup retention, restore testing, high availability and regional recovery for the exact tier and region. High availability is not a substitute for backups or disaster recovery. Read replicas alone are not a complete recovery strategy.

Do the same for encryption, customer-managed keys, private networking, residency and named compliance controls. No service label is a compliance guarantee.

Compare cost drivers rather than invented totals: compute, storage, throughput, backups, networking, replicas, licensing and operational effort. Collect measured size, growth and concurrency before selecting capacity or a purchasing model.

There is no universal “best Azure database”. There is a shortlist that fits a workload, a set of compatibility tests and configuration decisions still to make. [Azure Database Navigator](https://github.com/preciousajuru/azure-database-navigator) turns those inputs into an explainable starting point. Its recommendations show evidence, validation gates and unresolved requirements without hidden scores. Use it to organise engineering review, not replace it.

---

Azure Database Navigator is an independent educational project, not affiliated with, endorsed by or an official product of Microsoft. Service features, pricing, availability and lifecycle information can change; confirm current documentation for your deployment. The screenshots show the actual local build, not a deployed website.

Original article by Precious Ajuru, licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). Microsoft product names and documentation remain subject to their owners’ terms.
