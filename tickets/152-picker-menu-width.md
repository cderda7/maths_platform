# 152: The example picker's menu stays inside its slot

**What to build:** On the class review setup, the menu that opens from an example slot's header is as wide as the slot and no wider, so in column C it no longer runs past the card's edge, where the card clipped its counts. Long option names wrap onto a second line with the badges inline; the count stays on the right.

**Blocked by:** 148.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a screenshot of Q2's column C open: "you start to block the bubble in C. resolve please. i think you can just make the bubble not so wide, so that it stays in the A B C box in all instances". Ticket 148 gave the menu a fixed 440 px; the card is `overflow-hidden`, so column C's menu was cut off at the card's edge and its counts were hidden.

## Solution

- `app/teacher/whole-class/ExamplePicker.tsx`: the menu is `left-5 right-5` inside the slot (no fixed width); options are `items-start` with the name wrapping (`leading-snug`), the badges inline after the name, the dot aligned to the first line, the count `shrink-0` on the right.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] At 1400 and 1280 px, on every ticked problem and every column A / B / C, the open menu's rect lies inside its slot and its card
- [x] Every option's count is visible and unclipped; no option is clipped horizontally; the option badged "fixed in group review" reads whole with its count
- [x] vitest (427), eslint, tsc, `next build`, headless sweep (`menuwidth.mjs`)
