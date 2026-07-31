# Jira Execution Plan (post-compaction runbook)

Everything needed to push the v2 story set to the FID board and build it out. The board was **wiped clean except FID-109 and FID-110** (Done GitHub↔Jira wiring tasks, keep, do not touch). Five releases were created. Read this top to bottom, then execute.

## Constants

- **cloudId:** `349a55e0-4206-4377-87dd-c68de133b9f0`
- **project key:** `FID`
- **Issue type names:** `Story`, `Subtask` (also Task, Epic, Bug, Spike exist). ids: Story 10064, Subtask 10062, Task 10063, Epic 10061.
- **Tools:** `mcp__claude_ai_Atlassian_Rovo__createJiraIssue`, `editJiraIssue`, `createIssueLink`, `getIssueLinkTypes`, `searchJiraIssuesUsingJql`. There is **no delete tool and no version-create tool** (the user handles deletions and releases).
- **Keep:** FID-109, FID-110. Don't modify.
- **Releases (fixVersion names) — CONFIRM exact strings with the user before Step 1.** Assumed:
  - `M1 · Mobilise + Vertical Slice`
  - `M2 · Pilot 1 · Core Loop`
  - `M3 · Pilot 2 · Oversight & Reporting`
  - `M4 · Orders, ERP & AI`
  - `M5 · UAT, Go-Live & National-Readiness`

## Source docs (read these during execution)

- **user-stories.md** — the 80 stories in full (Description / Requires / Produces / AC / Note). **Stories 33 and 45 are DISSOLVED tombstones, DO NOT create them.** Live stories = 78.
- **milestone-map.md** — story → milestone assignment (mirrored compactly below).
- **seed-registry.md** — the artifacts; becomes the field-level contracts in Step 3.
- **enabler-registry.md** — enablers → first-consumer story; drives enabler subtasks in Step 4.
- **board-reconciliation.md** — reference for what each old FID item became.

## Locked decisions

- Milestones = Jira **Releases** (fixVersion). **No milestone epics, no epics at all** for now.
- **No story-to-story "blocks."** Contracts + seeds decouple stories (a consumer is Done against a seeded input; it never waits on the producer's code). Links are **"Relates"** only, to document artifact flow — informational, not blocking.
- **Contracts live in the repo registry, not Jira**, and are written **before** subtasks (contract-first).
- Config is just data: every artifact is a fixed-shape contract with a swappable source (hardcode → seed → hand-load → sync). Consumers bind to the shape.

## Story → release map

- **M1:** 56
- **M2:** 1, 2, 3, 4, 71, 78
- **M3:** 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 21, 22, 23, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37, 38, 39, 40, 41, 43, 44, 46, 47, 48, 49, 69, 70, 74, 75, 76, 79, 80
- **M4:** 5, 13, 18, 19, 20, 24, 25, 42, 50, 51, 52, 53, 54, 55, 57, 62, 66, 67, 72, 73
- **M5:** 58, 59, 60, 61, 63, 64, 65, 68, 77

## Step 1 — Create the 78 stories

For each live story (skip 33, 45), `createJiraIssue`:
- `projectKey: FID`, `issueTypeName: "Story"`
- `summary` = the story's title (e.g. "Draft and submit my plan (rep)")
- `description` = the full story block (Description, Requires, Produces, Acceptance Criteria, Note) as markdown, copied from user-stories.md
- `additional_fields`: `{ "fixVersions": [{ "name": "<the release name for its milestone>" }] }` (labels optional, e.g. persona/area)
- Go in milestone/dependency order: M1 → M2 → M3 → M4 → M5.
- **As each is created, append `story# → FID-key` to `docs/planning/story-key-map.md`** so linking and subtasks can resolve keys and the work survives interruption.

## Step 2 — Links (Relates)

- First `getIssueLinkTypes` to get the exact name (expected "Relates").
- For each story, for each **Requires that another story produces** (per the registry's Produced-by / Required-by), create a `createIssueLink` type "Relates" between the two FID keys.
- **Skip** Requires that are seeds/foundational (People & Reporting Lines, Territory Assignments, Account, Product Catalog, Statement of Account, etc.) — no producer story, they're milestone taps, not links.

## Step 3 — Contracts (repo, before subtasks)

- Extend **seed-registry.md**: give each artifact a **field-level schema** (the fields it carries, with types). This is the contract-first deliverable. Do this for all ~45 artifacts, foundational ones first.

## Step 4 — Subtasks (Jira, under each story)

- After contracts. For each story, create a lean set of `Subtask` issues (`issueTypeName: "Subtask"`, `parent: <story FID-key>`). Template:
  - `Contract & backend — <produced artifact>` (skip for view-only stories that Produce "—")
  - `Frontend / UI`
  - `Integration & receiving-end demo`
- **Plus enabler subtasks** from enabler-registry.md: where an enabler is "built under" this story, add a subtask for it (e.g. under Story 2 "Approval flow engine"; Story 3 "Scoping / RBAC engine"; Story 71 "Offline sync engine"; Story 7 "Lead dedup matcher"; Story 57 "AI copilot chain"; Story 8 "Sample-movements audit model"; Story 10 "HCP-to-outlet model"; first AI story "AI service + guardrails"; late alert story "Notification machinery"). "Reused by" stories get a small `Wire in <enabler>` subtask.

## Execution notes

- This is large (~78 stories + links + ~250 subtasks). Work in **batches by release**, and keep `story-key-map.md` current so a mid-run compaction/interruption can resume.
- If a `fixVersions` name mismatch errors, stop and re-confirm the exact release strings with the user.
