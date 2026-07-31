# Getting Started: What We Need From Fidson, and What Fidson Can Expect

Companion to the Executive Proposal. Two parts: (1) the exact access and information we need, each with the reason we need it, and (2) what your team will be able to test at each milestone.

Guiding principle: everything is built inside **Fidson's own Microsoft tenant**. We work as scoped guests in your environment. You can see everything we do, and you can revoke our access at any time without losing anything, because it is all yours.

---

## Part 1 · What we need to get started

### A. Azure access (needed at signature, for Milestone 1)

| What we ask for | Why we need it |
|---|---|
| A **dedicated Azure subscription** for FieldForce, created under Fidson's existing tenant | Keeps FieldForce fully isolated from everything else Fidson runs. One clean boundary: its own resources, its own bill, its own access list. Nothing we do can touch any other Fidson system. |
| Tales engineers added as **guest users (Entra B2B)**, using our own identities | No shared passwords, no anonymous accounts. Every action in the environment is traceable to a named person, and Fidson IT can disable any of us in one click. |
| **Owner role on that subscription only** for the Tales lead (Contributor for the rest of the team) | Owner on the one subscription lets us provision infrastructure and set up the team's access without coming back to Fidson IT for every step. It grants nothing outside FieldForce. Fidson keeps Global Admin; we never ask for tenant-wide roles. |
| **Billing / Cost Management reader** on the subscription, for both Tales and a named Fidson finance contact | Infrastructure is billed at cost per the proposal. This makes the run rate visible to both sides from day one, so cost is never a surprise or a dispute. |

### B. Microsoft Entra ID (identity) access

| What we ask for | Why we need it |
|---|---|
| Permission to create **app registrations** (typically 3: the rep mobile app, the management web app, and the platform API), or have Fidson IT create them and assign us as owners | This is what makes "sign in with your existing Fidson Microsoft account" work. The apps must be registered in your tenant so your IT controls them and your existing security policies apply. |
| **5 to 6 test user accounts** (rep, RSM, PM, admin roles) | These are for our internal testing and the Milestone 1 demo only, so no real staff account is touched before the pilot. Your real people never need new accounts at all: when the pilot starts, a rep is onboarded simply by Fidson IT adding their existing Fidson account to the right FieldForce security group, and they can sign in. |
| Ability to create **security groups** within an agreed naming prefix (e.g. `FF-`) | Roles in FieldForce (rep, RSM, PM, admin) map to Entra groups, so access is managed the way your IT already manages everything else, and offboarding a staff member automatically removes their FieldForce access. |

### C. A few small items (needed before the pilots, not at signature)

| What we ask for | Why we need it |
|---|---|
| A **subdomain** (e.g. fieldforce.fidson.com) | So the platform lives on a Fidson address your people recognise and trust, not a vendor URL. |
| A **sending mailbox or approval to use Azure email** for notifications | Approval requests, directives and report distribution arrive by email; they should come from a Fidson address. |
| A short conversation with IT about **rep devices** (company vs personal phones, any mobile device policy) | The rep app's offline storage and GPS behaviour should comply with your device policy from the start, not be retrofitted. |
| **ERP details before Milestone 4**: which ERP, whether APIs are available, and a named technical contact | Milestone 4 connects field orders to your ERP. If the APIs are not ready in time, we proceed on agreed stubs so the schedule never stalls on an internal dependency, and we swap in the live connection when ready. |

### D. Information and people (not technical access)

| What we ask for | When | Why |
|---|---|---|
| A named **Fidson product owner** | At signature | One empowered voice who prioritises the backlog and attends sprint demos. This is the single strongest predictor of a smooth delivery. |
| The **pilot territory** decision | Before Milestone 2 | Pilot 1 runs with real reps in one territory. Choosing it early lets us prepare their data and their manager. |
| **Pilot territory data**: the reps and their RSM, territory assignment, customer/facility list, and product list. A spreadsheet is fine. | Before Milestone 2 | The pilot runs on real data, hand-loaded by us. This is what makes Pilot 1 a genuine test rather than a demo with fake names. |
| The **management hierarchy and targets** for the pilot region | Before Milestone 3 | Milestone 3 puts every management layer live: approvals and dashboards need the real reporting lines and real targets to mean anything. |

### How real users and real data come on board

No Fidson staff member ever gets a new account. Access is always their existing Fidson Microsoft account plus membership of a FieldForce security group, controlled by Fidson IT.

| Milestone | Who is on the system | Where the data comes from |
|---|---|---|
| M1 | Test accounts only (Tales testing + demo) | None needed |
| M2 · Pilot 1 | Real reps and their RSM in one territory | Fidson provides a spreadsheet (reps, RSM, territory, customers, products); Tales loads it; IT adds the reps to the group |
| M3 · Pilot 2 | Every management layer in the pilot region | Fidson provides hierarchy and targets by spreadsheet; Tales loads it |
| M4 | Same users, plus distributor channel | ERP sync (or agreed stubs) replaces spreadsheet loads for products, pricing, customers, invoices |
| M5 onward | National rollout | Live Entra and ERP sync plus admin tools: Fidson admins onboard everyone themselves; spreadsheets retire |

