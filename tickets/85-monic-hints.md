# 85: The factorising warm-up has a hint for every point in the working, past the brackets to the null factor law

**What to build:** The factorising warm-up (x² + 7x + 12 = 0) carried one hint, about finding the pair of numbers. A student who has the brackets and stalls there got "Shown" and nothing more. Give it a hint per point in the working, picked by where the lines have got as ticket 80 does for fractions: the opening hint (blank pad); check the pair adds to 7, with the pairs to try (after the product); the two numbers go one in each bracket (after the sum); a product is only zero when a factor is, so set each bracket to zero (after the brackets, pointing at the student's bracket line); and, spelt out, x + 3 = 0 and x + 4 = 0, mind the signs (after the expand-back check, or as the next hint for a student still stuck at the brackets). The follow-up (x² − 7x + 10 = 0) gets the same four points with its own signs.

**Blocked by:** 80 (hints by position), 82 (hints anchored to the student's line).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the help menu on the factorising warm-up reading "another hint · Shown": "i want further hints for this one. like even once the student has figured out (x+4)(x+3), they might get stuck there".

## Solution

- `data/practice.ts`: five hints on `w-monic` with `at` [0], [1], [2], [3], [4]; four on `w-monic-2` with `at` [0], [1], [2], [3]. The hints for the pair, the sum and the brackets link their words to the student's own line (the 3 and 4 in "3 × 4 = 12"; the two brackets in "(x + 3)(x + 4) = 0"). The spelt-out hint carries no linked words: it is written for after the check line, and offered ahead of its point to a student who never writes one, where its fragments would have nothing to point at.
- Each hint reads on its own ahead of its point ("Once you have a pair that multiplies to 12, …"), because `pickHint` falls forward to the next hint when the one for here is spent.
- The null-factor-law hint links "0" once and says "zero" elsewhere: every whole-word occurrence of a linked phrase is boxed, and four boxed 0s in one sentence was noise (seen in the browser).
- Tests: the monic fixture's `at` list and bracket terms; a walk through the warm-up (blank, one line placed or not, two, three with one then two shown, four, solved) and the follow-up; the session tests that assumed one hint now expect the fall-forward on a blank pad and the pair-check hint after one line; the "general hint" test moved to the null factor law problem, which still has one.

## Acceptance

- [x] Three lines read (3 × 4 = 12, 3 + 4 = 7, (x + 3)(x + 4) = 0), "hint": the card reads "Hint 2 · your line 3" with the null factor law hint; hovering "brackets" lights (x + 3) and (x + 4) in read-as line 3 and tints the line
- [x] "another hint" there: the spelt-out x + 3 = 0 and x + 4 = 0 hint; then the row reads "None for this step"
- [x] Blank pad: the opening hint as before; one line read: the pair-check hint as "your line 1"
- [x] Solved (five lines): "None for this step"
- [x] vitest, eslint, tsc, `next build`, headless browser check; architecture note, root docs, decision log, future features
