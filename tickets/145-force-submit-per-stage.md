# 145: "force submit" beside the Pathway card's current pill, for indiv working, indiv review and group review

**What to build:** The class view's **Force assignment submit** button leaves the title line and becomes **force submit**, directly to the right of the Pathway card's current pill, with the `N/20 done` count right under it. It exists for each of `indiv working`, `indiv review` and `group review`, one at a time: only the stage the class is on carries it. Each press starts the same one-minute grace on every student's screen, then the stage ends for everyone as it stands: the set handed in; the corrections handed in and the gate into group review opened; group review over. Class review keeps its own card and gets no button.

**Blocked by:** 129, 22, 39.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "move 'force submit' to be directly to the right of 'indiv working'. change to 'force submit' from force assignment submit. have this be a feature for each of 'indiv working', 'indiv review', 'group review'. 1 at a time -- only the one that's currently being worked through. keep the x/20 done & put it right under the button".

## Solution

- `lib/classroom.ts`: the advance kinds are now one per stage the students work through, `force-submit` (the set), `force-review` (the corrections; `group-start` before, since forcing individual review to a close is what opened the gate) and `force-group` (the board), plus `whole-class-start`. A classroom action `group/end { at }` marks the shared run done where it stands with `endedAt` (idempotent; a done board takes no more strokes).
- `lib/groupReview.ts`: `GroupRun.endedAt`. `lib/standings.ts`: the scripted race's clock stops at `endedAt`, so the other groups' bars hold where the teacher ended it.
- `lib/readiness.ts`: the gate opens on a due `force-review` (was `group-start`).
- `lib/session.ts`: `advance/apply` for `force-review` hands a correcting student in as they stand and moves them by the pathway (straight onto the board when group review is next, since the gate opens at the same deadline; to the class review wait, or the report, otherwise); a student at the gate goes in. `force-group` moves a student on the board on by the pathway; everyone else only records the id.
- `lib/classStage.ts`: `FORCE_KIND` (the advance per stage; none for class review), `FORCE_PENDING_WORD` (`handing in`, `handing in`, `ending`), `canForce(stage, classroom, session)`: the live student is still on the stage (up to working; correcting or at the gate; on the board and the run not done) and the teacher is not projecting.
- `app/teacher/ForceSubmit.tsx`: takes the stage; a compact pill button **force submit** (12 px, the sky style) that starts the advance at once, replaced while the grace runs by `● handing in` / `1:00 · Cancel`. No confirmation step: the minute with Cancel is the undo, and a confirm line does not fit beside the pill. Disabled by `canForce`. The countdown is clamped to the grace (the student's pill too): each side's clock ticks once a second, so a fresh one could read `1:01`.
- `app/teacher/GroupStart.tsx` deleted: force submit on `indiv review` is the gate.
- `app/teacher/TeacherLive.tsx`: the title line loses the button; the current pill's note (`data-stage-note`) is the button above the count (`data-stage-count`), still 12 px right of the pill and centred on it, so nothing moves.
- `app/student/StudentApp.tsx`: applying a due `force-group` also dispatches `group/end` on the classroom; the countdown pill reads "Group review starts in" for a `force-review` when group review is next, else "Your teacher is moving the class on in".
- Tests: session (force-review by pathway with and without group review, force-group by pathway, everyone else untouched), classroom (`group/end` once, nothing without a run), standings (the race holds after the end), readiness (the kind), classStage (`FORCE_KIND`, `canForce` per stage and session).
- `README.md` follows.

## Acceptance

- [x] `indiv working` current: **force submit** 12 px right of the pill, `10/20 done` right under it at the same left, the pair centred on the pill, inside the card; no button on the title line, no gate line anywhere
- [x] Press: `● handing in` / `1:00 · Cancel` in its place, the count still under; the student's pill counts down; Cancel restores both
- [x] The grace out: the student is correcting with the notice; the class is on `indiv review`, whose button is now the only one, enabled, `0/20 done`
- [x] `indiv review` pressed: the student's pill reads "Group review starts in"; the grace out: the student is on the board and the class on `group review`, its button enabled
- [x] `group review` pressed: `● ending`; the grace out: the student waits for class review, the run is done, the button disabled, the other groups' bars hold for 20 s
- [x] Class review: no button, no note; ended: nothing; the pills' rects identical in every state
- [x] vitest (428), eslint, tsc, `next build`, headless click-through (`force145.mjs`, three real graces) with crops
