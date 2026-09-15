# 341: Holistic Assessment tiles: strengths first

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/students/HolisticTiles.tsx` | `Tile` renders `[data-tile-strengths]` first inside the bordered block, then `[data-tile-signatures]` and each `[data-tile-patterns]`. Markup unchanged otherwise. |
| `tickets/341-…`, `ARCHITECTURE.md` | Docs. |

## How it connects

```
 lib/holisticTiles.ts holisticTiles({ classroom, session, now })
   { summary, strengths, signatures, patterns }          (unchanged)
                         │
                         ▼
 app/teacher/students/HolisticTiles.tsx  Tile
 ┌───────────────────────────────────────┐
 │ (SO) Sam Okonkwo                    → │
 │ Minus signs wrong on four sets: …     │ ◀─ summary
 │ ───────────────────────────────────── │
 │ STRENGTHS                             │ ◀─ strengths       [data-tile-strengths]
 │ (Functions) (Communication)           │
 │ ACROSS SETS                           │ ◀─ signatures      [data-tile-signatures]
 │ (Minus signs wrong · 4 sets)          │
 │ NEW SKILLS                            │ ◀─ patterns        [data-tile-patterns]
 │ (the conjugate's sign wrong · 1 set)  │
 └───────────────────────────────────────┘
```
