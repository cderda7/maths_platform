# 164 · No "Group review" crumb beside the wordmark; the pathway strip names the stage

Route: `/student` at the `class-wait` and `group` stages (the header is the frame's fixed top row on every stage).

## Files touched

| File | What it does |
|---|---|
| `app/student/StudentApp.tsx` | `CRUMB` is `Partial<Record<Stage, string \| null>>`: `class-wait` and `group` map to `null`, which is "no crumb"; only a stage the map leaves out falls back to the assignment title (working, feedback, waiting, frozen) or the class name (the rest). |
| `app/student/StudentChrome.tsx` | `crumb?: string \| null`; a falsy crumb renders nothing after `<Brand/>`, so the header's left group is the brand alone. |

## How it connects

```
 StudentApp (app/student/StudentApp.tsx)
   session.stage ──▶ CRUMB[stage] ──┬── string  ("Warm-up", "Your report", …)  ──▶ crumb
                                    ├── null    (class-wait, group)             ──▶ no crumb   ◀── ticket 164
                                    └── absent  ──▶ title (working · feedback · waiting · frozen) or ASSIGNMENT.className
   classroom + session + now ──▶ pathwayStages() ──▶ stages                                                  (ticket 151)
                                          │
                                          ▼
 StudentChrome header (h-14)
 ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ <Brand/>  [crumb?]                 [indiv working] → [indiv review] → [group review] → [class review]  Sam Okonkwo SO │
 │  left group: gap-5                  PathwayStrip (data-pathway-strip), the current stage ringed         name + avatar │
 └───────────────────────────────────────────────────────────────────────────────────────────────────────┘
   group review / class wait:  <Brand/> alone ── the strip's lit "group review" pill is the stage's one name
   every other stage:          <Brand/> then its crumb, as before
```

Was: `CRUMB` mapped both stages to `"Group review"`, so the header read the stage twice, once as a plain word beside the wordmark and once as the strip's ringed pill.

## Verified by

vitest (453), eslint, tsc, `next build`; `crumb164.mjs` (session `f476bff7-…`'s scratchpad, app on 3164 / CDP 9664), 11 checks: the overview shows the brand then the class-name crumb; after the "class wait" and "group review" skips the left group is the brand alone at the same coordinates, "Group review" is nowhere in it, and the strip's list still names group review; after the "working", "warm-up" and "report" skips the title, "Warm-up" and "Your report" crumbs are still there. Screenshots `164-class-wait.png` and `164-group-review.png` read by eye.
