# 320: The teacher's split during class review

**What to build:** the Mistakes tab keeps its split during class review, with no column headers. On the left, a read-only row per example the teacher picked, grouped under its question in set order, and a row of the remaining questions along the bottom under "Add to class review?". On the right, the question on the board, its mistakes, and, while the class works Q**, their lines as they come in.

**Blocked by:** 319 (on main), 344 (pair mode: the three steps and the class review state this reads).

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

Tickets 315, 318 and 319 give the teacher a live view beside the mistakes while the class works, reviews alone and reviews in groups. Class review had none. The user (2026-09-15/16) settled it from the mockup (https://claude.ai/artifact/N1Re9v4zXLmyrnLHhJK1CU, the last frame):

- "class review still have split just for consistent visual experience, do rows per example but have it be minimal UI, like simple"
- "can remove the headers for class review — both 'where the class is' & 'where students went wrong'. doesnt really make sense here"
- "do problems in order — if 2, 4, 7 selected, do it 2, 4, 7"
- "nah rows read only"
- "but add all other question tiles in row taking up bottom of screen. header for that: 'Add to class review?'"

## Acceptance

- [ ] During class review, `/teacher/a/pset-6/mistakes` keeps the split (`StageSplit`) with **no column header over either side**; the stage pills stay in the shared line ticket 334 added (`app/teacher/BackLine.tsx`)
- [ ] **Left, steps 1 and 2 (examples, worked example):** one row per chosen example, grouped under its question with the question's label, questions in the set's own order whatever order the teacher picked or reordered them in. Each row names the example (the correct working, or the misconception it shows) and how many students wrote it. The example on the board is marked as on the board, ones already shown are muted. Nothing on the left is pressable
- [ ] **Left, step 3 (the class works Q**):** the same rows stay, and above them the class's progress: how many students have finished, and who is still writing, as student pills (reuse ticket 315's pill), plus the teacher's control from ticket 344 with its five-second countdown. No student's lines on the left
- [ ] **Bottom of the left column:** a row of tiles, one per question not in the class review, under "Add to class review?", in set order. Pressing a tile adds that question to the end of the review: its group appears in the left column with its examples (the same defaults setup would suggest) and the tile leaves the row. Adding is idempotent and survives a reload; every tab agrees
- [ ] **Right:** the question on the board, its first-submission mistake cards as the Mistakes tab draws them, with the example on the board outlined. While the class works Q**, the wrong lines students write on Q** come in as cards grouped by misconception (`groupBySlip`), newest first
- [ ] The board never shows any of these counts (ticket 202); they are on the laptop only
- [ ] Once class review ends, the Mistakes tab reads as it does for a finished set
- [ ] The demo: classmates work Q** over the stage the way ticket 314's story works during the set (each student's Q** lines follow their own record's slips, never a slip they never made); Sam's come from his session
- [ ] Nothing scrolls sideways at 1280×800 or 1440×900, and the left column fits with every question in the review
- [ ] vitest, eslint, tsc, next build, check:laptop; click-through at 1280×800 and 1440×900 with Sam's iPad, the board and the teacher tab: all three steps of two questions, adding a question from the bottom row, the countdown, live pills, a reload in each step
- [ ] Ticket docs: `architecture/320.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES

## Notes

- Read tickets 315, 318 and 319 and their architecture notes first: `app/teacher/StageSplit.tsx`, `WhereStudentsAre.tsx`, `WhereGroupsAre.tsx`, `lib/whereStudents.ts`, `lib/groupGrid.ts`, and how each stage switches in `TeacherMistakes.tsx`.
- Ticket 337 (another session) will mark questions moved out of group review; leave room for a "from group review" mark on a question group.
