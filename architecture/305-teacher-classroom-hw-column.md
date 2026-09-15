# 305: Homework as a column beside the teacher's Past

## Files touched

| File | What it does |
| --- | --- |
| `data/homeworks.ts` | `CLASS_HOMEWORK_STORY`: Homework 1 and 2 finishing days for all twenty students (named demo data from each arc; Sam's is `SAM_HOMEWORK_STORY`). |
| `lib/homeworks.ts` | `homeworkDoneCount(hw, records, today)`: students who finished by the due date and by today, of the class. `samHomeworkStatus` removed (its one reader left). |
| `lib/classroomCards.ts` | `TeacherHomeworkPiece`, `teacherHomeworkColumn(past, c, today)`: ticket 290's `homeworkColumn` over the Past cards, each cell with `state` (sent / open / over), `opensAfter`, `done`/`total`. `HomeworkCard`, `homeworkCards`, `pastWithHomework`, `coveredSetsPhrase` removed. |
| `app/teacher/Classroom.tsx` | `Section` is a grid (cards `minmax(0,1fr)` · 214 px column, gap 16 × 12) for Live and Past; `Card` takes its grid row; `HomeworkColumn` fills Past's second column (plain divs, dashed while sent). `HomeworkCardItem`, `HomeworkState`, `CheckMark` removed. |
| `lib/teacherHomeworkColumn.test.ts` | New: records, counts, spans across the demo's states. |
| `lib/homeworkCreate.test.ts` | Ticket 291's homework-card tests removed (the cards are gone). |
| `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`, `tickets/305-…` | Docs. |

## How it connects

```
 data/homeworks.ts                               lib/classroom.ts ClassroomState.homeworks (291, sent HW3)
 ┌──────────────────────────────────┐                     │
 │ HOMEWORKS hw-1, hw-2 (frozen sets)│                    ▼
 │ SAM_HOMEWORK_STORY               │          lib/homeworks.ts
 │ CLASS_HOMEWORK_STORY ◄305        │            classHomeworks(c) ─ openHomeworks (292)
 │   sam · priya · … · sofia (20)   │            futureHomeworks(c) ─ opensAfter "Problem Set 6"
 └───────────────┬──────────────────┘            homeworkColumn(cards, homeworks) (290: row, span)
                 │                               homeworkDoneCount(hw, records, today) ◄305
                 └──────────────────────────────────────┬───────────────┘
                                                        ▼
 lib/classroomCards.ts  classroomCards(c, session, now) ─▶ { live, past }
                        teacherHomeworkColumn(past, c) ◄305 ─▶ pieces {row, span, state, done/total}
                                                        │
                                                        ▼
 app/teacher/Classroom.tsx
 ┌────────────────────────────────────────────────────────────────────────────────┐
 │ LIVE   grid [ cards 1fr | 214 px ]                                             │
 │  [ PS6 · live · 0/19 submitted            due Thu 10 Sep  → ] │ (empty)         │
 │ PAST   grid [ cards 1fr | 214 px ]                                             │
 │  [ PS5 · done · top gap …                 due Mon 7 Sep   → ] │┌╌ Homework 3 ╌┐ │
 │                                                               │╎ due Mon 14 Sep╎ │ sent: dashed,
 │                                                               │╎ sent · opens  ╎ │ "opens after PS6"
 │                                                               │└╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘ │
 │  [ PS4 · done …                           due Fri 4 Sep   → ] │┌ Homework 2 ───┐ │
 │  [ PS3 · done …                           due Tue 1 Sep   → ] │└ 14/20 done ───┘ │
 │  [ PS2 · done …                           due Fri 28 Aug  → ] │┌ Homework 1 ───┐ │
 │  [ PS1 · done …                           due Tue 25 Aug  → ] │└ 17/20 done ───┘ │
 └────────────────────────────────────────────────────────────────────────────────┘
   cards: Link ─▶ /teacher/a/<id>        cells: plain div, no press, no focus

 activity completed / end lesson ─▶ PS6 to Past, openHomeworks stamps HW3 ─▶ HW3 spans PS6+PS5, "0/20 done"
 app/student/StudentClassroom.tsx (290, unchanged) reads the same homeworkColumn beside Completed
```
