# Fidson FieldForce · Infrastructure & Run Costs

**An overview of what the platform runs on, why each piece is there, and what it costs to operate.**
Prepared by Tales Consulting · July 2026 · Companion to the Executive Proposal

Everything below runs inside **Fidson's own Azure subscription** and is **billed at cost**: Microsoft bills Fidson directly, Tales adds no margin on infrastructure, and both sides see the same bill. Figures are Azure list prices for the West Europe region as of July 2026, converted at a deliberately conservative planning rate of ₦1,600/$ (the market rate today is nearer ₦1,400, so naira figures carry a built-in cushion).

---

## 1. What the platform runs on, and why

Every service below earns its place. Nothing is exotic: this is the standard, boring, well-supported Microsoft stack, which is exactly what you want under a system your field force depends on daily.

| Service | What it is | Why FieldForce needs it |
|---|---|---|
| **App Service** | Managed hosting for the platform's core application | Runs the heart of the system: every plan, visit, approval and dashboard request passes through it. Managed means Microsoft handles the servers, patching and scaling. |
| **Azure Database for PostgreSQL** | The platform's database | Every visit, customer, order and approval lives here, in Fidson's tenancy. It also powers map/territory queries and the AI's document search, so three capabilities ride on one database instead of three systems. |
| **Azure Managed Redis** | High-speed cache | Keeps frequently used data in memory so dashboards feel instant, and queues background jobs (like processing a day of offline visits when a rep reconnects). |
| **API Management** | The platform's front gate for data traffic | Controls and throttles every request from the mobile and web apps, so a misbehaving device or integration can never overwhelm the system. |
| **Front Door + WAF** | Global entry point with a Web Application Firewall | The security perimeter. Filters malicious traffic before it ever reaches the platform, and speeds up access for reps across Nigeria. |
| **Azure OpenAI** | The AI models, running inside Azure | Powers the AI layer: structuring reps' visit notes, the ask-anything copilot, next-best-action phrasing, and management digests. Fidson's data never leaves the Azure environment to reach a third-party AI provider. |
| **Azure transcription** | Speech-to-text | Lets a rep speak their visit log instead of typing it, including offline; the recording transcribes when they reconnect. |
| **Document Intelligence** | Optical character recognition (OCR) | Reads receipts and the paper subset of historical records during data migration, so old records become searchable data. |
| **Container Apps** | On-demand compute for the AI services | Runs the Python AI workloads (note enrichment, document ingestion). Scales to zero when idle, so Fidson pays nothing when there's no work. |
| **Blob Storage** | File storage | Receipt photos, detailing materials, documents. Cheap, durable, unlimited. |
| **App Insights / Monitor** | Observability | Records the platform's health continuously, so problems are caught by alerts, not by users reporting them. |
| **Azure Maps** | Geocoding and routing | Turns GPS check-ins into verified locations and powers route optimisation for reps. |
| **Service Bus** | Messaging backbone | Reliably moves events between parts of the system (a submitted order, a sync from the field) so nothing is lost even under load. |
| **Sentry** | Error tracking | Captures any app error on any rep's device with full context, so fixes are fast and precise. |

Two things Fidson does **not** pay extra for: **identity** (sign-in, MFA, access control rides on the Entra ID licences Fidson already holds through Microsoft 365) and **manager notifications via Teams/Outlook** (carried by the existing M365 licence through Microsoft Graph).

---

## 2. What we mean by "open source", and why it matters here

The proposal describes FieldForce as built on an open, portable core. Concretely, the platform is three layers:

1. **The platform code**: custom-built for Fidson, owned by Fidson outright. Not open source, not licensed. Yours.
2. **The open-source foundations**: PostgreSQL (the database), Redis (the cache), React and React Native (the web and mobile apps), Node.js and Python (the engines that run the logic and the AI services). This is battle-tested software used by the world's largest companies, and it carries **zero licence fees, forever**. Because these components are free to deploy anywhere, the entire platform can live inside your own Azure tenant, and no vendor can ever charge rent on it or take it away. That is why there is no per-user CRM licence, no per-seat dashboard licence, and no software subscription anywhere in the cost tables below: the recurring money goes to compute, not to software rent.
3. **The managed Microsoft edges**: where we deliberately pay Azure to carry operational load (hosting, security perimeter, the AI models), because Microsoft runs those better and cheaper than anyone self-hosting them. Each is pay-per-use and swappable. We chose Microsoft for these edges for a second reason: **you already run Microsoft**. The platform plugs natively into your Entra identity, Microsoft 365 and Teams/Outlook, and your existing licences and any enterprise agreement may already cover part of this footprint. How much, exactly, is one of the things our Phase 0 stakeholder sessions with your IT team will establish.

