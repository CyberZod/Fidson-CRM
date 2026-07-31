# Artifact Registry

One home for every named artifact. An **artifact** is a piece of data a story consumes (Requires) or creates (Produces). Stories cite the **short name** (the wire); this table holds the **long definition** (the understanding), who produces it, and who needs it.

**A "seed" is not a special thing.** It's an artifact whose real producer isn't built yet, so we stand in a temporary source meanwhile. "Now" says `real` (a story in our set produces it) or `seeded` (fed by an external source, ERP/Entra/hand-load, which we wire rather than build).

**Every artifact is a contract, a fixed shape, defined before any story is built.** Consumers plug into the shape, so the source can swap without reworking them. This is the same move whether the temporary source is a *seed* (for data, e.g. Account, Territory) or a *hardcode* (for config, e.g. Approval Chain, Form Definition, AI Rules, Active Model, hardcoded until their admin-builder story ships). Data or behaviour, the pattern is identical: fixed contract, swappable producer.

**A leak** is an artifact required but produced by nothing, not even a planned story. Resolve by writing the producer, adding a seed, or renaming to match an existing artifact.

| Artifact (the wire) | What it is (the understanding) | Produced by | Now | Required by |
|---|---|---|---|---|
| People & Reporting Lines | who exists and their role (identity); feeds Territory Assignments and Product Assignment | admin (58) or Entra sync | seeded | broadcast audience (47); feeds 59, 63 |
| Territory Assignments | which rep covers which territory; source of sales-chain reporting (who reports to whom, derived from assignment) | admin (59) or ERP sync | seeded | Plan (1), discount approver (24), targets (26), dashboard (27), coaching (29), messaging (30), summary (31), focus products (32), accompaniment (40), broadcast (47), leader dashboard (49), insights (51) |
| Product Assignment | which PM owns each product | admin (63) or ERP sync | seeded | Intel (6), CM request (14) |
| Account | a customer in the master; channel = Institution (facility/call point) / Trade (distributor) / HCP; with location, contacts, and stock | admin (60, 52) or ERP sync | seeded | Plan (1), Check-in (3), My Customers (10), SOA (13), route (18), mgr visit (28), distributor stories (52-55) |
| Customer Stock Record | a customer's recorded stock levels (any channel) | Record stock (Story 17) | real | inventory insights (41), distributor stock health (53), reorder (54) |
| Product Catalog | every product with pack, unit price, stock status | admin (61) or ERP sync | seeded | Visit log (4), Order (5), Samples (8) |
| Focus Products | which products a rep or territory should push | Set focus products (Story 32) | real | Visit log picker (4), Product Directive (34), Materials Push (36) |
| Form Definition | the admin-defined fields and logic of a form | Form builder (64) | real | visit log (4), order (5) |
| Approval Chain | the thresholds and approvers for an approval type | Workflow builder (65) | real | plan approve (2), CM decide (15), discount decide (25), promo decide (38) |
| AI Rules | plain-language alert/recommendation rules | AI rules editor (66) | real | next-best-action (19), product intel (42), insights (51) |
| Active Model | which AI model runs each use-case | Model catalogue (67) | real | AI stories (19, 42, 50, 51, 57) |
| Config Audit Record | who changed what config, when | Config audit log (68) | real | compliance |
| Report | a standard report output | Report pack (69) | real | managers, leadership |
| Report Definition | a saved custom report | Custom report builder (70) | real | report distribution (79) |
| Permission Matrix | who can see/do what (role × data, field overrides) | Permission matrix editor (77) | real | RBAC engine (enabler) |
| Targets | each rep's targets for the period | Set targets (Story 26) | real | My numbers (11), coverage dashboard (27) |
| Statement of Account | a customer's balance and transactions (invoices from Story 5; payments from ERP) | ERP sync (62) | seeded | SOA (13) |
| Submitted Plan | a plan the rep submitted, awaiting the RSM's decision | Plan draft (Story 1) | real | Plan approval (2) |
| Approved Plan | a plan the RSM signed off: each visit's facility, location, time | Plan approval (Story 2) | real | Check-in (3) |
| Check-in | a confirmed arrival with verified location and time | Check-in (Story 3) | real | Visit log (4), Order (5) |
| Visit Log Entry | the recorded substance of a call | Visit log (Story 4) | real | Intel (6), Contact (7), Samples (8), DCR (9), My Customers (10), My numbers (11) |
| Order | a submitted order: products, quantities, total | Order (Story 5) | real | My Customers (10), My numbers (11), invoices (20), campaigns (46), (sales-admin queue) |
| Invoice | the invoice generated when an order is accepted | Order acceptance (Story 5) | real | See invoices (20), SOA (13) |
| Competitor Signal | a competitor sighting: brand, promo, price, where, who | Intel (Story 6) | real | (PM feed) |
| Contact / Lead | a new person captured on a visit, with consent | Contact (Story 7) | real | Pipeline (12), My Customers (10), dedupe check (7) |
| Sample Issue | products handed over on a visit, with quantities | Samples (Story 8) | real | (sample record) |
| Daily Call Report | a rep's day compiled from their logged visits | DCR (Story 9) | real | (RSM receives) |
| Clinical Meeting Request | a rep's meeting proposal: topic, date, attendees, budget | CM request (Story 14) | real | CM decision (15) |
| Clinical Meeting Decision | the PM's approve/reject with reasons and approved budget | CM decision (Story 15) | real | (rep sees; future expense references budget) |

