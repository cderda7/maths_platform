# 185 · Assignments have ids and their own Class, Mistakes and Groups pages

Routes: `/teacher` (the Classroom, a plain list for now), `/teacher/a/<id>` (the landing),
`/teacher/a/<id>/class`, `/teacher/a/<id>/mistakes`, `/teacher/a/<id>/groups`, `/teacher/groups`
(the class's default groups), `/teacher/mistakes` (redirects to Problem Set 2's Mistakes);
`/teacher/assignments/new` is gone. Report, compare, class review setup and the board stay where
they were, as Problem Set 2's live-lesson pages.

## Files touched

| File | What it does |
|---|---|
| `lib/assignments.ts` (new) | The registry: every set by id (`pset-2` today; 187 adds `pset-1`), `assignmentBundle(id, classroom)` (title, due, unit, problems, pathway, classmates, the set's own groups, `kind` live or finished), `assignmentIds`, `rosterProgress`, `submittedCount`, `assignmentStages`, `landingFor` / `landingTab`, `assignmentHref`, `assignmentTabs`, `PROBLEM_SET_2_BEFORE_CREATE` (188's switch). |
| `lib/progress.ts` (new) | One student's progress on a set: not started, warming up, working on a problem, submitted; `progressTag` names the row ("Q4 in progress", "warming up"); `classmateProgress` takes the stream's view at a moment (189). |
| `lib/classroom.ts` | `ClassroomState.assignmentGroups` (each set's frozen groups by id); `assignment/create` freezes the class defaults (or the groups it is given) under its id; `groups/move` and `groups/reset` take an optional `assignment`; `migrateClassroom` reads a pre-185 stored classroom (its one set of groups becomes Problem Set 2's copy too). |
| `lib/seating.ts` | `assignmentGroupsOf(classroom, id)`: the stored copy, else the fixture's frozen copy, never the live defaults. |
| `lib/classroom-store.ts` | Loads through `migrateClassroom`. |
| `lib/classStage.ts` | The working count is the class who handed in (`lib/progress`), over the assignment's classmates. |
| `lib/mistakes.ts` | `mistakesByProblem(session, set)` and `rightCount` take the set's problems and classmates. |
| `lib/standings.ts`, `app/student/screens/GroupBoardScreen.tsx` | Group review seats Problem Set 2's own groups. |
| `data/assignment.ts`, `data/groups.ts` | The fixture's id is `pset-2`; `FROZEN_GROUPS` holds each fixed set's frozen copy. |
| `app/teacher/AssignmentContext.tsx` (new) | The context, `useAssignmentBundle`, `useOptionalAssignment`, `BackToClassroom` ("← Edexia Classroom"). |
| `app/teacher/AssignmentProvider.tsx` (new) | Provides the bundle for an id, live from the classroom store; a set not in the Classroom says so. |
| `app/teacher/a/[id]/layout.tsx`, `page.tsx`, `AssignmentLanding.tsx`, `class/`, `mistakes/`, `groups/` (new) | The assignment's routes: the layout 404s an unknown id and provides the bundle; the landing replaces itself with Class or Mistakes. |
| `app/teacher/TeacherChrome.tsx` | Tabs from the context (Class · Mistakes · Groups for a set; a Groups link on Classroom pages). |
| `app/teacher/TeacherLive.tsx` | Class View reads the bundle; the back link; the "New assignment" row is gone; the pill beside the name (Sam's old "in progress" / "not started") reads "Q4 in progress" or "warming up" for a student still on the set, whose pills stay not-seen until they hand in; a student who has not begun keeps "not started" (Sam) or MISSING (Chloe); the name slot and pill trimmed a few px so "Q10 in progress" clears the row buttons. |
| `app/teacher/TeacherMistakes.tsx` (moved from `app/teacher/mistakes/`) | Reads the bundle; the back link; the stage, its count and force submit after the title. |
| `app/teacher/ForceSubmit.tsx` | `inline` variant for the Mistakes title row. |
| `app/teacher/groups/TeacherGroups.tsx` | One page, two scopes: an assignment's copy under a provider, the class defaults without. |
| `app/teacher/ClassroomList.tsx`, `app/teacher/page.tsx` | `/teacher`: the sets as links and "New assignment" (186 builds the cards). |
| `app/teacher/mistakes/page.tsx` | Redirects to `/teacher/a/pset-2/mistakes`. |
| `app/teacher/{report,compare,whole-class,board}/page.tsx` + screens | Wrapped in Problem Set 2's provider; titles from the bundle; back links and the board's End go to Problem Set 2's tabs. |
| `app/teacher/DiagnosticCard.tsx`, `app/teacher/assignments/create/review/ReviewAssignment.tsx` | Links to Problem Set 2's Mistakes / landing. |
| `app/teacher/assignments/new/` (deleted) | The old bank-picker create page. |
| `app/student/StudentChrome.tsx`, `components/Brand.tsx` | Side fix: with a four-stage pathway the header's title truncates on one line instead of the brand, title and name wrapping. |
| `scripts/laptop-check.mjs` | The new routes. |
| `lib/assignments.test.ts`, `lib/progress.test.ts` (new), `lib/classStage.test.ts` | Registry, groups, migration, landing, progress tests. |

## How it connects

```
 URL /teacher/a/<id>/<tab>
        │
        ▼
 app/teacher/a/[id]/layout.tsx ── isAssignmentId? ──no──► 404
        │ yes
        ▼
 AssignmentProvider(id) ◄── useClassroom() (localStorage + BroadcastChannel)
        │   assignmentBundle(id, classroom)          lib/assignments.ts
        │     ├─ REGISTRY[id]: fixture, classmates, kind, exists()
        │     ├─ live: activeAssignment(c) title/problems/goal, pathwayOf(c)
        │     └─ groups: assignmentGroupsOf(c, id)    lib/seating.ts
        ▼
 AssignmentContext ──► TeacherChrome (tabs: assignmentTabs)
        │
        ├─ page.tsx ─► AssignmentLanding ── landingTab(bundle, c, session, now) ─► router.replace
        │                                     ├─ submittedCount ◄─ rosterProgress ◄─ lib/progress.ts
        │                                     └─ assignmentStages ◄─ lib/classStage.ts
        ├─ class/ ────► TeacherLive  ── rows: progressTag ▸ pill beside the name, not-seen dots
        │                               Pathway card ▸ ForceSubmit
        ├─ mistakes/ ─► TeacherMistakes ── mistakesByProblem(session, bundle)
        │                                  title row ▸ stage · count · ForceSubmit inline
        └─ groups/ ───► TeacherGroups ── groups/move { assignment: id } ─► c.assignmentGroups[id]

 /teacher ─────────► ClassroomList ── assignmentIds(c) ─► links to /teacher/a/<id>
 /teacher/groups ──► TeacherGroups (no provider) ── groups/move ─► c.groups (class defaults)
 assignment/create ─► c.assignmentGroups[id] = copy of c.groups   (frozen)
 /teacher/mistakes ─► redirect /teacher/a/pset-2/mistakes
 report · compare · whole-class · board ─► AssignmentProvider("pset-2")
 student group review (standings, GroupBoardScreen) ─► assignmentGroupsOf(c, "pset-2")
```
