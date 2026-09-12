# 162 · Group review reads the board live, in a column beside it

Route: `/student` (stage `group`; the demo strip's "group review").

## Files touched

| File | What it does |
|---|---|
| `app/student/screens/GroupBoardScreen.tsx` | The board card on the left two thirds, a `data-read-as` column on the right third: `ReadAs` over the run's shared lines (live for every member), the wrong-check block above it, the empty line naming the writer. |

## How it connects

```
 classroom.group (lib/classroom.ts)             GroupBoardScreen
   strokes ──────────────────────────────▶ ┌──────────────────────────────┬──────────────────┐
   lines   ── revealed[] ─┐                │ [data-board]   2fr           │ [data-read-as] 1fr│
   attempts               │                │  YOUR WORKING  Undo  Clear   │  (wrong check)   │
                          │                │  ┌────────────────────────┐  │  NOT YET · red   │
   pen-holder's burst     │                │  │ DrawPad  (mirror for   │  │  line · "2 more" │
   onBurstEnd ──▶ nextLine(script,         │  │  the other three)      │  │                  │
     revealed, strokeCount)                │  │                        │  │  READ AS         │
     ──▶ group/line ──▶ lines + 1 ─────────┼──┼──────────────────────▶ │  │  ┌────────────┐  │
   peer's scripted turn (StudentApp)       │  │                        │  │  │ line 1     │  │
     group/line ──────────────────────────▶│  │                        │  │  │ x=2 │ x=3  │  │
   group/check ✗ ──▶ attempts + wrong,     │  └────────────────────────┘  │  └────────────┘  │
     lines = []  ──▶ block at the top,     └──────────────────────────────┴──────────────────┘
     live list empty again                                                   Check (holder only)
   group/check ✓ ──▶ resolved ──▶ GroupDebrief
```

The column's top padding is 25 px (the pad's 24 plus the card's 1 px border), so "YOUR WORKING" and "READ AS" sit on one line.

## Verified by

vitest (453), eslint, tsc, `next build`; `group162.mjs` (27 checks): Q1 geometry (board = 2 × column, both the row's height, a 20 px gap, eyebrows level), the empty copy, Check off then on, one line per burst including the two-box case line, Undo, the correct check's debrief; Q7 fast-forwarded to Liam's turn: the watcher's empty copy, the three lines arriving one by one, the wrong check in the column with the red line and "2 more lines" while the live list empties, the second attempt reading in beneath it, the debrief.
