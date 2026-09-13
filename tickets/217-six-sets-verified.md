# 217: Six sets end to end, and the docs

**What to build:** The Classroom holds Problem Sets 1–5 under Past and Set 6 live, and everything that reads across sets agrees: every history stack on Set 6 is real where the sets exist, dated and linked, one step at a time; every set's New skills column holds its own skills; every tab on every set opens with twenty students' work. README and ARCHITECTURE describe the six-set Classroom.

**Blocked by:** 211, 212, 213, 214, 215, 216.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Closes the six-set work (208–217). The pieces land from parallel worktrees; this ticket checks the whole as a teacher sees it and fixes whatever does not line up.

## Solution

- **The click-through** `click217.mjs` (scratchpad, 607 checks at 1280×800 and 1440×900, plus 1280×600 and 1440×700 for the Classroom), fed by `expected.json` generated from `data/story.ts`, the finished sets and `categoryHistory`:
  - Classroom before Create (no Live, Past PS5, PS4, PS3, PS2, PS1 with names, due days, done), after Create (Set 6 the one pinned live card); the heading pinned and unmoved while Past scrolls to PS1 fully in view; no truncated title, no sideways scroll.
  - Every set's Class View: twenty rows, the sheet's columns, every dot equal to the sheet, missing students the sheet's (Liam on 3 and 5, Chloe on 6), the due line; Amelia's and Mia's drill and the New skills column hold exactly the set's New skills, none under a home, no skill in two columns.
  - History (ticket 237 landed on main during this ticket and replaced 215's behaviour; the checks follow it): Set 6 for all twenty students and every category, Sets 3, 4 and 5 for four students each: the pills are exactly the earlier sets that assessed the category, at most five, each the sheet's status, reading its day, linking to `?report=<earlier>&student=&open=`, equal to the library's history, no jumps; Set 1 has no see history. Five real pill clicks (one per earlier set) open the student's report on that set inside Set 6 (Set 6's tabs, the report's own notes, "← Return to PSet 6" pulsing without end), and Return reopens the history with the category standing.
  - Mistakes on every set (each problem names the records' wrong students on Sets 1–5, every problem open, no maths line wider than its box, no split maths, slip chips on one line), Groups (twenty seated), two reports per set.
  - The live demo: Create → review (New skills inferred as the discriminant and the null factor law against Sets 5 and 4) → Create; the stream moves the progress tags over twenty seconds; every skip from working to class review with Set 6 pinned in Live and its Class, Mistakes and Groups rendering; the board; the Class View's End; Set 6 first in Past, done.
- **Fixed**: the Class View's due line read "Problem Set 6 — Roots of a quadratic" for a set made through Create and "PROBLEM SET 5 — …" for every other set; the title is now set in upper case (`data-due-title`).
- **Tests**: `lib/setHistory.test.ts` no longer skips a pair while a sheet set is unregistered (`unregisteredBetween` removed; it skipped nothing with all six registered); `lib/newSkills.test.ts` pins Create's inference against the real Sets 5 and 4.
- **Judgment call (reported, not fixed)**: on Set 6's Class View after a presenter skip, Sam's history stack shows reasoning dark green on Set 5 beside red today, and graphing orange on Set 5 beside dark green today. His today is his scripted live session, which the sheet leaves open; the click-through reports these two pairs separately. Fixing it needs the user to choose Sam's story (FUTURE_FEATURES.md, DECISION_LOG.md).
- **Not done**: board and class review exist only on the live set, so they were checked on Set 6 alone. Long sentence answers on the Mistakes tab were left alone (open question).
- Docs: README "The Classroom's six sets" (sets, New skills, pinned Classroom, history, the story sheet, adding a finished set), ARCHITECTURE diagram and row, decision log, future features (four waiting items marked done, a 217 section).

## Acceptance

- [x] Set 6's history for every student and category: real pills for every set that assessed it, no jump (test and click-through). Since ticket 237 there are no simulated pills; the one exception is Sam's newest pill against his live today, reported above.
- [x] Every set's New skills per the agreed list
- [x] vitest 753, eslint, tsc, next build, check:laptop 62, sweep:hint-boxes 132; the click-through above (607 checks)
