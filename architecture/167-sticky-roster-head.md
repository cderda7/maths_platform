# 167 · The roster's column heads stay in view while the teacher scrolls

Route: `/teacher` (the class view's roster).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherLive.tsx` | The roster table. Every `thead th` carries `HEAD` (`sticky top-0 z-20 bg-paper` plus an inset 1 px bottom shadow in the line colour), so the heads stick to the top of the teacher frame's scroll region; the header `tr` no longer has a `border-b` (a collapsed border stays with the table when the cells stick). The `Card` around the table is `overflow-clip` instead of `overflow-x-auto`: it still clips to its rounded corners but is not a scroll container, so the heads' nearest scroller is `main[data-teacher-scroll]`. |

## How it connects

```
 TeacherChrome (app/teacher/TeacherChrome.tsx)             h-screen, zoom 0.72
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ <header>  Edexia · Maths  (Class) (Mistakes) (Groups)    New assignment  MO  │  fixed row of the frame
 ├──────────────────────────────────────────────────────────────────────────────┤ ← main's top edge = top: 0 for sticky
 │ <main data-teacher-scroll  overflow-y-auto>               the only scroller  │
 │   Class View  …                                                              │
 │   <Card overflow-clip>          ← not a scroll container (was overflow-x-auto)
 │     <table data-grid>                                                        │
 │       <thead><tr>                                                            │
 │         <th HEAD>STUDENT  <th HEAD>ALGEBRA … NEW SKILLS  CONFIDENCE  SET  ·  │ ── sticky top-0 z-20 bg-paper
 │       <tbody> … rows pass under the heads on scroll …                        │    inset 0 -1px line
 └──────────────────────────────────────────────────────────────────────────────┘
   HEAD = "sticky top-0 z-20 bg-paper shadow-[inset_0_-1px_0_var(--color-line)]"
   hover controls ([data-column-controls], z-10 inside the th) still open when stuck: the th is a z-20 context above the rows
```

Was: the header row scrolled away with the table; the card was its own horizontal scroller.

## Verified by

vitest (454), eslint, tsc, `next build`, `npm run check:laptop` (16 route/size checks, no sideways overflow); `sticky167.mjs` (session `52182dcd-…`'s scratchpad, app on 3321 / CDP 9621, 68 checks): at 1400 × 1000 and 1280 × 800, at rest the heads sit in the card below the title with the corner unpainted; scrolled, every head cell's top equals the scroll region's top (47.06 px, the bar's bottom), rows pass under, the six chips are hit-tested on top; hovering the stuck Algebra head shows "see skills" on top; opening the column keeps the heads stuck; at the end the heads still there and Sofia Petrov in view; the window never scrolls; screenshots at both widths read by eye.
