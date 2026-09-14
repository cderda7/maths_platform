# 263: SKIP TO on the teacher side: send assignment, students done with the stage, activity completed

**What to build:** A presenter SKIP TO on the teacher laptop, in the same dashed demo-control look as the student's (`components/SkipTo.tsx`), with three jumps: **send assignment**, **students done with current stage**, **activity completed**. Each jump moves every surface together: the teacher's screens, the board, Sam's iPad and his Classroom (ticket 264).

**Blocked by:** 264 (send assignment is what puts PS6 in Sam's To do).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14): "i'd like to add skip to functionality to the teacher side — like skip to 'send assignment', skip to 'students done with current stage', skip to 'activity completed'." Today the only presenter jumps are Sam's, on the iPad; a demo of the teacher side has to wait for the classmates' stream or drive Sam through every stage.

Agreed: "students done with current stage" moves Sam too, so every surface agrees.

## Solution

- `lib/demo.ts`: three teacher targets beside `SKIP_TARGETS`, each a pure fixture over the current classroom and session (like `skipFixture`), tested by replay:
  - **send assignment**: PS6 created with the demo pathway and sent now (`startedAt` now, the classmates' stream starting from zero); Sam's session at start with PS6 in his To do.
  - **students done with current stage**: the stage the class is on (by the current pathway) ends for every present student: classmates' records and Sam's session advance to the next stage with their fixture work; on the last stage this equals activity completed. Disabled before the assignment is sent.
  - **activity completed**: every stage over, reports and reflections in; the PS6 card moves to Past, Sam's PS6 to Completed.
- Teacher chrome: the bar pinned bottom-left outside the product's chrome, as on the student side; it must not cover any teacher control at 1280×800 (measure).
- After a jump the teacher stays on the screen they were on, which re-renders from the new state.

## Acceptance

- [x] Unit: each target from each starting stage (not sent, working, individual review, group review, class review, completed); absences (ticket 250) respected; idempotent on repeat
- [x] Click-through, teacher + board + Sam's iPad at 1280×800 and 1440×900: send assignment shows the live PS6 card and PS6 in Sam's To do; done with stage advances Class View, the board and the iPad together through every stage of the demo pathway; activity completed lands PS6 in Past and in Sam's Completed; the bar covers no teacher control
- [x] vitest, eslint, tsc, next build, check:laptop
