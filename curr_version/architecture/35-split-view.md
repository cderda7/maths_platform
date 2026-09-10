# 35 · Split view: student, teacher and board in one tab

Route: `/split?panes=student,teacher,board&layout=beside|stacked`. Presenter-only.

## Files touched

| File | What it does |
|---|---|
| `lib/ipad.ts` | The device constants (`SCREEN_W/H`, `BEZEL`, `DEVICE_W/H`, `STAGE_MARGIN`), moved out of `IpadStage` so the split view can lay the student pane out at the stage's width |
| `components/IpadStage.tsx` | Imports those constants; otherwise unchanged |
| `lib/split.ts` (+ test) | `PANES` (id, label, href, design viewport), `parsePanes` / `serialisePanes` (page order, unknown names dropped, `null` when absent), `togglePane` (never empties), `parseLayout`, `gridFor(n, layout)` → columns and whether the last pane spans, `frameFor(paneSize, design)` → the iframe's scale and size (width-fit; height-fit too when the design has a height) |
| `app/split/page.tsx` | Server page: reads `?panes=` and `?layout=`, hands `init`, `explicit`, `initLayout` to the client view |
| `app/split/SplitView.tsx` | The toolbar (pane toggles, layout toggle, Reset demo) and the grid of `PaneFrame`s; the choice is written to the URL (`history.replaceState`) and localStorage, and read back as an external store (`useSyncExternalStore`, server snapshot "unknown") so plain `/split` reopens the last choice without drawing a pane twice. `PaneFrame` measures itself with a `ResizeObserver` and renders the route in an iframe at `frameFor`'s size, `transform: scale(...)` from the top-left |
| `app/page.tsx` | A line under the two cards linking to `/split` |

## How it connects

```
 /split  page.tsx (server) ── init · explicit · initLayout ──▶ SplitView (client)
                                                                 │ choice = URL (until touched) | stored | default
                                                                 │ store(choice): localStorage + history.replaceState + notify
                                                                 ▼
                    ┌── toolbar: [Student] [Teacher] [Board]  [Side by side | Stacked]  (Reset demo → resetSession)
                    │
                    └── main grid  gridFor(n, layout) → repeat(columns, 1fr) · last pane spans when stacked with three
                          ├─ PaneFrame student  ── ResizeObserver ──▶ frameFor(size, {width: DEVICE_W + STAGE_MARGIN})
                          │      └─ <iframe src="/student">          laid out at the design width, scale = pane / design
                          ├─ PaneFrame teacher  ── frameFor(size, {width: 1280})
                          │      └─ <iframe src="/teacher">
                          └─ PaneFrame board    ── frameFor(size, {width: 1440, height: 810})  (height-fit: the board fills its screen)
                                 └─ <iframe src="/teacher/board">

 Same origin ⇒ the iframes share localStorage and both BroadcastChannels with each other and with any other tab:
   lib/store.ts (student session) · lib/classroom-store.ts (classroom)
 so a skip in the student pane, a Project on the teacher pane or a stroke on the board pane reaches the others
 exactly as it reaches a separate tab. Nothing in this ticket touches the stores.
```

## Verified by

vitest (195 tests): pane parsing and order, toggling never empties, layouts per count, frame
scale by width and by height, the design table. CDP at 1920 × 1080 and 1440 × 900: the three
layouts and every toggle, the URL after each, the last pane refusing to switch off, the
whole-class skip inside the student pane projecting on the board pane, plain `/split` reopening
the last choice, an explicit URL winning, the home link. `tsc --noEmit`, `eslint`, `next build`.
