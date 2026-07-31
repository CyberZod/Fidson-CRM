# Milestone Map + Data Taps (Fidson 5-milestone view)

Every story mapped to the 5 Fidson payment milestones, with the **tap list** per milestone: the seeded/synced artifacts that must be **real** before that milestone can be accepted live. Stories are [user-stories.md](user-stories.md); infra tasks are the board's `keep-as-infra-task` set.

**Key principle:** pilots run on **hand-loaded real data + hardcoded config** for one cohort; the admin self-config builders and live syncs are the **national-readiness** layer and land at M5. A milestone is "live" when its stories' Requires resolve to *real* data for the cohort in scope, not mock.

*(This is the Fidson 5-milestone view; reconciliation with the JBS 10-week schedule is a separate task.)*

---

## M1 · Mobilise + Architecture approved + first vertical slice (25%)

**What Fidson sees:** rep logs in, creates a test visit, manager sees it, on a real deployed environment.

**Stories:** 56 (sign-in) — the one full story done here (it's foundational).
**Walking-skeleton task:** the "test visit → manager sees it" thread is a thin end-to-end **architecture task** that proves the rails, *not* Stories 3/4. Those travel the same path but are accepted complete only in M2 (GPS verification, full detailing, offline). A story lands in exactly one milestone.
**Infra tasks:** FID-45 discovery, FID-46 requirements sign-off, FID-48 architecture, FID-49 Azure provisioning, FID-50 migration setup.
**Tap:** a handful of real test users (Entra) to demo the skeleton. No real master data required yet.

## M2 · Pilot 1 · Core visit loop live (20%)

**What Fidson sees:** a real rep in one territory plans, checks in with GPS, logs offline, syncs clean; manager sees it live.

**Stories:** 1 plan draft, 2 plan approve, 3 check-in, 4 visit log, 71 offline sync, 78 conflict queue.
**Infra tasks:** FID-16 Field Pilot 1.
**Tap (turn real for the pilot territory):** People & Reporting Lines (real reps + their RSM, via Entra), Territory Assignments, Account (Institution facilities), Product Catalog. Hand-loaded for the one territory.

## M3 · Pilot 2 · Oversight, approvals & reporting live (20%)

**What Fidson sees:** reps and every management layer live in the pilot region: the full field call, approvals, dashboards, directives, reports.

**Stories:** 6 intel, 7 contact, 8 samples, 17 customer stock, 9 DCR, 10 customer 360, 11 numbers, 12 pipeline, 14/15 clinical meeting, 16 adjustment, 22 convert, 23 approve adjustment, 26 targets, 27 dashboard, 28 mgr field visit, 29 coaching, 30 message, 31 upward summary, 32 focus products, 34/35 product directive+ack, 36 materials, 21 offline content, 37/38/39 promo, 40 accompaniment, 41 inventory insights, 43/44 content, 46 campaigns, 47/48 broadcast+ack, 49 leader dashboard, 69 report pack, 70 report builder, 79 scheduled distribution, 74 geo anomaly, 75 lead assignment, 76 lead SLA, 80 delegate approvals.
**Infra tasks:** FID-32 Field Pilot 2.
**Tap:** the full management hierarchy for the pilot region (RSMs, DMs, PMs, leadership) real; Targets, Product Assignment, Focus Products loaded. Approval chains **hardcoded** at this stage (Workflow builder is M5). Still hand-loaded per cohort.

## M4 · Orders, ERP & AI slices accepted (20%)

**What Fidson sees:** orders from a visit, discount approval, invoice/SOA, ERP sync (or stubs), and the AI layer.

**Stories:** 5 order, 13 SOA, 18 route optimize, 19 next-best-action, 20 invoice, 24/25 discount, 42 product intelligence, 50 forecast, 51 insights, 52-55 trade/distributor channel, 57 AI copilot, 62 ERP sync, 66 AI rules editor, 67 model catalogue+swap, 72 voice, 73 AI pre-fill.
**Infra tasks:** FID-38 Business Central spike, FID-77 AI observability.
**Tap:** ERP sync real (Product Catalog, pricing, Account/customers, Statement of Account, Invoice) **or the contracted stubs** if APIs are late; Active Model live; distributor (Trade Account) data.

## M5 · UAT, go-live, handover + national-readiness (15%)

**What Fidson sees:** UAT signed off, production for the launch cohort, admin can now run the system themselves, hardened.

**Stories (admin self-config for national self-service — replaces hand-loaded/hardcoded config):** 58 manage people, 59 territories, 60 accounts, 61 catalogue, 63 product assignment, 64 form builder, 65 workflow builder, 68 config audit, 77 permission matrix.
**Infra tasks:** FID-51 SIT/UAT, FID-52 load/DR, FID-53 pen test, FID-54 training, FID-55 change mgmt, FID-56 rollout, FID-57 operating model, FID-78 audit/retention, FID-79 security, FID-80 DR, FID-81 compliance/DPIA, FID-82 cost NFRs.
**Tap:** full national master data via the **live syncs** (Entra, ERP) and the **admin builders** turned on, the config seam flips from hardcoded/hand-loaded to admin-managed. This is where the taps become permanent, not one-off loads.

---

## The tap principle, per milestone

| Milestone | Data source | Config source |
|---|---|---|
| M1 | test users | hardcoded |
| M2-M3 | **hand-loaded real** (pilot cohort) | hardcoded |
| M4 | ERP sync or stubs | hardcoded |
| M5 | **live sync** (national) | **admin-built** |

The story code never changes across these columns, only the tap behind each artifact's fixed shape. That's why a pilot is genuinely live on hand-loaded data, and why go-live is the same system with the taps turned permanent.

## Open reconciliation

- Admin self-config lands at **M5** here (pilots hand-load), but JBS puts it at **M6** (before UAT). Reconcile the two milestone schemes.
- Confirm expenses (parked) in or out before baselining a milestone.
