# Sequence & Coverage Audit (2026-07-20)

Scope: all 93 milestone-mapped board items + gap candidates, audited against the dependency rules (every item self-contained or dependencies in same/earlier milestone), plus a full prototype coverage check (nothing visible in the platform may be missing from the breakdown). Report only; Jira untouched.

## A. Hard sequence violations

| # | Dependency | Needed by (milestone) | Current provider (milestone) | Cheapest fix |
|---|---|---|---|---|
| 1 | Facilities/customers dataset | FID-14 log visit (M1), FID-12 check-in (M2), FID-17 plan day (M1) | FID-50 data migration (M14) | Seed enabler in M1: import facility/customer list from Fidson Excel. FID-50 splits: seed early, full history migration stays M14 |
| 2 | Org hierarchy (who manages whom) | FID-15 "their team's visits" (M1) | FID-64 organigramme editor (M13) | Seed enabler in M1: hierarchy import (manager_id level). Full RBAC M5, editor M13 |
| 3 | Territory data + rep assignment | FID-17 (M1) | FID-66 territory editor (M13), FID-89 auto-assign (M4) | Seed enabler in M1: territory list + assignments from Fidson data |
| 4 | Product catalogue | FID-18 detailing, FID-19 samples, FID-102 audit (M3) | FID-34 ERP sync (M9), FID-67 manager (M13) | Seed enabler in M3: import price list. Already logged |
| 5 | Approved marketing content | FID-23 rep accesses content offline (M3) | FID-105 content approval workflow (M7) | Seed enabler in M3: manually loaded content bundle; approval workflow stays M7 |
| 6 | Notification delivery | FID-22 reminders (M3), FID-90 lead SLA escalation (M4) | FID-30 real-time notifications (M6) | Either in-app-only rung for M3/M4 (lists, no push) or pull a basic notification enabler to M4 |
| 7 | ERP read access (SOA statement) | FID-37 rep sees SOA (M8) | FID-34 BC sync (M9) | Per URS: deep link into existing SOA app is the M8 rung; native SOA view moves after FID-34 |
| 8 | Audit trail mechanism | RBAC (M5), approvals (M6), config changes | FID-78 audit & retention (M14) | Split FID-78: append-only log mechanism built by M5; retention/chaining verification stays M14 |
| 9 | Baseline security (Key Vault, encryption, rate limits) | Any deployed environment (M1+) | FID-79 security posture (M14) | Split: mechanisms are infra day-1 (partly built already); pen-test verification stays M14 |
| 10 | DPIA / NDPA lawful basis | Field Pilot 1 with real reps + real HCP data (M2) | FID-81 compliance deliverables (M14) | DPIA + geotagging privacy check (HR/Legal, flagged in Fidson's own URS) must precede Pilot 1 |
| 11 | Basic rep onboarding material | Field Pilot 1 (M2), Pilot 2 (M6) | FID-54 training & materials (M14) | Thin quick-start guide per pilot; full training stays M14 |
| 12 | Rules engine (Layer-1 scoring) | FID-41 next-best-action (M11), AI coach cards | Not named anywhere | Create enabler: deterministic scoring job (recency, cadence, coverage, commitments). It is the spec's Layer 1 and currently has no ticket |

## B. Soft notes (acceptable rungs, record at refinement)

- Approval chains for M6-M8 (CM, expenses, discounts) may be hardcoded flows; FID-63 workflow builder (M13) later replaces them with configuration. Not a violation if recorded.
- FID-15 (M1) uses manager_id-level RBAC-lite; real matrix RBAC lands M5 (FID-92-94). Write the seam note in the ticket.
- FID-49 infrastructure provisioning (M1): repo/CI/IaC portion already done pre-Azure; remainder is the Azure day-1 checklist.
- FID-16 / FID-32 pilots are ceremonies (gates), not tasks; label `non-code`.

## C. Prototype coverage check

Method: full feature inventory of the prototype (every component read), each feature mapped to a board item. Result: ~85% of platform features map cleanly to existing items. Features with NO board coverage:

| Platform feature (component) | Proposed story/enabler | Suggested epic |
|---|---|---|
| Weekly itinerary builder + submit for RSM approval + daily adjustment requests w/ 3/day cap + DM auto-escalation (RepPlanView, RSMItinerariesView) | Confirms the MVS itinerary gap; rep-side and manager-side stories | Slice 2 |
| AI route optimizer (RepPlanView) | Confirms MVS route-optimization gap | Slice 5 |
| Customer 360 w/ LTV, timeline, key people (CustomersView) | Confirms earlier gap | Slice 2 |
| Rep performance vs target, 4-week bars (RepCoachView, PerformanceView) | Confirms MVS productivity gap | Slice 3 |
| Sales Admin order routing (zero-discount / booklet channel orders route to Sales Admin) (RepOrderView) | NEW: story + new persona "Sales Admin" | Slice 4 |
| Customer signature + LPO photo on order (RepOrderView) | Not a story: acceptance criteria of FID-33 | Slice 4 |
| Manager -> rep 1:1 message (RepDashboard "message from RSM") | NEW: story, distinct from broadcast directives (FID-107) | Slice 3 |
| Team coaching: notes, 1:1s, micro-coach, Coach Mode (ASMTeamView, ASMDashboard) | NEW: story (manager coaching log) | Slice 3 |
| Manager activity log, visible up-hierarchy (ASMActivityLogView) | Confirms URS gap ("PMs should also check in") | Slice 3 |
| Hierarchical report push: ASM->BM, DM->NSM weekly summaries (App.tsx inline) | NEW: story (approve & push report upward, per URS flow) | Slice 3 |
| Distributor management: stockout days, reorder, quarterly audit, onboarding (FSMDistributorsView, FSMDashboard) | Confirms MVS distributor gap; bigger than one story | Slice 4 |
| Global cross-entity search (TopBar) | NEW: story | Slice 3 |
| Directive acknowledgment by reps (RepDashboard, PMDirectivesView) | Confirms earlier gap (rep half of FID-107) | Slice 3 |
| Focus products: rep sees "My Products of Focus" (RepDashboard) | Confirms focus-products gap (manager sets, rep sees) | Slice 3 |
| In-app helpdesk/support chat (HelpdeskWidget) | Run-phase tooling (FID-10); not a build-phase story; note only | Run |
| Materials open-rate tracking (PMMaterialsView) | Fold into FID-105 AC or small story at refinement | Slice 3 |

Platform features intentionally NOT carried to production breakdown: email/password login (prod is Entra, FID-11), role switcher and demo credential autofill (demo artifacts).

## D. Bottom line

- 12 hard sequence violations, all fixable with 6 seed/split enablers and 2 pull-forwards; no milestone re-numbering required yet.
- 6 genuinely new items discovered from the platform (Sales Admin routing, 1:1 messaging, coaching, report push, global search, plus the confirmed MVS gaps).
- Next actions when we edit Jira: create the seed enablers in M1/M3, split FID-50/78/79, add DPIA-before-pilot, create the rules-engine enabler, add the new stories to epics, label ceremonies non-code.
