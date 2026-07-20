# Story Inventory (working document)

The stories-first sweep of 2026-07-17: every board item classified, walked persona by persona, gaps hunted. This file is edited live during review sessions; when it settles, it drives the Jira restructure (type changes, rewrites, new stories).

Legend: ✅ true user story · 🔧 feature-shaped, needs As-a/I-want/So-that rewrite · ⚙ enabler (technical, legitimately not a story) · 🎪 ceremony/verification (non-code) · ❓ gap candidate (story we may be missing)

Review status: ⬜ not reviewed · 🔍 in review · ✔ settled

## Rep (17 + gaps)

| | Key | Current title | Class |
|--|--|--|--|
| ⬜ | FID-11 | Rep signs in with Microsoft Entra ID (SSO) | ✅ |
| ⬜ | FID-12 | Rep checks in to a visit with automatic GPS capture | ✅ |
| ⬜ | FID-13 | Rep logs a visit offline; it auto-syncs without duplicates | ✅ |
| ⬜ | FID-14 | Rep logs core visit details (single source of truth) | ✅ |
| ⬜ | FID-17 | Rep plans the day against assigned territory | ✅ |
| ⬜ | FID-18 | Rep records the full detailing record for a call | ✅ |
| ⬜ | FID-19 | Rep logs samples issued on a call | ✅ |
| ⬜ | FID-20 | Rep captures a new contact on the spot, with consent | ✅ |
| ⬜ | FID-21 | Rep moves a contact through the pipeline to customer | ✅ |
| ⬜ | FID-22 | Rep sets next steps and reminders on a visit | ✅ |
| ⬜ | FID-23 | Rep accesses approved marketing content offline | ✅ |
| ⬜ | FID-24 | Rep captures competitor signals from the field | ✅ |
| ⬜ | FID-28 | Rep requests and manager approves a clinical meeting | ✅ (two-persona) |
| ⬜ | FID-29 | Rep submits expenses and manager approves them | ✅ (two-persona) |
| ⬜ | FID-33 | Rep places an order from a visit | ✅ |
| ⬜ | FID-37 | Rep sees customer Statement of Account (SOA) from ERP | ✅ |
| ⬜ | FID-39 | Rep logs a visit by voice with Fidson-specific vocabulary | ✅ |
| ⬜ | FID-101 | Daily Call Report (DCR) auto-generation and submission | 🔧 |
| ⬜ | FID-102 | Customer-inventory audit and restock recommendations | 🔧 |
| ⬜ | ❓ | Rep sees a customer 360 (full history) before walking into a call | ❓ |
| ⬜ | ❓ | Rep sees own performance vs targets | ❓ |
| ⬜ | ❓ | Rep acknowledges directives from management | ❓ (rep half of FID-107) |
| ⬜ | ❓ | Rep corrects a visit log within a grace window | ❓ |

## Manager (8 + gaps)

| | Key | Current title | Class |
|--|--|--|--|
| ⬜ | FID-15 | Manager sees their team's logged visits (near real-time) | ✅ |
| ⬜ | FID-25 | Manager sees only their part of the hierarchy | ✅ |
| ⬜ | FID-26 | Manager sees coverage & compliance dashboards with drill-down | ✅ |
| ⬜ | FID-27 | Manager delegates oversight and escalates issues | ✅ |
| ⬜ | FID-103 | Itinerary governance and daily adjustments | 🔧 |
| ⬜ | FID-104 | Accompaniment and joint-call scheduling (coaching) | 🔧 |
| ⬜ | FID-107 | Directives broadcast and acknowledgment | 🔧 |
| ⬜ | FID-35 | Discount thresholds govern order pricing with approvals | 🔧 (manager approves) |

## Leadership / National / Exec (5)

| | Key | Current title | Class |
|--|--|--|--|
| ⬜ | FID-31 | Leadership sees a native, real-time national dashboard | ✅ |
| ⬜ | FID-41 | Role-specific insights and next-best-action | 🔧 |
| ⬜ | FID-42 | Geo-coverage anomaly detection flags unusual activity | 🔧 |
| ⬜ | FID-43 | Churn-risk and forecasting with explained drivers | 🔧 |
| ⬜ | FID-108 | Campaigns and ROI tracking | 🔧 |

## Reports Author (3)

| | Key | Current title | Class |
|--|--|--|--|
| ⬜ | FID-95 | 25+ standard report pack | 🔧 |
| ⬜ | FID-96 | Custom report builder (Reports Author role) | 🔧 |
| ⬜ | FID-97 | Scheduled report distribution + PDF/Excel export | 🔧 |

## Admin (15)

