# 294: HW2's leftovers join Homework 3, without duplicates

**What to build:** Sam's missed Homework 2 own problems (from Problem Sets 3 and 4) appear in Homework 3 under their sets, and a skill that appears twice among his own problems keeps only the newer set's problem.

**Blocked by:** 293.

**Status:** done

**Triage:** `done`

---

## Problem Statement

The user (2026-09-15): "in creating new HW, remove duplicates. they're already penalized by the missing assignment; having them double up on problems will be double penalization", and on what carries over (only the student's own problems, not the teacher's 10): "PERFECT great nuance -- add the concern about student gap with 10 missed HW questions to F_F".

## Decisions

- A missed homework's undone **own** problems join the next homework; the teacher's 10 from the missed homework do not. Sam did none of HW2, so every PS3 and PS4 ever-wrong problem carries.
- **Duplicate = same taxonomy skill**, among the student's own problems only (never against the teacher's 10). The newer set's problem stays.
- Tag each problem that can reach homework with its taxonomy skill; write similar problems for every PS3 and PS4 problem that survives.
- The list groups carried problems under their own set's name (no "from HW2" marker), newest set first.
- FUTURE_FEATURES: the gap left by a missed homework's teacher problems never being done.

## Solution

- **Decisions added by the user (2026-09-15).** (B) A missed homework's leftovers are checked only against the current homework's own problems (and against each other, newer set first); the current homework's own sets never knock each other out, so Problem Set 5's Q4 stays beside Problem Set 6's Q2 as ticket 293 listed them. (D) Sam's story gains a Problem Set 4 slip on a skill his Homework 3 does not hold, so a Problem Set 4 group carries. And a missed homework whose leftovers were all dropped shows no note in its cell (the caution triangle and "HW2" alone).
- **One skill per problem** (`lib/problemSkill.ts`, `data/problem-skills.ts`): Problem Sets 1–4's is the first leaf of the problem's line in the story sheet's outline; Problem Sets 5 and 6 (no outline) are tagged in `data/problem-skills.ts` the way the outline tags the same kind of problem. Tested: every problem of every set has one, a leaf its model solution carries.
- **The pipeline** (`lib/homeworkList.ts`): `missedBefore` (the homework before, if Sam missed it) → `leftovers` (its own ever-wrong problems, newest set first; none if it was finished late) → `carryOver` (drop a leftover whose skill this homework's own problems or an earlier leftover already has) → `groupBySet` over the own sets then the missed homework's. The teacher's ten are never compared or carried. `missedNote` moved here and takes the session: "current HW" only when at least one leftover carried, "next HW" before the next homework opens when there are leftovers, otherwise null.
- **Sam's Problem Set 4 Q10** (`data/pset4/classmates.ts`, `data/pset4/evaluation.ts`, `data/story.ts`): the right split `ac = −70, 10 + (−7) = 3`, then `(2w + 7)(w − 5) = 0`, its signs in the wrong brackets (his Q1/Q2 misconception, `pair-signs-swapped`), then both widths and "The width is 5 cm" built on them. His algebra pattern reads Q1, Q2, Q10; group review solves Q10 at sky (Zara had it right); Jordan's and Liam's "Sam and Zara had Q10 right" now read "Zara had Q10 right"; his reflection names Q10; every PS4 cell keeps its status (algebra developing). The class story sheet regenerated.
- **Similar problems for every leftover** (`data/homework-similar-ps4.ts`, `data/homework-similar-ps3.ts`): PS4 Q1 `3x² + 5x − 2`, Q2 `2x² + x − 15`, Q7 `x² − 3x + 4`, Q8 `3x² + 6x − 2`, Q10 the rectangle with length 2w + 1 and area 36; PS3 Q8 `x² − 10x + 21`. Same TeX shape, the original's stem (Q10's numbers changed digit for digit), skills step for step, maths checked, none repeating.
- **Sam's demo Homework 3:** Problem Set 6 (Q1 Q2 Q3 Q7 Q10), Problem Set 5 (Q4 Q6 Q9), Problem Set 4 (Q10 as its rectangle), then the ten numbered 10–19. PS4 Q1/Q2 (non-monic), Q7/Q8 (binomial identity) and PS3 Q8 (monic) are duplicates. On a run where every PS6 step held, PS3's Q8 carries too; with nothing handed in on PS6, nothing carries and HW2 shows no note.

## Acceptance

- [x] Unit tests: carry-over of own problems only, dedupe by skill keeps the newer, teacher's 10 untouched
- [x] Sam's Homework 3 lists PS6, PS5, PS4, PS3 groups (empty groups omitted) then Everyone; no skill twice among his own (the demo: PS6, PS5, PS4 with Q10; PS3's Q8 a duplicate)
- [x] Every similar problem's TeX shape matches its original (ticket 256's test)
- [x] vitest, eslint, tsc, next build, check:laptop; click-through on the iPad
- [x] Ticket docs, architecture note, ARCHITECTURE, decision log, future features
