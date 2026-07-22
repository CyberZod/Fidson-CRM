# Fidson FieldForce · Milestones

One concept only: the **milestone**, a named bundle of user stories with a demo journey, an acceptance event, and a payment. What the proposal called phases, pilots and payment milestones are all rows of this one table. Weeks follow the executive proposal (June 2026).

Every bullet is a user story, written so anyone at Fidson can read it. The small key at the end of a bullet ties it to our board; strip the keys when producing the client-facing copy. ⚠ = has an open product-owner question (see stories.md).

**Payment map:** M1 25% · M2 20% · M4 20% · M5+M6 20% · M7+M8 15%.

---

## M0 · Scope locked — weeks 1-3 · free

*This proposal becomes a confirmed design and a fixed price.*

- Stakeholder workshops across reps, managers, marketing, admin and IT.
- Requirements walked and signed off against the prototype Fidson has already seen.
- Fixed-price build proposal delivered.

**Accepted when:** Fidson signs the requirements and the price.

---

## M1 · Foundations — weeks 4-6 · 25%

*Everything invisible that the product will stand on, approved before the first feature.*

- Architecture document approved by Fidson IT (Microsoft cloud, Fidson's own tenancy, open portable core).
- Dev, staging and production environments live.
- Fidson's existing data staged for import: facilities and call points, org hierarchy, territories and rep assignments, product catalogue and prices.
- Data-protection impact assessment (DPIA) completed with Fidson HR/Legal, covering GPS and personal data, **before any real rep uses the system**.

**Accepted when:** design approval is signed.

---

## M2 · The core visit loop — weeks 7-10 · 20%

*The smallest complete thread of the product, in real reps' hands: a visit is logged in the field and a manager sees it, live and verifiable.*

- As a **rep**, I sign in with my existing Fidson Microsoft account: no new password, and IT can revoke my access instantly. `FID-11`
- As a **rep**, my arrival at a facility is captured automatically with GPS, so my presence is provable without me doing anything: never blocked, flagged for review if something looks off. `FID-12`
- As a **rep**, I create the record of my visit: who I saw, where, when, what happened, and submit it in under a minute. `FID-14`
- As a **rep**, visits I log without signal save on my phone and sync themselves when I reconnect: no field work is ever lost or double-counted. `FID-13`
- As a **manager**, I see my team's visits as they happen, each one showing whether it was GPS-verified, so I know the field without chasing a single report. `FID-15`

**Accepted when:** real reps in one territory run their working day on it (Field Pilot 1) and structured feedback is captured.

---

## M3 · The full field day — weeks 11-13 · (no payment; builds toward M4's)

*Everything a rep does between waking up and closing the day lives in the app.*

**Planning the day**

- As a **rep**, I plan my day from the facilities in my territory, so my itinerary matches where I'm accountable. `FID-17`
- As a **rep**, I draft my weekly itinerary and submit it for approval; once approved it's locked, so my week is agreed once and defended from churn. `NEW-5`
- As a **manager**, I approve or reject weekly itineraries and daily change requests, with automatic escalation when I'm unavailable. `FID-103`
- As a **rep**, I can request a daily change (add or swap, with a reason, capped per day), so real life can amend the plan without dissolving it. `NEW-21`

**Recording the call, completely**

- As a **rep**, I record which products I detailed and how the conversation went, so my call history shows what was discussed, not just that I showed up. `FID-18`
- As a **rep**, I log every sample I hand over, so samples I can't account for never become my problem. `FID-19`
- As a **rep**, I record a customer's shelf stock during a visit and see restock suggestions, so I catch empty shelves before competitors do. `FID-102`
- As a **rep**, I flag competitor activity I see in the field the day I see it. `FID-24`
- As a **rep**, I note what happens next with each customer and get reminded, so follow-ups stop depending on my memory. `FID-22`
- ⚠ As a **rep**, I can correct a visit log within a short window, with every edit on the record, so a typo doesn't become a permanent false record. `NEW-4`

**Building the pipeline**

- As a **rep**, I capture a new contact's details the moment I meet them, with consent recorded on the spot. `FID-20`
- As a **rep**, I advance my contacts stage by stage until they order, so I always know who is close to converting. `FID-21`
- As a **rep**, I open a customer's full profile before walking in: visit history, commitments, key people, so I never open cold with someone we've known for years. `NEW-1`

**Working equipped**

- As a **rep**, approved marketing content is on my phone and works offline, so I detail from current materials even without signal. `FID-23`
- As a **rep**, my Daily Call Report generates itself from what I already logged: end-of-day reporting takes zero extra typing. `FID-101`

**Accepted when:** we demo one rep's complete day end to end, from morning plan to auto-generated daily report.

---

## M4 · Management oversight, approvals & self-service — weeks 14-17 · 20%

*Everything reps have been logging becomes a live, governed management system: each layer of Fidson's hierarchy sees its own slice, decisions flow through the platform instead of around it, and Fidson's own team takes the controls.*

**Seeing the field**

- As an **Area Sales Manager**, I see every visit my reps log, as they log it; as a **Regional Sales Manager**, the same for every area in my region; as a **Divisional Manager** and the **National Sales Manager**, the same picture, wider. Each of us sees our own slice and nothing beyond it. `scoping constraint + RBAC`
- As a **manager at any level**, my dashboards show coverage and compliance for my slice: territories worked, customers unseen, each rep's GPS-verification rate, with drill-down from any number to the visit behind it. `FID-26`
- As **national leadership**, I open one live dashboard of the whole field operation: divisions side by side, activity, pipeline. `FID-31`
- As a **manager or Product Manager**, when I go to the field myself, I check in and log the visit the same way a rep does, visible to my own superior: field presence is provable at every level. `NEW-14`
- ⚠ As a **senior manager**, I see how each manager under me runs their team: approval turnaround, report reviews, coaching, own field presence, measured from the record, not impressions. `NEW-13`
- As a **manager**, the standard recurring reports for my scope generate themselves from live data, and are scheduled and delivered automatically to the right people. `FID-95, FID-97`

**Decisions on rails**

- As a **rep**, I request a clinical meeting (topic, date, attendees, budget) and get the decision back with reasons, on the record. As a **Product Manager**, those requests reach me with full context. `FID-28`
- As the **Head of Marketing**, large multi-regional meeting requests come to me for final sign-off. `NEW-20`
- As a **rep**, I submit actual expenses against my approved budget and track the claim until it's paid. `FID-29`
- As a **manager**, I delegate my approvals when I'm away, and anything left sitting too long escalates upward automatically. `FID-27`
- ⚠ As a **rep or manager**, I log a complaint or field issue and see it tracked with a status until closed, so field issues stop dying in WhatsApp. `NEW-8`

**Direction and coaching**

- As a **leader**, I send a directive to a chosen audience and every targeted person sees it in their app; recipients acknowledge on record, so I see who has seen what. `FID-107, NEW-3`
- As a **manager**, I message a rep directly in-app, so field guidance lives where field work lives. `NEW-10`
- As an **Area Sales Manager**, I keep a coaching log per rep: dated notes and scheduled 1:1s that survive manager changes. `NEW-11`
- As a **manager or PM**, I schedule joint calls and log accompaniments, so field coaching happens on record. `FID-104`
- As a **manager**, I set focus products per rep or territory, so detailing effort follows current strategy. `NEW-9`
- As a **manager**, I set targets, and as a **rep**, I see my numbers against my targets every week, so I know where I stand before my manager tells me. `NEW-2`
- As an **ASM/RSM/DM**, I compose my weekly summary and push it up one level, received in-app: upward reporting becomes one click, not an evening. `NEW-12, NEW-27, NEW-28`

**Nobody has to go looking**

- As an **approver**, I'm notified the moment something needs my decision; as a **requester**, the moment my answer exists; as a **rep**, my pending items (decisions, directives, due follow-ups) sit in one place. `per-role notifications, ex-FID-30`

**Fidson runs it, not us**

- As **Fidson's sales administration**, I change who reports to whom on an organisation-chart screen, so a promotion takes effect the same day, without a support ticket. `FID-64 foundation`
- As **Fidson's sales administration**, I reassign territories and call points between reps myself. `FID-66 foundation`
- As **Fidson's product team**, I add products and update prices and focus lists myself; every rep's app reflects it on next sync. `FID-67 foundation`
- As an **admin**, I see and resolve the rare offline-sync conflicts from one queue. `FID-69`

**Accepted when:** the pilot region goes live with reps and every management layer on the platform (Field Pilot 2), and this list is walked line by line.

---

## M5 · Orders, ERP & the trade channel — weeks 19-21 · (paid with M6)

*A field visit becomes a transaction, and the distributor network gets its source of truth.*

**From visit to order**

- As a **rep**, I place an order during the visit, with customer signature and LPO photo, so intent becomes a transaction before I leave the building. `FID-33`
- As a **manager**, discount requests above threshold route to me with context, so pricing stays controlled without slowing honest orders. `FID-35`
- As a **rep**, the invoice generates the moment an order is confirmed: my customer holds paperwork before I leave. `FID-36`
- As a **sales admin**, clean zero-discount and booklet orders route to me for processing, without taking a manager's time. `NEW-19`
- As a **rep**, I see my customer's statement of account before money conversations. `FID-37`
- As a **rep**, my customer profiles now also show orders, payment status and lifetime value: the money side of every relationship. `NEW-33`
- ⚠ As a **rep**, I generate a quote with enforced pricing, so what I promise is always a price the company honors. `NEW-7`
- Stock, pricing and invoices sync with Fidson's ERP (machinery under the stories above). `FID-34`

**The distributor network**

- As a **Field Sales Manager**, I onboard and manage distributors in one directory: the trade channel's single source of truth. `NEW-15`
- As an **FSM**, each distributor's stock health is visible (levels, days-to-stockout), so supply problems surface before shelves go empty. `NEW-24`
- As an **FSM**, I push a reorder to a distributor at risk of stockout: seeing the problem and acting are one motion. `NEW-25`
- As an **FSM**, the quarterly distributor audit Fidson mandates runs as a tracked checklist, on record. `NEW-26`

**Accepted when:** we demo a visit becoming a paid order end to end, and a distributor stockout surfacing and being acted on.

---

## M6 · Intelligence — weeks 22-24 · 20% (covers M5+M6)

*Months of real pilot data start working for every role. AI assists the record; it never replaces it, and a human is always in the loop.*

**For reps**

- As a **rep**, I log a visit by speaking, with Fidson's product names understood: logging takes a minute in the car, not an evening at home. `FID-39`
- As a **rep**, AI pre-fills and summarizes my visit for my review before saving. `FID-40`
- As a **rep**, each morning I get next-best-action suggestions: which customer to see, which product to push, which lead is going cold. `FID-41`
- As a **rep**, my day's route is optimized around fixed appointments, so I spend the day with customers, not in traffic. `NEW-6`

**For managers and leadership**

- As a **field manager**, I get alerts on my territory: coverage gaps, conversion drops, unusual activity, distributor stock warnings. `NEW-29`
- As a **field manager**, unusual patterns are flagged automatically: geo-coverage anomalies, activity that doesn't match check-ins. `FID-42`
- As a **DM or NSM**, I get strategic insights: at-risk accounts, high-potential markets, division benchmarking. `NEW-30`
- As a **DM or NSM**, I see churn-risk and forecasts with explained drivers, built on our real accumulated data. `FID-43`
- As a **pushing manager**, my weekly summary drafts itself from my team's actual data; I edit and send. `NEW-23`

**For marketing** *(the proposal named no marketing phase; placed here deliberately: all of it reads from accumulated field data)*

- As a **PM or Head of Marketing**, I get product intelligence: volume vs target, clinical-meeting ROI, competitor signal patterns. `NEW-31`
- As a **marketing manager**, content goes through an approval workflow and auto-distributes to reps, with open-rate visibility on what the field actually uses. `FID-105, NEW-18`
- As a **PM**, promo requests from the field are reviewed and launched as tracked campaigns with spend, attribution and ROI. `FID-106, FID-108`

**Accepted when:** we demo each role receiving live insights from real pilot data, with human-in-the-loop guardrails shown working.

---

## M7 · Hardening & full UAT — weeks 25-27 · (paid with M8)

*Nothing new; everything proven. The final check is a formality because testing ran through every week before it.*

- Full user acceptance testing with the Fidson team, against these milestone documents, line by line.
- Load testing at Fidson's real scale (~1M visits/year); offline-sync stress testing.
- Security penetration test; disaster-recovery drill; audit-trail and retention verification for NAFDAC/NDPC record-keeping.
- ⚠ Board-pack export of the national picture, if confirmed wanted. `NEW-16`
- Bug resolution from all of the above.

**Accepted when:** UAT is signed off.

---

## M8 · Training, rollout & go-live — weeks 28-29 · 15% (covers M7+M8)

*The platform becomes Fidson's daily reality.*

- Role-based training for reps, managers and admins; user manuals and materials.
- Phased rollout from the pilot region to national.
- Four weeks of hypercare: priority response, daily check-ins, rapid fixes.

**Accepted when:** national go-live.

---

## Deliberately NOT in these nine milestones (decide, don't drift)

- **Full admin builders**: visual form builder `FID-62`, workflow builder `FID-63`, permission matrix editor `FID-65`, AI rules editor `FID-68`, config audit `FID-70`, AI governance suite `FID-71..75`. M4 ships the foundation screens (org chart, territories, catalogue); the builders belong to Run & Continuous Improvement unless Fidson buys them into scope. The proposal never promised them.
- **Custom report builder** `FID-96` ⚠: parked on open question 7 (who at Fidson would build custom reports). Standard reports + scheduling ship in M4.
- **Native in-app statement of account** `NEW-32`: dissolved as a story; becomes a task under ERP-sync work if wanted.
- **Auto-computed distributor stock** `NEW-34` and **forecasts-on-live-data as a separate story** `NEW-35`: dissolved; M6's FID-43 runs on real data because by week 22 it exists.
- **Marketing log** (ex-NEW-17): no story until Fidson answers open question 8.
