# 206: The fractions warm-up has a hint for writing the 6 over 2 and for adding 9/2 + 12/2

**What to build:** Split the fractions warm-up's common-denominator hint, which covered lines 1 to 3, into one hint per point: after line 1 (… = 9/2 + 6) write the 6 over 2; after line 2 (… = 9/2 + 12/2) add the two numbers; after line 3 (… = 21/2) the x terms' common denominator, as before.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), with a screenshot of the fractions warm-up at line 2 (x/4 + x/2 = 9/2 + 12/2) showing Hint 2, "To combine the x terms they need a common denominator…": "hints got fucked up for fractions bc i asked for the addition of the 9/2 + 12/2 step. add an intermediate hint for that step".

Ticket 106 added the "9/2 + 12/2" line to the working and widened the x-terms hint to `at: [1, 2, 3]` instead of writing hints for the new points. So at lines 1 and 2 the hint on screen was about the x terms, while the student's next move was writing the 6 over 2 or adding the numbers. The hint also stayed stalled across all three lines.

## Solution

`data/practice.ts`, fractions warm-up, seven hints at `[0]` to `[6]`:

- `[1]` "Before adding the numbers, write the 6 as a fraction over 2, so it matches the other fraction." Links: **6** and **other fraction** (9/2) on the student's line 1.
- `[2]` "The two numbers on the right have the same denominator now, so add them: the numerators add and the denominator stays." Links on line 2: **two numbers** (9/2, 12/2), **same denominator** (the 2 under each, not the 2 inside 12), **numerators** (9, 12).
- `[3]` the x-terms common-denominator hint, unchanged text, now only for line 3.

Tests: `lib/hint.test.ts` holds the seven points, the new hints' exact boxes on lines 1 and 2, and `pickHint` at each line. The multi-point stall case is now a synthetic hint on the fractions steps, because no warm-up has one any more. `lib/session.test.ts` has the new hint indices.

## Acceptance

- [x] Line by line in the browser: blank pad "move the 6", line 1 "write the 6 as a fraction over 2" (your line 1), line 2 "add them" (your line 2), line 3 the x terms (your line 3), then lines 4 to 6 as before, each followed by the stall notice, and "hint" greyed after line 7
- [x] Each linked word of the new hints lights its pieces on the student's line and nowhere else
- [x] vitest 603, eslint, tsc, next build, `sweep:hint-boxes` 132; click-through `frac206.mjs` (49 checks)
