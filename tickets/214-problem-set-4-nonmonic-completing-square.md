# 214: Problem Set 4 — Non-monic factorising and completing the square, finished, with all twenty students' work

**What to build:** A past set in the Classroom: "Problem Set 4 — Non-monic factorising and completing the square", Fri 4 Sep, every stage over. Ten hand-checked problems: non-monic factorising by the split and grouping, solving factorised equations with the null factor law, completing the square (monic, then with a leading coefficient), a worded problem. New skills: binomial identity and null factor law. Every one of the twenty students has full data at Set 5's depth, Sam fixed and finished, each student's results matching the class story sheet's PS4 row. Its Class, Mistakes and Groups tabs, the board and class review all work on it.

**Blocked by:** 210.

**Status:** done

**Triage:** done

---

## Problem Statement

One of four earlier sets (211–214) authored in parallel worktrees so Set 6's "last five" history reads real sets; the story sheet (`specs/class-story.md`) is the contract.

## Solution

### What was done (ticket 214)

- **`data/pset4/`**: ten hand-checked problems (2x² + 3x − 2; 3x² + x − 10; (x − 4)(2x + 1) = 0; 2x² − 7x + 3 = 0; x² − 3x = 10; complete the square on x² + 6x + 2 and x² − 5x + 1; 2x² + 8x − 3 as a(x + h)² + k with its turning point; the minimum of y = x² − 4x + 7; a 35 cm² rectangle whose length is 2w + 3), each model step tagged. A completed square's perfect-square line also carries monic factorising, the turning-point form carries graph features, and Q10's positive-width, check and sentence lines carry conclusions, so a single slip reads the sheet's status. `PS4_EVALUATION` holds every line anyone wrote (a wrong line carries only its slip's leaf; right-given-above lines are `builtOn`); twenty full records with a header naming the habits.
- **Every student equals the sheet's PS4 column** (the shared suite), card 20/20, 54 mistakes, top gap non-monic factorising on nine students, graph features next on eight. Mistakes columns: Q5 six, Q7 five (short maths lines; nothing wider than its box at 1280), the rest four or fewer.
- **Registered**: `data/finishedSets.ts` PS4 slot, `scripts/laptop-check.mjs` `"pset-4"`.
- **The sheet's PS4 column** (`data/story.ts`, regenerated `specs/class-story.md`), no status changed:
  - Q1's outline reads **2x² + 3x − 2** (was 2x² + 5x + 2): Sam's habit "right split, the signs put into the wrong brackets (Q1, Q2)" needs a problem with a minus in it.
  - **Zara**'s New skills habit "added the square to complete it, never took it away" now names Q6, Q8 **and Q9**, and **Ruby**'s algebra habit "a pair that multiplies but doesn't add" names **Q4** and Q5. As first written the sheet's graph-features slips (nine students, all on one leaf) outnumbered the guessed non-monic pairs (eight), so the card's top gap could not read non-monic factorising; with Zara's Q9 a two-slip row and Ruby's guess on Q4, it is nine to eight.
- **Mistakes tab**: two slip chips in one narrow column (Zara's Q9) first wrapped a name inside its pill; ticket 213 landed the same fix (chips wrap whole) while this was in flight, so this ticket keeps main's.
- Judgment calls: Isla's Q5 moves the 10 across with its sign kept (x² − 3x + 10 = 0) and then writes the pair for −10 anyway, so her answer is right after one wrong line (her arc: she doesn't read back). Sofia's "(5/2)² taken as 5/4" line is tagged fractions first, binomial second: both categories miss on Q7 and her column's chip reads fractions beside Amelia's and Zara's.
- Hint sweep not run: nothing on the student side or in the hint machinery changed.

### The brief

- A finished-set data folder in ticket 210's shape, one registration line in date order.

### Exactly what to create (ticket 210)

Read `data/finishedSet.ts` (the shape), `data/pset5/` (the model at full depth), `specs/class-story.md` (generated from `data/story.ts`: the contract) and `data/finishedSets.test.ts` (the suite your set must pass). Then:

