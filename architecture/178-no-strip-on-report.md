# 178 · No pathway strip on the student's report

Route: `/student` at the `report`, `peers` and `history` stages (the header is the frame's fixed top row on every stage).

## Files touched

| File | What it does |
|---|---|
| `app/student/StudentApp.tsx` | `afterPathway` is true at the `report`, `peers` and `history` stages; `stages` is `[]` then and `pathwayStages(classroom, session, now)` otherwise. `StudentChrome` renders no strip for an empty list (its `stages.length > 0` guard from ticket 151), so nothing in the chrome changed. |

## How it connects

```
 StudentApp (app/student/StudentApp.tsx)
   session.stage ──▶ afterPathway?  ──┬── report · peers · history ──▶ stages = []                     ◀── ticket 178
                                      └── every other stage        ──▶ pathwayStages(classroom, session, now)   (ticket 151)
                                                    │
                                                    ▼
 StudentChrome header (h-14)
 ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ <Brand/>  ROOTS OF A QUADRATIC — SET 3        [indiv working] → [indiv review] → [group review] → …   Sam Okonkwo SO │   working … class review
 │ <Brand/>  ROOTS OF A QUADRATIC — SET 3                                    (blank)                    Sam Okonkwo SO │   report · peers · history
 └───────────────────────────────────────────────────────────────────────────────────────────────────────┘
   the right group is `flex items-center gap-6`: with no strip its only child is the name + avatar, at the same right edge
```

Was: the strip on every stage, so the report's header still named the class's stage after the pathway was over.

## Verified by

vitest (479), eslint, tsc, `next build`; `strip178.mjs` (session `9914f2b2-…`'s scratchpad, app on 3378 / CDP 9678), 34 checks at 1400 × 1000 and 1280 × 800: the report has no strip and the name and avatar sit at the working screen's right edge and centre line; "Your working →" and the peers view have none, and the report has none again on the way back; the working, class-wait, group-review and class-review skips still show four pills with the current one ringed; no header overflow. Screenshot `178-report.png` read by eye.
