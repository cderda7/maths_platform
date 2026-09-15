# 319: Where students are during group review: a grid of questions by group

**What to build:** during group review the set's Mistakes tab keeps ticket 315's split.

- **Left, Where groups are.** A grid with a row per question and a column per group taking part.
  - Each cell's colour says where that group is on that question.
  - The cell the group is on now has a ring in the group's colour, with the pen-holder's avatar inside.
- **Right, Where groups went wrong.** The mistake cards counting groups.

**Blocked by:** 332 (group review works what is still wrong after individual review, with every group's turns simulated), 318.

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

Designed with Carson on 2026-09-15 in the 318/319 grilling session. The agreed mockup is https://claude.ai/artifact/UX9eWozokBpAt3PUXn945x, version 3, group review frame; read it with the Artifact tool's `read` action. Carson: "for group review, a little different. still have rows be Qs. have each column be a group, forming a grid. we'll display the ones they already got right in light blue. one's they havent' reviewed yet as group blank. one's they get correct as they work throguh it turn green. one's they get incorrect as they work trhoguh it turn red, signalling that they'll return back to that one."

Settled:

- **Headings.** "Where groups are" and "Where groups went wrong".
- **Columns.** One per group taking part, headed by the group's chip in its colour and a progress count "n/m", with no member avatars.
  - A group whose union is empty sits out group review (ticket 332). It gets no column: five groups with one sitting out shows four.
  - A finished group's chip is filled in its colour, with no fade.
- **Rows.** Q1 … Q10 in set order.
- **Cells.**
  - **Light blue** (`standout-soft`): not in the group's queue, because every present member has it right after individual review.
  - **Blank:** in the queue, not reached.
  - **Green** (`solid`): solved.
  - **Red** (`wrong`): left for now after the third wrong check. The group comes back to it.
  - **Dark red** (`wrong-deep`) with a white ✕: unsolved after the return visit.
  - **The cell being worked on now:** a ring in the group's colour with the pen-holder's avatar inside. There are no dots for wrong checks, and a first wrong check leaves the cell blank.
- **A question moved to class review** (ticket 337): the whole row is grey (`covered-soft`) across every group, with a small "class review" label once in the row.
- **Progress "n/m".** Problems closed (solved or unsolved) out of the group's queue. A red problem counts only once its whole process has concluded after the return visit.
- **Right.** The same mistake cards as individual review, counting groups: "2 groups solved · 1 left for now · 1 unsolved · 1 still to go", over groups whose queue has that problem.
  - Under the misconception label, the chips of the groups still to go, never student names.
  - A card every group has solved shrinks in place to a thin "Q4 · every group solved" line.
  - Whole questions, never truncated.
- **Landing.** The teacher lands on Mistakes during group review, as in individual review (ticket 318).
- **Class tab.** The live group cards (`GroupProgressCard`) stay on the Class tab.
- **After the stage.** Once group review is finished but still current, the grid stays in its final state with no extra text. The stage pill's "finished" state is ticket 334's.
- **Pressing a cell.** Opening that group's attempts on a problem is deferred (FUTURE_FEATURES).
- **Demo outcomes** come from ticket 332's regenerated data. Carson asked for:
  - a question per group nobody at the table can do
  - sky Q9 left for now then solved on the return
  - somewhere, a question left for now then unsolved
  - a groupmate who had it right (first time or fixed in individual review) gets the group there in 1–2 tries, never red

## Acceptance

Written in ticket 315's shape when this ticket is picked up, from the settled design above and the mockup.
