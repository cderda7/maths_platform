# 325: A line in a blank step with its numbers written another way is right

**What to build:** ticket 311's line check (`checkStep` in `lib/stepCheck.ts`) accepts a line that states the same thing as the step with numbers equal in value: a decimal for a fraction, an unsimplified fraction for a number, a bracket in a product turned round with its minus outside. A line that is equal but is another step stays wrong.

**Blocked by:** none (311 and 310 are on main).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Ticket 311 decides a blank step by form: the order of factors, terms, sides and cases is forgiven and notation is forgiven, but nothing is evaluated. So right maths in another form is marked wrong: `0.5` for `\tfrac{1}{2}`, `6/2` for `3`, `(2 - x)` for `-(x - 2)` inside a product. The user was asked (2026-09-15): "right maths in another form is marked wrong today; accept equal values (but not a skipped or undone step), a gentle third result, or keep it strict?" and chose **accept equal values**.

The rule: the same shape of statement (same factors, same cases, same terms up to order), with each number compared by value.

## Acceptance

- [x] A line is right when it states the same thing as the step with numbers equal in value: `0.5` = `½` = `1/2` = `\tfrac{1}{2}` = `\dfrac{2}{4}`, `6/2` for `3`, `-(x - 2)` = `(2 - x)` inside a product, a constant as a decimal or an unsimplified fraction
- [x] A line that is equal but another step stays wrong: the unfactorised quadratic where the factorised form is asked, the expanded form where brackets are asked, `x^2 - 5x + 6 = 0` for `(x - 2)(x - 3) = 0`, a root left as an unsolved factor (`x - 2 = 0` for `x = 2`), a sum left unworked or worked out (`25 + 12` against `37`)
- [x] A number that only rounds to the value (`0.33` for `⅓`) is wrong
- [x] Sentence blanks ("The graph never meets the x-axis") stay exact-wording in this ticket; judging a sentence by meaning is already in FUTURE_FEATURES ("Judging a sentence", "Sentence blanks judged by meaning")
- [x] `checkStep`'s signature and result shape are unchanged (ticket 312 calls it)
- [x] Every existing test in `lib/stepCheck.test.ts`, `lib/pairs.test.ts` and the evaluation-table agreement test still passes; only tests that asserted the old strictness on equal values are updated, each listed below
- [x] New tests over every blank of `data/pairs.ts` (every Q** for every skill the help picker offers, and every completion problem, through `blankSteps`): the blank's line with its fractions as decimals where exact, and with its numbers as unsimplified fractions, is right; the step before or after it written in the blank is not right
- [x] vitest, eslint, tsc, next build
- [x] Ticket docs: `architecture/325-blank-equal-values-right.md`, the ARCHITECTURE row, a DECISION_LOG entry, FUTURE_FEATURES

## Notes

- No screen changes. Ticket 312 draws the marking and needs nothing from this ticket.
- Tests changed because they asserted the old strictness on equal values:
  - `lib/stepCheck.test.ts`, "equivalent forms count as right": the test "reads a double minus on a fraction as the fraction, never worked out" asserted `x = -0.5` is wrong for `x = -\tfrac{1}{2}`. It now asserts right, adds `x = 0.5` (the sign lost) as wrong, and is renamed "reads a minus on a fraction's top or bottom as a minus in front, and a fraction of two numbers by its value (ticket 325)".
  - No other existing test changed. `x = 3 = 3` for `x = \dfrac{6}{2} = 3` still reads wrong (see Solution: a fraction the step writes not in lowest terms is kept).

## Solution

