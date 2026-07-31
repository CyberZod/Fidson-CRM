# Jira Board Snapshot — FID — 2026-07-23

Full capture of the FID board (110 issues) before the stories-first rebuild. This is the restore point. Lossless raw JSON for FID-1..100 is in `fid-board-p1-raw.json`; FID-101..110 are listed with descriptions at the bottom.

| Key | Type | Status | Parent | Labels | Summary |
|---|---|---|---|---|---|| FID-1 | Epic | Pending | - |  | Phase 0 Â· Discovery & Requirements Validation |
| FID-2 | Epic | Pending | - |  | Phase 1 Â· Architecture & Foundations |
| FID-3 | Epic | Pending | - |  | Slice 1 Â· The Core Visit Loop |
| FID-4 | Epic | Pending | - |  | Slice 2 Â· The Complete Field Call |
| FID-5 | Epic | Pending | - |  | Slice 3 Â· Oversight, Approvals & Reporting |
| FID-6 | Epic | Pending | - |  | Slice 4 Â· Orders & ERP |
| FID-7 | Epic | Pending | - |  | Slice 5 Â· AI Insights |
| FID-8 | Epic | Pending | - |  | Phase 7 Â· Hardening, Security & Full UAT |
| FID-9 | Epic | Pending | - |  | Phase 8 Â· Training, Rollout & Go-Live |
| FID-10 | Epic | Pending | - |  | Run & Continuous Improvement |
| FID-11 | Story | Pending | FID-3 | field-rep, slice-1-core-loop | Rep signs in with Microsoft Entra ID (SSO) |
| FID-12 | Story | Pending | FID-3 | field-rep, slice-1-core-loop | Rep checks in to a visit with automatic GPS capture |
| FID-13 | Story | Pending | FID-3 | field-rep, slice-1-core-loop | Rep logs a visit offline; it auto-syncs without duplicates |
| FID-14 | Story | Pending | FID-3 | field-rep, slice-1-core-loop | Rep logs core visit details (single source of truth) |
| FID-15 | Story | Pending | FID-3 | first-line-manager, slice-1-core-loop | Manager sees their team's logged visits (near real-time) |
| FID-16 | Task | Pending | FID-3 |  | Field Pilot 1 Â· core loop live in one territory |
| FID-17 | Story | Pending | FID-4 | field-rep, slice-2-field-call | Rep plans the day against assigned territory |
| FID-18 | Story | Pending | FID-4 | field-rep, slice-2-field-call | Rep records the full detailing record for a call |
| FID-19 | Story | Pending | FID-4 | field-rep, slice-2-field-call | Rep logs samples issued on a call |
| FID-20 | Story | Pending | FID-4 | compliance, field-rep, slice-2-field-call | Rep captures a new contact on the spot, with consent |
| FID-21 | Story | Pending | FID-4 | field-rep, slice-2-field-call | Rep moves a contact through the pipeline to customer |
| FID-22 | Story | Pending | FID-4 | field-rep, slice-2-field-call | Rep sets next steps and reminders on a visit |
| FID-23 | Story | Pending | FID-4 | compliance, field-rep, slice-2-field-call | Rep accesses approved marketing content offline |
| FID-24 | Story | Pending | FID-4 | field-rep, slice-2-field-call | Rep captures competitor signals from the field |
| FID-25 | Story | Pending | FID-5 | sales-management, slice-3-oversight | Manager sees only their part of the hierarchy (role-based access) |
| FID-26 | Story | Pending | FID-5 | leadership, sales-management, slice-3-oversight | Manager sees coverage & compliance dashboards with drill-down |
| FID-27 | Story | Pending | FID-5 | sales-management, slice-3-oversight | Manager delegates oversight and escalates issues |
| FID-28 | Story | Pending | FID-5 | field-rep, sales-management, slice-3-oversight | Rep requests and manager approves a clinical meeting |
| FID-29 | Story | Pending | FID-5 | field-rep, sales-management, slice-3-oversight | Rep submits expenses and manager approves them |
| FID-30 | Story | Pending | FID-5 | field-rep, sales-management, slice-3-oversight | Users get real-time notifications for approvals and escalations |
| FID-31 | Story | Pending | FID-5 | leadership, slice-3-oversight | Leadership sees a native, real-time national dashboard |
| FID-32 | Task | Pending | FID-5 | pilot, slice-3-oversight | Field Pilot 2 Â· reps and all management layers live in pilot region |
| FID-33 | Story | Pending | FID-6 | field-rep, slice-4-orders-erp | Rep places an order from a visit |
| FID-34 | Story | Pending | FID-6 | integration, slice-4-orders-erp | Platform syncs stock, pricing and customers with Business Central |
| FID-35 | Story | Pending | FID-6 | field-rep, sales-management, slice-4-orders-erp | Discount thresholds govern order pricing with approvals |
| FID-36 | Story | Pending | FID-6 | field-rep, integration, slice-4-orders-erp | Invoice auto-generates on confirmed order |
| FID-37 | Story | Pending | FID-6 | field-rep, integration, sales-management, slice-4-orders-erp | Rep sees customer Statement of Account (SOA) from ERP |
| FID-38 | Spike | Pending | FID-6 | integration, slice-4-orders-erp, spike | Spike: Business Central integration approach |
| FID-39 | Story | Pending | FID-7 | ai, field-rep, slice-5-ai-insights | Rep logs a visit by voice with Fidson-specific vocabulary |
| FID-40 | Story | Pending | FID-7 | ai, field-rep, slice-5-ai-insights | AI pre-fills and summarises a rep's visit (human-in-the-loop) |
| FID-41 | Story | Pending | FID-7 | ai, field-rep, sales-management, slice-5-ai-insights | Role-specific insights and next-best-action |
| FID-42 | Story | Pending | FID-7 | ai, leadership, sales-management, slice-5-ai-insights | Geo-coverage anomaly detection flags unusual activity |
| FID-43 | Story | Pending | FID-7 | ai, leadership, sales-management, slice-5-ai-insights | Churn-risk and forecasting with explained drivers |
| FID-44 | Story | Pending | FID-7 | ai, platform, slice-5-ai-insights | AI service guardrails: async, rate-limiting, cost and HITL controls |
| FID-45 | Task | To Do | FID-1 | discovery, phase-0-discovery | Stakeholder discovery workshops |
| FID-46 | Task | To Do | FID-1 | discovery, phase-0-discovery | Requirements sign-off |
| FID-47 | Task | CANCELLED | FID-1 | commercial, phase-0-discovery | Fixed-price build proposal (go/no-go gate) |
| FID-48 | Task | Pending | FID-2 | architecture, phase-1-foundations | Architecture document & design approval |
| FID-49 | Task | Pending | FID-2 | infrastructure, phase-1-foundations | Infrastructure provisioning (Azure tenancy & foundations) |
| FID-50 | Task | Pending | FID-2 | data-migration, phase-1-foundations | Data-migration setup (from Excel / Power Apps) |
| FID-51 | Task | Pending | FID-8 | phase-7-hardening, qa | System integration testing & full UAT |
| FID-52 | Task | Pending | FID-8 | performance, phase-7-hardening | Load, offline-sync stress & disaster-recovery testing |
| FID-53 | Task | Pending | FID-8 | phase-7-hardening, security | Security penetration testing & bug resolution |
| FID-54 | Task | Pending | FID-9 | phase-8-rollout, training | Role-based training & user materials |
| FID-55 | Task | Pending | FID-9 | change-management, phase-8-rollout | Change-management & adoption push |
| FID-56 | Task | Pending | FID-9 | go-live, phase-8-rollout | Phased rollout, go-live & hypercare |
| FID-57 | Task | Pending | FID-10 | run-support, sla | Operating model & SLA setup |
| FID-58 | Task | Pending | FID-10 | continuous-improvement, run-support | Usage analytics & quarterly enhancement backlog |
| FID-59 | Epic | Pending | - | admin-portal, configuration-spine, source:prd-v2 | Administrator Portal Â· Configuration Spine |
| FID-60 | Epic | Pending | - | ai-governance, source:prd-v2 | AI Control & Governance |
| FID-61 | Epic | Pending | - | compliance, nfr, source:prd-v2 | Platform NFRs & Compliance |
| FID-62 | Story | Pending | FID-59 | admin-portal, source:prd-v2 | Visual form builder (drag-drop, conditional logic, versioning) |
| FID-63 | Story | Pending | FID-59 | admin-portal, source:prd-v2 | Workflow builder (approval chains, escalations, triggers & actions) |
| FID-64 | Story | Pending | FID-59 | admin-portal, rbac, source:prd-v2 | Organigramme editor (org tree, matrix branches, role definitions) |
| FID-65 | Story | Pending | FID-59 | admin-portal, rbac, source:prd-v2 | Permission matrix editor (role Ã— table CRUD, field-level overrides) |
| FID-66 | Story | Pending | FID-59 | admin-portal, source:prd-v2 | Territory editor (map-based polygon drawing, rep-to-territory) |
| FID-67 | Story | Pending | FID-59 | admin-portal, source:prd-v2 | Product catalogue manager (SKUs, price tiers, discount ceilings) |
| FID-68 | Story | Pending | FID-59 | admin-portal, ai, source:prd-v2 | AI rules-engine editor (plain-language authoring, dry-run mode) |
| FID-69 | Story | Pending | FID-59 | admin-portal, offline-sync, source:prd-v2 | Offline-sync conflict-resolution queue (admin review) |
| FID-70 | Story | Pending | FID-59 | admin-portal, audit, source:prd-v2 | Configuration audit log + sign-off for high-impact changes |
| FID-71 | Story | Pending | FID-60 | ai-governance, source:prd-v2 | Model catalogue (vendor, capability, pricing, active toggle) |
| FID-72 | Story | Pending | FID-60 | ai-governance, source:prd-v2 | Per-use-case model assignment |
| FID-73 | Story | Pending | FID-60 | ai-governance, source:prd-v2 | Live spend dashboard (per model, per use-case, per user) |
| FID-74 | Story | Pending | FID-60 | ai-governance, source:prd-v2 | Budget thresholds and spend alerts |
| FID-75 | Story | Pending | FID-60 | ai-governance, audit, source:prd-v2 | One-click model swap with audit trail |
| FID-76 | Spike | Pending | FID-60 | ai-governance, compliance, source:prd-v2, spike | DeepSeek V4 Flash as a compliance-gated catalogue candidate |
| FID-77 | Task | Pending | FID-61 | ai, nfr, observability, source:prd-v2 | AI observability: OpenTelemetry traces + Foundry evaluators |
| FID-78 | Task | Pending | FID-61 | audit, compliance, nfr, source:prd-v2 | Audit and retention: append-only log, 7-year, optional chaining |
| FID-79 | Task | Pending | FID-61 | nfr, security, source:prd-v2 | Security posture: OWASP, WAF, APIM rate-limit, Key Vault, Snyk, encryption |
| FID-80 | Task | Pending | FID-61 | dr, nfr, source:prd-v2 | Disaster recovery: RTO 4h / RPO 1h, backups |
| FID-81 | Task | Pending | FID-61 | compliance, nfr, source:prd-v2 | Compliance deliverables: DPIA, NITDA filing, transfer basis |
| FID-82 | Task | Pending | FID-61 | ai, cost, nfr, source:prd-v2 | Cost NFRs: reasoning_effort tiering + semantic-cache hit-rate target |
| FID-83 | Task | Pending | FID-61 | compliance, data-model, nfr, source:prd-v2 | sample_movements silent data model (NAFDAC defensibility) |
| FID-84 | Story | Pending | FID-7 | ai, copilot, rbac, source:prd-v2 | Harden copilot into the multi-agent RBAC-gated text-to-SQL chain |
| FID-85 | Story | Pending | FID-7 | ai, copilot, source:prd-v2 | Parameterised query template library + admin sign-off |
| FID-86 | Story | Pending | FID-7 | ai, audit, copilot, source:prd-v2 | Read-only replica execution with row caps + full audit trail |
| FID-87 | Story | Pending | FID-7 | ai, rag, security, source:prd-v2 | RAG guardrails: cite-or-refuse, PII redaction, RBAC-filtered retrieval |
| FID-88 | Story | Pending | FID-4 | lead-account, source:prd-v2 | Lead deduplication on creation (fuzzy match) |
| FID-89 | Story | Pending | FID-4 | lead-account, source:prd-v2 | Automated lead assignment by territory polygon + workload balancing |
| FID-90 | Story | Pending | FID-4 | lead-account, source:prd-v2 | Lead SLA-breach escalation (72h default, configurable) |
| FID-91 | Story | Pending | FID-4 | lead-account, source:prd-v2 | HCP-to-outlet relationship graph + lead status workflow |
| FID-92 | Story | Pending | FID-5 | rbac, source:prd-v2 | Matrix dual-chain RBAC (sales chain + product chain) |
| FID-93 | Story | Pending | FID-5 | rbac, source:prd-v2 | Field-level permission overrides + workflow-state visibility |
| FID-94 | Story | Pending | FID-5 | rbac, security, source:prd-v2 | Four-layer permission enforcement (API, RAG, text-to-SQL, UI) |
| FID-95 | Story | Pending | FID-5 | reporting, source:prd-v2 | 25+ standard report pack |
| FID-96 | Story | Pending | FID-5 | reporting, source:prd-v2 | Custom report builder (Reports Author role) |
| FID-97 | Story | Pending | FID-5 | reporting, source:prd-v2 | Scheduled report distribution + PDF/Excel export |
| FID-98 | Story | Pending | FID-6 | integration, source:prd-v2 | Microsoft Graph integration (Teams notifications, Outlook calendar) |
| FID-99 | Story | Pending | FID-6 | integration, source:prd-v2 | Outbound webhook framework for platform events |
| FID-100 | Story | Pending | FID-6 | integration, source:prd-v2 | Public REST API documented in OpenAPI 3.1 |
| FID-101 | Story | Pending | FID-4 | field-activity, source:prototype | Daily Call Report (DCR) auto-generation and submission |
| FID-102 | Story | Pending | FID-4 | field-activity, source:prototype | Customer-inventory audit and restock recommendations |
| FID-103 | Story | Pending | FID-5 | oversight, source:prototype | Itinerary governance and daily adjustments |
| FID-104 | Story | Pending | FID-5 | coaching, oversight, source:prototype | Accompaniment and joint-call scheduling (coaching) |
| FID-105 | Story | Pending | FID-5 | marketing, oversight, source:prototype | Content/material approval workflow |
| FID-106 | Story | Pending | FID-5 | marketing, oversight, source:prototype | Promo request submission and approval workflow |
| FID-107 | Story | Pending | FID-5 | oversight, source:prototype | Directives broadcast and acknowledgment |
| FID-108 | Story | Pending | FID-5 | marketing, oversight, source:prototype | Campaigns and ROI tracking |
| FID-109 | Task | Done | - | (none) | Verify GitHub-Jira integration end to end (branch, PR, merge visible on ticket) |
| FID-110 | Task | Done | - | (none) | Verify board automation (branch -> In Progress, merge -> Done) |

