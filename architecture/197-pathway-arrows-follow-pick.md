# 197: The pathway map's arrows leave the stage actually picked

## Files touched

| File | What it does |
| --- | --- |
| `lib/pathway.ts` | Pathway rules; `mapColumns` gives the creation map's columns and the row each column's arrows leave from. |
| `lib/pathway.test.ts` | Tests the rules, including `mapColumns`. |
| `app/teacher/assignments/PathwayMap.tsx` | The review pathway map on the create screen: fixed-height nodes, and an `Arrows` SVG per column curving from the picked node to each option. |
| `tickets/197-pathway-arrows-follow-pick.md` | The ticket. |

## How it connects

```
 /teacher/assignments/create/review ─► PathwayStep ─► PathwayMap(value = review.pathway)
                                                          │
                     lib/pathway.ts                       │
                       successors(prefix) ─► mapColumns ──┘  [{ options, from }, ...]
                                                          │
                                                          ▼
   ┌──────────────────┐   Arrows(from=0)   ┌──────────────────┐   Arrows(from=1)   ┌──────────────┐
   │ individual       │──────────────────► │ individual review│                ┌─► │ class review │
   │ working (row 0)  │╲                   ├──────────────────┤               ╱    └──────────────┘
   └──────────────────┘ ╲───────────────► │ group review ●   │──────────────╯
                          ╲                ├──────────────────┤
                           ╲─────────────► │ class review     │
                                           └──────────────────┘
   every node 42 px, rows 12 px apart: an arrow's ends are rowMid(from) and rowMid(row), no measuring
```
