# 339: Maths is upright everywhere

## Files touched

| File | What it does |
| --- | --- |
| `app/globals.css` | `.katex .mathnormal, .katex .mathit` take KaTeX_Main, `font-style: normal`: every typeset letter upright, on every surface. Was scoped to `.upright-maths` (ticket 315). |
| `app/teacher/StageSplit.tsx` | Drops the `upright-maths` class; the split reads the global rule like every other screen. |

## How it connects

```
 data/*.ts  TeX strings (unchanged)
      │
      ▼
 components/Math.tsx ─ katex.renderToString ─▶ <span class="mord mathnormal">x</span>
      │                                                   │
      │    used by every surface                          │  styled by
      ▼                                                   ▼
 ┌──────────────┬───────────────────┬────────────┐   app/globals.css ◄339
 │ Sam's iPad   │ teacher laptop    │ board      │     .katex .mathnormal,
 │ working, pad │ Mistakes, split,  │ examples,  │     .katex .mathit
 │ hints, report│ reports, compare  │ group board│       font-family: KaTeX_Main
 └──────────────┴───────────────────┴────────────┘       font-style: normal
                        │                                 (was .upright-maths …,
                        ▼                                  ticket 315 only)
             app/teacher/StageSplit.tsx ◄339
               class "upright-maths" removed
                        │
                        ▼
 lib/hint.ts + .hint-term boxes measure the maths as set, so they fit the upright
 letters with no change (sweep:hint-boxes)
```
