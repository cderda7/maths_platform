# 283: Holistic grid gutter and chip room

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/students/HolisticPage.tsx` | `GUTTER` (16 px) empty last `col`, `th` and `td` per row; `SIDE_COL` 500 (was 540), `SET_COL` 256 (was 272), so category columns are 129.5 px. |
| `tickets/283-holistic-grid-gutter.md` | The ticket. |

## How it connects

```
 HolisticPage.tsx  Body
 ┌──────────────────────────────────────────────────┬──40──┬──── SIDE_COL 500 ◄283 ────┐
 │ Grid card                                         │      │ Patterns (FitHeight)       │
 │ ┌─24─┬─SET_COL 256◄283─┬─129.5─┬ … ┬─129.5─┬GUTTER 16◄283┐  or SkillWork             │
 │ │    │ PS6 Thu 10 Sep  │[ALGEBRA]  │[COMMUNICATION]126│    │                         │
 │ │    │ Roots of …      │ solid │ … │ secure│  ─8─ ─16─ │ = 24 px, as on the left     │
 │ └────┴─────────────────┴───────┴───┴───────┴───────────┘   │                         │
 └──────────────────────────────────────────────────┴──────┴───────────────────────────┘
```
