# 80: Hints that read the student's work: each hint names the point in the working it fits, and "hint" picks by where the lines have got

**What to build:** A hint can say where it fits (`at`: how many lines of the reference working the student has written; `[0]` a blank pad). "I need help → hint" reads the pad's lines, finds the student's position from the last line the pad placed, and gives the unshown hint written for that point. If that one has been shown, a general hint; failing that, the first hint for a later point. Never one for a point already passed. When nothing fits the row is greyed "None for this step". The fractions warm-up carries five hints, one per point: move the 6 (blank pad), a denominator the two x terms share (after line 1 or 2), combine into one fraction (after line 3), clear the 4 on both sides (after line 4), undo the 3 (after line 5). Earlier hints collapse to one line under the latest, tap to reopen.

**Blocked by:** 78 (several hints per problem), 03 (the pad's line-by-line recognition).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11): "i also wonder how we can make hints responsive to the student, at least for this mockup. like not prescriptive hints (for instance, i hate that about Leibniz) -- but reading student work, & a hint that will help them from there. thoughts?" and, on the rule-based plan, "yep love your thinking. let's do that." Ticket 78's hints came in a fixed order however far the student had got: a student with three lines written who asked for the first time was told to move the 6.

## Solution

- `data/types.ts`: `Hint.at?: number[]`.
- `lib/hint.ts`: `positionOf(problem, lines)` (the step the last line matches, plus one; spacing ignored; unplaced lines count by position) and `pickHint(problem, lines, shown)` with the order above.
- `lib/session.ts`: `hinted` is the indices shown per problem, in the order shown; `run/hint` calls `pickHint` on the run's lines; `hydrateHinted` accepts the two earlier shapes (id list, count) as well.
- `components/PracticePad.tsx`: the cards are the shown hints in the order given, labelled by that order; every card but the latest is collapsed to one line and reopens on tap; the menu row is enabled only while `pickHint` has something, else "None for this step" / "All shown".
- `components/HintCard.tsx`: the collapsed form.
- `lib/helpChat.ts`: the brief tags each hint with where it fits.
- `data/practice.ts`: the fractions hints, five with `at`.
- Tests: `positionOf`, `pickHint` (here / general / ahead / never back / spent), the session's picks with lines revealed and with a start four lines in, hydration of all three shapes.

## Acceptance

- [x] Blank pad, "hint": move the 6. One line read, "another hint": the common-denominator hint. Four lines read with nothing asked, "hint": the clear-the-4 hint, skipping the two before it; then the undo-the-3 hint; then the row reads "None for this step"
- [x] Earlier hints show as one muted line each under the latest, open on tap; the latest is always in full
- [x] Every other problem (one general hint) behaves as before
- [x] vitest, eslint, tsc, `next build`, headless browser check with pen strokes; architecture note, root docs, decision log, future features
