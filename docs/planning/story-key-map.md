# Story → FID key map

Written as issues are created (Step 1 of jira-execution-plan.md). Resume point if interrupted.

Releases: M1=`M1 - Mobilize + Vertical Slice`, M2=`M2 - Pilot 1 · Core Loop`, M3=`M3 - Pilot 2 · Oversight & Reporting`, M4=`M4 - Orders, ERP & AI`, M5=`M5 - UAT, Go-Live & National-Readiness`.

Keep untouched: FID-109, FID-110 (Done GitHub↔Jira wiring). Dissolved, never created: Story 33, Story 45.

| Story | FID key | Release |
|---|---|---|
| 56 | FID-112 | M1 |
| 1 | FID-113 | M2 |
| 2 | FID-114 | M2 |
| 3 | FID-115 | M2 |
| 4 | FID-116 | M2 |
| 71 | FID-117 | M2 |
| 78 | FID-118 | M2 |
| 6 | FID-119 | M3 |
| 7 | FID-120 | M3 |
| 8 | FID-121 | M3 |
| 9 | FID-122 | M3 |
| 10 | FID-123 | M3 |
| 11 | FID-124 | M3 |
| 12 | FID-125 | M3 |
| 14 | FID-126 | M3 |
| 15 | FID-127 | M3 |
| 16 | FID-128 | M3 |
| 17 | FID-129 | M3 |
| 21 | FID-130 | M3 |
| 22 | FID-131 | M3 |
| 23 | FID-132 | M3 |
| 26 | FID-133 | M3 |
| 27 | FID-134 | M3 |
| 28 | FID-135 | M3 |
| 29 | FID-136 | M3 |
| 30 | FID-137 | M3 |
| 31 | FID-138 | M3 |
| 32 | FID-139 | M3 |
| 34 | FID-140 | M3 |
| 35 | FID-141 | M3 |
| 36 | FID-142 | M3 |
| 37 | FID-143 | M3 |
| 38 | FID-144 | M3 |
| 39 | FID-145 | M3 |
| 40 | FID-146 | M3 |
| 41 | FID-147 | M3 |
| 43 | FID-148 | M3 |
| 44 | FID-149 | M3 |
| 46 | FID-150 | M3 |
| 47 | FID-151 | M3 |
| 48 | FID-152 | M3 |
| 49 | FID-153 | M3 |
| 69 | FID-154 | M3 |
| 70 | FID-155 | M3 |
| 74 | FID-156 | M3 |
| 75 | FID-157 | M3 |
| 76 | FID-158 | M3 |
| 79 | FID-159 | M3 |
| 80 | FID-160 | M3 |
| 5 | FID-161 | M4 |
| 13 | FID-162 | M4 |
| 18 | FID-163 | M4 |
| 19 | FID-164 | M4 |
| 20 | FID-165 | M4 |
| 24 | FID-166 | M4 |
| 25 | FID-167 | M4 |
| 42 | FID-168 | M4 |
| 50 | FID-169 | M4 |
| 51 | FID-170 | M4 |
| 52 | FID-171 | M4 |
| 53 | FID-172 | M4 |
| 54 | FID-173 | M4 |
| 55 | FID-174 | M4 |
| 57 | FID-175 | M4 |
| 62 | FID-176 | M4 |
| 66 | FID-177 | M4 |
| 67 | FID-178 | M4 |
| 72 | FID-179 | M4 |
| 73 | FID-180 | M4 |
| 58 | FID-181 | M5 |
| 59 | FID-182 | M5 |
| 60 | FID-183 | M5 |
| 61 | FID-184 | M5 |
| 63 | FID-185 | M5 |
| 64 | FID-186 | M5 |
| 65 | FID-187 | M5 |
| 68 | FID-188 | M5 |
| 77 | FID-189 | M5 |

**Step 1 complete: all 78 live stories created (FID-112 → FID-189).**
**Step 2 complete: 75 Relates links (producer→consumer artifact flow).**
**Step 3 complete: field-level contracts in seed-registry.md.**

## Step 4 — subtasks progress
Template per story: Contract & backend / Frontend / Integration & receiving-end demo (3), plus enabler subtask on "built-under" stories. Subtasks start at FID-190.

Enabler subtask placement (from enabler-registry.md): Approval flow→Story 2, Scoping/RBAC→Story 3, Offline sync→Story 71, Lead dedup→Story 7, Sample-movements audit→Story 8, HCP-to-outlet→Story 10, AI service+guardrails→Story 19, MS Graph→Story 40, AI copilot chain→Story 57, Notification machinery→Story 74.

- [x] M1/M2 stories: 56,1,2,3,4,71,78 (FID-190→213). Enablers done: 2,3,71.
- [x] M3 stories (42): DONE (FID-190→346). Enablers: dedup, sample-audit, HCP-outlet, MS Graph, Notification.
- [x] M4 stories (20): DONE (FID-347→402). Enablers: AI service→19, AI copilot→57.
- [x] M5 stories (9): DONE (FID-403→435). (RBAC engine built under Story 3; Permission Matrix feeds it.)

**Step 4 COMPLETE: subtasks for all 78 stories (FID-190 → FID-435).** 10 built-under enabler subtasks placed. The many "wire in <enabler>" subtasks for reused-by stories are deferred to refinement per the enabler registry (the repo remembers) rather than pre-created, to avoid board noise.

## ALL STEPS COMPLETE
- Step 1: 78 stories FID-112→189 (2 dissolved skipped).
- Step 2: 75 "Relates" links (producer→consumer artifact flow).
- Step 3: field-level contracts in seed-registry.md.
- Step 4: ~246 subtasks FID-190→435 (3 per story + 10 enabler subtasks).
Kept untouched: FID-109, FID-110.
