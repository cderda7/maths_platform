# 278: Group review takes every problem a member got wrong, left incomplete, or did not attempt

**What to build:** A member brings to their group every problem they did not get right first time: one with a mistake, one started and left incomplete, and one not attempted. Everything that reads a group's problems follows (the board and its intro, standings and progress, the teacher's group card, the projector's leaderboard, the class stage's done count, the skip fixtures). Sam's live Set 6 group gets a longer board, every added problem scripted, the scripted race re-timed, and the demo pathway becomes individual → group → class review.

**Blocked by:** 250, 244.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), looking at Jordan's Set 5 report, where two groupmates had Q8 right and the group still left it unsolved, and his unattempted Q9 and Q10 never reached his group:

- "have all non-attempted, incomplete, or mistake problems surfaced in group review"
- "surely a group member would be able to convince him of their functional strategy & get the group to get the right answer within 2 or 3 rounds of tries"
- "want to model process for questions that nobody in a group can do, a real world reality — ALSO add column … 'covered in class review'"

Settled in the same conversation, for this ticket:

- The rule replaces ticket 250's "never a problem they did not attempt", for the live student and for records. Absent members are still left out.
- Sam's live group gets a longer board, and that is accepted (11a).
- The group solves a problem when at least one present member had it right; its first try shows a slip a member really made and a later try holds within 2–3 tries. A problem nobody present had right is left for now and closed unsolved on its return (tickets 221–222).
- The demo pathway becomes individual → group → class review (14a). Create's new set stays undecided.
- Classmate records do not change here: ticket 281 makes Liam attempt at least five problems per set, which shrinks Sam's group union, and re-derives the scripts. The class review column on the report is ticket 282's.

## Solution

- `lib/group.ts`: `reviewProblemsOf` (the live session) takes every problem that is not finished without a wrong line; `recordReviewProblems` (a record) every problem not inside `done` and off the wrong list. `groupPlan`, `lib/standings.ts` (`wrongOf`, the unions, totals and percents), the teacher's group progress card, the board's leaderboard and `stageDone("group")` all read these, so they follow with no change of their own.
- `lib/groupIntro.ts`: the intro's first paragraph reads "at least one of you made a mistake on or didn't finish", since a problem can now be on the board with no mistake on it.
- `data/group-scripts.ts`: Sam's group (Sam, Jordan, Zara, Liam) now works all ten problems. Scripts stay keyed by problem, each entry's reasoning in the header comment, so ticket 281 prunes or extends entries. `DEMO_PENS` gains the four added problems; it stays named simulation-only data beside the shuffle (`dealPens`).
- `data/race.ts`: `RACE_SCHEDULE` re-timed for the longer unions (mint 8, amber 7, coral 8, violet 9, sky 10). Mint and amber finish at 4:15 and 4:25, before the demo group's quickest board (about 5:40). Coral and violet finish at 10:10 and 11:00, four minutes of presenter slack after it. Every gap is 30–100 s.
- `lib/demo.ts`: the report and homework jumps' finished run begins 12 minutes ago and finishes 5 minutes ago (was 10 and 4), so every scripted group is home on the holding board.
- `lib/pathway.ts`: `DEFAULT_PATHWAY` is individual → group → class review (a deep link with no set sent, `DEFAULT_ENV`, `pathwayOf` with no assignment). `scripts/laptop-check.mjs` creates the set with `?pathway=indiv,group,class`.

### Sam's group, before and after

| | Before (ticket 250 rule) | After (this ticket) |
| --- | --- | --- |
| Sam | Q1 Q2 Q3 Q7 Q10 wrong, Q9 incomplete | same |
| Jordan | Q2 Q7 | Q2 Q7 wrong, Q8 Q9 Q10 not attempted |
| Zara | Q3 Q7 Q9 | same |
| Liam | Q1 Q2 Q3 | Q1 Q2 Q3 wrong, Q4–Q10 not attempted |
| Union | Q1 Q2 Q3 Q7 Q9 Q10 (14 member-problems) | Q1–Q10 (24 member-problems) |