| | Key | Current title | Class |
|--|--|--|--|
| ⬜ | FID-62 | Visual form builder | 🔧 |
| ⬜ | FID-63 | Workflow builder | 🔧 |
| ⬜ | FID-64 | Organigramme editor | 🔧 |
| ⬜ | FID-65 | Permission matrix editor | 🔧 |
| ⬜ | FID-66 | Territory editor | 🔧 |
| ⬜ | FID-67 | Product catalogue manager | 🔧 |
| ⬜ | FID-68 | AI rules-engine editor | 🔧 |
| ⬜ | FID-69 | Offline-sync conflict-resolution queue | 🔧 |
| ⬜ | FID-70 | Configuration audit log + sign-off | 🔧 |
| ⬜ | FID-71 | Model catalogue | 🔧 |
| ⬜ | FID-72 | Per-use-case model assignment | 🔧 |
| ⬜ | FID-73 | Live spend dashboard | 🔧 |
| ⬜ | FID-74 | Budget thresholds and spend alerts | 🔧 |
| ⬜ | FID-75 | One-click model swap with audit trail | 🔧 |
| ⬜ | FID-76 | DeepSeek V4 Flash compliance-gated candidate | ⚙ |

## Cross-persona workflows (5)

| | Key | Current title | Class |
|--|--|--|--|
| ⬜ | FID-30 | Users get real-time notifications for approvals and escalations | ✅ |
| ⬜ | FID-36 | Invoice auto-generates on confirmed order | 🔧 |
| ⬜ | FID-40 | AI pre-fills and summarises a rep's visit (HITL) | ✅-ish |
| ⬜ | FID-105 | Content/material approval workflow | 🔧 |
| ⬜ | FID-106 | Promo request submission and approval workflow | 🔧 |

## Enablers: legitimately not stories (⚙, 22)

FID-34 (BC sync), FID-38 (spike), FID-44, FID-49, FID-78, FID-79, FID-80, FID-81, FID-82, FID-83, FID-84, FID-85, FID-86, FID-87, FID-88, FID-89, FID-90, FID-91, FID-92, FID-93, FID-94, FID-98, FID-99, FID-100. These stay technical; several are large enough to be epics of enabler tasks. Not rewritten as stories; users don't experience them directly.

## Ceremonies / verification (🎪, 13)

FID-16, FID-32 (pilot gates) · FID-45, FID-46, FID-47, FID-48 (Phase 0) · FID-50, FID-51, FID-52, FID-53 (verify) · FID-54, FID-55, FID-56 (rollout). Label `non-code`; never auto-move.

## Gap candidates parked for later personas

- Admin: audit search ("As a compliance officer, I want to trace who changed X")
- Manager: manager approves/reviews visit logs? (decide: is review part of the loop?)
- Manager: sets focus products per rep/territory (feeds rules-engine coverage scoring)
- Exec: board-pack export?

## Gaps found against Fidson's MVS checklist (SFA_CRM_Process_Flow URS, May 2026)

Source: Fidson's "Minimum Viable System" page + flow annotations. These are client must-haves.

- ❓ Rep: route optimization (best daily route; planned vs actual visits tracked)
- ❓ Rep: weekly itinerary plan, lockable, submitted night-before/mid-day
- ❓ Manager (RSM): itinerary approval with delegation when approver unavailable
- ❓ Rep/Manager: complaint and issue logging, tracked to closure
- ❓ Manager: distributor/dealer management (orders, credits, inventory visibility; quarterly stock check)
- ❓ Rep: performance vs expectations (weekly, targets vs achieved)
- ❓ Exec/HR: manager supervision performance measurement (managers are measured too)
- ❓ Manager/PM: managers' own activity logs, capture-able by hierarchy ("PMs should also be able to check in")
- ❓ Marketing: marketing log (conferences, promotional items ordering)
- ❓ Rep: quote & proposal generation with AI-enforced pricing
- Scope note: first-cut ordering = deep link into existing SOA app (cheap); full Business Central sync (FID-34) stays later.

## New items found by the platform coverage audit (see sequence-audit.md)

- ❓ Sales Admin: processes zero-discount / booklet-channel orders routed by the system (new persona)
- ❓ Manager: sends a 1:1 message to a rep (distinct from broadcast directives)
- ❓ Manager: keeps a coaching log per rep (notes, 1:1s, micro-coaching)
- ❓ Manager: approves & pushes weekly summary report up the hierarchy (ASM->BM, DM->NSM)
- ❓ All roles: global cross-entity search (reps/HCPs/orders)
- AC note: customer signature + LPO photo belong inside FID-33's acceptance criteria
- Enabler found earlier: seed product catalogue from Fidson price list (needed by FID-18's milestone).
