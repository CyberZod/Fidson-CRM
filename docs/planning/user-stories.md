# Fidson FieldForce · User Stories (complete platform)

Every user story for the platform, drafted from the prototype with the artifact-flow method (see [method.md](method.md)). Format per story: **Description · Requires · Produces · Acceptance Criteria · Note.**

- **Requires / Produces** are named artifacts. Every Requires must match some story's (or a seed's) Produces, or it's a **leak**. A requires with no producer stays an *italic "that…" sentence* so it's visible; once matched, it collapses to the artifact name.
- Artifact definitions and producers live in the [artifact registry](seed-registry.md); the dependency map and critical path in [dependency-network.md](dependency-network.md).
- Approval loops are split into a **request** story and a **decide** story; escalation is AC on the decide story, not a new story.
- A story is **done at its receiving end**: its output shows up at its consumer's screen, never at the button that produced it (the bolded AC line).

Chain: Plan → Check-in → Visit log → {Order, Intel, Contact, Samples} → reports & self-service → managers, PM, marketing, leadership, trade → admin/ERP producers.

---

## Story 1: Draft and submit my plan (rep)

**Description:** As a rep, I want to draft my visit plan from my own facilities and submit it, so that my proposed week is on record and in front of my RSM.

**Requires:** Territory Assignments · Account
**Produces:** Submitted Plan

**Acceptance Criteria:**
- Given my assigned territory, when I build a plan, then I can only add facilities that are mine, each with a date and time.
- When I submit, then the plan is routed to my RSM for decision.
- Given I've submitted, when my RSM opens their approvals, then they see my plan with all its visits.

**Note:** Decision is Story 2. Later: route optimization; daily change requests. Confirm with Fidson: one pending plan at a time, or several? Seeded now: Territory Assignments, Account.

---

## Story 2: Approve or reject a plan (RSM)

**Description:** As an RSM, I want to approve or reject a rep's submitted plan with a reason, so that reps work to a week I've signed off, not one they invented.

**Requires:** Submitted Plan
**Produces:** Approved Plan

**Acceptance Criteria:**
- Given a submitted plan, when I open it, then I see all its planned visits.
- When I approve or reject with a reason, then the decision is recorded.
- Given my decision, when the rep reopens their plan, then they see the outcome; if approved, the plan is locked and cannot be silently edited.

**Note:** Builds the approval machinery (first consumer); later loops reuse it. Later: auto-escalation to the DM when I'm unavailable; notifications.

---

## Story 3: Check in against my plan (rep)

**Description:** As a rep, I want to check in at the facility on my plan when I arrive, so that my presence at a planned call is on record and my manager can see I'm where I'm meant to be.

**Requires:** Approved Plan · Account
**Produces:** Check-in

**Acceptance Criteria:**
- Given an approved planned visit, when I tap check-in there, then my location and the current time are captured against that visit.
- Given I check in within range of the facility, then it is recorded verified; if out of range or offline, recorded but marked unverified (flag, never block).
- Given I am checked in, when my RSM opens their field-activity view, then they see me under that facility in green.
- Given my planned time arrives with no check-in, then my RSM sees yellow; after 15 minutes, red; when I check in within the hour, green (the red flips with no action from me).

**Note:** Later: offline sync; continuous location tracking. Confirm with Fidson: the yellow/red/green thresholds and the in-range distance. Seeded now: Account.

---

## Story 4: Log the visit (rep)

**Description:** As a rep, I want to record what happened on a call while I'm still checked in, so that my manager sees the substance of the visit, not just that I showed up.

**Requires:** Check-in · Product Catalog
**Produces:** Visit Log Entry

**Acceptance Criteria:**
- Given I am checked in at a facility, when I open the log, then the institution is already set from my check-in.
- When I record the call, then I select the products I detailed from the catalogue, and capture who I saw, the engagement breakdown (attendee counts), a conversation summary, and the next course of action.
- When I submit, then the log is saved against the check-in and the visit is marked complete.
- Given I've submitted, when my RSM opens the visit, then they see the full call content attached to my check-in.

**Note:** Deliberately minimal parent record; siblings attach (Intel, Contact, Samples, plus reminders, voice, AI, offline sync). Seeded now: Product Catalog.

---

## Story 5: Place an order (rep)

**Description:** As a rep, I want to build an order from real priced products and submit it, so that a customer's intent becomes a real order before I leave.

**Requires:** Check-in · Product Catalog
**Produces:** Order · Invoice

**Acceptance Criteria:**
- Given the catalogue, when I build an order, then I select real products, set quantities, and the totals compute automatically.
- Given the standard discount ceiling, when I apply a discount, then I can go up to that ceiling and the total reflects it.
- When I submit, then the order is placed and recorded at sales admin (a real record, not a UI mock).
- Given a clean order (within the discount ceiling), when it's recorded, then an invoice is generated against it (approval-gated orders invoice after approval, Story 25).
- Given I've submitted, when the sales admin opens their order queue, then they see my order with its items, quantities, and total, and my invoices view shows the generated invoice.

**Note:** Requires the Check-in (the visit context), not the log's content; provisional, may later be standalone. Later: over-ceiling discount approval; signature/LPO capture (book-first, proof-follows); out-of-stock split routing; ERP/SOA sync. Confirm with Fidson: must an order sit inside a visit? is book-first acceptable to finance? Seeded now: Product Catalog.

---

## Story 6: Flag competitor intel (rep)

**Description:** As a rep, I want to flag competitor activity I see on a call, so that the company hears the market the day it happens, not a quarter later.

**Requires:** Visit Log Entry · Product Assignment
**Produces:** Competitor Signal

**Acceptance Criteria:**
- Given I'm logging a visit, when I spot competitor activity, then I capture the competitor brand, the promo or scheme, and any pricing intel, attached to this visit.
- When I submit the visit, then the signal is routed to the PM's competitor-signal feed.
- Given I've submitted, when the PM opens their signal feed, then they see the signal with its context: competitor, promo, price, facility, date, and which rep.

