# Azure SQL, PostgreSQL, MySQL or Cosmos DB: How Do You Choose the Right Database on Azure?

By Precious Ajuru · 1 November 2026

Choosing the right database for an application on Azure can be surprisingly challenging, especially when several services appear capable of meeting the same requirements.

Azure SQL Database might seem like an obvious choice for a business application, while PostgreSQL offers another compelling relational option. MySQL could be a natural fit for an existing application, and Cosmos DB might enter the conversation when flexibility or global distribution becomes important.

But how do you know which one is actually right for your application?

The answer depends on more than the database engine itself. You need to understand how your application structures and accesses data, the transactions it performs, its expected growth, and any compatibility requirements that already exist.

For an existing application, the decision becomes even more interesting. Moving to Azure doesn't necessarily mean changing your database engine, and choosing a managed service doesn't automatically guarantee compatibility with everything your application currently depends on.

That's why it's worth understanding the workload before comparing database services.

Let's explore the options, the trade-offs, and how to make a decision that fits your application's actual requirements.

## What must happen together?

Consider an order, its items and a payment record. Which changes must succeed or fail together, what prevents an item referring to an order that does not exist, and which queries need joins?

Those are relational questions. [Microsoft's data-model guidance](https://learn.microsoft.com/en-us/azure/architecture/data-guide/technology-choices/understand-data-store-models) describes relational stores around transactions, integrity constraints and SQL queries. Azure SQL Database and PostgreSQL Flexible Server are candidates worth comparing.

Other access patterns may call for a different model. A document model can keep an aggregate together, while key-value storage suits known-key access. Graph traversal and time-window analytics serve different needs again; nonrelational does not mean unstructured or careless.

The choice follows the operations the application performs, rather than its programming language or the fact that its API returns JSON.

![A genuine SQL Server migration shortlist showing Managed Instance and VM alternatives, reasons, validation gates and open questions.](../screenshots/result-light-1440.png)

*Azure Database Navigator running locally. Instance dependencies shape this migration shortlist; feature and recovery validation remain open.*

## Azure SQL is not one deployment model

With [Azure SQL Database](https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview?view=azuresql), the scope is the database. Microsoft manages platform patching and backups; your team still owns the schema, permissions, queries and recovery testing.

Within that service, you can assess a single database or an elastic pool, provisioned or serverless compute, and tiers such as General Purpose, Business Critical or Hyperscale. These are configuration choices, not different database engines.

[Managed Instance](https://learn.microsoft.com/en-us/azure/azure-sql/managed-instance/sql-managed-instance-paas-overview) is worth investigating when an existing application depends on instance-level features such as SQL Agent, linked servers or cross-database operations. Microsoft's [SQL decision tree](https://learn.microsoft.com/en-us/azure/azure-sql/azure-sql-decision-tree?view=azuresql) helps identify those dependencies, but “near-complete compatibility” still means checking each required feature against the target.

If you need operating-system access, file-system control or a specific SQL Server version, [SQL Server on Azure VMs](https://learn.microsoft.com/en-us/azure/azure-sql/virtual-machines/windows/sql-server-on-azure-vm-iaas-what-is-overview?view=azuresql) exposes that control, with more operational ownership. Optional automation does not remove responsibility for patching, backups and failover, so an existing SQL Server VM is not, by itself, a reason to choose another VM.

## PostgreSQL and MySQL are engine choices

[PostgreSQL Flexible Server](https://learn.microsoft.com/en-us/azure/postgresql/overview) provides managed PostgreSQL, which matters when the application already depends on PostgreSQL behaviour or extensions. For each required extension, check the [allow-list](https://learn.microsoft.com/en-us/azure/postgresql/extensions/how-to-allow-extensions), target version and configuration rather than treating “supports extensions” as evidence that a particular dependency will work.

[MySQL Flexible Server](https://learn.microsoft.com/en-us/azure/mysql/flexible-server/overview) is managed MySQL Community Edition. It is relational too, but that does not make SQL Server, PostgreSQL and MySQL interchangeable.

For either engine, a migration assessment should cover the source version, SQL dialect, procedures, triggers, drivers, privileges and vendor support, alongside the time available for cutover. Test representative reads and writes, not just whether a connection opens; retaining the current database is also a valid outcome when nothing justifies moving it.

## A practical example: WordPress using MariaDB

Suppose you are assessing a WordPress installation whose database is MariaDB. This is a worked example, not a claim about a real customer.

Microsoft [retired the Azure Database for MariaDB managed service on 19 September 2025](https://learn.microsoft.com/en-us/lifecycle/announcements/azure-products-retirement-september-2025), not the MariaDB engine everywhere. MySQL Flexible Server is therefore a candidate to assess where a move is needed, rather than a promised drop-in replacement.

1. Identify the actual source engine/version and hosting arrangement. Service retirement does not establish that every MariaDB installation must migrate.
2. Inventory schema, SQL modes, collations, plugins, drivers and scheduled tasks. Check the application's and plugins' supported database contracts.
3. Restore a backup into an isolated test target. Exercise publishing, account changes, plugin workflows and representative queries. Compare behaviour and inspect errors.
4. Test backup/restore, cutover time and rollback before deciding the production move. Record what has and has not passed.

Knowing that the application runs WordPress gives you a starting point for the compatibility assessment, not a substitute for it.

## Cosmos DB: ask about access and distribution

JSON alone is not a reason to select Cosmos DB. [SQL Database supports JSON alongside relational data](https://learn.microsoft.com/en-us/sql/relational-databases/json/json-data-sql-server?view=azuresqldb-current), and [PostgreSQL has json/jsonb](https://www.postgresql.org/docs/current/datatype-json.html). Check the exact feature and engine version.

Cosmos DB for NoSQL becomes worth assessing when document access patterns and distribution requirements justify it. Its [partitioning](https://learn.microsoft.com/en-us/azure/cosmos-db/partitioning) and [consistency](https://learn.microsoft.com/en-us/azure/cosmos-db/consistency-levels) choices need careful design.

That assessment includes measuring where reads and writes originate and what latency is acceptable: global users do not automatically require global writes. Relational alternatives can remain appropriate when joins, transactions or a retained engine contract matter.

MongoDB clients need their own assessment. [Azure DocumentDB is the renamed vCore-based offering](https://learn.microsoft.com/en-us/azure/documentdb/release-notes), while RU-based Cosmos DB for MongoDB remains separate. Check [DocumentDB's query-language compatibility](https://learn.microsoft.com/en-us/azure/documentdb/compatibility-query-language) and the [specific RU API matrix](https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/feature-support-42), because a familiar driver does not establish feature parity.

## Sometimes another store fits better

A file archive may need Blob Storage and no database. A regenerable cache may use Managed Redis while an existing database remains authoritative. Cache-aside needs explicit expiry and invalidation; it [does not guarantee consistency](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside).

For telemetry queries, Data Explorer or Fabric Eventhouse may be worth assessing, although a timestamp on an order does not turn the application into an analytics workload.

Search and AI retrieval need the same discipline. Microsoft's [vector-search selection guide](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/vector-search) starts by considering the existing database, so test whether it can meet the retrieval requirement before adding another store. A separate managed index can be justified for multi-source retrieval or hybrid ranking when indexing lag is acceptable; adding AI does not automatically require a new vector database.

![The genuine multi-store diagram showing a retained PostgreSQL store, original files and a derived retrieval index with labelled connections.](../screenshots/architecture-light-1440.png)

*The local application shows ownership and failure boundaries. The arrows are responsibilities to design, not an implemented synchronisation mechanism.*

## A shortlist, not a league table

| Requirement to investigate | Start by assessing | Keep open |
|---|---|---|
| New relational business records | SQL Database or PostgreSQL | Engine contract and transactions |
| SQL Server instance dependencies | Managed Instance | Exact feature compatibility |
| OS or specific SQL Server version control | SQL Server on VMs | Maintenance and recovery ownership |
| Existing PostgreSQL/MySQL contract | The matching Flexible Server | Versions, extensions and migration tests |
| Distributed document access | Cosmos DB for NoSQL | Partitioning, consistency and relational JSON alternatives |
| Files, cache, retrieval or telemetry | The corresponding specialised role | Source ownership and independent failure |

## Introducing Azure Database Navigator

I built [Azure Database Navigator](https://preciousajuru.github.io/azure-database-navigator/) to make those questions easier to organise, with the [source code](https://github.com/preciousajuru/azure-database-navigator) available to inspect. It asks about workload, persistence, data shape, access patterns, existing engines and required data roles. Migration, retrieval and record-model questions appear when relevant, and “Not sure” remains an unanswered requirement rather than an assumed preference.

Depending on your answers, it returns a qualified shortlist, a role-based architecture, more questions, or no new database when none is implied. Each candidate has a reason and validation gates, and you can inspect the applied rule IDs and official evidence. The explorer and comparison let you examine services capability by capability: each cell is Supported, Conditional, Not supported, Not applicable or Needs verification, with its official source, rather than simply “Unknown”.

The tool does not assign scores, guess prices or guarantee compatibility, nor does it select capacity, configure Azure or execute a migration. Your answers stay in browser memory; only the theme preference persists.

The screenshots were captured from a local build of the same application code. The [Compute Navigator](https://preciousajuru.github.io/azure-compute-navigator/) is its separate companion for choosing where the application runs.

## The shortlist is the beginning

Before production, measure the workload and review [queries, indexes and network round trips](https://learn.microsoft.com/en-us/azure/azure-sql/database/performance-guidance?view=azuresql), pooling and hot partitions. More advertised scale is not proof of better application performance.

Alongside performance, document recovery objectives and test restores and failover. Check region, networking, identity, encryption and cost against the exact configuration, remembering that replicas and caches can lag: not every read necessarily sees the latest write.

Rather than asking “Which Azure database is best?”, ask “Which options fit this application, and what evidence would make us choose between them?” That gives you a practical basis for comparing the services and deciding what to validate next.

---

This is an independent educational project, not affiliated with or endorsed by Microsoft. Features, availability and lifecycle can change; verify current official documentation before deployment. The screenshots were captured from a local build of the deployed application code.

Original article by Precious Ajuru, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Microsoft product names and documentation remain subject to their owners' terms.
