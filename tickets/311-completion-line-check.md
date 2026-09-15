# 311: A line written into a blank step is checked against that step

**What to build:** a pure check that says whether a line the student writes into a blank step of a completion problem is right: the step's maths, not its exact characters. Plus the demo script's way to write a wrong line into a blank so the marking can be shown.

**Blocked by:** none (can start immediately).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

In the new help and warm-up steps (tickets 312, 313), the second step leaves one or more lines of a near-identical problem blank for the student to write. The user (2026-09-15): a wrong line is marked, and the student opens chat if they want it; the tutor does not speak up on its own. Today the practice pad only works out which step a line is at (`positionOf` in `lib/hint.ts`); nothing in practice judges a line right or wrong. The set's problems are judged through fixed evaluation tables (`lib/evaluate`), keyed by recognition strings.

A blank step has one known expected line, so the check is narrower than general marking: is the written line the same statement as the expected one?

## Acceptance

- [x] A pure function (for example `checkStep` in a new `lib/stepCheck.ts`) takes a blank step (expected TeX, skill tags) and a recognised line and returns right, wrong (with the misconception id from `data/misconceptions.ts` when the slip is a known one), or unreadable
- [x] Equivalent forms count as right: reordered factors `(x+2)(3x-1)`, reordered sides or terms, `x = 1/3 or x = -2` in either order, spacing and `\cdot` versus juxtaposition; a different statement is wrong even when it is algebraically "close" (a sign flipped, a factor missing)
- [x] Wrong lines that match a known slip carry that slip's misconception id (at least: signs swapped in the pair, product right sum wrong, sign lost solving for x, minus not carried through, divided by a not 2a)
- [x] The demo pad's script (`warmupScript` and the overlay's equivalent) can hold a wrong line before the right one for a blank, so a click-through can show a wrong line marked and then corrected; the script format is documented where it is defined
- [x] Tests cover every Q** blank and every warm-up completion blank from ticket 310 once it lands (right line right, each authored slip wrong, junk unreadable). Until 310 lands, test on Problem Set 6's own solution steps (310 had not landed: tested on Problem Set 6, the practice bank and every set's evaluation table; the 310 blank tests are left for ticket 312)
- [x] vitest, eslint, tsc, next build
- [x] Ticket docs: `architecture/311.md`, the ARCHITECTURE row, a DECISION_LOG entry (how equivalence is decided and why)

## Notes

- Read `lib/mathInput.ts`, `lib/extract.ts` and `lib/evaluate.ts` first; reuse their normalisation rather than writing a second parser.
- No screen changes here. Ticket 312 draws the marking.

## Solution

- `lib/stepCheck.ts` (new): `checkStep({ tex, tags }, line)` returns `{ result: "right" }`, `{ result: "wrong", misconception? }` or `{ result: "unreadable" }`. Both lines are read into a canonical form (parts joined by `\Rightarrow`; statements joined by "or", "and", a comma or a colon, unordered; chains of items and relations, sides turnable; words and expressions; unordered sums of signed terms; unordered factors). The line is right when the two keys are equal. The form forgets spacing, `\cdot`/`\times`/side by side, the order of factors, terms, sides and cases, grouping brackets, `a - b` as `a + (-b)`, a lone minus carried into its bracket, the fraction command, a minus on a fraction's top or bottom, `x = 2, 3`, and the case and punctuation of words. It never multiplies out, collects or works out. A wrong line runs through `SLIPS` in order: check wrong, minus not carried through, signs swapped in the pair (brackets, or a stated pair), product right sum wrong and sum right product wrong, sign lost solving for x / root or vertex sign / roots' signs from a graph (by the step's tags), divided by a not 2a, −b's minus dropped, part of the bottom dropped, factor missing, brackets don't expand back. Typed shorthand goes through `toTex` (`lib/mathInput.ts`).
- `lib/texEval.ts`: one grammar for tests and the check. `tokenizeTex` (now also relations, separators, `\text{…}`, bare or/and, `\Rightarrow`, Greek letters, silent spacing and `\checkmark`) and `expressionAt` → `TexNode`. `evalTex` evaluates the tree, and its results and throws are unchanged.
- `lib/warmup.ts`: `ScriptSlips` and `padScript(steps, slips)`. `warmupScript(p, slips = {})` writes a step's wrong lines just before its own line, and exactly the steps when there are none. The warm-up and the practice overlay both read it through `PracticePad`, which is unchanged.
- No screen changes.

## Verification

- `lib/stepCheck.test.ts`, 706 cases: every Problem Set 6 step (37) and every practice problem and follow-up step reads and is right against itself, unspaced and double-spaced. The same step with its first sign flipped or its first digit changed is wrong. The ticket's equivalent forms are right. Eleven unreadable lines are unreadable against every step. Thirty named slips carry their ids (all five the ticket lists, on Problem Set 6 and practice steps). Every line of every set's evaluation table (PS1–PS6) read against its step agrees on right or wrong, and on the misconception where the check names one; four older "brackets don't expand back" entries are listed where the check names the narrower id. The demo script writes a wrong line and then the right one, burst by burst through `nextLine`, and `checkStep` marks them wrong, then right.
- vitest 1875 (97 files, after rebasing onto ticket 314), eslint, tsc, next build.

## Judgement calls

- On a Q** or warm-up blank (ticket 312/313 screens), a student who writes the step's maths in another form sees it marked wrong. Examples: `(2 - x)` for `-(x - 2)` inside a product, `\tfrac{6}{2}` for `3`, `0.5` for `\tfrac{1}{2}`, or a sentence in other words for a conclusion. The conservative reading of "the step's maths, not its exact characters": reordering and notation are forgiven, rewriting is not. In FUTURE_FEATURES.
- On the teacher's Mistakes and signatures screens nothing changes: the four older table lines the check would label differently keep their table labels. In FUTURE_FEATURES for Carson.