**Note:** Later: AI clustering into patterns; alerts to the PM. Confirm with Fidson: one PM per product, or a single shared marketing feed? Seeded now: Product Assignment (which PM owns which products).

---

## Story 7: Capture a new contact (rep)

**Description:** As a rep, I want to capture someone new I meet on a call, on the spot with consent, so that the lead survives the walk back to my car.

**Requires:** Visit Log Entry · *that there's a list of existing HCPs to check this person against for duplicates*
**Produces:** Contact / Lead

**Acceptance Criteria:**
- Given I'm on a visit, when I meet someone new, then I capture their name, role or specialty, and contact details, with consent recorded, attached to this visit.
- When I submit, then the contact enters my pipeline as a new captured lead.
- Given I've submitted, when I open my pipeline, then I see the new contact as a captured lead, with where and when we met.

**Note:** OPEN DECISION: the "existing HCPs to check against" is people, not facilities (a naming collision we caught). Minimal scope dedupes against the Contacts already captured (self-produced, no new artifact); the alternative is a pre-existing HCP-master seed from Fidson. Decide which. Later: pipeline management is Story 12; enrichment. Confirm with Fidson: consent wording, data-protection (NDPR; DPIA).

---

## Story 8: Log samples issued (rep)

**Description:** As a rep, I want to log every sample I hand over, so that samples I can't account for never become my problem.

**Requires:** Visit Log Entry · Product Catalog
**Produces:** Sample Issue

**Acceptance Criteria:**
- Given I'm logging a visit and I hand over samples, when I record them, then I select the product(s) from the catalogue and the quantity issued, attached to this visit.
- When I submit, then the samples are recorded against the visit and added to my sample-issued record.
- Given I've submitted, when my manager opens my sample record (or the visit), then they see what I issued, how much, and where.

**Note:** Later: reconciliation against samples allocated to me (needs an Allocation artifact); batch/expiry; regulatory reports. Confirm with Fidson: reconcile against allocated stock (who allocates)? batch/expiry tracking? Seeded now: Product Catalog.

---

## Story 9: My daily call report writes itself (rep)

**Description:** As a rep, I want my daily call report built from the visits I already logged, so that end-of-day reporting takes zero extra typing.

**Requires:** Visit Log Entry
**Produces:** Daily Call Report

**Acceptance Criteria:**
- Given the visits I logged today, when I open my DCR, then it is compiled from them automatically, with no re-typing.
- When I review it, then I can add a note and submit.
- Given I've submitted, when my RSM opens my DCR, then they see my compiled day.

**Note:** Later: AI summary; auto-submit. Pure consumer of Visit Log Entry.

---

## Story 10: My Customers (the 360) (rep)

**Description:** As a rep, I want a full profile of each customer before I walk in, so that I never open cold with someone we've known for years.

**Requires:** Account · Visit Log Entry · Contact / Lead · Order
**Produces:** — (a view over existing artifacts)

**Acceptance Criteria:**
- Given a customer (facility), when I open their profile, then I see our visit history, the people I've met there, and their orders in one place.
- Given the next-steps from my past logs, then I see what I promised and what's still outstanding.

**Note:** Depth follows inputs, it shows Orders because Story 5 exists. "Customer" here means the facility (institution), not the HCP.

---

## Story 11: My numbers vs my targets (rep)

**Description:** As a rep, I want to see my numbers against my targets each week, so that I know where I stand before my manager tells me.

**Requires:** Visit Log Entry · Order · Targets
**Produces:** — (a view)

**Acceptance Criteria:**
- Given my targets and my logged activity, when I open my performance, then I see visits, coverage, and orders against target for the week.

**Note:** New seeded artifact **Targets** (a later manager "set targets" story produces it). Seeded now: Targets.

---

## Story 12: Advance a contact through my pipeline (rep)

**Description:** As a rep, I want to move my contacts stage by stage until they order, so that I always know who is close to converting.

**Requires:** Contact / Lead
**Produces:** — (updates Contact / Lead with a dated stage change)

**Acceptance Criteria:**
- Given a captured contact, when I move them to the next stage, then their stage updates and the change is dated.
- Given my pipeline, when I open it, then I see each contact by stage, so I know who's close.

**Note:** This is the pipeline management deferred from Story 7.

---

## Story 13: See a customer's statement of account (rep)

**Description:** As a rep, I want to see a customer's statement of account, so that I walk into money conversations informed.

**Requires:** Account · Statement of Account
**Produces:** — (a view)

**Acceptance Criteria:**
- Given a customer, when I open their statement, then I see what they owe and their recent transactions.

**Note:** The Statement of Account comes from Fidson's ERP; first version is likely a deep-link into the existing SOA app, native view needs an ERP-sync producer. Seeded now: Statement of Account.

---

## Parked: Submit an expense and get it approved

Drawn from general sales-force practice, not confirmed against the current prototype. **Parked** until we verify expenses are in scope on the platform. If confirmed, it splits into a request story (rep submits an Expense Claim) and a decide story (manager approves), reusing the approval machinery, and a claim for a clinical meeting references that meeting's approved budget.

---

## Story 14: Request a clinical meeting (rep)

**Description:** As a rep, I want to request a clinical meeting with its topic, date, attendees, and budget, so that my proposal is on record and in front of the PM without me chasing anyone.

**Requires:** Product Assignment
**Produces:** Clinical Meeting Request

**Acceptance Criteria:**
- Given a meeting idea, when I submit topic, date, attendees, and budget, then a request is created and routed to the PM.
- Given I've submitted, when the PM opens their requests, then they see mine with all its details.

**Note:** Decision is Story 15. Done when the request lands in the PM's queue. Seeded now: the product-ownership routing.

---

## Story 15: Decide on a clinical meeting (PM)

**Description:** As a PM, I want to approve or reject a clinical meeting request with reasons, so that reps get a clear decision and the budget stays controlled.

**Requires:** Clinical Meeting Request
**Produces:** Clinical Meeting Decision (approved / rejected, reasons, approved budget)

