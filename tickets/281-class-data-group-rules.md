# 281: The class data follows the realistic group rules

**What to build:** Every set record (Problem Sets 1–6, all twenty students) follows the group rules the user settled on 2026-09-14. Liam attempts at least five problems on every set. A group solves a problem when a present member had it right. A problem nobody at the table had right stays unsolved, and on every set one or two groups meet such a problem on purpose. A group's last try is freshly written. Class review runs on PS1, PS3 and PS6, and records say which problems it covered and with which examples. Sam's live group scripts are re-derived from the new union.

**Blocked by:** 278.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), looking at Jordan's Set 5 report: ticket 244's literal rules left his Q8 unsolved beside two groupmates who had it right, reused his own lines as the group's try, and never took his unattempted Q9 and Q10 to his group.

- "have all non-attempted, incomplete, or mistake problems surfaced in group review" (built as ticket 278)
- "surely a group member would be able to convince him of their functional strategy & get the group to get the right answer within 2 or 3 rounds of tries"
- "want to model process for questions that nobody in a group can do, a real world reality — ALSO add column … 'covered in class review'" (the column is ticket 282)

Settled in the same conversation:

- **Liam (6a):** attempts at least 5 of 10 problems on every set (1–6). New work is written so every category status on the class story sheet stays exactly the same: right where the sheet says secure, a slip that matches his existing habit where it's a gap. History pills don't move.
- **Solved in group:** a group solves a problem if at least one present member had it right, habits included. The group's tries show the slip before one holds, within 2–3 tries.
- **Unsolved in group (7b / 12a):** a problem nobody present had right stays unsolved, with one rare exception. At most once per set a group solves it, and only when one member's first submission went wrong on a single line and the hint after the group's second wrong check points at exactly that slip, so the third try holds.
- **Problems no one at the table can do (8a):** on every set, one or two groups fail the set's hardest problem (Q9/Q10, complex unfamiliar). Where a member has it right now, their first submission becomes a real slip, with story sheet statuses unchanged. PS2, PS4 and PS5 keep these too (13a).
- **A group's last try (5a)** on an unsolved problem is freshly written group working, never a member's first submission reused.
- **Not attempted:** problems a student didn't attempt join their group's problems (ticket 278) and get outcomes by the same rules.
- **Class review (10, 15a):** runs on PS1, PS3 and PS6 only. Records say which problems class review covered: every problem at least one group left unsolved. Each covered problem gets one or two anonymous example picks taken from real wrong working in the class. PS2, PS4 and PS5 pathways stay individual → group.

## Solution