## FID-101..108 descriptions (prototype-derived, captured before rebuild)

- **FID-101 DCR:** Auto-compose a rep's Daily Call Report from the day's visit logs and planned stops, AI-written summary, submit up the chain. Prototype: RepDCRView + RSM Reports feed. Epic FID-4.
- **FID-102 Customer inventory:** Capture/surface HCP-outlet stock-on-hand at product level, flag low stock, recommend restock; feeds rep next-best-action and PM portfolio insight. Prototype: CustomerInventoryView. Epic FID-4.
- **FID-103 Itinerary governance:** Managers approve weekly itineraries; daily adjustment requests (add/swap/reroute) with a configurable cap; approval + escalation tracking; locked beat plan with approved variance. Prototype: RSMItinerariesView. Epic FID-5.
- **FID-104 Accompaniment:** Managers/PMs schedule shadow visits and joint calls, capture coaching notes against them. Prototype: PMFieldView. Epic FID-5.
- **FID-105 Content approval:** PM/MM review and sign off marketing/clinical/competitive/detailing materials; category-tagged; PM + MM sign-off stages; approved content flows to rep library (FID-23). Prototype: MMContentApprovalsView. Epic FID-5.
- **FID-106 Promo:** Field submits promo request (channel, budget, rationale); PM approve/reject/launch with status; launched promos link to campaigns (FID-108). Prototype: PMPromoView. Epic FID-5.
- **FID-107 Directives:** Compose/broadcast directives (title, message, product focus, priority); targeted broadcast (PM to portfolio reps; NSM to org); per-rep acknowledgment. Prototype: PMDirectivesView + NSMDirectiveView. Epic FID-5.
- **FID-108 Campaigns/ROI:** Campaign records (spend, revenue, ROI %, status); 60-day attribution tracing material dispatch to orders; cross-product ROI view. Prototype: CampaignsView. Epic FID-5.
