# 179 · "New assignment" on its own row above both cards

Routes: `/teacher`.

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherLive.tsx` | The class view. Between the due line and the cards' grid a second `grid-cols-[1fr_320px]` row holds an empty left cell and the pill (`data-new-assignment`) in the right cell; the cards' grid follows with `mt-6`. The right column is back to Class review card (session running) / Pathway card first. |
| `app/teacher/TeacherChrome.tsx` | Comment only: where the pill went. |

## How it connects

```
 TeacherLive (/teacher)
 ROOTS OF A QUADRATIC — SET 3 · due Thu 10 Sep            (data-due-line)
        ↕ mt-10
 ┌─────────────────────────────────────────────┐  ┌────────────────────────────┐
 │ (empty cell)                                │  │ [New assignment]           │  ← Link → /teacher/assignments/create
 └─────────────────────────────────────────────┘  └────────────────────────────┘     accent-soft fill, accent-deep text + 1 px border
        ↕ mt-6 (24 layout px, the same as the column gap)
 ┌─────────────────────────────────────────────┐  ┌────────────────────────────┐
 │ STUDENT  ALGEBRA FUNCTIONS … CONFIDENCE SET │  │ PATHWAY  (data-pathway-card)│  ← tops level again
 │ roster rows …                               │  │ indiv working → …          │
 │                                             │  └────────────────────────────┘
 │                                             │  Group review · Class review …
 └─────────────────────────────────────────────┘
   Both rows are the same two-column grid, so the pill's left edge is the Pathway card's left edge.
   The history sheet (ticket 175) spans the roster's category heads to Set only, so it never
   reaches the pill's column; with the top rows open it still rises to the due line's midline.
```

Measured at zoom 0.72: pill 134 × 31 layout px; 17.3 screen px (24 × 0.72) above both cards; the Pathway card's top within 1 px of the roster's header row top.