**Acceptance Criteria:**
- Given a pending request, when I open it, then I see topic, date, attendees, and budget.
- When I approve or reject with a reason, then a decision is recorded.
- Given my decision, when the rep reopens their request, then they see the outcome and the reasons.
- Given a high-impact (multi-regional) request, when it exceeds my authority, then after my review it escalates to the HoM/MM for final sign-off, who decides it the same way.

**Note:** Reuses the approval machinery. High-impact escalation is the AC line above (was Story 45, now dissolved). The approved budget it produces is what a future expense claim would reference.

---
## Story 16: Request a daily itinerary adjustment (rep)

**Description:** As a rep, I want to request a same-day change to my approved plan (add or swap a visit, with a reason, capped per day), so that real life can amend the plan without dissolving it.

**Requires:** Approved Plan
**Produces:** Adjustment Request

**Acceptance Criteria:**
- Given my approved plan, when something changes on the day, then I can request to add or swap a visit with a reason.
- Given a daily cap, when I've hit it, then I can't request more that day.
- Given I've submitted, when my RSM opens their approvals, then they see my adjustment request.

**Note:** Decision is Story 23. Reuses the approval machinery.

---

## Story 17: Record a customer's stock and get restock suggestions (rep)

**Description:** As a rep, I want to record a customer's current stock during a visit and see restock suggestions, so that I catch empty shelves before competitors do.

**Requires:** Check-in · Product Catalog
**Produces:** Customer Stock Record

**Acceptance Criteria:**
- Given I'm on a visit, when I record the customer's stock per product, then it's saved against the visit.
- Given the stock levels, when they're low, then I see restock suggestions.
- Given I've recorded it, when my PM opens customer-inventory insights, then they see the stock.

**Note:** Feeds Story 41. Reuses Check-in and Product Catalog.

---

## Story 18: Optimize my day's route (rep · AI)

**Description:** As a rep, I want my day's route optimized around my fixed appointments, so that I spend the day with customers, not in traffic.

**Requires:** Approved Plan · Account · a route-optimization service
**Produces:** Optimized Route (view)

**Acceptance Criteria:**
- Given my approved visits and their locations, when I optimize, then I see a suggested order that respects fixed appointments.
- Given a suggested route, when I accept it, then my day reorders.

**Note:** Addition. The route-optimization service is machinery, not a data artifact.

---

## Story 19: See my next-best actions each morning (rep · AI)

**Description:** As a rep, I want next-best-action suggestions each morning (which customer to see, which product to push, which lead is going cold), so that my day starts with the system's homework, not guesswork.

**Requires:** my Visit Log Entries · Orders · Contact/Lead · an AI recommendation service
**Produces:** (view)

**Acceptance Criteria:**
- Given my history, when I open my day, then I see prioritized suggestions, each with a reason.
- Given a suggestion, when I act on it, then it links me to the customer or lead.

**Note:** Addition. AI service is machinery.

---

## Story 20: See my invoices (rep)

**Description:** As a rep, I want to see the invoices raised for my orders, so that I can follow up on what's been billed.

**Requires:** Order · Invoice
**Produces:** (view)

**Acceptance Criteria:**
- Given my orders, when I open invoices, then I see each order's invoice and its status.

**Note:** Invoice is produced by the order flow (Story 5, on acceptance), so this is a thin view over it. Could fold into the orders view; kept because the prototype has a dedicated invoices screen. Real invoice generation may run through the ERP.

---

## Story 21: Access approved marketing content offline (rep)

**Description:** As a rep, I want approved marketing content available offline, so that I detail with current materials even without signal.

**Requires:** Approved Content
**Produces:** (view)

**Acceptance Criteria:**
- Given approved content, when I download my bundle, then I can open it offline.
- Given new approved content, when I reconnect, then my bundle updates.

**Note:** Approved Content is produced by Story 44.

---

## Story 22: Convert a qualified lead into a customer (rep)

**Description:** As a rep, I want to convert a qualified lead into a customer, so that a won relationship becomes a real account I can order for.

**Requires:** Contact/Lead
**Produces:** Customer Record

**Acceptance Criteria:**
- Given a qualified lead, when I convert it, then a customer record is created and the lead is marked converted.
- Given the conversion, when I open My Customers, then the new customer appears.

**Note:** Customer Record is a new HCP-channel Account created from a lead; distinct from a Trade or Institution Account, and from the Statement of Account.

---

## Story 23: Approve or reject an itinerary adjustment (RSM)

**Description:** As an RSM, I want to approve or reject a rep's daily adjustment request, so that plans flex without dissolving.

**Requires:** Adjustment Request
**Produces:** Adjustment Decision

**Acceptance Criteria:**
- Given a pending adjustment, when I open it, then I see the change and the reason.
- When I approve or reject, then the decision is recorded and the rep's plan updates on approval.

**Note:** Reuses the approval machinery.

---

## Story 24: Request a discount above the ceiling (rep)

**Description:** As a rep, I want to request a discount above the standard ceiling with a justification, so that I can honor a big customer without breaking pricing rules.

**Requires:** Order · Territory Assignments
**Produces:** Discount Request

**Acceptance Criteria:**
- Given an order, when I set a discount above the ceiling, then I must add a justification and the order is held pending approval.
- Given I've submitted, when my manager opens their approvals, then they see the request with the order, discount, and justification.

**Note:** Extends Story 5. Decision is Story 25.

---

## Story 25: Decide on a discount request (manager)

**Description:** As a manager, I want to approve or reject an above-ceiling discount with context, so that pricing stays controlled without slowing honest orders.

**Requires:** Discount Request
**Produces:** Discount Decision

**Acceptance Criteria:**
- Given a pending request, when I open it, then I see the order, discount, and justification.
- When I approve or reject with a reason, then the rep sees the outcome and the order proceeds at the discounted price if approved.
- Given a discount beyond my authority, when I can't clear it, then it escalates to my superior (e.g. the DM), who decides it the same way.

**Note:** Reuses the approval machinery. Later: an AI recommendation on the discount.

---

## Story 26: Set my team's targets (manager)

