# 211: Problem Set 1 — Surds, finished, with all twenty students' work

**What to build:** A past set in the Classroom: "Problem Set 1 — Surds", Tue 25 Aug, every stage over. Ten hand-checked problems on simplifying surds and operating with them (simplify, add and subtract like surds, multiply and divide, leave answers exact, a short worded problem). New skills: surds. Every one of the twenty students has full data at Set 5's depth (confidence, answered count, wrong problems with worked attempts and notes, clarification, group status), Sam's answers fixed and finished, each student's category results matching the class story sheet's PS1 row. Its Class, Mistakes and Groups tabs, the board and class review all work on it.

**Blocked by:** 210.

**Status:** done

**Triage:** done

---

## Problem Statement

One of four earlier sets (211–214) so the Class View's "last five" history reads real sets (the user, 2026-09-13: "have PSet 6 demonstrate the '5 prev history' in a more sensible way, & link to actual dates & assignmetns"). Authored in its own worktree in parallel with 212–214; the story sheet (`specs/class-story.md`) is the contract.

## Solution

### What was done (ticket 211)

- `data/pset1/`: ten hand-checked problems (√48 = 4√3, 3√50 = 15√2, √12 + √27 = 5√3, 2√18 − √8 = 4√2, √6 × √10 = 2√15, 2√3 × 5√6 = 30√2, 6√10 ÷ 2√5 = 3√2, √2(3 + √8) = 3√2 + 4, x√3 = √75 − √12 gives x = 3, a tile of area 72 cm² has side 6√2 cm and diagonal 12 cm), every line written whole; the evaluation table holds every line anyone wrote; twenty full records. Q9 is typeset `x\sqrt{3}` rather than `\sqrt{3}x`, which read as √(3x) on the Mistakes header.
- Every student equals the sheet's PS1 column (shared suite). The card reads 20/20, 15 mistakes, top gap **surds** on seven students (Chloe, Ruby, Liam, Amelia, Tomas, Isla, Oliver), fractions next on three (Amelia, Tomas, Sofia). Every problem keeps to three columns of working at most; the longest sentence answer fits at 1280.
- **Sheet change, PS1 column only** (`data/story.ts`, regenerated): the sheet's habits left Q5, Q6 and Q10 with nobody wrong, and the Mistakes tab (and the shared suite) needs all ten problems. Chloe gains a second New skills habit "√60 taken as 4√15, the 4 not rooted" (Q5), Oliver "√(72 + 72) split into √72 + √72" (Q10, the start of his term-by-term squaring), and Ruby's habit reads "a square factor left under the root" (Q1, Q6). No status changed.
- **`pset-1` reused** (judgment call, DECISION_LOG): ticket 208 mapped the old id `pset-1` to `pset-5`, so `/teacher/a/pset-1/…` redirected to Set 5 and stored seating under `pset-1` moved to Set 5. `pset-1` is now Set 1's own: the mapping, its redirect and its migration are gone (`pset-2 → pset-6` kept; ticket 212 meets the same question).
- **History test while Sets 2–4 land**: with only Sets 1 and 5 registered, a history can show a real Set 1 pill beside a real Set 5 pill two steps apart (Tomas's New skills solid → gap, 14 students in all); the sheet fills the gap with Sets 2–4. `lib/setHistory.test.ts` skips a real pair only when a sheet set between them is not registered yet, so the check is complete again once 212–214 merge. Until then the teacher sees those two-step neighbours on Sets 5 and 6's history.

- A finished-set data folder in ticket 210's shape, one registration line in date order.

### Exactly what to create (ticket 210)

Read `data/finishedSet.ts` (the shape), `data/pset5/` (the model at full depth), `specs/class-story.md` (generated from `data/story.ts`: the contract) and `data/finishedSets.test.ts` (the suite your set must pass). Then:

1. **`data/pset1/assignment.ts`**: `PS1_PROBLEMS` (ten `Problem`s, ids `ps1-q1` … `ps1-q10`, labels Q1 … Q10, TeX with doubled backslashes, every step tagged with real leaves) following the sheet's outline for PS1 (each problem's model solution carries at least the listed leaves); `PS1_ASSIGNMENT` with `id: "pset-1"`, `title: "PROBLEM SET 1 — SURDS"`, `due: "Tue 25 Aug"`, `newSkills: ["algebra.number.surds"]`, the class, teacher and unit of `data/assignment.ts`, a goal of 100+ characters; `PS1_PATHWAY = ["individual", "group"]`.
2. **`data/pset1/evaluation.ts`**: `PS1_EVALUATION`, keyed by `ps1-qK` then the exact TeX of every line anyone wrote (model steps, every attempt line), using `ok`/`okc`/`wrong`/`A`/`T` from `data/evaluation.ts`; every wrong line a clue, a note and a name of five words or fewer; the same name on two problems is the same habit.
3. **`data/pset1/classmates.ts`**: `PS1_SAM` and `PS1_CLASSMATES` (19, in `CLASSMATES` order), every record in full (confidence, `done`, `wrong`, `attempts` for every wrong problem that go wrong and finish, notes covering every wrong problem, clarification, group line). A header comment naming the habits, as in `data/pset5/classmates.ts`.
4. **`data/pset1/index.ts`**: `export const PS1: FinishedSet = { fixture, name: "Problem Set 1 — Surds", pathway, sam, classmates, evaluation }` (add `groups` only if the set's seating differed from `DEFAULT_GROUPS`).
5. **`data/pset1/pset1.test.ts`**: only what is particular to the set (its top gap's clusters, named habits, Sam's wrongs); the shared suite checks the rest.
6. **Register**: in `data/finishedSets.ts` replace the commented `PS1` slot with `export { PS1 } from "./pset1";` (keep the blank lines around it). In `scripts/laptop-check.mjs` uncomment the `"pset-1"` line. Nothing else in `lib/` or `app/` needs to change; the registry, the evaluation index, the frozen groups, the Classroom, history pills and Create's New skills inference read the list.

### The rows to hit

The sheet's **PS1** column, for all twenty students: status per category (Algebra, Communication, Reasoning, New skills), hand-in count (Tomas 9, Liam 2 (Q1–Q2 only), Grace 8; nobody missing), the habits and the problems that carry them, and the Classroom card's top gap **surds**. `data/finishedSets.test.ts` fails on any mismatch and names it ("mia algebra: solid, the sheet says developing"). Highlights: Liam's two surd simplifications (New skills developing), Amelia/Tomas/Isla/Oliver/Chloe/Ruby's surd slips (the top gap), Aiden's √2 on the first term only (Q8), Finn dividing the wrong way (Q9).

Authoring notes:

- A status is its worst leaf: held ÷ attempted lines tagged with the leaf (1 secure, ≥ 0.8 solid, ≥ 0.6 developing, else gap). One slip on a leaf the student wrote five or more times reads solid, three or four developing, one or two a gap: tag the leaves that should read solid generously. Reasoning sits on one problem, so tag its interpreting lines on several steps. Communication is the share of lines without `okc` (a skipped step).
- A student's *not seen* means they have no line on any problem in that category (`done` stops before them); their *missing* means `done: 0` with empty `wrong`, `attempts`, `notes` and no clarification.
- The top gap is the Mistakes tab's biggest cluster (the exact set of leaves a student slipped on in one problem, counted by students): give it a clear lead.
- Keep a problem's distinct wrong workings to three or four columns: a long sentence answer (KaTeX never wraps) overflows its box at 1280 when a problem has five columns (ticket 210 had to fold Set 5's Q10 down to three).
- If a row genuinely cannot be authored, change `data/story.ts` (not the markdown), run `npm run story:sheet`, keep `data/story.test.ts` green (one step, complete) and say so in this ticket.
- The board and class review are the live lesson's screens: a finished set has Class, Mistakes, Groups and the student report, as Set 5 does.

## Acceptance

- [x] Shared finished-set suite green; results equal the story sheet's PS1 row for every student and category (test)
- [x] Classroom lists Set 1 under Past with a computed top gap; Class View rows, dots and the missing student match the sheet
- [x] Mistakes: ten problems, counts, clusters, every name opens real work; Groups, board and class review open
- [x] New skills column shows surds only
- [x] vitest, eslint, tsc, next build; click-through of every tab on Set 1