- **Liam's records:** at least five attempted problems on each set, written against the story sheet so every status cell and history pill is unchanged (`data/story.test.ts`, `lib/setHistory.test.ts` hold them).
- **Review outcomes:** `lib/reviewRule.ts` and its tests move to the rules above. The nine "conflict" cases (a habit carried by the group's single rework) and the 45 "habit unsolved beside helpers" cases from ticket 244 disappear. Every group version is re-derived: solved where a present member had it right, unsolved otherwise (the exception at most once per set), a fresh last try on every unsolved one.
- **Hardest problems:** one or two groups per set fail Q9 or Q10; any member who had it right gets a real slip in its place, statuses unchanged.
- **Class review:** finished sets PS1 and PS3 gain class review in their pathways; each record set says which problems class review covered (every problem some group left unsolved) and one or two anonymous example picks per problem from real wrong working.
- **Sam's group scripts:** re-derive the live Set 6 union once Liam's Set 6 attempts change (ticket 278 scripted all ten problems with today's records, Q4, Q5, Q6 and Q8 only because Liam never reached them). Prune or extend `GROUP_SCRIPTS` and `DEMO_PENS` entries to match, and revisit Q9, scripted in 278 by this ticket's exception so Zara's record could stay unchanged.
- **Race:** re-time `data/race.ts` if the unions change again (ticket 278's test holds two groups before the demo group and two after).
- **Story sheet:** `data/story.ts` and `specs/class-story.md` gain the new review and class-review parts.
- **Future features:** a student who hands in only 2 of 10 (an extreme edge case, user).

## Built (2026-09-14)

- **The rule** (`lib/reviewRule.ts`, literal): a member brings every problem not right first time; a one-off slip is fixed on their own rework; everything else is the group's, solved when a present member had it right *first time*, otherwise closed on the group's own last try; the set's declared exception (`SetReview.exception`) only where nobody had it right and the member's first submission went wrong on one line. Bases: one-off, repeated, pattern, incomplete, not attempted.
- **Liam** hands in five on every set: PS1 Q1–Q5 (Q3, Q4 surd slips, Q5 right from √60), PS2 Q1–Q5 (Q4 the difference of squares added), PS3 Q1–Q5 (Q2 term by term, Q5 a guessed pair), PS4 Q1–Q5 (every line algebra: Q3 and Q4 the fraction flipped, Q5 one root by trying), PS5 Q1–Q5 (Q1 the intercepts' signs, Q4 a guessed pair), PS6 Q1–Q4 answered (Q4 right) and Q5 started (the roots' signs flipped). Every status on Sets 1, 2, 4 and 6 is unchanged, not seen included; Sets 3 and 5, where he had handed nothing in, now read results one step from his neighbours.
- **Hardest problems nobody at the table can do:** PS1 violet Q10 (Ruby, Finn and Sofia given slips: a square factor left under the root, the diagonal divided by √2); PS2, PS3, PS4 mint Q10 (Harper, mint's only helper, given a repeated slip each: a square's middle term not doubled, x² − x² collected as 2x², the 3w's sign lost rearranging); PS5 mint Q9 and Q10 and PS6 mint Q10 already had nobody. Every status unchanged; the new lines are in each set's table.
- **Group versions** regenerated (`data/psetN/review.ts`, `data/classmates-review.ts`): 23 / 1, 29 / 1, 31 / 1, 37 / 1, 33 / 3 and 37 / 4 group problems solved / unsolved on PS1–PS6, the only exception PS6 sky Q9 (Zara). Each unsolved problem's last try is the group's own working: violet Q10 (PS1), mint Q10 (PS2, PS3, PS4), mint Q9, mint Q10, sky Q4 (PS5), mint Q7, mint Q10, violet Q7 (PS6).
- **Class review** on PS1, PS3 and PS6 (pathways individual → group → class review): PS1 Q10 (Finn, Oliver), PS3 Q10 (Isla, Lucas), PS6 Q7 (Isla, Zara) and Q10 (Isla, Lucas), each a real wrong first submission (`ClassReview` on `FinishedSet.classReview`, `SET6_CLASS_REVIEW`).
- **Sam's group:** union Q1–Q3 and Q5–Q10 (Q4 left: all four had it right); Q5 plays Liam's slip, his pen, then holds; Q9 keeps the exception; pens as before but Liam writes Q5 (Q4's pen gone); the race's sky row nine long; timing tests unchanged (two groups home before the demo group, two after).
- **The sheet** (`STORY_REVIEW` regenerated with the reasons, `STORY_CLASS_REVIEW` new, `specs/class-story.md`).

## Acceptance

- [x] Unit: Liam attempts at least five problems on every set; every status and history pill unchanged where the sheet saw his work (Sets 3 and 5 read his new work); every group version by the rules (solved iff a present member had it right, save the single-line exception at most once per set); every unsolved last try is not any member's first submission; one or two groups per set fail Q9/Q10; class review only on PS1, PS3, PS6, covering exactly the problems some group left unsolved, with one or two real wrong examples each; the checker bites
- [x] Sam's group union, scripts and pens re-derived; `data/group-scripts.test.ts` passes on the new union
- [x] Click-through: every report on every set shows the sheet's outcomes; Sam's live group review plays the re-derived board
- [x] vitest, eslint, tsc, next build, check:laptop
