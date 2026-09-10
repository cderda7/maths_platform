# 33: Demo "skip to" strip on the student page

**What to build:** A presenter control, not a product feature: a dashed-border strip pinned bottom-left of the student page (the same treatment as "Reset demo") with buttons that jump the demo to a moment in Sam's run. What Sam submitted is invariant across every jump.

**Blocked by:** 32 (review with correction), 24 (freeze and whole-class), 18 (pathways).

**Status:** done

**Triage:** `ready-for-agent`

---

## Solution

`skipFixture(target, now)` in `lib/demo.ts` is pure: it rebuilds the classroom with the full three-stage pathway (individual · group · whole-class) and no whole-class session, then installs the scripted session for the target. Targets, in run order: start (a fresh run) · warm-up (the chooser) · working (Q1) · indiv review · group review · whole-class review · report. The whole-class jump does the teacher's setup from the reworked run (the two most-struggled problems, suggested examples) and projects with the grace already over, so the student is frozen at once and the teacher's board shows the projection if open. The strip applies the fixture through the two stores.

## Acceptance

- [x] Dashed strip bottom-left on `/student`, seven targets
- [x] Every target lands on its stage; Sam's submitted lines identical across review stages
- [x] Whole-class jump projects two problems with examples, no countdown
- [x] Unit tests for the fixtures; CDP click-through of every button
- [x] Architecture note, `ARCHITECTURE.md`