Open source is what makes the platform deployable in your tenant, free of software rent, and portable to any operator you choose. The Microsoft edges are what make it feel native to the way Fidson already works.

## 3. How the billing works: two models

Azure charges in two distinct ways, and it is worth seeing the run rate through that lens:

- **Provisioned tiers**: a fixed monthly fee for a chosen capacity (a database size, a cache size). Predictable, the same every month, and stepped up deliberately as usage grows. We size these with headroom, and each step up is a visible, agreed decision, never a surprise.
- **Usage (pay-as-you-go)**: scales with actual consumption: AI tokens processed, pages OCR'd, gigabytes stored, minutes transcribed. If reps log less, it costs less. This is the part that varies month to month.

## 4. The numbers, at three stages

Three snapshots: the pilot (~20 users), national scale at roughly today's field force (~300 users), and headroom scale (~500 users).

### Provisioned (fixed monthly, USD): the tier each stage buys

| Service | Pilot · 20 | Scale · 300 | Scale · 500 |
|---|---|---|---|
| App Service (Premium v3) | P1v3 · 2 vCPU / 8 GB<br>$130 | P1v3 ×2–3 (autoscale)<br>~$300 | P2v3 · 4 vCPU / 16 GB ×2<br>~$520 |
| PostgreSQL Flexible Server | D2ds_v5 · 2 vCore / 8 GiB<br>+ 128 GB storage · ~$175 | D4ds_v5 · 4 vCore / 16 GiB<br>+ 256 GB storage · ~$345 | E4ds_v5 · 4 vCore / 32 GiB<br>+ 512 GB + read replica · ~$1,020 * |
| Managed Redis (cache) | 1 GB cache<br>~$100 | 2.5 GB cache<br>~$165 | 6 GB cache<br>~$330 |
| API Management | Developer tier (no SLA)<br>$48 | Basic tier<br>$147 | Basic tier<br>$147 |
| Front Door + WAF | Standard base + traffic<br>$50 | Standard base + traffic<br>$70 | Standard base + traffic<br>$80 |
| Sentry (error tracking) | Team plan · $26 | Team plan · $26 | Team plan · $26 |
| Non-production (staging) + backup/DR | — † | App tier + database mirror<br>~$300 | App tier + database mirror<br>~$330 |
| **Subtotal** | **~$530** | **~$1,350** | **~$2,450** |

The database tier deserves a note, because it does triple duty: the same instance's memory also serves the AI's semantic (vector) search index and PostGIS powers the geospatial queries, which is why its RAM steps up with scale and why there is no separate "vector database" line to pay for.

\* The step at 500 users adds a **read replica**: a live second copy of the database that carries reporting load and stands ready for failover. It bills as a full second server.

† The platform runs as three scripted environments from day one: development, staging and production, and every release flows through **staging** before it reaches production, from the very first pilot release. What changes over time is only scale: while production serves a single pilot territory, staging mirrors it at very small tiers and its cost is absorbed in the build. From national rollout, staging becomes a permanently-ready, production-shaped environment, and this line begins. It also covers keeping backup copies of your data in a second region, and regular restore drills that prove those backups can be brought back quickly if ever needed.

### Usage / pay-as-you-go (indicative monthly, USD)

| Service | Driver | Pilot · 20 | Scale · 300 | Scale · 500 |
|---|---|---|---|---|
| Azure OpenAI (AI models) | tokens: note enrichment + copilot | $34 | $442 | $735 |
| Transcription | audio minutes (voice notes) | $5 | $75 | $125 |
| Document Intelligence | pages (receipts + paper records) | $15 | $150 | $230 |
| Container Apps | compute seconds (scales to zero) | $40 | $240 | $320 |
| Blob Storage | GB stored + operations | $25 | $70 | $90 |
| App Insights / Monitor | GB of telemetry | $30 | $80 | $110 |
| Azure Maps | geocoding / routing calls | $15 | $60 | $90 |
| Service Bus | operations | $20 | $30 | $40 |
| **Subtotal** | | **~$185** | **~$1,145** | **~$1,740** |

