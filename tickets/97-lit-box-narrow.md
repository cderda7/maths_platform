# 97: The lit hint box is no wider than its fragment; 7x keeps its typeset spacing

**What to build:** The problem's spacing is exactly as KaTeX sets it, with nothing between the 7 and the x of 7x, and the lit box is only as wide as the fragment it marks, so it never reaches the glyph next to it. Air stays above and below.

**Blocked by:** 96 (which it reverses).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), on ticket 96's thin space between the 7 and the x: "no i don't like that it's too big of a gap; problematic for idea that 7x is 'one term'. fix. i'd rather see you go back to the og 7x spacing & just make the blue box not as wide".

Ticket 96 kept the box's side padding and made room for it with a thin space in the TeX. The space split the term the hint is about.

## Solution

- `lib/hint.ts`: the thin space and the flush-glyph checks are gone; `wrap` writes only the abutting-fragments gap (`ABUT`, `\kern0.7em`) as before ticket 96, and `conjure` inserts the 1 with nothing after it.
- `app/globals.css`: `.hint-term` padding `0.2em 0` with the matching negative margin: air above and below, none at the sides, so the box's edge is the fragment's own edge.
- `lib/hint.test.ts`: back to the pre-96 expectations (no `\,` anywhere).

## Acceptance

- [x] Monic warm-up, "middle coefficient" hovered: the box's right edge is the x's cell edge (0px), the x's ink outside it; the spacing of `x^2 + 7x + 12 = 0` is the plain typeset spacing at rest and lit
- [x] "constant", the non-monic 3, the 10 inside 10x and the whole 10x: each box the width of its fragment, neighbours clear
- [x] vitest (337), eslint, tsc, `next build`, headless browser check; architecture note, root docs, decision log, future features
