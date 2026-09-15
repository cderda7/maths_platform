# 301: Work lines and Compare name the misconception, not the skill

## Files touched

| File | What it does |
| --- | --- |
| `components/Tag.tsx` | New `MisconceptionChip`: ⚠ + `misconceptionName(id)`, `data-blame={id}`, a span. |
| `components/HierarchyDrill.tsx` | `WorkLines` draws the chip on every red line; `onGoTo` / `student` gone from `WorkLines`, `onGoTo` from `ProblemWork` and `WorkPanel`; `RowDrill.onNavigate` and its `goTo` removed. |
| `components/ClassReviewExamples.tsx` | No `onGoTo` / `student` (its lines are unmarked, so it never drew a chip). |
| `app/teacher/TeacherLive.tsx` | Row and column drills no longer pass `onNavigate`; `jump` removed. |
| `app/teacher/report/TeacherReport.tsx`, `app/student/screens/ReportLayout.tsx` | Versions and skill work without the skill link. |
| `app/teacher/students/HolisticDrill.tsx`, `HolisticPage.tsx` | `SkillWork` without `onGoTo`; the page's `goTo` removed. |
| `app/teacher/compare/TeacherCompare.tsx` | A red (handed-in) line shows its label and `MisconceptionChip`; others only their label. |
| `app/teacher/whole-class/ExamplePicker.tsx`, `lib/examples.ts` (+ test) | The skill chip under an example's name and `ExampleOption.leaf` removed. |

## How it connects

```
 data/misconceptions.ts (299) ── misconceptionName ──▶ components/Tag.tsx MisconceptionChip ◄301
                                                                │
 lib/evaluate.ts evaluateLine ─▶ LineVerdict.misconception      │
        │                                                       │
        ├─▶ components/HierarchyDrill.tsx WorkLines ◄301 ───────┤ (every red line)
        │       ▲ ProblemWork ▲ WorkPanel ▲ RowDrill ◀── app/teacher/TeacherLive (Class tab drills)
        │       ▲ TeacherReport Versions / WorkPanel
        │       ▲ student ReportLayout (Sam's report side column)
        │       ▲ HolisticDrill SkillWork ◀── HolisticPage
        └─▶ app/teacher/compare/TeacherCompare ◄301 ────────────┘ (handed-in side's red lines)

 lib/examples.ts optionsFor (no leaf) ─▶ whole-class/ExamplePicker (name + badges, no skill chip) ◄301
```
