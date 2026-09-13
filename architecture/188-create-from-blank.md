# 188 · Create starts blank, one pulsing button generates Problem Set 2, and Create makes it live

Routes: `/teacher/assignments/create` (blank until generated), `/teacher/assignments/create/review`
(Confirm groups on the pathway step), `/teacher/a/pset-2/…` and the live-lesson pages (report, compare,
whole-class, board, the `/teacher/mistakes` redirect), which say "not created yet" until Create.

## Files touched

| File | What it does |
|---|---|
| `lib/draft.ts` (new) | `isGenerated(classroom)` (the draft carries `generated`) and `generatedDraft(at)`: the seeded title, goal and Q1–Q10 read as typed, ids `seed-1` … `seed-10`. |
| `app/teacher/assignments/create/BlankStart.tsx` (new) | The blank create screen: the title placeholder, goal box and one ghost Q1 tile where the editor puts them, greyed and `inert`, a dropped file refused; "Generate simulated assignment" centred on the tile grid (`Button` accent, `hit`, `.pulse-loop`). No Continue. |
| `app/teacher/assignments/create/CreateAssignment.tsx` | `Start` shows `BlankStart` until the draft is generated, then the editor; the editor saves the draft flagged `generated`; after this mount's own Generate no tile takes the focus (no scroll under the pointer) and the tiles fade in one after another (`.tile-in`, opacity only). The seed fallback on an empty store is gone. |
| `app/globals.css` | `.tile-in`: the generated tiles' fade, opacity only, off under reduced motion. |
| `app/teacher/groups/SeatingBoard.tsx` (new) | The five colour columns lifted out of the Groups page: drag a chip or pick a colour from its menu, uneven groups flagged. Pure view; the caller owns the groups and the move. |
| `app/teacher/groups/TeacherGroups.tsx` | Renders `SeatingBoard` (unchanged on screen). |
| `app/teacher/assignments/create/review/PathwayStep.tsx` | "Confirm groups" card under the pathway map while the pathway has group review: `SeatingBoard` over the new assignment's groups. Create never waits on it. |
| `app/teacher/assignments/create/review/ReviewAssignment.tsx` | The groups are `review.groups ?? class defaults`; a move writes `review.groups` only; Create passes `id: "pset-2"` and those `groups`; the empty state links to the create screen. |
| `lib/review.ts` | `ReviewState.groups` (the confirmed groups, kept across a changed draft like the pathway). |
| `lib/classroom.ts` | `CreatedAssignment.startedAt` (from `assignment/create`'s `startedAt`, else `at`); `AssignmentDraft.generated`. |
| `lib/assignments.ts` | `PROBLEM_SET_2_BEFORE_CREATE = false` (Problem Set 2 exists once `c.assignment` does); `liveStartedAt(c)` for ticket 189; `NEW_ASSIGNMENT_HREF`. |
| `lib/demo.ts` | Every skip creates Problem Set 2 with `startedAt` an hour before the jump (`SKIP_STARTED_AGO_MS`). |
| `app/teacher/AssignmentProvider.tsx` | "Not in the Classroom" gains a New assignment link: what Problem Set 2's tabs and the live-lesson pages show before Create. |
| `data/draft-seed.ts` | Doc: the seed is what Generate stores. |
| `app/teacher/assignments/create/review/{DifficultyStep,RecommendationsStep,PathwayStep}.tsx` | Back in the fixed bottom-right bar is a paper pill with the lift shadow (like the create bar's secondary buttons), so it reads as a control over content scrolling beneath; at max scroll the content ends above the bar (checked at 1280 × 800 and 1400 × 1000). |
| `app/teacher/assignments/create/{CreateAssignment,BlankStart}.tsx`, `review/ReviewAssignment.tsx` | "← Edexia Classroom" (`BackToClassroom`) above the eyebrow on the blank and generated create screen and every review step. |
| `lib/unit.ts` | Side fix: `UNIT_TITLES` are the QCAA Mathematical Methods 2025 syllabus titles (the Unit focus card read the 2019 "Algebra, statistics and functions"). |
| `scripts/laptop-check.mjs` | Measures the Classroom and the blank create screen first, creates Problem Set 2 through the student's `?pathway=` link, then its pages; a fresh store per size (22 checks). |
| `lib/draft.test.ts` (new), `lib/assignments.test.ts`, `lib/review.test.ts`, `lib/classroom.test.ts`, `lib/classroomCards.test.ts` | Blank vs generated, the seeded draft, absent before Create, `startedAt` on Create and skips, confirmed groups frozen without touching the defaults. |

## How it connects

```
 /teacher ── New assignment ──► /teacher/assignments/create
                                        │
                                        ▼
                         CreateAssignment ─► Start ── isGenerated(c)? ◄── lib/draft.ts
                                        │                │
                                   no   ▼                ▼  yes
                               BlankStart            Editor (fresh: fade in, no focus)
                     inert title · goal · ghost Q1       │ draft/set { …, generated: true }
                     [Generate simulated assignment]     │
                                        │                ▼
                  draft/set generatedDraft(now) ──►  Continue ──► /create/review
                                                                     │
                                                    ReviewAssignment ▼ PathwayStep
                                  review.groups ?? c.groups ──► Confirm groups
                                                                 └─ SeatingBoard ◄── TeacherGroups
                                              move ─► review/set { groups }   (class defaults untouched)
                                                                     │
                                                                  Create
                                                                     ▼
          assignment/create { id: pset-2, groups, at } ──► c.assignment { startedAt: at }
                                                          c.assignmentGroups["pset-2"] = groups
                                                          draft = null, review = null
                                                                     │
                     lib/assignments.ts: exists = !!c.assignment ────┤
                                                                     ▼
                 /teacher/a/pset-2 ─► landing ─► Mistakes      Classroom: Problem Set 2 LIVE, Problem Set 1 PAST
                 liveStartedAt(c) ─► ticket 189's stream

 before Create: AssignmentProvider("pset-2") ─► "Not in the Classroom" + New assignment
                (tabs incl. /report, /teacher/mistakes, /teacher/report, compare, whole-class, board)
 Reset demo ─► INITIAL_CLASSROOM ─► no assignment, no draft ─► Classroom empty, create blank
 SkipTo (student tab) ─► skipFixture ─► assignment/create { startedAt: now − 1 h }
 student side ─► activeAssignment(c) falls back to the fixture: runs before Create
```
