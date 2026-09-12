# 168 · The assignment title is the crumb beside the wordmark on every student screen

Route: `/student` (every stage; the header is the frame's fixed top row).

## Files touched

| File | What it does |
|---|---|
| `app/student/StudentApp.tsx` | `crumb = title`, the assignment title from `useAssignment()`; the per-stage `CRUMB` map (ticket 164's `null` entries included) and the "title while working, else the class name" fallback are gone. |
| `app/student/StudentChrome.tsx` | `crumb?: string`; renders it after `<Brand/>` in the header's left group, unchanged in style (`text-[13px] text-ink-muted`). |

## How it connects

```
 classroom store ──▶ useAssignment() ──▶ title ("ROOTS OF A QUADRATIC — SET 3")
                                            │
                                            ▼  StudentApp: crumb = title  (every stage)            ◀── ticket 168
 StudentChrome header (h-14)
 ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ <Brand/>  ROOTS OF A QUADRATIC — SET 3      [indiv working] → [indiv review] → [group review] → [class review]  Sam Okonkwo SO │
 │  left group: gap-5, the same on every screen   PathwayStrip: the stage (ticket 151)                              name + avatar  │
 └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
   the screen below names itself:  "Your report" (h1) · Q1 x² − 5x + 6 = 0 (the board's problem) · "Warm-up" …
```

Was (tickets 56, 151, 164): a `CRUMB` map per stage ("Warm-up", "Your report", "Where the class is finding it hard", "Your working"), `null` for the group review and class wait, the title only while working, reviewing, waiting and frozen, the class name otherwise.

## Verified by

vitest (454), eslint, tsc, `next build`; `crumb168.mjs` (session `f476bff7-…`'s scratchpad, app on 3168 / CDP 9668), 29 checks: on the overview and after each of the eight skips the left group is the brand then the title, the brand and the crumb at the same coordinates every time, the crumb's right edge more than 24 px clear of the strip; the peers and history deep links show the title too. Screenshots `168-group-review.png`, `168-class-review.png`, `168-report.png` read by eye.
