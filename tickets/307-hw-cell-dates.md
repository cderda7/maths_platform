# 307: Homework cells on Sam's Classroom show their due and submitted dates, not a note

**What to build:** the missed homework's cell drops the "problems added to next HW" note and reads the caution triangle, "HW2 missing" and its due date. The completed cell reads "HW1 completed", its due date and the day it was handed in. A cell shows "submitted …" only when the homework was handed in.

**Blocked by:** 306 (the missed cell's dark red border).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15), on Sam's Classroom: "take away the 'problems added to next HW' tag. just have the caution traingle & 'HW2 missing'. also add due date & submission date (or just due date if missing)".

## Decisions (asked 2026-09-15)

- Dates on both cells, not only HW2's (the user picked "Both boxes").

## Solution

- `lib/homeworks.ts`: `HomeworkColumnPiece` gains `submitted` (the record's `finishedOn`, null while undone). `MISSED_NOTE` and `MISSED_NOTE_CURRENT` removed.
- `lib/homeworkList.ts`: `missedNote` removed; the carry-over (`missedBefore`, `leftovers`, `carryOver`) is unchanged.
- `app/student/StudentClassroom.tsx`: missed cell "HW2 missing", completed cell "HW1 completed", each with "due …" and, when handed in, "submitted …" beneath (12.5 px, muted, one line each, left edge with the title's). The Classroom's bottom padding is now the homework screen's (`pb-20`): the last Completed card and HW1's cell cleared SKIP TO by 6 px when scrolled to the end, now by 44.
- Tests: `lib/homeworks.test.ts` holds `submitted` on the demo column and a late hand-in (missed, with its date); the note assertions in `homeworkGate`, `homeworkSkips` and `homeworkList` tests removed, their other checks kept.

## Verification

- eslint, vitest 1134, next build.
- Click-through `click307.mjs` 40/40 at 1280x800 and 1440x900, fresh and after the presenter's "homework open" skip (when the note used to switch to "current HW"): HW2 reads "HW2 missing" with "due Mon 7 Sep" and no submitted date, dark red border kept; HW1 reads "HW1 completed", "due Tue 1 Sep", "submitted Mon 31 Aug"; no "problems added" anywhere on the page; each cell's contents inside it, centred, dates on one line and aligned with the title; cells one width; nothing scrolls sideways. Screenshot checked. `clear307.mjs`: scrolled to the end, the last card's bottom 44 px above SKIP TO.
