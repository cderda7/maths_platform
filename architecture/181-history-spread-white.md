# 181 · The history's five pills spread evenly under a white sheet that stops at New skills

Route: `/teacher` (the roster, history mode).

## Files touched

| File | What it does |
|---|---|
| `components/Tag.tsx` | `StatusDot` takes `label`: the same span, same `h-[13px]` and border, gains `PILL_LABEL` (inline-grid, min 56 px, grows to the text, 9 px semibold uppercase, white or muted on a hollow pill, width transition) and `data-label`. The plain pill is untouched. |
| `app/teacher/TeacherLive.tsx` | A category cell renders one `StatusDot` with `label` in history mode (no `HistoryPill` any more). `HistoryBlocker` takes `stacks` and draws the white sheet (`bg-paper`, first head's left → last head's right, 2 px above the pills → the cut) and, over it, one absolute column per open category at the named pill's measured left and width, from the sheet's top to today's pill, `justify-evenly`, five labelled `StatusDot`s. |

## How it connects

```
 /teacher · Tomas in history mode, Algebra and Graphing open              TeacherLive.tsx
 ┌ Jordan  (faded)  [▄▄] [▄▄] [▄▄] …                                     ┐  ← cut: the sheet's top on Jordan's pill midline
 │ ┌ white sheet (HistoryBlocker, bg-paper, z-25) ─────────────────────┐ │     Algebra head's left → New skills head's right
 │ │      AUG 31              AUG 31                                    │ │  ┐
 │ │                                                                    │ │  │ stack: absolute column at the named
 │ │      SEP 2               SEP 2                                     │ │  │ pill's left/width, top = sheet top,
 │ │ Amelia (hidden)                                                    │ │  │ bottom = today's pill top,
 │ │      SEP 3               SEP 3         (Confidence · Set clear) →  │ low  │ flex-col justify-evenly (z-30)
 │ │                                                                    │ │  │ five StatusDot label={date}
 │ │      SEP 7               SEP 7                                     │ │  │
 │ │                                                                    │ │  │
 │ │      SEP 9               SEP 9                                     │ │  ┘
 │ └────────────────────────────────────────────────────────────────────┘ │  ← 2 px above the pills
 │ TR Tomas   [ALGEBRA] [FUNCTIONS] [GRAPHING] [COMMUNICATION] …   low: 7/10│  ← StatusDot label={name}: the same
 └─────────────────────────────────────────────────────────────────────────┘     element as a plain pill, 13 px

 StatusDot({ status, shape: "pill", label })   components/Tag.tsx
   label undefined → the 28 × 13 pill as ever
   label set       → + PILL_LABEL (w-auto, min-w-[56px], px-1, 9 px uppercase white) + data-label
 HistoryBlocker({ student, stacks: [{ category, points }], … })
   measure(): heads, the row's `[data-dot] > [data-status]` pills (left, width, top), the rows' pill midlines, the due line
   sheet: { left, top: cut, width: last head right − first head left, height: pillTop − 2 − cut }
   stack per category: { left: pill.left, width: pill.width, top: cut, height: pillTop − cut }
```

Was (tickets 175, 177): `HistoryPill`, its own span inside the cell with the five 2 px apart directly above it; a cream-deep sheet through Set with an apron, its bottom at the row top.

## Verified by

vitest (500), eslint, tsc, `next build`, `check:laptop` against this build (16); `history181.mjs` (session `d86e608c-…`'s scratchpad, app on 3363 / CDP 9665, 158 checks at 1400 × 1000 and 1280 × 800: ticket 177's run with the new geometry): the named pill the same `SPAN[data-shape=pill]` as a plain one, every pill 13 px; the five pills the named pill's width and left, 13 px, spread evenly (equal gaps, sheet top to today's pill, ≥ 2 px); the sheet white, from Algebra's head to New skills', the Confidence column clear, ending 2 px above the pills (also after the drill under it closes); the cut on Jordan's midline with ≥ 6 px above the least room; rows 1 and 2 to the "due" line's midline; the drill beside history, the exits, the scrolled heads, no row moved, no overflow. Screenshots (Tomas with two histories, Sam) read by eye.
