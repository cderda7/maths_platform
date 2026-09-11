# 105 · "Talk it through" is centred in the hint card

Route: `/student?stage=practice` (any warm-up, once a hint is showing), the practice overlay.

## Files touched

| File | What it does |
|---|---|
| `components/HintCard.tsx` | The "Talk it through" pill sits in a `mt-3 flex justify-center` row under the hint text; the pill's own classes, `data-talk-hint` and `onTalk` are unchanged. |

## How it connects

```
 HintCard (latest)
 ┌──────────────────────────────┐
 │ HINT 2  your line 1          │
 │ To combine the [x terms] …   │  ◀ hintSegments, the lit words (ticket 83)
 │                              │
 │       ( Talk it through )    │  ◀ flex justify-center → onTalk → PracticePad.talkHint (ticket 99)
 └──────────────────────────────┘
```

Nothing else moved: the stall notice (ticket 101) and the help menu are untouched.

## Verified by

vitest (339), eslint, tsc, `next build`; a headless measurement (`centre.mjs`) of the pill's centre against the card's centre on hint 1 and, after one written line, on hint 2 (0px off on both), with a clip of the column.
