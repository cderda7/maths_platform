# 202: The board's class review shows no student counts

**What to build:** On the smartboard's class review slide, remove the "13/19 students" count from each example's corner. The teacher's laptop setup keeps its counts.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "in class review, the board projects 13/19 5/19 1/19 for how many students submitted that strat. take that away. keep it in the teacher laptop view, but remove from the board".

## Solution

- `lib/examples.ts`: `BoardExample` is `{ letter, lines }`; `boardExamples` no longer counts candidates per mistake. The board's view model has nothing to count with, the same way it has nothing that names a student.
- `app/board/SmartBoard.tsx`: `Slide` passes no `corner` to `ExampleColumns`, so each card's header is the letter alone.
- The laptop's counts are untouched: `/teacher/whole-class` reads them from `optionsFor` (the example picker's slot pill and menu, "n/m struggled" in the problem list).
- Doc comments in `components/ExampleColumns.tsx` and `lib/frozen.ts` updated; `lib/examples.test.ts` and `lib/board.test.ts` assert the board examples' keys are exactly `letter` and `lines`.

## Acceptance

- [x] Board at 1440×810, Q2 unmarked and marked, then Q7: three columns, no `[data-count]`, no "n/m students" text, each header the letter alone, first boxes level, lines at the full 21 px, no overflow
- [x] Student frozen screen still tags "your approach"
- [x] Laptop setup still shows each example's count (13, 5, 1, ...) and "n/m struggled"
- [x] vitest 569, eslint, next build; click-through `counts202.mjs` (11 checks)
