# 319: Where students are during group review: a grid of questions by group

**What to build:** during group review the set's Mistakes tab keeps ticket 315's split.

- **Left, Where groups are.** A grid with a row per question and a column per group taking part.
  - Each cell's colour says where that group is on that question.
  - The cell the group is on now has a ring in the group's colour, with the pen-holder's avatar inside.
- **Right, Where groups went wrong.** The mistake cards counting groups.

**Blocked by:** 332 (group review works what is still wrong after individual review, with every group's turns simulated), 318.

**Status:** done

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

- [x] On `/teacher/a/pset-6/mistakes` during group review, the split from ticket 315 under the pathway strip (ticket 334): **Where groups are** and **Where groups went wrong**, level
- [x] Opening the set during group review lands on Mistakes; individual working and individual review land as before, class review and a finished set on Class
- [x] Left: a grid, a row per question (Q1 … Q10, the label in the display face) and a column per group in group review, in seating order. A group sitting out has no column (five with one sitting out shows four)
- [x] Each column's head: the group's chip (its name in capitals, tinted in its colour with a border of it) and "n/m", the questions closed (solved, or unsolved after the return) out of its union. A question left for now counts only once its return has closed it. The chip fills in the group's colour once every question is closed; no member avatars
- [x] Each cell:
  - light blue: not in the group's union (everyone present has it right after individual review)
  - blank: in the union and not closed, a first or second wrong check included
  - green: solved
  - red: left for now after the third wrong check; on its return visit it stays red under the ring
  - dark red with a white ✕: unsolved after the return
  - the question on the board: an inset ring in the group's colour with the pen-holder's avatar inside; no dots
- [x] A question moved to class review is one grey band across the groups labelled "class review" (the grid takes the moved questions; ticket 337 supplies them, none today)
- [x] Coral and amber never show red; sky's Q9 goes red then green on its return; mint's Q10 red then ✕; the counts never go down as the boards play; the grid's size never changes
- [x] Right: a card for every question some group has in its union, in set order
  - its header counts the groups whose union has it: "2 solved · 1 left for now · 1 unsolved · 1 still to go", the parts at zero left out
  - under each wrong working's label and misconception, the chips of the groups still to go whose members wrote it; groups still to go only because their members left it unfinished or never reached it are chips on a line "unfinished or not attempted"; never a student's name
  - no Live diagnostic chip, no difficulty tag, whole questions, maths on one line
  - a card every group that had it has solved is a thin "Q4 · every group solved" line in its place ("fixed in individual review" for a first-submission mistake no group took on)
- [x] Once group review is finished but still the current stage, the split holds its final state with no extra text
- [x] The Class tab's group card is unchanged
- [x] Nothing scrolls sideways at 1280×800 or 1440×900; the grid fits the left column and the scroll region
- [x] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes; click-through at 1280×800 and 1440×900 with Sam's iPad and the teacher tab against a production build
- [x] Ticket docs: `architecture/319-where-groups-are.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES, README

## Solution

- **Model (`lib/groupGrid.ts`, pure).** `gridOf(groups, problems, movedToClass)` reads ticket 332's `groupsAt` once: per group, `runTimeline(run)` for each question's status, `penOf(group)` (out of `pensAt` in `lib/standings.ts`) for the pen and the question on the board. `toneOf` turns a timeline into a cell tone (a question on its return keeps red). `closed`/`total`/`done` for the head. `groupCounts(columns, problem)`, `countParts`, `everyGroupSolved` and `groupsNotSolved` for the cards. `gridAt(c, session, now, problems)` wraps it.
- **Grid (`app/teacher/WhereGroupsAre.tsx`).** `GroupGrid` draws the grid from the columns (fixed 52 px rows, a 132 px label column, the groups sharing the rest); `GroupChip` is the chip the head and the cards share.
- **Mistakes (`app/teacher/TeacherMistakes.tsx`).** The split also runs in group review: the grid on the left, the headers reading groups, the cards filtered to students in groups that have not solved the question, their names drawn as group chips, a footer of groups with nothing written, group counts in the header, the thin line from the counts.
- **Landing (`lib/assignments.ts`).** `landingFor` sends group review to Mistakes.
- **Chip widths (`FitGrid`).** A misconception chip's needed width is its text's own width plus padding and border (`pillNeeds`): a flex chip's `scrollWidth` left its end padding out, so a chip in a narrow column had its last word against its border.
