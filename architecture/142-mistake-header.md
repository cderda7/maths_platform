# 142 · The mistake view's header row, the flyout's gap, and the teacher chrome at 0.72

Routes: `/teacher/mistakes`; the zoom on every `/teacher/*` route; the tag wherever `DifficultyTag` renders.

## Files touched

| File | What it does |
|---|---|
| `app/teacher/mistakes/TeacherMistakes.tsx` | The right box (`data-right`) is the row's first child in a wrapper `PROBLEM_HEADER + 2` tall, centred, so it is level with the header row; the header's left group is label · maths · `DifficultyTag` · hover button; no live pill on a name; the diagnostic gets `ml-5`. |
| `app/teacher/DiagnosticPush.tsx` | `PROBLEM_HEADER = 69` exported; `CHIP_TOP` derived; the action row is `flex justify-end` so "send to class" sits bottom right. |
| `app/teacher/TeacherChrome.tsx` | `[zoom:0.72]` (was 0.8). |
| `lib/split.ts` | Comment: the teacher pane's 1280 lays out at 1778. |
| `components/Tag.tsx` | "complex unfamiliar" in the amber of `developing` (soft, line, text). |

## How it connects

```
 row  (flex items-start gap-4)                                         ml-5 ┐
 ┌──────────────┐ ┌──────────────────────────────────────────────┐          ▼
 │ wrapper      │ │ Card (border 1)                              │   ┌─────────────────┐
 │ h = 69 + 2   │ │ ┌──────────────────────────────────────────┐ │   │ chip, top 23    │
 │  [15/20 right]│ │ │ header 69: Q1  x²−5x+6=0  (simple fam.) │ │   │ LIVE DIAGNOSTIC │
 │  (centred)   │ │ │            label · maths · tag · expand │ │   └─────────────────┘
 └──────────────┘ │ └──────────────────────────────────────────┘ │   open: flyout laid at
        gap 16    │ names (no live pill) · pills · working       │   left −25 from the chip
                  └──────────────────────────────────────────────┘   → 16 + 20 − 25 = 11 px
                                                                        clear of the card
 DiagnosticPush.PROBLEM_HEADER = 69 ─┬─► CHIP_TOP = 1 + (69 − 25) / 2 = 23   (chip level with the header)
                                     └─► TeacherMistakes wrapper height 71    (box level with the header)

 flyout Card (p-6) ─► tabs ─► question / options ─► actions: flex justify-end ─► [send to class] at bottom right
                                                            (waiting band flex-1: still full width)

 TeacherChrome [zoom:0.72]: every /teacher/* rect in window px = layout px × 0.72; a 1280 laptop lays out at 1778.
 Tag DIFF_STYLES: cream · blue · purple · amber (complex unfamiliar, was ink on white).
```

## Verified by

vitest, eslint, tsc, `next build`; headless click-through `mistakes142.mjs`: zoom 0.72 on the teacher root and the Q1 card measuring 0.72 × its layout width; at 1800 and 1280 px every problem's box is left of the card by one gap, centred on the 69 px header row, reading `n/20 right`; the difficulty tag starts one gap after the maths and lies in the card's left half; Q6's "complex unfamiliar" is `rgb(251,243,220)` under `rgb(183,121,31)`; no name carries "live" with or without Sam's session; the chip is level with the header and 36 layout px off the card; Q1's open flyout starts 6–10 window px right of the card, its chip exactly where the closed chip was, the card and row unchanged; "send to class" ends at the panel's inner right edge and bottom; Sam's compare footer once under his Q7 column. `scripts/laptop-check.mjs`: all sixteen route/size checks fit at the new zoom.