### Total run rate

| Stage | Monthly (USD) | Annual (USD) | Monthly (₦ @ 1,600) | Annual (₦ @ 1,600) |
|---|---|---|---|---|
| Pilot · 20 users | ~$715 | ~$8.6K | ~₦1.15M | ~₦13.7M |
| Scale · 300 users | ~$2,500 | ~$30K | ~₦4.0M | ~₦48M |
| Scale · 500 users | ~$4,190 | ~$50.3K | ~₦6.7M | ~₦80.5M |

**The dollar figures are the real numbers; the naira figures are a conversion.** Azure bills in USD, so the platform's true run cost is the dollar column, and it is the stable one. The naira column moves with the exchange rate, and that movement dwarfs any price change Microsoft might make: a swing from ₦1,400 to ₦1,700 per dollar changes the annual naira figure at 300 users by roughly ₦9M with nothing about the platform changing at all. That is why we plan at a conservative ₦1,600/$ (market is nearer ₦1,400 today) and why any budget line for infrastructure should be understood as "~$30K/year at 300 users, in naira at the rate prevailing when billed," not as a fixed naira sum.

This aligns with the proposal's planning figure of **~₦48M/year at ~300 users**.

**Scaling is sub-linear.** Going from 20 to 500 users (25×) increases cost roughly sixfold, not 25×. Fixed tiers are shared by everyone; and the AI is designed rules-first, so ~80% of "AI" interactions are answered by plain database logic that costs nothing per use, with the paid models reserved for the work that genuinely needs them.

---

## 5. How we arrived at these numbers

The figures are built bottom-up from usage, not guessed top-down. The core assumptions:

- **~1,000,000 visit logs per year** at scale: derived from Fidson's own field reality (260+ reps today, growing toward 500 users, each logging several visits per working day across ~250 working days).
- **Each visit log costs a fraction of a cent to structure with AI** (roughly $0.0008). A million logs a year is therefore only about $400–800 of AI cost. Volume is not the expensive part.
- **The copilot is the main AI cost**: assumed at ~5 questions per user per working day. Each multi-step question costs about $0.012. That single line is ~85% of the AI bill, which is why it is engineered hardest (caching, tiered model effort).
- **Every other line follows the same pattern**: a unit price from Azure's published price list × a volume derived from field-force behaviour. Any assumption can be interrogated, and the real bill replaces the model within the first month of the pilot.

## 6. What to keep in mind about these figures

1. **They are usage-driven estimates, not a quote.** The pay-as-you-go half moves with real behaviour: fewer voice notes, smaller bill. Azure list prices also move. The bill is Microsoft's, at cost, fully visible to Fidson's finance team from day one.
2. **The exchange rate is the largest source of deviation.** The underlying dollar cost is stable and engineered down; the naira equivalent can move 10–20% in a year purely on FX. Budgeting in dollars (or at a conservative rate, as we do here) is the honest way to plan it.
3. **They do not yet net off what you already pay Microsoft.** Your existing Microsoft 365 / Azure estate may already cover some of this (identity already rides your existing licence, and enterprise agreements can discount the rest). Mapping that overlap is a Phase 0/discovery task with your IT team; these figures deliberately assume no existing discount, so the true number should only get better.
4. **Stages are checkpoints, not a schedule.** Fidson pays pilot-level costs during the pilot. Tiers step up only when rollout genuinely needs them, and each step is agreed, not automatic.
5. **This is the complete run picture for infrastructure.** No licences hide behind it: no per-user CRM licence, no per-seat dashboard licence, no third-party AI subscription. That is a direct consequence of the open-core design: the recurring money goes to compute, not to software rent.

---

*Tales Consulting · Fidson FieldForce · Infrastructure & Run Cost Overview · July 2026 · Confidential. Planning estimates at Azure West Europe list prices; confirmed against Fidson's actual Azure estate at Phase 0.*

---

## Revision queue (internal — apply at the next client touchpoint)

Tracked here so the doc never drifts silently from the build. Each item is applied as a visible revision, then removed from this list.

1. **§2 "Node.js and Python"** → the backend is now all Python (FastAPI); drop Node.js from the open-source foundations line. No cost impact.
2. **Hosting naming**: build resolution (2026-07-31) is core API + web on App Service, AI tier on Container Apps — matching this doc's tiers. If Phase 0 changes that, revise §1/§4 accordingly.