**Description:** As a manager, I want to set targets for my reps, so that everyone knows what they're working toward and performance can be measured.

**Requires:** Territory Assignments · Product Catalog
**Produces:** Targets

**Acceptance Criteria:**
- Given my team, when I set targets per rep (visits, coverage, sales), then they're saved for the period.
- Given targets set, when a rep opens their performance, then they see them.

**Note:** Produces the Targets that Stories 11 and 27 consume, retiring the Targets seed.

---

## Story 27: See my team's coverage and compliance (manager)

**Description:** As a manager, I want coverage and compliance dashboards with drill-down, so that I coach from patterns, not anecdotes.

**Requires:** Check-in · Visit Log Entry · Order · Territory Assignments · Targets
**Produces:** (view)

**Acceptance Criteria:**
- Given my team's activity, when I open my dashboard, then I see coverage, visit counts, GPS-verification rate, and sales against target, by rep and territory.
- When I drill into a rep, then I see their visits and where they fell short.

**Note:** Analytical (aggregate over time), distinct from the live field feed born in Story 3.

---

## Story 28: Log my own field visit as a manager (manager)

**Description:** As a manager or PM, when I go to the field myself, I want to check in and log that visit the way a rep does, with my log visible to my superior, so that field presence is provable at every level.

**Requires:** Account
**Produces:** Check-in · Visit Log Entry

**Acceptance Criteria:**
- Given I'm in the field, when I check in and log the visit, then it's recorded the same way a rep's is.
- Given my logged visit, when my superior opens their field activity, then they see it.

**Note:** Reuses the rep check-in and log machinery. Accompaniments (joint calls) are Story 40.

---

## Story 29: Keep a coaching log per rep (manager)

**Description:** As a manager, I want a coaching log per rep (dated notes and scheduled 1:1s), so that development is deliberate and its record survives manager changes.

**Requires:** Territory Assignments · Visit Log Entry
**Produces:** Coaching Note

**Acceptance Criteria:**
- Given a rep, when I add a dated coaching note or schedule a 1:1, then it's saved to their log.
- Given the log, when a new manager takes over, then the history is visible.

**Note:** —

---

## Story 30: Message a rep directly (manager)

**Description:** As a manager, I want to send a direct message to one rep in-app (including short coaching nudges), so that field guidance lives where field work lives, not in WhatsApp.

**Requires:** Territory Assignments
**Produces:** Direct Message

**Acceptance Criteria:**
- Given a rep, when I send a message, then they receive it in-app.
- Given a message, when the rep opens it, then they can reply.

**Note:** —

---

## Story 31: Push my periodic summary to my superior (manager)

**Description:** As a manager (ASM/RSM/DM), I want to compose my area/regional/divisional summary and push it to my superior, who receives it in-app, so that upward reporting is one click, not an evening.

**Requires:** Visit Log Entry · Order · Territory Assignments
**Produces:** Upward Summary

**Acceptance Criteria:**
- Given my team's data, when I compose and push my summary, then my superior receives it in-app.
- Given the summary, when my superior opens it, then they see it attributed to me and my period.

**Note:** ASM→BM, RSM→DM, DM→NSM as AC. Later: AI auto-draft from the team's data.

---

## Story 32: Set focus products per rep or territory (manager)

**Description:** As a manager, I want to set focus products per rep or territory, so that detailing effort follows current strategy.

**Requires:** Product Catalog · Territory Assignments
**Produces:** Focus Products

**Acceptance Criteria:**
- Given the catalogue, when I set focus products for a rep or territory, then they're saved.
- Given focus products, when the rep logs a visit, then they're highlighted in the detailing picker.

**Note:** Consumed by Story 4's picker and Story 34's directive routing.

---

## Story 33: Decide on an escalated approval (DM) — DISSOLVED

Escalation is the same decide behavior one tier up, so it lives as **AC on the base decide story** (Story 25 for discounts: "a discount beyond my authority escalates to my superior, who decides the same way"), not as its own story. The routing lives in the shared approval/escalation machinery. Kept as a tombstone so numbering stays stable.

---

## Story 34: Push a product directive to reps (PM)

**Description:** As a PM, I want to push a directive about one of my products to the reps who detail it, so that field effort follows current product strategy without relying on forwarded messages.

**Requires:** Focus Products · Product Catalog
**Produces:** Product Directive

**Acceptance Criteria:**
- Given one of my products, when I compose a directive (title, target product, priority, message), then I can send it to the reps assigned to that product.
- Given the kind, when it's a new-product notification rather than a directive, then it's sent as an announcement.
- Given I've sent it, when an assigned rep opens their dashboard, then they see it flagged by priority and product.

