# 302: A diagnostic's distractors point at the misconception taxonomy

**What to build:** every wrong option of every live diagnostic step carries a misconception id, so a pick counts against the same misconception as a wrong line. On the teacher's laptop an option reads the misconception's name with the option's own wording beneath. The board shows neither.

**Blocked by:** 299.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Ticket 299's request, "use misconception labels everywhere… a stable named taxonomy with IDs… so you can count them". Asked 2026-09-15 which surfaces switch, the user chose "Diagnostic distractors: each distractor's misconception text points at a taxonomy ID, so a diagnostic result counts against the same misconception."

Building it showed that 23 of the 37 steps have two or three wrong options under one misconception (Q4's a, b, c step: three options, all "a, b or c wrong"). Asked what each option should say, the user chose the name with the option's own line beneath, and added: "just to confirm, this should be the view on teacher laptop -- board shouldn't show number correct/incorrect."

## Acceptance

- [x] `DiagnosticOption.misconception` is a `MisconceptionId`; the old free text is `detail` (five words or fewer, no student's name, no guess at what the student did)
- [x] A distractor mirroring a real slip has that wrong line's own misconception (tested)
- [x] Seven taxonomy entries for distractors no student wrote: sum right, product wrong; term lost rearranging; wrong operation to undo; a, b or c wrong; discriminant formula wrong; wrong feature given; value substituted wrong
- [x] Teacher laptop (flyout, focused view, class view card): name, then detail; board: no counts, no misconception
- [x] `diagnosticSightings`: a chain's picks as sightings (`source: "diagnostic"`)
- [x] vitest, eslint, tsc, next build, check:laptop; click-through

## Solution

A script moved each option's text to `detail` and added its id from a hand-made mapping. Four details were reworded under the naming rule: "axes mixed up", "sign slip expanding", "zero confused with one" and "−b copied as −7". `DiagnosticResults` renders `[data-misconception]` (the name) and `[data-misconception-detail]` (the detail) outside board size. `lib/misconceptionCounts.ts` gains `source` on `Sighting` and `diagnosticSightings(run, now, where, absent)`, built from `pickersAt`. Ticket 303 landed during this one: the seven new ids are placed in its error families (`data/signatures.ts`). Sum right, product wrong went into factor pairs; wrong operation to undo into not undone; term lost rearranging and value substituted wrong into terms missed; a, b or c wrong and discriminant formula wrong into roots. Wrong feature given fit no family, so it got its own, "Graph features wrong".

Verification: vitest 1114; eslint, tsc, next build; check:laptop 76. `click302.mjs` passes 694/694 at 1280×800 and 1440×900. For Q1, Q4, Q5, Q9 and Q10 it pushes every step from the Mistakes flyout and walks the focused view step by step. On every results cell the name is a taxonomy name, a distractor has its detail and the correct option none, each step's distractors read differently, nothing spills its cell, and nothing scrolls sideways. The board shows the question with no misconception and no counts.
