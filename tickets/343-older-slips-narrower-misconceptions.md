# 343: Three older wrong lines carry the narrower misconception

**What to build:** relabel three older evaluation-table lines from the broad "brackets don't expand back" to the narrower misconception their maths fits, keep the fourth, and carry the change through every screen that reads misconception ids.

**Blocked by:** none (can start immediately).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Ticket 311's line check (`lib/stepCheck.ts`) found four older evaluation-table lines labelled "brackets don't expand back" (`brackets-dont-expand`) where the line fits a narrower misconception's own description (`data/misconceptions.ts`); `lib/stepCheck.test.ts` lists them in `NARROWER`. Asked, Carson (2026-09-15) said to relabel "if you deem it helpful/needed", and accepted the recommendation: relabel the three clear ones, keep the fourth.

| Set, question | Line | Writers | Now |
| --- | --- | --- | --- |
| PS3 Q5, x² + 2x − 15 | (x + 15)(x − 1): multiplies to −15, adds to 14 | Liam, Oliver | product right, sum wrong (`pair-sum-wrong`) |
| PS3 Q8, x² − 11x + 24 | (x − 2)(x − 12): multiplies to 24, adds to −14 | Jordan, Chloe, Ethan, Oliver | product right, sum wrong (`pair-sum-wrong`) |
| PS5 Q8, y = 2x² + 5x − 3 | y = (2x + 1)(x − 3): both signs swapped from (2x − 1)(x + 3) | Jordan, Ethan, Oliver, Sofia | signs swapped in the pair (`pair-signs-swapped`) |
| PS4 Q4, 2x² − 7x + 3 | (2x − 1)(x + 3) = 0: one sign differs | Mia | kept: brackets don't expand back |

## Acceptance

