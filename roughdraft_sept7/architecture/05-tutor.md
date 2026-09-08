# 05 · Tutor chat + live evaluation

Commit `5646e90`. Route `/student/tutor`.

## Files touched

| File | Role |
|---|---|
| `app/student/tutor/page.tsx` | Server wrapper. Parses `?turn=&help=` into `initialTurn` / `initialHelp`. |
| `app/student/tutor/TutorScreen.tsx` | Client component. Two-column layout: scripted chat on the left advancing through `CHAT_SCRIPT`, live `StepTrace` on the right that updates as turns reveal steps. Help picker (example / hint / video) opens `HelpContentView` with `HELP_Q4`. |

## How it connects

```
  URL ?turn=5&help=example
        │
        ▼
┌────────────────────────┐          ┌──────────────────────────────────────┐
│ tutor/page.tsx (server)│─────────▶│ tutor/TutorScreen.tsx (client)       │
└────────────────────────┘          │  state: turn, pickedHelp             │
                                    └──┬───────────────┬──────────────────┘
                                       │ data          │ components
                                       ▼               ▼
                   chat.ts  CHAT_SCRIPT ─┐      HelpPicker / HelpContentView
                            CHAT_PROBLEM_ID│      StepTrace + MarkerLegend
                            HELP_Q4 ───────┼────▶ M · BrandMark (tutor avatar)
                   problems.ts PROBLEM_MAP │      DifficultyTag SubskillChip
                   subskills.ts SUBSKILL_MAP      Card Button Avatar
                                           │
   ChatTurn[turn].trace ───────────────────┘──▶ EvalStep[] snapshot after this turn
```
Chat and evaluation are the same data walked from two sides: each `ChatTurn` carries a `trace`
snapshot (and optional `surfaced` subskills, `offerHelp`), so the trace grows in lock-step with the conversation.
