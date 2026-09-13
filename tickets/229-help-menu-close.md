# 229: The "I'd like a…" menu has a close ×

**What to build:** A small × in the top-right corner of the practice pad's help menu ("I'd like a…"), so a student has a visible way out besides clicking the scrim or pressing Escape.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), with a screenshot of the help menu: "add a small little X to the top right corner of the 'i'd like a...' box to give student another option to exit out." The menu closed only on a click outside the card or Escape, neither of which a student can see.

## Solution

- `components/PracticePad.tsx`: `HelpMenu`'s card is `relative` and holds a `<button aria-label="Close" data-help-close>` with a `×`, absolutely placed `right-3 top-3`, 32 px round, muted ink with a cream-deep ground on hover (the same look as a question tile's × on Create). It calls the menu's existing `onClose`, so it does exactly what a scrim click does. The card's size, the heading and the pills do not move.

## Acceptance

- [x] At 1440 × 900 and 1280 × 800: one × labelled Close, inside the card's top-right corner, clear of the heading text and the first pill; hover paints a ground; a real mouse click closes the menu; reopening and picking chat still works; no horizontal scroll (`close229.mjs`, 14 checks)
- [x] vitest 654, eslint, tsc, next build
