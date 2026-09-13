# 201: Once a stage is picked, only its arrow stays

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/assignments/PathwayMap.tsx` | The review pathway map on the create screen; its `Arrows` SVG drops the arrows to unpicked options once a column has a pick. |
| `tickets/201-pathway-arrows-picked-only.md` | The ticket. |

## How it connects

```
 PathwayStep ─► PathwayMap(value) ─► mapColumns(value)  (lib/pathway.ts, ticket 197)
                    │
                    ├─► Node per option     picked: ink   unpicked after a pick: faded, still tappable
                    │
                    └─► Arrows(from, options, picked)
                          picked === undefined  ─► one muted curve per option
                          picked set            ─► one ink curve, from ─► picked row; the rest not drawn

   before a pick                         after picking group review
   ┌─────────────┐    ┌───────────┐       ┌─────────────┐    ┌ ─ ─ ─ ─ ─ ┐
   │ indiv work  │─┬─►│ indiv rev │       │ indiv work  │─╮    indiv rev
   └─────────────┘ │  ├───────────┤       └─────────────┘ │  ┌───────────┐
                   ├─►│ group rev │                       ╰─►│ group rev │
                   │  ├───────────┤                          └───────────┘
                   └─►│ class rev │                          ┌ ─ ─ ─ ─ ─ ┐
                      └───────────┘                            class rev
```
