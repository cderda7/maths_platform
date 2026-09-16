# 346: the rows stay on screen while the cards scroll

The Mistakes tab's split keeps its two columns. The left one — the rows and its header — now sticks inside the teacher
frame's scroll region, so a card further down the right column is still read against the rows it came from. Individual
working, individual review and group review pass `stickyLeft`; class review (tickets 320, 344) is named out and keeps the
plain split until its rows are settled.

```
 TeacherChrome
 ┌───────────────────────────────────────────────────────────────────────────────┐
 │ header bar  (brand · tabs · present board)            outside the scroll      │
 ├───────────────────────────────────────────────────────────────────────────────┤
 │ main[data-teacher-scroll]   overflow-y: auto   ← the sticky column's region   │
 │  ┌─────────────────────────────────────────────────────────────────────────┐  │
 │  │ BackLine (pathway strip, ticket 334)   ─┐                               │  │
 │  │ eyebrow row                             │ these scroll away             │  │
 │  │ div[data-stage-split]  grid-cols-2  items-start                         │  │
 │  │  ┌───────────────────────────┐  ┌────────────────────────────────────┐  │  │
 │  │  │ section[data-split-left]  │  │ section[data-split-right]          │  │  │
 │  │  │   position: sticky        │  │   the mistake cards, scrolling     │  │  │
 │  │  │   top: ← stickyTop(…)     │  │   ▲                                │  │  │
 │  │  │   data-sticky-left        │  │   │ measured from here             │  │  │
 │  │  │  ┌─────────────────────┐  │  │   │ (never sticks, so its top is   │  │  │
 │  │  │  │ h2 "Where … are"    │  │  │   │  the split's place in the      │  │  │
 │  │  │  │ PlaceTable  (315)   │  │  │   │  content: splitFoot)           │  │  │
 │  │  │  │ ReviewTable (318)   │  │  │   │                                │  │  │
 │  │  │  │ GroupGrid   (319)   │  │  │   │                                │  │  │
 │  │  │  │ + overlay ▸ panel   │  │  │   │                                │  │  │
 │  │  │  └─────────────────────┘  │  │   │                                │  │  │
 │  │  └───────────────────────────┘  └────────────────────────────────────┘  │  │
 │  └─────────────────────────────────────────────────────────────────────────┘  │
 ├───────────────────────────────────────────────────────────────────────────────┤
 │ presenter strip (SKIP TO · Reset demo)                outside the scroll      │
 └───────────────────────────────────────────────────────────────────────────────┘

   lib/stickyColumn.ts                         app/teacher/StageSplit.tsx
   ┌───────────────────────────────┐           ┌──────────────────────────────────┐
   │ STICKY_TOP  16 layout px      │◀──────────│ useLayoutEffect on every render: │
   │ STICKY_FOOT 12 layout px      │           │  top = stickyTop(               │
   │ stickyTop(column, region)     │           │    max(column.offsetHeight,      │
   │   fits  → STICKY_TOP          │           │        overlay bottom), region)  │
   │   tall  → region−foot−column  │           │  written straight to the style;  │
   │          (negative: rides up  │           │  ResizeObserver on the region,   │
   │           to its foot, then   │           │  the column and the overlay      │
   │           sticks)             │           └──────────────────────────────────┘
   │ splitFoot(table, main)        │◀──────────┐
   │   the table's foot in the     │           │ app/teacher/WhereStudentsAre.tsx
   │   content, read off the right │           │  PlaceTable  fold  (ticket 315)  │
   │   column, so scrolling never  │           │  ReviewTable fit   (ticket 318)  │
   │   moves it                    │           └──────────────────────────────────┘
   └───────────────────────────────┘
```

## Files

| File | What it does |
| --- | --- |
| `lib/stickyColumn.ts` | New. `STICKY_TOP` / `STICKY_FOOT`, `stickyTop(column, region)` (the pure rule, tested), and `splitFoot(table, main)`, the fit rules' scroll-proof reading of where the column's foot sits in the content. |
| `lib/stickyColumn.test.ts` | New. Seven tests: a column that fits, one that fills the room exactly, one px past it, a tall column resting its foot `STICKY_FOOT` above the region's, never a top below `STICKY_TOP`, nothing measured yet, and custom room. |
| `app/teacher/StageSplit.tsx` | Takes `stickyLeft`. The left section becomes `sticky self-start` with `data-sticky-left`, and a layout effect writes its `top` from `stickyTop`, measuring the overlay with the column so an open work panel can still be scrolled to. |
| `app/teacher/TeacherMistakes.tsx` | Names the three stages that stick (`stickyLeft`), separately from `split`, so class review does not inherit it. |
| `app/teacher/WhereStudentsAre.tsx` | `PlaceTable`'s fold and `ReviewTable`'s pill fit read `splitFoot` instead of measuring against the scroll region, so scrolling the cards no longer folds a row or shortens a pill. |

## How it connects

- The scroll region is `TeacherChrome`'s `main[data-teacher-scroll]` (ticket 68: the window never scrolls, the region does), so the column sticks under the header bar, not the window's edge, and the presenter's strip stays clear of it.
- The overlay (ticket 315's diagnostic steps, ticket 316's student work panel) is drawn inside the left column, so it rides with it and still covers the rows and never the cards.
- The fit rules that keep the column inside the region (ticket 315's folded question rows, ticket 318's shortened pills, ticket 319's grid) are unchanged in what they decide: `splitFoot` returns exactly what the old expression returned at rest, and the same number at every scroll position.
