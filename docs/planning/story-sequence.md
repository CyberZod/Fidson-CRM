# Story Dependency Graph (v2, 2026-07-22: hard story-to-story dependencies only)

Supersedes the v1 "waves" arrangement. This version orders stories ONLY by hard dependency: story B appears under story A only if B cannot be built or make sense until A is done. Seeds (data imports) and machinery (approval engine, notification engine, AI service) are deliberately EXCLUDED: refinement resolves those, per the absorb-or-extract rule, and they do not order stories. Data-richness preferences (e.g. customer 360 is better once orders exist) are rungs, not dependencies, and are marked (rung) where relevant.

Read: indentation = depends on everything above it in its chain. A → B means B needs A done first.

## The identity/visit tree (the big one)

- FID-11 sign in with Entra (root)
  - FID-14 core visit record
    - FID-12 GPS check-in (decided: evidence w/ flagging)
      - NEW-14 manager/PM own check-ins
      - FID-42 anomaly detection (reads check-in data)
    - FID-13 offline logging + sync
      - FID-69 sync conflict queue (admin; conflicts only exist once offline sync does)
    - FID-18 detailing · FID-19 samples · FID-22 next steps/reminders · FID-24 competitor signals · FID-102 stock capture · NEW-4 corrections · FID-39 voice logging · FID-40 AI pre-fill (all attach to the record)
    - FID-15 manager sees team visits
      - FID-26 dashboards
        - FID-31 national dashboard · NEW-29 field-manager alerts · NEW-30 DM/NSM strategic insights
    - FID-101 DCR auto-generation
    - FID-20 capture contact w/ consent
      - FID-21 pipeline to customer
    - NEW-1 customer 360 (visits-only first; orders enrich later (rung))
    - FID-41 rep next-best-action (reads visit data)
    - FID-95 standard reports → FID-96 custom builder → FID-97 scheduled distribution
    - FID-43 churn/forecast (reads visit+order data; sample-data rung per JBS §4.1)
    - FID-33 place order
      - FID-35 discount approvals · FID-36 invoices · NEW-19 sales admin routing · FID-108 campaign ROI (needs order data) · NEW-24 distributor stock health (order data enriches (rung))
      - NEW-31 PM/HoM product intelligence (detailing + campaign data)

## Independent chains (roots; can start anytime)

- FID-17 plan my day → NEW-5 weekly itinerary → FID-103 RSM approval → NEW-21 daily adjustments; NEW-5 → NEW-6 route optimization; NEW-5 → FID-104 joint calls (scheduling rides itineraries)
- FID-28 CM request + PM decision → NEW-20 HoM high-impact tier
- FID-107 directives loop → NEW-3 acknowledgment
- NEW-15 distributor directory → NEW-24 stock health → NEW-25 push reorder; NEW-15 → NEW-26 quarterly audit
- FID-105 content approval workflow → NEW-18 open rates (also fed by FID-23)
- NEW-12 ASM→BM summary · NEW-27 RSM→DM · NEW-28 DM→NSM → NEW-23 auto-draft (upgrade on the family)
- Standalone roots, no parents and no children blocking on them at story level: FID-23 offline content, FID-29 expenses, FID-37 SOA deep link, NEW-2 performance vs targets, NEW-7 quotes ⚠, NEW-8 complaints ⚠, NEW-9 focus products, NEW-10 1:1 messages, NEW-11 coaching log, FID-106 promo requests, NEW-16 board pack ⚠

## Aggregators (multi-parent: need SOME parents done, not all)

- FID-30 notification center: needs 2-3 notifying stories live (FID-28, FID-107, FID-22 are the natural first three)
- NEW-13 supervision view: reads outputs of FID-27, FID-101, NEW-11, NEW-14; meaningful once at least two exist

## Admin portal: every story is a self-service replacement of something in use

- FID-62 form builder ← visit form (FID-14 + sections)
- FID-63 workflow builder ← hardcoded approval chains (FID-28/35/103 in use)
- FID-64 organigramme editor ← seeded hierarchy in use
- FID-65 permission matrix ← RBAC in use
- FID-66 territory editor ← territory seed in use (FID-17)
- FID-67 catalogue manager ← catalogue seed in use (FID-18/33)
- FID-68 AI rules editor ← rules engine in use (FID-41)
- FID-69 conflict queue ← FID-13 (listed in the visit tree; the one admin story with a true early parent)
- FID-70 config audit ← any admin editing exists (62-68)
- FID-71..75 AI governance ← AI stories in use (39/40/41)
Rule of thumb: each replacement can ship a "foundation" rung (view + basic edit) early, per the JBS week-6 commitment, with the full builder later.

## What this graph is for

Milestones pick stories in any order that respects the arrows: a story may ship in any milestone at-or-after all its parents. The JBS 10-week schedule is one legal such picking (verified against this graph; its early pulls: conflict queue, complaints, 360, admin foundation, are all rungs or roots, not violations). FID-27 delegation and FID-29 expenses etc. sit wherever their milestone wants them.
