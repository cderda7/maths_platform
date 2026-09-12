# 143 · "n/20 correct" with "m/20 skipped" under it

Route: `/teacher/mistakes`.

## Files touched

| File | What it does |
|---|---|
| `app/teacher/mistakes/TeacherMistakes.tsx` | `COUNT` (the tag style) and `COUNT_H = 22`; a column of two tags left of the card, its top padding centring the first on the header row; `skipped = CLASS_SIZE − right − rows.length`; `data-right` and `data-skipped`. |
| `README.md` | The mistake view paragraph names both boxes. |

## How it connects

```
 mistakesByProblem(session) ─► { problem, rows, right }        CLASS_SIZE = 20
                                        │
                                        ▼
 skipped = 20 − right − rows.length     (stopped before it, or no answer handed in; Sam without a session counts here)

 row (flex items-start gap-4)
 ┌────────────────────┐ ┌──────────────────────────────┐
 │ pad-top (71−22)/2  │ │ Card: header 69 (+1 border)  │
 │ [ 15/20 correct ]  │ │  Q1  x²−5x+6=0  (tag)        │   ← the first tag centred on the header row
 │   gap 6            │ ├──────────────────────────────┤
 │ [  2/20 skipped ]  │ │ names · pills · working      │   ← same width (items-stretch), 6 px under
 └────────────────────┘ └──────────────────────────────┘
```

## Verified by

vitest, eslint, tsc, `next build`; headless click-through `skipped143.mjs`: at 1800 and 1280 px, with and without Sam's session, every problem's two tags read `n/20 correct` and `m/20 skipped`, the three numbers sum to twenty, the fixture values match (Q1 15 / 2 then 15 / 1 live, Q7 2 / 6 then 2 / 5, Q4 12 / 3 live, Q9 8 / 7 both ways), the correct tag's centre is within 1.2 px of the header row's, both tags lie left of the card, the skipped tag is the correct tag's width and 4–6 window px under it, and the tooltip carries the partition.
