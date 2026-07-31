# Screen Story Map · Rep · Visit Log

First artifact of the screen-sweep method (2026-07-22). The prototype already shows the whole product; stories no longer need discovering from imagined journeys alone. A screen sweep walks the built screen element by element and answers four questions:

1. Which story OWNS each piece of furniture? (Screens stay rooms; stories stay the unit of value. The map is a coverage audit, not a new story type.)
2. Which parts are **demo theater**: scripted fakes that look like product but have no machinery behind them?
3. Where does the prototype **contradict or omit** what a story requires (deltas)?
4. When is this screen **fully real**: the last milestone whose stories land here?

A screen with an element no story owns = a gap in the master list. A story with no furniture anywhere = a gap in the prototype. Both are findings.

Source: `components/RepVisitLogView.tsx` · Master list: `docs/planning/stories.md` · Milestones: `docs/planning/milestones.md`

## Element → story map

| Screen element | Owning story | Milestone | Notes |
|---|---|---|---|
| Empty state ("No active visit → View Today's Plan") | FID-17 / NEW-5 | M2/M4 | Hand-off Gherkin lives on FID-14 (receiving story) |
| Check-in header + GPS panel (check in, update GPS, coords, "within 50m") | FID-12 | M2 | Decided 2026-07-20: evidence not enforcement; screen matches |
| Offline Mode toggle + "flagged as unverified" notice | FID-12 (flagging) + FID-13 (sync) | M2 | Prototype only flags; real offline queue/sync is FID-13 |
| HCP details (type, name, specialty, phone, email) | FID-14 | M2 | Core record: who/where/when + note |
| Institution field locked to the call point | FID-14 | M2 | AC line: institution comes from the active visit, not typed |
| HCP autosuggest "From your past logs" | FID-14 | M2 | Convenience AC/task, not a story; deepens when NEW-1 data exists |
| Products Detailed (catalog search, FOCUS badges, chips) | FID-18 | M3 | Needs seed catalogue; depth-follows-inputs: typed names until then |
| Conversation Summary | FID-18 | M3 | "How the conversation went" |
| Next Course of Action | FID-22 | M3 | |
| Commitment Reminder (datetime) | FID-22 | M3 | In-app reminders first; push is later machinery |
| Market Intel (competitor brand / promo / pricing, "routes to PM") | FID-24 | M3 | Fields render here; value lands in the PM's Competitor Signal feed |
| Engagement Breakdown counters (doctors / pharmacists / nurses) | FID-20 | M3 | Per playbook determination: attendee counts belong to lead capture; daily totals also feed FID-101 |
| Other Attendees (named role groups) | FID-20 | M3 | |
| New Contact Met → Add to Pipeline | FID-20 → FID-21 | M3 | **Delta: no consent capture** (see below) |
| Today So Far sidebar (daily engagement totals) | FID-101 | M3 | DCR raw material |
| AI · Last Interaction card | NEW-1 (facts) → FID-41 (AI brief) | M3 → M6 | **Demo theater**: hardcoded text today |
| Dictate Visit (record → transcribe → structure → fill) | FID-39 + FID-40 | M6 | **Demo theater**: scripted transcript, fixed fills |
| Place Order button | FID-33 | M5 | Hand-off Gherkin on FID-33 |
| Save Visit & Complete + required-field gating | FID-14 | M2 | Which fields are required per milestone is AC on each attaching story |

## Demo theater (looks real, isn't)

- Voice dictation: fixed transcript, `setTimeout` phases, hardcoded field fills. Real machinery arrives with FID-39/40 (M6).
- AI · Last Interaction card: static string. Real version is NEW-1 visit history first (M3), AI-summarized under FID-41 (M6).
- "Within 50m of target": cosmetic label; no geofence math. FID-12 records distance-from-facility for real.

## Deltas (prototype ↔ story disagreements)

- **Consent missing.** FID-20 requires consent recorded at capture; the New Contact card has name/role/phone only. Prototype gap: the story wins, the production form adds consent.
- **Samples have no furniture.** FID-19 (log samples issued) has no section on this screen or any rep screen. Story exists, room doesn't: the production visit form grows a samples section.
- **Customer stock capture absent here.** FID-102 lives in `CustomerInventoryView`, its own room: fine, noted for that screen's sweep.
- **Edit window.** NEW-4 (correct a log after submit) has no furniture anywhere; expected, it's a ⚠ policy question.

## When is this screen real?

| Milestone | What lands here |
|---|---|
| M2 | Check-in + GPS, offline sync, core record, submit. The screen exists and closes the loop. |
| M3 | Detailing, next steps/reminders, market intel, attendees, new-contact capture, daily totals. The form the client would call whole. |
| M5 | Place Order hand-off goes live. |
| M6 | Voice dictation and AI brief stop being theater. Screen fully real. |

## New stories found

None. Every element traced to an existing key: the master list fully covers this screen. The sweep's yield here was the two prototype gaps (consent, samples) and the demo-theater inventory.
