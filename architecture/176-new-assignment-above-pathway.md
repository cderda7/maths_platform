# 176 · "New assignment" heads the class view's right column as a light indigo pill

Routes: every `/teacher/*` (the bar loses the pill), `/teacher` (the column gains it).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherChrome.tsx` | The teacher bar and page frame. Its right group is now the teacher's name and avatar only; the `Link` to the create screen is gone from here. |
| `app/teacher/TeacherLive.tsx` | The class view. The right column's first child is a `flex` row with the `Link` (`data-new-assignment`) styled `bg-accent-soft text-accent-deep border-accent-deep`, hover `bg-accent-line`; the column's `space-y-6` puts the Class review card (session running) or the Pathway card 24 layout px beneath it. |

## How it connects

```
 TeacherChrome (every /teacher/*)
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ Edexia · Maths  [Class] [Mistakes] [Groups]                 Ms Okafor  (MO)  │  ← no pill at the right any more
 └──────────────────────────────────────────────────────────────────────────────┘
 TeacherLive (/teacher)           grid-cols-[1fr_320px]
 ┌───────────────────────────────────────────┐  ┌────────────────────────────┐
 │ roster card (data-grid)                   │  │ [New assignment]           │  ← Link → /teacher/assignments/create
 │                                           │  │      ↕ space-y-6 (24 px)   │     accent-soft fill, accent-deep text + 1 px border
 │                                           │  │ ┌────────────────────────┐ │
 │                                           │  │ │ PATHWAY  (data-pathway-card)│
 │                                           │  │ │ indiv working → …      │ │
 │                                           │  │ └────────────────────────┘ │
 │                                           │  │ Group review · Class review │
 │                                           │  │ Live diagnostic · Key       │
 └───────────────────────────────────────────┘  └────────────────────────────┘
   The pill's top = the roster card's top; its left = the column's (and the Pathway card's) left.
   While a class-review session runs the Class review card leads the column (ticket 129), so
   the pill then sits above that card, the Pathway card next.
```

Measured at zoom 0.72 (`[data-teacher-root]`): pill 134 × 31 layout px, 17.3 screen px above the Pathway card (24 × 0.72), border reads 1/0.72 px from `getComputedStyle` under the zoom.
