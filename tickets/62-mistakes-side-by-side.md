# 62: Mistakes view: students side by side, one click opens every student's work in columns

**What to build:** On `/teacher/mistakes` the students who slipped on a problem sit side by side under it instead of stacked as rows. Under each student's name is the step they got wrong as a white pill with a dark red border. Clicking any student in a question opens every student's working for that question at once, one column each, the wrong line still tinted red. The wrong line's hint sentence ("Try expanding this back…") and the per-step labels and chips ("Standard form · quadratic equations", "Null factor law · null factor law", …) are gone; the row's "non-monic factorising · 4 lines" text is gone too, the pill carries the error.

**Blocked by:** —

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with three screenshots of the mistakes view: "make it so that students are organized side by side instead of on top of each other. when a teacher clicks on one student in that Q, it opens all student work — side by side & marked up. keep the color coding — remove the text ('try expanding…'). keep non-monic factorising label — remove the other labels for other steps. have the non-monic factorising label (or whatever error the student made) go right below the student name. white pill with a dark red border."

The old view was a list of rows per problem, each row expanding alone to its working with a hint sentence on the red line and a step label plus taxonomy chip on every line. Comparing two students' slips meant opening one, closing it, opening the next.

## Solution

`TeacherMistakes` lays each problem's students out in a single-row CSS grid (`grid-flow-col`, columns at least 230px, the strip scrolls sideways if a problem ever has more students than fit). A column's header is the student tile: avatar, name (and the live pill), and beneath the name one `SlipChip` per distinct slipped leaf. Open state is per problem, not per student: clicking any tile toggles the problem, and when it is open every column shows its lines under the tile, a red-tinted card for a wrong line and a plain one otherwise, with no note, label or chip. The live student's "As handed in · Original vs final →" line sits under their lines so the first lines of every column stay on one row.

`SlipChip` is a new chip in `components/Tag.tsx`: the leaf's short name, white, dark red text and border, on a new `--color-wrong-deep` token in `app/globals.css` (the existing `--color-wrong` is the mid red of the tinted line's text and too light for a pill border).

## Acceptance

- [x] Under each problem the students sit in one row, side by side, every tile's top edge on the same line
- [x] Each tile shows the student's name with the slipped step under it as a white pill with a dark red border, and no "· N lines" text or taxonomy chip
- [x] Clicking any student's tile opens every student's working for that problem in columns; clicking any tile again closes it; opening another problem closes the first
- [x] A wrong line keeps the red tint; no hint sentence, no step label, no leaf chip on any line
- [x] The live student's "Original vs final →" link is still there
- [x] eslint, tsc, vitest, `next build` pass
- [x] Architecture note and `ARCHITECTURE.md` row
