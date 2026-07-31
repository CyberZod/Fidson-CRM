# How We Write Stories (the v2 method)

The approach behind [user-stories.md](user-stories.md), distilled from the 2026-07-22 working session. We started from the prototype, ignored the old backlog, and rebuilt the rep's core loop from first principles. This is the reusable process for every screen, role, and new requirement after it.

The one-line version: **walk the platform as a dependency chain, extract each story by finding where its loop closes, keep the core honest and minimal, and defer everything else to its own later story.**

---

## 1. Dependency chain first, not screen by screen

Screens hide what must exist before them; the journey exposes it. Don't pick a screen and build it shallow. Find the earliest real action after login, and build in dependency order, each story consuming the previous one's output.

For the rep: **Plan → Check-in → Visit log → Order.** The plan is signed off before a visit can reference it; the check-in happens before there's anything to log; the log sits inside a check-in; the order sits inside a visit. You cannot honestly build the log before the plan exists, because the log's institution comes from the plan.

Milestones do **not** come first. The breakdown comes first; milestones are a billing view projected onto it afterwards.

## 2. Five questions to extract a story

Run these on any screen or requirement:
1. **What can someone do that they couldn't before?** No answer means it's decoration, not a story (this killed the attendee-count *ritual* until we found its real home).
2. **Who complains if it's missing?** The owner is whoever *complains*, not whoever clicks. GPS is operated by the rep but owned by the manager.
3. **Where does the loop close, and who receives it?** If there's no place to stand and watch it succeed, it's a fragment.
4. **What's cheap vs machinery?** Cheap = data capture (a field becoming a saved value). Machinery = needs reference data, a policy, a background process, or another person.
5. **What did this silently decide?** Prototypes smuggle in policy (planned-visits-only, no consent). Surface it as a client question, not an accident.

## 3. The format

```
## Story N: <short title>
*As a <persona>, I want <capability>, so that <value>.*

Seeds / depends on: <upstream stories + seeded reference data>

Core acceptance (the walk):
1. Given / when / then...
2. ...
3. **The receiving-end line — cross to the consumer's screen and see it.**

Additions (separate later stories): <list>

To confirm with Fidson: <open policy questions>
```

## 4. Done is at the receiving end

A story is done when its output shows up **at its consumer**, never at the button that produced it. A toast saying "submitted" is the prototype's idea of done; it proves a click, nothing more. The demo script must cross screens: submit on the producer side, then go to the consumer and see it. The consumer is whoever the value is *for*: a manager, the PM, sales admin, or the rep's own downstream screen. The bolded acceptance line is that crossing.

## 5. Core vs Addition: does removing it make the output a lie, thinner, or unproven?

- **Lie** (invalid data) → **prerequisite**, welded into the core story. The order's priced catalogue; the log's institution. Faking it poisons everything downstream.
- **Thinner** (pure enhancement) → **addition**, its own later story. Offline sync, voice, AI, over-threshold approval.
- **Unproven but still honest** → belongs to the core story's *value* if it's part of what makes the record trustworthy (GPS on the check-in). Whether its code is a separate PR is a **work** question for refinement, not a reason to split the story.

Two axes people confuse: **"needed" is not "same story," and "separable" is not "different story."** The test for same-story is only *"is the output a lie without it?"* Splitting the work is refinement's job.

Proof-of-realness layers (GPS, signature, LPO) are a **policy** call: decide siblings together with the same question ("does a valid record require this proof at the moment it's created?").

## 6. Seed vs integration

Honesty needs the reference **data** to exist, not a live integration with the source system. Three layers people smash together: the data itself, live sync, and the management workflow. A trustworthy loop needs only the data.

- **Seed** = a one-time load (Fidson exports a spreadsheet, we load it). Cheap, no seams, kills fakes.
- **Integration** = live sync. The expensive seam; its own later story.

Integrate only when the cost of staleness exceeds the cost of integrating (prices force it soonest; territories last a year). Never drag ERP integration into the first milestone to buy "realness" — seed instead.

## 7. Deepening vs prerequisite (same widget, different verdict)

A **deepening** improves an already-true result (remove it, still real). A **prerequisite** is required for the result to be true at all (remove it, output is a lie). The *same* field can be either: descriptive (typed is a true record → deepening) or referential (must resolve to a real entity → prerequisite). The product field is descriptive on a visit note but referential on an order. We chose referential on the log too, because the catalogue is already seeded and product intelligence needs it countable.

## 8. One form, many stories; keep the parent minimal

A screen is a room; its sections are often different stories with different consumers. Keep the parent record minimal (who / where / when + core content) so siblings attach to it. A field belongs to whichever story's so-that it serves, even if it renders on another story's screen: competitor intel renders on the visit log but belongs to the PM's signal-feed story.

## 9. A receiving view is usually not its own story

It's the receiving end of the producing story (the RSM live feed is the check-in story; the sales-admin queue is the order story). Showing many producers instead of one is "same feed, more rows" — acceptance criteria, not new behavior. A consuming view earns its own story only when the consumer does something a single hand-off doesn't imply: **aggregate over time, spot patterns across producers, triage-and-act, or review history.**

## 10. Two-sided workflows: split into request + decide

An approval or request loop is **two stories**, because it produces two artifacts. The **request** side produces a *Submitted/Request* artifact and is done when it lands in the approver's queue. The **decide** side *requires* that artifact and produces a *Decision/Approved* artifact, done when the requester sees the outcome. Split this way, each half is an independently shippable, testable chunk (the request side can demo before the decision UI is built). The approver's queue and the requester's outcome view are receiving ends, built inside their own stories; hand-offs are written as AC on the receiving story. Stable artifact names (e.g. Approved Plan) insulate downstream consumers from the split, they depend on the artifact, not the story number.

Where each side genuinely stands alone as different value (rep logs a visit / manager oversees the team), it's also two stories, but by the different-artifact test, not the request/decide pattern.

## 11. Machinery lives under its first consumer

No standalone machinery tickets. The approval flow is built under the plan story (its first consumer) and generalized later under the second consumer (discounts). The repo remembers what engines exist; Jira tracks work, not architecture.

---

## How this maps to the board

- **Task** = a unit of work and safety: one PR, reviewed, revertible. Granularity lives here. Moved by automation; skips Testing/UAT.
- **Story** = a unit of value and acceptance: the format above. Closed only when a human walks the bolded receiving-end line in Testing → UAT.
- **Milestone** = a unit of shipping and payment: a bundle of stories, projected onto the breakdown *after* it exists.
