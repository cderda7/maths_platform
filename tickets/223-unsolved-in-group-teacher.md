# 223: A problem a group could not solve shows up for the teacher and on the report

**What to build:** Once a group closes a problem unsolved (ticket 222), the teacher sees it: the class view's group review card says so under the group's bar ("Q7 not solved after 4 tries"), and on class review setup Q7's example options carry a "not solved in group review" badge where "fixed in group review" would be. The student's report says the group did not solve it rather than a bare "Incorrect".

**Blocked by:** 222.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13) agreed that the teacher should find out while the problem is still live ("the teacher's class view flags 'Group 2 · Q7 unresolved after 4 tries'"), that class review picks it up, and that the report should not just read "Incorrect". Today nothing on the teacher's side distinguishes a problem a group could not solve from one it never reached.

## Solution

- `lib/groupReview.ts`: `stuckProblems(run)`: each problem left for now, with its tries, as `left` until its return closes it `unsolved` (a problem solved on its return drops off).
- `lib/standings.ts`, `app/teacher/GroupProgressCard.tsx`: `GroupStanding.stuck`; under the demo group's bar, in red, "Q7 left for now after 3 tries" while the group is still on the pass, "Q7 not solved after 4 tries" once it closed.
- `lib/examples.ts`, `app/teacher/whole-class/ExamplePicker.tsx`: `unsolvedInGroup` on a mistake someone in the group made on a problem the group closed unsolved; a "not solved in group review" badge (the wrong tone) on the slot and in the picker menu, where "fixed in group review" would be. Unlike a fixed mistake it is not sunk or skipped by the suggestion.
- `lib/report.ts`, `app/student/screens/ReportScreen.tsx`: `unsolvedInGroup(session, pathway, run)`; under the Incorrect column's tiles, "Q7 not solved in group review".

## Acceptance

- [x] During group review the demo group's row reads "Q7 left for now after 3 tries"; after, "Q7 not solved after 4 tries" beside 100% and done; no other row carries a line
- [x] Class review setup: Q7's examples from the demo group's mistakes carry "not solved in group review"; the problem rows are unchanged
- [x] The student's report puts Q7 under Incorrect with "Q7 not solved in group review" beneath
- [x] vitest 636, eslint, tsc, next build; click-through `teacher223.mjs` (8 checks: report note, class view unsolved and left, setup badge on Q7 not Q3, the picker menu)
