# 177 · The row buttons read "see history" and sit a pinch bigger and further apart

Route: `/teacher` (the roster).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherLive.tsx` | `ROW_BUTTON`: 11.5 px text, 2 px above and below (15.5 px a button); the stack's gap 3 px (52.5 px in all); the idle label "see history". Every roster row is 6.5 px taller than ticket 175 left it. `HISTORY_CLEAR_PX` (6): `HistoryBlocker` only cuts a pill whose midline is at least 6 px above the stacks' top, else the next pill up or the heads, since at 81.5 px rows the row above's midline lands exactly on the stacks' top and the half pill would touch the oldest date. |
| `README.md` | The button's name. |

## How it connects

```
 /teacher  TeacherLive.tsx  · one student row (the student column)
 ┌───────────────────────────────────────────────────────────────────┐
 │ (SO) Sam Okonkwo  · not started     ┌──────────────┐ 15.5         │
 │                                     │ see dot skills│              │  ROW_IDLE / ROW_ACTIVE
 │                                     ├──────────────┤ 3            │  w-[96px] px-1 py-[2px]
 │                                     │ student report│ 15.5         │  text-[11.5px] leading-none
 │                                     ├──────────────┤ 3            │
 │                                     │ see history   │ 15.5  = 52.5 │  ← "close history" in history mode
 │                                     └──────────────┘              │
 │  row: py-3.5 (14 + 14) + 52.5 + 1 border = 81.5                    │
 └───────────────────────────────────────────────────────────────────┘
 Was (ticket 175): 11 px, py-[1.5px], gap 2 → 14 × 3 + 4 = 46, rows 75.
 The header's stack (see skills / full breakdown over a column) is untouched: STACK_BUTTON, 21 px.
```

## Verified by

vitest (479), eslint, tsc, `next build`, `check:laptop` against this build (16); `buttons177.mjs` (session `d86e608c-…`'s scratchpad, app on 3362 / CDP 9663, 156 checks at 1400 × 1000 and 1280 × 800: ticket 175's run with the new labels and sizes and the clearance): three 96 × 15.5 buttons in a 52.5 px stack, rows 81.5 (Mia 84.5) unchanged between rest, history mode and two open histories, the labels, at least 6 px of cream above Tomas's stacks (the cut through Jordan's pill, Amelia's row covered whole), row 2 to the "due" line, row 3 through row 1's pill, and every ticket 175 check (the drill beside history, the exits, the scrolled heads).
