# 281: The class data follows the realistic group rules

## Files touched

| File | What it does |
| --- | --- |
| `lib/reviewRule.ts` | The rules, applied literally. A member brings every problem not right first time (`groupProblemsOf`); a one-off slip is fixed on their own rework; everything else is the group's, solved when a present member had it right first time (`rightFirstTime`), unsolved otherwise, save the set's one declared `exception` (checked by `wrongOnOneLine`). Bases: one-off, repeated, pattern, incomplete, not attempted. The 244 `conflict` and `unhelped` bases are gone. |
| `lib/classStory.ts` | `recordOutcomes` over every group problem; `reviewMismatches` (records vs sheet vs rules: second submissions, one group version per group, solved reworks hold, unsolved last tries wrong, sharing a real slip, never anyone's first submission, the exception qualifies, absent students left out); `hardestUnsolved`; `classReviewMismatches` (coverage = every problem a group left unsolved, one or two real wrong first submissions each, the sheet's picks); the markdown sheet's Review and Class review rules and each set's class review lines. |
| `data/recordReview.ts` | `GroupVersion` is always the group's own lines (`firstOf` gone); `SetReview.exception`; `withReview(records, review, problems, seating, absent)` writes review on every group problem (not attempted included), none for a student away; `ClassReview`, `ClassReviewPicks`, `classReviewFrom`. |
| `data/psetN/review.ts` | Regenerated second submissions and group versions; the unsolved problems' own last tries (`VIOLET_Q10`, `MINT_Q10`, `MINT_Q9`, `SKY_Q4`); `PS1_CLASS_REVIEW_PICKS`, `PS3_CLASS_REVIEW_PICKS`. |
| `data/pset1/index.ts`, `data/pset3/index.ts`, `data/finishedSet.ts` | `FinishedSet.classReview`, built from the picks off the records. |
| `data/pset1/assignment.ts`, `data/pset3/assignment.ts` | Pathways individual → group → class review. |
| `data/psetN/classmates.ts`, `data/psetN/evaluation.ts` | Liam's five problems on every set; the hardest-problem slips (violet's Q10 on Set 1: Ruby, Finn, Sofia; Harper's Q10 on Sets 2–4), each with the new lines in the set's table. |
| `data/classmates.ts`, `data/classmates-review.ts` | Liam's Set 6 (Q1–Q4 answered, Q5 started); the live set's review with its declared exception (sky, Q9, Zara) and last tries; `SET6_CLASS_REVIEW` from `SET6_CLASS_REVIEW_PICKS`. |
| `data/story.ts`, `specs/class-story.md` | Liam's row (done, PS3 and PS5 cells, arc); PS1, PS3, PS6 pathways; `STORY_REVIEW` regenerated with the new bases; `STORY_CLASS_REVIEW`. |
| `data/group-scripts.ts`, `data/race.ts` | Sam's group: Q4 pruned, Q5 scripted with Liam's slip first and his pen; `DEMO_PENS` without Q4; sky's unread race row nine long. |
| `data/patternTags.ts`, `data/diagnostic.ts` | Liam's "a bracket squared term by term" tag; his stale Q4 diagnostic pick removed. |
| Tests | `data/story.test.ts` (Set 6 review and the checker biting, no 244 conflicts, hardest problems, Liam, class review), `data/finishedSets.test.ts` (class review per set), `data/recordReview.test.ts`, `data/group-scripts.test.ts`, the per-set suites, and the suites the new records move (`lib/group`, `groups`, `demo`, `groupReview`, `standings`, `stream`, `mistakes`, `examples`, `diagnostic`, `report`, `setHistory`, `holistic`, `holisticTiles`). |

## How it connects

```
 data/psetN/classmates.ts ─┐   (first submissions: Liam's five, the hardest-problem slips)
 data/classmates.ts RECORDS ┤
                            ▼
                 lib/reviewRule.ts reviewByRule ◄281 ◄── data/story.ts STORY (gap cells, patterns)
                 │  groupProblemsOf: wrong | incomplete | not attempted
                 │  one-off ─► own rework
                 │  else ─► group: solved iff rightFirstTime(member) │ exception │ fixed (sky script)
                 ▼
     cases {student, q, basis, outcome}      groups {colour, q, solved, helpers, excepted}
                 │                                   │
                 ▼                                   ▼
 data/story.ts STORY_REVIEW ◄281          data/psetN/review.ts, data/classmates-review.ts ◄281
 (why per case, generated)                  second · groups{rework | own last try} · exception
 data/story.ts STORY_CLASS_REVIEW ◄281      *_CLASS_REVIEW_PICKS
                 │                                   │
                 │                                   ▼
                 │                  data/recordReview.ts withReview ─► Classmate.review
                 │                  data/recordReview.ts classReviewFrom ─► FinishedSet.classReview
                 │                                                          SET6_CLASS_REVIEW
                 ▼                                   │
 lib/classStory.ts reviewMismatches · classReviewMismatches · hardestUnsolved ◄281
                 │  (data/finishedSets.test.ts, data/story.test.ts hold all three to [])
                 ▼
 specs/class-story.md (npm run story:sheet)

 Sam's live group:  lib/group.ts groupPlan (union Q1–Q3, Q5–Q10) ─► data/group-scripts.ts GROUP_SCRIPTS, DEMO_PENS ◄281
                    data/race.ts RACE_SCHEDULE sky row (unread) ◄281

 Readers, unchanged code:  lib/report.ts recordReviews / outcomeOf ─► teacher report tiles (not-attempted problems now carry
                           group versions: solved ones sit under "Correct after group review")
                           ticket 282 reads Classmate.review and the ClassReview data for its column
```

The first submissions change only where the plan says (Liam, the hardest-problem slips), so every Class View status, history pill, Mistakes row and diagnostic count moves only there; `data/finishedSets.test.ts` and the jump test hold the rest.

## Verification

- vitest, `npx tsc --noEmit`, `npx eslint .`, `npx next build`, `check:laptop`.
- `mist281.mjs`: every set's Mistakes view with every problem open at 1280×800 and 1440×900 (no card scrolling sideways, no maths wider than its cell, split or under 13 px; PS3 Q10's and PS4 Q4's five columns fit).
- `click281.mjs` (ticket 244's `click244.mjs` on ticket 281's expectations), `fit281.mjs`, `flow281.mjs` (ticket 278's `flow278.mjs` on the nine-problem board).
