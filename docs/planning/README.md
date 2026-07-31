# Planning docs — and the single source of truth

**User stories and milestones live in Jira (project FID on talesconsulting.atlassian.net), nowhere else.** Stories are FID issues with subtasks; milestones are Jira Releases (fixVersions). Never maintain a second copy here.

**The drafting convention:** new or changed stories/milestones may be drafted in a temporary markdown file for review — once approved and pushed to Jira, **the draft is deleted**. That is why user-stories.md, milestone-map.md, story-key-map.md, jira-execution-plan.md, dependency-network.md and method.md no longer exist (their content is in Jira, or generalized into the Tales knowledge base). Full pre-cleanup drafts are recoverable from git history (commit "Snapshot planning docs before Jira-SSOT cleanup").

## What lives here (things Jira can't hold)

| Doc | What it is |
|---|---|
| [seed-registry.md](seed-registry.md) | **The artifact registry** — the produced-by/required-by graph, seeded-vs-real status per artifact, shape designs (planning drafts; Pydantic models in fidrep are the shape source of truth), and the story#→FID key map |
| [enabler-registry.md](enabler-registry.md) | Shared engines → their first-consumer story; checked at refinement so machinery isn't rebuilt |
| [architecture-ports-and-adapters.md](architecture-ports-and-adapters.md) | The concepts explainer (contracts, ports, adapters, cores, enablers) |
| [kickoff-asks-and-milestones.md](kickoff-asks-and-milestones.md) | Client-facing: what we need from Fidson per milestone, what they can test |
| [infrastructure-run-costs.md](infrastructure-run-costs.md) | Infra cost model |
| [screens/](screens/) | Prototype screen sweeps (element → story audits) |
| [board-reconciliation.md](board-reconciliation.md), [board-snapshot/](board-snapshot/) | **Archive** — how the old board mapped to the v2 stories, and the lossless snapshot of the pre-wipe board (restore point) |

Build rules and the story-development runbook live in the **fidrep** repo (`docs/`), next to the code.
