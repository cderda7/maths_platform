# 149 · One flash, not three

Route: `/teacher/whole-class`.

## Files touched

| File | What it does |
|---|---|
| `app/globals.css` | `.choose-flash` animation iteration count 3 → 1. |
| `app/teacher/whole-class/WholeClassSetup.tsx` | Comment only. |

## How it connects

```
 press faded [Project] → setNudge(n + 1) → option buttons remount (key `${m}:${nudge}`)
   → .choose-flash: paper → standout-soft → paper, 600 ms, ONCE          (ticket 147 otherwise unchanged)
```

## Verified by

vitest (423), eslint, tsc, `next build`; the ticket 147 click-through (`setup147.mjs`): the fill reaches the standout-soft blue on the press, is back on paper afterwards, flashes again on a second press, and clears on choosing.
