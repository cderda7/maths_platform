# 225: The student's report has the dot key

## Files touched

| File | What it does |
| --- | --- |
| `app/student/screens/ReportScreen.tsx` | The student's "Your report": renders `StatusKey` under the skills inside the Skills card. |
| `tickets/225-student-report-key.md` | The ticket. |

## How it connects

```
                 components/StatusKey.tsx  (one key: dot · word · band)
                    │                          │
                    ▼                          ▼
 /teacher/a/<id>/report                 /student  stage "report"
 TeacherReport.tsx                      ReportScreen.tsx
 ┌ Skills card ────────────┐            ┌ Skills card ────────────┐
 │ SkillColumns (locked)   │            │ SkillColumns (student)  │
 │ ─── StatusKey ───       │            │ ─── StatusKey ───  ◄ 225│
 └─────────────────────────┘            └─────────────────────────┘
                                         What happened · Reflection
```
