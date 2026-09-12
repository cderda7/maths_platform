# 132 · The mistake view's diagnostic opens as a flyout

Route: `/teacher/mistakes`.

## Files touched

| File | What it does |
|---|---|
| `app/teacher/DiagnosticPush.tsx` | Collapsible mode: the chip in flow (closed) or its invisible footprint (open) keeps the row's layout; the card is `absolute` from the chip's corner (`CHIP_TOP − FRAME`, `−FRAME`), `z-40` on the wrapper; `clampToViewport` shifts an overrunning flyout left on the node. |
| `app/teacher/mistakes/TeacherMistakes.tsx` | Comment only. |

## How it connects

```
 row (flex, items-start, gap-4)
 ┌────────────────────────────────────────────────┐ ┌──────────────────────────────┐
 │ Card  Q3 · students · slips   flex-1 min-w-0   │ │ DiagnosticPush  shrink-0     │
 │ (never resizes)                                │ │  relative · z-40 when open   │
 └────────────────────────────────────────────────┘ │  ┌ pt-22 ───────────────────┐│
                                                    │  │ chip  ▸  or  footprint    ││  ← in flow, row height fixed
                                                    │  └───────────────────────────┘│
                                                    │  absolute top −3 left −25     │
                                                    │  ┌ Card w-380 p-6 ───────────┼┼──────┐
                                                    │  │ chip ▾      switch        │       │  ← the card's chip lands on the footprint
                                                    │  │ example | make your own   │       │
                                                    │  │ …                         │       │  runs down over the next row,
                                                    │  │ send to class             │       │  right into the blank margin
                                                    │  └───────────────────────────┴───────┘
                                                    └──────────────────────────────┘
 clampToViewport(el): rect.right + 16·scale > clientWidth  →  el.style.transform = translateX(−over/scale)
                     (scale = rect.width / offsetWidth, the chrome's 0.8 zoom)
```

## Verified by

vitest (395), eslint, tsc, `next build`; the ticket 127 click-through (`mistakes.mjs`) extended: at 1800 px the chip, the card and every row measure identical before and after opening, the flyout lies from the chip's corner within the viewport with no horizontal overflow, the card's chip on the footprint; at 1280 px the flyout shifts left to fit, the footprint and card stay, the chip moves with its card and the switch stays clear; all of ticket 127's push, ownership, badge, student and class view checks still pass.
