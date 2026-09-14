# 267: Every back button sits where the report's "← Class view" is

**What to build:** User 2026-09-14, on screenshots of Class View and Sam's report side by side: "i don't like how the <- for Class View & Edexia Classroom arent' in the same place. move Edexia Classroom so it's further left, same position as where Class View is." Asked whether the logo, title and table should move too: "Just the button".

**Blocked by:** 266.

**Status:** done

**Triage:** `ready-for-agent`

---

## Solution

- Class View and the other 0.72-zoom pages centre a 1640 px column, so "← Edexia Classroom" started wherever that column did (66 px in at 1280 wide, 387 px at 1920); the report, zoomed 0.9, starts at 21.6 px until the window passes 1476 px.
- `BackButton` (`app/teacher/AssignmentContext.tsx`) takes a left margin, `BACK_LEFT`, that cancels its column's start and puts it 21.6 screen px from the window's left edge. It is plain CSS (`calc` over `100vw`, `--frame-zoom`, `--back-zoom`), so it is right on first paint and on resize. `TeacherChrome` sets both variables to its zoom; the report's zoomed-back wrapper sets `--back-zoom` to its own 0.72.
- Every `BackToClassroom` (Class View, Mistakes, Groups, the class's groups, Create, Create review, a set not yet created) and the report's "← Class view" share it. The logo, eyebrow, title and table stay where they are.

## Acceptance

- [x] At 1000, 1280, 1440 and 1920 wide: the back button's left edge is 21.6 px on the report and on all eight other pages, same height (23.2) and top (34.55)
- [x] No horizontal scroll; check:laptop 62
- [x] vitest 802, eslint, tsc, next build
