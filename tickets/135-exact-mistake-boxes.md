# 135: A box around the students on the exact same mistake

**What to build:** On the mistake view the skill pill stays as it is (one pill across every student who slipped on the same skill). Inside a pill, students who made the exact same mistake (the same wrong line, whatever the lines around it) sit together, and when the problem is open one box in the pill's red is drawn around their working; a student alone on their mistake is boxed alone. No second pill. Every column of a problem is the same width, the columns sharing the card down to a floor; a problem with many students shrinks its working to fit the columns (never under 13 px) and names truncate.

**Blocked by:** 130 (the fixtures with more than one mistake per skill).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a crop of Q6 and Q7 open: "once you've done that, i want to have two groupings in mistake view: one by skill (as it is currently) & then a second by exact mistake. so the current 'fractions' pill should stay top level, but then additionally group them by exact mistake. put a red border around the problems that share the exact same mistake -- so there's not a second pill for 'this mistake', just that additional visual signal via the border around it." In the interview: the border wraps the working only (nothing shows while collapsed), the solo student is boxed too, the box is an inset panel in the pill's red with the dividers kept inside and a gap between neighbours, first-appearance order with the live student first, equal columns that narrow for a crowded problem with the working shrinking to fit and names truncating.

## Solution

- `lib/mistakes.ts`: `mistakeKey(row)` (the wrong lines' TeX joined; a student with two wrong lines is keyed on both), `groupByMistake(rows, start)` → `MistakeGroup { key, start, rows }` in order of first appearance, and `SlipGroup` gains `mistakes` with its `rows` reordered to match, so the flat order is pill by pill and, inside each, mistake by mistake.
- `app/teacher/mistakes/TeacherMistakes.tsx`: the open problem's working row is one grid cell per student as before; a full-width backdrop item carries the divider under the pills and the cream. Each cell draws its share of its box: top and bottom edges on every cell, the left edge, corners and a 10 px margin on the group's first, the right on its last, a plain divider between cells of one box, so neighbouring boxes sit 20 px apart and the box's dividers line up with the name row's by construction (no subgrid, no overlay). `COLUMN_FLOOR` 186 px replaces the 230 px minimum. `FitGrid` wraps the students' grid: before paint it measures every line's KaTeX against its box at `--fit: 1` and writes the one factor that puts the widest line on one row (KaTeX scales with the font size, so one measurement is enough), again on resize and once the fonts load; the line's font size is `clamp(13px, 17px × --fit, 17px)`; under 260 px of column (a container query on the cell) the padding tightens and the live student's footer stacks. Lines are `whitespace-nowrap` (KaTeX inline maths breaks at relations otherwise).
- Tests: `lib/mistakes.test.ts` (keys, the partition and its starts, the reorder inside a slip group, Q7's four / six / two with Sam leading a seven when live, Q9's four by two routes as one).
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## What did not fit

Twelve columns cannot share the card unscrolled at a readable size: the card is capped near 1426 layout px, so twelve equal columns are 118 px each, and Q7's pair-check line would need maths under 9 px. The floor is 186 px (Q7's widest line at 13 px plus the box's edge margin), so Q7 shows about seven and a half of its twelve or thirteen columns and scrolls sideways for the rest; every other problem fits without scrolling at 1280 and 1440. Wrapping the students onto a second row of columns is logged in future features.

## Acceptance

- [x] Collapsed: no boxes anywhere; the pills unchanged
- [x] Q7 open: fractions pill over ten in two boxes (four lost the third, six scaled two terms), monic factorising over two in one box; with the live student handed in, thirteen columns and Sam leads a box of seven
- [x] Q1: one pill, Liam and Oliver's wrong pair boxed together, Ethan's sign flip boxed alone; Q6: Amelia boxed alone; Q9: four "h = 6" by two routes in one box, Mia alone under her own pill; Q2 five and one; Q4 four and one
- [x] Every box is adjacent columns with one start and one end, its top and bottom edges continuous, 20 px between neighbours; every column of a problem the same width
- [x] Every line on one row inside its box on every problem at 1440 and 1280, with and without the live student (Q7 at 13.7 px, Q2 at 16 px, Q10 with four columns at 14.3 px, the rest at 17 px); no horizontal overflow of the page
- [x] vitest (404), eslint, tsc, `next build`, `npm run check:laptop` (16 route/size checks), headless run (`mistakes135.mjs`, 103 checks, crops)
