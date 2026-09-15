# 334: The pathway sits beside "← Edexia Classroom" on Class View and Mistakes

**What to build:** on a set's Class View and Mistakes tab, the lesson's pathway sits on the back button's line, right-aligned: the stages as pills with arrows between them, force submit and the done count beside the current stage. It is the same strip in the same place on both tabs, and it replaces the Pathway card in Class View's right column and the single stage pill on Mistakes. Every stage pill in the product comes from one shared pill with four states.

**Blocked by:** none (can start immediately).

**Status:** open

**Triage:** `ready-for-agent`

---

## Problem Statement

Review-control grilling with Carson, 2026-09-15: "i'd like the pathway visible in both Class & Mistakes view. i think it'd be best to have it in line with the <- back button, right justified. have it same font size as back button, but same coloration as it is now. same idea with border & what happens after that stage. all that good stuff." Force submit (built for individual working, individual review and group review in ticket 145) moves with it, "bigger text than the pathway text".

The 318/319 design session (with Carson, 2026-09-15) added a fourth pill state, finished but still current: the class is done with the stage but hasn't moved on. It asked that this ticket build the one shared pill, so that tickets 318/319 add no pills of their own.

This strip is where ticket 335's decision card tucks away.

## Solution

- **One stage pill component.** It shows a stage's short word in four states:
  - **moved on:** standout fill, white text
  - **current:** standout-soft with the accent ring
  - **upcoming:** standout-soft
  - **finished but still current:** standout fill with the purple ring, shown when every present student is done with the stage the class is still on

  Today's colours carry over unchanged.
- **The strip.** On Class View and Mistakes, it sits on the "← Edexia Classroom" line, right-aligned:
  - the pathway's stages in order (individual working first), at the back button's font size, with the thin arrows between them
  - beside the current stage: force submit (its text larger than the pills'), its pending word while it counts down, "n/total done", and end lesson on a last stage that isn't class review, all behaving as they do today
- **Removed:**
  - the Pathway card from Class View's right column (the group progress, class review and diagnostic cards stay)
  - the stage pill on Mistakes' eyebrow line, including during ticket 315's split
- **Student iPad pathway strip.** It draws its pills through the same component, looking as it does today (the mirror-design rule: one representation for the same object on both sides).
- **Fit.** The strip must fit its line at 1280×800 and 1440×900 with the longest pathway (four stages) and force submit counting down, without wrapping or covering the back button.

## Acceptance

- [ ] Unit: the pill state for every stage at every point of the lesson (fresh, working, everyone handed in but not moved on, individual review, group review, class review, lesson over) and on every pathway
- [ ] Click-through against a production build at 1280×800 and 1440×900 with Sam's iPad and the teacher tab:
  - the strip's pills, arrows, force submit and count have the same rects from the window on Class View and Mistakes (the same-spot rule: the teacher zoom, measured with layout units)
  - the pills are the back button's font size, force submit is larger, everything is on the back button's line and nothing wraps or is covered
  - force submit on each of the three stages runs as before, with the pending word
  - end lesson where it belongs
  - "finished but still current" appears once everyone has handed in and before the class moves on
  - the Pathway card and Mistakes' old pill are gone
  - the right column's other cards are unmoved in order
  - Sam's strip looks unchanged (pixel compare)
  - no sideways scroll
  - screenshots checked
- [ ] vitest, eslint, tsc, next build, check:laptop
- [ ] Ticket docs: `architecture/334.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES, README
