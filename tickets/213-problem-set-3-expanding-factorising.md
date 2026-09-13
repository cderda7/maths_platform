# 213: Problem Set 3 — Expanding and factorising, finished, with all twenty students' work

**What to build:** A past set in the Classroom: "Problem Set 3 — Expanding and factorising", Tue 1 Sep, every stage over. Ten hand-checked problems: distributive expansion, perfect squares and difference of two squares both ways, monic factorising by the pair, common factors first, a first simple non-monic, expanding back to check. New skills: binomial identity. Every one of the twenty students has full data at Set 5's depth, Sam fixed and finished, each student's results matching the class story sheet's PS3 row (Jordan's unchecked pairs and Mia's factorising showing here as the sheet sets them). Its Class, Mistakes and Groups tabs, the board and class review all work on it.

**Blocked by:** 210.

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

One of four earlier sets (211–214) authored in parallel worktrees so Set 6's "last five" history reads real sets; the story sheet (`specs/class-story.md`) is the contract.

## Solution

- A finished-set data folder in ticket 210's shape, one registration line in date order.

### Exactly what to create (ticket 210)

Read `data/finishedSet.ts` (the shape), `data/pset5/` (the model at full depth), `specs/class-story.md` (generated from `data/story.ts`: the contract) and `data/finishedSets.test.ts` (the suite your set must pass). Then:

1. **`data/pset3/assignment.ts`**: `PS3_PROBLEMS` (ten `Problem`s, ids `ps3-q1` … `ps3-q10`, labels Q1 … Q10, TeX with doubled backslashes, every step tagged with real leaves) following the sheet's outline for PS3 (each problem's model solution carries at least the listed leaves); `PS3_ASSIGNMENT` with `id: "pset-3"`, `title: "PROBLEM SET 3 — EXPANDING AND FACTORISING"`, `due: "Tue 1 Sep"`, `newSkills: ["algebra.expand-factor.binomial"]`, the class, teacher and unit of `data/assignment.ts`, a goal of 100+ characters; `PS3_PATHWAY = ["individual", "group"]`.
2. **`data/pset3/evaluation.ts`**: `PS3_EVALUATION`, keyed by `ps3-qK` then the exact TeX of every line anyone wrote (model steps, every attempt line), using `ok`/`okc`/`wrong`/`A`/`T` from `data/evaluation.ts`; every wrong line a clue, a note and a name of five words or fewer; the same name on two problems is the same habit.
3. **`data/pset3/classmates.ts`**: `PS3_SAM` and `PS3_CLASSMATES` (19, in `CLASSMATES` order), every record in full (confidence, `done`, `wrong`, `attempts` for every wrong problem that go wrong and finish, notes covering every wrong problem, clarification, group line). A header comment naming the habits, as in `data/pset5/classmates.ts`.
4. **`data/pset3/index.ts`**: `export const PS3: FinishedSet = { fixture, name: "Problem Set 3 — Expanding and factorising", pathway, sam, classmates, evaluation }` (add `groups` only if the set's seating differed from `DEFAULT_GROUPS`).
5. **`data/pset3/pset3.test.ts`**: only what is particular to the set (its top gap's clusters, named habits, Sam's wrongs); the shared suite checks the rest.
6. **Register**: in `data/finishedSets.ts` replace the commented `PS3` slot with `export { PS3 } from "./pset3";` (keep the blank lines around it). In `scripts/laptop-check.mjs` uncomment the `"pset-3"` line. Nothing else in `lib/` or `app/` needs to change; the registry, the evaluation index, the frozen groups, the Classroom, history pills and Create's New skills inference read the list.

### The rows to hit

The sheet's **PS3** column, for all twenty students: status per category (Algebra, Communication, Reasoning, New skills), hand-in count (Liam missing; Jordan 9, Grace 9, Oliver 9), the habits and the problems that carry them, and the Classroom card's top gap **binomial identity**. `data/finishedSets.test.ts` fails on any mismatch and names it ("mia algebra: solid, the sheet says developing"). Highlights: Jordan's unchecked pairs (Q8, Q9), Mia trying brackets until one looks close (Q9), Aiden's common factor out of two terms (Q7), Noah/Oliver/Amelia's (2x − 3)² (Q2), Isla and Lucas's reasoning slipping to solid/developing (Q10).

Authoring notes:

- A status is its worst leaf: held ÷ attempted lines tagged with the leaf (1 secure, ≥ 0.8 solid, ≥ 0.6 developing, else gap). One slip on a leaf the student wrote five or more times reads solid, three or four developing, one or two a gap: tag the leaves that should read solid generously. Reasoning sits on one problem, so tag its interpreting lines on several steps. Communication is the share of lines without `okc` (a skipped step).
- A student's *not seen* means they have no line on any problem in that category (`done` stops before them); their *missing* means `done: 0` with empty `wrong`, `attempts`, `notes` and no clarification.
- The top gap is the Mistakes tab's biggest cluster (the exact set of leaves a student slipped on in one problem, counted by students): give it a clear lead.
- Keep a problem's distinct wrong workings to three or four columns: a long sentence answer (KaTeX never wraps) overflows its box at 1280 when a problem has five columns (ticket 210 had to fold Set 5's Q10 down to three).
- If a row genuinely cannot be authored, change `data/story.ts` (not the markdown), run `npm run story:sheet`, keep `data/story.test.ts` green (one step, complete) and say so in this ticket.
- The board and class review are the live lesson's screens: a finished set has Class, Mistakes, Groups and the student report, as Set 5 does.

## Acceptance

- [ ] Shared finished-set suite green; results equal the story sheet's PS3 row (test)
- [ ] Classroom lists Set 3 under Past; Class View, Mistakes (every name opens real work), Groups, board and class review work
- [ ] New skills column shows binomial identity only
- [ ] vitest, eslint, tsc, next build; click-through of every tab on Set 3
