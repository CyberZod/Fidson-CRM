# Enabler Registry (internal — not on the Jira board)

Technical enablers and shared machinery that are **not user stories**. By our method ("machinery lives under its first consumer"; "the repo remembers, not Jira"), these never get a standalone board ticket. Each is **built as a subtask under the first story that needs it**, generalized as a small task under the second, and wired in cheaply after. This doc is the reference we check at refinement so consumer #3 doesn't rebuild an engine that already exists.

Columns: **Built under** = the first-consumer story where the enabler is created. **Reused by** = later stories that wire in (one small task each). **Config** = the config artifact it reads once the admin builder ships (hardcoded until then).

| Enabler | What it does | Built under | Reused by | Config | From board |
|---|---|---|---|---|---|
| **Scoping / RBAC engine** | enforces "I see only my slice": sales chain = geographic subtree, product chain = product scope; field-level overrides; four-layer enforcement (API, RAG, text-to-SQL, UI) | Story 3 (first scoped manager view — RSM sees own team) | every scoped story (all manager/PM/leadership) | Permission Matrix (77) | FID-25, 92, 93, 94 |
| **Approval flow engine** | routes a request to the right approver, returns a decision, escalates one tier up | Story 2 (approve plan) | 15, 23, 25, 38, 76, 80 | Approval Chain (65) | — (machinery) |
| **Offline sync engine** | local save + dedup sync + conflict detection | Story 71 (log offline and sync) | any offline capture; emits to 78 (conflict queue) | — | FID-13 (machinery half) |
| **Notification machinery** | deliver in-app / push / email alerts | first per-role alert story (late; workflows never depend on it) | approval, directive, escalation alerts | — | FID-30 |
| **MS Graph channel** | Teams notifications + Outlook calendar | under Notification machinery / Story 40 (joint-call calendar) | notifications, scheduling | — | FID-98 |
| **AI service + guardrails** | async, rate-limited, cost-controlled, human-in-the-loop AI invocation | first AI story built (19 or 73) | 19, 42, 50, 51, 57, 72, 73, 74 | Active Model (67) | FID-44 |
| **AI copilot chain** | multi-agent RBAC-gated text-to-SQL, query-template library, read-only replica execution, RAG guardrails (cite-or-refuse, PII redaction) | Story 57 (AI assistant) | — | Active Model (67), AI Rules (66) | FID-84, 85, 86, 87 |
| **Lead dedup matcher** | fuzzy-match a new contact against existing HCPs on creation | Story 7 (capture contact) | 75 (auto-assignment) | — | FID-88 |
| **HCP-to-outlet relationship model** | data model linking HCPs (Contact) to outlets (Account) | Story 10 (customer 360) | pipeline (12), 360 | — | FID-91 |
| **Sample-movements audit model** | NAFDAC-defensible append-only trail for samples | Story 8 (samples) | compliance reporting | — | FID-83 |

## Notes

- **Scoping is also an AC line, not only an engine.** Every scoped story carries the acceptance line "Given my role, I see only data within my scope." The engine enforces it once; the AC line is walked at each story's UAT. (Our "constraints are not stories" rule.)
- **Notifications never gate a workflow.** A workflow story is Done when its outcome is *visible* in the app (the request in the approver's queue). Alerts are an upgrade added to source stories only after the notification machinery exists; per-role notification stories are sequenced late.
- **Config seam.** Where an enabler has a Config entry, it runs on a **hardcoded** version until that admin builder ships (M5), then reads the produced artifact with no change to the consuming stories.
- **At refinement:** when a story is drilled into subtasks, check this table. If it's the "Built under" story, create the enabler subtask here. If it's a "Reused by" story, create only a small "wire in" subtask. Never a standalone board ticket.
