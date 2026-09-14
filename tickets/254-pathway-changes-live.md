# 254: The teacher can change the review pathway during the lesson

**What to build:** The pathway the teacher chose at Create stays the lesson's plan, and during the lesson the live teacher view shows the same line of stops with every stop the class has not reached still switchable. Students' flow follows the changed pathway.

**Blocked by:** none.

**Status:** open

**Triage:** `ready-for-agent`

---

## Problem Statement

Planning conversation (2026-09-14). The pathway is fixed at Create (spec v3 story 11), but the best moment to decide on class review is mid-lesson, when the teacher can see that 12 of 20 slipped on Q4. The user: "i want the teacher to still decide at create (so they know what lesson shape they're getting into), but yeah agree that they should be able to change during the actual ICW & lesson."

## Solution

- Create is unchanged (ticket 246: the teacher still picks, Create waits).
- `lib/pathway.ts`: a pure rule for which stops may change at a moment: a stage may be switched on or off while no student present has entered it. Stages already entered are locked.
- Live teacher view: the pathway line (PathwayMap's look) with locked stops in ink and switchable stops as toggles; a change writes the assignment's pathway in classroom state.
- Student reducer: the next stage after hand-in, rework hand-in and group done reads the current pathway, so a change reaches students who have not passed that transition; the student PathwayStrip updates.
- Switching on group review mid-lesson uses the seating groups as Confirm groups would (absences from ticket 250 applied).

## Acceptance

- [ ] Unit: the change rule for each stage against students at every stage; routing after a mid-lesson change (group review added, class review added, individual review removed before anyone reaches it)
- [ ] Click-through, teacher + Sam's iPad at 1280×800: add class review while Sam is working and he lands in class wait after rework; remove group review before anyone reaches it; a stage Sam is in cannot be switched; the strip on the iPad updates; nothing on the live view moves when a stop toggles
- [ ] vitest, eslint, tsc, next build, check:laptop
