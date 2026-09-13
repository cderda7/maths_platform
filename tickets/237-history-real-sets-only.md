# 237: History shows only real earlier sets, and a pill opens that set's report

**What to build:** On a set's Class View, a student's history stacks show only the earlier sets that assessed the category, with no simulated pills. Each pill reads its day alone ("MON 7 SEP"). The class's first set has no "see history" button. A pill opens the student's report on that earlier set inside this set's Class View, with a pulsing "← Return to PSet N" button that goes back to the history.

**Blocked by:** 215.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), with a screenshot of Problem Set 6's Graphing stack (TUE 18 AUG, THU 20 AUG, MON 24 AUG, PS4 · FRI 4 SEP, PS5 · MON 7 SEP): "in PSet 6, only show 7 Sep instead of the message it currently shows. ALSO they should only show history for prev assignments. so for instance with PSet 5, i have 4 prev history from psets1-4. pset 1 disable the show history button -- just don't even have it. also, clicking on the cell takes me to the prev assignment. instead, simply open the student report from that assignment -- NOT taking me to that other pset page. then have a RETURN TO PSET 6 button that continuously pulses to direct teacher's attention to how to exit that view & go back to where they were"

The user's answers to two questions:
- Pill label: **"MON 7 SEP"** (the weekday stays and the set name goes).
- Which sets: **only the sets that assessed the category.** Set 6's Graphing shows 2 pills and Set 5's shows 1. A category that no earlier set assessed opens nothing.

## Solution

- `lib/history.ts`: the simulation is removed (`simulatedWalk`, `simulatedDates`, `formatDay`, `ALL_SECURE_STUDENT`, `shortSetName`). `historyWith(earlier)` returns the last five real results. `HistoryPoint.set` is always set. `pillLabel` is the day alone. `psetName` turns "Problem Set 6 — …" into "PSet 6".
- `lib/setHistory.ts`: `categoryHistory(id, student, category)` now takes fewer arguments. New: `hasEarlierSets(id)`, `historyReportHref` (`/teacher/a/<set>/class?report=<earlier>&student=&open=`), `historyReturnHref` (`?history=&open=`) and `earlierReportSet` (the report is shown only for a finished set before this one that the student sat). `historyPillHref` is gone.
- `app/teacher/a/[id]/class/page.tsx` → `app/teacher/ClassView.tsx`: shows the roster, or `EarlierReport` when `?report=` is valid.
- `app/teacher/report/EarlierReport.tsx`: uses this set's chrome at the report's zoom (this set's tabs, with Class current). Inside it, an `AssignmentContext` for the earlier set holds `ReportBody`.
- `app/teacher/report/TeacherReport.tsx`: split into `TeacherReport` (chrome plus body) and `ReportBody`. With `back`, the body shows a pulsing (`pulse-loop`) "← Return to PSet N" above the eyebrow and no "← Class view".
- `app/teacher/TeacherLive.tsx`: "see history" appears only when `hasEarlierSets`. In history mode, a category pill with no earlier results opens nothing (`data-history-count=0`). The sheet rises for the tallest open stack. Each stack sits on today's pill at the tallest stack's even spacing, so a stack of 2 lines up with the newest 2 of a stack of 5. Pills link to the report.

## Acceptance

- [x] Unit (`lib/history.test.ts`, `lib/setHistory.test.ts`, `lib/renamedSets.test.ts`):
  - no made-up points
  - fewer than five stay fewer, and none stays none
  - every registered set's pills are exactly the earlier sets that assessed the category
  - Set 6 Graphing reads Fri 4 Sep and Mon 7 Sep
  - Set 5 has at most 4 pills, and its Graphing has 1
  - the first set has no history
  - `earlierReportSet` accepts only an earlier finished set the student sat
  - no jumps across every set × student × category
- [x] Click-through `click237.mjs` (70 checks at 1280×800 and 1440×900):
  - Set 6: 20 "see history" buttons; Mia's Graphing has 2 pills reading "Fri 4 Sep" and "Mon 7 Sep" with no "PS", spaced evenly down to today's pill
  - Set 6 beside a stack of 5: the 2 line up with its newest 2, nothing overlaps, and the oldest pill sits under the sheet's top
  - the pill's link opens Mia's Set 4 report on Set 6's route, with Set 6's tabs and Class current
  - the report page: "← Return to PSet 6" pulses forever (`pulse-loop`, infinite) in view, there is no "Class view" link and no roster, and no sideways scroll
  - Return reopens Mia's history with Graphing standing, and the query is dropped
  - Sam's Set 5 report works; Set 4 refuses a later set's report
  - Set 5: at most 4 pills, and Graphing shows 1 ("Fri 4 Sep")
  - Set 4: a category with no earlier set opens no stack
  - Set 1: no "see history", two row buttons, no sideways scroll
- [x] vitest 751, eslint, tsc, next build, check:laptop 62
