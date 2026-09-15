# 289: Due-date picker for an in-class set

## Files touched

| File | What it does |
| --- | --- |
| `lib/dueDate.ts` | `dueOrder` as before, plus the calendar: `IsoDay` ("2026-09-10"), `DEMO_TODAY` (Thu 10 Sep 2026), `DUE_DEFAULT.pset`, `isIsoDay`, `dayLabel` ("Thu 10 Sep"), `dayName`, `addDays`, `addMonths`, `addMonthsToDay`, `monthOf`, `monthLabel`, `monthWeeks` (Monday-first weeks), `weekStart`/`weekEnd`, `laterOf`, `dueOrDefault`. Pure. |
| `lib/dueDate.test.ts` | New. The calendar helpers, and the flow: Generate's default, Create stores the day, the bundle, the teacher's and Sam's cards and their sorting read it, reload keeps it, skips and deep links stay Thu 10 Sep. |
| `components/DuePicker.tsx` | New, shared. The field and the month calendar overlay; props `value`, `onChange`, `min`, `today`, `note`, `label`. Keyboard grid, Escape (`useEscape`), press outside and tab out close. |
| `app/teacher/assignments/create/CreateAssignment.tsx` | Title row = title input + `DuePicker`; `due` state from the draft (`dueOrDefault`), written with the draft on every change and on Continue. |
| `app/teacher/assignments/create/BlankStart.tsx` | The same field in the same row, inert and greyed, at the default day. |
| `lib/classroom.ts` | `AssignmentDraft.due`, `CreatedAssignment.due`, `assignment/create` carries `due`. |
| `lib/draft.ts` | `generatedDraft` starts due on `DUE_DEFAULT.pset`. |
| `lib/create.ts` | `createAction` passes the draft's day. |
| `lib/assignment.ts` | `ActiveAssignment.due`: the created set's day as a label, else the fixture's. |
| `lib/assignments.ts` | The live bundle's `due` is `activeAssignment(c).due`. |
| `app/student/screens/OverviewScreen.tsx` | "due …" reads `active.due` (was the fixture constant). |

`lib/studentClassroom.ts`, `lib/classroomCards.ts`, `app/teacher/Classroom.tsx`, `app/student/StudentClassroom.tsx`, `TeacherLive.tsx` and `HolisticPage.tsx` are unchanged: they already read the bundle's `due`.

## How it connects

```
 /teacher/assignments/create  (Questions)
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ [ Problem Set 6 — Roots of a quadratic        ]   [ DUE  Thu 10 Sep  v ] │ ◄ components/DuePicker.tsx
 │                                                   ┌────────────────────┐ │   value / onChange / min / today / note
 │ Goal for the class …                              │ < September 2026 > │ │   absolute under the field's right edge:
 │                                                   │  Mo Tu We Th Fr .. │ │   an overlay, nothing moves
 │ [Q1] [Q2] [Q3] [Q4] [Q5 ...                       │  ·  ·  · (10) 11 ..│ │   days < min greyed, inert
 └───────────────────────────────────────────────────└────────────────────┘─┘
            │ setDue(day)                                     ▲
            ▼                                                 │ lib/dueDate.ts
   dispatch draft/set { …draft, due: "2026-09-17" }           │ monthWeeks, addDays, dayLabel,
            │                                                 │ DEMO_TODAY, DUE_DEFAULT, dueOrDefault
            ▼
   classroom.draft.due ──(Continue, review steps)──► lib/create.ts createAction
                                                           │ { type: "assignment/create", …, due }
                                                           ▼
                                                 classroom.assignment.due (IsoDay)
                                                 localStorage + BroadcastChannel (every tab, reload)
                                                           │
                                                           ▼
                                  lib/assignment.ts activeAssignment(c).due = dayLabel(due) ?? "Thu 10 Sep"
                                                           │
                        ┌──────────────────────────────────┼─────────────────────────────────┐
                        ▼                                  ▼                                 ▼
      lib/assignments.ts bundle.due          app/student/screens/OverviewScreen   (skips / deep links:
                        │                          "Ms Okafor · due Thu 17 Sep"         demoSend has no due
          ┌─────────────┼──────────────────┐                                            ─► "Thu 10 Sep")
          ▼             ▼                  ▼
  classroomCards   studentClassroom   TeacherLive due line,
  (teacher cards,  (Sam's cards,      HolisticPage set header
  newestFirst by   sorted by
  dueOrder)        dueOrder)
```

Ticket 291 renders a second `DuePicker` for homework with `min` = the day after the previous homework's due date and `DUE_DEFAULT.homework`, and passes `note` for the PSet picker when its date falls inside an open homework.
