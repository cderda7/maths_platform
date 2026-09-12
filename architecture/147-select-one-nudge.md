# 147 · Pressing the faded Project says "select one" and flashes the options

Route: `/teacher/whole-class`.

## Files touched

| File | What it does |
|---|---|
| `app/teacher/whole-class/WholeClassSetup.tsx` | `nudge` press counter; Project faded (not disabled) without a mode, its press bumps the counter; label "select one"; option buttons keyed on the counter carry `choose-flash` while nudged. |
| `app/globals.css` | `@keyframes choose-flash` and `.choose-flash` (600 ms × 3, standout-soft fill and standout-line border); reduced motion holds the colour. |

## How it connects

```
 WholeClassSetup                     mode === null
   ( ) screens frozen  ─┐            press [Project] (faded, aria-disabled) ──▶ setNudge(n + 1)
   ( ) write with me   ─┘  key=`${m}:${nudge}`  → remount → .choose-flash runs again (3 beats)
   [ select one ]  ◀── label while !mode && nudge > 0
        │ click an option → setMode(m): flash class off, label "Project", opacity back, press → project()
        ▼
   wc/setup { …, mode } · wc/project · /teacher/board                (ticket 146 unchanged from here)
   ordered.length === 0 → Project truly disabled, no nudge
```

## Verified by

vitest (423), eslint, tsc, `next build`; a headless run (`setup147.mjs`): pressing the faded Project leaves the page where it is with the label "select one", both options flashing (background sampled mid-beat is the standout-soft blue, not paper); a second press restarts the flash; clicking "screens frozen" restores "Project" with no flash, and Project then opens the board.
