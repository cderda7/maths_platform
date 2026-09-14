# 263: SKIP TO on the teacher side: send assignment, students done with the stage, activity completed

A presenter bar on the teacher's laptop with three jumps that move the whole lesson at once: the teacher's screens, the board, Sam's iPad and his Classroom.

## Files touched

| File | What it does |
| --- | --- |
| `lib/demo.ts` | `TEACHER_SKIP_TARGETS` (`send`, `done`, `completed`), `TEACHER_SKIP_LABEL`, `canTeacherSkip` (done waits for a sent set) and `teacherSkip(target, classroom, session, now)`: a pure step from the demo as it stands, not a rebuild. `send`: PS6 under `DEMO_PATHWAY`, live from now, Sam at `INITIAL_SESSION`. `done`: the next stage after `currentClassStage` by the pathway in force (`enter`: individual review on Sam's hand-in; group review at its intro with Sam through the gate; class review projected from the teacher's own setup or `suggestedSetup`, grace over, group run finished), the stream at its end; the last stage, or a lesson already over, is `completed`. `completed`: sends first if needed; group run finished, class review ended, `lessonEndedAt` stamped, Sam's report sent with `DEMO_REFLECTION` and his homework playing from the jump; a completed lesson stays as it is. Sam's work is `reworkedSession` when the pathway has individual review, `scriptedSession` otherwise. `suggestedSetup` is shared with Sam's own "class review" skip. |
| `lib/demo.test.ts` | Every target from every starting stage (not sent, working, individual review, group review, class review, completed); the chain of done through the demo pathway (class stage, Sam's stage, card section and status, his Classroom section, board); each done equals Sam's own skip to that stage; repeats; absences (Chloe back, Liam away: 19 in the room, Liam out of Sam's group); Create's pathways `[individual, group]`, `[group]`, `[whole-class]`, `[]`; a teacher's own class review setup; Create starts a new lesson. |
| `lib/classroom.ts` | `ClassroomState.lessonEndedAt` (simulation-only for now) and `lessonOver(c)`: class review ended, or the lesson ended outright. `assignment/create` starts a new lesson (`newLesson`): advance, class review, arrivals, group run, diagnostic chains and the end are dropped; seating, absences and the draft stay. |
| `lib/classStage.ts` | `currentClassStage` is null once `lessonOver`. |
| `lib/board.ts`, `app/teacher/GroupProgressCard.tsx`, `app/teacher/TeacherLive.tsx` | Read `lessonOver` where they read "class review ended": the blank board, the group card gone, " · complete". |
| `lib/store.ts` | `setLesson({ classroom, session })`: the two stores moved as one change, one message on its own channel and one storage write, adopted by every other tab in one task (`adoptLesson`); the stores' own keys written after it, unannounced. `resetSession` uses it. `refreshBatchedSession()` lands the teacher's 3 s batch at once. |
| `lib/classroom-store.ts` | `setClassroom(next, announce)`; `adoptClassroom` (another tab's classroom, nothing written); `resetClassroom` gone (reset is `setLesson`). |
| `app/teacher/TeacherSkipTo.tsx` (new) | The bar: "skip to", then the three buttons in the student bar's dashed look; students done disabled until a set is sent; a press is `teacherSkip` → `setLesson` → `refreshBatchedSession`, no navigation. |
| `app/teacher/TeacherChrome.tsx` | A presenter strip under the scroll region (`data-presenter-strip`): the bar left, Reset demo right, zoomed with the frame. |
| `components/ResetDemo.tsx` | `inline` places it in a strip instead of fixed bottom-right. |
| `components/SkipTo.tsx` | Sam's jumps also go through `setLesson`. |

## How it connects

```
 teacher laptop (any /teacher route)
 ┌─ TeacherChrome ───────────────────────────────────────────────────────────┐
 │ header                                                                    │
 │ main [data-teacher-scroll]  Classroom · Class View · Mistakes · Groups …  │
 ├─ footer [data-presenter-strip] ───────────────────────────────────────────┤
 │ (SKIP TO  send assignment · students done with current stage ·            │
 │           activity completed)                            (Reset demo)     │
 └─────────────┬─────────────────────────────────────────────────────┬───────┘
               │ press (stays on the screen)                          │ resetSession
               ▼                                                      │
 lib/demo.ts  teacherSkip(target, getClassroom(), getSnapshot(), now) │
   send ──────▶ assignment/create (DEMO_PATHWAY, live now) ──▶ newLesson (lib/classroom.ts)
   done ──────▶ currentClassStage (lib/classStage.ts) ──▶ next stage of pathwayOf(c)
                 ├ individual ▶ Sam sessionAt("feedback"), stream over
                 ├ group      ▶ throughGate + group/begin at boardOpensAt(now) (groupPlan, liveAbsent)
                 ├ whole-class▶ group run finished + wc/setup (teacher's or suggestedSetup) + wc/project
                 └ none       ▶ completed
   completed ─▶ group finished · wc/end · lessonEndedAt · Sam homework (DEMO_REFLECTION)
               │ { classroom, session }
               ▼
 lib/store.ts  setLesson ──▶ BroadcastChannel "edexia-maths-demo/lesson" + localStorage lesson/v1
               │               (then classroom/v1, session/v1 unannounced)
               │ adoptLesson: both stores in one task
      ┌────────┴──────────────┬──────────────────────────────┬──────────────────────────┐
      ▼                       ▼                              ▼                          ▼
 teacher tab             /board SmartBoard            Sam's iPad StudentShell      Sam's Classroom
 refreshBatchedSession   boardContent: blank ·        clockwork sees the pair       studentClassroom:
 Class View pathway card group · whole-class ·        (no release/freeze on a        To do ▶ Completed
 Classroom Live ▶ Past   blank (lessonOver)           half-moved lesson)
 (lib/classroomCards)
```
