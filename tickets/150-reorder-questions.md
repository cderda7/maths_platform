# 150: Drag to reorder questions by press-and-hold

**What to build:** On the create screen, on the review's difficulty grid and on the class review setup's example cards, a press held still on a question lifts it; dragging carries it to another slot while the others slide to make room, and the release reorders the set. A short press is still a click (on the create screen, a click opens the tile's editor; a hold does not). The create screen's ghost tile stays last and takes no drop (a drop over it lands last). Alt+arrows move a focused item one slot without the mouse. A reorder never resets the review's decisions. On the class review setup the problem list keeps ranking by who struggled, for choosing; the example cards on the right stand in the order the class will see, the assignment's by default, and dragging a card changes that order, which Project sends to the board.

**Blocked by:** 119, 120, 148.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "we need to implement drag to reorder questions functionality, both in assignment creation & in the class review question selection"; "click & hold anywhere in the question box leads to draggability & reordering. click to edit, click & hold to reorder"; "i'm happy with the rows being in order of 'who struggled the most' & the tiles being in order for the assignment. this helps the teacher select problems while making the review process more intuitive for the student — it'd be weird for the student to go 7->2->3. so i'm happy with the default; just want the option for the teacher to change"; "yep in review during assignment creation, also option to drag"; "one ticket covering both if that works."

Before this, no tile or card could be moved (FUTURE_FEATURES "Reordering tiles"), and the class review projected the ticked problems in assignment order with no way to change it.

## Solution

- `lib/reorder.ts` (new, pure): `HOLD_MS` 300 and `HOLD_SLOP` 6 px; `moveItem`; `beyondSlop`; `slotAt` (nearest centre, the same for a grid and a column); `shiftedSlot` (who slides where while an item is held); `stackedTops` (a column of uneven cards re-laid from their heights so a tall card never overlaps the next); `arrowTarget` (Alt+arrows in a grid `columns` wide).
- `components/useReorder.ts` (new): the hook. Spread `item(i)` on each item's outer element. A press starts a timer; a move past the slop before it fires cancels (a click, a caret, a text selection); a release before it fires is a click. When it fires the item is lifted (`data-drag="held"`, scale 1.02, the card's lift shadow, body cursor grabbing, `user-select: none`), every registered item's box is measured once (the zoom read from the held item's box against its `offsetWidth`, so a translate lands under the pointer inside the teacher chrome's 0.72), and each move sets the slot (`slotAt` over every box, a tail item's box clamped to the last movable slot) and the others' transforms (`data-drag="shifted"`, a 160 ms transition). Release calls `onMove(from, to)`; Escape, `pointercancel` and window blur drop it back; the click that ends a hold is swallowed in the capture phase so a drag never also edits. A text field focused inside the held item keeps its selection through the drag. `slot(i)` gives the live slot for labels. Alt+arrow on a focused item calls `onMove` and sets `announced` for an aria-live line.
- `app/teacher/assignments/create/CreateAssignment.tsx`: the hook over every tile but the ghost (`count: qs.length - 1`, five columns); a move is an `edit`, so it saves to the draft and clears the undo line; the `li`s carry the item props; an sr-only aria-live line. `QuestionTile` takes `slot` for its label and now focuses on click (the release) rather than on press, so a hold does not open the editor; mousedown still `preventDefault`s outside the text box.
- `app/teacher/assignments/create/review/QuestionGrid.tsx`: `onMove` turns the hook on (`count` 0 without it); the tile's label and the pill's aria-label read the live slot; the arrival animation's delay is pinned to the index the tile arrived at so a move never replays it. `DifficultyStep` passes `onMove`; `ReviewAssignment` answers it by dispatching the reordered draft (`draft/set`), so the create screen shows the new order too.
- `lib/review.ts`: `draftKey` sorts the id+text pairs before hashing, so the review's decisions (labels, answers, the step) survive a reorder; the recommendations grid follows the draft's order.
- `app/teacher/whole-class/WholeClassSetup.tsx`: an `order` of every problem id in assignment order; `ordered` is that filtered to the ticked; the example cards (wrapped in a `div` each with the item props, `data-wc-slot`) drag in a column; a move re-sequences the ticked ids in `order` and leaves the unticked in their places (an unticked problem comes back where it was); the column carries `data-wc-order`; `wc/setup` already takes `ordered`, so the board's slides follow. The problem list is untouched.
- `app/globals.css`: `[data-drag="held"] > *` lift shadow, grabbing cursor; reduced motion drops the slide transition.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] Create: a short click on a tile edits it and moves nothing; a press held on Q4 and glided to Q2's slot lifts it (held, cursor grabbing, not opened for editing), slides Q2 and Q3 right with their labels renumbered live, no tile changes size or column; on release Q4 is second, labels Q1…Q11, the stored draft has the order, no undo line, the moved tile is not in edit and the tile clicked earlier still is
- [x] Create: a press that moves before the hold never lifts; a hold on the ghost lifts nothing; a tile dropped over the ghost lands tenth with the ghost still last; Escape mid-drag drops the tile back
- [x] Create: a hold that starts in the focused tile's text box still moves the tile, keeps it in edit, selects no text; Alt+→ and Alt+↓ move the edited tile and the live region reads the move; a reload shows the same order
- [x] Review: the difficulty grid drags the same way with live labels; a relabelled Q1 dragged to third keeps its label, the review keeps its key and the draft stores the order; still on the difficulty step; Back shows the create screen in that order
- [x] Class review setup: the list ranks by struggle while the cards stand in assignment order; the third card held and glided onto the first becomes first, the two slid cards stacking under the held card's box with the column's gap and no overlap, no card resizing; a hold on a card's control lifts nothing; unticking and re-ticking keeps the place; a fourth ticked problem joins; Project sends the cards' order to the board
- [x] The 1280 laptop: a hold-drag from second to fifth lands there and nothing resizes
- [x] vitest (450), eslint, tsc, `next build`, headless run (`reorder150.mjs`, 46 checks, twice)