- `lib/stepCheck.ts`:
  - `numberFactor` reads a written number as an exact fraction in whole numbers (BigInt, trailing zeros dropped), so `0.50` is ½ and a long decimal is never rounded onto a value. A number too long to hold exactly is kept as its own digits, equal only to itself.
  - `quotient`: a fraction of one lone number over another is that number (`\tfrac{6}{2}` is 3, `\dfrac{2}{4}` is ½, a minus on the top or bottom moved in front first). Anything else on top or bottom stays a fraction as written (`\tfrac{5 + (-1)}{2}` is not 2, `\tfrac{2 \times 3}{4}` is not `\tfrac{3}{2}`).
  - **The one number kept as written:** a fraction of two numbers the step itself writes not in lowest terms (`\dfrac{6}{2}` in `\dfrac{3}{2} + \dfrac{6}{2}`, the fractions warm-up's "Wrote the 3 over 2" step; a whole number over 1). Rewriting a number that way is the step, so `3` written there is the undone step. `checkStep` reads the step first with a `Reading` that notes these fractions (`held`), then the written line against it: the same fraction (any fraction command, a minus on top and bottom) matches it, and `3` or `\dfrac{12}{4}` does not. A fraction in lowest terms that the step writes is its value, however the line writes it.
  - `termKey`: a bracket in a product is read either way round, the term's sign turned once for each bracket turned (whichever way has the smaller key), so `-(x - 2)(x + 3)` = `(2 - x)(x + 3)` and `(x - 2)(x - 3)` = `(2 - x)(3 - x)`.
  - The slips are unchanged and still name their misconceptions when the wrong line writes its numbers another way (`x = -0.5 or x = -4` is still "sign lost solving for x").
  - Nothing else changes: products of numbers stay separate factors (`2 \times 4` is not `8`, `6x` is not `2 \cdot 3x`), sums are never collected, equations are never rearranged or multiplied through (`(2 - x)(x + 3) = 0` is not `(x - 2)(x + 3) = 0`), sentences are their words.
- `lib/stepCheck.test.ts`: a new block "equal values count as right, a different step does not (ticket 325)": the spec's equal forms, rounding, equal-but-another-step lines, the kept fraction, sentences, slips written with other numbers, and every blank of `data/pairs.ts` (70: each Q** blank once per skill that leaves it blank, and each completion blank) with `asDecimals` (fractions in lowest terms with an exact decimal) and `asUnsimplified` (fractions in lowest terms doubled, every other number n outside an exponent, subscript or `\text{…}` as `\tfrac{2n}{2}`), plus both together, right; the neighbouring steps not right.

## Verification

- vitest 2034 (100 files; `lib/stepCheck.test.ts` 789, up 83), eslint, tsc, next build, after rebasing onto `ee11ef1` ("border added to HW cards").
- Along the way: `ee11ef1` hand-tuned the Classroom borders in `app/globals.css` (set cards 2px, homework cells 1.5px in `#5b4ae8`), which failed two of ticket 321's tests in `lib/designTokens.test.ts` that pinned the old 1px `line` look. They now check that each border kind declares a px width up to the tuner's 4, a style the tuner offers and a hex colour, and that tuning the set cards leaves the homework cells' width and colour at whatever `globals.css` holds. The tuned values are untouched.

## Judgement calls

- On a Q** or warm-up blank (tickets 312, 313), a student who writes `3` in the fractions warm-up's "Wrote the 3 over 2" line (`\dfrac{3}{2} + \dfrac{6}{2}`) sees it marked wrong, and so does `\dfrac{12}{4}` there, while `\dfrac{-6}{-2}` is right. The step exists to write the number over 2, so writing it unrewritten is the undone step the user excluded. The rule is general (any fraction the step writes not in lowest terms), not a list.
- On a blank, `\tfrac{x}{2}` for `\tfrac{1}{2}x`, and an equation with both sides multiplied by −1 (`(2 - x)(x + 3) = 0` for `(x - 2)(x + 3) = 0`), are still marked wrong: they change the shape of the statement, not only a number. In FUTURE_FEATURES.
- The previous or next step written in a blank is never right on any blank today (tested); the fractions warm-up's line 1 is the one place it would have been without the kept fraction.
