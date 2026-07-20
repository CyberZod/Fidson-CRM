# Master Story List (canonical, v1 draft 2026-07-20)

Every user story for FidRep, final form. Existing board keys kept; NEW-x = to be created in Jira. Format: story · labels · needs (dependency notes; "seed:" = data import someone must do first; resolved into tasks at refinement, never blocks writing).

Excluded by design: 24 technical enablers (BC sync, RBAC enforcement, guardrails, etc.) and 13 ceremonies; they attach later as dependencies/gates.

⚠ = has an open question for the product owner (listed at the bottom).

## Rep

- **FID-11** As a rep, I want to sign in with my existing Fidson Microsoft account, so that I don't manage another password and IT can revoke my access instantly. · `rep-app` · needs: Entra tenant config (Azure)
- **FID-12** ⚠ As a rep, I want my arrival at a facility captured automatically with GPS, so that my presence is provable without me doing anything. · `rep-app` · needs: seed facilities; policy decision: evidence vs enforcement
- **FID-13** As a rep, I want visits I log without signal to save and sync themselves, so that no field work is ever lost or double-counted. · `rep-app` `visit-form` · needs: FID-14
- **FID-14** As a rep, I want to create the basic record of a visit (who I saw, where, when, a short note), so that the visit exists once, in one system, and everything else about the call can attach to it. (Deliberately minimal: detailing, samples, next steps, intel are separate stories that add sections to this record.) · `rep-app` `visit-form` · needs: seed facilities, FID-11
- **FID-17** As a rep, I want to plan my day from the facilities in my territory, so that my itinerary matches where I'm accountable. · `rep-app` · needs: seed territories + assignments
- **FID-18** As a rep, I want to record which products I detailed and how the conversation went, so that my call history shows what was discussed, not just that I showed up. · `rep-app` `visit-form` · needs: seed product catalogue, FID-14
- **FID-19** As a rep, I want to log every sample I hand over, so that samples I can't account for never become my problem. · `rep-app` `visit-form` · needs: seed catalogue, FID-14
- **FID-20** As a rep, I want to capture a new HCP's details the moment I meet them, with consent recorded, so that no lead evaporates between the corridor and my car. · `rep-app` · needs: FID-14 (capture happens on visits)
- **FID-21** As a rep, I want to advance my contacts stage by stage until they order, so that I always know who is close to converting. · `rep-app` · needs: FID-20
- **FID-22** As a rep, I want to note what happens next with each customer and be reminded, so that follow-ups stop depending on my memory. · `rep-app` `visit-form` · needs: FID-14; in-app reminders first (push notifications later via FID-30)
- **FID-23** As a rep, I want approved marketing content available offline, so that I detail with current materials even without signal. · `rep-app` · needs: seed content bundle (management workflow FID-105 comes later)
- **FID-24** As a rep, I want to flag competitor activity I see in the field, so that the company hears market signals the day they happen. · `rep-app` `visit-form` · needs: FID-14
- **FID-28** As a rep, I want to request a clinical meeting (topic, date, attendees, budget) and get the PM's decision with reasons, so that I can plan events without chasing approvers. (Minimum loop: request + PM decision. High-impact tier split to NEW-20.) · `rep-app` `manager` · needs: approval flow (hardcoded rung ok), FID-30 for notifications later
- **FID-29** As a rep, I want to submit actual expenses and get reimbursed quickly, so that I'm never out of pocket for doing my job. (Distinct from FID-28's budget pre-approval; AC: a CM expense claim references its approved budget.) · `rep-app` `manager` · needs: approval flow
- **FID-33** As a rep, I want to place an order during the visit, so that intent becomes a transaction before I leave the building. AC includes: customer signature, LPO photo, out-of-stock split to Order Booklet. · `rep-app` `orders` · needs: seed catalogue + pricing; SOA deep link (full ERP sync later)
- **FID-37** As a rep, I want to see my customer's statement of account, so that I walk into money conversations informed. · `rep-app` `orders` · needs: SOA deep link rung (native view after ERP sync)
- **FID-39** As a rep, I want to log a visit by speaking, with Fidson's product names understood, so that logging takes a minute in the car, not an evening at home. · `rep-app` `ai` · needs: FID-14, AI service
- **FID-101** As a rep, I want my Daily Call Report generated from what I already logged, so that end-of-day reporting takes zero extra typing. · `rep-app` · needs: FID-14/18 data
- **FID-102** As a rep, I want to record a customer's stock during a visit and see restock suggestions, so that I catch empty shelves before competitors do. · `rep-app` `visit-form` · needs: seed catalogue, FID-14
- **NEW-1** As a rep, I want a My Customers view with a full 360 per customer (visit history, orders, commitments, LTV, key people), so that I never open cold with someone we've known for years. (This is the prototype's CustomersView, productized. AI suggestions on the same data are FID-41, separate.) · `rep-app` · needs: FID-14/33 data accrues
- **NEW-2** As a rep, I want to see my numbers against my targets each week, so that I know where I stand before my manager tells me. · `rep-app` · needs: targets data (seed or manager-set)
- **NEW-3** As a user receiving a directive (any level), I want to acknowledge it on record, so that senders see who has seen what and re-sending stops. · `rep-app` `manager` · needs: FID-107 (directives exist)
- **NEW-4** ⚠ As a rep, I want to correct a visit log within a short window, so that a typo doesn't become a permanent false record. · `rep-app` · needs: FID-14; policy: window length + audit trail of edits
- **NEW-5** As a rep, I want to draft my weekly itinerary and submit it for approval, locked once approved, so that my week is agreed once and defended from churn. · `rep-app` · needs: FID-17, FID-103 (manager approval side)
- **NEW-21** As a rep, I want to request a daily itinerary change (add or swap, with reason, capped per day), so that real life can amend the plan without dissolving it. · `rep-app` · needs: NEW-5, FID-103
- **NEW-6** As a rep, I want my day's route optimized around fixed appointments, so that I spend the day with customers, not in traffic. · `rep-app` `ai` · needs: NEW-5, seed facility locations
- **NEW-7** ⚠ As a rep, I want to generate a quote/proposal with enforced pricing, so that what I promise a customer is always a price the company honors. · `rep-app` `orders` · needs: catalogue + pricing rules; scope question
- **NEW-8** ⚠ As a rep or manager, I want to log a complaint or field issue (customer delivery/pricing problems, distributor stockouts) and see it tracked with a status until closed, so that field issues stop dying in WhatsApp. · `rep-app` `manager` · needs: scope question (customer complaints, internal issues, or both?)

