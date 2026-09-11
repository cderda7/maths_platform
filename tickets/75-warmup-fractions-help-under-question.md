# 75: Practice pad: "I need help" right under the question; a harder fractions warm-up

**What to build:** On the practice pad (the warm-up and the mid-set "one move" alike) "I need help" sits directly below the problem instead of at the foot of the left column. The fractions warm-up problem becomes $\frac{x}{4} + \frac{x}{2} - 6 = \frac{9}{2}$ (answer $x = 14$): four scripted lines, a hint about clearing every term's denominator, and hint terms that light the terms and the denominators in the problem.

**Blocked by:** 69 (the shared pad), 29 (the warm-up sequence).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11): "move i need help up to be right below the question. also, i don't like the fraction warm up question -- too easy. change it to x/4 + x/2 - 6 = 9/2". The button was pinned to the bottom of a mostly empty column, a screen's height from the problem it helps with, and $\frac{x^2}{3} = 12$ was one multiplication and a square root.

## Solution

- `components/PracticePad.tsx`: the button's wrapper loses `mt-auto pt-6` and takes `mt-5`, so it follows the problem (and the hint card, once one is showing) with the same gap the hint uses.
- `data/practice.ts`: the `algebra.number.fractions` practice is rewritten. Stem "Solve." (the answer is an integer, so "leaving the answer exact" would be noise). Steps: multiply every term by 4 → collect the $x$ terms → add 24 → divide by 3. The hint, "Multiply every term by a number that clears all the denominators.", links "every term" to the four terms and "denominators" to the 4 and the first 2.
- `lib/hint.test.ts`: a test pins the new TeX and the lit markup for both terms.

## Acceptance

- [x] "I need help" sits under the problem on the warm-up and on the practice overlay; the hint card, when open, sits between them
- [x] The fractions warm-up shows the new problem; its hint lights every term, and the 4 and 2 inside the $x$ fractions
- [x] vitest, eslint, tsc, `next build`, headless browser check; architecture note and root docs
