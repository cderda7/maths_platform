# 301: Work lines and Compare name the misconception, not the skill

**What to build:** the ⚠ chip on a red line names the line's misconception, on every red line, and opens nothing. That covers the Class tab's drill, the teacher's and Sam's reports, and the holistic page's skill work. Compare's per-line skill chip becomes the misconception chip, on red lines only. The class review picker drops the skill chip under an example's name.

**Blocked by:** 299.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Ticket 299's request, "use misconception labels everywhere". Asked 2026-09-15 which surfaces switch, the user chose: "Compare + picker chips" (Compare's per-line skill chip becomes the misconception on wrong lines only, nothing on right lines; the picker drops its leaf chip) and "Blame chip in work drill" ("Identified as X" shows the misconception and no longer links to a skill, including on Sam's own report).

## Acceptance

- [x] `MisconceptionChip` (components/Tag.tsx): ⚠ and the taxonomy name, a span, not a button
- [x] `WorkLines` puts it on every red line; the skill link (`onGoTo`, `RowDrill.onNavigate`, the drill's `goTo`, the holistic page's `goTo`, TeacherLive's `jump`) is removed end to end
- [x] Compare: the chip on the handed-in side's red lines only; lines that hold carry only their label
- [x] Class review picker: no skill chip; `ExampleOption.leaf` removed
- [x] vitest, eslint, tsc, next build, check:laptop; click-through

## Solution

The chip was a button that opened the skill a red line was tagged to, shown only when that skill differed from the open one. It is now a `MisconceptionChip` on every red line. The callback chain that only served it is gone from `WorkLines`, `ProblemWork`, `WorkPanel`, `ClassReviewExamples`, `SkillWork`, the reports' `Versions`, `RowDrill` and their callers. `WorkLines` also loses its `student` prop, which only chose the student-facing skill name for the chip.

Verification: vitest 1037; eslint, tsc, next build; check:laptop 74. `click301.mjs` passes 244/244 at 1280×800 and 1440×900:
- Every tile of Tomas's PS4, Amelia's PS3 and Sam's PS5 teacher reports, and every tile of Sam's own PS4 report: every red line has a chip, each reads a taxonomy name, is a span on a red line, fits its line and column, and pressing it changes nothing. Sam's side column never scrolls sideways.
- Compare: no skill chip; chips only on red lines, each a taxonomy name; every red line has one; no sideways scroll.
- Class review picker: no skill chip.
