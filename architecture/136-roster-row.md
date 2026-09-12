# 136 · The class roster's row: a bigger name, the pill beside it, the avatar at the end

Route: `/teacher` (the roster).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherLive.tsx` | The roster's student cell: a 16 px name in a fixed 142 px slot (`data-student-name`), the live pill (`data-live-pill`) after it on the same line, the commentary line under both, the hover buttons (`data-row-actions`) `ml-auto`. A last column with the avatar (`data-row-avatar`) after Set; drill rows span `columns.length + 4`. `columnWidth(c)` sizes a category column to its chip (96, or 132 past ten letters); category header cells `px-0`, chips `whitespace-nowrap`; `min-w-[1204px]`. |

## How it connects

```
 <table data-grid min-w 1204>
 ┌───────────────────────────────┬──────────────────────────────┬────────┬─────┬────────┐
 │ STUDENT  380                  │ category × n  96 | 132       │ CONF 92│SET64│ (blank)│
 ├───────────────────────────────┼──────────────────────────────┼────────┼─────┼────────┤
 │ px-5 ┌─ slot 142 ─┐┌─ pill ─┐ │  dot   dot   dot   dot  …    │  low:  │ 3/10│  (SO)  │
 │      │Sam Okonkwo ││●in prog│ │                              │        │     │        │
 │      └────────────┘└────────┘ │                              │        │     │  ▲     │
 │        ▲ 16 px, nowrap        │                              │        │     │  │     │
 │        │ widest name + 10     │                              │        │     │ data-row-avatar
 │      commentary line (caution / sub / Report →)            [see dot skills]│     │
 │                                                            [student report]│     │
 │                                                              ml-auto, hover only    │
 └───────────────────────────────┴──────────────────────────────┴────────┴─────┴────────┘
   drill row: colSpan = n + 4 (all of it)

 columnWidth(c) ◀── categoryName(c).short.length > 10 ? 132 : 96
                    (the chip at 11 px uppercase, 0.06 em: "Communication" 126, the rest < 94)
```

The slot is the rule the user asked for: a second in-progress student's pill starts at the same x as Sam's because both names sit in a 142 px box, not because either is measured. The avatar left the front of the cell for the end of the row; that is what pays for the bigger name and the inline pill inside the 1280 px laptop's card (`scripts/laptop-check.mjs`).

## Verified by

vitest (403), eslint, tsc, `next build`, `npm run check:laptop`; `verify.mjs` (port 3203 / CDP 9503) at 1280 and 1400: 16 checks each (slot, pill x, cloned pill after the widest name, row height, avatar column, chip gaps, no scroll, hover buttons, open row and column view spans) with 2× crops of the closed roster, Sam's row hovered, Sam's row open and the Algebra column view.
