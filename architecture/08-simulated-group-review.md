# 08 · Simulated group review, two phases

Routes: `/student?stage=group-pass`, `/student?stage=group-discuss`. "Done reworking" lands on
the quick pass; "Finish group review" hands off to the report.

## Files touched

| File | What it does |
|---|---|
| `lib/group.ts` | `computePhases(problemIds, wrongSets)`: quick pass = problems in nobody's wrong set (intersection of correct sets), discussion = union of wrongs, total slips. `groupPlan(session)`: the demo student's slips (from `feedbackFor`) plus the three mock groupmates' fixture wrong sets → members, quick-pass problems, and a `DiscussionView` that carries only the problems, the member count, the total and the rounded per-member count |
| `lib/group.test.ts` | Intersection/union on a hand-built case and edge cases; the demo group (Q4 quick pass, Q1–Q3 discussion, 7 slips ≈ 2 each); the discussion view's keys are exactly `problems, memberCount, totalWrong, perMember` and its JSON contains no member ids, slips, wrong flags or verdicts |
| `lib/session.ts` | `talked[]`; actions `group/discuss` (→ `group-discuss`), `group/talked`, `group/done` (→ `report`) |
| `lib/session.test.ts` | Quick pass → discussion → report, remembering what was talked through |
| `app/student/screens/GroupScreens.tsx` | `GroupPassScreen`: members, each all-correct problem with the shared final line in a green band and a "thirty seconds, then move on" note. `GroupDiscussScreen`: the union with no markers, one sentence with the shared count, three discussion prompts per problem, a "Talked through" toggle |
| `app/student/StudentApp.tsx` | Both group stages wired; placeholder for the report (ticket 09) |

## How it connects

```
 feedbackFor(session).slips ─▶ mine = [q1,q2,q3]        CLASSMATES[jordan].wrong = [q2]
                                                          CLASSMATES[zara].wrong   = [q3]
                                                          CLASSMATES[liam].wrong   = [q2,q3]
                                         │
                                         ▼
                 computePhases([q1..q4], [mine, jordan, zara, liam])
                     quickPass = [q4]            discussion = [q1,q2,q3]   totalWrong = 7
                                         │
              ┌──────────────────────────┴──────────────────────────┐
              ▼                                                     ▼
   GroupPassScreen  (all-correct: final line shown, green)   GroupDiscussScreen  (no markers;
   "On to the discussion" ─▶ group/discuss                    "about 2 each"; talked toggles)
                                                              "Finish group review" ─▶ group/done ─▶ report
```

## Verified by

vitest (41 tests), `tsc --noEmit`, `npm run lint`, `npm run build`, and a CDP run: the quick
pass shows Q4 with the shared final line; the discussion lists Q1–Q3 with no correctness classes
on any row (the one blue element is Q3's difficulty tag, as everywhere else); three toggles;
"Finish group review" lands on the report stage. Screenshots of both phases fit the iPad frame.
