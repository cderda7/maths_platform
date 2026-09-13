# 185: Assignments have ids and their own Class, Mistakes and Groups pages

**What to build:** The teacher side holds more than one assignment. Each assignment lives at `/teacher/a/<id>` with three tabs: Class (`/teacher/a/<id>`), Mistakes (`/teacher/a/<id>/mistakes`), Groups (`/teacher/a/<id>/groups`). `/teacher` becomes the Edexia Classroom (ticket 186; until then a plain list of links is fine). Opening an assignment lands by its state: if every student has submitted or the assignment is past individual working (a review stage or finished), it opens on Class; otherwise on Mistakes. Every assignment page shows "← Edexia Classroom" above its eyebrow line. The "New assignment" button leaves Class View (it moves to the Classroom). Each assignment keeps its own frozen copy of the groups, taken from the class's default groups when the assignment is created; editing on the assignment's Groups tab changes that assignment only. The class's default groups are edited at `/teacher/groups` (the Classroom's Groups page). Force submit shows on both Class and Mistakes. The old bank-picker create page (`/teacher/assignments/new`) is deleted.

**Blocked by:** 184.

**Status:** done

**Triage:** `ready-for-agent`

**Note (implementation):** Class is at `/teacher/a/<id>/class`: `/teacher/a/<id>` is the landing, which would otherwise bounce the Class tab to Mistakes while the class works (DECISION_LOG, 2026-09-13).

---

## Problem Statement

The user (2026-09-13): "the BIGGEST thing holding the UX experience back rn is that i have no actual linking to the core teacher flow from end to end -- i jump into the single assignment view. i'd like to build sth analogous to (not exactly like) google classroom -- a place where the teacher can see all assignments laid out at once, the option to create an assignment … teacher can click into that & see 'Class View' as landing page, & option to toggle into Mistakes & Groups … new assignment can be taken out of the Class View Page -- instead, there should be a 'back to Edexia Classroom' option".

Decisions from the grilling session (2026-09-13):
- Landing: "if teacher opens already completed (or just submitted & in review stage) set, Class View is landing page. else (not all students have submitted yet), Mistakes as landing page. this also means we'll need to move force assignment submit to the Mistakes Tab" — and it stays on Class too ("force assignment submit in both Class View & Mistakes View").
- Class during working (round 1 Q3 B + round 2 Q1 A): Class fills in per student as each submits; the tab is always open. An unsubmitted row shows its progress tag instead of dots: "Q4 in progress" or "warming up" (was "in progress"). No "available after submit" text anywhere.
- Groups: class default groups live in Edexia Classroom; in assignment creation the teacher confirms groups and may move students, and those moves apply to that assignment only (Q4 C); the assignment's Groups tab shows and edits that assignment's frozen groups (Q5 A).
- The Groups tab still only shows when the assignment's pathway includes group review.
- Header nav inside an assignment keeps Class · Mistakes · Groups; on the Classroom there are no assignment tabs.
- The live diagnostic stays on Class (and on Mistakes); deleting it is logged in FUTURE_FEATURES.

Current state (read 2026-09-13): one fixture `ASSIGNMENT` (`data/assignment.ts`, id "set-3"); `ClassroomState.assignment` is a single `CreatedAssignment | null` in `lib/classroom.ts`; groups are one per-class `ClassroomState.groups`; tabs in `app/teacher/TeacherChrome.tsx` `TEACHER_TABS`; the "New assignment" link sits in `TeacherLive.tsx` in its own row above the right column; ForceSubmit in `app/teacher/ForceSubmit.tsx`.

## Solution

- An assignment registry: fixed assignments (Problem Set 1 arrives in ticket 187; Problem Set 2 is today's fixture, re-id'd `pset-2`) plus the created one; each carries id, title, due, problems, pathway, stage state and frozen groups. Screens read "the assignment in the URL" instead of the global fixture. Keep the student side on Problem Set 2.
- Routes under `app/teacher/a/[id]/…`; old `/teacher/mistakes` and `/teacher/groups`-as-assignment links updated everywhere (board, report links, click-through scripts that live in the repo).
- Landing redirect at `/teacher/a/<id>` decides Class vs Mistakes from the assignment's stage and submitted count; the Class tab stays reachable.
- The progress tag per unsubmitted row: "Q<n> in progress" (the first unanswered problem) or "warming up".
- ForceSubmit rendered on Mistakes too.
- Until 187/189 land, Problem Set 2 is the only assignment and behaves as today (its data is static, so it lands on Mistakes because Chloe has not submitted).
- Delete `/teacher/assignments/new` and its unused helpers.
- DECISION_LOG entry for the registry/route shape.

## Acceptance

- [x] `/teacher/a/pset-2` lands on Mistakes while anyone has not submitted, on Class once past working; both tabs and Groups (when pathway has group) reachable
- [x] "← Edexia Classroom" on all three pages goes to `/teacher`; no "New assignment" on Class View
- [x] Force submit present on Class and Mistakes and works from either
- [x] Moving a student on an assignment's Groups tab does not change `/teacher/groups` (class defaults), and vice versa
- [x] Unsubmitted rows read "Q<n> in progress"/"warming up"
- [x] `/teacher/assignments/new` gone; no dead links (grep)
- [x] vitest, eslint, tsc, next build, check:laptop; click-through of the three tabs and landing rules
