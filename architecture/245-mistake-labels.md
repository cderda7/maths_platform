# 245: Each mistake group on the Mistakes view is labelled with the wrong line its students wrote

## Files touched

| File | What it does |
| --- | --- |
| `lib/mistakes.ts` | `wrongLinesOf(row)` (a student's wrong lines' TeX, in order); `MistakeGroup.wrongLines`, set when `groupByMistake` opens a group; `mistakeKey` joins `wrongLinesOf`. |
| `app/teacher/TeacherMistakes.tsx` | The label row over the names (one button per mistake group, spanning its columns, both lines stacked when two); names, pills and working one grid row lower; `FitGrid` fits the labels (`--label-fit`, widening columns where needed) before the working (`--fit`). |
| `lib/mistakes.test.ts` | Pins `wrongLines` on the fixture groups and on every group of every set. |
| `tickets/245-mistake-labels.md` | The ticket. |

## How it connects

```
 data/pset*/, data/classmates.ts (attempts) ──► lib/evaluate.ts verdicts
                                                     │
 lib/mistakes.ts ◄245                                ▼
   mistakesByProblem ──► rows ──► groupBySlip ──► SlipGroup   (one pill: same slipped leaves)
                                     └─► groupByMistake ──► MistakeGroup (same wrong line)
                                            key        = wrongLinesOf(row).join(" | ")
                                            wrongLines = wrongLinesOf(row)  ◄245
                                            └─► groupByWork ──► WorkColumn (identical working)
                                                     │
                                                     ▼
 app/teacher/TeacherMistakes.tsx ◄245   (one problem card)
   FitGrid columns = n ─ template: minmax(max(186, label need / span), 1fr) per column
   ┌──────────────────────────────┬───────────────────────────────┐
   │ ░ (x + 2)(x + 3) = 0 ░       │ ░ (x − 1)(x − 6) = 0 ░        │ row 1  label  (MistakeGroup.wrongLines, --label-fit) ◄245
   │ SO Sam   EK Ethan            │ LO Liam   OB Oliver           │ row 2  names  (WorkColumn.rows)
   │ ( monic factorising ───────────────────────────────────────) │ row 3  pill   (SlipGroup.slips)
   ├──────────────────────────────┴───────────────────────────────┤
   │ ┌ working, wrong line red ┐   ┌ working, wrong line red ┐    │ row 4  open only (--fit)
   └──────────────────────────────────────────────────────────────┘
   fit order: labels at 1 ► one factor ≥ 13/17 ► widen spans still over ► working --fit
```