- **NEW-20** As a PM, I want high-impact (multi-regional) clinical meeting requests escalated to the HoM for final sign-off, so that big-budget events get senior eyes without slowing routine ones. · `marketing` `manager` · needs: FID-28

## Managers (role named when the job is role-specific; shared behaviors stay one story with AC per level)

- **FID-15** As a manager, I want to see my team's visits as they happen, so that I know the field without chasing reports. · `manager` · needs: FID-14, seed hierarchy (manager_id rung; full RBAC later)
- **SCOPING CONSTRAINT (not a story; formerly FID-25/NEW-22):** every hierarchy-scoped story carries the AC line "Given my role, I see only data within my scope." Two scoping rules: sales chain = geographic subtree (ASM->RSM->DM->NSM->ADC->CD); product chain = own products across all territories (PM/MM/HoM, BM/BMD by brand). Enforced once by the RBAC enablers (FID-92/93/94). The FID-25 ticket retires into these at the Jira rebuild.
- **FID-26** As a manager, I want coverage and compliance dashboards with drill-down, so that I coach from patterns, not anecdotes. · `manager` · needs: FID-14/12 data
- **FID-27** As a manager, I want to delegate my approvals when I'm unavailable and escalate issues upward, so that the field never stalls waiting for one person. ("Upward"/"delegate" resolve via the hierarchy + approval flow as sources of truth; AC names the concrete chains.) · `manager` · needs: approval flow, hierarchy
- **FID-35** As a manager, I want discount requests above threshold routed to me with context and AI recommendation, so that pricing stays controlled without slowing honest orders. · `manager` `orders` · needs: FID-33, pricing rules
- **FID-103** As a manager (RSM), I want to approve or reject weekly itineraries and daily adjustment requests, with auto-escalation to my DM when I'm unavailable, so that plans are governed without becoming bottlenecks. · `manager` · needs: NEW-5, hierarchy
- **FID-104** As a manager or PM, I want to schedule joint calls and log accompaniments, so that coaching happens in the field, on record. · `manager` · needs: NEW-5 (itineraries), hierarchy
- **FID-107** As a manager (PM/NSM/exec), I want to send a directive to a chosen audience and have every targeted person see it in their app, so that alignment doesn't depend on forwarded WhatsApps. (Minimal loop: send + recipients see; the demo is both screens. Ack tracking is NEW-3, ships after. Sender-role variations = AC.) · `manager` · needs: hierarchy
- **NEW-9** As a manager, I want to set focus products per rep or territory, so that detailing effort follows current strategy. · `manager` · needs: seed catalogue, hierarchy
- **NEW-10** As a manager, I want to send a direct message to one rep in-app (including short coaching nudges), so that field guidance lives where field work lives, not in WhatsApp. · `manager` · needs: hierarchy
- **NEW-11** As a manager (ASM), I want a coaching log per rep (dated notes and scheduled 1:1s), so that development is deliberate and its record survives manager changes. (Nudges moved to NEW-10.) · `manager` · needs: hierarchy, FID-15 data
- **NEW-12** As an ASM, I want to compose my weekly area summary and push it to my BM, who receives it in-app, so that upward reporting is one click, not an evening. (Two-sided loop: AC covers send + receive.) · `manager` · needs: dashboards data, hierarchy
- **NEW-27** As an RSM, I want to compose my weekly regional summary and push it to my DM, who receives it in-app, so that regional reporting is one click. · `manager` · needs: dashboards data, hierarchy
- **NEW-28** As a DM, I want to compose my divisional summary and push it to my NSM, who receives it in-app, so that national leadership reads current divisions, not stale decks. · `manager` · needs: dashboards data, hierarchy
- **NEW-23** As any pushing manager, I want my summary auto-drafted from my team's actual data for me to edit before pushing, so that the report writes itself and I only add judgment. (Upgrade on the NEW-12/27/28 family.) · `manager` `ai` · needs: NEW-12 family, AI service
- **NEW-13** ⚠ As a senior manager, I want one view of how each manager under me manages, so that supervision performance is measured, not assumed. (One behavior; its metrics are outputs of other stories and appear via AC as each source ships: approvals turnaround from the approval flow, coaching activity from NEW-11, review completion from DCR review, field presence from NEW-14.) · `manager` · needs: those source stories; sensitivity question
- **NEW-14** As a manager or PM, I want my own field check-ins and activity captured, visible up my hierarchy, so that supervision is provable the same way rep work is. (Joint calls/accompaniments belong to FID-104, not here.) · `manager` · needs: FID-12 machinery reused
- **NEW-15** As an FSM, I want a distributor directory where I onboard and manage distributor details, so that the trade channel has one source of truth for who sells for us. · `manager` `orders` · needs: seed distributor data
- **NEW-24** As an FSM, I want each distributor's stock health visible (levels, days-to-stockout), so that supply problems surface before shelves go empty. · `manager` `orders` · needs: NEW-15, order/stock data
- **NEW-25** As an FSM, I want to push a reorder to a distributor at risk of stockout, so that seeing the problem and acting on it are one motion. · `manager` `orders` · needs: NEW-24, FID-33
- **NEW-26** As an FSM, I want a quarterly distributor audit checklist tracked to completion, so that the quarterly stock check Fidson mandates actually happens and is on record. · `manager` `orders` · needs: NEW-15

