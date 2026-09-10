# 35 · Split view: student, teacher and board in one tab

Route: `/split?panes=student,teacher,board&layout=stacked|beside`. Presenter-only.

## Files touched

| File | What it does |
|---|---|
| `lib/ipad.ts` | The device constants (`SCREEN_W/H`, `BEZEL`, `DEVICE_W/H`, `STAGE_MARGIN`), moved out of `IpadStage` so the split view can lay the student pane out at the stage's width |
| `components/IpadStage.tsx` | Imports those constants; otherwise unchanged |
| `lib/split.ts` (+ test) | `PANES` (id, label, href, design viewport; the iPad and the board have a height, the teacher scrolls and has none), `parsePanes` / `serialisePanes` (page order, unknown names dropped, `null` when absent), `togglePane` (never empties), `parseLayout` (stacked unless `beside`), `columnsFor(n, layout)`, `rowHeight(design, width, available)` → a stacked row's frame height (natural height at the width's scale, capped at the window; the window for a scrolling surface), `frameFor(paneSize, design)` → the iframe's scale and size (width-fit; height-fit too when the design has a height) |
| `app/split/page.tsx` | Server page: reads `?panes=` and `?layout=`, hands `init`, `explicit`, `initLayout` to the client view |
| `app/split/SplitView.tsx` | The toolbar (pane toggles, layout toggle, Reset demo) and the grid of `PaneFrame`s; the choice is written to the URL (`history.replaceState`) and localStorage, and read back as an external store (`useSyncExternalStore`, server snapshot "unknown") so plain `/split` reopens the last choice without drawing a pane twice. Stacked: the main is a scrolling one-column grid with `max-content` rows, measured with `useSize` (a `ResizeObserver` hook) so each row's frame gets `rowHeight`; beside: window-high `1fr` columns. `PaneFrame` measures its frame area the same way and renders the route in an iframe at `frameFor`'s size, `transform: scale(...)` from the top-left |
| `app/page.tsx` | A line under the two cards linking to `/split` |

## How it connects

```
 /split  page.tsx (server) ── init · explicit · initLayout ──▶ SplitView (client)
                                                                 │ choice = URL (until touched) | stored | default
                                                                 │ store(choice): localStorage + history.replaceState + notify
                                                                 ▼
                    ┌── toolbar: [Student] [Teacher] [Board]  [Stacked | Side by side]  (Reset demo → resetSession)
                    │
                    └── main grid  columnsFor(n, layout)
                          stacked: one column, max-content rows, the main scrolls; useSize(main) → rowHeight(design, width, available) per row
                          beside:  one 1fr column per pane, window-high
                          ├─ PaneFrame student  ── useSize (ResizeObserver) ──▶ frameFor(size, {width: DEVICE_W + STAGE_MARGIN, height: DEVICE_H + STAGE_MARGIN})
                          │      └─ <iframe src="/student">          laid out at the design viewport, scale = pane / design
                          ├─ PaneFrame teacher  ── frameFor(size, {width: 1280})          (scrolls: a stacked row is window-high)
                          │      └─ <iframe src="/teacher">
                          └─ PaneFrame board    ── frameFor(size, {width: 1440, height: 810})  (height-fit: the board fills its screen)
                                 └─ <iframe src="/teacher/board">

 Same origin ⇒ the iframes share localStorage and both BroadcastChannels with each other and with any other tab:
   lib/store.ts (student session) · lib/classroom-store.ts (classroom)
 so a skip in the student pane, a Project on the teacher pane or a stroke on the board pane reaches the others
 exactly as it reaches a separate tab. Nothing in this ticket touches the stores.
```

## Verified by

vitest (199 tests): pane parsing and order, toggling never empties, columns per layout, row
heights (natural, narrow, capped, scrolling), frame scale by width and by height, the design
table. CDP at 1920 × 1080 and 1440 × 900: both
layouts and every toggle, the stacked page scrolling through full-size rows, the URL after each, the last pane refusing to switch off, the
whole-class skip inside the student pane projecting on the board pane, plain `/split` reopening
the last choice, an explicit URL winning, the home link. `tsc --noEmit`, `eslint`, `next build`.
