# 63: Mistakes view: one pill spans the students who slipped on the same step; the header keeps only the difficulty tag, at the far right

**What to build:** On `/teacher/mistakes`, students who got the same step wrong on a problem sit next to each other and share one pill that spans all their columns, the text left-aligned at its usual size. The problem header loses the "N students" count and the leaf chips; the difficulty tag moves from beside the label to the far right, where the count and chips were.

**Blocked by:** 62 (the side-by-side layout)

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with four screenshots of the ticket-62 view: "group them if it's a shared skill. eg here want 'graph features' to be a pill spanning HS, RC, & FD — have the text be that same size, & have it left aligned in the pill. same deal here — one pill spanning all 4. remove this additional label & the number of students. move the problem tag to the far right, where '4 students graph features' is currently."

With a pill per student, four identical "quadratic equations" pills in a row said nothing the header's chips did not, and the header said it twice more.

## Solution

`groupBySlip` in `lib/mistakes.ts` orders a problem's students so those with the same distinct slipped leaves are adjacent (groups in order of first appearance, students in fixture order within a group) and returns each group with its start index. `TeacherMistakes` lays the columns out as one explicit CSS grid (`repeat(n, minmax(230px, 1fr))`): row one holds the student tiles, row two one cell per group spanning its columns with a `SlipChip` stretched across it (`flex-1 justify-start`, so the text stays 11.5px and left-aligned), and row three, when the problem is open, the working per column. Column dividers are left borders on the tiles and panels and on a group's first column, so the divider line breaks only where a pill crosses it. The header is label, equation, and `DifficultyTag` pushed to the right edge; the count and `LeafChip`s are gone, and the mistakes view no longer imports `LeafChip`.

## Acceptance

- [x] Q5 shows Tomas alone under "quadratic equations" and Harper, Ruby and Finn under one "graph features" pill spanning their three columns; Q4 shows one pill across all four students
- [x] The spanning pill's text is 11.5px, left-aligned, starting under the student's name like a single pill does
- [x] No "N students" text and no leaf chips in any problem header; the difficulty tag sits at the header's right edge
- [x] Clicking any student still opens every column's working; red lines and the compare link unchanged
- [x] `groupBySlip` has a vitest case; eslint, tsc, vitest, `next build` pass
- [x] Architecture note and `ARCHITECTURE.md` row
