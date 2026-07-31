# Board Reconciliation (working doc — not Jira labels)

A checklist to turn the current FID board (110 issues) into a clean **user-stories + infra-tasks** board, using our story set ([user-stories.md](user-stories.md)). These action words are decisions for us; nothing here stamps the board. Once executed, the board is just stories + infra tasks, and this doc is discarded.

**Actions:** `upgrade` (replace board story with our sharper version) · `keep` (genuine story we adopt, rewrite to our format) · `fold` (becomes AC/receiving-end of one of our stories, not its own board item) · `→enabler` (leave the board; goes to the internal enabler list; born later as a subtask under its consuming story) · `infra-task` (stays as a standalone Task) · `spike` · `drop` · `add` (our story, not on the board yet).

**Tally:** ~26 upgrade · ~24 keep · 3 fold · ~14 →enabler · ~23 infra-task · 2 spike · 2 drop · ~14 add.

---

## Epics — keep as milestone containers

FID-1..10 (Discovery, Architecture, Slice 1-5, Hardening, Training, Run) and FID-59 (Admin Portal), FID-60 (AI Governance), FID-61 (NFRs). These map onto the 5 Fidson payment milestones and stay as the epic/slice structure. No change except possibly renaming to match the 5-milestone view later.

## `upgrade` — board core stories replaced with our sharper versions

| Board | Summary | → our story |
|---|---|---|
| FID-11 | Sign in with Entra SSO | 56 |
| FID-12 | Check in with GPS | 3 |
| FID-14 | Core visit details | 4 |
| FID-17 | Plan the day | 1 |
| FID-18 | Full detailing record | 4 (detailing part) |
| FID-19 | Samples issued | 8 |
| FID-20 | Capture contact + consent | 7 |
| FID-21 | Contact through pipeline | 12 + 22 |
| FID-23 | Approved content offline | 21 |
| FID-24 | Competitor signals | 6 |
| FID-26 | Coverage & compliance dashboards | 27 |
| FID-28 | Clinical meeting request+approve | 14 + 15 (split) |
| FID-31 | National leadership dashboard | 49 |
| FID-33 | Order from visit | 5 |
| FID-35 | Discount thresholds + approval | 24 + 25 (split) |
| FID-37 | Statement of Account | 13 |
| FID-41 | Role insights + next-best-action | 19 + 42 + 51 |
| FID-43 | Churn / forecasting | 50 + 51 |
| FID-101 | Daily Call Report | 9 |
| FID-102 | Customer-inventory audit | 17 |
| FID-103 | Itinerary governance + adjustments | 16 + 23 (split) |
| FID-104 | Accompaniment / joint calls | 40 + 29 |
| FID-105 | Content approval workflow | 43 + 44 (split) |
| FID-106 | Promo request/approval | 37 + 38 + 39 |
| FID-107 | Directives broadcast + ack | 34 + 35 + 47 + 48 |
| FID-108 | Campaigns / ROI | 46 |

## `keep` — genuine enterprise/other stories we adopt (rewrite to our format)

| Board | Summary | Note |
|---|---|---|
| FID-13 | Offline log auto-sync | our set had this as a "Later" addition; promote to a real story |
| FID-29 | Expenses + approval | our "Parked: expenses" — confirm scope first |
| FID-34 | Business Central sync (stock/pricing/customers) | = our 62 (ERP sync) |
| FID-39 | Voice visit logging | our "Later" on 4; promote to a story |
| FID-40 | AI pre-fill / summarise visit | our "Later" on 4; promote to a story |
| FID-42 | Geo-coverage anomaly detection | an AI addition we didn't number; keep |
| FID-62 | Form builder | admin self-config |
| FID-63 | Workflow builder | admin self-config (the config layer over our approval flow) |
| FID-64 | Organigramme editor | = our 58 (manage people) |
| FID-65 | Permission matrix editor | admin config (distinct from RBAC enforcement, which is enabler) |
| FID-66 | Territory editor | = our 59 (manage territories) |
| FID-67 | Product catalogue manager | = our 61 (manage catalogue) |
| FID-68 | AI rules-engine editor | admin authoring |
| FID-69 | Sync conflict-resolution queue | admin-review side of offline sync |
| FID-70 | Config audit log + sign-off | admin story |
| FID-71 | Model catalogue | AI-gov admin |
| FID-72 | Per-use-case model assignment | AI-gov admin |
| FID-73 | Live spend dashboard | AI-gov admin |
| FID-74 | Budget thresholds + alerts | AI-gov admin |
| FID-75 | One-click model swap | AI-gov admin |
| FID-89 | Automated lead assignment by territory | system feature; keep |
| FID-90 | Lead SLA-breach escalation | keep |
| FID-95 | 25+ standard report pack | reporting |
| FID-96 | Custom report builder | keep, but **fix invented "Reports Author" persona** |
| FID-97 | Scheduled report distribution + export | reporting |

