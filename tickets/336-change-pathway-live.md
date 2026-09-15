# 336: The teacher can change the pathway from the decision card during the lesson

**What to build:** on ticket 335's card, Change lets the teacher switch any review stage the class hasn't reached on or off, in the pathway line's look. Students' flow follows the changed pathway from their next transition, the strips on the teacher's laptop and on the iPads update, and turning group review on mid-lesson makes groups from seating.

**Blocked by:** 335.

**Status:** open

**Triage:** `ready-for-agent`

---

## Problem Statement

Carried over from ticket 254 (deleted), planning conversation 2026-09-14: the pathway chosen at Create stays the lesson's plan, but "yeah agree that they should be able to change during the actual ICW & lesson." Review-control grilling, 2026-09-15: the change is made from the decision card ("confirm they want to keep their pathway, or change it").

## Solution

- **A pure rule for which stages may change at a moment.** A stage may be switched on or off while no present student has entered it; stages already entered are locked. Individual working is always locked.
- **The card's Change.** It opens the pathway line (the Create pathway map's look, with each stage's description under it) inside the card: locked stages in ink, switchable ones as toggles, plus Done. Done writes the assignment's pathway in classroom state and answers the decision.
- **Routing.** Where a student goes after hand-in, after corrections and when group review is done reads the pathway as it is now, so a change reaches every student who hasn't yet passed that transition.
- **Group review turned on mid-lesson.** Groups come from the assignment's seating, as Create's Confirm groups would make them, with absent students left out (ticket 250) and ticket 332's rule applied.
- **Strips.** The teacher's strip (ticket 334) and Sam's iPad strip update immediately.

## Acceptance

- [ ] Unit: the change rule for each stage against students at every stage; routing after each change (group review added, class review added, individual review removed before anyone reached it, a locked stage refused); groups from seating with an absence
- [ ] Click-through against a production build at 1280×800 and 1440×900 with Sam's iPad and the teacher tab:
  - from the card, add class review on a set without it: both strips show it, and Sam lands on class review's wait after group review
  - remove individual review before Sam hands in: Sam goes straight to group review
  - a stage Sam has entered is locked in the card
  - a reload keeps the pathway
  - no row moves; screenshots checked
- [ ] vitest, eslint, tsc, next build, check:laptop
- [ ] Ticket docs: `architecture/336.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES, README
