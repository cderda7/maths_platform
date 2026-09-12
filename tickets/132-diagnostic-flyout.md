# 132: The mistake view's diagnostic opens as a flyout, not beside the card

**What to build:** On the mistake view the "Live diagnostic" panel opens where its chip is, down and to the right over the blank space beside the problems, instead of taking a column from the row and narrowing the problem card. The chip, the card and every row measure the same before and after opening. On a window too narrow for the flyout it shifts left just enough to stay on screen.

**Blocked by:** 127.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), on ticket 127's build: "have it open like where it is. don't push the mistake view left — open down & to the right, taking up the blank space next to it instead of changing the whole mistakes view." Ticket 127 made the panel a flex sibling of the card, so opening it shrank the card by 380 px and reflowed the students' grid.

## Solution

- `app/teacher/DiagnosticPush.tsx` (collapsible only): closed, the chip sits in flow, centred on the problem header as before. Open, an invisible footprint of the chip holds that place, and the card is `absolute` from the chip's corner (25 px up and left: the card's border plus padding), so its own chip lands exactly where the in-flow one was and the flyout runs down and to the right. The open panel's wrapper is `z-40`, above the chips of the rows beneath. `clampToViewport`, a ref callback, measures the flyout after mount and shifts it left by any overrun of the window's right edge (16 px margin), scaled back through the teacher chrome's 0.8 zoom; the chip then moves with its card and the switch stays clear of it. Set on the node, not in state.
- `app/teacher/mistakes/TeacherMistakes.tsx`: comment only; the row is unchanged (the card `flex-1 min-w-0`, the chip `shrink-0`).
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] At 1800 px: opening Q3 leaves the chip's rect, the card's rect and every row's top and height byte-identical; the flyout is 380 CSS px wide from the chip's corner, fits the viewport, no horizontal overflow; the card's chip sits on the footprint
- [x] At 1280 px: the flyout shifts left to fit (no horizontal overflow), the footprint and the card stay put, the chip moves with its card and the switch is clear of it
- [x] Everything from ticket 127 still holds (pushes, ownership, badge, student modal, class view)
- [x] vitest (395), eslint, tsc, `next build`, headless run (`mistakes.mjs`)