## Leadership / National / Exec

- **FID-31** As a national leader, I want a live national dashboard (divisions, pipeline, forecast), so that I see the whole field the way an RSM sees a region. · `manager` · needs: all visit/order data, hierarchy
- **FID-41** As any role, I want insights and next-best-actions scoped to my job, so that the system tells me where to act, not just what happened. · `ai` · needs: rules engine (Layer 1), visit/order data
- **FID-42** As a leader, I want unusual field patterns flagged (coverage gaps, activity anomalies), so that problems surface without anyone hunting. · `ai` `manager` · needs: months of visit data, AI service
- **FID-43** As a leader, I want churn-risk and forecasts with explained drivers, so that I act on next quarter before it happens. · `ai` `manager` · needs: long data history, AI service
- **FID-108** As a marketing leader, I want campaigns tracked with spend, attribution and ROI, so that marketing money goes where it provably works. · `marketing` · needs: FID-33 order data, campaign data
- **NEW-16** ⚠ As an exec, I want a board-pack export of the national picture, so that board reporting comes from the system, not from screenshots. · `manager` · needs: FID-31; confirm actually wanted

## Reports Author

- **FID-95** As a reports author, I want the standard report pack (25+) generated from live data, so that recurring reports are opened, not built. · `manager` · needs: all core data
- **FID-96** As a reports author, I want to build custom reports without engineering, so that new questions don't become tickets. · `manager` `admin` · needs: FID-95 foundations
- **FID-97** As a reports author, I want scheduled distribution and PDF/Excel export, so that the right people get the right numbers without asking. · `manager` · needs: FID-95/96

