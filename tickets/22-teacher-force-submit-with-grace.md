# 22: Teacher force submit with one-minute grace

**What to build:** From the live class view during 1st submit, the teacher taps "Hand in for everyone", confirms against a count of students still working, and a pending advance with a deadline one minute ahead is written to the classroom store. Every student tab shows a countdown banner ("Your teacher is moving the class on in 1:00"). When it reaches zero the student's work is handed in as it stands, unattempted problems recorded as not attempted, a one-time notice explains the jump, and the pathway continues. A student mid-rework with a tripped guard sees the banner and restore action for the whole minute; the forced hand-in is not blocked by the guard. Applying the advance is idempotent across tabs and reloads. The same pending-advance mechanism is what ticket 24 reuses for starting whole-class review.

**Blocked by:** 21 (Detective feedback and the guard).

**Status:** done

- [x] Classroom reducer: pending advance (kind, deadline); tested
- [x] Live view action with confirmation dialog showing how many students are still working; disabled once every student is past working
- [x] Student countdown banner driven by the deadline; ticks every second; universal, not only for students with a tripped guard
- [x] On deadline the student reducer applies a forced hand-in: not-attempted problems recorded, one-time notice, routing by pathway; idempotent
- [x] Forced hand-in bypasses the guard block; the guard banner and restore stay available during the grace
- [x] Session tests: forced hand-in, not-attempted recording, idempotence
- [x] Build, lint, type-check, vitest pass; headless two-tab: force, watch countdown, student lands on the next stage
- [x] Architecture note written and folded into `ARCHITECTURE.md`
