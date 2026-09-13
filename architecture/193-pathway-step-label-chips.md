# 193: The create screen's pathway step labels are accent chips

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/assignments/UnitFocus.tsx` | The unit focus card on the pathway step; its label is the accent chip. |
| `app/teacher/assignments/create/review/PathwayStep.tsx` | The pathway step: unit focus, review pathway map, Confirm groups; the last two labels are the accent chip. |
| `tickets/193-pathway-step-label-chips.md` | The ticket. |

## How it connects

```
 app/teacher/DiagnosticCard.tsx
   DIAGNOSTIC_CHIP ──────────┬──────────────► DiagnosticCard   (Class View: LIVE DIAGNOSTIC)
   (accent chip classes)     ├──────────────► DiagnosticPush   (Mistakes tab)
                             │
                             ├──────────────► UnitFocus        [UNIT FOCUS]
                             └──────────────► PathwayStep      [REVIEW PATHWAY] [CONFIRM GROUPS]

 /teacher/assignments/create/review ─► PathwayStep ─┬─► UnitFocus
                                                    ├─► PathwayMap
                                                    └─► SeatingBoard (Confirm groups)
```
