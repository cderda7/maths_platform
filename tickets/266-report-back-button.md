# 266: The student report's way back to Class View is the same purple button as "← Edexia Classroom"

**What to build:** User 2026-09-14, on a screenshot of Tomas Reyes' report: "put ← CLASS VIEW in top left, & have it dark purple with white text. same as ← EDEXIA CLASSROOM in class view page". The report's "← Class view" was a plain accent link at the right end of the name row.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Solution

- `BackButton` (href + label) in `app/teacher/AssignmentContext.tsx`: the ticket-200 dark purple box, white text; `BackToClassroom` is now `BackButton` to the Classroom.
- The report renders `← Class view` as a `BackButton` above its eyebrow. The report sits at 125% of the teacher side (`REPORT_ZOOM`), so the button's wrapper zooms back by `TEACHER_ZOOM / REPORT_ZOOM` and rises 12 px (the extra top padding at that zoom): on screen it is the Class View's button to the pixel, in size, colour, and distance under the bar. The eyebrow sits the same 11.5 px below it as on Class View.
- The name row loses its `mt-3` beneath the eyebrow (the H1's tall line box keeps the air) so the new row costs the page ~15 px instead of ~35.
- A report opened from a later set's history (`back`, ticket 237) keeps its pulsing Return button and no Class view button, unchanged.

## Acceptance

- [x] "← Class view" top left, same height (23.2 px), background `rgb(47, 36, 145)`, white text and distance under the bar (34.56 px) as "← Edexia Classroom" at 1280×800 and 1440×900
- [x] The right-hand link is gone; a press lands on `/teacher/a/<set>/class`
- [x] Every student's report on PS1–PS5 at 1280×800 fits without scrolling, except Ethan on PS4 (below)
- [x] vitest 801, eslint, tsc, next build, check:laptop 62

**Known:** Ethan on PS4 at 1280×800 (six commentary lines) now scrolls 10 px into the page's empty bottom padding; all content stays in view. Ticket 244 (in flight) makes the skills card fill the page's height, which reworks this page's vertical fit; recorded in FUTURE_FEATURES.
