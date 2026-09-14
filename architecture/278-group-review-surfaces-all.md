# 278: Group review takes every problem a member got wrong, left incomplete, or did not attempt

## Files touched

| File | What it does |
| --- | --- |
| `lib/group.ts` | The rule. `reviewProblemsOf` (live session): every problem not finished without a wrong line. `recordReviewProblems` (a record): every problem outside `done` or on the wrong list. `groupPlan` unions them over the present members. |
| `lib/groupIntro.ts` | The intro's first paragraph: "at least one of you made a mistake on or didn't finish". |
| `data/group-scripts.ts` | Sam's group's board, keyed by problem: all ten problems scripted (Q4, Q5, Q6, Q8 added, Q9 given a third try), `DEMO_PENS` for all ten (simulation-only pens). |
| `data/race.ts` | `RACE_SCHEDULE` re-timed for the longer unions (mint 8, amber 7, coral 8, violet 9, sky 10). |
| `lib/demo.ts` | The report and homework jumps' finished run: begun 12 min ago, finished 5 min ago, so every scripted group is home. |
| `lib/pathway.ts` | `DEFAULT_PATHWAY` = individual → group → class review. |
| `scripts/laptop-check.mjs` | `CREATE_SET` sends the set with `?pathway=indiv,group,class`. |
| `data/group-scripts.test.ts` | New. The union, scripts and pens cover it, every scripted outcome follows the rule. |
| `lib/*.test.ts`, `data/story.test.ts` | Updated to the ten-problem union, the new percents and timing, and the three-stage default pathway. |

## How it connects

```
 Sam's session ─► reviewProblemsOf ─┐          (wrong line | incomplete | not attempted)
                                    ├─► lib/group.ts groupPlan / computePhases ─► union (Q1–Q10)
 CLASSMATES ────► recordReviewProblems ┘          ▲ absent members left out (liveAbsent, presentGroups)
                                    │
        ┌───────────────────────────┼─────────────────────────────────┬──────────────────────────────┐
        ▼                           ▼                                 ▼                              ▼
 StudentShell group/begin     lib/standings.ts                   lib/demo.ts                   lib/groups.ts
 (union + DEMO_PENS)          wrongOf · unionOf · totals          skip "group review" begin     suggested g1
        │                     live: groupProgress(run)            finishedRun (report,          (hidden view)
        ▼                     others: RACE_SCHEDULE ◄── data/race.ts   homework, class review)
 lib/groupReview.ts                 │
 visitsOf · turnScript ◄── data/group-scripts.ts GROUP_SCRIPTS (keyed by problem; 281 prunes/extends)
 ownAttemptScript                   │
        │                           ├──► app/board/Leaderboard (projector race)
        ▼                           ├──► app/teacher/GroupProgressCard (teacher's card)
 GroupIntro · GroupBoardScreen      ├──► app/student/screens/GroupBar (iPad bar)
 GroupDebrief (StudentApp)          └──► lib/classStage.ts stageDone("group")

 lib/pathway.ts DEFAULT_PATHWAY = individual → group → whole-class
        ├──► lib/classroom.ts pathwayOf (no assignment)
        ├──► lib/session.ts DEFAULT_ENV: group/done ─► "waiting" (class review) ─► frozen ─► report
        └──► lib/demo.ts deepLinkClassroom (a named stage with no set sent)
```

## Verification

- vitest (every suite), `npx tsc --noEmit`, `npx eslint .`, `npx next build`, `check:laptop` 74/74.
- Click-through `flow278.mjs` at 1440×900 and 1280×800: student iPad, teacher Class View and projector together. It skips into group review and checks the intro's ten tiles and wording. The board then visits Q1–Q10 and Q7's return in order with the demo pens; Sam's pen turns read their scripts. Every problem's tries equal its script line for line, with its checks right or wrong as scripted. Q9's hint names the axis-as-height slip. A debrief follows every closed problem; all resolved but Q7. Every bar only climbs on the board and the teacher's card, nobody is home in the first half minute, and mint and amber finish before the demo group. Then Sam waits, the Class View reads four stages, the teacher projects class review, Sam freezes after the grace, and End releases him to his report.
