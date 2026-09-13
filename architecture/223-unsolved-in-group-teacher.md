# 223: A problem a group could not solve shows up for the teacher and on the report

## Files touched

| File | What it does |
| --- | --- |
| `lib/groupReview.ts` | `stuckProblems`: the problems left for now or closed unsolved, with their tries. |
| `lib/standings.ts` | `GroupStanding.stuck` for the live group (none for the scripted groups). |
| `app/teacher/GroupProgressCard.tsx` | The class view's group review card: the red line under the demo group's bar. |
| `lib/examples.ts` | `ExampleOption.unsolvedInGroup` for class review's example picker. |
| `app/teacher/whole-class/ExamplePicker.tsx` | The "not solved in group review" badge on a slot and in its menu. |
| `lib/report.ts`, `app/student/screens/ReportScreen.tsx` | `unsolvedInGroup`; the note under the report's Incorrect column. |
| `lib/*.test.ts` | stuckProblems, standings, example options, report. |

## How it connects

```
 GroupRun (ticket 222: left, unsolved, attempts)
    │
    ├─► stuckProblems ─► standingsAt ─► GroupProgressCard   /teacher/a/<id>/class
    │                                    "Q7 left for now after 3 tries"
    │                                    "Q7 not solved after 4 tries"
    │
    ├─► optionsFor(ctx.group) ─► unsolvedInGroup ─► ExamplePicker   /teacher/whole-class
    │                                                "NOT SOLVED IN GROUP REVIEW"
    │
    └─► unsolvedInGroup(session, pathway, run) ─► ReportScreen      /student report
                                                   Incorrect: [Q7]  "Q7 not solved in group review"
```
