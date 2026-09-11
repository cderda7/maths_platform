# 122 · A tap on a difficulty pill rotates it

Route: `/teacher/assignments/create/review`, the difficulty step.

## Files touched

| File | What it does |
|---|---|
| `lib/review.ts` | `nextDifficulty(d)`: the next of `DIFFICULTIES` after `d`, the first after the last. |
| `app/teacher/assignments/create/review/QuestionGrid.tsx` | The pill is a button; its click calls `onLabel(id, nextDifficulty(current))`. No popover, no document listeners. |
| `app/teacher/assignments/create/review/DifficultyStep.tsx` | Comment only; `onLabel` writes the relabel into `review.labels` as before. |
| `lib/review.test.ts` | The rotation order and the wrap. |

## How it connects

```
 DifficultyStep                      QuestionGrid › Tile                     lib/review
 labels = labelsOf(qs, review.labels) ──▶ [Q2]  [simple familiar] ◀ pill      DIFFICULTIES = [SF, SU, CF, CU]
                                              │ tap                           nextDifficulty(SF) = SU
                                              ▼                               nextDifficulty(CU) = SF
                                      onLabel(q.id, nextDifficulty(d))
                                              │
 ReviewAssignment.set({ labels: {…, [id]: d} }) ──review/set──▶ classroom store ──▶ labelsOf … counts strip
```

## Verified by

vitest (390), eslint, tsc, `next build`; the ticket 120 headless run (`review.mjs`) with the popover checks replaced by the rotation: four taps on Q2 through the four labels and back, three more to complex unfamiliar, the counts following, the pill's right edge and line unmoved by a tap; the rest of the run as before.
