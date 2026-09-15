# 332: Group review works what is still wrong after individual review

**What to build:** each group in group review works only the questions a present member still has wrong, left incomplete or did not attempt once individual review is over. A question every member has right after their corrections never reaches the group. A student who fixed a question in individual review can explain it to the group, just like one who had it right first time. A group with nothing left sits out group review entirely. Problem Set 6's live demo data (Sam's sky group and the other four) is regenerated to the rule, with every group's turns simulated as fully as sky's.

**Blocked by:** none (can start immediately).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Review-control grilling with Carson, 2026-09-15. Today a group works every question any member did not get right *first time* (ticket 278), so a slip a student fixed on their own in individual review still goes to the group. Carson: "if every member of the group has a problem right after indiv review, doesn't count in union of mistakes. otherwise, we jeopardize making indiv review seem pointless."

Settled in the same grilling and in the 318/319 design session (both with Carson, 2026-09-15):

- **Union:** per member, the questions still not right after individual review (a wrong or missing second submission, incomplete, not attempted). On a pathway without individual review, first submissions, as today.
- **Helpers:** a present member who had the question right first time **or** right after individual review can explain it. With a helper at the table, the group gets it right in the 1st or 2nd round, and the question is never left for now.
- **A group with an empty union** is left out of group review entirely. Its members go straight to the stage after group review, and their iPads say their group has nothing left to review. The group gets no column in ticket 319's grid and is not counted in the group race (the progress card, race, standings and leaderboard): five groups with one sitting out reads as four.
- **Set score** stays first submission (ticket 285); nothing here changes it.
- **The student ladder is unchanged:** a hint after 2 wrong checks, left for now after 3, one return visit, wrong again means unsolved.
- **The gate into group review** still opens by itself once everyone has arrived, but the demo's classmate arrivals are stretched so the whole arrival takes about a minute. That gives ticket 337's card time on screen. Keep this as named demo timing, separate from the product rule (the demo-exceptions rule).

This ticket blocks the 318/319 grid, which reads these runs.

## Solution

- One pure rule decides a member's review questions after individual review, and one decides whether a present member can explain a question. The live board, the group plan, standings, the race, the progress card, the stage's done count and the record-review checks all read them; no second copy.
- Groups with an empty union are filtered out where groups are listed for group review, so every count of groups follows.
- **Problem Set 6 data regenerated to the rule:** Sam's live group, the classmates' review records, and the other four groups' simulated turns (pens, wrong checks, hints, left for now, return visits, as detailed as sky's script) so a per-group grid can show them.
- **Demo outcomes Carson asked for** (check each against the helper rule; if a helper at a table has a question right, that table solves it in 1–2 tries, so pick another question for that outcome and say which):
  - at least one question per group that nobody at the table can do
  - somewhere, a question left for now then solved on the return visit: sky's Q9 (nobody in sky right after individual review; Zara's second submission and Sam's scripted rework stay not right)
  - somewhere, a question left for now then unsolved
  - the 318/319 session's list as the starting point: mint Q7, violet Q7 and sky Q7 left for now then unsolved; mint Q10 unsolved
- The classmates' arrival times at the group review gate are re-timed so arrivals run about a minute after Sam hands in his corrections, and the race is re-timed around the new unions.
- Past sets keep their authored review outcomes until ticket 338. Until then the rule check runs on Problem Set 6 only.

## Acceptance

- [x] Unit: the union after individual review for right first time, fixed in rework, wrong again, incomplete, not attempted and absent; first submissions on a pathway without individual review; the helper rule with a right-first-time helper, a fixer, and nobody; an empty union leaves the group out of the group list, the race, the standings and the stage's group count
- [x] Unit: every Problem Set 6 group's union and outcomes follow the rules, each group has a question nobody at the table can do, sky's Q9 is left for now then solved, and one question somewhere is left for now then unsolved
- [x] Set scores on every set unchanged (the tests say so)
- [x] Click-through against a production build at 1280×800 and 1440×900, with Sam's iPad and the teacher tab: Sam's group board visits exactly the new union with its pens and scripts, sky's Q9 goes left for now then solved on the return, the progress card and race show the right number of groups with the right fractions, bars only climb, the gate's arrivals take about a minute; if a group sits out, its members' iPads say so and it is missing from every group count. Screenshots checked
- [x] vitest, eslint, tsc, next build, check:laptop
- [x] Ticket docs: `architecture/332.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES, README
- [x] Tell the 318/319 session (or Carson) the final outcome list per group