- [x] The three entries in `data/pset3/evaluation.ts` and `data/pset5/evaluation.ts` carry the narrower id, and their teacher-facing explanation and question say what is wrong in those words (the pair's sum; both signs swapped), nothing about checking
- [x] `NARROWER` in `lib/stepCheck.test.ts` keeps only PS4 Q4, with a comment saying why it stays broad
- [x] Every reader of misconception ids follows: the Mistakes tabs' pills and grouping, the report's red-line chips and commentary, `lib/misconceptionCounts.ts`, the Classroom's top gaps, the review rule, the holistic page and tiles, cross-set signatures (ticket 303), the class story sheet and its checks, `specs/class-story.md` regenerated with `npm run story:sheet`
- [x] Where a student's patterns change, the change is true to their lines, names say what is wrong (no process words), and the history pills do not move (statuses unchanged, the one-step test passes)
- [x] Group review outcomes unchanged on every finished set (the sheet's review part still equals the rules)
- [x] Screenshots before and after of PS3's and PS5's Mistakes tabs and of the holistic page of every student whose patterns changed, at 1280×800 and 1440×900 against a production build
- [x] vitest, eslint, tsc, next build, check:laptop
- [x] Ticket docs: `architecture/343-older-slips-narrower-misconceptions.md`, the ARCHITECTURE row, a DECISION_LOG entry, FUTURE_FEATURES

## What changes on screen

Nothing changes on Sam's iPad or the board: no student-facing screen shows these classmates' lines, and Sam wrote none of them.

- On **PS3's Mistakes tab**, the teacher sees Q5's (x + 15)(x − 1) (Liam, Oliver) and Q8's (x − 2)(x − 12) (Jordan, Chloe, Ethan, Oliver) under **product right, sum wrong**, one pill spanning them and the neighbouring column that already had it (Ruby's (x − 15)(x + 1) on Q5; Lucas's and Ruby's (x − 4)(x − 6) on Q8). Q9 still reads brackets don't expand back.
- On **PS5's Mistakes tab**, the teacher sees Q8's y = (2x + 1)(x − 3) (Jordan, Ethan, Oliver, Sofia) under **signs swapped in the pair**; Mia's (2x + 3)(x − 1) keeps brackets don't expand back and moves to Q8's right-hand column, halving step wrong to the middle.
- On **the Classroom**, the teacher sees PS3's top gaps lead with **product right, sum wrong** (7 students) in place of brackets don't expand back (7), then minus not carried through, and square and difference mixed under binomial identity, as before. PS5's read brackets don't expand back (**6**, was 7) and **signs swapped in the pair** (5) under Algebra, root or vertex sign wrong (5) under Graphing; x given where y asked (4) leaves the three.
- On **a student's report** for those questions (for example Oliver on PS3 Q8, Jordan on PS5 Q8), the teacher sees the red line's chip read the new name, and the Commentary name the pattern the new way: Liam PS3 "a pair that multiplies to −15 but adds to 14 · Q5"; Chloe and Ethan PS3 "a pair that multiplies to 24 but adds to −14 · Q8"; Oliver PS3 "a pair that multiplies but doesn't add · Q5 Q8"; Jordan, Oliver and Sofia PS5 "non-monic brackets wrong · Q4" and "the non-monic pair's signs swapped · Q8"; Ethan PS5 "the non-monic pair's signs swapped · Q8".
- On **Jordan's holistic page**, the teacher sees a second across-sets signature, **Minus signs wrong · 2 sets** (PS2's middle-term sign and PS5's swapped pair), and under Algebra "non-monic brackets wrong" on PS4 Q1, Q2, Q4 and PS5 **Q4**, then a new row "the non-monic pair's signs swapped" on PS5 Q8. His tile gains Minus signs wrong · 2 sets and loses the Algebra tag "a bracket's middle terms wrong expanding · 1 set", which the signature now covers.
- On **Oliver's holistic page**, the teacher sees the same new signature (Minus signs wrong · 2 sets), PS3's row read "a pair that multiplies but doesn't add" (Q5, Q8), PS5's non-monic row on Q4 only and a new row "the non-monic pair's signs swapped" on PS5 Q8. His tile gains Minus signs wrong · 2 sets and loses the Algebra tag "the middle term wrong expanding · 1 set".
- On **Sofia's holistic page**, the teacher sees PS5's non-monic row on Q4 only and a new row "the non-monic pair's signs swapped" on PS5 Q8; her tile gains that Algebra tag (1 set).
- On **Ethan's holistic page**, the teacher sees PS3's row read "a pair that multiplies to 24 but adds to −14" and PS5's "the non-monic pair's signs swapped" (was non-monic brackets wrong); **Factor pairs wrong** reads **2 sets** (was 3), since PS5's line is a minus sign now, and Minus signs wrong stays at 3 sets. His tile shows the same.
- On **Liam's** and **Chloe's** holistic pages, the teacher sees PS3's row read "a pair that multiplies to −15 but adds to 14" (Liam, Q5) and "a pair that multiplies to 24 but adds to −14" (Chloe, Q8); their tiles are unchanged.
- Every history pill and every group review outcome is unchanged. The review reasons in `specs/class-story.md` quote the new pattern words.

## Solution

- `data/pset3/evaluation.ts`: Q5's (x + 15)(x − 1) and Q8's (x − 2)(x − 12) take `pair-sum-wrong` with the sibling entries' wording ("The pair has to multiply to −15 and add to 2. 15 and −1 multiply to −15 but add to 14."; the question asks what the pair adds to). The unused `GUESSED_PAIR` constant goes; the header comment follows.
- `data/pset5/evaluation.ts`: Q8's y = (2x + 1)(x − 3) takes `pair-signs-swapped` (new `SIGNS_SWAPPED`): "The brackets hold the right numbers, but both signs are swapped: (2x + 1)(x − 3) has a middle term of −5x, not +5x." Q4's (3x − 4)(x + 2) and Q8's (2x + 3)(x − 1) keep the broad id.
- `lib/stepCheck.test.ts`: `NARROWER` keeps PS4 Q4 with the reason it stays broad; the agreement test now holds the three relabelled entries to the check's id.
- `data/story.ts` (the class story sheet): the patterns on those problems name the narrower misconception in what-is-wrong words. PS3: Liam "a pair that multiplies to −15 but adds to 14" (Q5), Chloe and Ethan "a pair that multiplies to 24 but adds to −14" (Q8), Oliver "a pair that multiplies but doesn't add" (Q5, Q8). PS5: Jordan, Oliver and Sofia split "non-monic brackets wrong" (Q4) from "the non-monic pair's signs swapped" (Q8); Ethan's Q8 reads the latter. Jordan's PS3 pattern over Q8 and Q9 stays one pattern (see Judgement calls). PS3's and PS5's `topGaps` follow, and the review part's reasons quote the new words. `specs/class-story.md` regenerated.
- `data/patternTags.ts`: the new pair wordings join each student's "factor brackets wrong" tag (Liam, Chloe, Ethan, Oliver), replacing wordings no longer on the sheet.
- `data/pset3/classmates.ts`, `data/pset5/classmates.ts`: each writer's report notes (the Commentary) match the sheet; doc comments describe the lines by what is wrong. The students' own words are unchanged.
- Tests: `data/pset3/pset3.test.ts` and `data/pset5/pset5.test.ts` (top gaps, Jordan's misconceptions, a new test per set holding the relabelled lines and every writer's commentary), `lib/holistic.test.ts` (Jordan's PS5 ref), `lib/holisticTiles.test.ts` (Jordan's two signatures).

## Verification

- vitest 2127 (106 files), then 2133 (107 files) after rebasing onto tickets 334 and 342, and 2149 (108 files) after rebasing onto 318; eslint, tsc, next build; check:laptop 76/76 against the production build on port 3643, before and after the rebase (the after page texts identical across the rebase).
- `shots343.mjs` (CDP 9943) at 1280×800 and 1440×900 before (main's build) and after: PS3's and PS5's Mistakes tabs, Holistic Assessment's tiles and the holistic pages of Jordan, Liam, Chloe, Ethan, Oliver and Sofia; after also the Classroom and Oliver's PS3 Q8 and Jordan's PS5 Q8 reports. No sideways scroll; the page texts diffed before against after give exactly the differences listed above; screenshots checked.

## Judgement calls

- On **Jordan's holistic page and PS3 group review**, the teacher still sees one pattern "a factor pair that multiplies to the constant, the brackets wrong" over Q8 and Q9, named brackets don't expand back, though Q8's line is now product right, sum wrong. Splitting it into two single-question patterns would make each a one-off, so PS3's review would send Jordan's Q8 and Q9 to his own rework instead of the group; both lines are factor pairs wrong (one family), and the words fit both.
- On **the holistic pages and reports**, the teacher reads the new swapped-signs pattern as "the non-monic pair's signs swapped", new words in the sheet's style, not Sam's "right split, signs in the wrong brackets" (these four wrote no split).
- On **the holistic pages and tiles**, the summaries (Jordan's "Factor brackets wrong: pairs that multiply to the constant but give the wrong middle term…", Liam's, Chloe's, Oliver's, Sofia's) are unchanged: each still holds of their lines.
- On **the report**, the students' own words ("I guessed the brackets in Q4 and Q8") are unchanged: they are the students' clarifications.
- On **PS4's Mistakes tab**, the teacher still sees (2x − 1)(x + 3) = 0 under brackets don't expand back, as Carson agreed.