| Problem | Pen | Who had it right | Tries on the board | Outcome |
| --- | --- | --- | --- | --- |
| Q4 (added) | Liam | Sam, Jordan, Zara | the model working, holds | solved |
| Q5 (added) | Jordan | Sam, Jordan, Zara | the model working, holds | solved |
| Q6 (added) | Zara | Sam, Jordan, Zara | the model working, holds | solved |
| Q8 (added) | Jordan | Sam, Zara | the model working, holds | solved |
| Q9 (changed) | Liam | nobody | Zara's slip (the axis as the height); the same slip on Sam's working, and the hint names it; the height substituted, holds | solved (the exception, below) |
| Q1, Q2, Q3, Q10 | as before | Q1 Jordan and Zara, Q2 Zara, Q3 Jordan, Q10 Zara | unchanged | solved |
| Q7 | Sam, both visits | nobody | unchanged (three wrong, left for now, wrong on its return) | unsolved |

### Judgement calls (the plan did not cover them; the most conservative option taken)

- **Q9 is a problem nobody present had right.** Closing it unsolved would change Zara's Set 6 record, the story sheet's review part and Sam's report, all of which this ticket was told not to touch. It is scripted by ticket 281's agreed exception instead (7b / 12a): Zara's first submission is wrong on one line, the hint after the group's second wrong check names exactly that slip, and the third try holds. On Sam's iPad this adds one more wrong try and the hint on Q9; nothing else a student or teacher sees changes. Ticket 281 re-derives it.
- **Q4, Q5, Q6 and Q8 have no slip at the table** (only Liam, and Jordan on Q8, never reached them), so there is no real slip for a first try to show. The group's first try is the right working and holds.
- **Pens for the added problems** go to the members who never reached them (Liam Q4, Jordan Q5 and Q8) and to Zara (Q6), not to Sam. The presenter still writes only Q1 and both visits to Q7, and nobody holds the pen more than three times across the eleven visits.
- **The intro's wording** changes by four words (above), because "at least one of you made a mistake on" is no longer true of every problem on the board.
- **The retired "suggested by mistakes" groups** (behind `SHOW_SUGGESTED` on the Groups page) keep mistakes only for the other groups. Only the live group, read through `groupPlan`, follows the new rule.

## Acceptance

- [x] Unit (`lib/group.test.ts`): mistake, incomplete and not attempted all count for the live student and for a record; right first time does not; absent members bring nothing; Sam's group's union and total
- [x] Unit (`data/group-scripts.test.ts`): the union is all ten; a script and a pen for exactly the union, every line in the table; every problem a member had right is solved within three tries, its first wrong try a slip a member made; every problem nobody had right is unsolved (three wrong, then a wrong return) except at most one by the exception, Q9; the four added problems hold first time; Sam's own turns read their scripts
- [x] Unit (`lib/standings.test.ts`): the demo group's percents across ten problems; the other unions and totals; two groups home before the demo group's quickest board and two after four minutes' slack, all inside twelve; every gap 30–100 s; the holding board after the report jump
- [x] Updated: `lib/demo.test.ts`, `lib/groupReview.test.ts`, `lib/report.test.ts`, `lib/absence.test.ts`, `lib/groups.test.ts`, `lib/groupIntro.test.ts`, `lib/session.test.ts`, `lib/classStage.test.ts`, `lib/review.test.ts`, `data/story.test.ts`
- [x] Click-through `flow278.mjs` (58/58 at 1440×900 and 58/58 at 1280×800, student iPad, teacher Class View and projector together): the intro's ten tiles in two even rows inside the screen and its wording; the board visits Q1–Q10 then Q7's return with the demo pens; Sam's pen reads the script on Q1 and Q7's three tries; every problem's tries equal its script line for line with its checks as scripted; Q9's hint names the axis-as-height slip; a debrief after every closed problem, all resolved but Q7; every bar on the board and the teacher's card only climbs, no jump over a quarter within six seconds, nobody home in the first half minute, and mint and amber home (coral and violet not) when the demo group finishes at about 5:00 with an instant presenter; then Sam waits, Class View reads four stages, class review projects, Sam freezes after the grace, End opens his report with ten tiles; no sideways scroll or error overlay
- [x] vitest 935, eslint, tsc, next build, check:laptop 74; `notyet235.mjs` 55/55 and `try238.mjs` 32/32 re-run (fast-forward moved to Q7's new place, index 6)
