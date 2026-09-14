# 271: Every problem on a teacher screen shows the whole question

## Files touched

| File | What it does |
| --- | --- |
| `components/ProblemQuestion.tsx` | New. A problem's stem words then its expression as one wrapping line; the maths never splits, a hyphenated word never breaks. |
| `lib/stem.ts` | `unbrokenHyphens`: a hyphen between word characters becomes U+2011. |
| `lib/stem.test.ts` | The hyphen rule, and every problem on every set has a stem. |
| `app/teacher/TeacherMistakes.tsx` | The problem header shows `ProblemQuestion` in place of the bare expression. |
| `app/teacher/report/TeacherReport.tsx` | The open problem's line shows the whole question (was a `FitText` of the expression). |
| `components/HierarchyDrill.tsx` | `ProblemWork` puts the whole question under the label, in both widths (teacher skill view, student report). |
| `app/teacher/DiagnosticFocus.tsx` | Header "Qn · Live diagnostic", the whole question on a line under it. |
| `app/teacher/whole-class/WholeClassSetup.tsx` | The problem list rows and the example cards' headers. |
| `app/teacher/board/BoardControls.tsx` | The problem card reads the question in order and wraps instead of truncating the stem. |
| `app/teacher/compare/TeacherCompare.tsx` | The card header. |

## How it connects

```
 data/pset*/assignment.ts, data/assignment.ts
   Problem { label, stem, tex, … }
          │
          ▼
 components/ProblemQuestion.tsx ◄271 ── lib/stem.ts unbrokenHyphens ◄271
   <span stem words/> <span nowrap><M tex/></span>
          │
          ├──► TeacherMistakes      problem header      (Q · question · tag · action)
          ├──► TeacherReport        open problem line   (Q · tag · question)
          ├──► HierarchyDrill       ProblemWork         (Q · tag / question / working lines)
          │        └──► teacher skill view, student ReportScreen
          ├──► DiagnosticFocus      "Qn · Live diagnostic" / question
          ├──► WholeClassSetup      problem list rows, example card headers
          ├──► BoardControls        problem card
          └──► TeacherCompare       card header
```
