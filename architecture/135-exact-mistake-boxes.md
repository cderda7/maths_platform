# 135 · A box around the students on the exact same mistake

Route: `/teacher/mistakes`.

## Files touched

| File | What it does |
|---|---|
| `lib/mistakes.ts` | `mistakeKey(row)`: the wrong lines' TeX joined, the identity of a mistake. `groupByMistake(rows, start)`: partition by that key, first appearance, absolute starts. `groupBySlip` now fills `SlipGroup.mistakes` and reorders each pill's rows to match, so the flat order is pill by pill, mistake by mistake. |
| `app/teacher/mistakes/TeacherMistakes.tsx` | The working row: a full-width backdrop cell (divider, cream) and one cell per student drawing its share of its box (`data-mistake-group`, `data-box-start`, `data-box-end`). `COLUMN_FLOOR` 186. `FitGrid`: the students' grid, which measures its lines before paint and sets `--fit` on itself; the line's size is `clamp(13px, 17px × --fit, 17px)`; padding and the live footer tighten under 260 px of column (`@container` on the cell). |
| `lib/mistakes.test.ts` | Keys, the partition, the reorder, Q7 / Q9 in the fixtures, Sam leading when live. |

## How it connects

```
 lib/mistakes.ts
   mistakesByProblem ─▶ rows per problem (live student first, classmates in fixture order)
   groupBySlip(rows) ─▶ SlipGroup[]  slips (leaves) · start · rows · mistakes ─┐
                                                                               │
                        groupByMistake(rows, start) ─▶ MistakeGroup[]  key = wrong lines' tex · start · rows
                                                                               │
 TeacherMistakes.tsx  ordered = groups.flatMap(rows)   boxes = groups.flatMap(mistakes)
 ┌──────────────────────────────────────────────────────────────────────────────────────────┐
 │ <FitGrid data-students style="grid-template-columns: repeat(n, minmax(186px, 1fr))">     │
 │  row 1  [name] [name] [name] [name] [name]        one button per student (unchanged)     │
 │  row 2  ╞═══ pill: slips of the SlipGroup ═══╡ ╞═ pill ═╡   spans g.start … g.rows        │
 │  row 3  ░ backdrop 1 / -1: border-t · cream ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
 │         ┌────────┬────────┬────────┐  ┌────────┐ ┌────────┐   one cell per student;      │
 │         │ lines  │ lines  │ lines  │  │ lines  │ │ lines  │   border-y on all, the box's │
 │         └────────┴────────┴────────┘  └────────┘ └────────┘   first: ml-2.5 + border-l + │
 │           ◀── one MistakeGroup ──▶  20px  solo     solo         rounded-l; last: mirror   │
 │  --fit ◀── useLayoutEffect: max over li of (katex.offsetWidth+1) / (li content width),    │
 │           set to 1 first, then the factor; again on ResizeObserver and fonts.ready        │
 └──────────────────────────────────────────────────────────────────────────────────────────┘
      li: text-[clamp(13px,calc(17px*var(--fit,1)),17px)] whitespace-nowrap
          @max-[260px]: px-2 py-1.5 (the cell is the @container; its width is the column's)
```

A box is cells, not an element: the dividers inside it are the grid's own column lines, so they align with the name row's above without a subgrid, and neighbouring boxes are simply cells whose edge margins meet. The identity a box draws is `mistakeKey`, the wrong line's table entry (DECISION_LOG 2026-09-12, ticket 130); Q9's four "h = 6" students by two routes share one box.

## Verified by

vitest (404), eslint, tsc, `next build`, `npm run check:laptop` (16 checks); `mistakes135.mjs` (port 3197 / CDP 9497, at 1440 and 1280, without and with the live session via a `/student?stage=feedback` tab): no boxes collapsed; per problem the boxes' sizes, adjacency, single start and end, continuous top and bottom edges, 20 px gaps, equal column widths; every line unwrapped and inside its box on every problem with everything open (font sizes and widest lines printed); no page overflow; Sam's footer link kept; crops of Q7 (both scroll ends, and live), Q1, Q6, Q9, Q4, Q10 live, and everything open at 1280.
