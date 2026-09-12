# 150 · Drag to reorder questions by press-and-hold

Routes: `/teacher/assignments/create`, `/teacher/assignments/create/review` (difficulty step), `/teacher/whole-class`.

## Files touched

| File | What it does |
|---|---|
| `lib/reorder.ts` | New, pure. `HOLD_MS`, `HOLD_SLOP`; `moveItem`; `beyondSlop`; `slotAt` (nearest centre); `shiftedSlot` (who slides where while one is held); `stackedTops` (a column of uneven cards re-laid from their heights); `arrowTarget` (Alt+arrows in a grid). |
| `lib/reorder.test.ts` | New. Every function above, grid and column, including `shiftedSlot` agreeing with `moveItem` for every from/to pair. |
| `components/useReorder.ts` | New. The hook: press → hold timer → lift; moves set the slot and the others' transforms; release → `onMove`; Escape / cancel / blur drop; the click after a hold swallowed; a focused text field keeps its selection; zoom read from the held box; `slot(i)`, `item(i)`, `drag`, `announced`. |
| `app/teacher/assignments/create/CreateAssignment.tsx` | The hook over every tile but the ghost; a move is an `edit` (saved, undo line cleared); `li`s carry the item props; aria-live line. |
| `app/teacher/assignments/create/QuestionTile.tsx` | `slot` for the label; focuses on click, not on press (mousedown still `preventDefault`s outside the text box). |
| `app/teacher/assignments/create/review/QuestionGrid.tsx` | `onMove` turns the hook on; live slot in the label and the pill's aria-label; the arrival delay pinned to the arrival index. |
| `app/teacher/assignments/create/review/DifficultyStep.tsx`, `ReviewAssignment.tsx` | `onMove` through to a `draft/set` with the reordered questions. |
| `lib/review.ts`, `lib/review.test.ts` | `draftKey` sorts the id+text pairs: order left out, a reorder keeps the review. |
| `app/teacher/whole-class/WholeClassSetup.tsx` | `order` (all ids, assignment order); `ordered` = ticked in that order; the example cards drag in a column; a move re-sequences the ticked ids, the unticked keep their places; `data-wc-order`, `data-wc-slot`. |
| `app/globals.css` | Held lift shadow and grabbing cursor; reduced motion drops the slide. |

## How it connects

```
 useReorder({ count, columns, ignore, onMove, name })            lib/reorder (pure, vitest)
 ┌───────────────────────────────────────────────────────┐
 │ pointerdown on item i (not inside `ignore`)           │
 │   press = {i, x, y, timer(HOLD_MS)}                   │
 │   move past HOLD_SLOP before the timer ─▶ cancel      │   beyondSlop
 │   release before the timer ─▶ a click, nothing more   │
 │   timer fires ─▶ begin: measure every item's box,     │
 │     zoom = box.width / offsetWidth, lift i            │
 │   move while held ─▶ to = slotAt(all boxes) clamped   │   slotAt, shiftedSlot
 │     to count−1; others translate to their new place   │   stackedTops (columns === 1)
 │   release ─▶ onMove(from, to)   Escape/cancel ─▶ drop │   moveItem (the caller)
 │   the click that follows a hold ─▶ swallowed          │
 │   Alt+arrow on a focused item ─▶ onMove, announced    │   arrowTarget
 └───────────────────────────────────────────────────────┘
        │ item(i): ref, style (transform), data-drag, onPointerDown, onClickCapture, onKeyDown
        │ slot(i): the live slot for the label
        ▼
 CreateAssignment ──▶ edit(cur => moveItem(cur, from, to)) ──▶ draft/set (order = array order)
   ol[data-questions] > li (11: 10 tiles + ghost; count 10, the ghost a landing zone for slot 10)
   QuestionTile slot → "Q{slot+1}"; click → onFocus (a hold never edits)

 DifficultyStep ──▶ QuestionGrid onMove ──▶ ReviewAssignment: draft/set { questions: moveItem(...) }
   draftKey(questions) sorts pairs ─▶ same key ─▶ reviewFor keeps labels, answers, step
   RecommendationsStep's grid (applyReview) follows the draft's order, the addition last

 WholeClassSetup
   Problems list (ranked by struggle, tick to choose) ── unchanged
   order: [q1 … q9]   ordered = order.filter(ticked)   ← the cards, top to bottom
   card i held ─▶ onMove ─▶ moved = moveItem(ordered) ─▶ order = order with ticked ids re-sequenced
   Project ─▶ wc/setup { problems: ordered } ─▶ the board's slides in that order
```

## Verified by

vitest (450), eslint, tsc, `next build`; a headless run (`reorder150.mjs`, 46 checks, twice) with real mouse events over CDP at 1400 and 1280: on the create screen a short click edits and moves nothing; a hold on Q4 glided to Q2's slot lifts it (held, cursor grabbing, not in edit), slides Q2 and Q3 with live labels, resizes nothing, and on release Q4 is second with the draft stored, no undo line, the moved tile not in edit; a press that moves first never lifts; the ghost lifts nothing and a drop over it lands tenth; Escape drops back; a hold in the focused text box moves the tile, keeps the edit and selects no text; Alt+→ and Alt+↓ move it with the live region reading the move; a reload keeps the order. On the review's grid a relabelled Q1 dragged to third keeps its label, the review its key, the draft the order; Back shows the create screen in that order. On the class review setup the list ranks by struggle while the cards stand in assignment order; the third card dragged onto the first becomes first with the slid cards stacking under it with the column's gap and no overlap; a hold on a control lifts nothing; unticking and re-ticking keeps the place; a fourth ticked problem joins; Project sends the cards' order to the board.
