# 221: A second wrong check puts a hint on the group board

**What to build:** On the group whiteboard, once a problem has checked wrong twice, a hint card sits in the Read-as column under "Not yet", for every member: the evaluation table's clue for the first wrong line of the group's latest attempt (a sentence that names the move, never the answer). It follows each later wrong attempt's first mistake. In the demo Liam's Q7 turn goes wrong twice (the fraction cleared from two terms, then multiplied through by 3 and never taken back out), the hint appears, and his third attempt is the model solution.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), agreeing to a ladder for a problem a group cannot get: after one wrong check the group sees its attempt up to the first mistake and tries again; after two, "a hint for the step they got wrong appears on the board for everyone … pointing at the first wrong line without giving the answer" ("I LOVE IT. your proposal is fantastic"). Today a group gets nothing but "Not yet" however many times it checks wrong.

## Solution

- `lib/groupReview.ts`: `HINT_AFTER_WRONG` (2), `wrongChecks(run, problem)`, `boardHint(run)`: the clue of the first wrong line of the latest attempt once the current, unresolved problem has that many wrong checks.
- `app/student/screens/GroupBoardScreen.tsx`: the practice pad's `HintCard` ("Hint") under the "Not yet" block in the column.
- `data/group-scripts.ts`: Q7's attempts become the two-terms slip, the lost-third slip, then the model solution (the slips exported from `data/classmates.ts`).

## Acceptance

- [x] Q3 and Q9 (one wrong check): no hint (unit test)
- [x] Q7, Liam's pen: no hint after the first wrong check; after the second the hint card reads the lost-third clue under "Not yet" (whose red line is `x^2 + 6x + 8`); the third attempt checks correct and the debrief opens
- [x] Nothing in the column overlaps or runs past the board's bottom at 1280 and 1440
- [x] vitest 613, eslint, tsc, next build; click-through `hint221.mjs` (10 checks)