## Open decisions

| Artifact | What it is | Required by | Resolution |
|---|---|---|---|
| existing HCP list (dedupe) | the people already known, to avoid capturing a duplicate | Contact (7) | dedupe against captured Contact/Lead (no new artifact), or add a pre-existing HCP-master seed |

## Notes

**Load order among seeded artifacts.** They reference each other: a facility points to a territory, a territory points to a person. Load People & Reporting Lines first, then Territory Assignments, then Account. Product Catalog, Targets, and Statement of Account stand alone.

**Views produce nothing storable.** My Customers (10), My numbers (11), and SOA (13) are read-only views over other artifacts; Pipeline (12) updates Contact/Lead. "Produces: —" is honest, not every story mints an artifact.

**Consumers in parentheses** (sales-admin queue, PM feed, sample record) are receiving-end *views* of an artifact, built inside the producing story. A view earns its own story only when it aggregates, spots patterns, triages, or reviews history (see method.md §9).

**This is data reuse, not mechanical reuse.** Shared engines (approval flow, sync) are tracked as machinery, not here.

---

## Contracts (field-level schemas) — PLANNING DRAFT, not the source of truth

> **The source of truth for shape is the Pydantic models in the backend `contracts/` module, not this section.** These shorthand shapes were a planning-time thinking tool (to reason about fields and run the leak hunt before any code existed). Once transcribed into the Pydantic models they are **retired**; do not hand-edit them to reflect shape changes, and do not treat them as authoritative. The registry's lasting job is the **graph above** (produced-by / required-by / seeded-or-real), which the models do not hold; a readable shape view, when needed, is **generated** from the models (Swagger `/docs` or Pydantic → JSON Schema), never duplicated here. See [architecture-ports-and-adapters.md](architecture-ports-and-adapters.md) and [ways-of-working.md](../ways-of-working.md).

Shorthand types (for reading the draft below): `id` (opaque key), `ref→X` (a foreign key to artifact X, becomes an id field like `x_id`), `enum{...}`, `text`, `int`, `decimal`, `money`, `bool`, `datetime`, `date`, `geo` (lat/lng), `[X]` (list of X), `[{...}]` (a list whose item becomes its own sub-model). `?` = optional. The **operations** (endpoints) and **rules** (validation, error codes) are not here at all; FastAPI generates them per story from the routes and models.

### Foundational (seeded taps)

**People & Reporting Lines**
`id · fullName:text · email:text · role:enum{Rep,ASM,RSM,DM,NSM,FSM,BM,PM,MM,HoM,ADC,CD,Admin} · managerId:ref→People? · status:enum{active,inactive} · entraObjectId:text?`

