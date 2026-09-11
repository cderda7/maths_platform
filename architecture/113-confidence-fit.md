# 113 · The confidence list fits the window with factorising open

Route: `/student?stage=confidence`, the whole screen.

## Files touched

| File | What it does |
|---|---|
| `app/student/screens/ConfidenceScreen.tsx` | Spacing classes only: page inset `py-6` (was 9), heading `mt-2` (3), list `mt-5` (7), answer rows `py-3` (4), skill rows `py-2` (2.5), kind rows `py-1` (1.5), Submit area `pt-4` (6). |

## How it connects

```
 ConfidenceScreen (h-full flex column, 820pt tall stage)
 ┌────────────────────────────────────────┐  py-6
 │ BEFORE YOU START                       │
 │ How confident are you?                 │  mt-2
 │                                        │  mt-5
 │ ( ) confident                          │  py-3
 │ ( ) not confident                      │  py-3
 │ (•) not confident with…                │  py-3
 │   ☐ null factor law                    │  py-2   ×7 rows
 │   ☑ factorising                        │
 │       ☐ monic   ☐ non-monic            │  py-1   ×2, only while the row is on (ticket 112)
 │   ☐ fractions …                        │
 │                              [data-answers]: overflow-y-auto, min-h-0
 │                                        │  mt-auto, pt-4
 │                              ( Submit )│
 └────────────────────────────────────────┘
```

The list is still a scroll box, so a set with more skills or a smaller window degrades to scrolling as before; at the iPad size the open list has 40px to spare above Submit. The offer callout (ticket 48) still floats over the list from the Submit area.

## Verified by

vitest (347), eslint, `next build`; a headless measurement (`fit.mjs`) of the list's scroll height against its box, closed and with factorising open (both 0 over; before: 10 and 80), and of Submit's position in both states (unchanged), with a screenshot of the open state.