## Marketing (PM / MM / HoM)

- **FID-105** As a marketing manager, I want a content approval workflow that auto-distributes approved materials to reps, so that the field always details from current, approved content. · `marketing` · needs: content storage (seeded earlier for FID-23)
- **FID-106** As a PM, I want promo requests from the field reviewed and launched as tracked campaigns, so that promotions are decisions, not favors. · `marketing` · needs: approval flow, FID-108
- **NEW-17** As a marketing team member, I want a marketing log (conferences, promo item orders), so that marketing activity is on the same system of record as field activity. · `marketing` · needs: little; mostly standalone
- **NEW-18** As a PM, I want material open-rate visibility, so that I know which content the field actually uses. · `marketing` · needs: FID-105, FID-23

## Sales Admin (new persona)

- **NEW-19** As a sales admin, I want zero-discount and booklet-channel orders routed to me for processing, so that clean orders flow to fulfillment without a manager's time. · `orders` · needs: FID-33, hierarchy/roles

## Admin (the configuration portal; far-future, kept coarse on purpose)

- **FID-62..70** As an admin, I want to change forms / workflows / org chart / permissions / territories / catalogue / AI rules / sync conflicts / config audit visually, so that routine business change never needs an engineering release. (One story each; kept fat until their milestone approaches.) · `admin`
- **FID-71..75** As an admin, I want to govern AI models (catalogue, per-use-case assignment, spend dashboard, budgets, one-click swap), so that model choice is our configuration, not the vendor's grip. · `admin` `ai`

## Cross-persona

- **FID-30** As any user, I want real-time notifications for the approvals and escalations that involve me, so that nothing waits on someone who doesn't know they're waited on. · `rep-app` `manager` · needs: notification service (standalone enabler, big/shared)
- **FID-36** As a rep and their customer, I want the invoice generated the moment an order is confirmed, so that paperwork never lags the sale. · `orders` · needs: FID-33, pricing
- **FID-40** As a rep, I want AI to pre-fill and summarize my visit for my review, so that good records take less typing, with me in the loop. · `ai` `rep-app` · needs: FID-14/18, AI service

## Open questions for the product owner (the ⚠ items)

1. **FID-12**: GPS = evidence (passive proof) or enforcement (geo-fence rejects distant check-ins)? Fidson's URS flags HR/Legal review of geotagging; the answer shapes rep trust on day one.
2. **NEW-4**: visit-log corrections: how long a window, and do edits show an audit trail? (Recommend: 24h + full trail.)
3. **NEW-7**: quote & proposal: how formal? A priced PDF from the catalogue, or a negotiation workflow? (Recommend: start with priced PDF.)
4. **NEW-8**: complaints: customer complaints, internal field issues, or both? Fidson's MVS just says "complaint and issue escalation".
5. **NEW-13**: measuring managers is politically sensitive; confirm Fidson wants it visible (their URS red note says yes: "Managers' supervision performance measurement").
6. **NEW-16**: board-pack export: real need or nice-to-have? Cheap either way, but starved milestones want the answer.
