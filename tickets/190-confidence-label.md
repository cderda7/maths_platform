# 190: Every confidence label legible in Class View's Confidence column

**What to build:** On Class View (`/teacher/a/<id>/class`), a student's confidence answer reads at the column's own size, the 13 px of "confident" and "low", wrapping between words onto at most three lines inside the 84 px column, without widening the column or growing the row. An answer too long for three lines names the skill that fits and counts the rest ("low: fractions +1"), the whole answer on hover and to screen readers.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user's screenshot (2026-09-13, 1400 wide): Mia Nguyen's "low: fractions, non-monic factorising" rendered "non-monic factorising" at about 7 px and Sam's live "low: monic factorising" similar. `ConfidenceCell` in `app/teacher/TeacherLive.tsx` put each named skill on its own line through `FitText`, which shrinks a line to fit the cell, with no floor. Ticket 187 logged it in `FUTURE_FEATURES.md` ("Long confidence skill names").

Facts (measured on the production build, 2026-09-13): the column's cell is 87 layout px at 1280 and 1400 (`CONFIDENCE_COL` 84 plus the table's spare), its content 71 px inside `px-2`; every row is 82 layout px (the first 81), 54 px inside the cell's `py-3.5`. At 13 px, "discriminant," is 79 px, "non-monic" 67, "factorising" 65, "low: fractions," 87, "representations" 96. Three lines on `leading-snug` are 53.6 px and grew a row by a pixel. Labels come from `data/classmates.ts` and `data/pset1/classmates.ts` (authored strings) and `confidenceLabel` in `lib/report.ts` for Sam's live answer (at most two named skills, `NAMED_CAP`); the confidence screen's picker offers null factor law, monic / non-monic factorising, fractions, zero-finding, discriminant, graph features and sketching parabolas.

## Solution

- `lib/report.ts`: `confidenceForms(label)` replaces `confidenceLines`: the label's forms, longest first: every skill in full, then each skill alone with the rest counted, then "low +n", words kept whole.
- `ConfidenceCell` renders every form unseen inside the cell, measures which fit the cell's width and three 17 px lines (51 px), and shows the first that does, re-measured when the cell's width changes; a shortened form shows a muted "+n", `title` and an `sr-only` copy carry the whole label. The cell's side padding is `px-1` (content 79 px) so "discriminant" fits a line; the column width, the row and every other cell are untouched.
- `FitText` stays for the diagnostic results; the Confidence column no longer uses it.

## Acceptance

- [x] Every confidence label on both sets' Class View, at 1280 × 800 and 1400 × 1000, has every text node at ≥ the "confident" label's computed font size (13 px)
- [x] No label overflows its cell; none is over three lines; the column one width; every row the height of a "confident" row
- [x] A label that fits is shown in full; a shortened one ends "+n" with the full label as its `title` and screen-reader text
- [x] Sam's live label, including the longest the confidence screen can give ("low: non-monic factorising, sketching parabolas"), obeys the same
- [x] The generic rule handles any label length (ticket 189 changes several classmates' answers)
- [x] vitest (`confidenceForms`), eslint, tsc, next build, check:laptop, click-through `confidence190.mjs`, student smoke
