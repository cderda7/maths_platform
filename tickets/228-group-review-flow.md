# 228: Group review's debrief moves on by itself, never goes back, and Sam writes Q7

**What to build:** Three changes to group review. (1) The debrief needs no press: when Next's ten-second hold is over it goes by itself. (2) A problem the group is past never comes back: only Q7, left for now and returned to, is visited twice. (3) In the demo Sam writes Q1 and both visits to Q7, so the presenter paces the ladder; Liam takes Q9. The pen shuffle stays the rule; the demo's fixed pens are an exception for the simulation only.

**Blocked by:** 222.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "change group review where after next button loads, it automatically goes without student needing to click. also sth's super weird with group review. at times, a question already done is jumped back to. for Q7 good, for all others no. … 2 students making a mistake on Q2 should just have going through Q2 once. only Q7 should be returned to … also have Sam be the one writing for Q7 so that i can control the pace & see how that one works -- it's too fast where i can't read it. so have Sam write the first mistake Q & Q7. this might violate the shuffling law -- keep that as a rule, note this as an exception just for the simulation. in practice, want equitable & random shuffling through students."

**Reproduced** (unmodified main, `repro228.mjs`, a student who presses Next 20 s after it unlocks): Q1's debrief, then at 35.8 s Q2's debrief opened over it (Q2 closed while Sam was still in Q1's), and after Next on Q2 the student was sent back to Q1's debrief at 68.7 s, and again after Q3 at 108.5 s, missing Liam's Q7 visit entirely. The union was not the cause: `computePhases` already lists each problem once however many members got it wrong. The cause was `pendingDebrief`, which returned the latest closed problem not yet moved on from, so every unfinished earlier debrief waited behind the newer one.

## Solution

- `lib/debrief.ts`: `pendingDebrief` is only the latest closed problem, until the student moves on from it; `debriefEndsAt` (the problem's close, plus 2 s unmarked, plus the 10 s hold).
- `app/student/StudentApp.tsx`: the clock loop ends the debrief at `debriefEndsAt` (`debrief/done`, and `group/next` if the group is still on the problem), so no press is needed and a reload keeps the moment; the run ends only once the last debrief has.
- `lib/groupReview.ts`, `lib/classroom.ts`: `beginRun(…, pens)` and `group/begin`'s `pens`: fixed pens by problem, for a problem's first visit and its return (`GroupRun.pens`, read by `visitsOf`), only for problems on the board and members of the group. Documented as simulation only; a real run never sets it and deals by the shuffle.
- `data/group-scripts.ts`: `DEMO_PENS` (Sam Q1 and Q7, Zara Q2 and Q10, Jordan Q3, Liam Q9), passed by the student app, the group-review jump and the report jump.

## Acceptance

- [x] A whole group review with Next never pressed: debriefs Q1, Q2, Q3, Q9, Q10, Q7 once each and in that order, each ending by itself about 12 s after it opens; group review ends on its own after Q7's (`flow228.mjs`, 5 checks)
- [x] Sam holds the pen on Q1, Q7 and Q7's return; Zara Q2 and Q10, Jordan Q3, Liam Q9; Sam's three Q7 tries show the hint and leave Q7 for now; his return closes it unsolved
- [x] Unit tests: only the latest closed problem debriefs, the debrief's end, the pinned pens (first visit, return, ignored when off the board or outside the group, absent on a real run)
- [x] vitest 651, eslint, tsc, next build
