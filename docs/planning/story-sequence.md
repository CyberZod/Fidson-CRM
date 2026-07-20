# Story Dependency Sequence (step 2 output, 2026-07-20)

The 82 stories from [stories.md](stories.md) arranged in dependency order. A story appears only after everything in its needs-line. Waves are dependency layers, NOT milestones: milestones get cut across these waves later (a milestone may take all of wave 1 plus slices of waves 2-3).

Keys are immutable; order lives here. NEW-x items get real FID keys at Jira creation, minted in this order.

Gates written as [seed: X] (data import) or [enabler: X] (machinery). A gate listed once applies to everything after it in that wave.

## Wave 1 · Identity and the core record

[seed: facilities/customers from Fidson Excel] [seed: org hierarchy] [enabler: infra/CI (done), Entra config]

1. FID-11 sign in with Entra
2. FID-14 core visit record (who/where/when + note)
3. FID-15 manager sees team visits (manager_id rung)
4. FID-12 GPS check-in (decided: evidence with visible flagging)
5. FID-13 offline logging + sync (the risk king; early on purpose)

## Wave 2 · The shape of the day

[seed: territories + rep assignments]

6. FID-17 plan my day from my territory
7. NEW-5 weekly itinerary draft + submit
8. FID-103 RSM approves itineraries + adjustments (pairs with 7, 9)
9. NEW-21 daily adjustment requests (capped)
10. NEW-6 route optimization (needs 7 + facility coordinates)

## Wave 3 · Visit depth (the form grows)

[seed: product catalogue from price list] [seed: content bundle]

11. FID-18 detailing record
12. FID-19 samples logged
13. FID-22 next steps + in-app reminders
14. FID-24 competitor signals
15. FID-102 customer stock capture + restock suggestions
16. FID-23 offline marketing content
17. FID-101 DCR auto-generation
18. NEW-4 visit correction window ⚠ policy

## Wave 4 · Pipeline

19. FID-20 capture new contact with consent
20. FID-21 advance contacts to customer

## Wave 5 · Management layer

[seed: targets] [enabler: approval/escalation engine (first consumer here)] [RBAC hardening: matrix chains]

21. FID-26 coverage/compliance dashboards
22. NEW-2 rep sees own performance vs targets
23. FID-27 delegation + upward escalation
24. FID-107 directives send/receive loop
25. NEW-3 directive acknowledgment
26. NEW-10 1:1 manager-to-rep messages (incl. nudges)
27. NEW-11 ASM coaching log
28. NEW-14 manager/PM own field check-ins
29. NEW-9 focus products per rep/territory
30. FID-104 joint calls + accompaniment logging
31. NEW-12 ASM pushes weekly summary to BM
32. NEW-27 RSM pushes to DM
33. NEW-28 DM pushes to NSM

## Wave 6 · Money

[enabler: SOA deep link] [seed: distributor data]

34. FID-33 place order from visit (signature, LPO in AC)
35. FID-35 discount thresholds + approvals (rides approval engine)
36. FID-36 invoice on confirmation
37. NEW-19 sales admin order routing
38. FID-37 customer SOA (deep-link rung)
39. NEW-1 customer 360 (needs visit + order history to be worth opening)
40. NEW-15 distributor directory + onboarding
41. NEW-24 distributor stock health
42. NEW-25 push reorder
43. NEW-26 quarterly distributor audit checklist

## Wave 7 · Marketing workflows

44. FID-28 clinical meeting request + PM decision
45. NEW-20 high-impact CM escalation to HoM
46. FID-29 expense claims (references CM budgets)
47. FID-105 content approval + auto-distribution (replaces content seed)
48. NEW-18 material open-rate visibility
49. FID-106 promo requests -> campaigns
50. FID-108 campaign ROI tracking

## Wave 8 · Aggregation and closure

[gate: several notifying workflows now exist]

51. FID-30 notification center (+ retrofit tasks wiring 28/107/22 into it)
52. FID-95 standard report pack
53. FID-96 custom report builder ⚠ who builds
54. FID-97 scheduled distribution + export
55. FID-31 national dashboard
56. NEW-16 board-pack export ⚠ wanted?
57. NEW-13 manager supervision view ⚠ sensitivity (sources: 23, 27, 101, NEW-11, NEW-14)
58. NEW-8 complaints to closure ⚠ scope

## Wave 9 · Intelligence

[enabler: AI service + guardrails] [enabler: rules engine (Layer 1), currently unticketed] [enabler: ERP sync FID-34 (unlocks native SOA + live stock)]

59. FID-40 AI pre-fill and summarize visits
60. FID-39 voice logging with Fidson vocabulary
61. FID-41 rep next-best-action + lead priorities
62. NEW-29 field manager alerts
63. NEW-30 DM/NSM strategic insights
64. NEW-31 PM/HoM product intelligence
65. FID-42 anomaly detection
66. FID-43 churn risk + forecasting
67. NEW-23 auto-drafted weekly summaries
68. NEW-7 quotes with enforced pricing ⚠ scope

## Wave 10 · Self-service (the admin portal, kept fat on purpose)

69-82. FID-62..70 (forms, workflows, organigramme, permissions, territories, catalogue, AI rules, sync conflicts, config audit) and FID-71..75 (model governance). Each replaces a seed or hardcoded flow from earlier waves with client-editable configuration. Sequenced last because every one of them needs its subject to exist and stabilize first.

## Reading this for milestone cutting (step 3)

- Waves 1-2 plus FID-18/19 from wave 3 cover Fidson's MVS rows for territory, GPS, journey planning, offline: the pilot-able core.
- The MVS "complete system" claim needs: orders (wave 6 through FID-36), distributor management (NEW-15/24), complaints (NEW-8), route optimization (NEW-6), reporting (52-54), approvals (engine + FID-35).
- The 8 open questions block nothing before wave 6 except FID-12's policy (wave 1!): get that answered first.
