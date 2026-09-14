# 272: The teacher's "send assignment" opens Create ready to send; jumps open the set on Sam's iPad

"send assignment" no longer sends silently: it takes the teacher to Create's last step, filled in with Problem Set 6 and the demo pathway, nothing sent, so the presenter shows the moment of sending by pressing Create (which lands on PS6's Mistakes). "students done with current stage" and "activity completed" open the set on Sam's iPad when he is on his Classroom.

## Files touched

| File | What it does |
| --- | --- |
| `lib/create.ts` (new) | Create as a pure step, lifted out of `ReviewAssignment`: `createAction(classroom, at?)` is the `assignment/create` the pathway step sends (the draft as the review leaves it, bank problem ids, the pathway, the New skills in force, the groups confirmed there or the class defaults), null while nothing is drafted or the pathway is undecided (ticket 246); `CLEAR_DRAFT` clears the draft and review; `created(classroom, at)` applies both. |
| `lib/create.test.ts` (new) | Nothing drafted or no pathway creates nothing; the store stamps `at`; the step's groups or the class defaults; No review creates and clears the draft. |
| `app/teacher/assignments/create/review/ReviewAssignment.tsx` | Create dispatches `createAction` then `CLEAR_DRAFT` (behaviour unchanged), resets Sam's session, pushes `/teacher/a/pset-6` (the landing opens Mistakes while the class works). |
| `lib/classroom.ts` | `unsent(c)`: no set out and no lesson (`newLesson` with `assignment: null`), seating and absences kept. Simulation only. |
| `lib/demo.ts` | `readyDraft(now)`: Generate's draft (`generatedDraft`) with every scripted recommendation accepted and the first addition shown (Problem Set 6's ten problems), on the pathway step with `DEMO_PATHWAY` chosen, New skills inferred, groups the class defaults. `teacherSkip("send")` is `unsent` plus that draft and review, Sam at `INITIAL_SESSION`. `done` stays off until a set is sent (the filled step is not one); `completed` unchanged. |
| `lib/demo.test.ts` | send from every stage (not sent, ready to send, working, individual, group, class review, completed): nothing out (no set, lesson state, card, To do, board title), the draft and review, Create on, seating and absences kept; the step holds PS6's problems, goal and New skills; Create from it from every stage gives what the old send gave; the chain of done now starts from send + Create. |
| `lib/assignments.ts`, `app/teacher/assignments/create/CreateAssignment.tsx` | `REVIEW_ASSIGNMENT_HREF` replaces the component file's `REVIEW_PATH`, so the bar can link to it without importing the create screen. |
| `app/teacher/TeacherSkipTo.tsx` | After the send jump, `router.push(REVIEW_ASSIGNMENT_HREF)`; done and completed still leave the teacher where they are. |
| `lib/store.ts` | `subscribeLessonMoves(cb)`: called with every lesson another tab moved as one change (`setLesson`), after it is adopted. `Lesson` exported. |
| `app/student/StudentClassroom.tsx` | Subscribes: a lesson moved from another tab with a set out opens `/student/a/pset-6` once (the channel and the storage event both deliver it); a move with nothing out (send, Reset) leaves Sam on his Classroom. |
| `lib/review.ts`, `lib/review.test.ts` (added) | `applyReview`: an accepted addition takes the slot of a removed question, first addition first freed slot, else last, so the scripted assessment leaves PS6 in the students' order (ball problem at Q9). |
| `app/teacher/assignments/create/review/RecommendationsStep.tsx` (added) | The addition's answered card names its place ("added as Q9"; "the last problem" when last). |
| `app/teacher/assignments/create/createBar.ts` (new, added) | `CREATE_BAR` (the floating bar's classes) and `CREATE_BAR_CLEARANCE` (`pb-28`: the bar's `bottom-16` plus a size-lg button), used by the create screen and the Difficulty, Assessment and Pathway steps, so the last row always scrolls clear of the bar. |

## How it connects

```
 teacher laptop, any /teacher route                     presenter strip: SKIP TO
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ send assignment ─┐   students done ─┐   activity completed ─┐                 │
 └──────────────────┼──────────────────┼────────────────────────┼────────────────┘
                    ▼                  ▼                        ▼
 lib/demo.ts teacherSkip(target, classroom, session, now)
   send ─▶ unsent(c) (lib/classroom.ts) + readyDraft(now) ─▶ draft + review on "pathway", DEMO_PATHWAY
   done / completed ─▶ as ticket 263 (a set out)
                    │ { classroom, session }
                    ▼
 lib/store.ts setLesson ──▶ lesson channel + lesson/v1 ──▶ other tabs: adoptLesson ──▶ subscribeLessonMoves
                    │                                                                     │
   send only:       ▼                                                                     ▼
 router.push /teacher/assignments/create/review              Sam's iPad, /student (StudentClassroom)
 ┌─ ReviewAssignment · PathwayStep ────────────┐              set out?  yes ─▶ push /student/a/pset-6
 │ New skills (inferred) · pathway (3 stops on) │                        no  ─▶ stays (send, Reset)
 │ Confirm groups · [Back] [Create] (on)        │
 └───────────────┬──────────────────────────────┘              /board: blank, no set named (nothing out)
                 │ Create                                      /teacher Classroom: no PS6 card
                 ▼
 lib/create.ts createAction(classroom) ─▶ assignment/create (a new lesson) ─▶ CLEAR_DRAFT
                 │ setSession(INITIAL_SESSION)
                 ▼
 /teacher/a/pset-6 ─▶ AssignmentLanding ─▶ /teacher/a/pset-6/mistakes
 Classroom Live card · Sam's To do PS6 START (iPad stays on his Classroom) · board names the set
```

Added the same day (order and clearance):

```
 draft (seed-1 … seed-10)          review.answers: change Q1 ✓  remove Q9 ✓  add ✓
        │                                              │
        ▼                                              ▼
 lib/review.ts applyReview ── Q1 changed · Q2…Q8 typed · Q9 slot ◀─ addition · Q10 typed
        │  (no removal accepted ─▶ addition last)
        ├──▶ RecommendationsStep grid Q1…Q10, card "added as Q9"
        └──▶ lib/create.ts createAction ─▶ assignment.questions in the same order

 ┌─ [data-teacher-scroll] ─────────────────────────────┐
 │ step content …                                       │
 │ last card                                            │
 │ ░ CREATE_BAR_CLEARANCE (pb-28 = bottom-16 + lg btn) ░ │◀── at the end of the scroll
 │                          [Back] [Create] CREATE_BAR  │    the bar sits over this only
 └──────────────────────────────────────────────────────┘
 presenter strip
```
