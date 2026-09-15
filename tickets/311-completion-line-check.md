# 311: A line written into a blank step is checked against that step

**What to build:** a pure check that says whether a line the student writes into a blank step of a completion problem is right: the step's maths, not its exact characters. Plus the demo script's way to write a wrong line into a blank so the marking can be shown.

**Blocked by:** none (can start immediately).

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

In the new help and warm-up steps (tickets 312, 313), the second step leaves one or more lines of a near-identical problem blank for the student to write. The user (2026-09-15): a wrong line is marked, and the student opens chat if they want it; the tutor does not speak up on its own. Today the practice pad only works out which step a line is at (`positionOf` in `lib/hint.ts`); nothing in practice judges a line right or wrong. The set's problems are judged through fixed evaluation tables (`lib/evaluate`), keyed by recognition strings.

A blank step has one known expected line, so the check is narrower than general marking: is the written line the same statement as the expected one?

## Acceptance

- [ ] A pure function (for example `checkStep` in a new `lib/stepCheck.ts`) takes a blank step (expected TeX, skill tags) and a recognised line and returns right, wrong (with the misconception id from `data/misconceptions.ts` when the slip is a known one), or unreadable
- [ ] Equivalent forms count as right: reordered factors `(x+2)(3x-1)`, reordered sides or terms, `x = 1/3 or x = -2` in either order, spacing and `\cdot` versus juxtaposition; a different statement is wrong even when it is algebraically "close" (a sign flipped, a factor missing)
- [ ] Wrong lines that match a known slip carry that slip's misconception id (at least: signs swapped in the pair, product right sum wrong, sign lost solving for x, minus not carried through, divided by a not 2a)
- [ ] The demo pad's script (`warmupScript` and the overlay's equivalent) can hold a wrong line before the right one for a blank, so a click-through can show a wrong line marked and then corrected; the script format is documented where it is defined
- [ ] Tests cover every Q** blank and every warm-up completion blank from ticket 310 once it lands (right line right, each authored slip wrong, junk unreadable). Until 310 lands, test on Problem Set 6's own solution steps
- [ ] vitest, eslint, tsc, next build
- [ ] Ticket docs: `architecture/311.md`, the ARCHITECTURE row, a DECISION_LOG entry (how equivalence is decided and why)

## Notes

- Read `lib/mathInput.ts`, `lib/extract.ts` and `lib/evaluate.ts` first; reuse their normalisation rather than writing a second parser.
- No screen changes here. Ticket 312 draws the marking.
