# 346: The rows stay on screen while the cards scroll

**What to build:** on the teacher's Mistakes tab, the split's left column (the rows, its header included) stays on screen while the right column's mistake cards scroll, during individual working, individual review and group review.

**Blocked by:** 315, 318, 319.

**Status:** done

---

## Problem Statement

The user (2026-09-16): "ALSO want to continue seeing the group table as i scroll through the mistakes. have the functionality where it's like 'fixed' on the screen as i scroll. same deal for ALL other settings -- indiv working, indiv review, group review. class review is still being adjusted, so fine to skip that one for now."

The teacher reads a card against the rows beside it: which groups still have this question, who has it open, who is still to fix it. The cards run past a screenful, so scrolling to the fourth card used to leave the rows behind and the reading had to be done from memory.

## What it does

- The left column sticks inside the teacher frame's scroll region (`[data-teacher-scroll]`), so the rows and their header stay in view while the cards scroll under them. Nothing about the page at rest changes.
- It applies to the three stages that have rows: individual working (315), individual review (318) and group review (319). **Class review (320, 344) is named out in `TeacherMistakes`, not left to the `split` flag, so its rows keep the plain split until they are settled.**
- A column that fits the region rests `STICKY_TOP` (16 layout px) below the region's top edge. A column taller than the region takes a negative top instead: it scrolls up with the page until its foot is `STICKY_FOOT` (12 px) above the region's, and sticks from there, so every row can still be reached.
- The fit rules read the column's foot where the column comes to rest (`splitFoot`), not against the scroll region: measured the old way, `scrollTop` would grow as the teacher scrolled and fold ticket 315's question rows away, or shorten ticket 318's pills, mid-scroll.
- The live diagnostic's steps and a student's work panel are drawn inside the left column, so they ride with it and still cover the rows and never the cards.

## Acceptance

- [x] `/teacher/a/live/mistakes` during individual working, individual review and group review, at 1280 × 800 and 1440 × 900: scrolling the cards to the bottom leaves the left column's rect unchanged, and its header stays in view.
- [x] The right column really scrolls: its last card is reachable and the first card leaves the top.
- [x] Nothing moves at rest: the page's rects before scrolling match a build without the change (the first still frame is unchanged).
- [x] No sideways scroll at either size, in any of the three stages.
- [x] Scrolling to the foot and back does not fold a question row (315), shorten a pill (318) or change the grid (319).
- [x] A column taller than the region (individual working with the whole class at the first seconds) can still be scrolled to its last row.
- [x] The diagnostic overlay lands exactly over the left column while it is stuck, and never over a card.
- [x] Class review's split is untouched.
- [x] `lib/stickyColumn.test.ts`; eslint, tsc, vitest, `next build`, `check:laptop`, `sweep:hint-boxes`.
