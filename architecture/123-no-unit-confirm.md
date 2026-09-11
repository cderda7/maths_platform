# 123 · No Confirm on the review step's unit focus

Route: `/teacher/assignments/create/review`, the pathway step.

## Files touched

| File | What it does |
|---|---|
| `app/teacher/assignments/UnitFocus.tsx` | `onConfirm?` / `confirmed?`: the Confirm button renders only when a caller asks for it (the old screen does; the review step does not). |
| `app/teacher/assignments/create/review/PathwayStep.tsx` | Renders `UnitFocus` with the inferred unit, the reassessed one and `onReassess` only; Create always enabled. |
| `app/teacher/assignments/create/review/ReviewAssignment.tsx` | `create` guards on the draft alone. |
| `lib/review.ts` | `ReviewState` without `confirmed`. |

## How it connects

```
 PathwayStep                                   UnitFocus (shared)
 inferred = inferUnitFromReviewed(final) ───▶  Unit {reassessed ?? inferred}   [Confirm] only if onConfirm
 review.unit (reassessed) ──────────────────▶  [Not quite? describe the focus] [Reassess]
                                                       │ onReassess(inferUnitFromText(note))
 set({ unit }) ◀───────────────────────────────────────┘
 [Back] [Create] ── always on ── assignment/create { unit: review.unit ?? inferred, … }
```

## Verified by

vitest (390), eslint, tsc, `next build`; the ticket 120 run (`review.mjs`) with the confirm checks replaced: the pathway step opens with Create on and no Confirm, a note of "rates of change" reassessed to Unit 3, kept across a reload, and "quadratics and their graphs" back to Unit 1; the old screen still shows its Confirm.
