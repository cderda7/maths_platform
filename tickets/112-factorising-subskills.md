# 112: "factorising" in the not-confident list opens monic & non-monic

**What to build:** On the confidence screen's "not confident with…" list, factorising is one row. Ticking it opens two sub-rows under it, "monic" and "non-monic", ticked the same way; the student can tick one or both. A student who ticks factorising and neither kind means both, and the warm-up practises both.

**Blocked by:** 110 (the names), 48 (the warm-up seed).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), on being told the student only ever sees the monic leaf as plain "factorising": "oh bc i only have them identify factoring. oh that's an issue. ok for that skill in the 'not confident view' if a student selects 'factorising', have that expand to then show 'monic & non-monic' as bullet points that can be selected in the same way. so student can choose one or both. if student doesn't click on either (like just clicks on factorising without engaging with monic or non-monic), assume both & have them practice both."

Before this the list ranked the two factorising leaves separately (the monic one as "factorising", the non-monic one as "non-monic factorisation" when it made the top seven), so "factorising" alone meant monic only.

## Solution

- `lib/confidence.ts` (new): `pickerRows` folds the two factorising leaves into one "factorising" row where the first of them ranked, its children "monic" and "non-monic"; `pickedLeaves` turns the ticked rows into `Confidence.leaves` at submit (the row alone means both kinds, in that order; ticked kinds mean those, in tick order, at the row's position); `pickedRows` reads a stored answer back for the locked view. Tests in `lib/confidence.test.ts`.
- `app/student/screens/ConfidenceScreen.tsx`: rows from `pickerRows`; the sub-rows render under the factorising row while it is ticked (indented, a size smaller); unticking the row unticks its kinds; submit stores `pickedLeaves`; the locked view after submit shows the stored leaves as rows, so a plain factorising tick shows both kinds ticked.
- `lib/session.ts`: `sessionAt("confidence")` no longer marks the practice declined, so the deep link to the survey gets the warm-up offer like the real path does (a pre-existing slip found while verifying; test).

## Acceptance

- [x] The list reads null factor law, factorising, fractions, zero-finding, the discriminant, …; no "non-monic factorisation" row
- [x] Ticking factorising shows monic and non-monic under it; ticking non-monic alone, then Submit, stores only the non-monic leaf
- [x] Factorising ticked with neither kind: Submit stores monic and non-monic (after null factor law, which was ticked first); the offer reads "Warm up on null factor law, factorising, & non-monic factorisation first? 3 short problems, then the set"; the locked list shows both kinds ticked; "Warm up" opens the chat on the three
- [x] Unticking factorising hides and clears its kinds
- [x] vitest (347), eslint, `next build`, headless click-through (`conf.mjs`) with screenshots; architecture note, root docs, decision log, future features
