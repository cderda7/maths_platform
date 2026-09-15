# 293: The homework screen

**What to build:** pressing the open Homework card (or its HW cell) opens a read-only list of Sam's Homework 3: first his own problems from the week's sets, then the teacher's 10.

**Blocked by:** 292.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15): "add 'Homework' to 'to do'. this should be the list of problem mistakes from the PSet that get added to the HW bank -- custom to each student", "have students do their custom probs before doing the teacher's 10", and on grouping: "just grouping by the set it came from will be clear enough".

## Decisions

- Heading "Homework 3 · due Mon 14 Sep"; a back control to the Classroom.
- **"From your mistakes"** first, grouped under each set's name, newest set first; then **"Everyone"**: the teacher's 10.
- Own problems = every problem **ever wrong** on the covered sets (ticket 256's `everWrong`, read from the story records for PS5 and Sam's session for PS6), each shown as its **similar problem** (same type, different numbers), never the original. Write similar problems for Sam's PS5 mistakes here (PS6's exist).
- Each problem shows its stem + expression (the teacher screens' whole-question look); a figure as a small thumbnail.
- No done/undone marks, no answering, no difficulty tags. Only Homework 3 opens.
- FUTURE_FEATURES: reading back a finished homework; answering homework.

## Solution

- **The list** (`lib/homeworkList.ts`, pure): `homeworkList(id, classroom, session)` is null unless the homework is open for Sam (the screen then sends him to his Classroom). It is a pipeline of small steps so ticket 294 can add carried sets and a skill dedupe without rewriting it: `ownSets` (the sets the homework froze at opening, newest first) → `ownProblems` (each set's ever-wrong problems with their similar problems: a finished set's from Sam's handed-in record, Problem Set 6's from his session, as his report on the set reads them) → `groupBySet` (a set with nothing left out) → then Everyone, the sent homework's questions as Refine left them. Every question is numbered on from 1 in the order he does them (Sam's demo: 8 of his own, then 9–18).
- **Problem Set 6 read from the session as it stands.** A homework opens only once every covered lesson is over, and after that no stage writes a first submission or a rework, so the session as it stands is the session the homework froze with; the classroom (where the opening stamp lives) does not hold the session, so there is nothing else to read. Tested equal to the folder animation's list (`homeworkProblems`) for the weak run, the strong run and the presenter's activity completed.
- **Problem Set 5's similar problems** (`data/homework-similar-ps5.ts`, apart from the story): Q4 `y = 2x² − 11x − 6`, Q6 `y = x² − 6x + 11`, Q9 `y = −x² + 6x + 7`, each in its original's TeX shape with the original's stem, skills step for step and a named type, the maths checked with `lib/texEval.ts`, none repeating a set's problem, a Problem Set 6 similar or diagnostic, or Homework 3's ten. `similarFor` reads both sets' (ids never collide).
- **The screen** (`app/student/HomeworkScreen.tsx`): under the heading and ← Classroom, the eyebrow FROM YOUR MISTAKES with a card per set under its name (Problem Set 6, then Problem Set 5), then EVERYONE with the teacher's ten in one card. A row is its number and the whole question (`components/ProblemQuestion`, which now also sets a typed stem's inline `$…$` maths, a question without an expression, and an uploaded diagram); a figure is a 72 px thumbnail after the expression. Nothing presses but the way back; the bottom padding lets the last card scroll clear of the presenter's SKIP TO.

## Acceptance

- [x] Card and cell both open the same screen; back returns to the Classroom
- [x] Sam's list: his PS6 then PS5 ever-wrong problems as similar problems, then the 10; matches the homework folder animation's PS6 problems
- [x] Every maths expression fits, never splits; no horizontal scroll; no difficulty tags
- [x] Unit tests for the list's contents and order
- [x] vitest, eslint, tsc, next build, check:laptop; click-through on the iPad
- [x] Ticket docs, architecture note, ARCHITECTURE, decision log, future features