That is the complete list. Nothing here gives Tales access to Fidson email, files, ERP, or any system outside the FieldForce subscription.

### E. Discovery (part of Milestone 1, at no charge)

A large part of Milestone 1 is **discovery, which we do for free**. Its most important output is a **foundational-data audit**: for each core data set the platform runs on, we establish whether it already exists in a structured system we can sync from, or whether it only lives in spreadsheets and people's heads today.

This answer decides **how deep we build**. Where a data set already lives in a system of record (Entra, your ERP, an HR system), FieldForce simply **syncs** it and we build nothing to manage it. Where it does not, FieldForce provides the **admin screens to own it** (the "manage people," "manage territories," "manage accounts," "manage catalogue" stories). Same platform either way; the build only goes as deep as your current systems make necessary.

| Foundational data set | What we need to learn in discovery | If it's structured already → | If it's not → |
|---|---|---|---|
| **People, roles and reporting lines** | Is your org structure (who reports to whom, who is a rep vs RSM vs PM) in Entra or an HR system, and how current is it? | Sync roles/hierarchy from Entra/HR; groups drive access. | We build the people-and-reporting-lines admin. |
| **Territory assignments** | Do defined territories and rep-to-territory mappings exist in a system, or on spreadsheets? | Sync territory assignments. | We build the territories admin. |
| **Customers / facility list (Accounts)** | Where does the master customer/facility list live (ERP? a CRM? spreadsheets?), and is it keyed by channel (institution / trade / HCP)? | Sync accounts from ERP. | We build the accounts admin (and the FSM distributor directory for trade). |
| **Product catalogue and prices** | Is the catalogue with current pricing in the ERP and exposed by an API? | Sync catalogue and prices from ERP. | We build the catalogue-and-prices admin. |
| **Product-to-PM assignment** | Is "which PM owns which product" recorded anywhere, or is it tribal knowledge? | Sync it. | We build the product-assignment admin. |
| **Statement of account / invoices** | Are these in the ERP with API access? | Sync / deep-link from ERP. | Flagged as an ERP dependency for Milestone 4. |

The deliverable at the end of discovery is a short **structured summary of each row above**, so the build-vs-sync decision for every foundational data set is made on evidence, jointly, before we build it, not assumed.

### F. The single hand-off per milestone (what to actually give us, and when)

The tables above list access and information by category. Here is the same thing re-cut the way you asked: for each milestone, the **one concrete thing Fidson prepares**, so nobody has to reverse-engineer it from the categories. Each is small, and each is what unblocks that milestone.

| Milestone | What Fidson hands us | Form it takes | Why it's the blocker |
|---|---|---|---|
| **M1 · Foundation** | (1) `FF-` **security groups** created to mirror your roles (rep, RSM, PM, admin). (2) A **spreadsheet of the 5–6 test-user emails** to drop into those groups. | Groups in Entra + one spreadsheet | This is all M1 needs. It proves "sign in with your Fidson account" and the role mapping, using throwaway test accounts, before any real staff are touched. |
| **M2 · Pilot 1** | The **pilot territory** decision, plus one **spreadsheet** for that territory: reps + their RSM, territory assignment, customer/facility list, product list with prices. Then IT adds the real reps to the `FF-Rep` group. | One decision + one spreadsheet | The core loop (plan, approve, check-in, log, offline) only becomes a real test when it runs on one territory's real people and real customers. |
| **M3 · Pilot 2** | The **management hierarchy** for the pilot region (full reporting lines up the chain), the **targets** per rep/territory, and the **product-to-PM map** (which PM owns which products). Plus one named marketing approver. | One spreadsheet + one name | M3 turns on every management layer: approvals, dashboards and routing are meaningless without the real reporting lines, real targets, and real product ownership. |
| **M4 · Orders + ERP + AI** | **ERP details**: which ERP, whether the APIs are available, and a named technical contact. Plus the **distributor/trade-channel** data. Plus your sign-off on the **discount ceiling and approval thresholds**, and which **AI model** you approve. | A conversation + a technical contact + a spreadsheet | M4 connects the field to your ERP and switches on AI. If the ERP APIs are late we run on agreed stubs, so this never stalls the schedule. |
| **M5 · Go-live** | Your **UAT team and acceptance criteria**, sign-off authority, and the rollout sequence (which regions, in what order). National data now flows from live Entra/ERP sync, so no more spreadsheets. | People + a sign-off + a plan | This is your acceptance and handover. From here your admins run onboarding themselves through the self-service tools. |

