# 233: The student's report fits one screen, and working opens in its side column

## Files touched

| File | What it does |
| --- | --- |
| `app/student/screens/ReportScreen.tsx` | The student's report: compact title row, clickable Q tiles, the side column switching between key + reflection and the marked working, Send's nudge. |
| `lib/reportWork.ts` | What the side column shows (`ReportWork`), how a press changes it (`pressWork`), What happened's column template. |
| `lib/reportWork.test.ts` | Tests for the above. |
| `components/HierarchyDrill.tsx` | `ProblemWork` (one problem's marked lines, `narrow` for the column); `WorkPanel` built from it; `RowDrill` can hand the picked skill to its caller. |
| `components/SkillColumns.tsx` | Passes `pickedLeaf` / `onPickLeaf` to `RowDrill`. |
| `components/Tag.tsx` | `DifficultyTag` carries `data-difficulty`. |
| `tickets/233-report-work-column.md` | The ticket. |

## How it connects

```
 ReportScreen (student, one iPad screen)
 ┌ section ───────────────────────────────────┐ ┌ aside ─────────────────────┐
 │ Your report · What Ms Okafor sees  [→]      │ │ work == null:               │
 │ ┌ Skills card ─────────────────────────┐    │ │   KEY  (StatusKey)          │
 │ │ SkillColumns ─► RowDrill              │    │ │   REFLECTION  textarea      │
 │ │   skill row ──onPickLeaf──┐           │    │ │ work != null:               │
 │ └───────────────────────────┼──────────┘    │ │   [data-work-content]       │
 │ ┌ What happened ────────────┼──────────┐    │ │   ProblemWork(narrow)  ◄─ Q │
 │ │ Q tiles ──press──┐        │           │    │ │   WorkPanel(narrow)    ◄─ skill
 │ └──────────────────┼────────┼──────────┘    │ │                             │
 └────────────────────┼────────┼───────────────┘ │ [Send]  always at the foot  │
                      ▼        ▼                 └──────────────┬──────────────┘
              pressWork(work, pressed)  lib/reportWork.ts        │ press
                 same → null, other → pressed                    ▼
                                                  work ? close : (no reflection ? nudge : send)
 document click (capture): outside [data-work-content] / tile / skill row / Send → work = null

 TeacherReport ─► SkillColumns ─► RowDrill ─► WorkPanel (beneath, wide) ─► ProblemWork   (unchanged)
```
