# 208: Problem Set 2 becomes Problem Set 6, Problem Set 1 becomes Problem Set 5

**What to build:** The live set reads "Problem Set 6 — Roots of a quadratic" (due Thu 10 Sep) and the past set "Problem Set 5 — Features of a parabola", now dated Mon 7 Sep, everywhere a teacher or student sees a set's name: the Classroom cards, every assignment page's header, the student's eyebrow ("PROBLEM SET 6 — ROOTS OF A QUADRATIC"), Create's draft title, the board and class review. The sets' ids and routes follow (`pset-6`, `pset-5`); the old `/teacher/a/pset-2/…` and `/teacher/a/pset-1/…` URLs redirect to the new ones, and stored demo state that names the old ids still loads. Nothing else changes: the demo plays exactly as before under the new names.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "to fully make the prev category performance make sense, i'd like to add more assingments. i want to change current PSet 2 to PSet 6, & to have 5 previous assignmetns already in Edexia Classroom." First of the six-set tickets (208–217). The class uses Edexia for in-class work twice a week on varying days, so the dates are PS1 Tue 25 Aug, PS2 Fri 28 Aug, PS3 Tue 1 Sep, PS4 Fri 4 Sep, PS5 Mon 7 Sep, PS6 Thu 10 Sep; this ticket moves the two existing sets onto theirs.

## Solution

- Rename in the fixtures, registry, draft seed, doc comments, tests and scripts; the Set 1 data folder and its problem ids (`ps1-q1` …) take the Set 5 name (`ps5-q1` …), Set 6's `q1` … `q10` stay.
- Redirects for the old assignment routes; the classroom and session stores map a stored old id to the new one on load.
- Past click-through scripts that name the old ids are updated where the sweep and laptop check read them.

## Acceptance

- [ ] No "Problem Set 1/2", "PROBLEM SET 2" or `pset-1`/`pset-2` left in app, lib, data, components or scripts except the redirect map and its tests
- [ ] `/teacher/a/pset-2/mistakes` and `/teacher/a/pset-1` land on the Set 6 / Set 5 pages
- [ ] Classroom: Set 6 live (after Create) due Thu 10 Sep, Set 5 past due Mon 7 Sep; Set 6's history newest pill still Set 5's result, dated Sep 7
- [ ] A browser holding pre-rename demo state loads without a crash and keeps its progress
- [ ] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes; click-through of Classroom → both sets' tabs, student eyebrow, Create's title
