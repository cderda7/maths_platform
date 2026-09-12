# 138: Students with identical working share one column on the mistake view

**What to build:** On the mistake view, students whose working is the same line for line are one column, not one column each: the work is written once and every one of those students' headers sits over it. Inside a slip pill (and inside ticket 135's exact-mistake box) students are reordered so those with identical working sit together. A problem twelve students got wrong in three ways takes three columns, so Q7 and Q9 no longer scroll sideways.

**Blocked by:** 130, 135.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with crops of Q7 (thirteen columns, scrolling) and Q9 (Ethan's and Harper's columns showing the same three lines, Zara's and Ruby's the same four, Zara and Ruby split up): "this is how we'll resolve the 'horizontal scroll' for 7 & 12 student mistake questions. so if students share EXACT same work, don't write each of their work individually. write it ONCE & group them together & only write the work once, but make it clear that both students are a part of that work — both student headers over that work. reorder students so that eg ZH & RC aren't split up, but forced to be grouped."

## Solution

- `lib/mistakes.ts`: `WorkColumn { lines, rows, live }` and `groupByWork(rows)` partition students by `workKey` (every line's TeX joined, in order): columns in order of first appearance, students in their original order within one, `live` if any member is. Each `MistakeGroup` (ticket 135) carries its `columns`, each `SlipGroup` its `columns` (the mistake groups' concatenated) and both groups' `start` now counts columns, not students; the flat `rows` follow the columns.
- `app/teacher/mistakes/TeacherMistakes.tsx`: the grid has one column per `WorkColumn`. The header cell is one button per column whose students' name chips wrap (`flex-wrap`, each chip `whitespace-nowrap`, `data-row` per student, `data-column` on the cell); the slip pill spans its group's columns; the working row is one cell per column (`data-expanded` names every student in it), the "As handed in · Original vs final" footer under a column the live student is in; ticket 135's box spans the mistake group's columns.
- Tests: `lib/mistakes.test.ts` (`groupByWork`, the pill's column count, Q9 three columns, Q7 four / six / two and seven / four / two with Sam live, Q5's trio).
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] Q9 shows three columns (Zara + Ruby, Ethan + Harper, Mia); Q7 three without the live student, Sam heading the seven-strong two-terms column with it; Q5 Tomas then Harper + Ruby + Finn
- [x] No problem scrolls sideways at 1800 or 1280 px, open or closed; every name chip lies inside its column; the first name in every column sits on one line; every pill spans exactly its columns
- [x] The compare footer appears once, under the column Sam is in
- [x] vitest, eslint, tsc, `next build`, headless click-through (`columns.mjs`) with crops