## `fold` — becomes AC / receiving-end of one of our stories

| Board | Summary | Folds into |
|---|---|---|
| FID-15 | Manager sees team visits | our 3 (receiving end of check-in) |
| FID-22 | Next steps + reminders | our 4 (visit log) |
| FID-36 | Invoice auto-generates on order | our 5 (produces Invoice) + 20 (view) |

## `→enabler` — leave the board; internal enabler list; born as a subtask later

| Board | Summary | First-consumer story |
|---|---|---|
| FID-25 | Role-based access (see only my slice) | scoping constraint → AC on every scoped story + RBAC engine |
| FID-30 | Real-time notifications | notification machinery (per-role alert stories come late) |
| FID-44 | AI service guardrails (async, rate-limit, cost, HITL) | AI service, under first AI story |
| FID-83 | sample_movements data model (NAFDAC) | subtask under 8 (samples) |
| FID-84 | Copilot text-to-SQL hardening | under 57 (AI assistant) |
| FID-85 | Parameterised query templates | under 57 |
| FID-86 | Read-only replica execution + audit | under 57 |
| FID-87 | RAG guardrails (cite-or-refuse, PII, RBAC) | under 57 |
| FID-88 | Lead dedup fuzzy match | under 7 (capture contact) |
| FID-91 | HCP-to-outlet relationship graph | data model under Account/Contact |
| FID-92 | Dual-chain RBAC | scoping engine |
| FID-93 | Field-level permission overrides | scoping engine |
| FID-94 | Four-layer permission enforcement | scoping engine |
| FID-98 | MS Graph (Teams/Outlook) | subtask under notifications |

## `infra-task` — stays as a standalone Task

FID-16, FID-32 (field pilots), FID-45 (discovery), FID-46 (requirements sign-off), FID-48 (architecture), FID-49 (Azure provisioning), FID-50 (migration setup), FID-51 (SIT/UAT), FID-52 (load/DR testing), FID-53 (pen testing), FID-54 (training), FID-55 (change mgmt), FID-56 (rollout), FID-57 (operating model/SLA), FID-58 (usage analytics), FID-77 (observability), FID-78 (audit/retention), FID-79 (security posture), FID-80 (DR), FID-81 (compliance/DPIA/NITDA), FID-82 (cost NFRs), FID-109 + FID-110 (GitHub-Jira wiring, already Done).

## `spike` — keep

FID-38 (Business Central integration approach), FID-76 (DeepSeek candidate).

## `drop`

| Board | Summary | Why |
|---|---|---|
| FID-99 | Outbound webhook framework | no named consumer (YAGNI); revive if one appears |
| FID-100 | Public REST API (OpenAPI) | no named external consumer (YAGNI) |

(FID-47 already Cancelled — leave.)

## `add` — our stories not yet on the board

| Our | Story | Note |
|---|---|---|
| 10 | My Customers (360) | board has pipeline (FID-21), not a 360 |
| 11 | My numbers vs targets (rep self-view) | not on board |
| 18 | Optimize my day's route | not on board (or fold into plan) |
| 26 | Set my team's targets (manager) | produces Targets; not on board |
| 28 | Manager logs own field visit | distinct from accompaniment (FID-104) |
| 30 | Direct message to a rep | not on board |
| 31 | Push periodic summary upward | not on board |
| 32 | Set focus products per rep/territory | not on board |
| 52 | Distributor directory (FSM) | **whole Trade channel missing from board** |
| 53 | Distributor stock health | " |
| 54 | Reorder to distributor at risk | " |
| 55 | Quarterly distributor audit | " |
| 60 | Manage accounts (admin) | account master mgmt; board has territory/catalogue editors but not account onboarding |
| 63 | Assign products to PMs (Product Assignment) | PM↔product ownership; not on board |

---

## What this yields when executed

- Board = **user stories** (upgraded core + adopted enterprise + our adds) **+ infra/process tasks + spikes**. Clean.
- ~14 enablers leave the board into an internal **enabler registry** (next artifact), to be born as subtasks under their consuming story at refinement.
- 2 drops, 3 folds.
- Then: map every remaining story to the 5 milestones + tap list, and wire Requires/Produces as Jira issue links.
