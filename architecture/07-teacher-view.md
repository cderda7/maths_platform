# 07 · What your teacher sees

Commit `a797a89`. Route `/student/teacher-view`. Transparency panel.

## Files touched

| File | Role |
|---|---|
| `app/student/teacher-view/page.tsx` | Thin server wrapper. |
| `app/student/teacher-view/TeacherViewScreen.tsx` | Client component. Renders `JORDAN_REPORT` verbatim, the subskill status list, a "Not reported" list, and a student note field that travels with the report. |

## How it connects

```
┌──────────────────────────────┐   ┌──────────────────────────────────────────┐
│ teacher-view/page.tsx        │──▶│ teacher-view/TeacherViewScreen.tsx (client)│
└──────────────────────────────┘   └──┬─────────────────────┬─────────────────┘
                                      │ data                │ components
                                      ▼                     ▼
                          teacher.ts  JORDAN_REPORT    StatusDot STATUS_WORD
                          subskills.ts SUBSKILL_MAP    Card Button Eyebrow Avatar
                          students.ts STUDENT_MAP

   JORDAN_REPORT is the same object the teacher's StudentDetail (10) reads.
   One source ──▶ two audiences, no summarisation layer.
```
