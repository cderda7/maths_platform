# 210: Groundwork for four earlier sets: registration, shared checks, the class story sheet

**What to build:** Adding a finished set to the Classroom is one self-contained data folder plus one registration line, so four agents can each add a set without touching the same code. A shared test suite runs over every finished set (twenty students, every step tagged with a real leaf, every wrong problem with worked attempts, New skills named and tagged in the problems, Priya dark green in every category, the set's results matching the story sheet). A **class story sheet** fixes, for every student and every category, the colour on each of Problem Sets 1–6, so the four new sets agree with each other and with Sets 5 and 6.

**Blocked by:** 209.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Four sets (211–214) are authored in parallel worktrees. Without a shared registry shape they collide on the registry, the evaluation index and the tests; without a shared story they contradict each other. The user (2026-09-13): students "have a level of consistency between assignments (obviously wnat variation, but don't want random jumping)": neighbouring results in a category move at most one step (red ↔ orange ↔ light green ↔ dark green). Existing habits carry: Jordan's unchecked factor pairs, Mia's non-monic factorising, Aiden scaling part of an expression, Grace right in one jump, the axis-for-height slip (Zara, Ethan, Isla, Ruby), Liam handing in little, Chloe missing on Set 6, Priya dark green throughout.

## Solution

- A finished-set module shape (fixture, pathway, Sam, classmates, evaluation table) and a registry that reads a list of them, newest first; the evaluation index built from the same list.
- The Set 5 integrity tests generalised to run over every registered finished set.
- `specs/class-story.md`: per student, per category, per set the status (and the one or two habits that produce it), Sets 5 and 6 read back from the real data; per set the topic, date, New skills, who is missing and the class's top gap. One-step rule checked by a test that reads the sheet.
- The ticket files for 211–214 point at the sheet's rows.

What was built:

- **The shape** (`data/finishedSet.ts`): `FinishedSet { fixture, name, pathway, sam, classmates, evaluation, groups? }`. A set is one folder `data/psetN/` whose `index.ts` exports `PSN`; problem ids `psN-qK`.
- **One list** (`data/finishedSets.ts`): one `export { PSN } from "./psetN";` line per set, with commented slots for PS1–PS4 separated by blank lines (tested in a scratch repo: neighbouring one-line changes conflict, blank-separated ones merge in any order). `lib/finishedSets.ts` reads every export and orders by due date (`dueOrder`, moved to `lib/dueDate.ts`, re-exported from `lib/classroomCards.ts`). Built from it: the registry (`lib/assignments.ts`, the live set then finished sets newest first; `assignmentIds`, `earlierAssignmentIds`, `assignmentBundle`, `isAssignmentId`, `recentSets` unchanged), the evaluation index (`lib/evaluate.ts`), a finished set's frozen groups (`lib/seating.ts`; `FROZEN_GROUPS` keeps only the live set). `scripts/laptop-check.mjs` has matching slots.
- **Set 5** moved onto the shape (`data/pset5/index.ts`) with no behaviour change (the full suite passed unchanged before any data edit).
- **The shared suite** (`data/finishedSets.test.ts`, `describe.each` over the list): ids and dates, no problem id shared, the sheet's name/title/due/New skills/pathway, ten problems touching exactly the sheet's categories and carrying the outline's leaves, New skills each in two or more problems, every step tagged and holding, every verdict tagged and every wrong line with clue/note/short name, twenty students in class order, complete records, Priya secure everywhere, **every student × category equal to the sheet** (status, hand-in count, each habit on a problem where they missed that category), the bundle, frozen groups, stages, earlier sets, the Classroom card (submitted, the sheet's top gap) and Mistakes counts. Proven by two deliberate breaks (Priya given a wrong Q3; a single-backslash evaluation key): 3 and 2 tests failed, then reverted.
- **The story sheet**: `data/story.ts` is the single source (typed: 20 students × 6 categories × 6 sets, `done` per set, an arc sentence, 1–2 habits with problem numbers for every result short of secure; per set topic, due, New skills, pathway, categories, a ten-problem outline with leaves for Sets 1–4, top gap). `specs/class-story.md` is generated from it by `npm run story:sheet` (`lib/classStory.ts` renders it; `data/story.test.ts` fails while it is stale). `data/story.test.ts`: twenty students in order, sets and agreed New skills, outlines consistent with categories, complete with — only where not assessed, habits only and always on non-secure results and on problems carrying the category, **one step** between neighbouring results (skipping — and not seen), Priya, Set 6's classmate rows equal the real end state (status, done, habit problems) and its top gap.
- **Set 5 corrected so Set 5 → Set 6 never jumps** (the 20 real jumps ticket 215 listed; its `KNOWN_REAL_JUMPS` is gone and its test now expects none). Set 6 is untouched. Changes, each carrying a habit into Set 6:
  - The "axis given as the height" line is tagged graph features (as on Set 6's Q9), not conclusions.
  - Amelia: Q6 16 not taken away, Q8 not halved, Q10 landing given as the nozzle's zero (was Q3, Q9 concave up, Q10 quarter).
  - Tomas: Q1's slip is now the factors set to zero with flipped signs (null factor law), so New skills reads gap.
  - Zara: adds Q4 fraction flipped. Ethan: Q6 dropped. Isla: Q9 sign left in the bracket, Q10 nozzle (was axis as height). Lucas: Q9 sign left, Q10 nozzle (was Q9 concave up). Harper: done 10, Q7 the 2 on x² only, Q9 concave up, Q10 axis as height rushed (was Q3, Q5, Q7 squared apart, done 8). Oliver: Q7 squared term by term (was Q9 sign left). Ruby: adds Q9, a pair that multiplies to −8 but does not add. Sofia: Q4 and Q8 guessed pairs (was Q4, Q8 not halved, Q10 quarter).
  - Unused lines removed from the table (Q3 minus squared, Q10 quarter). Set 5's card now reads top gap **graph features** (9 students; non-monic factorising next on 7), 47 mistakes; Q10 on Mistakes has three columns (a five-column version overflowed the sentence lines at 1280, caught in the click-through).
- **Tests made registry-derived** so four sets can land without editing the same assertions: `lib/assignments.test.ts`, `lib/renamedSets.test.ts`, `lib/setHistory.test.ts` (Set 6's real pills are the last registered sets that assessed the category; the first set's pills are all simulated), and `data/pset5/pset5.test.ts` keeps only Set 5's particulars.
- **Tickets 211–214** each carry the exact files, the slot to uncomment, the sheet column to hit and authoring notes (how a status comes out, not seen vs missing, top gap, column count).

Judgment calls:

- Where a student has nothing on a category (missing, or never reached those problems) the sheet says *not seen*, and the one-step rule skips it, as the history pills do.
- Sets 1–3 assess Algebra, Communication, Reasoning and New skills; Set 4 is the first to assess Functions and Graphing (solving with the null factor law, the turning point from a completed square).
- Set 6's row is the classmates' end state against the fixture's ten problems and Sam's Set 6 row is `live`; Set 6's top gap in the sheet is the classmates' (fractions).
- The board and class review are live-lesson screens; a finished set's "tabs work" means Class, Mistakes, Groups and the student report, as on Set 5.

## Acceptance

- [x] Set 5 registered through the new shape with no behaviour change
- [x] Shared suite green on Set 5; a deliberately broken fixture fails it
- [x] Story sheet complete for all 20 students × every category × Sets 1–6; its Sets 5 and 6 rows equal the real results (test); no neighbouring pair more than one step apart (test)
- [x] vitest, eslint, tsc, next build
