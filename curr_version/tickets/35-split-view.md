# 35: Split view: student, teacher and board in one tab

**What to build:** A presenter page, not a product screen: `/split` shows the student iPad, the teacher view and the projected board together in one browser tab, any one, two or all three of them, chosen from a toolbar. The panes stay in step exactly as separate tabs do. Panes sit side by side, or stacked (three as two over one). The choice is in the URL and remembered, so the page reopens as it was left.

**Blocked by:** 33 (skip-to strip; the student pane's presenter controls), 23 (the board route).

**Status:** done

**Triage:** `ready-for-agent`

---

## Solution

Each pane is the real route in an iframe. Same origin, so the two stores' localStorage and BroadcastChannel reach every pane as they reach every tab: nothing new syncs anything. A pane is laid out at its surface's design viewport (the iPad stage's width; a 1280-wide laptop for the teacher; a 1440 × 810 projector for the board) and scaled down with a transform to fit its pane, so layouts never reflow into something the product would not show. The board, which fills its screen rather than scrolling, also fits its pane's height. `lib/split.ts` holds the pure parts: the pane table, `parsePanes`/`serialisePanes`, `togglePane` (never empties), `parseLayout`, `gridFor` and `frameFor`. `app/split/page.tsx` reads `?panes=` and `?layout=`; `SplitView` owns the choice, writes it to the URL and to localStorage, and reads the stored one for plain `/split` through `useSyncExternalStore` so nothing draws before the choice is known. The home page links to it.

## Acceptance

- [x] `/split` with a dashed toolbar: Student · Teacher · Board toggles, at least one always on
- [x] Side by side or stacked (three: two over one); layout toggle only when more than one pane
- [x] Panes scaled from their design viewports; the board fits a short pane's height
- [x] `?panes=student,teacher&layout=stacked` deep link; toggles rewrite the URL; plain `/split` reopens the last choice
- [x] Per-pane "Open in a tab"; Reset demo in the toolbar
- [x] A skip in the student pane projects on the board pane and updates the teacher pane
- [x] Unit tests for `lib/split.ts`; CDP click-through at 1920 and 1440
- [x] Architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, README
