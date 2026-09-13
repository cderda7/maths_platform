# 227: Both reports show every skill; the key moves; the teacher's report at 125%

## Files touched

| File | What it does |
| --- | --- |
| `app/student/screens/ReportScreen.tsx` | The student's report: skills in the fixed full view; the key at the top of the reflection column. |
| `app/teacher/TeacherChrome.tsx` | The teacher frame: `TEACHER_ZOOM` and a per-page `zoom` prop. |
| `app/teacher/report/TeacherReport.tsx` | The teacher's student report: asks for 1.25 × the teacher zoom. |
| `components/HierarchyDrill.tsx` | `fitLabels` counts the node padding and caps wrapping at two lines (`NODE_PAD`, `lineCount`). |
| `components/fitLabels.test.ts` | Tests for the fitting rules. |
| `tickets/227-report-full-dots.md` | The ticket. |

## How it connects

```
 TeacherChrome(zoom = TEACHER_ZOOM 0.72) ◄── every /teacher page
        ▲
        └── TeacherReport: zoom = 0.72 × 1.25 = 0.9   (bar + page)

 SkillColumns(mode="expanded", locked) ──► RowDrill ──► SkillTree ──► fitLabels(labels, column width)
        ▲                     ▲                                        │  no wrap: largest size that fits
        │                     │                                        │  wrap 10.5: every name ≤ 2 lines
 TeacherReport          ReportScreen (student)                         └  else 9     (NODE_PAD counted)

 ReportScreen
 ┌ section ─────────────────────────┐ ┌ aside ───────────┐
 │ Your report                      │ │ KEY  StatusKey   │ ◄ 227
 │ Skills card (full, fixed)        │ │                  │
 │ What happened                    │ │ REFLECTION · Send│
 └──────────────────────────────────┘ └──────────────────┘
```
