# 125 · Category markers are pills

Routes: `/teacher` (the class grid), `/teacher/report` (the browse drill), `/student?stage=report` (the student's report row).

## Files touched

| File | What it does |
|---|---|
| `components/Tag.tsx` | `StatusDot` gains `shape`: `"dot"` (default, 8 px unless sized) or `"pill"` (`PILL_SIZE`, 28 × 13); colour, half fill and unseen outline are shared; `data-shape` on the element. |
| `app/teacher/TeacherLive.tsx` | The category cell: a `h-7 w-10` button (pill-shaped hover and ring) around a pill; the labels beside it at `calc(50% + 20px)`. Measurement still reads `[data-status]` for the column boxes. |
| `components/SkillColumns.tsx` | The student's row: the same wrapper, pill and label offset. |
| `components/HierarchyDrill.tsx` | `Node({ category })`: the pill and the category's own case; group and skill nodes unchanged (`px={fit.dot}` dots). The browse drill passes `category` at its top level. |

## How it connects

```
 StatusDot ── shape="pill" ──▶ category level        shape="dot" (default) ──▶ groups, skills, chips, key
      │                                                       │
      ├─ TeacherLive category <button data-dot>  (grid)       ├─ RowDrill / SkillTree Node (px = fit.dot)
      ├─ SkillColumns category (student row)                  ├─ HierarchyDrill group / skill Node
      └─ HierarchyDrill category Node (browse)                └─ LeafChip, StatusKey

 column box: left = pill.left ──▶ tree marginLeft ──▶ group dot's left edge under the pill's left edge
```

## Verified by

vitest (390), eslint, tsc, `next build`; `pills.mjs` and `pills2.mjs` (port 3161 / CDP 9461): every grid marker `pill:28x13` (22 × 10 at the laptop scale), every drill marker `dot`; the row drill, the category drill with its pill ring, the column and unit labels beside the pill; the report drill for a classmate with pills above dots; the student's report row the same.
