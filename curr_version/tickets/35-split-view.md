# 35: Split view: student, teacher and board in one tab

**What to build:** A presenter page, not a product screen: `/split` shows the student iPad, the teacher view and the projected board together in one browser tab, any one, two or all three of them, chosen from a toolbar. The panes stay in step exactly as separate tabs do. Everything fits the window, nothing scrolls. Stacked (the default, the user's layout of 2026-09-10): the student over the teacher in a left column three fifths wide, each half the height, and the board down the right at two fifths, the whole height, its 16:9 slide letterboxed in the portrait column. Side by side is the alternative: one window-high column per pane. Every boundary between panes has a handle: drag it to move the boundary (the user's request of 2026-09-10, to set the divisions by hand while working through the mockup), double-click it to put it back; a pane can be made small but never under 15 % of its axis. The sizes are remembered with the pane choice. The choice is in the URL and remembered, so the page reopens as it was left.

**Blocked by:** 33 (skip-to strip; the student pane's presenter controls), 23 (the board route).

**Status:** done

**Triage:** `ready-for-agent`

---

## Solution

Each pane is the real route in an iframe. Same origin, so the two stores' localStorage and BroadcastChannel reach every pane as they reach every tab: nothing new syncs anything. A pane is laid out at its surface's design viewport (the iPad stage's width; a 1280-wide laptop for the teacher; a 1440 × 810 projector for the board) and scaled down with a transform to fit its pane, so layouts never reflow into something the product would not show. A surface with a natural height (the iPad, the board's 16:9 slide) is never cropped: the iPad fills its pane (the stage centres the device and paints its glow to the edges), the board is letterboxed, the largest 16:9 box that fits, centred in cream. `placeFor` turns the chosen panes, layout and sizes into grid tracks (pane tracks separated by 12 px gutter tracks) with an area per pane and a divider per gutter; `resize` moves a divider's share or weights by a dragged fraction, `resetSize` restores one, `parseSizes` reads stored sizes safely. `lib/split.ts` holds the pure parts: the pane table, `parsePanes`/`serialisePanes`, `togglePane` (never empties), `parseLayout` (stacked unless told beside), `placeFor` and `frameFor`. `app/split/page.tsx` reads `?panes=` and `?layout=`; `SplitView` owns the choice, writes it to the URL and to localStorage, and reads the stored one for plain `/split` through `useSyncExternalStore` so nothing draws before the choice is known. The home page links to it.

## Acceptance

- [x] `/split` with a dashed toolbar: Student · Teacher · Board toggles, at least one always on
- [x] Stacked (default: student over teacher at three fifths, board down the right at two fifths, all fitted to the window) or side by side; layout toggle only when more than one pane
- [x] Panes scaled from their design viewports; the iPad never cropped; the board letterboxed at 16:9
- [x] `?panes=student,teacher&layout=beside` deep link; toggles rewrite the URL; plain `/split` reopens the last choice
- [x] A drag handle with arrows in every gutter; drag moves the boundary live, release stores it; double-click resets that boundary; minimum share held; sizes survive a reload
- [x] Per-pane "Open in a tab"; Reset demo in the toolbar
- [x] A skip in the student pane projects on the board pane and updates the teacher pane
- [x] Unit tests for `lib/split.ts`; CDP click-through at 1920 and 1440
- [x] Architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, README