1. **`data/pset4/assignment.ts`**: `PS4_PROBLEMS` (ten `Problem`s, ids `ps4-q1` … `ps4-q10`, labels Q1 … Q10, TeX with doubled backslashes, every step tagged with real leaves) following the sheet's outline for PS4 (each problem's model solution carries at least the listed leaves); `PS4_ASSIGNMENT` with `id: "pset-4"`, `title: "PROBLEM SET 4 — NON-MONIC FACTORISING AND COMPLETING THE SQUARE"`, `due: "Fri 4 Sep"`, `newSkills: ["algebra.expand-factor.binomial", "functions.zeros.nfl"]`, the class, teacher and unit of `data/assignment.ts`, a goal of 100+ characters; `PS4_PATHWAY = ["individual", "group"]`.
2. **`data/pset4/evaluation.ts`**: `PS4_EVALUATION`, keyed by `ps4-qK` then the exact TeX of every line anyone wrote (model steps, every attempt line), using `ok`/`okc`/`wrong`/`A`/`T` from `data/evaluation.ts`; every wrong line a clue, a note and a name of five words or fewer; the same name on two problems is the same habit.
3. **`data/pset4/classmates.ts`**: `PS4_SAM` and `PS4_CLASSMATES` (19, in `CLASSMATES` order), every record in full (confidence, `done`, `wrong`, `attempts` for every wrong problem that go wrong and finish, notes covering every wrong problem, clarification, group line). A header comment naming the habits, as in `data/pset5/classmates.ts`.
4. **`data/pset4/index.ts`**: `export const PS4: FinishedSet = { fixture, name: "Problem Set 4 — Non-monic factorising and completing the square", pathway, sam, classmates, evaluation }` (add `groups` only if the set's seating differed from `DEFAULT_GROUPS`).
5. **`data/pset4/pset4.test.ts`**: only what is particular to the set (its top gap's clusters, named habits, Sam's wrongs); the shared suite checks the rest.
6. **Register**: in `data/finishedSets.ts` replace the commented `PS4` slot with `export { PS4 } from "./pset4";` (keep the blank lines around it). In `scripts/laptop-check.mjs` uncomment the `"pset-4"` line. Nothing else in `lib/` or `app/` needs to change; the registry, the evaluation index, the frozen groups, the Classroom, history pills and Create's New skills inference read the list.

### The rows to hit

The sheet's **PS4** column, for all twenty students: status per category (Algebra, Functions, Graphing, Communication, Reasoning, New skills (the first set to assess Functions and Graphing)), hand-in count (Jordan 8, Tomas 9, Liam 2, Grace 6, Oliver 8; nobody missing), the habits and the problems that carry them, and the Classroom card's top gap **non-monic factorising**. `data/finishedSets.test.ts` fails on any mismatch and names it ("mia algebra: solid, the sheet says developing"). Highlights: Jordan/Mia/Oliver/Tomas/Sofia gaps in algebra (guessed non-monic pairs Q1, Q2, Q4), Zara and Amelia adding the square and not taking it away (Q6), Oliver's null factor law on x(x − 3) = 10 (Q5), Zara/Ruby/Ethan giving the minimum's x for its value (Q9).

Authoring notes:

- A status is its worst leaf: held ÷ attempted lines tagged with the leaf (1 secure, ≥ 0.8 solid, ≥ 0.6 developing, else gap). One slip on a leaf the student wrote five or more times reads solid, three or four developing, one or two a gap: tag the leaves that should read solid generously. Reasoning sits on one problem, so tag its interpreting lines on several steps. Communication is the share of lines without `okc` (a skipped step).
- A student's *not seen* means they have no line on any problem in that category (`done` stops before them); their *missing* means `done: 0` with empty `wrong`, `attempts`, `notes` and no clarification.
- The top gap is the Mistakes tab's biggest cluster (the exact set of leaves a student slipped on in one problem, counted by students): give it a clear lead.
- Keep a problem's distinct wrong workings to three or four columns: a long sentence answer (KaTeX never wraps) overflows its box at 1280 when a problem has five columns (ticket 210 had to fold Set 5's Q10 down to three).
- If a row genuinely cannot be authored, change `data/story.ts` (not the markdown), run `npm run story:sheet`, keep `data/story.test.ts` green (one step, complete) and say so in this ticket.
- The board and class review are the live lesson's screens: a finished set has Class, Mistakes, Groups and the student report, as Set 5 does.

## Acceptance

- [x] Shared finished-set suite green; results equal the story sheet's PS4 row (test)
- [x] Classroom lists Set 4 under Past; Class View, Mistakes (every name opens real work), Groups, board and class review work
- [x] New skills column shows binomial identity and null factor law only
- [x] vitest, eslint, tsc, next build; click-through of every tab on Set 4
