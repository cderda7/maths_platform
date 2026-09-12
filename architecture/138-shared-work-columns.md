# 138 · Students with identical working share one column

Route: `/teacher/mistakes`.

## Files touched

| File | What it does |
|---|---|
| `lib/mistakes.ts` | `WorkColumn { lines, rows, live }`, `workKey(row)` (every line's TeX joined in order), `groupByWork(rows)`: columns in order of first appearance, students in their original order within one. `groupByMistake` gives each `MistakeGroup` its `columns`; `groupBySlip` gives each `SlipGroup` the concatenation. Both groups' `start` counts columns; the flat `rows` follow the columns. |
| `lib/mistakes.test.ts` | `groupByWork`; pills count columns; Q9 three columns, Q7 four / six / two and seven / four / two with Sam live (his Q7 working is the two-terms slip line for line), Q5's trio. |
| `app/teacher/mistakes/TeacherMistakes.tsx` | One grid column per `WorkColumn`: a header button per column whose name chips wrap (`data-column`, one `data-row` per student), a pill per slip group spanning its columns, one working cell per column (`data-expanded` names every student in it) with the compare footer where the live student is; ticket 135's box spans its mistake group's columns. |

## How it connects

```
 mistakesByProblem(session)          rows: MistakeRow[]  (Sam first, then classmates in fixture order)
          │
          ▼
 groupBySlip(rows)  ─►  SlipGroup { slips, start, rows, mistakes, columns }
          │                                  │
          │            groupByMistake(rows) ─►  MistakeGroup { key, start, rows, columns }
          │                                  │
          │            groupByWork(rows)    ─►  WorkColumn { lines, rows, live }     ← identical TeX, line for line
          ▼
 TeacherMistakes: columns = groups.flatMap(g => g.columns)      grid: repeat(columns.length, minmax(floor, 1fr))

   col 0                      col 1                 col 2                  ← one per WorkColumn
 ┌────────────────────────┬─────────────────────┬──────────────────────┐
 │ ZH Zara  RC Ruby       │ EK Ethan  HS Harper │ MN Mia               │  row 1: header button, chips wrap
 ├────────────────────────┴─────────────────────┼──────────────────────┤
 │ ( graph features            )                │ ( expansion        ) │  row 2: pill spans g.columns
 ├──────────────────────────────────────────────┼──────────────────────┤
 │ ┃ −x(x−6)=0 ┃ │ ┃ −x(x−6)=0     ┃            │ ┃ −x(x+6)=0 ┃         │  row 3: one cell per column,
 │ ┃ x=0 or 6  ┃ │ ┃ tp at x=3     ┃            │ ┃ …         ┃         │         the work written once,
 │ ┃ x=3       ┃ │ ┃ h=6           ┃            │ ┃ h=9       ┃         │         the box (135) spans the
 │ ┃ h=6       ┃ │ ┃               ┃            │                       │         mistake group's columns
 └──────────────┴─┴───────────────┴─────────────┴──────────────────────┘
   Q9: 5 students, 3 columns (was 5)      Q7: 12 (13 with Sam), 3 columns (was 12 / 13)
```

## Verified by

vitest, eslint, tsc, `next build`; headless click-through `columns.mjs`: at 1800 and 1280 px no problem scrolls sideways open or closed, the columns are the expected students, every name chip lies inside its column, the first name in every column sits on one line, every pill spans exactly its columns, one working cell per column with the expected line counts, the compare footer once under Sam's column with the live session.
