# 208: Problem Set 2 becomes Problem Set 6, Problem Set 1 becomes Problem Set 5

**What to build:** The live set reads "Problem Set 6 — Roots of a quadratic" (due Thu 10 Sep) and the past set "Problem Set 5 — Features of a parabola", now dated Mon 7 Sep, everywhere a teacher or student sees a set's name: the Classroom cards, every assignment page's header, the student's eyebrow ("PROBLEM SET 6 — ROOTS OF A QUADRATIC"), Create's draft title, the board and class review. The sets' ids and routes follow (`pset-6`, `pset-5`); the old `/teacher/a/pset-2/…` and `/teacher/a/pset-1/…` URLs redirect to the new ones, and stored demo state that names the old ids still loads. Nothing else changes: the demo plays exactly as before under the new names.

**Blocked by:** None (can start immediately).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "to fully make the prev category performance make sense, i'd like to add more assingments. i want to change current PSet 2 to PSet 6, & to have 5 previous assignmetns already in Edexia Classroom." First of the six-set tickets (208–217). The class uses Edexia for in-class work twice a week on varying days, so the dates are PS1 Tue 25 Aug, PS2 Fri 28 Aug, PS3 Tue 1 Sep, PS4 Fri 4 Sep, PS5 Mon 7 Sep, PS6 Thu 10 Sep; this ticket moves the two existing sets onto theirs.

## Solution

- **Rename in place.** `data/pset1/` is now `data/pset5/` (`PS5_ASSIGNMENT`, `PS5_PROBLEMS`, `PS5_CLASSMATES`, `PS5_SAM`, `PS5_EVALUATION`, test `pset5.test.ts`), id `pset-5`, title "PROBLEM SET 5 — FEATURES OF A PARABOLA", due Mon 7 Sep, problem ids `ps5-q1` … `ps5-q10`. The live fixture (`data/assignment.ts`) is `pset-6`, "PROBLEM SET 6 — ROOTS OF A QUADRATIC", still Thu 10 Sep, problems `q1` … `q10` unchanged. The registry names (`lib/assignments.ts`), the draft seed title, doc comments in app, lib, data and scripts, every test and `scripts/laptop-check.mjs`'s routes follow. `PROBLEM_SET_2_BEFORE_CREATE` became `LIVE_SET_BEFORE_CREATE`, so the switch no longer names a set number. Historic tickets, architecture notes and the decision log are records and keep the old names.
- **One map of the old names.** `lib/renamedSets.ts` (no imports) holds old id → new id and the two seeded old titles → new ones.
- **Redirects.** `next.config.ts` reads the map: `/teacher/a/pset-2` and `/teacher/a/pset-2/:path*` go to `pset-6` (and `pset-1` to `pset-5`), with the query kept, as temporary (307) redirects. `/teacher/mistakes` and `/teacher/report` still land on the live set, through `LIVE_ASSIGNMENT_ID`.
- **Stored demo state.** `migrateClassroom` (`lib/classroom.ts`, run on every load of the classroom store) now renames too. Group copies keyed `pset-2` / `pset-1` move to the new ids; a copy already under a new id wins. The created set's title and the draft's title become the new name when they are exactly the old seeded ones; a title the teacher typed is left alone. A state with nothing old in it comes back as the same object. The student session store holds no set ids or titles (Sam's problems are still `q1` … `q10`), so it needed no mapping. An old tab's progress is untouched.
- **History.** The date label follows Set 5's due day: Set 6's newest pill reads "Sep 7". `HISTORY_DATES` (Aug 11 … Aug 28) all fall before it; a test holds that. The rest of the history is ticket 215's.
- **Judgment call.** The ticket says "the classroom and session stores map a stored old id". Only the classroom store stores set ids or seeded titles, so the mapping lives there. Stored state is renamed on each read, not written back; see DECISION_LOG.

## Acceptance

- [x] No "Problem Set 1/2", "PROBLEM SET 2" or `pset-1`/`pset-2` left in app, lib, data, components or scripts except the redirect map and its tests (`lib/renamedSets.ts`, `lib/renamedSets.test.ts`; `next.config.ts` reads the map)
- [x] `/teacher/a/pset-2/mistakes` and `/teacher/a/pset-1` land on the Set 6 / Set 5 pages (click208: 7 redirect checks, the query kept)
- [x] Classroom: Set 6 live (after Create) due Thu 10 Sep, Set 5 past due Mon 7 Sep; Set 6's history newest pill still Set 5's result, dated Sep 7
- [x] A browser holding pre-rename demo state loads without a crash and keeps its progress (the student's stage, both sets' moved groups, the draft title)
- [x] vitest 609, eslint, tsc, next build, check:laptop 30, sweep:hint-boxes 132; click-through `click208.mjs` 68 checks (Classroom before and after Create at 1440 and 1280 → both sets' Class, Mistakes and Groups tabs, the student's header, Create's title, the history pills, the old routes, a pre-rename state)
