# 347: Coral's table has one question nobody there can explain

**What to build:** on Problem Set 6, coral (Priya, Amelia, Tomas, Aiden) — like mint, sky and violet — works one question that nobody at the table can explain, so the group leaves it for now and it ends unsolved. Amber stays as it is. Making this true means one student's first submission changes, and their set score with it.

**Blocked by:** 337 (it changes the same group lists; land it first).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Ticket 332 made a group work only what a present member still has wrong after individual review, and a member who had a question right (first time or after their corrections) explains it, so the group solves it in one or two rounds. Carson's realism rule is that each table should have a question nobody there can do, which class review then covers.

Ticket 332 could not give coral or amber one: Priya had all ten right first time, and Noah and Mia cover every question between them. Ticket 332 never changes a first submission, because set score is the first submission (ticket 285).

Carson, 2026-09-16, asked for exactly one of the two to be fixed: "change a first submission & a score (just for one of them, say coral — keep amber)."

- **Coral** gets a question nobody at the table can explain.
- **Amber** stays as it is, with everything solved, which is a true classroom shape too.

## Solution

- Pick the question needing the fewest data changes: one where coral's members are already mostly wrong after individual review. Change as few first submissions as needed (ideally one) so that no present member of coral has it right first time or after corrections.
- Every changed first submission is a wrong line a student really wrote elsewhere on that question (the set's evaluation table), in keeping with the misconception taxonomy. Never invent a slip nobody makes.
- Follow the change everywhere it shows: the student's own report and Sam's classmate data, the teacher report, the story sheet (`data/story.ts`, `specs/class-story.md`), the set score, the class view's skill colours, the Classroom card counts, the mistake cards and counts on the Mistakes tab, class review's struggled counts and suggested examples, and the group run (coral's list, its pens, "left for now", unsolved and the race timing).
- Coral's board then leaves the question for now and ends unsolved, like mint's and violet's Q7.
- If class review would now be expected to cover it, check it does.

## Acceptance

- [x] Unit: no present member of coral has the chosen question right first time or after individual review; coral's run leaves it for now and closes it unsolved; every other group's outcomes are unchanged; the changed students' set scores match the new first submissions and every other score is unchanged
- [x] The architecture note lists every count that moved (set scores, per-question correct counts, struggled counts, outcome totals per set) with its old and new value
- [x] Click-through against a production build at 1280×800 and 1440×900 with Sam's iPad and the teacher tab: the changed student's report and the teacher report show the new first submission and its misconception; the Mistakes tab's counts follow; coral's board leaves the question and ends unsolved; the teacher's group grid (ticket 319) shows it; the race still finishes in order; screenshots checked
- [x] vitest, eslint, tsc, next build, check:laptop
- [x] Ticket docs: `architecture/347.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES, README
