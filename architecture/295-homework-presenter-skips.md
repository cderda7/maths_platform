# 295: Presenter shortcuts for homework

"send homework" and "homework open" join the presenter's skip lists on the teacher's laptop and Sam's iPad, only once the
teacher has pressed +Homework in this demo.

## Files touched

| File | What it does |
| --- | --- |
| `lib/classroom.ts` | `ClassroomState.homeworkStartedAt` (simulation only) and `homework/start` (the first press stamps it; later presses change nothing). `reset` clears it; `newLesson` / `unsent` keep it. |
| `lib/demo.ts` | `HOMEWORK_SKIP_TARGETS`, `homeworkSkipsShown(c)`, `keepHomeworkStarted(from, to)` (Sam's rebuilds carry the mark), `readyHomework(c, now)` (Generate's ten, every Refine recommendation accepted, the first addition), `homeworkSkip(target, c, session, now)`: send homework = any sent homework dropped, then `homeworkSent` on the ready draft (Homework 3, due Mon 14 Sep, draft cleared), nothing else moves; homework open = Homework 3 sent if none is, then `completeLesson` (activity completed's step). |
| `lib/store.ts` | `Lesson.land?: "classroom"`: where Sam's iPad goes with a lesson move. |
| `components/homeworkJump.ts` (new) | Writes a homework jump through the stores: send homework with `setClassroom` (announced, not a lesson move), homework open with `setLesson({ …, land: "classroom" })`; lands the teacher's batch. |
| `components/SkipTo.tsx` | Sam's bar: the two homework buttons after the nine while `homeworkSkipsShown`, each going to `/student`; the nine keep the +Homework mark over their rebuild; labels never wrap. |
| `app/teacher/TeacherSkipTo.tsx` | The teacher's bar: the two after the three; send homework lands on `/teacher` as the real Send does, homework open leaves the teacher in place. |
| `app/teacher/Classroom.tsx` | `CreateButton` takes `onClick`; +Homework dispatches `homework/start`. |
| `app/student/useLessonLanding.ts` (new), `app/student/StudentShell.tsx` | On every student route: a lesson move from another tab with `land: "classroom"` replaces the route with `/student`. |
| `app/student/useLessonPull.ts` | A move that lands on the Classroom opens no set. |
| `lib/homeworkSkips.test.ts` (new) | Shown / hidden / kept (12 tests); send homework equals the walked Create from a fresh and a working demo, waits in the Future, never Homework 4, opens at once after the lesson; homework open equals send + activity completed from four moments, To do, cell, note; a teacher's own homework stands. |

## How it connects

```
 teacher laptop /teacher                                   any tab
 [ + Homework ] ── onClick: homework/start ──▶ classroom.homeworkStartedAt ──▶ localStorage + channel
                                                        │                        │
                                  homeworkSkipsShown(c) ◀┘                        │ Reset demo: INITIAL_CLASSROOM
          ┌─────────────────────────────┴───────────────────────────┐            ▼ (mark gone, buttons gone)
          ▼                                                         ▼
 presenter strip (TeacherSkipTo)                         Sam's iPad SKIP TO (SkipTo, every student route)
 SKIP TO send assignment · students done ·               SKIP TO start … homework · send homework ·
   activity completed · send homework ·                    homework open
   homework open                     (Reset demo)          (the nine: skipFixture + keepHomeworkStarted)
          │                                                         │  then router.push /student
          └──────────────────────┬──────────────────────────────────┘
                                 ▼
               components/homeworkJump.ts ── lib/demo.ts homeworkSkip(target, classroom, session, now)
                 │                                         │
   send homework │  drop sent homeworks                    │ homework open
                 │  readyHomework ─▶ lib/create homeworkSent│  none sent? send homework first
                 ▼                                         ▼  completeLesson (activity completed's step)
        setClassroom(c)                           setLesson({ classroom, session, land: "classroom" })
                 │                                         │
                 │    lib/homeworks openHomeworks (every store write)
                 ▼                                         ▼
   teacher: router.push /teacher             other tabs: adoptLesson ─▶ subscribeLessonMoves
   Past: Homework 3 · sent                     ├ useLessonPull (Classroom, report): land = classroom ─▶ open no set
   Sam (wherever he is):                       └ useLessonLanding (StudentShell): route ≠ /student ─▶ replace /student
   Classroom's Future panel live                                     │
   "Homework 3 / due Mon 14 Sep /                                    ▼
    opens after Problem Set 6"               Sam's Classroom: [Homework 3  due Mon 14 Sep  OPEN] first in To do
                                             HW3 cell a button over PS6 + PS5 · HW2 "problems added to current HW"
                                             teacher's Past: Homework 3 · open
```
