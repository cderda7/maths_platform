# 35 · Split view: student, teacher and board in one tab

Route: `/split?panes=student,teacher,board&layout=stacked|beside`. Presenter-only.

## Files touched

| File | What it does |
|---|---|
| `lib/ipad.ts` | The device constants (`SCREEN_W/H`, `BEZEL`, `DEVICE_W/H`, `STAGE_MARGIN`), moved out of `IpadStage` so the split view can lay the student pane out at the stage's width |
| `components/IpadStage.tsx` | Imports those constants; otherwise unchanged |
| `lib/split.ts` (+ test) | `PANES` (id, label, href, design viewport with a `fit`: the iPad fills, the teacher fills and scrolls with no height, the board letterboxes at 1440 × 810), `parsePanes` / `serialisePanes` (page order, unknown names dropped, `null` when absent), `togglePane` (never empties), `parseLayout` (stacked unless `beside`), `placeFor(panes, layout)` → grid columns, row count and a `grid-area` per pane, `frameFor(paneSize, design)` → the iframe's scale, size and offset (fill: covers the pane, width- and height-fit; letterbox: the largest box of the design's aspect, centred) |
| `app/split/page.tsx` | Server page: reads `?panes=` and `?layout=`, hands `init`, `explicit`, `initLayout` to the client view |
| `app/split/SplitView.tsx` | The toolbar (pane toggles, layout toggle, Reset demo) and the grid of `PaneFrame`s; the choice is written to the URL (`history.replaceState`) and localStorage, and read back as an external store (`useSyncExternalStore`, server snapshot "unknown") so plain `/split` reopens the last choice without drawing a pane twice. The main is a window-high grid whose columns, rows and areas come from `placeFor`; nothing scrolls. `PaneFrame` measures its frame area with `useSize` (a `ResizeObserver` hook) and renders the route in an iframe at `frameFor`'s size and offset, `transform: scale(...)` from the top-left |
| `app/page.tsx` | A line under the two cards linking to `/split` |

## How it connects

```
 /split  page.tsx (server) ── init · explicit · initLayout ──▶ SplitView (client)
                                                                 │ choice = URL (until touched) | stored | default
                                                                 │ store(choice): localStorage + history.replaceState + notify
                                                                 ▼
                    ┌── toolbar: [Student] [Teacher] [Board]  [Stacked | Side by side]  (Reset demo → resetSession)
                    │
                    └── main grid, window-high  placeFor(panes, layout) → columns · rows · grid-area per pane
                          stacked:  ┌───────────────┬────────┐   3fr | 2fr; the board spans every row;
                                    │ student       │        │   without the board the left column is the width,
                                    ├───────────────┤ board  │   without the others the board is
                                    │ teacher       │        │
                                    └───────────────┴────────┘
                          beside:   one 1fr column per pane
                          ├─ PaneFrame student  ── useSize (ResizeObserver) ──▶ frameFor(size, {1264 × 904, fill})   covers the pane; the stage centres the device
                          │      └─ <iframe src="/student">          laid out at the design viewport, scale = pane / design
                          ├─ PaneFrame teacher  ── frameFor(size, {1280, fill})               (scrolls inside)
                          │      └─ <iframe src="/teacher">
                          └─ PaneFrame board    ── frameFor(size, {1440 × 810, letterbox})   the largest 16:9 box, centred, cream around
                                 └─ <iframe src="/teacher/board">

 Same origin ⇒ the iframes share localStorage and both BroadcastChannels with each other and with any other tab:
   lib/store.ts (student session) · lib/classroom-store.ts (classroom)
 so a skip in the student pane, a Project on the teacher pane or a stroke on the board pane reaches the others
 exactly as it reaches a separate tab. Nothing in this ticket touches the stores.
```

## Verified by

vitest (201 tests): pane parsing and order, toggling never empties, placements (three, two,
one beside the board, single), frame fill by width and by height, letterbox in portrait and wide
panes, the design table. CDP at 2000 × 1150 and 1440 × 900: both layouts and every toggle,
nothing scrolling, the URL after each, the last pane refusing to switch off, the
whole-class skip inside the student pane projecting on the board pane, plain `/split` reopening
the last choice, an explicit URL winning, the home link. `tsc --noEmit`, `eslint`, `next build`.
