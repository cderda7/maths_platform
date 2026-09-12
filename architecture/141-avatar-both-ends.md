# 141 · The roster's avatar at both ends of the row

Route: `/teacher` (the roster).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherLive.tsx` | The roster's student cell opens with the avatar again (`Avatar`, then the name slot and pill, then the hover buttons); the closing avatar's cell is `px-2`. Column widths are numbers: `columnWidth(c)` (80 / 88 / 96 / 132 by the chip's letters), `STUDENT_COL` 420, `CONFIDENCE_COL` 84, `SET_COL` 64, `AVATAR_COL` 48, summed by `rosterMinWidth(columns)` into the table's inline `minWidth`; each `<col>` takes its width as an inline style. The pill is `px-1.5 gap-1`. |

## How it connects

```
 <table data-grid style.minWidth = rosterMinWidth(columns) = 420 + Σ columnWidth + 84 + 64 + 48>
 ┌────────────────────────────────────────┬──────────────────────────────┬────────┬─────┬──────┐
 │ STUDENT 420                            │ 80 · 96 · 88 · 132 · 96 · 96 │ CONF 84│SET64│  48  │
 ├────────────────────────────────────────┼──────────────────────────────┼────────┼─────┼──────┤
 │ px-5 (SO) 12 ┌─ slot 142 ─┐┌ pill 82 ┐ │  dot   dot   dot   dot  …    │  low:  │ 3/10│ (SO) │
 │              │Sam Okonkwo ││●in prog │ │                              │        │     │      │
 │              └────────────┘└─────────┘ │                              │        │     │      │
 │   ▲ back (141)              12 [see dot skills] px-5                  │        │     │  ▲   │
 │                                [student report]                       │        │     │ 136  │
 └────────────────────────────────────────┴──────────────────────────────┴────────┴─────┴──────┘
   1280 × 800 laptop: the card is 1208, the roster 1204

 columnWidth(c) ◀── letters in categoryName(c).short (spaces out): ≤7 → 80, 8 → 88, ≤10 → 96, else 132
                    (chip ≈ 20 + 8 a letter; 2 px clear each side; 8 px steps)
```

Ticket 136 paid for the bigger name and the inline pill by moving the avatar; this ticket pays for the avatar's return by giving each category column only what its chip needs (22 px), and by 8 px off Confidence, 8 off the closing column and 6 off the pill.

## Verified by

vitest (423), eslint, tsc, `next build`, `npm run check:laptop`; `verify141.mjs` (port 3203 / CDP 9503) at 1280 and 1400: ticket 136's checks plus the leading avatar's place and both avatars' initials, with 2× crops of the closed roster, Sam's row hovered, Sam's row open and the Algebra column view.
