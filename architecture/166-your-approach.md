# 166 · The class-review tag reads "your approach"

Route: `/student` in whole-class review.

## Files touched

| File | What it does |
|---|---|
| `app/student/screens/FrozenScreen.tsx` | The tag in the tagged example's corner reads "your approach". |
| `components/ExampleColumns.tsx`, `lib/frozen.ts` | Doc comments quote the new wording. |

## How it connects

```
 frozenView().examples[i].mine ──► FrozenScreen corner ──► ExampleColumns column header
                                    ┌ B      [your approach] ┐   (was "your initial response", ticket 161)
                                    │ line                   │
```

## Verified by

vitest (454), eslint, tsc, `next build`; `review166.mjs` (ticket 161's run with the new wording): one light blue "your approach" tag on B at Q2 and Q7, on one line, first boxes level across the columns, every other check unchanged.
