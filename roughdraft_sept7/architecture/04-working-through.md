# 04 · Working through (differentiated pacing flow)

Commit `6d13480`. Route `/student/work`. The most stateful screen.

## Files touched

| File | Role |
|---|---|
| `app/student/work/page.tsx` | Server wrapper. Parses `?who=&stage=&phase=` into a `WorkFlowInit` and passes it down so reviewers can deep-link mid-flow. |
| `app/student/work/WorkFlow.tsx` | Client component. Priya / Jordan toggle with independent state per student; walks `FLOWS[who]` stage by stage: confidence check → submit → `StepTrace` evaluation → `NextStep` card (warm-up / stretch / continue, always declinable) → path strip. |

## How it connects

```
  URL ?who=jordan&stage=1&phase=evaluated
        │
        ▼
┌───────────────────────┐  init   ┌───────────────────────────────────────┐
│ work/page.tsx (server)│────────▶│ work/WorkFlow.tsx (client)            │
└───────────────────────┘         │  state: {who, stage, phase, conf}×2   │
                                  └──┬──────────────┬───────────────┬─────┘
                                     │ data         │ components    │ types
                                     ▼              ▼               ▼
                         flows.ts    FLOWS     StepTrace + MarkerLegend   FlowStage
                         problems.ts PROBLEM_MAP  ConfidenceCheck          NextStep
                         subskills.ts SUBSKILL_MAP  M · DifficultyTag      Confidence
                         students.ts  STUDENT_MAP   SubskillChip
                                                    Card Button Avatar …

  FlowStage[n] ──▶ { problemId, confidence, evaluation: { steps: EvalStep[], exercised, next: NextStep } }
                    └── rendered by StepTrace          └── "natural next step" card
```
The flow data, not the component, decides the route. The component only reveals what has been
visited plus a dashed "next".
