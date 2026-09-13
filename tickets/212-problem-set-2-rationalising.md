# 212: Problem Set 2 — Rationalising and expanding with surds, finished, with all twenty students' work

**What to build:** A past set in the Classroom: "Problem Set 2 — Rationalising and expanding with surds", Fri 28 Aug, every stage over. Ten hand-checked problems: expanding brackets with surds, perfect squares and (a + b)(a − b) with surds, rationalising single-term and binomial denominators with the conjugate, a worded or geometric problem left exact. New skills: surds and binomial identity. Every one of the twenty students has full data at Set 5's depth, Sam fixed and finished, each student's results matching the class story sheet's PS2 row. Its Class, Mistakes and Groups tabs, the board and class review all work on it.

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

1. **`data/pset2/assignment.ts`**: `PS2_PROBLEMS` (ten `Problem`s, ids `ps2-q1` … `ps2-q10`, labels Q1 … Q10, TeX with doubled backslashes, every step tagged with real leaves) following the sheet's outline for PS2 (each problem's model solution carries at least the listed leaves); `PS2_ASSIGNMENT` with `id: "pset-2"`, `title: "PROBLEM SET 2 — RATIONALISING AND EXPANDING WITH SURDS"`, `due: "Fri 28 Aug"`, `newSkills: ["algebra.number.surds", "algebra.expand-factor.binomial"]`, the class, teacher and unit of `data/assignment.ts`, a goal of 100+ characters; `PS2_PATHWAY = ["individual", "group"]`.
2. **`data/pset2/evaluation.ts`**: `PS2_EVALUATION`, keyed by `ps2-qK` then the exact TeX of every line anyone wrote (model steps, every attempt line), using `ok`/`okc`/`wrong`/`A`/`T` from `data/evaluation.ts`; every wrong line a clue, a note and a name of five words or fewer; the same name on two problems is the same habit.
3. **`data/pset2/classmates.ts`**: `PS2_SAM` and `PS2_CLASSMATES` (19, in `CLASSMATES` order), every record in full (confidence, `done`, `wrong`, `attempts` for every wrong problem that go wrong and finish, notes covering every wrong problem, clarification, group line). A header comment naming the habits, as in `data/pset5/classmates.ts`.
4. **`data/pset2/index.ts`**: `export const PS2: FinishedSet = { fixture, name: "Problem Set 2 — Rationalising and expanding with surds", pathway, sam, classmates, evaluation }` (add `groups` only if the set's seating differed from `DEFAULT_GROUPS`).
5. **`data/pset2/pset2.test.ts`**: only what is particular to the set (its top gap's clusters, named habits, Sam's wrongs); the shared suite checks the rest.
6. **Register**: in `data/finishedSets.ts` replace the commented `PS2` slot with `export { PS2 } from "./pset2";` (keep the blank lines around it). In `scripts/laptop-check.mjs` uncomment the `"pset-2"` line. Nothing else in `lib/` or `app/` needs to change; the registry, the evaluation index, the frozen groups, the Classroom, history pills and Create's New skills inference read the list.

### The rows to hit

The sheet's **PS2** column, for all twenty students: status per category (Algebra, Communication, Reasoning, New skills), hand-in count (Tomas 8, Liam 3, Grace 7; nobody missing), the habits and the problems that carry them, and the Classroom card's top gap **binomial identity**. `data/finishedSets.test.ts` fails on any mismatch and names it ("mia algebra: solid, the sheet says developing"). Highlights: Liam's and Noah's (√7 + 2)² squared term by term (Q3), Amelia/Tomas/Sam's conjugate slips (Q7), rationalising fractions for Tomas, Finn, Sofia (Q5, Q6).

Authoring notes:

- A status is its worst leaf: held ÷ attempted lines tagged with the leaf (1 secure, ≥ 0.8 solid, ≥ 0.6 developing, else gap). One slip on a leaf the student wrote five or more times reads solid, three or four developing, one or two a gap: tag the leaves that should read solid generously. Reasoning sits on one problem, so tag its interpreting lines on several steps. Communication is the share of lines without `okc` (a skipped step).
- A student's *not seen* means they have no line on any problem in that category (`done` stops before them); their *missing* means `done: 0` with empty `wrong`, `attempts`, `notes` and no clarification.
- The top gap is the Mistakes tab's biggest cluster (the exact set of leaves a student slipped on in one problem, counted by students): give it a clear lead.
- Keep a problem's distinct wrong workings to three or four columns: a long sentence answer (KaTeX never wraps) overflows its box at 1280 when a problem has five columns (ticket 210 had to fold Set 5's Q10 down to three).
- If a row genuinely cannot be authored, change `data/story.ts` (not the markdown), run `npm run story:sheet`, keep `data/story.test.ts` green (one step, complete) and say so in this ticket.
- The board and class review are the live lesson's screens: a finished set has Class, Mistakes, Groups and the student report, as Set 5 does.

## Acceptance

- [ ] Shared finished-set suite green; results equal the story sheet's PS2 row (test)
- [ ] Classroom lists Set 2 under Past; Class View, Mistakes (every name opens real work), Groups, board and class review work
- [ ] New skills column shows surds and binomial identity only
- [ ] vitest, eslint, tsc, next build; click-through of every tab on Set 2
