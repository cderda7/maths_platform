# 160 · The hold that starts a drag is 150 ms

Routes: `/teacher/assignments/create`, `/teacher/assignments/create/review`, `/teacher/whole-class`.

## Files touched

| File | What it does |
|---|---|
| `lib/reorder.ts` | `HOLD_MS = 150` (was 300), the reasoning in its comment. |
| `lib/reorder.test.ts` | `HOLD_MS` pinned to the 120–200 ms band. |

## How it connects

```
 press on a tile / card
   │ 0 ms          pointerdown → press timer (HOLD_MS = 150)
   │ ≤ ~120 ms     release → a click (the tile edits; the pill rotates; the picker opens)
   │ move > 6 px   before the timer → not a drag (caret, selection, scroll)
   ▼ 150 ms        timer fires → lift (useReorder.begin) → drag as ticket 150
 One constant; every screen that reorders reads it through useReorder.
```

## Verified by

vitest, eslint, tsc, `next build`; the ticket 150 click-through (`reorder150.mjs`, 46 checks, twice) with every hold shortened to 200 ms and every click 80 ms: each hold lifts, each click edits and moves nothing, a press that moves first never lifts.
