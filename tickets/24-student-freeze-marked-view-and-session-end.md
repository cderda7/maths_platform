# 24: Student freeze, marked view and session end

**What to build:** The full two-tab lesson. Pressing Project starts the universal one-minute grace; when it ends every student tab is frozen wherever it was: no buttons, pads or menus respond, a one-line banner explains the lock. The frozen screen follows the board's current slide and shows the student's own work for that problem: ink plus transcription, both versions stacked when a rework exists, or the statement with a "not attempted yet" note. While the board is unmarked the student's transcription carries no marks. The board gains "Show marks", switching the slide to the marked view: red on steps that didn't hold and blue on curated standouts, marks only, no text, counts still shown; at the same moment each student's own work shows its red and blue. Next from marked opens the next problem unmarked; previous steps back one view. End releases every student to the report and reflection screen. The freeze persists if the board tab is closed; the live view shows "Students are frozen · End session" while active and the assignment reads as in whole-class review, then complete.

**Blocked by:** 23 (Whole-class setup and the unmarked board).

**Status:** done

- [x] Project writes a whole-class-start pending advance; on deadline the student reducer enters `frozen`; idempotent
- [x] Session position is (slide, view) with view `unmarked | marked`; Show marks, next and previous step it as specified; classroom reducer tested
- [x] Board marked view adds red and blue layers to examples, marks only; standout entries authored for classmate examples where a step deserves one
- [x] Pure frozen view model: follows the current slide; version stacking; not-attempted case; marks only while the board is marked; tested
- [x] Frozen screen renders no interactive elements; diagnostics are not delivered while frozen; in-progress work kept as-is
- [x] End releases students to `report`; live view banner with End while active; freeze survives a closed board tab
- [x] Assignment status "in whole-class review" then "complete" on the teacher side
- [x] Build, lint, type-check, vitest pass; headless two-tab: project, countdown, freeze, follow slides, show marks, end
- [x] Architecture note written and folded into `ARCHITECTURE.md`
