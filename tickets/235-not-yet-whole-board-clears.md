# 235: Not yet shows the whole attempt, and a wrong check wipes the board

**What to build:** On the group review whiteboard, a wrong check's Not yet card shows every line of the attempt, its first mistake red, with no "N more lines" count; and the check wipes the board, so the next attempt starts on a clean board with Read as empty.

**Blocked by:** 221, 222.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), with a screenshot of Sam's Q7 after a wrong check (NOT YET · up to the first mistake · one red line · "2 more lines", and four strokes still on the board beside an empty Read as): "don't collapse the 'not yet' thing. keep it fully visible. also, auto erase the board after an incorrect submission."

Reproduced on the unmodified build with the click-through below: after each of Q7's three wrong checks the card held one or two lines plus a "more lines" count, and the board kept every stroke (3, then 6, then 9) while Read as started again empty.

## Solution

- `lib/groupReview.ts`: `cutAtFirstMistake` (shown + hidden count) becomes `markFirstMistake`, every line of the attempt with only the first wrong one marked.
- `lib/classroom.ts`: a wrong check empties `strokes` as well as `lines`, on a first visit and on the return. The attempt's lines are already kept in `attempts`, which is what the card draws, so nothing is lost. Peers' scripts still send a `clear` between attempts; it is now a no-op.
- `app/student/screens/GroupBoardScreen.tsx`: the card draws every line; the caption reads "first mistake in red" (it said "up to the first mistake", no longer true); the "more lines" row is gone.

## Acceptance

- [x] Unit: `markFirstMistake` returns every line with one red (Q3 slip, Q7 two terms), a clean attempt unmarked; a wrong check leaves `strokes` and `lines` empty and the attempt stored whole (`lib/groupReview.test.ts`)
- [x] Click-through `notyet235.mjs` (55 checks) on Q7 with Sam's pen, at 1440×900 and 1280×800, after each of the three wrong checks (plain, with the hint, leaving): every line of the attempt in the card, exactly one red, no "more lines", caption changed, card unclipped and on screen, no strokes stored and the canvas back to its blank ruled lines, Read as empty, column blocks do not overlap and the hint ends above the board's foot, no horizontal scroll. The same script against the unmodified build fails 18 checks (the reproduction).
- [x] `flow228.mjs` (a whole group review with peers' turns) still passes
- [x] vitest 682, eslint, tsc, next build
