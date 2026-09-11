# 81: Q5's turning point is two lines, the height then the point

**What to build:** In the set, Q5's last row `y = 4 − 8 − 5 = −9, (2, −9)` becomes two rows: `y = 4 − 8 − 5 = −9` ("Height on the axis"), then `(2, −9)` ("Turning point"). The model solution, the scripted run's read-back and the evaluation table all follow, so every screen that shows Q5 (the pad, the individual review, the history, the teacher's mirror) lists five lines.

**Blocked by:** 79 (the one-step-per-row rule, applied to the warm-up bank).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), on the ticket 79 note that the set still packed two facts on Q5's last row: "y = 4 − 8 − 5 = −9, (2, −9)) yeah break this into two lines -- y = 4 − 8 − 5 = −9 then (2, -9)".

## Solution

- `data/assignment.ts`: Q5's solution ends in two steps, the height (graph features) and the point (graph features, sketching).
- `data/recognition.ts`: `RECOGNITION.q5` reads the same two lines, so the scripted run has five bursts on Q5.
- `data/evaluation.ts`: two keys replace the one, both correct steps.
- `lib/evaluate.test.ts`: pins the two closing lines, their labels, their verdicts, and that no Q5 line carries a `\quad`.

Q2's and Q7's pair-check rows (`ac = −8, 8 + (−1) = 7`; `2 × 4 = 8, 2 + 4 = 6`) are unchanged: the user asked for Q5 only, and those strings run through the classmates' scripts, Sam's Q7 rework and the group review.

## Acceptance

- [x] The individual review lists Q5 as five lines: factorised, the roots side by side, the axis, the height, the point
- [x] Nothing in the scripted run reads "unclear" (existing test) and the two new lines are correct steps (new test)
- [x] vitest (319), eslint, tsc, `next build`, browser check; architecture note and root docs
