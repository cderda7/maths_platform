# 112 · "factorising" in the not-confident list opens monic & non-monic

Route: `/student?stage=confidence` (or Start from the overview), the "not confident with…" list.

## Files touched

| File | What it does |
|---|---|
| `lib/confidence.ts` (new) | The list's rows and what ticks mean: `pickerRows` (the relevant skills with the two factorising leaves folded into one row with two kinds under it), `pickedLeaves` (ticked rows to leaves at submit; the row alone is both kinds), `pickedRows` (stored leaves back to rows for the locked view). |
| `lib/confidence.test.ts` (new) | The fold, the row's position, both-when-neither, ticked kinds in tick order, a kind without its row dropped, the round trip. |
| `app/student/screens/ConfidenceScreen.tsx` | Renders the rows; the kinds' sub-list under the factorising row while it is on; unticking the row clears its kinds; submit stores `pickedLeaves(picked)`. |
| `lib/session.ts` | `sessionAt("confidence")` leaves `practice` null, so the deep-linked survey still offers the warm-up. |
| `lib/session.test.ts` | The deep link's practice is null and a "not confident" answer there is offered the warm-up. |

## How it connects

```
 relevantSkills(problems)            lib/hierarchy.ts, the top seven leaves
        │
        ▼
 pickerRows()                        lib/confidence.ts
   [nfl] [factorising ▸ monic, non-monic] [fractions] [zero-finding] …
        │
        ▼
 ConfidenceScreen                    draft: PickId[] in tick order
   ☑ factorising                     ── on → the two sub-rows show
       ☐ monic   ☑ non-monic         ── off → sub-rows hidden, kinds cleared
        │ Submit
        ▼
 pickedLeaves(picked)                factorising alone → [monic, nonmonic]
        │                            kinds ticked      → those, in tick order
        ▼
 Confidence { level: "low-when", leaves: LeafId[] }     data/types.ts, unchanged
        │                                   ▲
        │  warmupSeed → concernTurns,       │ pickedRows(leaves): the locked view
        │  offerLines, focusLeaves          │ after submit and on reload
        ▼
 the concerns chat and the warm-up   lib/warmup.ts, untouched
```

The session's answer is still a list of leaves, so the chat, the offer and the warm-up sequence know nothing of the row; they see monic and non-monic as two ticked skills. Their words for the two are still the student names: "factorising" for monic, "non-monic factorisation" for non-monic (see FUTURE_FEATURES.md).

## Verified by

vitest (347), eslint, `next build`; a headless click-through (`conf.mjs`) of the deep-linked survey: the rows, factorising opening its two kinds, non-monic alone ticked, both cleared with the row, a plain factorising tick with null factor law submitted (stored `["unit.u1.nfl", "algebra.expand-factor.monic", "algebra.expand-factor.nonmonic"]`, the offer naming the three, the locked list with both kinds ticked, the chat opening on the three), with screenshots of the expanded row and the offer.
