# 292: Future panel and the homework gate

## Files touched

| File | What it does |
| --- | --- |
| `lib/homeworks.ts` | `homeworkForSet` (frozen at opening, else by date, skipping homeworks that opened without the set); `coveredSetIds` and `homeworkColumn` read it, and a column piece carries `opened`; `homeworkSets(c)` (the Classroom's sets plus Problem Set 6 before its Create, each with its short name and whether its lesson is over); `openHomeworks(c)` (stamps `openedAt` and `setIds` on every sent homework whose sets' lessons are all over; pure, idempotent, memoised); `classHomeworks` and `homeworkOpened` read through it; `futureHomeworks` (the panel), `openHomeworksFor` (To do's Homework cards), `missedNote` / `MISSED_NOTE_CURRENT`. |
| `data/homeworks.ts` | `HomeworkDef.setIds` (the sets frozen at opening); Homework 1 and 2 carry theirs (Problem Sets 1–2, 3–4, tested equal to the date rule). |
| `lib/classroom.ts` | `SentHomework.setIds`; `openedAt`'s meaning. |
| `lib/classroom-store.ts` | `setClassroom` and `adoptClassroom` apply `openHomeworks`. |
| `lib/store.ts` | `setLesson` applies it before a presenter jump goes out to the other tabs. |
| `lib/studentClassroom.ts` | `StudentSetCard.kind` (`set` / `homework`), action `open`; the open homeworks first in To do; `studentHomeworkHref`. |
| `app/student/StudentClassroom.tsx` | `FuturePanel` (absolute, top right over the homework column, level with the eyebrow; dashed, grey, no shadow, nothing pressable; hidden when empty); the Homework card's OPEN; the HW3 cell muted and inert in the Future, a button once open; HW2's note from `missedNote`. |
| `app/student/HomeworkScreen.tsx`, `app/student/homework/[id]/page.tsx` | The homework route: "Homework 3 · due Mon 14 Sep" and ← Classroom (Escape too); a homework not open for Sam is his Classroom. Ticket 293 fills it. |
| `lib/homeworkGate.test.ts`, `lib/homeworks.test.ts`, `lib/studentClassroom.test.ts` | The panel, the open trigger (end lesson after its minute, class review's End, activity completed, sent after the end), the freeze, a set created later going to the next homework, HW2's note. |

## How it connects

```
 teacher tab                                         any tab's write
 ───────────                                         ───────────────
 +Homework Create ── homework/send ──┐               lib/classroom-store.ts setClassroom / adoptClassroom
 End lesson ─ advance/start          │               lib/store.ts setLesson (presenter jumps)
   └ 60 s ─ LessonEnds lesson/end ───┤                         │
 activity completed ─ setLesson ─────┤                         ▼
 class review End ── wc/end ─────────┘          lib/homeworks.ts openHomeworks(c)   ◄292 pure, idempotent
                                                  for each SentHomework without openedAt:
                                                    homeworkSets(c)  PS1..PS5 over · PS6 over iff sent && lessonOver
                                                    covered = sets where homeworkForSet(set) is it
                                                    all over? ─► openedAt = max(sentAt, lessonEndedAt)
                                                                 setIds   = covered (frozen)
                                                         │
                     classHomeworks(c) ◄─────────────────┘  (every reader, stamped or not)
                        │           │               │                    │
         homeworkForSet │           │               │                    │
        (frozen, else   ▼           ▼               ▼                    ▼
         date, skip  futureHomeworks  openHomeworksFor   missedNote          lib/classroomCards homeworkCards
         opened)        │           │                    │                   (teacher: sent / open)
                        │           ▼                    │
                        │   lib/studentClassroom todo: [Homework 3 OPEN, …sets]
                        ▼           │                    │
 app/student/StudentClassroom.tsx   ▼                    ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ 11MAM2 · …                                         ┌╌ FUTURE ╌╌╌╌╌╌╌╌╌╌╌┐  │
 │ Edexia Classroom                                   ╎ Homework 3          ╎  │ ◄ absolute, out of flow,
 │ TO DO                                              ╎ due Mon 14 Sep      ╎  │   gone once open
 │ [ Homework 3            due Mon 14 Sep  OPEN ] ──┐ ╎ opens after PS6     ╎  │
 │                                                  │ └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘  │
 │ COMPLETED                                        │                          │
 │ [ PS6 … ]  [ PS5 … ]                             │ [ HW3 · due Mon 14 Sep ] ─┤ muted div in Future,
 │ [ PS4 … ]  [ PS3 … ]                             │ [ ⚠ HW2  …current HW ]    │ button once open
 │ [ PS2 … ]  [ PS1 … ]                             │ [ ✓ HW1 completed ]       │
 └──────────────────────────────────────────────────┼──────────────────────────┘
                                                    ▼
                          /student/homework/hw-3  app/student/HomeworkScreen.tsx
                          "Homework 3 · due Mon 14 Sep"  ← Classroom      (ticket 293 fills it)
```

Ticket 293 lists Sam's own problems from the homework's frozen `setIds` and the teacher's ten under the heading; 294 carries
a missed homework's own problems into the next (`missedNote` already says "current HW" when that one is open); 295's
"send homework" and "homework open" shortcuts land on the same states through the same store write.
