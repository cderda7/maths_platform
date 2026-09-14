# 273: The teacher can end a lesson whose pathway has no class review

**What to build:** A real teacher control that ends the lesson when the pathway has no class review. Today only class review's End session or the presenter skip "activity completed" (ticket 263) can end a lesson, so a set on individual → group stays under Live as "in review" once groups finish.

**Blocked by:** 272, 275 (both touch the files this does).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Ticket 263 made `lessonEndedAt` end a lesson without class review but gave the teacher no button for it. Asked "should the teacher get a real 'end lesson' button for pathways without class review?", the user (2026-09-14): "yes".

## Solution

- On the live Class View's pathway card, once the class is on the pathway's last stage and that stage is not class review, an "end lesson" pill beside the stage, in the look of the existing "force submit" pill, with the same kind of confirmation (how many students are still in the stage).
- Ending writes `lessonEndedAt` through the classroom reducer (as the skip does): the set moves to Past, students still in the stage land on their report, Sam's iPad included; the one-minute grace applies as for every teacher-driven advance (spec v3).
- If the placement cannot fit at 1280×800 without moving the card's other contents, stop and report with measurements rather than choosing another spot.

## Acceptance

- [x] Unit: end allowed only on a non-class-review last stage; state after ending; grace
- [x] Click-through, teacher + Sam's iPad at 1280×800 and 1440×900 on individual → group and individual only: the pill appears only on the last stage, confirm shows the count, the grace counts down on the iPad, the set lands in Past and Sam on his report; nothing on the pathway card moves when the pill appears
- [x] vitest, eslint, tsc, next build, check:laptop
