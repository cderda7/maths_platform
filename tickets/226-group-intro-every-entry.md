# 226: Group review starts with the description, every way in

**What to build:** Every way into group review shows the description screen (ticket 220) before the first problem: the pathway played through (corrections handed in, the class gate), the teacher ending individual review, "group review" in the skip-to bar from any stage (the board included), and links that name the stage (`/student?stage=group`, `?stage=class-wait`), even over an old or finished run in the browser.

**Blocked by:** 220, 224.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "still not sure how it's linked up. ensure it's a part of the group review pathway, every time. also when i click on 'group review' in the skip to bar, i want it to start with the description screen before moving into the first problem."

Reproduced on the dev server at :3000 before the fix: the skip bar already opened on the description from every stage, but `/student?stage=group` in a fresh tab went straight to Q1 (the run began before the clock's first tick, `now` = 0, so its board "opened" in 1970), and a stage link over a stored run resumed that run (a finished one sent the student on to the report). `?stage=class-wait` recorded the arrival at 0 too, so the class was "in" at once and the board opened with no description.

## Solution

- `lib/classroom.ts`: `group/restart` drops the run and the student's arrival.
- `app/student/StudentApp.tsx`: a link naming `class-wait` or `group` restarts group review on mount (a named stage starts a fresh run, as the page promises). The gate and board effects wait for the clock's first tick, and the board effect skips a render older than the store.
- `lib/classroom.test.ts`: the restart, and that the next begin shows the intro where the old arrival would not.

## Acceptance

- [x] Skip to group review from start, working, indiv review, class wait, class review, report and from the board itself: the description with ~30 s left; a reload keeps the clock; then Q1 (`entry226.mjs`)
- [x] Played through: hand in corrections, wait for the class, the description with the whole 30 s
- [x] `?stage=group` over the report's finished run, `?stage=class-wait` over old arrivals, `?stage=group` in a fresh tab: the description each time (17 checks); `intro224.mjs` still 26/26
- [x] vitest 637, eslint, tsc, next build
