# 327: Where students are: no "nobody yet"; a pill's time says "here" or "took"

**What to build:** on the Mistakes tab's Where students are column (ticket 315), an empty row is blank beside its label, and each pill's time says which time it is: "3 min here" (how long the student has been in the row) while working, "took 7 min" (check-in to hand-in) once handed in.

**Blocked by:** 315.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Carson, 2026-09-15, over a screenshot of the column 90 minutes after the set went live (every Handed in pill reading 89–91 min, Jordan on Q8 89 min, "nobody yet" in ten rows):

- "take away the nobody yet tag, whether it's for a past or future Q. just distracting."
- "student time should say how long it took them to complete, rather than a count of how long it's been since the assignment being released / since they've moved on from warm up & actually started the assignment"

Asked and answered:

- A hand-in's time counts **from the check-in to the hand-in** (not from Q1).
- A student still working shows the **time on the current question** ("but how can we make it clear it's time on current question & not time overall?"). Of three ways to label it (words "3 min on Q8", short words "3 min here", a clock icon with a key), Carson chose **short words**: "3 min here" in a row, "took 7 min" once handed in.

## Acceptance

- [x] No "nobody yet" anywhere on the column: an empty row (past or future question, Warm-up, a folded range such as "Q4–Q10") shows its label and a blank cell at its usual height; Chloe still reads "absent" under Handed in
- [x] A pill in any row but Handed in reads "N s here" / "N min here": the time since the student came into that row, so a hint or a practice step inside a question does not restart it; a new row starts it again. It ticks, its figures in a fixed slot so the pill never changes width
- [x] A Handed in pill reads "took N s" / "took N min": from the student's check-in to their hand-in, fixed as the clock runs on (90 minutes after the set went live, the class reads their own 4–7 min, not 90)
- [x] Sam's check-in time is recorded in his session as he reaches the check-in (from the goal screen, or from the overview when the set has no goal); a hand-in with no known check-in shows no time
- [x] vitest, eslint, tsc, next build; click-through at 1280×800 and 1440×900 against a production build with Sam's iPad tab and the teacher tab, screenshots checked

## Solution

- `lib/session.ts`: `checkInAt` (0 unknown), set by `overview/start` (no goal) and `goal/continue` from the action's `at`; `app/student/StudentApp.tsx` passes `Date.now()`.
- `lib/whereStudents.ts`: `stepTime` becomes `duration` (the same "40 s" / "6 min"); `WherePill.time` is a `PillTime` `{kind: "here" | "took", span}`; `checkIns(set, session, now)` gives each student's check-in (a classmate who starts, at the stream's start, where their timeline opens on the check-in; Sam from his session); `whereRows(…, checkedIn)` reads "here" from the row entry and "took" from `since − checkIn` on a hand-in.
- `app/teacher/WhereStudentsAre.tsx`: `useWhereRows` passes `checkIns`; `StudentPill` draws "here" with its figures in the 46 px slot and "took" as plain text; `PlaceTable` drops "nobody yet" from rows and folded ranges.