**Note:** Audience is the reps assigned to the product (richer than the prototype's blanket push; confirm with Fidson). Acknowledgment is Story 35.

---

## Story 35: Acknowledge a product directive (rep)

**Description:** As a rep, I want to acknowledge a product directive on record, so that my PM knows I've seen it and stops re-sending.

**Requires:** Product Directive
**Produces:** Product Directive Acknowledgment

**Acceptance Criteria:**
- Given a product directive on my dashboard, when I acknowledge it, then it's timestamped and shared with the PM.
- Given acknowledgments, when the PM opens their directives, then they see who has and hasn't acknowledged.

**Note:** —

---

## Story 36: Push approved detailing materials to reps (PM)

**Description:** As a PM, I want to push approved detailing materials to the reps who carry my products, so that the field always details with current, signed-off content.

**Requires:** Approved Content · Focus Products
**Produces:** Material Push

**Acceptance Criteria:**
- Given approved content, when I push it to my reps, then it enters their content bundle.
- Given a push, when a rep opens their materials, then they see the new pack.

**Note:** Approved Content comes from Story 44; feeds Story 21.

---

## Story 37: Request a promo campaign (field)

**Description:** As a rep or field manager, I want to submit a promo campaign request, so that a local opportunity can be funded and launched.

**Requires:** Product Catalog
**Produces:** Promo Request

**Acceptance Criteria:**
- Given an opportunity, when I submit a promo request (product, mechanics, budget), then it's routed to the PM.
- Given I've submitted, when the PM opens promo requests, then they see mine.

**Note:** Decision is Story 38.

---

## Story 38: Decide on a promo request (PM)

**Description:** As a PM, I want to approve or reject a field-submitted promo request, so that promo spend follows strategy.

**Requires:** Promo Request
**Produces:** Promo Decision

**Acceptance Criteria:**
- Given a pending promo, when I open it, then I see product, mechanics, and budget.
- When I approve or reject with a reason, then the requester sees the outcome.

**Note:** Reuses the approval machinery. Launch is Story 39.

---

## Story 39: Launch an approved promo (PM)

**Description:** As a PM, I want to launch an approved promo, so that the field can start running it.

**Requires:** Promo Decision (approved)
**Produces:** Promo Launch

**Acceptance Criteria:**
- Given an approved promo, when I launch it, then it goes live and the targeted field is notified.

**Note:** —

---

## Story 40: Schedule a joint call and log an accompaniment (PM/manager)

**Description:** As a PM or manager, I want to schedule a joint call and log the accompaniment, so that coaching happens in the field, on record.

**Requires:** Approved Plan · Territory Assignments
**Produces:** Accompaniment Log

**Acceptance Criteria:**
- Given a rep's plan, when I schedule a joint call, then it's added to both our days.
- Given the call, when I log the accompaniment, then it's saved and visible to the rep and my superior.

**Note:** Distinct from Story 28 (a solo manager field visit).

---

## Story 41: See customer-inventory insights (PM)

**Description:** As a PM, I want to see HCP stock levels across the field, so that I can verify uptake and spot gaps.

**Requires:** Customer Stock Record
**Produces:** (view)

**Acceptance Criteria:**
- Given recorded stock, when I open inventory insights, then I see levels by product and territory.

**Note:** Consumes Story 17.

---

## Story 42: See product intelligence (PM · AI)

**Description:** As a PM, I want product intelligence (volume vs target, CM ROI, competitor-signal patterns), so that portfolio decisions come from the field record.

**Requires:** Visit Log Entry · Competitor Signal · Order · an AI service
**Produces:** (view)

**Acceptance Criteria:**
- Given field data, when I open product intelligence, then I see volume vs target, CM ROI, and competitor patterns for my products.

**Note:** AI service is machinery.

---

## Story 43: Submit detailing content for approval (PM/creator)

**Description:** As a PM or content creator, I want to submit detailing content for marketing sign-off, so that only approved materials reach the field.

**Requires:** Product Catalog
**Produces:** Content Submission

**Acceptance Criteria:**
- Given a draft, when I submit content for approval, then it's routed to marketing.
- Given I've submitted, when the marketing manager opens content approvals, then they see mine.

**Note:** Decision is Story 44.

---

## Story 44: Approve or reject detailing content (MM)

**Description:** As a marketing manager, I want to approve or reject detailing content, so that the field only ever uses signed-off materials.

**Requires:** Content Submission
**Produces:** Approved Content

**Acceptance Criteria:**
- Given a submission, when I review it, then I can approve or reject with comments.
- Given approval, when a PM pushes materials or a rep syncs, then the approved content is available.

**Note:** Produces Approved Content, the artifact Stories 21 and 36 consume.

---

## Story 45: Decide on high-impact clinical meetings (MM/HoM) — DISSOLVED

High-impact escalation is the same decide behavior one tier up, so it lives as **AC on Story 15** (Decide on a clinical meeting: "a high-impact request escalates to the HoM/MM for final sign-off after my review"). Kept as a tombstone so numbering stays stable.

---

## Story 46: Track campaigns and ROI (MM/PM)

**Description:** As a marketer, I want campaigns tracked with spend, attribution, and ROI, so that marketing money goes where it provably works.

**Requires:** Material Push · Order
**Produces:** Campaign

**Acceptance Criteria:**
- Given a campaign, when I record its spend and materials, then attribution against orders is computed over the window.
- Given the campaign, when I open its ROI, then I see spend vs attributed sales.

**Note:** The spend is entered here as part of the story, not required from elsewhere (was mislabelled as leak L4).

---

## Story 47: Broadcast a directive to a chosen audience (senior manager)

**Description:** As a senior manager (NSM, HoM, BM, ADC, CD), I want to broadcast a directive to an audience I choose across the org, so that strategy and policy reach exactly the right groups at once.

**Requires:** People & Reporting Lines · Territory Assignments
**Produces:** Broadcast Directive

**Acceptance Criteria:**
- Given the org groups (DMs, RSMs, FSMs, ASMs, PMs, reps), when I compose a directive and tick groups, then I see the total recipient count.
- When I dispatch, then everyone in the chosen groups receives it (in-app + email); someone outside does not.

**Note:** Same mechanism for NSM/HoM/BM/BMD/ADC/CD; framing and relevant groups are AC. Acknowledgment is Story 48.

---

## Story 48: Acknowledge a broadcast directive (recipient)

**Description:** As a recipient of a broadcast directive (a manager or rep), I want to acknowledge it on record, so that the sender knows it's landed and stops chasing.

**Requires:** Broadcast Directive
**Produces:** Broadcast Acknowledgment

**Acceptance Criteria:**
- Given a broadcast directive, when I acknowledge it, then it's timestamped against me.
- Given acknowledgments, when the sender opens the directive, then they see coverage across the chosen audience.

**Note:** —

---

## Story 49: See my dashboard at my level (leader)

**Description:** As a leader (DM/NSM/BM/ADC/CD), I want a dashboard scoped to my part of the org, so that I see the field the way a first-line manager sees a team.

**Requires:** Check-in · Visit Log Entry · Order · Territory Assignments
**Produces:** (view)

**Acceptance Criteria:**
- Given my scope, when I open my dashboard, then I see performance rolled up across my divisions/regions/channels, with drill-down.

**Note:** DM/NSM/BM/ADC/CD scope as AC. Distinct from the first-line dashboard (Story 27) by scope.

---

## Story 50: See the 12-month national forecast (NSM · AI)

**Description:** As an NSM, I want a 12-month national forecast with explained drivers, so that I act on next quarter before it happens.

**Requires:** Order · Visit Log Entry · an AI forecasting service
**Produces:** (view)

**Acceptance Criteria:**
- Given accumulated history, when I open the forecast, then I see projected sales with the drivers behind them.

**Note:** AI service is machinery; needs data history to be trustworthy.

---

## Story 51: See strategic / cross-regional insights (leader · AI)

**Description:** As a senior leader, I want strategic insights (at-risk accounts, high-potential markets, benchmarking), so that national decisions ride on patterns no one person can see.

**Requires:** Order · Visit Log Entry · Competitor Signal · Territory Assignments · an AI service
**Produces:** (view)

**Acceptance Criteria:**
- Given cross-scope data, when I open insights, then I see at-risk accounts, high-potential markets, and benchmarks.

**Note:** AI service is machinery.

---

## Story 52: Manage the distributor directory (FSM)

**Description:** As an FSM, I want a distributor directory where I onboard and manage distributor details, so that the trade channel has one source of truth for who sells for us.

**Requires:** — (onboarding creates the records; existing distributors may be seeded)
**Produces:** Account (Trade)

**Acceptance Criteria:**
- Given my channel, when I onboard or edit a distributor, then their details are saved.
- Given the directory, when I open it, then I see all my distributors.

**Note:** Manages the **Trade-channel** slice of the Account master (distributors). Institution/HCP accounts are Story 60. May be an ERP sync instead, decided at discovery.

---

## Story 53: See distributor stock health (FSM)

**Description:** As an FSM, I want each distributor's stock health visible (levels, days-to-stockout), so that supply problems surface before shelves go empty.

**Requires:** Account (Trade) · Customer Stock Record
**Produces:** (view)

**Acceptance Criteria:**
- Given stock figures, when I open a distributor, then I see levels and days-to-stockout.

**Note:** Distributor stock levels are a leak (L1) until entered manually or fed from order flow / ERP.

---

## Story 54: Push a reorder to a distributor at risk (FSM)

**Description:** As an FSM, I want to push a reorder to a distributor at risk of stockout, so that seeing the problem and acting on it are one motion.

**Requires:** Account (Trade) · distributor stock health
**Produces:** Reorder

**Acceptance Criteria:**
- Given a distributor near stockout, when I push a reorder, then it's created and sent.

**Note:** Consumes Story 53.

---

## Story 55: Run the quarterly distributor audit (FSM)

**Description:** As an FSM, I want a quarterly distributor audit checklist tracked to completion, so that the mandated quarterly stock check actually happens and is on record.

**Requires:** Account (Trade)
**Produces:** Distributor Audit

**Acceptance Criteria:**
- Given a distributor, when I run the audit checklist, then progress is tracked to completion.
- Given the quarter, when I open audits, then I see which are done and which are outstanding.

**Note:** —

---

## Story 56: Sign in with my Fidson Microsoft account (all)

**Description:** As any user, I want to sign in with my existing Fidson Microsoft account, so that I don't manage another password and IT can revoke my access instantly.

**Requires:** *that Fidson's Entra/Microsoft tenant is provisioned*
**Produces:** Session

**Acceptance Criteria:**
- Given my Fidson account, when I sign in, then I reach my role's home.
- Given IT revokes me, when I try to sign in, then I'm denied immediately.

**Note:** The Entra tenant is infra (L5), provisioned by IT, not a story-produced artifact.

---

## Story 57: Ask the AI assistant (role-scoped)

**Description:** As any user, I want to ask an AI assistant questions about the data in my scope, so that I get answers without hunting through screens.

**Requires:** the data in my scope · an AI service
**Produces:** (view)

**Acceptance Criteria:**
- Given my scope, when I ask a question, then I get an answer drawn only from data I'm allowed to see.

**Note:** AI service is machinery; scope enforced by role.

---

## Story 58: Manage people, roles and reporting lines (admin)

**Description:** As an admin, I want to create and deactivate users, set their roles, and maintain the reporting lines, so that the org structure in the app matches reality and leavers lose access the same day.

**Requires:** —
**Produces:** People & Reporting Lines

**Acceptance Criteria:**
- Given a new hire, when I add them with a role and manager, then they appear in the structure.
- Given a leaver, when I deactivate them, then they lose access the same day.

**Note:** Retires the People & Reporting Lines seed.

---

## Story 59: Manage territories and assignments (admin)

**Description:** As an admin, I want to define territories and assign reps to them, so that plans and scoping run on real coverage.

**Requires:** People & Reporting Lines
**Produces:** Territory Assignments

**Acceptance Criteria:**
- Given territories, when I assign a rep, then their territory is set and their plan draws from it.

**Note:** Retires the Territory Assignments seed.

---

## Story 60: Onboard and maintain accounts (admin)

**Description:** As an admin, I want to onboard and maintain accounts (institutions/call points and HCPs) with their channel, location, and territory, so that visits and orders reference real, current customers.

**Requires:** Territory Assignments
**Produces:** Account

**Acceptance Criteria:**
- Given a new account, when I add it with its channel, location, and territory, then reps can plan and check in against it.

**Note:** Retires the Account seed for Institution/HCP channels. Trade accounts are managed by the FSM (Story 52); new HCP accounts also arrive via lead conversion (Story 22). May be an ERP sync instead, decided at discovery.

---

## Story 61: Manage the product catalogue and prices (admin)

**Description:** As an admin, I want to maintain the product catalogue and prices, so that detailing and orders run on current products and pricing.

**Requires:** —
**Produces:** Product Catalog

**Acceptance Criteria:**
- Given a product change, when I update the catalogue or a price, then visits and orders use the new data.

**Note:** Retires the Product Catalog seed.

---

## Story 62: Sync from Fidson's ERP (integration)

**Description:** As the system, I want catalogue, prices, customer accounts, invoices, and distributor stock synced from Fidson's ERP, so that the app runs on live data instead of hand-loads.

**Requires:** *that Fidson's ERP endpoints are available*
**Produces:** live Product Catalog · Statement of Account · Invoice · Account stock attributes

**Acceptance Criteria:**
- Given the ERP connection, when data changes there, then it flows into the app within the agreed window.
- Given a synced feed is live, when a seed's producer exists, then the seed retires.

**Note:** Resolves L2, L3, and much of L1. Integration, sequenced by when staleness starts to bite.

---

## Story 63: Assign products to product managers (admin)

**Description:** As an admin, I want to assign each product to its owning product manager, so that product-scoped routing (intel, clinical meetings, directives) reaches the right PM.

**Requires:** People & Reporting Lines
**Produces:** Product Assignment

**Acceptance Criteria:**
- Given the PMs and the catalogue, when I assign a product to a PM, then that ownership is saved.
- Given ownership, when a rep flags intel or requests a clinical meeting on that product, then it routes to the owning PM.

**Note:** Producer of Product Assignment. Distinct from Focus Products (Story 32, which is rep↔product, not PM↔product). Like the other foundational admin stories (58-61, 63), its producer may be a management screen we build **or** a sync from Entra/ERP, decided per-artifact at discovery.

---
## Configuration layer (admin · M6) — the "make it client-editable" producers

These produce the config our core stories consume. Core stories ship with the config **hardcoded** first (fast, milestone-live); these later replace the hardcode with a produced artifact, and the core story is untouched because it reads the config's **shape**, not its source. Same swap pattern as data (hardcoded → admin-built, behind a stable seam).

---

## Story 64: Form builder (admin)

**Description:** As an admin, I want to define and version the forms the field fills (fields, conditional logic), so that what's captured changes without a code release.

**Requires:** People & Reporting Lines · Product Catalog
**Produces:** Form Definition

**Acceptance Criteria:**
- Given a form, when I add/edit/reorder fields with conditional logic and publish a version, then the field renders that version.
- Given a published change, when a rep opens the form, then they see the new version.

**Note:** Config seam. Consumed by visit log (4) and order (5), which ship with hardcoded forms first.

---

## Story 65: Workflow builder (admin)

**Description:** As an admin, I want to define approval chains, escalations, and triggers, so that who-approves-what changes without a code release.

**Requires:** People & Reporting Lines · Territory Assignments
**Produces:** Approval Chain

**Acceptance Criteria:**
- Given an approval type, when I set the threshold and approver for each step and publish, then decisions route by it.
- Given a change, when a request is submitted, then it routes to the newly configured approver.

**Note:** Config seam. Consumed by the decide stories (2, 15, 25, 38), which ship with hardcoded chains first.

---

## Story 66: AI rules-engine editor (admin)

**Description:** As an admin, I want to author alert and recommendation rules in plain language with a dry-run, so that field logic changes without a code release.

**Requires:** Product Catalog · Territory Assignments
**Produces:** AI Rules

**Acceptance Criteria:**
- Given a rule, when I write it in plain language and dry-run it, then I see what it would fire on before publishing.
- Given a published rule, when the data matches, then the alert or recommendation fires.

**Note:** Config seam (the rules engine). Consumed by next-best-action (19), product intelligence (42), insights (51), which ship with fixed rules first.

---

## Story 67: Model catalogue and swap (admin)

**Description:** As an admin, I want a catalogue of AI models and one-click swap of the active model per use-case with an audit trail, so that we control cost and quality without a code release.

**Requires:** — (seeded model list)
**Produces:** Active Model

**Acceptance Criteria:**
- Given the catalogue, when I assign a model to a use-case, then that use-case runs on it.
- Given a swap, when I switch the active model, then it takes effect and the change is logged.

**Note:** Config seam. Consumed by every AI story (19, 42, 50, 51, 57), which say "an AI service" until this names the model. AI governance (M8).

---

## Story 68: Config audit log (admin)

**Description:** As an admin, I want an append-only log of configuration changes with sign-off on high-impact ones, so that who-changed-what is provable.

**Requires:** the change events from Stories 58-67 (the config producers)
**Produces:** Config Audit Record

**Acceptance Criteria:**
- Given any config change, when it's made, then it's recorded with who, what, and when.
- Given a high-impact change, when it's proposed, then it needs sign-off before taking effect.

**Note:** Cross-cutting audit over the whole config layer.

---

## Story 69: Standard report pack (manager/leader)

**Description:** As a manager or leader, I want a pack of standard reports across the platform's data, so that common questions are answered without building anything.

**Requires:** Visit Log Entry · Order · Check-in · Account · Territory Assignments
**Produces:** Report

**Acceptance Criteria:**
- Given the operational data, when I open the report pack, then I see the standard reports scoped to me.
- When I export one, then I get a PDF or Excel.

**Note:** Consumes the operational artifacts; produces report outputs.

---

## Story 70: Custom report builder (manager)

**Description:** As a manager, I want to build and save custom reports over the data I'm allowed to see, so that new questions don't need a developer.

**Requires:** the data artifacts · Territory Assignments (scope)
**Produces:** Report Definition

**Acceptance Criteria:**
- Given data in my scope, when I build a report (fields, filters, grouping) and save it, then it's reusable.
- Given a saved report, when scheduled, then it distributes and exports.

**Note:** Persona is a real manager/admin, **not** the invented "Reports Author" (FID-96 fix). Config seam for reporting.

---

## Remaining capabilities (adopted from the board)

## Story 71: Log offline and sync (rep)

**Description:** As a rep in poor signal, I want my check-ins, logs, and orders to save on my device and sync when I reconnect, so that no field work is ever lost or double-counted.

**Requires:** Check-in · Visit Log Entry · Order
**Produces:** — (guarantees those survive offline and sync deduped)

**Acceptance Criteria:**
- Given no signal, when I check in / log / order, then it saves locally and I keep working.
- Given I reconnect, then everything syncs once with no duplicates; collisions route to the conflict queue (Story 78).

**Note:** Cross-cutting capability (JBS M2 deliverable). The sync engine is the enabler under it.

---

## Story 72: Log a visit by voice (rep)

**Description:** As a rep, I want to dictate a visit in my own words and get a filled-in log to review, so that logging takes the drive between calls, not my evening.

**Requires:** Visit Log Entry · Active Model
**Produces:** — (a drafted Visit Log Entry for review)

**Acceptance Criteria:**
- Given I dictate, when transcription and structuring run, then the form is pre-filled with Fidson product names understood.
- Given the draft, when I review and edit, then I save it as a normal Visit Log Entry.

**Note:** Uses Active Model (67); self-hosted Whisper per PRD. M8.

---

## Story 73: AI pre-fills and summarises my visit (rep)

**Description:** As a rep, I want AI to pre-fill and summarise my visit for my review before saving, so that good records take less typing, with me in the loop.

**Requires:** Visit Log Entry · Active Model
**Produces:** — (a drafted/summarised Visit Log Entry)

**Acceptance Criteria:**
- Given my visit context, when I open the log, then AI suggests a summary and fields for me to accept or edit.

**Note:** Human-in-the-loop. M8.

---

## Story 74: Geo-coverage anomaly alerts (manager · AI)

**Description:** As a field manager, I want unusual field patterns flagged automatically (coverage gaps, activity that doesn't match check-ins), so that problems surface without anyone hunting.

**Requires:** Check-in · Visit Log Entry · AI Rules
**Produces:** — (alerts view)

**Acceptance Criteria:**
- Given my team's activity, when a pattern breaks the rules, then I see a flag with the reason.

**Note:** Consumes AI Rules (66). M8/M9.

---

## Story 75: Automated lead assignment (manager · system)

**Description:** As a manager, I want new leads auto-assigned to the right rep by territory and workload, so that leads don't sit unowned.

**Requires:** Contact / Lead · Territory Assignments
**Produces:** — (assigns Contact/Lead to a rep)

**Acceptance Criteria:**
- Given a new lead, when it's captured, then it's assigned to the rep whose territory it falls in, balanced by workload.

**Note:** —

---

## Story 76: Lead SLA-breach escalation (manager)

**Description:** As a manager, I want a lead that sits untouched past its SLA to escalate, so that no lead goes cold silently.

**Requires:** Contact / Lead · Approval Chain (SLA config)
**Produces:** — (escalation alert)

**Acceptance Criteria:**
- Given a lead untouched past the SLA (e.g. 72h), when the window passes, then it escalates to the manager.

**Note:** SLA window is config (Workflow builder, 65).

---

## Story 77: Permission matrix editor (admin)

**Description:** As an admin, I want to set who can see and do what (role × data, field-level overrides), so that access changes without a code release.

**Requires:** People & Reporting Lines
**Produces:** Permission Matrix

**Acceptance Criteria:**
- Given roles and data, when I set CRUD and field-level overrides and publish, then the app enforces them.

**Note:** Config seam. Produces the Permission Matrix the RBAC engine (enabler) enforces. M6.

---

## Story 78: Offline-sync conflict queue (admin)

**Description:** As an admin, I want a queue of sync conflicts to review and resolve, so that offline collisions are settled by a human, not silently.

**Requires:** — (conflicts emitted by the sync engine, Story 71)
**Produces:** — (resolved records)

**Acceptance Criteria:**
- Given a sync conflict, when I open the queue, then I see both versions and pick or merge.

**Note:** Admin side of offline sync (71). M2/M6.

---

## Story 79: Scheduled report distribution (manager)

**Description:** As a manager, I want reports scheduled and delivered automatically (PDF/Excel), so that stakeholders get them without asking.

**Requires:** Report · Report Definition
**Produces:** — (scheduled deliveries)

**Acceptance Criteria:**
- Given a report, when I schedule it, then recipients get it on cadence as PDF or Excel.

**Note:** Consumes Report (69) / Report Definition (70). M6.

---

## Story 80: Delegate approvals when unavailable (manager)

**Description:** As a manager, I want to delegate my approvals when I'm away, so that the field never stalls waiting for me.

**Requires:** People & Reporting Lines · Approval Chain
**Produces:** — (a delegation on the approval routing)

**Acceptance Criteria:**
- Given I'm away, when I set a delegate, then my pending and incoming approvals route to them until I return.

**Note:** Was FID-27. Escalation itself is already AC on the decide stories.

---

## Leaks & open decisions

**Leaks (a Require with no producer):**

| # | Requirement | Where | Resolution |
|---|---|---|---|
| L3 | Statement of Account (SOA) | 13 | from ERP (62); deep-link first. Invoices come from Story 5, but payments/balance still need ERP. |
| L5 | Fidson Entra tenant | 56 | infra, provisioned by IT; not a story artifact. |
| L6 | AI / route / forecast services | 18, 19, 42, 50, 51, 57 | machinery (an engine), not a data artifact. |

No true unfilled data leaks remain: distributor stock = Customer Stock Record on Trade accounts (17); invoice from the order flow (5); campaign spend captured inside 46. L3 is ERP-sourced; L5/L6 are infra and machinery.

**Open decisions:**
- **Story 7 dedupe:** dedupe new contacts against captured Contacts, or a pre-existing HCP-master seed?
- **Story 13 Statement of Account:** deep-link into the existing SOA app first, or wait for native ERP sync?
- **Expenses:** confirm in scope before building.

**Open modeling:**
- **"Customer" resolved:** one **Account** master, channel = Institution / Trade / HCP; **Contact/Lead** is a prospect (7); **Customer Record** is a converted lead becoming a new HCP Account (22).
- **Directive senders:** two mechanisms only (PM product-directive to assigned reps; audience-picker broadcast for the six senior roles). Roles are AC, not separate stories.
- **Manager field visits (28)** reuse the rep check-in/log machinery, producing the same Check-in/Visit Log Entry artifacts, visible upward. Confirm Fidson wants managers logging their own calls.

All other requirements match a producer (see the [artifact registry](seed-registry.md)).