**Territory Assignments**
`id · repId:ref→People · territoryName:text · parentTerritoryId:ref→Territory? · region:text · channel:enum{Institution,Trade,HCP}`

**Product Assignment**
`id · productId:ref→Product · pmId:ref→People`

**Account**
`id · name:text · channel:enum{Institution,Trade,HCP} · location:geo · address:text · territoryId:ref→Territory · contacts:[{name:text,role:text,phone:text?}] · stockAttributes:{...}? · sourceRef:text? (ERP id)`

**Product Catalog**
`productId · name:text · pack:text · unitPrice:money · discountCeiling:decimal · stockStatus:enum{in,low,out} · pmId:ref→People?`

**Statement of Account** (ERP)
`accountId:ref→Account · balance:money · transactions:[{date:date,type:enum{invoice,payment,credit},amount:money,ref:text}]`

### Operational data

**Submitted Plan** `id · repId:ref→People · period:{from:date,to:date} · visits:[{accountId:ref→Account,plannedAt:datetime}] · status:enum{submitted} · submittedAt:datetime`
**Approved Plan** `id · planId:ref→SubmittedPlan · decidedBy:ref→People · decision:enum{approved,rejected} · reason:text? · locked:bool · decidedAt:datetime`
**Check-in** `id · repId:ref→People · accountId:ref→Account · plannedVisitId:ref? · location:geo · at:datetime · verified:bool · verificationReason:enum{in_range,out_of_range,offline}`
**Visit Log Entry** `id · checkinId:ref→Checkin · accountId:ref→Account · productsDetailed:[ref→Product] · attendees:[{role:text,count:int}] · summary:text · nextAction:text · completedAt:datetime`
**Order** `id · checkinId:ref→Checkin? · accountId:ref→Account · lines:[{productId:ref→Product,qty:int,unitPrice:money,discount:decimal}] · total:money · status:enum{placed,pending_approval,accepted,rejected} · placedAt:datetime`
**Invoice** `id · orderId:ref→Order · number:text · amount:money · status:enum{raised,paid,overdue} · issuedAt:datetime`
**Competitor Signal** `id · visitLogId:ref→VisitLog · brand:text · promo:text? · priceIntel:text? · accountId:ref→Account · pmId:ref→People · at:datetime`
**Contact / Lead** `id · capturedByVisitLogId:ref→VisitLog · name:text · roleOrSpecialty:text · phone:text? · email:text? · consent:bool · stage:enum{captured,qualified,converted,lost} · assignedRepId:ref→People? · outletId:ref→Account?`
**Sample Issue** `id · visitLogId:ref→VisitLog · items:[{productId:ref→Product,qty:int}] · at:datetime`
**Daily Call Report** `id · repId:ref→People · date:date · visitLogIds:[ref→VisitLog] · note:text? · submittedAt:datetime`
**Customer Stock Record** `id · checkinId:ref→Checkin · accountId:ref→Account · levels:[{productId:ref→Product,qty:int}] · at:datetime`
**Clinical Meeting Request** `id · repId:ref→People · productId:ref→Product · topic:text · date:date · attendees:int · budget:money · status:enum{submitted}`
**Clinical Meeting Decision** `id · requestId:ref→CMRequest · decidedBy:ref→People · decision:enum{approved,rejected} · reasons:text · approvedBudget:money? · escalatedTo:ref→People?`
**Adjustment Request** `id · approvedPlanId:ref→ApprovedPlan · change:enum{add,swap} · accountId:ref→Account · reason:text · at:datetime`
**Adjustment Decision** `id · requestId:ref→AdjustmentRequest · decision:enum{approved,rejected} · decidedBy:ref→People`
**Discount Request** `id · orderId:ref→Order · discount:decimal · justification:text · status:enum{pending}`
**Discount Decision** `id · requestId:ref→DiscountRequest · decision:enum{approved,rejected} · reason:text · escalatedTo:ref→People?`
**Targets** `id · repId:ref→People · period:{from:date,to:date} · visitTarget:int · coverageTarget:int · salesTarget:money`
**Focus Products** `id · scope:enum{rep,territory} · scopeId:ref · productIds:[ref→Product]`
**Coaching Note** `id · repId:ref→People · authorId:ref→People · note:text · oneOnOneAt:datetime? · createdAt:datetime`
**Direct Message** `id · fromId:ref→People · toId:ref→People · body:text · sentAt:datetime · replies:[{fromId:ref→People,body:text,at:datetime}]`
**Upward Summary** `id · authorId:ref→People · recipientId:ref→People · period:{from:date,to:date} · body:text · pushedAt:datetime`
**Product Directive** `id · pmId:ref→People · productId:ref→Product · title:text · priority:enum{low,med,high} · message:text · kind:enum{directive,announcement} · audienceRepIds:[ref→People]`
**Product Directive Acknowledgment** `id · directiveId:ref→ProductDirective · repId:ref→People · at:datetime`
**Material Push** `id · pmId:ref→People · approvedContentId:ref→ApprovedContent · repIds:[ref→People] · at:datetime`
**Promo Request** `id · requesterId:ref→People · productId:ref→Product · mechanics:text · budget:money · status:enum{submitted}`
**Promo Decision** `id · requestId:ref→PromoRequest · decision:enum{approved,rejected} · reason:text`
**Promo Launch** `id · decisionId:ref→PromoDecision · launchedAt:datetime · targetedField:[ref→People]`
**Accompaniment Log** `id · managerId:ref→People · repId:ref→People · approvedPlanId:ref→ApprovedPlan · notes:text · at:datetime`
**Content Submission** `id · submitterId:ref→People · productId:ref→Product · asset:text (uri) · status:enum{submitted}`
**Approved Content** `id · submissionId:ref→ContentSubmission · approvedBy:ref→People · comments:text? · version:int · asset:text (uri)`
**Campaign** `id · ownerId:ref→People · materialPushId:ref→MaterialPush? · spend:money · window:{from:date,to:date} · attributedOrderIds:[ref→Order] · roi:decimal`
**Broadcast Directive** `id · senderId:ref→People · audienceGroups:[enum{DM,RSM,FSM,ASM,PM,Rep,...}] · recipientCount:int · body:text · sentAt:datetime`
**Broadcast Acknowledgment** `id · directiveId:ref→BroadcastDirective · personId:ref→People · at:datetime`
**Reorder** `id · accountId:ref→Account (Trade) · lines:[{productId:ref→Product,qty:int}] · sentAt:datetime`
**Distributor Audit** `id · accountId:ref→Account (Trade) · checklist:[{item:text,done:bool}] · quarter:text · completedAt:datetime?`
**Customer Record** `id · fromLeadId:ref→ContactLead · accountId:ref→Account (channel=HCP)`
**Session** `userId:ref→People · roles:[enum] · issuedAt:datetime · expiresAt:datetime` (from Entra)

