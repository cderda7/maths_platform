# 209: New skills are chosen per set

**What to build:** A set's **New skills** column holds that set's own focus skills, not a fixed Unit 1 list. Every skill has one home in the taxonomy; each set names which skills are new for it, and on that set their evidence shows under New skills instead of their home column (never both). On a set that does not name it, the same skill counts under its home. Problem Set 5's New skills are null factor law and binomial identity; Problem Set 6's are the discriminant and null factor law. A set made in Create gets its New skills inferred (a skill the class has not met in the last two sets is new), shown and correctable, with no confirm gate.

**Blocked by:** 208.

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "new skills is PER ASSIGNMENT -- so i dont' want to see surds as a new skill in PSet 6. like in PSet 1 surds should be under new skills, in PS2 surds & binomial identity shoudl be in new skills... etc." Today Unit Focus is the fixed set of `unit.u1` leaves (null factor law, binomial identity, discriminant), shown on any set that touches them. The taxonomy already holds Surds under Algebra › Number & fractions.

Agreed per-set New skills: PS1 surds · PS2 surds, binomial identity · PS3 binomial identity · PS4 binomial identity, null factor law · PS5 null factor law, binomial identity · PS6 discriminant, null factor law. Agreed homes: null factor law under Functions › Zeros, the discriminant under Algebra › Equations, binomial identity under Algebra › Expanding & factorising (merged with special products or its own leaf, decided in the ticket and logged), surds where they are.

## Solution

- Taxonomy: the unit leaves move to their homes; stored or tagged old leaf ids resolve to the new ones.
- An assignment carries its New skills list; the hierarchy roll-up routes a listed skill's evidence to the New skills category on that set.
- Every reader of the old unit list moves over: the Class View column and drill, the student's warm-up skill boxes and hint links, Create's unit inference and the review's unit, class review's "unit focus" option, the diagnostics.
- Create: infer New skills from the chosen problems against the class's last two sets; editable in the review.
- Decision log entry (one home per skill; New skills as a per-set designation).

## Acceptance

- [ ] Set 6's New skills column rolls up only the discriminant and null factor law; binomial-identity evidence on Set 6 sits under Algebra
- [ ] Set 5's New skills: null factor law and binomial identity
- [ ] A created set's inferred New skills are visible and changeable; Create is never disabled waiting on them
- [ ] Warm-up skill boxes, hints and class review read as before (hint-box sweep unchanged)
- [ ] Tests: routing per set, no evidence counted twice, inference from the last two sets
- [ ] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes; click-through of both sets' Class View drills, Create's review, the warm-up