**Deferred until the contract is aligned:** a few asks depend on decisions we settle inside the contract before we request them from you, so they are named here but not asked for yet. These include the **trade / distributor channel** scope (M4), the **AI model and any data-residency constraints** (M4), and the **national rollout sequence** (M5). We raise each one at the milestone before it's needed, not at signature, so you are never asked for something before it's actionable.

---

## Part 2 · What you can test at each milestone

Payments follow acceptance: each invoice comes **after** your team has used and accepted the milestone below it. You never pay against a promise.

### Milestone 1 · Foundation and first working thread (25%)

The platform exists, in your tenant, and the core idea is proven end to end.

**What your team can test:**
- Sign in to the rep app and the management portal with an existing Fidson Microsoft account. No new passwords.
- A test rep logs a visit; a test manager sees it appear, live.
- All of it running on a real deployed environment inside Fidson's Azure subscription.

Also delivered here: the approved architecture, the provisioned infrastructure, and the data-migration plan.

### Milestone 2 · Pilot 1: the core visit loop, with real reps (20%)

Real reps in one territory run their actual day on the app.

**What your team can test:**
- A rep drafts and submits their weekly plan.
- Their RSM approves or rejects it from the portal.
- The rep checks in at a customer with GPS: a logged visit is a verified visit.
- The rep logs the full visit record.
- The rep works with **no signal all day**, and everything syncs cleanly the moment they reconnect.
- An admin queue catches any sync conflicts so no data is ever silently lost.

### Milestone 3 · Pilot 2: the whole organisation, live in the pilot region (20%)

The largest milestone. Reps and every management layer work in the system daily. Test it in four groups:

**The rep's full day**
- Capture new contacts in the field and advance them through a pipeline to customer.
- Log samples issued, competitor intel, and a customer's stock levels (with restock suggestions).
- The daily call report **writes itself** from the day's visits; the rep reviews and submits.
- Customer 360 view, my-numbers-vs-targets, clinical meeting requests, itinerary adjustment requests, and offline access to approved marketing content.

**Manager oversight**
- Coverage and compliance dashboard for the team, drill-down to any rep.
- Set targets, keep coaching logs, log their own field visits, message reps, delegate approvals when away.
- Approve/reject itinerary adjustments; set focus products; push a periodic summary upward.

**Product and marketing management**
- Push product directives to reps and track who acknowledged.
- Submit, approve and distribute detailing materials.
- Promo requests from the field, PM decision, launch, and campaign ROI tracking.
- Joint-call scheduling, accompaniment logs, customer-inventory insights.

**Leadership and reporting**
- Role-appropriate dashboard at every level up to leadership.
- Standard report pack, custom report builder, scheduled report distribution.
- Broadcast directives to a chosen audience with acknowledgment tracking.
- Automated lead assignment with SLA escalation, and AI geo-coverage anomaly alerts.

### Milestone 4 · Orders, ERP and the AI layer (20%)

A field visit becomes a transaction, and the intelligence layer switches on over months of accumulated real data.

**What your team can test:**
- A rep places an order during a visit; sees the customer's invoices and statement of account.
- Discount above the ceiling: rep requests, manager decides, the engine enforces thresholds.
- ERP sync live (products, pricing, customers, invoices, SOA), or on agreed stubs if the APIs are late.
- The distributor channel: directory, stock health, at-risk reorder pushes, quarterly audits.
- The AI layer: morning next-best-actions and route optimisation for reps, voice-driven visit logging, AI pre-fill and summaries, product intelligence for PMs, the 12-month national forecast, cross-regional insights for leadership, and a role-scoped AI assistant.
- Admin controls over the AI: rules editor and model catalogue, so the AI works under rules Fidson sets.

### Milestone 5 · UAT, go-live, and running it yourselves (15%)

The system is hardened, signed off, and handed to Fidson as owner-operator.

**What your team can test:**
- Full UAT with your team, on your acceptance criteria.
- Admin self-service replaces everything we hand-configured during the pilots: manage people and reporting lines, territories, accounts, product catalogue and prices, the form builder, the **workflow builder** (your approval chains, editable by your admins), the permission matrix, and a config audit log.
- Security penetration test, load test at national scale (~1M visits/year), disaster-recovery drill.
- Role-based training delivered; phased rollout from the pilot region to national; hypercare support through go-live.

After this milestone, the choice in the proposal becomes real: Fidson runs it, Tales runs it, or both together. The system, the source, and the data are already yours either way.

---

*One honest note we prefer to make now rather than later: during the pilots (Milestones 2 and 3), master data is hand-loaded by us from your spreadsheets and approval chains are configured by us to your rules. That is deliberate: your pilots are never blocked waiting on admin training. The self-service admin tools arrive at Milestone 5, where they replace our hands with yours for national scale.*
