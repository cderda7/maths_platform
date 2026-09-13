# 227: Both reports show every skill; the key moves; the teacher's report at 125%

**What to build:** The student's "Your report" shows the full dot view (every group with its skills beneath) from the start, with no group to open or close, and its dot key sits in the right-hand column above Reflection. The teacher's student report shows the whole page at 125% of the teacher side's size.

**Blocked by:** 225 (the student's key), 169 (the teacher's fixed full view).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), on screenshots of both reports: "move the key to the blank space above reflection. also open full dot view automatically, & don't have collapse/expand functionality for the student. (rn you just show groups -- want full granularity) here also change teacher view of student report to this view -- 125% view compared to current."

## Solution

- `app/student/screens/ReportScreen.tsx`: `SkillColumns mode="expanded" locked student`, the teacher's report's mode with student-facing names; `StatusKey` under a "Key" eyebrow at the top of the reflection column, whose top lines up with the page eyebrow; Reflection keeps `mt-auto` at the bottom.
- `app/teacher/TeacherChrome.tsx`: `TEACHER_ZOOM` (0.72) exported, and a `zoom` prop that sets the frame's zoom (bar included, as browser zoom would, so the bar and the page stay aligned).
- `app/teacher/report/TeacherReport.tsx`: `zoom={TEACHER_ZOOM * 1.25}` (0.9).
- `components/HierarchyDrill.tsx`: with every skill out the columns are narrow, and `fitLabels` broke names badly ("sketching / a / parabola", "zero- / finding"). It now counts the node's own padding (`NODE_PAD`), wraps at 10.5 only when every name takes two lines at most, and never lets a word be wider than its line (`lineCount`); otherwise 9.
- `components/fitLabels.test.ts`: the three rules.

## Acceptance

- [x] Student at 1440 × 900 and 1280 × 800, default and strong runs: one key, in the reflection column above Reflection, not in the Skills card, same text as the teacher's; the column doesn't scroll and Send stays in view; expanded and locked, no group toggles, every skill shown; clicking a group row changes nothing; every name inside its column, no word split across lines, nothing clipped; no horizontal scroll, no difficulty tag
- [x] Teacher report (Zara, Mia) at both sizes: root zoom 0.9, rendered at 0.9; no horizontal scroll; names as above. Class view still 0.72 (`click227.mjs`, 39 checks)
- [x] check:laptop 30, vitest 654, eslint, tsc, next build
