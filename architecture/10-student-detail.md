# 10 · Student detail, classwide hint, suggested hints (+ cleanup)

Commit `29b8656`. Route `/teacher/students/[id]`. Same commit added `README.md`,
`decisions_log.md`, and the favicon.

## Files touched

| File | Role |
|---|---|
| `app/teacher/students/[id]/page.tsx` | Server wrapper. Looks up `STUDENT_MAP[id]`, calls `notFound()` if missing. |
| `app/teacher/students/[id]/StudentDetail.tsx` | Client component. Subskill status list, Jordan's `StepTrace` from `FLOWS`, chat highlights, check-ins, and the two hint-suggestion kinds ("might need a hint" / "reads as complicated") each citing evidence. Classwide hint composer. |
| `README.md`, `decisions_log.md`, `app/favicon.ico` | Docs and polish. |

## How it connects

```
  URL /teacher/students/jordan
        │
        ▼
┌───────────────────────────────┐  studentId  ┌──────────────────────────────────┐
│ students/[id]/page.tsx        │────────────▶│ students/[id]/StudentDetail.tsx  │
│  STUDENT_MAP[id] ?? notFound()│             │  (client)                        │
└───────────────────────────────┘             └──┬──────────────────┬────────────┘
                                                 │ data             │ components
                                                 ▼                  ▼
                 students.ts  STUDENTS, STUDENT_MAP        StepTrace ◀── shared with 04, 05
                 subskills.ts SUBSKILLS                    M · DifficultyTag · StatusDot
                 problems.ts  PROBLEM_MAP                  STATUS_WORD · Card Button Avatar
                 flows.ts     FLOWS  ──▶ Jordan's evaluated steps
                 teacher.ts   HINT_SUGGESTIONS, JORDAN_HIGHLIGHTS, JORDAN_CHECKINS

   The student-side mirror of this page is TeacherViewScreen (07), reading JORDAN_REPORT.
```
