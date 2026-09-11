# 79: Every warm-up line is one step, and two cases branch side by side

**What to build:** Every problem in the warm-up bank reads back one step per row, the way the set's problems do: no scripted line chains a factorisation and its roots behind a "⇒", no line carries a point after a comma, no line holds two facts side by side. Wherever a step has two cases ("x = 4 or x = −2") the read-back shows the two boxes side by side, and the worked example card shows the same two boxes on that step.

**Blocked by:** 75 (the fractions warm-up on the pad), 29 (the branching read-back).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the graph-features warm-up whose first read-back row was `(x − 4)(x + 2) = 0 ⇒ x = 4 or x = −2`: "ensure that all warm up problems, as well, have each step as a new row (here you mush it all together) & that when multiple solutions exist, it's done in the branching pattern -- side by side".

The read-back's rule keeps an "or" that follows a "⇒" whole (the implication is one statement), so that line neither split into rows nor branched. Three other problems had the same shape: the sketch problem's y-intercept and turning point rows carried a point after a comma (`y = (−1)(−3) = 3, (0, 3)`; `x = 2, y = (1)(−1) = −1, (2, −1)`), the graph-features turning point did too, and the monic, follow-up and non-monic problems wrote the pair check as two facts on one row (`3 × 4 = 12, 3 + 4 = 7`).

## Solution

- `data/practice.ts`: the graph-features problem is six rows (set y to 0, factorise, the two roots as an "or" line, the axis, the height, the point); the sketch problem seven (the two roots, the height at 0, the y-intercept, the axis, the height on it, the point, the sketch); the pair checks are one fact per row ("Multiply to the constant", "Add to the middle coefficient"; "Multiplied a by c", "Multiply to ac", "Add to b").
- `components/PracticeCard.tsx`: a step whose line has two cases renders them as two small boxes side by side, so the worked example matches the read-back.
- `lib/warmup.test.ts`: a guard over the whole bank and every follow-up: any "or" line splits into exactly two branches, no line chains equalities behind a "⇒", no line contains `\quad`; the graph-features script is pinned.
- `lib/session.test.ts`: the three tests that step through the default warm-up's example count its steps from the data instead of assuming four.

## Acceptance

- [x] Graph-features warm-up: six bursts give six rows; the third is `x = 4` and `x = −2` side by side
- [x] Sketch warm-up: seven rows; the first is `x = 1` and `x = 3` side by side
- [x] The worked example for graph features lists the same six steps with labels, the roots as two boxes
- [x] No warm-up problem or follow-up has a `\quad`, a "⇒ … = … = …" chain, or an "or" that fails to branch (test)
- [x] vitest (318), eslint, tsc, `next build`, browser check; architecture note and root docs