### Config (hardcoded first, then admin-produced)

**Form Definition** `id · formKey:enum{visit_log,order,...} · version:int · fields:[{key:text,label:text,type:enum,required:bool,conditionalOn:text?}] · publishedAt:datetime`
**Approval Chain** `id · approvalType:enum{plan,cm,discount,promo,lead_sla} · steps:[{threshold:money?,approverRole:enum,escalatesToRole:enum?}] · version:int`
**AI Rules** `id · name:text · naturalLanguage:text · scope:{productIds:[ref]?,territoryIds:[ref]?} · enabled:bool · version:int`
**Active Model** `id · useCase:enum{nba,intel,forecast,insights,assistant,voice,summary} · modelId:text · changedBy:ref→People · changedAt:datetime`
**Permission Matrix** `id · role:enum · resource:text · crud:{c:bool,r:bool,u:bool,d:bool} · fieldOverrides:[{field:text,visible:bool}] · version:int`
**Report** `id · reportKey:text · scopeId:ref→Territory · rows:[...] · format:enum{pdf,excel}`
**Report Definition** `id · authorId:ref→People · fields:[text] · filters:[...] · grouping:[text] · schedule:{cron:text,recipients:[ref→People]}?`
**Config Audit Record** `id · changeType:text · producerStory:text · who:ref→People · what:json · when:datetime · signedOffBy:ref→People?`
