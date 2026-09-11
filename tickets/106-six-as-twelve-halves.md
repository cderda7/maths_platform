# 106: The fractions worked example writes the 6 as 12/2 before combining the numbers

**What to build:** The fractions warm-up's worked example gains a step between "x/4 + x/2 = 9/2 + 6" and "x/4 + x/2 = 21/2": the line "x/4 + x/2 = 9/2 + 12/2", labelled "Wrote the 6 over 2, to match the other fraction". The working is seven steps; the hints written for the lines after it move down one, and the common-denominator hint covers the new line too.

**Blocked by:** 90 (the worked example on the pad), 86 (hints placed by line).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with the worked example open at its third step: "add the step in this worked example of 6 becoming 12/2". The example went from "9/2 + 6" straight to "21/2", which hides the one move a student unsure of fractions most needs to see: the whole number written over the same denominator before the two are added.

## Solution

- `data/practice.ts`: the new step at index 1 of the fractions working. The hints after the first are placed by line (`at`), so each moves down one: the common-denominator hint is written for lines 1, 2 and 3 (the 6 moved, the 6 as 12/2, the numbers combined; its linked fragments x/4 and x/2 are on all three), the "same denominator" hint for line 4, the "clear the 4" hint for line 5, the "undo the 3" hint for line 6.
- `lib/hint.test.ts`, `lib/session.test.ts`: every index into the fractions steps moved with it; a test pins the first three lines of the working and the hints' `at` list.

## Acceptance

- [x] The worked example reveals seven steps in order, the second reading x/4 + x/2 = 9/2 + 12/2, all four fractions on one baseline; the reveal button goes after the seventh
- [x] A student whose pad has read the 12/2 line is offered the common-denominator hint, and it stalls until the x terms are over 4; the hints for the later lines come at the same points in the working as before
- [x] vitest (340), eslint, tsc, `next build`, headless click-through of the example (`example106.mjs`), the lit box sweep (`npm run sweep:hint-boxes`) on the build; architecture note, root docs, decision log, future features
