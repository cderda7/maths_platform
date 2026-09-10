# 68 · Teacher side: the bar never rides the rubber-band; only the content scrolls

Routes: every `/teacher/**` screen (and the teacher iframe in `/split`).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherChrome.tsx` | The frame is the viewport: an unzoomed `h-screen` outer div, a zoomed `h-full` flex column inside it holding the bar (`shrink-0`, no longer sticky) and `main` (`flex-1 min-h-0 overflow-y-auto`, `data-teacher-scroll`) with the page container inside. The window never scrolls |

## How it connects

```
   before (ticket 65)                                   after (ticket 68)
   window is the scroller                               window never scrolls; main is the scroller
   ┌─ html/body (scrollHeight > viewport) ───┐          ┌─ div.h-screen  (unzoomed: 100vh of the window) ───────┐
   │ ┌─ div[data-teacher-root] zoom:0.8 ───┐ │          │ ┌─ div[data-teacher-root] flex-col h-full zoom:0.8 ──┐ │
   │ │ header sticky top-0  ◀── pinned to  │ │          │ │ header shrink-0        ◀── a flex row; nothing to  │ │
   │ │   the document, so the elastic      │ │          │ │                            scroll it against        │ │
   │ │   overscroll moves it too           │ │          │ │ ┌─ main flex-1 min-h-0 overflow-y-auto ──────────┐ │ │
   │ │ main (max-w px-6 py-12)             │ │          │ │ │ div.mx-auto.max-w-[1640px].px-6.py-12          │ │ │
   │ │   …                                 │ │          │ │ │   {children}   ↕ scrollTop, and the bounce     │ │ │
   │ └─────────────────────────────────────┘ │          │ │ └────────────────────────────────────────────────┘ │ │
   │  ↕ window.scrollY                        │          │ │ ResetDemo (fixed bottom-right, as before)          │ │
   └─────────────────────────────────────────┘          │ └────────────────────────────────────────────────────┘ │
                                                        └────────────────────────────────────────────────────────┘
   Why two divs: `100vh` inside zoom 0.8 → 80% of the window (730 of 913 px measured);
   `100%` of an unzoomed parent → the whole window.

   Unchanged: student (StudentChrome already scrolls a pane under the bar), board (no scroll),
   the cursor rule of ticket 61 (still scoped to [data-teacher-root]), the split view's frameFor.
```

## Verified by

vitest (281 tests); eslint and tsc clean; `next build`. Headless Chrome on the built app (port 3143),
eight teacher routes, twelve real wheel events each: `window.scrollY` 0 and no document overflow on all;
the frame spans 0 to 913 px (the viewport) under the zoom; the bar's top edge at 0, the content region
starting at the bar's bottom edge (52.19 px); the region scrolled to its end on the four routes that
overflow (788, 930, 9 and 250 px). Screenshot of the mistakes view at the bottom with the bar in place.
In `/split` the teacher iframe's frame fills the iframe (800 of 800 px) with no document overflow.
